/**
 * /api/journal
 * GET  ?page=1&limit=20&category=<slug>&published=true  → paginated list
 * GET  ?slug=<slug>|id=<id>&countView=true              → single journal entry
 * GET  ?action=html-file&slug=<slug>|id=<id>            → full HTML document for html posts
 * GET  ?action=third-party-status&provider=<id>          → third-party provider status aggregation
 * GET  ?action=status-monitor-config                      → status-page monitor mode config
 * GET  ?action=status                                   → FETCH LIVE STATUS & HISTORY
 * GET  ?action=klipy-search&q=<query>&limit=18          → search Klipy GIF/sticker media
 * GET  ?action=comments&journalId=X&page=1&sort=top     → paginated comments (top-level or replies)
 * GET  ?action=comment-count&journalIds=X,Y             → comment counts for multiple journals
 * GET  ?action=top-journals&limit=6                     → top N most-liked published journals
 * GET  ?action=blacklist                                → get blacklist words (auth required)
 * GET  ?action=feedback-list&page=1&limit=20             → feedback list (public)
 * GET  ?action=feedback-stats                             → feedback stats summary (public)
 * GET  ?action=feedback-pinned                            → pinned feedback for homepage (public)
 * POST ?action=like&id=<id>&session=<sessionId>         → like a journal once/session
 * POST ?action=status-monitor-config                    → update status-page monitor mode (auth required)
 * POST ?action=status                                   → CREATE LIVE STATUS (auth required)
 * POST ?action=comment                                  → add comment (Google token or owner cookie)
 * POST ?action=comment-like&id=<id>&session=<s>         → like a comment once/session
 * POST ?action=comment-pin                              → pin/unpin comment (auth required)
 * POST ?action=blacklist                                → add blacklist word (auth required)
 * POST ?action=feedback                                 → add feedback (Google token or owner cookie)
 * POST ?action=feedback-reaction                        → like/dislike feedback by session
 * POST ?action=feedback-pin                             → pin/unpin feedback (auth required)
 * POST                                                  → create journal (auth required)
 * PUT  ?action=comment                                  → edit own comment (Google token or owner cookie)
 * PUT  ?action=feedback-admin                           → owner edit any feedback
 * PUT                                                   → update journal (auth required); body must include _id
 * DELETE ?action=comment&id=<id>                        → delete comment (Google token or owner cookie)
 * DELETE ?action=blacklist&id=<id>                      → delete blacklist word (auth required)
 * DELETE ?action=feedback-admin&id=<id>                 → owner delete any feedback
 * DELETE ?id=<id>                                       → delete journal (auth required)
 */

const { MongoClient, ObjectId } = require('mongodb');
const crypto = require('crypto');
const he = require('he');
const fs = require('fs');
const path = require('path');
const dns = require('dns').promises;

let cachedClient = null;
let cachedSpaTemplate = null;
// Public/admin user lists should only include real commenter accounts; exclude owner and malformed empty IDs.
const PUBLIC_USER_FILTER = { userId: { $exists: true, $nin: ['', 'owner'] } };
const MIN_COMMUNITY_TEXT_LENGTH = 100;
const COMMUNITY_COOLDOWN_MS = 2 * 60 * 1000;
const communityCooldownByIp = new Map();
const SERVICE_KEY_REGEX = /^\d{16}$/;
const RENDER_BASE_URL = 'https://deepdey.vercel.app';
const RENDER_DEFAULT_IMAGE = '/assets/images/myphoto.png';
const FEATURE_LINKS_FILE = path.join(process.cwd(), 'src', 'features', 'feature-links.json');
let cachedRenderFeatureMeta = null;
let cachedRenderFeatureMetaMtime = 0;
const KLIPY_API_BASE = 'https://api.klipy.com';
const STATUS_MONITOR_CONFIG_ID = 'status_monitor_config';
const STATUS_MONITOR_MODES = ['live', 'stop', 'maintenance', 'hiatus'];
const RENDER_STATIC_PAGE_META = {
  '/': {
    title: 'Deep Dey | Software Architect & JEE 2027 Aspirant',
    description: 'Official portfolio of Deep Dey. Software Architect specializing in AI prompting, system thinking, and web development. Targeting IIT Kharagpur CSE Class of 2031.',
  },
  '/about': {
    title: 'Cinematic Biography & Methodology | Deep Dey',
    description: 'Born in Dharmanagar, Tripura. Scored 80%+ in Boards. Transitioned to CBSE at Golden Valley High School. Targeting IIT Kharagpur, IIT Kanpur, or IIT Gandhinagar (JEE 2027).',
  },
  '/contact': {
    title: 'Contact Engine | Deep Dey',
    description: 'Connect with Deep Dey for software architecture consultations, bug reports, and collaborations through a tracked lead pipeline.',
  },
  '/copyright': {
    title: 'Copyright & License | Deep Dey Infrastructure',
    description: 'Documentation of architectural ownership and restricted source code license.',
  },
  '/dashboard': {
    title: 'Dashboard | Deep Dey',
    description: 'Content management dashboard',
  },
  '/dmca': {
    title: 'DMCA Policy | Deep Dey Infrastructure',
    description: 'Official DMCA notice and takedown policy for Deep Dey digital assets.',
  },
  '/faq': {
    title: 'Frequently Asked Questions | Deep Dey',
    description: 'Find answers to common questions about Deep Dey\'s projects, his JEE Advanced 2027 goals, and his AI-assisted development methodology.',
  },
  '/feature': {
    title: 'Feature Atlas | Deep Dey',
    description: 'Dynamic feature pages with architecture, workflows, visualizations, risk notes, and detailed implementation summaries.',
  },
  '/feedback': {
    title: 'Feedback | Deep Dey',
    description: 'Share structured feedback for projects, platform quality, and collaboration experience.',
  },
  '/journal': {
    title: 'Build Journal | Deep Dey',
    description: 'Articles, build logs, and engineering notes from Deep Dey.',
  },
  '/journal/comment': {
    title: 'Community Guide | Deep Dey Journal',
    description: 'Learn how comments and feedback work on the website, with step-by-step instructions and live-style preview demos.',
  },
  '/legal': {
    title: 'Legal Hub | Deep Dey Infrastructure',
    description: 'Centralized compliance portal for all Deep Dey digital assets, software, and systems.',
  },
  '/links': {
    title: 'Links Hub | Deep Dey',
    description: 'All important Deep Dey links, socials, products, communities, and external platforms in one place.',
  },
  '/live': {
    title: 'Live Stream | Deep Dey',
    description: 'Watch Deep Dey\'s latest YouTube streams and live sessions — engineering talks, JEE sessions, and dev builds.',
  },
  '/me': {
    title: 'Persona & Vision | Beyond the Code',
    description: 'Explore the personal side of Deep Dey: Visual storytelling through photography, video editing, and the disciplined vision of a JEE Advanced 2027 aspirant.',
  },
  '/now': {
    title: 'Now / Roadmap / Changelog | Deep Dey',
    description: 'Current focus, roadmap, and change history.',
  },
  '/portfolio': {
    title: 'Portfolio Viewer | Deep Dey',
    description: 'Explore Deep Dey\'s portfolio document with the interactive PDF viewer and direct download access.',
  },
  '/privacy': {
    title: 'Privacy Policy | Deep Dey Infrastructure',
    description: 'Official Privacy Policy detailing data collection, Google sign-in identity handling, private service keys, and user profile controls.',
  },
  '/projects': {
    title: 'Project Ecosystem | Deep Dey',
    description: 'A list of architectural software projects built by Deep Dey, including qlynk.me, StudyBot, and more.',
  },
  '/proof': {
    title: 'Proof of Work | Deep Dey',
    description: 'Verified activity, releases, uptime, and achievement dashboard.',
  },
  '/search': {
    title: 'Search Engine | Deep Dey',
    description: 'Global search for Deep Dey\'s ecosystem',
  },
  '/status': {
    title: 'System Status | Deep Dey',
    description: 'Real-time status of all API endpoints, server health, database latency and connection quality for deepdey.vercel.app',
  },
  '/terms': {
    title: 'Terms of Service | Deep Dey Infrastructure',
    description: 'Official Terms of Service for Deep Dey digital assets including QuickLink, Transparent Clock, and the Journal platform.',
  },
  '/user': {
    title: 'Contributors | Deep Dey Journal',
    description: 'Contributors who have joined the conversation on Deep Dey\'s journal.',
  },
};
const RENDER_PROJECT_META = {
  'personal-portfolio': {
    title: 'Deep Dey | Digital Ecosystem | Project Detail',
    description: 'Advanced personal portfolio with a custom CMS and Live Status tracking.',
    image: '/assets/images/myphoto.png',
  },
  quicklink: {
    title: 'QuickLink | Project Detail',
    description: 'Enterprise-grade SaaS URL shortening and productivity platform.',
    image: '/69eb00ccd24c4d75c62cc04c.png',
  },
  'qlynk-node-server': {
    title: 'QLYNK Node Server | Project Detail',
    description: 'Highly secure private cloud storage and streaming datacenter.',
    image: '/69eb02bff3d3b01f6326a557.jpg',
  },
  studybot: {
    title: 'StudyBot | Project Detail',
    description: 'Focus & Productivity Discord Bot for student communities.',
    image: '/69eb01deef048160b7374d68.png',
  },
  'transparent-clock': {
    title: 'Transparent Clock | Project Detail',
    description: 'A highly customizable Windows desktop overlay for focus tracking.',
    image: '/69eb01798f30a15224010404.png',
  },
};

function readFeatureMetaForRender() {
  let fingerprint = 0;
  try {
    if (fs.existsSync(FEATURE_LINKS_FILE)) {
      fingerprint = fs.statSync(FEATURE_LINKS_FILE).mtimeMs;
    }
  } catch {
    fingerprint = 0;
  }
  if (cachedRenderFeatureMeta && fingerprint <= cachedRenderFeatureMetaMtime) {
    return cachedRenderFeatureMeta;
  }
  const map = new Map();
  try {
    if (fs.existsSync(FEATURE_LINKS_FILE)) {
      const raw = fs.readFileSync(FEATURE_LINKS_FILE, 'utf8');
      const parsed = JSON.parse(raw);
      const entries = Array.isArray(parsed) ? parsed : [];
      for (const entry of entries) {
        const link = String(entry?.link || '').trim();
        const title = String(entry?.title || '').trim();
        const summary = String(entry?.summary || '').trim();
        if (!link || !title || !link.startsWith('/feature/')) continue;
        map.set(link, {
          title: `${title} | Feature Detail`,
          description: summary || 'Detailed feature documentation page.',
          image: `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`,
          path: link,
          type: 'article',
        });
      }
    }
  } catch {
    // ignore malformed feature links file
  }
  cachedRenderFeatureMeta = map;
  cachedRenderFeatureMetaMtime = fingerprint;
  return map;
}

async function getDb() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI not set');
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db();
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try { return JSON.parse(req.body || '{}'); } catch { return {}; }
    }
    if (Buffer.isBuffer(req.body)) {
      try { return JSON.parse(req.body.toString('utf8') || '{}'); } catch { return {}; }
    }
    if (typeof req.body === 'object') return req.body;
  }
  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => { raw += chunk.toString('utf8'); });
    req.on('end', () => {
      try { resolve(JSON.parse(raw || '{}')); } catch { resolve({}); }
    });
    req.on('error', () => resolve({}));
  });
}

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  cookieHeader.split(';').forEach((part) => {
    const [k, ...v] = part.trim().split('=');
    if (k) cookies[k.trim()] = decodeURIComponent(v.join('='));
  });
  return cookies;
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers['cookie']);
  return cookies['dd_auth'] === 'authenticated';
}

function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function escapeRegexLiteral(s) {
  return String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function estimateReadMinutes(body) {
  const words = (body || '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 110));
}

function getClientIp(req) {
  return (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function nowIST() {
  return new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

function getParam(req, name) {
  try {
    const url = new URL(req.url, 'http://x');
    return url.searchParams.get(name);
  } catch {
    return (req.query && req.query[name]) || null;
  }
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return [];
  const unique = new Set();
  for (const img of images) {
    const value = String(img || '').trim();
    if (value) unique.add(value);
  }
  return Array.from(unique);
}

function getCooldownKey(ip, scope) {
  return `${scope}:${String(ip || 'unknown')}`;
}

function checkCommunityCooldown(ip, scope) {
  const now = Date.now();
  const key = getCooldownKey(ip, scope);
  const until = Number(communityCooldownByIp.get(key) || 0);
  if (until > now) {
    return { limited: true, retryAfterSec: Math.max(1, Math.ceil((until - now) / 1000)) };
  }
  return { limited: false, retryAfterSec: 0 };
}

function startCommunityCooldown(ip, scope) {
  const key = getCooldownKey(ip, scope);
  communityCooldownByIp.set(key, Date.now() + COMMUNITY_COOLDOWN_MS);
}

function verifyOwnerPassword(password) {
  const expectedPassword = process.env.SPACE_PASSWORD;
  return Boolean(password && expectedPassword && password === expectedPassword);
}

function readSpaTemplate() {
  if (!cachedSpaTemplate) {
    cachedSpaTemplate = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  }
  return cachedSpaTemplate;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function toAbsoluteRenderUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${RENDER_BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function sanitizeRenderSocialImage(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw, RENDER_BASE_URL);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    if (
      /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(parsed.pathname)
      || /^\/f\//.test(parsed.pathname)
      || parsed.hostname === 'static.qlynk.me'
      || parsed.hostname === 'deydeep-static-files.hf.space'
    ) {
      return parsed.toString();
    }
  } catch {
    return '';
  }
  return '';
}

function pickRandomRenderImage(images) {
  const validImages = Array.isArray(images) ? images.map((item) => sanitizeRenderSocialImage(item)).filter(Boolean) : [];
  if (!validImages.length) return `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`;
  return validImages[Math.floor(Math.random() * validImages.length)];
}

function replaceMetaTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function buildRenderedPageHtml(meta) {
  const fullUrl = `${RENDER_BASE_URL}${meta.path === '/' ? '' : meta.path}${meta.query || ''}`;
  const title = escapeHtml(String(meta.title || 'Deep Dey'));
  const titleAttr = escapeHtmlAttr(String(meta.title || 'Deep Dey'));
  const description = escapeHtmlAttr(String(meta.description || ''));
  const image = escapeHtmlAttr(String(meta.image || `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`));
  const canonical = escapeHtmlAttr(fullUrl);
  const ogType = escapeHtmlAttr(String(meta.type || 'website'));

  let html = readSpaTemplate();
  html = replaceMetaTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceMetaTag(html, /<meta\s+name="title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="title" content="${titleAttr}" />`);
  html = replaceMetaTag(html, /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  html = replaceMetaTag(html, /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceMetaTag(html, /<meta\s+property="og:type"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
  html = replaceMetaTag(html, /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceMetaTag(html, /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:title" content="${titleAttr}" />`);
  html = replaceMetaTag(html, /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceMetaTag(html, /<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
  html = replaceMetaTag(html, /<meta\s+(?:name|property)="twitter:card"\s+content="[\s\S]*?"\s*\/?>/i, '<meta name="twitter:card" content="summary_large_image" />');
  html = replaceMetaTag(html, /<meta\s+(?:name|property)="twitter:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:url" content="${canonical}" />`);
  html = replaceMetaTag(html, /<meta\s+(?:name|property)="twitter:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:title" content="${titleAttr}" />`);
  html = replaceMetaTag(html, /<meta\s+(?:name|property)="twitter:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  html = replaceMetaTag(html, /<meta\s+(?:name|property)="twitter:image"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);
  return html;
}

async function getRenderJournalMeta(db, ref) {
  const token = String(ref || '').trim();
  if (!token) return null;
  const journalsCol = db.collection('journals');
  const queries = [];
  if (ObjectId.isValid(token)) queries.push({ _id: new ObjectId(token), published: true });
  queries.push({ slug: token, published: true });
  for (const query of queries) {
    const journal = await journalsCol.findOne(query, { projection: { _id: 1, slug: 1, title: 1, summary: 1, images: 1 } });
    if (!journal) continue;
    return {
      title: `${journal.title} | Journal`,
      description: String(journal.summary || 'Journal post'),
      image: pickRandomRenderImage(journal.images),
      path: `/journal/view/${encodeURIComponent(journal.slug || journal._id.toString())}`,
      type: 'article',
    };
  }
  return null;
}

async function getRenderJournalCommentsMeta(db, ref) {
  const token = String(ref || '').trim();
  if (!token) return null;
  const journalsCol = db.collection('journals');
  const queries = [];
  if (ObjectId.isValid(token)) queries.push({ _id: new ObjectId(token), published: true });
  queries.push({ slug: token, published: true });
  for (const query of queries) {
    const journal = await journalsCol.findOne(query, { projection: { _id: 1, slug: 1, title: 1, summary: 1, images: 1 } });
    if (!journal) continue;
    const routeKey = encodeURIComponent(journal.slug || journal._id.toString());
    return {
      title: `Comments on "${journal.title}" | Deep Dey Journal`,
      description: journal.summary
        ? `Comments and replies on "${journal.title}". ${String(journal.summary).slice(0, 120)}`
        : `Comments and replies on "${journal.title}".`,
      image: pickRandomRenderImage(journal.images),
      path: `/journal/view/${routeKey}/comments`,
      type: 'article',
    };
  }
  return null;
}

async function getRenderCommentMeta(db, commentId) {
  if (!ObjectId.isValid(commentId)) return null;
  const commentsCol = db.collection('comments');
  const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
  if (!comment?.journalId) return null;
  const journalsCol = db.collection('journals');
  const journal = await journalsCol.findOne(
    { _id: comment.journalId, published: true },
    { projection: { _id: 1, title: 1, images: 1 } },
  );
  if (!journal) return null;
  const preview = String(comment.text || '').trim();
  return {
    title: `Comment by ${comment.userName || 'User'} | ${journal.title}`,
    description: `"${preview.length > 120 ? `${preview.slice(0, 120)}…` : preview}" — comment on "${journal.title}" by ${comment.userName || 'User'}`,
    image: pickRandomRenderImage(journal.images),
    path: `/journal/comment/${encodeURIComponent(commentId)}`,
    type: 'article',
  };
}

async function getRenderUserMeta(db, userId) {
  const token = String(userId || '').trim();
  if (!token) return null;
  const user = await db.collection('users').findOne(
    { userId: token },
    { projection: { userId: 1, userName: 1, profileTitle: 1, bio: 1, description: 1, totalComments: 1, userPic: 1 } },
  );
  if (!user) return null;
  const titleName = user.profileTitle || user.userName || user.userId;
  return {
    title: `${titleName}'s Profile | Deep Dey Journal`,
    description: user.bio
      || user.description
      || `${user.userName || user.userId} has commented ${Number(user.totalComments || 0)} time${Number(user.totalComments || 0) === 1 ? '' : 's'} on journal posts.`,
    image: sanitizeRenderSocialImage(user.userPic) || `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`,
    path: `/user/${encodeURIComponent(token)}`,
    type: 'profile',
  };
}

async function resolveRenderMeta(db, pathname, query) {
  const journalMatch = pathname.match(/^\/journal\/view\/([^/]+)$/);
  if (journalMatch) return await getRenderJournalMeta(db, decodeURIComponent(journalMatch[1]));

  const journalCommentsMatch = pathname.match(/^\/journal\/view\/([^/]+)\/comments$/);
  if (journalCommentsMatch) return await getRenderJournalCommentsMeta(db, decodeURIComponent(journalCommentsMatch[1]));

  const journalCommentMatch = pathname.match(/^\/journal\/(?:comment\/([^/]+)|view\/[^/]+\/comment\/([^/]+))$/);
  if (journalCommentMatch) {
    const commentId = decodeURIComponent(journalCommentMatch[1] || journalCommentMatch[2] || '');
    return await getRenderCommentMeta(db, commentId);
  }

  const userMatch = pathname.match(/^\/user\/([^/]+)$/);
  if (userMatch) return await getRenderUserMeta(db, decodeURIComponent(userMatch[1]));

  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const project = RENDER_PROJECT_META[decodeURIComponent(projectMatch[1])];
    if (project) {
      return {
        ...project,
        image: toAbsoluteRenderUrl(project.image || RENDER_DEFAULT_IMAGE),
        path: pathname,
      };
    }
  }

  const featureMatch = pathname.match(/^\/feature\/([^/]+)$/);
  if (featureMatch) {
    const featureMap = readFeatureMetaForRender();
    const featureMeta = featureMap.get(pathname);
    if (featureMeta) {
      return {
        ...featureMeta,
        path: pathname,
      };
    }
  }

  if (pathname === '/search') {
    const q = String(query.get('q') || '').trim();
    return {
      ...RENDER_STATIC_PAGE_META['/search'],
      title: q ? `Results for "${q}"` : RENDER_STATIC_PAGE_META['/search'].title,
      path: pathname,
    };
  }

  if (pathname === '/journal/embed' || pathname.startsWith('/journal/embed/')) {
    const ref = pathname.split('/').filter(Boolean)[2] || '';
    const journalMeta = await getRenderJournalMeta(db, decodeURIComponent(ref));
    if (journalMeta) {
      return {
        ...journalMeta,
        title: `${journalMeta.title} | Embed`,
        path: pathname,
      };
    }
  }

  if (RENDER_STATIC_PAGE_META[pathname]) {
    return {
      ...RENDER_STATIC_PAGE_META[pathname],
      path: pathname,
      image: `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`,
    };
  }

  return {
    title: 'Deep Dey | Software Architect & JEE 2027 Aspirant',
    description: 'Official portfolio of Deep Dey. Software Architect specializing in AI prompting, system thinking, and web development.',
    image: `${RENDER_BASE_URL}${RENDER_DEFAULT_IMAGE}`,
    path: pathname,
  };
}

function formatUntilIST(until) {
  if (!until) return '';
  const date = until instanceof Date ? until : new Date(until);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function isModerationEntryActive(entry, now = new Date()) {
  if (!entry || entry.active !== true) return false;
  if (!entry.until) return true;
  const untilDate = new Date(entry.until);
  return !Number.isNaN(untilDate.getTime()) && untilDate > now;
}

function buildActiveModerationClause(scope, now = new Date()) {
  return {
    [`moderation.${scope}.active`]: true,
    $or: [
      { [`moderation.${scope}.until`]: null },
      { [`moderation.${scope}.until`]: { $exists: false } },
      { [`moderation.${scope}.until`]: { $gt: now } },
    ],
  };
}

function getUserModerationStateFromDoc(userDoc, now = new Date()) {
  const moderation = userDoc && typeof userDoc === 'object' ? (userDoc.moderation || {}) : {};
  const fullEntry = moderation.full || null;
  const commentsEntry = moderation.comments || null;
  const profileEntry = moderation.profile || null;
  const feedbackEntry = moderation.feedback || null;

  const full = isModerationEntryActive(fullEntry, now);
  const commentsOnly = isModerationEntryActive(commentsEntry, now);
  const profileOnly = isModerationEntryActive(profileEntry, now);
  const feedbackOnly = isModerationEntryActive(feedbackEntry, now);

  return {
    full,
    comments: full || commentsOnly,
    profile: full || profileOnly,
    feedback: full || feedbackOnly,
    entries: {
      full: full ? fullEntry : null,
      comments: !full && commentsOnly ? commentsEntry : null,
      profile: !full && profileOnly ? profileEntry : null,
      feedback: !full && feedbackOnly ? feedbackEntry : null,
    },
    moderation,
  };
}

function buildModerationMessage(scope, state) {
  if (!state) return null;
  const normalizedScope = scope === 'full' ? 'full' : (state.full ? 'full' : scope);
  const entry = normalizedScope === 'full' ? state.entries.full : state.entries[normalizedScope];
  const untilText = entry?.until ? ` until ${formatUntilIST(entry.until)} IST` : ' until the owner reactivates it';
  const reasonText = entry?.reason ? ` Reason: ${entry.reason}` : '';
  if (normalizedScope === 'full') {
    return `Your account is temporarily deactivated${untilText}. Contact support to reactivate.${reasonText}`;
  }
  if (normalizedScope === 'comments') {
    return `Your comment access is temporarily disabled${untilText}. Contact support to reactivate.${reasonText}`;
  }
  if (normalizedScope === 'feedback') {
    return `Your feedback access is temporarily disabled${untilText}. Contact support to reactivate.${reasonText}`;
  }
  return `This user profile is temporarily deactivated${untilText}.${reasonText}`;
}

const THIRD_PARTY_PROVIDERS = {
  vercel: { id: 'vercel', name: 'Vercel', endpoint: 'https://www.vercel-status.com/api/v2/status.json', type: 'statuspage', statusPageUrl: 'https://www.vercel-status.com' },
  netlify: { id: 'netlify', name: 'Netlify', endpoint: 'https://www.netlifystatus.com/api/v2/status.json', type: 'statuspage', statusPageUrl: 'https://www.netlifystatus.com' },
  cloudflare: { id: 'cloudflare', name: 'Cloudflare DNS', endpoint: 'https://www.cloudflarestatus.com/api/v2/status.json', type: 'statuspage', statusPageUrl: 'https://www.cloudflarestatus.com' },
  aws: { id: 'aws', name: 'AWS', endpoint: 'https://status.aws.amazon.com/data.json', type: 'aws', statusPageUrl: 'https://status.aws.amazon.com' },
  gcp: { id: 'gcp', name: 'Google Cloud', endpoint: 'https://status.cloud.google.com/incidents.json', type: 'gcp', statusPageUrl: 'https://status.cloud.google.com' },
  github: { id: 'github', name: 'GitHub', endpoint: 'https://www.githubstatus.com/api/v2/status.json', type: 'statuspage', statusPageUrl: 'https://www.githubstatus.com' },
};

function normalizeStatusMonitorMode(mode) {
  const value = String(mode || '').trim().toLowerCase();
  return STATUS_MONITOR_MODES.includes(value) ? value : 'live';
}

function defaultStatusMonitorConfig() {
  return {
    mode: 'live',
    updatedAt: null,
    updatedAtIST: null,
  };
}

function detectOwnHostingProvider() {
  if (process.env.VERCEL) return 'vercel';
  if (process.env.NETLIFY) return 'netlify';
  if (process.env.AWS_REGION || process.env.AWS_EXECUTION_ENV || process.env.AWS_LAMBDA_FUNCTION_NAME) return 'aws';
  if (process.env.GOOGLE_CLOUD_PROJECT || process.env.GCLOUD_PROJECT || process.env.K_SERVICE) return 'gcp';
  if (process.env.FLY_REGION) return 'fly';
  return 'unknown';
}

function inferHostingProvider(hostname, serverHeader) {
  const host = String(hostname || '').toLowerCase();
  const server = String(serverHeader || '').toLowerCase();
  const source = `${host} ${server}`;
  if (source.includes('vercel')) return 'vercel';
  if (source.includes('netlify')) return 'netlify';
  if (source.includes('cloudflare')) return 'cloudflare';
  if (source.includes('amazon') || source.includes('aws')) return 'aws';
  if (source.includes('google') || source.includes('gcp')) return 'gcp';
  if (source.includes('github')) return 'github';
  if (host === 'fly.io' || host.endsWith('.fly.io') || host.endsWith('.fly.dev') || server.includes('fly')) return 'fly';
  return host || 'unknown';
}

function normalizeEventMessage(input, fallback = 'No details shared') {
  const raw = String(input || '').trim();
  if (!raw) return fallback;
  return raw.length > 220 ? `${raw.slice(0, 217)}...` : raw;
}

function toMsTime(value) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function pickLatestEvent(events = []) {
  if (!Array.isArray(events) || events.length === 0) return null;
  return [...events]
    .filter(Boolean)
    .sort((a, b) => {
      const aTime = toMsTime(a.updatedAt || a.createdAt || a.scheduledFor || a.start || a.begin);
      const bTime = toMsTime(b.updatedAt || b.createdAt || b.scheduledFor || b.start || b.begin);
      return bTime - aTime;
    })[0] || null;
}

async function resolveHostNetworkInfo(url) {
  try {
    const hostname = new URL(url).hostname;
    const looked = await dns.lookup(hostname, { all: true });
    const addresses = Array.isArray(looked) ? looked.map((x) => x.address).filter(Boolean) : [];
    return {
      hostname,
      serverIp: addresses[0] || null,
      serverIps: addresses,
    };
  } catch {
    return {
      hostname: null,
      serverIp: null,
      serverIps: [],
    };
  }
}

async function readStatusMonitorConfig(db) {
  const configCol = db.collection('config');
  const doc = await configCol.findOne({ _id: STATUS_MONITOR_CONFIG_ID });
  if (!doc) return defaultStatusMonitorConfig();
  return {
    mode: normalizeStatusMonitorMode(doc.mode),
    updatedAt: doc.updatedAt || null,
    updatedAtIST: doc.updatedAtIST || null,
  };
}

function mapThirdPartyIndicatorToStatus(indicator) {
  const value = String(indicator || '').toLowerCase();
  if (!value || value === 'none' || value === 'ok' || value === 'operational' || value === '0') return 'operational';
  if (value === 'minor' || value === 'degraded' || value === 'maintenance' || value === '1') return 'degraded';
  if (value === 'major' || value === 'critical' || value === 'down' || value === '2' || value === '3') return 'down';
  return 'degraded';
}

async function fetchThirdPartyProviderStatus(provider) {
  const ownHostingProvider = detectOwnHostingProvider();
  const networkInfo = await resolveHostNetworkInfo(provider.endpoint);
  const basePayload = {
    id: provider.id,
    name: provider.name,
    mainEndpoint: provider.endpoint,
    statusPageUrl: provider.statusPageUrl || null,
    serverHost: networkInfo.hostname,
    serverIp: networkInfo.serverIp,
    serverIps: networkInfo.serverIps,
    ownHostingProvider,
  };

  try {
    // Warm-up ping: ignore first response to reduce cold-start skew.
    await fetch(provider.endpoint, { method: 'GET', headers: { Accept: 'application/json' } }).catch(() => {});

    const started = Date.now();
    const response = await fetch(provider.endpoint, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });
    const latencyMs = Date.now() - started;
    const serverHeader = response.headers.get('server') || '';
    const hostingProvider = inferHostingProvider(networkInfo.hostname, serverHeader);
    const isLikelyOwnInfrastructure = ownHostingProvider !== 'unknown' && hostingProvider === ownHostingProvider;

    let data = null;
    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      return {
        ...basePayload,
        status: 'down',
        indicator: 'http_error',
        description: `HTTP ${response.status}`,
        providerMessage: `Provider status endpoint returned HTTP ${response.status}.`,
        httpStatus: response.status,
        latencyMs,
        hostingProvider,
        isLikelyOwnInfrastructure,
        hasOngoingIncident: true,
        hasOngoingMaintenance: false,
        latestIncident: { title: `HTTP ${response.status}`, message: 'Status endpoint is not returning successful response.', severity: 'major', updatedAt: null, moreInfoUrl: provider.statusPageUrl || null },
        latestMaintenance: null,
        lastUpdated: null,
      };
    }

    if (provider.type === 'statuspage') {
      const indicator = data?.status?.indicator || 'unknown';
      const status = mapThirdPartyIndicatorToStatus(indicator);
      const statusPageRoot = provider.statusPageUrl || (() => {
        try {
          const origin = new URL(provider.endpoint).origin;
          return origin;
        } catch {
          return null;
        }
      })();

      const incidentsEndpoint = statusPageRoot ? `${statusPageRoot}/api/v2/incidents/unresolved.json` : null;
      const maintenanceEndpoint = statusPageRoot ? `${statusPageRoot}/api/v2/scheduled-maintenances/active.json` : null;

      const [incidentsPayload, maintPayload] = await Promise.all([
        incidentsEndpoint
          ? fetch(incidentsEndpoint, { headers: { Accept: 'application/json' } }).then((r) => r.json()).catch(() => null)
          : Promise.resolve(null),
        maintenanceEndpoint
          ? fetch(maintenanceEndpoint, { headers: { Accept: 'application/json' } }).then((r) => r.json()).catch(() => null)
          : Promise.resolve(null),
      ]);

      const unresolvedIncidents = Array.isArray(incidentsPayload?.incidents)
        ? incidentsPayload.incidents.map((incident) => ({
            id: String(incident?.id || ''),
            title: String(incident?.name || incident?.title || 'Ongoing incident').trim(),
            message: normalizeEventMessage(incident?.incident_updates?.[0]?.body || incident?.shortlink || incident?.impact_override || incident?.status || 'Provider reported an incident.'),
            severity: String(incident?.impact || 'minor').toLowerCase(),
            updatedAt: incident?.updated_at || incident?.created_at || null,
            moreInfoUrl: incident?.shortlink || statusPageRoot,
          }))
        : [];
      const activeMaintenances = Array.isArray(maintPayload?.scheduled_maintenances)
        ? maintPayload.scheduled_maintenances.map((maintenance) => ({
            id: String(maintenance?.id || ''),
            title: String(maintenance?.name || 'Scheduled maintenance').trim(),
            message: normalizeEventMessage(maintenance?.incident_updates?.[0]?.body || maintenance?.status || 'Provider scheduled maintenance in progress.'),
            severity: String(maintenance?.impact || 'maintenance').toLowerCase(),
            updatedAt: maintenance?.updated_at || maintenance?.scheduled_for || null,
            scheduledFor: maintenance?.scheduled_for || null,
            moreInfoUrl: maintenance?.shortlink || statusPageRoot,
          }))
        : [];

      const latestIncident = pickLatestEvent(unresolvedIncidents);
      const latestMaintenance = pickLatestEvent(activeMaintenances);
      const hasOngoingIncident = unresolvedIncidents.length > 0;
      const hasOngoingMaintenance = activeMaintenances.length > 0;
      const providerMessage = hasOngoingIncident
        ? `Active incident: ${latestIncident?.title || 'Reported by provider'}.`
        : hasOngoingMaintenance
          ? `Maintenance: ${latestMaintenance?.title || 'Provider maintenance ongoing'}.`
          : data?.status?.description || 'All systems are operating normally.';

      return {
        ...basePayload,
        status,
        indicator,
        description: data?.status?.description || 'Status data available',
        providerMessage,
        httpStatus: response.status,
        latencyMs,
        hostingProvider,
        isLikelyOwnInfrastructure,
        hasOngoingIncident,
        hasOngoingMaintenance,
        latestIncident,
        latestMaintenance,
        incidentCount: unresolvedIncidents.length,
        maintenanceCount: activeMaintenances.length,
        lastUpdated: data?.page?.updated_at || data?.status?.updated_at || latestIncident?.updatedAt || latestMaintenance?.updatedAt || null,
      };
    }

    if (provider.type === 'aws') {
      const indicator = data?.current?.status ?? data?.status ?? '0';
      const description = data?.current?.summary || data?.current?.description || 'Service is operating normally';
      const hasOngoingMaintenance = Boolean(String(description || '').toLowerCase().includes('maintenance'));
      const status = mapThirdPartyIndicatorToStatus(indicator);
      const hasOngoingIncident = status !== 'operational' || /incident|disruption|outage/i.test(String(description || ''));
      return {
        ...basePayload,
        status,
        indicator: String(indicator ?? ''),
        description,
        providerMessage: normalizeEventMessage(description, 'AWS status available.'),
        httpStatus: response.status,
        latencyMs,
        hostingProvider,
        isLikelyOwnInfrastructure,
        hasOngoingIncident,
        hasOngoingMaintenance,
        latestIncident: hasOngoingIncident ? { title: 'AWS Service Advisory', message: normalizeEventMessage(description), severity: status === 'down' ? 'major' : 'minor', updatedAt: data?.current?.date || data?.current?.time || null, moreInfoUrl: provider.statusPageUrl || null } : null,
        latestMaintenance: hasOngoingMaintenance ? { title: 'AWS Maintenance Notice', message: normalizeEventMessage(description), severity: 'maintenance', updatedAt: data?.current?.date || data?.current?.time || null, moreInfoUrl: provider.statusPageUrl || null } : null,
        lastUpdated: data?.current?.date || data?.current?.time || null,
      };
    }

    if (provider.type === 'gcp') {
      const incidents = Array.isArray(data) ? data : [];
      const activeIncidents = incidents.filter((incident) => !String(incident?.end || '').trim());
      const activeCount = activeIncidents.length;
      const latestIncidentData = pickLatestEvent(activeIncidents.map((incident) => ({
        title: String(incident?.title || incident?.external_desc || 'Google Cloud incident').trim(),
        message: normalizeEventMessage(incident?.external_desc || incident?.service_name || 'Service disruption reported by Google Cloud.'),
        severity: String(incident?.severity || (incident?.status_impact || 'minor')).toLowerCase(),
        updatedAt: incident?.modified || incident?.begin || null,
        moreInfoUrl: provider.statusPageUrl || null,
      })));
      return {
        ...basePayload,
        status: activeCount === 0 ? 'operational' : 'degraded',
        indicator: activeCount === 0 ? 'none' : 'minor',
        description: activeCount === 0 ? 'No active incidents reported' : `${activeCount} active incident${activeCount > 1 ? 's' : ''} reported`,
        providerMessage: activeCount === 0 ? 'No active incidents reported by Google Cloud.' : normalizeEventMessage(latestIncidentData?.message || 'Google Cloud reported active incidents.'),
        httpStatus: response.status,
        latencyMs,
        hostingProvider,
        isLikelyOwnInfrastructure,
        hasOngoingIncident: activeCount > 0,
        hasOngoingMaintenance: false,
        latestIncident: latestIncidentData,
        latestMaintenance: null,
        incidentCount: activeCount,
        maintenanceCount: 0,
        lastUpdated: latestIncidentData?.updatedAt || activeIncidents[0]?.modified || incidents[0]?.modified || null,
      };
    }

    return {
      ...basePayload,
      status: 'degraded',
      indicator: 'unknown',
      description: 'Unknown provider format',
      providerMessage: 'Provider format changed, status parser fallback is active.',
      httpStatus: response.status,
      latencyMs,
      hostingProvider,
      isLikelyOwnInfrastructure,
      hasOngoingIncident: false,
      hasOngoingMaintenance: false,
      latestIncident: null,
      latestMaintenance: null,
      lastUpdated: null,
    };
  } catch (error) {
    return {
      ...basePayload,
      status: 'down',
      indicator: 'fetch_error',
      description: error instanceof Error ? error.message : 'Failed to fetch provider status',
      providerMessage: 'Unable to fetch provider status right now.',
      httpStatus: null,
      latencyMs: null,
      hostingProvider: inferHostingProvider(networkInfo.hostname, ''),
      isLikelyOwnInfrastructure: false,
      hasOngoingIncident: true,
      hasOngoingMaintenance: false,
      latestIncident: { title: 'Fetch error', message: error instanceof Error ? normalizeEventMessage(error.message) : 'Provider status fetch failed.', severity: 'major', updatedAt: null, moreInfoUrl: provider.statusPageUrl || null },
      latestMaintenance: null,
      lastUpdated: null,
    };
  }
}

async function getUserModerationState(db, userId) {
  if (!userId || userId === 'owner') return { userDoc: null, state: getUserModerationStateFromDoc(null) };
  const userDoc = await db.collection('users').findOne({ userId });
  return { userDoc, state: getUserModerationStateFromDoc(userDoc) };
}

async function getHiddenUserIdsByScope(db, scope) {
  if (!['comments', 'feedback', 'profile'].includes(scope)) return [];
  const now = new Date();
  const clauses = [buildActiveModerationClause('full', now)];
  if (scope !== 'full') clauses.push(buildActiveModerationClause(scope, now));
  const docs = await db.collection('users')
    .find(
      {
        userId: { $exists: true, $nin: ['', 'owner'] },
        $or: clauses,
      },
      { projection: { userId: 1 } },
    )
    .toArray();
  return docs.map((doc) => String(doc.userId || '').trim()).filter(Boolean);
}

async function applyVisibleCommentUserFilter(db, filter = {}) {
  const hiddenUserIds = await getHiddenUserIdsByScope(db, 'comments');
  if (!hiddenUserIds.length) return filter;
  return { ...filter, userId: { $nin: hiddenUserIds } };
}

async function applyVisibleFeedbackUserFilter(db, filter = {}) {
  const hiddenUserIds = await getHiddenUserIdsByScope(db, 'feedback');
  if (!hiddenUserIds.length) return filter;
  return { ...filter, userId: { $nin: hiddenUserIds } };
}

async function applyVisibleProfileUserFilter(db, filter = PUBLIC_USER_FILTER) {
  const hiddenUserIds = await getHiddenUserIdsByScope(db, 'profile');
  if (!hiddenUserIds.length) return filter;
  const baseUserFilter = filter.userId && typeof filter.userId === 'object'
    ? {
        ...filter.userId,
        $nin: [...new Set([...(Array.isArray(filter.userId.$nin) ? filter.userId.$nin : []), ...hiddenUserIds])],
      }
    : { $exists: true, $nin: hiddenUserIds };
  return { ...filter, userId: baseUserFilter };
}

async function recalculateUserCommentStats(db, userId) {
  if (!userId || userId === 'owner') return null;
  const usersCol = db.collection('users');
  const commentsCol = db.collection('comments');
  const existingUser = await usersCol.findOne({ userId });
  if (!existingUser) return null;
  const [totalComments, firstComment, lastComment] = await Promise.all([
    commentsCol.countDocuments({ userId, isDeleted: { $ne: true } }),
    commentsCol.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: 1 }).limit(1).next(),
    commentsCol.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).limit(1).next(),
  ]);
  const fallbackDate = existingUser.createdAt || new Date();
  const update = {
    totalComments,
    firstCommentAt: firstComment?.createdAt || existingUser.firstCommentAt || fallbackDate,
    lastCommentAt: lastComment?.createdAt || existingUser.lastCommentAt || fallbackDate,
    lastJournalId: lastComment?.journalId || null,
    contentResetAt: totalComments === 0 ? new Date() : existingUser.contentResetAt,
  };
  await usersCol.updateOne({ userId }, { $set: update });
  return await usersCol.findOne({ userId });
}

// ── Comment helpers ──────────────────────────────────────────────────────────

async function verifyGoogleToken(token) {
  if (!token) return null;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  try {
    const r = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
    const data = await r.json();
    if (data.error || data.error_description || !data.sub) return null;
    if (clientId && data.aud !== clientId) return null;
    return {
      userId: data.sub,
      name: data.name || data.given_name || 'Anonymous',
      email: data.email || '',
      picture: data.picture || '',
    };
  } catch { return null; }
}

function generateServiceKey() {
  let serviceKey = '';
  for (let i = 0; i < 16; i += 1) {
    serviceKey += String(crypto.randomInt(0, 10));
  }
  return serviceKey;
}

async function censorText(db, text) {
  try {
    const blacklist = await db.collection('comment_blacklist').find({}).toArray();
    if (!blacklist.length) return text;
    let result = text;
    for (const item of blacklist) {
      const word = String(item.word || '').trim();
      if (!word) continue;
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      result = result.replace(regex, (match) => '*'.repeat(match.length));
    }
    return result;
  } catch { return text; }
}

// Returns { text: censored, hasAbuse: bool }
async function censorTextWithFlag(db, text) {
  try {
    const blacklist = await db.collection('comment_blacklist').find({}).toArray();
    if (!blacklist.length) return { text, hasAbuse: false };
    let result = text;
    let hasAbuse = false;
    for (const item of blacklist) {
      const word = String(item.word || '').trim();
      if (!word) continue;
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(escaped, 'gi');
      const newResult = result.replace(regex, (match) => '*'.repeat(match.length));
      if (newResult !== result) hasAbuse = true;
      result = newResult;
    }
    return { text: result, hasAbuse };
  } catch { return { text, hasAbuse: false }; }
}

// Check if user is blocked (returns block doc or null)
async function getActiveBlock(db, userId, journalId) {
  if (!userId || userId === 'owner') return null;
  const blocksCol = db.collection('blocked_users');
  const now = new Date();
  // Check all-post block or temp block that's still active
  const allBlock = await blocksCol.findOne({
    userId,
    blockType: { $in: ['all', 'temp'] },
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: now } },
    ],
  });
  if (allBlock) return allBlock;
  // Check post-specific block
  if (journalId) {
    const postBlock = await blocksCol.findOne({
      userId,
      blockType: 'post',
      journalId: new ObjectId(String(journalId)),
    });
    if (postBlock) return postBlock;
  }
  return null;
}

async function buildBlockMessage(db, block) {
  if (!block) return 'You are blocked from commenting.';
  if (block.blockType === 'temp') {
    return `You are temporarily blocked from commenting${block.expiresAt ? ` until ${new Date(block.expiresAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST` : ''}.`;
  }
  if (block.blockType === 'post') {
    let title = '';
    try {
      if (block.journalId && ObjectId.isValid(String(block.journalId))) {
        const j = await db.collection('journals').findOne({ _id: new ObjectId(String(block.journalId)) }, { projection: { title: 1 } });
        title = String(j?.title || '').trim();
      }
    } catch { /* ignore */ }
    return title
      ? `You are blocked from commenting on this post: "${title}".`
      : 'You are blocked from commenting on this post.';
  }
  return 'You are blocked from commenting.';
}

async function attachVerifiedFlagsToComments(db, comments) {
  if (!Array.isArray(comments) || comments.length === 0) return [];
  const userIds = [...new Set(
    comments
      .map(c => String(c?.userId || '').trim())
      .filter(id => id && id !== 'owner'),
  )];

  const verifiedMap = new Map();
  if (userIds.length > 0) {
    const users = await db.collection('users')
      .find({ userId: { $in: userIds } }, { projection: { userId: 1, verified: 1 } })
      .toArray();
    users.forEach((u) => verifiedMap.set(String(u.userId), Boolean(u.verified)));
  }

  return comments.map(c => ({
    ...c,
    isVerified: c?.userId === 'owner' ? true : Boolean(verifiedMap.get(String(c?.userId || ''))),
  }));
}

async function getJournalByIdOrSlug(col, req) {
  const slugParam = getParam(req, 'slug');
  const idParam = getParam(req, 'id');
  const authed = isAuthenticated(req);
  const refs = [slugParam, idParam].filter(Boolean);
  if (refs.length === 0) return null;
  for (const ref of refs) {
    const doc = await resolveJournalByRef(col, ref, !authed);
    if (doc) return doc;
  }
  return null;
}

async function resolveJournalByRef(col, journalIdOrSlugOrTitle, onlyPublished = true) {
  const token = String(journalIdOrSlugOrTitle || '').trim();
  if (!token) return null;

  const titleLikeToken = token.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
  const slugToken = slugify(token);
  const queryVariants = [];

  if (ObjectId.isValid(token)) {
    queryVariants.push({ _id: new ObjectId(token) });
  }
  queryVariants.push({ slug: token });
  if (slugToken && slugToken !== token) queryVariants.push({ slug: slugToken });
  queryVariants.push({ title: new RegExp(`^${escapeRegexLiteral(token)}$`, 'i') });
  if (titleLikeToken && titleLikeToken !== token) {
    queryVariants.push({ title: new RegExp(`^${escapeRegexLiteral(titleLikeToken)}$`, 'i') });
  }

  for (const q of queryVariants) {
    const query = onlyPublished ? { ...q, published: true } : q;
    const doc = await col.findOne(query);
    if (doc) return doc;
  }
  return null;
}

async function resolveJournalObjectId(col, journalIdOrSlug, onlyPublished = true) {
  const doc = await resolveJournalByRef(col, journalIdOrSlug, onlyPublished);
  return doc?._id || null;
}

function renderJournalHtmlDocument(journal) {
  const title = he.escape(String(journal?.title || 'Journal'));
  const summary = he.escape(String(journal?.summary || ''));
  const content = String(journal?.content || '');
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  ${summary ? `<meta name="description" content="${summary}" />` : ''}
  <style>
    :root { color-scheme: dark; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; width: 100%; background: #0a0a0a; color: #d4d4d8; font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif; line-height: 1.65; }
    body { padding: 1rem; overflow-x: auto; }
    img, video, iframe { max-width: 100%; height: auto; border-radius: 0.75rem; }
    pre, code { max-width: 100%; overflow-x: auto; }
    a { color: #f59e0b; }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
}

function isHtmlContentType(contentType) {
  return String(contentType || '').trim().toLowerCase() === 'html';
}


const FEEDBACK_DEFAULT_LIMIT = 20;

function normalizeFeedbackSort(sortToken) {
  const token = String(sortToken || 'newest').trim().toLowerCase();
  if (['newest', 'oldest', 'highest', 'lowest', 'relevant'].includes(token)) return token;
  return 'newest';
}

function getFeedbackSort(sortToken) {
  const sort = normalizeFeedbackSort(sortToken);
  if (sort === 'oldest') return { createdAt: 1 };
  if (sort === 'highest') return { rating: -1, createdAt: -1 };
  if (sort === 'lowest') return { rating: 1, createdAt: -1 };
  if (sort === 'relevant') return { isPinned: -1, rating: -1, createdAt: -1 };
  return { createdAt: -1 };
}

function normalizeFeedbackRating(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(1, Math.min(5, Math.round(n)));
}

function normalizeFeedbackReaction(value) {
  const token = String(value || '').trim().toLowerCase();
  if (token === 'like' || token === 'dislike') return token;
  return null;
}

function getFeedbackReactionSummary(value) {
  const likes = Math.max(0, Number(value?.likes || 0));
  const dislikes = Math.max(0, Number(value?.dislikes || 0));
  const total = likes + dislikes;
  return { likes, dislikes, total };
}

function getFeedbackReactionSessions(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const sessions = {};
  for (const [session, reaction] of Object.entries(value)) {
    const normalizedReaction = normalizeFeedbackReaction(reaction);
    if (!normalizedReaction) continue;
    sessions[String(session)] = normalizedReaction;
  }
  return sessions;
}

function normalizeKlipyMediaUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw);
    if (!['http:', 'https:'].includes(parsed.protocol)) return '';
    if (!String(parsed.hostname || '').toLowerCase().includes('klipy')) return '';
    return parsed.toString();
  } catch {
    return '';
  }
}

function isKlipyMediaCommentText(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return false;
  if (/\s/.test(trimmed)) return false;
  return Boolean(normalizeKlipyMediaUrl(trimmed));
}

function extractKlipyRawItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.results)) return payload.results;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.items)) return payload.items;
  if (Array.isArray(payload?.gifs)) return payload.gifs;
  return [];
}

function normalizeKlipyResult(item, index) {
  const mediaUrl = normalizeKlipyMediaUrl(
    item?.url
    || item?.mediaUrl
    || item?.media_url
    || item?.gif?.url
    || item?.image?.url
    || item?.images?.original?.url
    || item?.images?.downsized?.url,
  );
  if (!mediaUrl) return null;
  const previewUrl = normalizeKlipyMediaUrl(
    item?.previewUrl
    || item?.preview_url
    || item?.thumbnail
    || item?.images?.preview?.url
    || item?.images?.fixed_width_small?.url
    || mediaUrl,
  ) || mediaUrl;
  return {
    id: String(item?.id || `${index}-${mediaUrl}`),
    title: String(item?.title || item?.name || 'Klipy media'),
    url: mediaUrl,
    previewUrl,
  };
}

async function fetchKlipySearchResults(query, limit, apiKey) {
  const requestPlans = [
    { path: '/v1/search', extraParams: { type: 'all' } },
    { path: '/v1/gifs/search', extraParams: {} },
    { path: '/v1/stickers/search', extraParams: {} },
  ];

  for (const plan of requestPlans) {
    try {
      const endpoint = new URL(`${KLIPY_API_BASE}${plan.path}`);
      endpoint.searchParams.set('q', query);
      endpoint.searchParams.set('limit', String(limit));
      Object.entries(plan.extraParams).forEach(([k, v]) => endpoint.searchParams.set(k, String(v)));

      const response = await fetch(endpoint.toString(), {
        headers: {
          Accept: 'application/json',
          'x-api-key': apiKey,
          Authorization: `Bearer ${apiKey}`,
        },
      });
      if (!response.ok) continue;
      const payload = await response.json();
      const items = extractKlipyRawItems(payload)
        .map((item, index) => normalizeKlipyResult(item, index))
        .filter(Boolean)
        .slice(0, limit);
      if (items.length) return items;
    } catch {
      // try next endpoint variation
    }
  }

  return [];
}

async function getFeedbackCategoriesMap(db) {
  const categories = await db.collection('feedback_categories').find({ type: 'feedback' }).toArray();
  const map = new Map();
  for (const cat of categories) {
    const subjectSlug = String(cat?.subjectSlug || '').trim();
    if (!subjectSlug) continue;
    const sub = new Map();
    const subSubjects = Array.isArray(cat?.subSubjects) ? cat.subSubjects : [];
    for (const item of subSubjects) {
      const slug = String(item?.slug || '').trim();
      const name = String(item?.name || '').trim();
      if (!slug || !name) continue;
      sub.set(slug, name);
    }
    map.set(subjectSlug, {
      subject: String(cat?.subject || '').trim(),
      subjectSlug,
      sub,
    });
  }
  return map;
}

async function buildFeedbackRatingSummary(db, filter = {}) {
  const rows = await db.collection('feedbacks').aggregate([
    { $match: filter },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ]).toArray();
  const map = new Map(rows.map((r) => [Number(r._id), Number(r.count || 0)]));
  return [5, 4, 3, 2, 1].map((star) => ({ star, count: map.get(star) || 0 }));
}

module.exports = async (req, res) => {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.statusCode = 204;
      res.end();
      return;
    }

    const db = await getDb();
    const col = db.collection('journals');

    // ==========================================
    // GET REQUESTS
    // ==========================================
    if (req.method === 'GET') {
      const action = getParam(req, 'action');

      if (action === 'klipy-search') {
        const apiKey = String(process.env.KLIPY_API || '').trim();
        if (!apiKey) return json(res, 503, { ok: false, message: 'Klipy is not configured. Set KLIPY_API in environment variables.' });
        const q = String(getParam(req, 'q') || '').trim();
        if (!q) return json(res, 400, { ok: false, message: 'q is required' });
        if (q.length < 2) return json(res, 400, { ok: false, message: 'q must be at least 2 characters' });
        const limit = Math.min(30, Math.max(1, parseInt(String(getParam(req, 'limit') || '18'), 10) || 18));

        const results = await fetchKlipySearchResults(q, limit, apiKey);
        return json(res, 200, { ok: true, results });
      }

      if (action === 'render-page') {
        try {
          const requestUrl = new URL(req.url, RENDER_BASE_URL);
          const rawPath = String(requestUrl.searchParams.get('path') || '/').trim() || '/';
          const pathname = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '') || '/';
          const query = new URLSearchParams(requestUrl.searchParams);
          query.delete('path');
          query.delete('action');
          const meta = await resolveRenderMeta(db, pathname, query) || {};

          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
          res.end(buildRenderedPageHtml({
            ...meta,
            image: toAbsoluteRenderUrl(meta.image || RENDER_DEFAULT_IMAGE),
            path: meta.path || pathname,
            query: query.toString() ? `?${query.toString()}` : '',
          }));
        } catch {
          res.statusCode = 200;
          res.setHeader('Content-Type', 'text/html; charset=utf-8');
          res.end(readSpaTemplate());
        }
        return;
      }

      // --- HTML Journal File (public) ---
      if (action === 'html-file') {
        const ref = String(getParam(req, 'slug') || getParam(req, 'id') || '').trim();
        if (!ref) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Missing journal id or slug');
          return;
        }
        const journal = await resolveJournalByRef(col, ref, true);
        if (!journal) {
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Journal not found');
          return;
        }
        if (!isHtmlContentType(journal.contentType)) {
          res.statusCode = 415;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.end('Only HTML content type is supported for this endpoint');
          return;
        }
        const allowedOrigin = String(process.env.JOURNAL_HTML_ALLOW_ORIGIN || '*').trim() || '*';
        res.statusCode = 200;
        res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Cache-Control', 'public, s-maxage=120, stale-while-revalidate=300');
        res.end(renderJournalHtmlDocument(journal));
        return;
      }

      // --- DB Stats: Storage usage for dashboard ---
      if (action === 'dbstats') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

        // Website DB stats (current database only)
        let overallStats = { dataSize: 0, storageSize: 0, indexSize: 0 };
        try {
          const s = await db.command({ dbStats: 1 });
          overallStats = { dataSize: s.dataSize || 0, storageSize: s.storageSize || 0, indexSize: s.indexSize || 0 };
        } catch { /* ignore */ }

        // Full cluster total (all databases on this Atlas cluster)
        let clusterTotalSize = 0;
        try {
          const listResult = await cachedClient.db('admin').command({ listDatabases: 1 });
          clusterTotalSize = listResult.totalSize || 0;
        } catch { /* Atlas M0 may not allow this — fall back to current DB size */ }

        const collectionNames = ['journals', 'projects', 'timeline', 'categories', 'feedback_categories', 'feedbacks', 'live_status', 'settings', 'config', 'search_analytics', 'comments', 'blocked_users', 'users'];
        const collections = {};
        for (const name of collectionNames) {
          try {
            const cursor = db.collection(name).aggregate([{ $collStats: { storageStats: {} } }]);
            const arr = await cursor.toArray();
            const cs = arr[0];
            collections[name] = {
              count: cs?.storageStats?.count || 0,
              size: cs?.storageStats?.size || 0,
              storageSize: cs?.storageStats?.storageSize || 0,
            };
          } catch {
            try {
              const count = await db.collection(name).countDocuments();
              collections[name] = { count, size: 0, storageSize: 0 };
            } catch { collections[name] = { count: 0, size: 0, storageSize: 0 }; }
          }
        }
        return json(res, 200, { ok: true, ...overallStats, clusterTotalSize, collections });
      }

      // --- Public Health Check (no auth) — used by /status page ---
      if (action === 'health') {
        const os = require('os');
        const dbPingStart = Date.now();
        try { await db.command({ ping: 1 }); } catch { /* ignore */ }
        const dbPingMs = Date.now() - dbPingStart;

        const mem = process.memoryUsage();
        const cpus = os.cpus();

        let diskInfo = null;
        try {
          const fsModule = require('fs');
          if (typeof fsModule.statfsSync === 'function') {
            const st = fsModule.statfsSync('/tmp');
            diskInfo = { total: st.blocks * st.bsize, free: st.bfree * st.bsize, available: st.bavail * st.bsize };
          }
        } catch { /* ignore — not available on all runtimes */ }

        return json(res, 200, {
          ok: true,
          timestamp: Date.now(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch(),
          osType: os.type(),
          osRelease: os.release(),
          hostname: os.hostname(),
          serverRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || process.env.FLY_REGION || '—',
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpus: cpus.map((c) => ({ model: c.model, speedMHz: c.speed, times: c.times })),
          cpuCount: cpus.length,
          processMemory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external },
          dbPingMs,
          loadAverage: os.loadavg(),
          diskInfo,
        });
      }

      if (action === 'status-monitor-config') {
        const monitorConfig = await readStatusMonitorConfig(db);
        return json(res, 200, { ok: true, ...monitorConfig, availableModes: STATUS_MONITOR_MODES });
      }

      // --- NAYA: Live Status Fetch Logic ---
      if (action === 'third-party-status') {
        const requestedProvider = String(getParam(req, 'provider') || '').trim().toLowerCase();
        const selectedProviders = requestedProvider
          ? (THIRD_PARTY_PROVIDERS[requestedProvider] ? [THIRD_PARTY_PROVIDERS[requestedProvider]] : [])
          : Object.values(THIRD_PARTY_PROVIDERS);

        if (requestedProvider && selectedProviders.length === 0) {
          return json(res, 400, { ok: false, message: 'Invalid provider' });
        }

        const providers = await Promise.all(selectedProviders.map(fetchThirdPartyProviderStatus));
        const monitorConfig = await readStatusMonitorConfig(db);
        return json(res, 200, {
          ok: true,
          checkedAt: Date.now(),
          monitorConfig,
          ownHostingProvider: detectOwnHostingProvider(),
          providers,
        });
      }

      // --- NAYA: Live Status Fetch Logic ---
      if (action === 'status') {
        const statusCol = db.collection('live_status');
        // Pagination ke liye up to 50 records fetch karenge
        const statuses = await statusCol.find({}).sort({ createdAt: -1 }).limit(50).toArray();
        const current = statuses.length > 0 ? statuses[0] : null;
        const history = statuses.length > 1 ? statuses.slice(1) : [];
        return json(res, 200, { ok: true, current, history });
      }

      // --- NAYA: Global Search & Easter Egg Engine ---
      if (action === 'search') {
        const q = getParam(req, 'q') || '';
        const analyticsCol = db.collection('search_analytics');

        // Always fetch the top 5 trending queries so the UI can show them even on empty state
        const trendingDocs = await analyticsCol
          .find({})
          .sort({ count: -1 })
          .limit(5)
          .toArray();
        const trending = trendingDocs.map(t => ({ query: t.query, count: t.count }));

        // If no query, just return trending data with empty results
        if (!q.trim()) {
          return json(res, 200, { ok: true, results: [], easterEgg: null, trending });
        }

        // --- Search Analytics: upsert query counter ---
        const normalizedQuery = q.trim().toLowerCase();
        await analyticsCol.updateOne(
          { query: normalizedQuery },
          {
            $inc: { count: 1 },
            $set: { lastSearched: new Date() },
            $setOnInsert: { query: normalizedQuery }
          },
          { upsert: true }
        );

        // --- Loose Multi-Keyword Matching ---
        // Escape each keyword for safe regex use, then build an $and clause so
        // every keyword must appear in at least one of the indexed fields.
        const keywords = normalizedQuery.split(/\s+/).filter(Boolean);
        const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const buildCharTokens = (terms) => {
          const tokenSet = new Set();
          terms.forEach((term) => {
            const clean = String(term || '').toLowerCase().replace(/[^a-z0-9]/g, '');
            if (clean.length < 3) return;
            for (let size = 3; size <= Math.min(6, clean.length); size += 1) {
              for (let i = 0; i <= clean.length - size; i += 1) {
                tokenSet.add(clean.slice(i, i + size));
              }
            }
          });
          return Array.from(tokenSet).sort((a, b) => b.length - a.length).slice(0, 40);
        };
        const charTokens = buildCharTokens(keywords);
        const snippetTokens = Array.from(new Set([...keywords, ...charTokens])).slice(0, 40);

        const keywordConditions = keywords.map(kw => {
          const kwRegex = new RegExp(escapeRegex(kw), 'i');
          return {
            $or: [
              { title: kwRegex },
              { summary: kwRegex },
              { content: kwRegex },
              { categoryName: kwRegex }
            ]
          };
        });

        const journalsCol = db.collection('journals');
        let matchedJournals = [];
        if (keywordConditions.length > 0) {
          matchedJournals = await journalsCol.find({
            published: true,
            $and: keywordConditions,
          }).sort({ createdAt: -1 }).toArray();
        }
        if (matchedJournals.length === 0 && charTokens.length > 0) {
          const charRegexConditions = charTokens.map((token) => {
            const tokenRegex = new RegExp(escapeRegex(token), 'i');
            return {
              $or: [
                { title: tokenRegex },
                { summary: tokenRegex },
                { content: tokenRegex },
                { categoryName: tokenRegex },
              ],
            };
          });
          matchedJournals = await journalsCol.find({
            published: true,
            $or: charRegexConditions,
          }).sort({ createdAt: -1 }).limit(40).toArray();
        }

        // --- Multi-Keyword Snippet Generator ---
        // Strips HTML, locates each keyword, and highlights ALL keywords in every snippet.
        const getSnippets = (text, kws) => {
          if (!text || !kws.length) return [];
          const plainText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

          const snippets = [];
          let count = 0;

          for (const kw of kws) {
            if (count >= 3) break;
            const regex = new RegExp(escapeRegex(kw), 'gi');
            let match;
            while ((match = regex.exec(plainText)) !== null && count < 3) {
              const start = Math.max(0, match.index - 40);
              const end = Math.min(plainText.length, match.index + kw.length + 40);
              let snippet = plainText.substring(start, end);
              if (start > 0) snippet = '...' + snippet;
              if (end < plainText.length) snippet += '...';

              // Highlight every matched keyword in this snippet
              for (const hw of kws) {
                snippet = snippet.replace(
                  new RegExp(`(${escapeRegex(hw)})`, 'gi'),
                  '<mark class="bg-amber-500/20 text-amber-500 rounded px-1 font-bold">$1</mark>'
                );
              }
              snippets.push(snippet);
              count++;
            }
          }

          return snippets.length > 0
            ? snippets
            : [plainText.substring(0, 120) + (plainText.length > 120 ? '...' : '')];
        };

        const journalResults = matchedJournals.map(j => ({
          _id: j._id,
          type: 'Journal',
          title: j.title,
          url: `/journal/view/${j.slug || j._id}`,
          category: j.categoryName,
          snippets: getSnippets(
            [j.title, j.summary, j.content].filter(Boolean).join(' | '),
            snippetTokens
          ),
          createdAtIST: j.createdAtIST
        }));

        // Community users
        const usersCol = db.collection('users');
        const publicUserFilter = await applyVisibleProfileUserFilter(db, PUBLIC_USER_FILTER);
        const strictUserQuery = keywords.length
          ? { $and: [publicUserFilter, ...keywords.map((kw) => ({ $or: [{ userName: new RegExp(escapeRegex(kw), 'i') }, { userId: new RegExp(escapeRegex(kw), 'i') }, { profileTitle: new RegExp(escapeRegex(kw), 'i') }, { bio: new RegExp(escapeRegex(kw), 'i') }, { description: new RegExp(escapeRegex(kw), 'i') }] }))] }
          : publicUserFilter;
        let matchedUsers = await usersCol.find(strictUserQuery).sort({ lastCommentAt: -1, firstCommentAt: -1 }).limit(8).toArray();
        if (matchedUsers.length === 0 && charTokens.length > 0) {
          const charUserOr = charTokens.map((token) => {
            const tokenRegex = new RegExp(escapeRegex(token), 'i');
            return {
              $or: [
                { userName: tokenRegex },
                { userId: tokenRegex },
                { profileTitle: tokenRegex },
                { bio: tokenRegex },
                { description: tokenRegex },
              ],
            };
          });
          matchedUsers = await usersCol.find({ $and: [publicUserFilter, { $or: charUserOr }] }).sort({ lastCommentAt: -1, firstCommentAt: -1 }).limit(8).toArray();
        }
        const userResults = matchedUsers
          .filter((u) => String(u?.userId || '').trim())
          .map((u) => ({
            _id: `user-${u.userId}`,
            type: 'User',
            title: u.userName || u.userId,
            url: `/user/${encodeURIComponent(u.userId)}`,
            category: 'Community',
            snippets: getSnippets(
              [u.userName, u.userId, u.profileTitle, u.description, u.bio]
                .filter(Boolean)
                .join(' | ') || 'Community user profile',
              snippetTokens
            ),
            createdAtIST: u.lastCommentAtIST || u.firstCommentAtIST || undefined,
          }));

        // Comment permalinks
        const commentsCol = db.collection('comments');
        const strictCommentQuery = keywords.length
          ? {
              isDeleted: { $ne: true },
              $and: keywords.map((kw) => ({ text: new RegExp(escapeRegex(kw), 'i') })),
            }
          : { isDeleted: { $ne: true } };
        let commentQuery = await applyVisibleCommentUserFilter(db, strictCommentQuery);
        let matchedComments = await commentsCol.find(commentQuery).sort({ createdAt: -1 }).limit(12).toArray();
        if (matchedComments.length === 0 && charTokens.length > 0) {
          const charCommentRegex = charTokens.map((token) => new RegExp(escapeRegex(token), 'i'));
          const fallbackCommentQuery = await applyVisibleCommentUserFilter(db, {
            isDeleted: { $ne: true },
            $or: charCommentRegex.map((rgx) => ({ text: rgx })),
          });
          commentQuery = fallbackCommentQuery;
          matchedComments = await commentsCol.find(commentQuery).sort({ createdAt: -1 }).limit(12).toArray();
        }
        const relatedJournalIds = [...new Set(matchedComments.map((c) => String(c?.journalId || '')).filter((v) => ObjectId.isValid(v)))].map((v) => new ObjectId(v));
        const relatedJournals = relatedJournalIds.length
          ? await journalsCol.find({ _id: { $in: relatedJournalIds }, published: true }, { projection: { _id: 1, slug: 1, title: 1 } }).toArray()
          : [];
        const journalMap = {};
        relatedJournals.forEach((j) => { journalMap[String(j._id)] = j; });
        const commentResults = matchedComments
          .filter((c) => c?._id && c?.journalId && journalMap[String(c.journalId)])
          .map((c) => {
            const j = journalMap[String(c.journalId)];
            return {
              _id: `comment-${c._id}`,
              type: 'Comment',
              title: `Comment by ${c.userName || 'User'} on ${j.title || 'Journal'}`,
              url: `/journal/view/${j.slug || j._id}/comment/${c._id}`,
              category: 'Community',
              snippets: getSnippets(String(c.text || ''), snippetTokens),
              createdAtIST: c.createdAtIST || undefined,
            };
          });

        const results = [...journalResults, ...userResults, ...commentResults];

        // --- Easter Egg Logic (Trigger Custom Status Card) ---
        const easterEggTriggers = ['status', 'deep', 'doing', 'free', 'author', 'deep dey', 'admin'];
        let easterEgg = null;
        if (easterEggTriggers.some(t => normalizedQuery.includes(t))) {
          const statusCol = db.collection('live_status');
          const latestStatus = await statusCol
            .find({ isVisible: true })
            .sort({ createdAt: -1 })
            .limit(1)
            .toArray();
          if (latestStatus.length > 0) {
            easterEgg = latestStatus[0];
          }
        }

        return json(res, 200, { ok: true, results, easterEgg, trending });
      }

      // --- Feedback stats (public) ---
      if (action === 'feedback-stats') {
        const feedbackCol = db.collection('feedbacks');
        const visibleFeedbackFilter = await applyVisibleFeedbackUserFilter(db, {});
        const visibleUsersFilter = await applyVisibleProfileUserFilter(db, PUBLIC_USER_FILTER);
        const [totalFeedbacks, pinnedCount, usersCount, avgAgg, distribution] = await Promise.all([
          feedbackCol.countDocuments(visibleFeedbackFilter),
          feedbackCol.countDocuments({ ...visibleFeedbackFilter, isPinned: true }),
          db.collection('users').countDocuments(visibleUsersFilter),
          feedbackCol.aggregate([{ $match: visibleFeedbackFilter }, { $group: { _id: null, avg: { $avg: '$rating' } } }]).toArray(),
          buildFeedbackRatingSummary(db, visibleFeedbackFilter),
        ]);

        const averageRating = totalFeedbacks > 0 ? Number((avgAgg?.[0]?.avg || 0).toFixed(2)) : 0;
        return json(res, 200, {
          ok: true,
          stats: {
            totalUsers: Math.max(1, usersCount + 1),
            totalFeedbacks,
            pinnedCount,
            averageRating,
            ratingSummary: distribution,
          },
        });
      }

      // --- Feedback list (public) ---
      if (action === 'feedback-list') {
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = Math.min(FEEDBACK_DEFAULT_LIMIT, Math.max(1, parseInt(getParam(req, 'limit') || String(FEEDBACK_DEFAULT_LIMIT), 10)));
        const session = String(getParam(req, 'session') || '').trim();
        const subject = String(getParam(req, 'subject') || '').trim().toLowerCase();
        const subSubject = String(getParam(req, 'subSubject') || '').trim().toLowerCase();
        const sort = normalizeFeedbackSort(getParam(req, 'sort'));
        const filter = {};
        if (subject) filter.subjectSlug = subject;
        if (subSubject) filter.subSubjectSlug = subSubject;
        const visibleFilter = await applyVisibleFeedbackUserFilter(db, filter);

        const feedbackCol = db.collection('feedbacks');
        const [total, feedbacks, ratingSummary] = await Promise.all([
          feedbackCol.countDocuments(visibleFilter),
          feedbackCol.find(visibleFilter, {
            projection: {
              userName: 1,
              userPic: 1,
              subject: 1,
              subjectSlug: 1,
              subSubject: 1,
              subSubjectSlug: 1,
              title: 1,
              text: 1,
              rating: 1,
              isPinned: 1,
              createdAt: 1,
              updatedAt: 1,
              isOwner: 1,
              reactionSummary: 1,
              reactionSessions: 1,
            },
          }).sort(getFeedbackSort(sort)).skip((page - 1) * limit).limit(limit).toArray(),
          buildFeedbackRatingSummary(db, visibleFilter),
        ]);

        const feedbacksWithReaction = feedbacks.map((item) => {
          const reactionSummary = getFeedbackReactionSummary(item.reactionSummary);
          const reactionSessions = getFeedbackReactionSessions(item.reactionSessions);
          return {
            ...item,
            reactionSummary,
            viewerReaction: session ? normalizeFeedbackReaction(reactionSessions[session]) : null,
            reactionTotal: reactionSummary.total,
          };
        });

        return json(res, 200, {
          ok: true,
          feedbacks: feedbacksWithReaction,
          ratingSummary,
          pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
      }

      // --- Pinned feedback for homepage (public) ---
      if (action === 'feedback-pinned') {
        const limit = Math.min(200, Math.max(1, parseInt(getParam(req, 'limit') || '80', 10)));
        const session = String(getParam(req, 'session') || '').trim();
        const visiblePinnedFilter = await applyVisibleFeedbackUserFilter(db, { isPinned: true });
        const feedbacks = await db.collection('feedbacks').find(
          visiblePinnedFilter,
          {
            projection: {
              userName: 1,
              userPic: 1,
              subject: 1,
              subSubject: 1,
              title: 1,
              text: 1,
              rating: 1,
              createdAt: 1,
              isOwner: 1,
              reactionSummary: 1,
              reactionSessions: 1,
            },
          },
        ).sort({ createdAt: -1 }).limit(limit).toArray();
        const feedbacksWithReaction = feedbacks.map((item) => {
          const reactionSummary = getFeedbackReactionSummary(item.reactionSummary);
          const reactionSessions = getFeedbackReactionSessions(item.reactionSessions);
          return {
            ...item,
            reactionSummary,
            viewerReaction: session ? normalizeFeedbackReaction(reactionSessions[session]) : null,
            reactionTotal: reactionSummary.total,
          };
        });
        return json(res, 200, { ok: true, feedbacks: feedbacksWithReaction });
      }

      // --- Feedback list for owner dashboard (auth) ---
      if (action === 'feedback-admin-list') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = Math.min(20, Math.max(1, parseInt(getParam(req, 'limit') || '20', 10)));
        const sort = normalizeFeedbackSort(getParam(req, 'sort'));
        const subject = String(getParam(req, 'subject') || '').trim().toLowerCase();
        const subSubject = String(getParam(req, 'subSubject') || '').trim().toLowerCase();

        const filter = {};
        if (subject) filter.subjectSlug = subject;
        if (subSubject) filter.subSubjectSlug = subSubject;

        const feedbackCol = db.collection('feedbacks');
        const [total, feedbacks] = await Promise.all([
          feedbackCol.countDocuments(filter),
          feedbackCol.find(filter).sort(getFeedbackSort(sort)).skip((page - 1) * limit).limit(limit).toArray(),
        ]);

        return json(res, 200, { ok: true, feedbacks, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- Comments: Get paginated comments ---
      if (action === 'comments') {
        const journalRef = getParam(req, 'journalId');
        if (!journalRef) return json(res, 400, { ok: false, message: 'journalId required' });
        const resolvedJournalId = await resolveJournalObjectId(col, journalRef, true);
        if (!resolvedJournalId) return json(res, 400, { ok: false, message: 'journalId invalid' });

        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const sort = getParam(req, 'sort') || 'top';
        const parentIdParam = getParam(req, 'parentId');
        const isReply = Boolean(parentIdParam && ObjectId.isValid(parentIdParam));

        const commentsCol = db.collection('comments');

        // Pinned comments (top-level only, always returned regardless of page)
        let pinnedComments = [];
        if (!isReply) {
          const pinnedFilter = await applyVisibleCommentUserFilter(db, {
            journalId: resolvedJournalId,
            parentId: null,
            isPinned: true,
            isDeleted: { $ne: true },
          });
          pinnedComments = await commentsCol.find(pinnedFilter).sort({ pinnedOrder: 1 }).toArray();
        }

        // Build filter for regular (non-pinned) comments
        const pinnedIds = pinnedComments.map(p => p._id);
        const baseFilter = {
          journalId: resolvedJournalId,
          parentId: isReply ? new ObjectId(parentIdParam) : null,
          isDeleted: { $ne: true },
        };
        if (!isReply && pinnedIds.length > 0) {
          baseFilter._id = { $nin: pinnedIds };
        }
        const filter = await applyVisibleCommentUserFilter(db, baseFilter);

        let sortObj;
        if (sort === 'new') sortObj = { createdAt: -1 };
        else if (sort === 'old') sortObj = { createdAt: 1 };
        else sortObj = { likes: -1, createdAt: -1 }; // top (default)

        const total = await commentsCol.countDocuments(await applyVisibleCommentUserFilter(db, {
          journalId: resolvedJournalId,
          parentId: isReply ? new ObjectId(parentIdParam) : null,
          isDeleted: { $ne: true },
        }));

        const comments = await commentsCol
          .find(filter)
          .sort(sortObj)
          .skip((page - 1) * limit)
          .limit(limit)
          .toArray();

        // Get reply counts for all returned comments
        const allCommentIds = [...pinnedIds, ...comments.map(c => c._id)];
        let replyCountMap = {};
        if (allCommentIds.length > 0) {
          const replyAgg = await commentsCol.aggregate([
            { $match: await applyVisibleCommentUserFilter(db, { parentId: { $in: allCommentIds }, isDeleted: { $ne: true } }) },
            { $group: { _id: '$parentId', count: { $sum: 1 } } },
          ]).toArray();
          replyAgg.forEach(r => { replyCountMap[r._id.toString()] = r.count; });
        }

        const addMeta = (c) => ({ ...c, replyCount: replyCountMap[c._id.toString()] || 0 });
        const pinnedWithMeta = pinnedComments.map(addMeta);
        const commentsWithMeta = comments.map(addMeta);
        const withVerified = await attachVerifiedFlagsToComments(db, [...pinnedWithMeta, ...commentsWithMeta]);
        const pinnedWithVerified = withVerified.slice(0, pinnedWithMeta.length);
        const commentsWithVerified = withVerified.slice(pinnedWithMeta.length);

        return json(res, 200, {
          ok: true,
          pinnedComments: pinnedWithVerified,
          comments: commentsWithVerified,
          pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
        });
      }

      // --- Comment Count for multiple journals ---
      if (action === 'comment-count') {
        const journalIdsParam = getParam(req, 'journalIds');
        if (!journalIdsParam) return json(res, 400, { ok: false, message: 'journalIds required' });
        const refs = journalIdsParam.split(',').map(s => s.trim()).filter(Boolean);
        const idsFromObjectIds = refs.filter(s => ObjectId.isValid(s)).map(s => new ObjectId(s));
        const slugRefs = refs.filter(s => !ObjectId.isValid(s));
        let idsFromSlugs = [];
        if (slugRefs.length > 0) {
          const slugDocs = await col.find({ slug: { $in: slugRefs }, published: true }, { projection: { _id: 1, slug: 1 } }).toArray();
          idsFromSlugs = slugDocs.map(d => d._id);
        }
        const ids = [...idsFromObjectIds, ...idsFromSlugs];
        if (!ids.length) return json(res, 200, { ok: true, counts: {} });
        const commentsCol = db.collection('comments');
        const visibleCountFilter = await applyVisibleCommentUserFilter(db, { journalId: { $in: ids }, isDeleted: { $ne: true } });
        const agg = await commentsCol.aggregate([
          { $match: visibleCountFilter },
          { $group: { _id: '$journalId', count: { $sum: 1 } } },
        ]).toArray();
        const counts = {};
        agg.forEach(a => { counts[a._id.toString()] = a.count; });
        if (slugRefs.length > 0) {
          const slugDocs = await col.find({ slug: { $in: slugRefs }, published: true }, { projection: { _id: 1, slug: 1 } }).toArray();
          slugDocs.forEach((d) => { counts[d.slug] = counts[d._id.toString()] || 0; });
        }
        return json(res, 200, { ok: true, counts });
      }

      // --- Top journals for home page ---
      if (action === 'top-journals') {
        const limitN = Math.min(20, Math.max(1, parseInt(getParam(req, 'limit') || '6', 10)));
        const topJournals = await col
          .find({ published: true })
          .sort({ likes: -1, views: -1, publishedAt: -1 })
          .limit(limitN)
          .toArray();
        return json(res, 200, { ok: true, journals: topJournals });
      }

      // --- Blacklist words (admin only) ---
      if (action === 'blacklist') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const blacklist = await db.collection('comment_blacklist').find({}).sort({ createdAt: -1 }).toArray();
        return json(res, 200, { ok: true, blacklist });
      }

      // --- Blocks: list all blocked users (admin only) ---
      if (action === 'blocks') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const blocksCol = db.collection('blocked_users');
        const total = await blocksCol.countDocuments({});
        const blocks = await blocksCol.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return json(res, 200, { ok: true, blocks, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- Users: list all unique commenters (admin only) ---
      // --- All users list (public, paginated) ---
      if (action === 'all-users') {
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 12;
        const usersCol = db.collection('users');
        const filter = await applyVisibleProfileUserFilter(db, PUBLIC_USER_FILTER);
        const total = await usersCol.countDocuments(filter);
        const users = await usersCol.find(filter).sort({ lastCommentAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        const hiddenCommentUsers = new Set(await getHiddenUserIdsByScope(db, 'comments'));
        return json(res, 200, { ok: true, users: users.map(u => ({ ...u, verified: Boolean(u.verified), totalComments: hiddenCommentUsers.has(String(u.userId || '')) ? 0 : Number(u.totalComments || 0) })), pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- User activity: per-day comment counts for contribution graph ---
      if (action === 'user-activity') {
        const userId = getParam(req, 'userId');
        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        const { state } = await getUserModerationState(db, userId);
        if (state.full || state.profile || state.comments) {
          return json(res, 200, { ok: true, activity: [] });
        }
        const actCol = db.collection('comments');
        const activity = await actCol.aggregate([
          { $match: { userId, isDeleted: { $ne: true } } },
          { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt', timezone: 'Asia/Kolkata' } } } },
          { $group: { _id: '$day', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]).toArray();
        return json(res, 200, { ok: true, activity: activity.map(a => ({ day: a._id, count: a.count })) });
      }

      // --- All users list (public, paginated) ---
      if (action === 'users') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const usersCol = db.collection('users');
        const commentsCol = db.collection('comments');
        const feedbackCol = db.collection('feedbacks');
        const filter = PUBLIC_USER_FILTER;
        const total = await usersCol.countDocuments(filter);
        const users = await usersCol.find(filter).sort({ lastCommentAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        const hydratedUsers = await Promise.all(users.map(async (u) => {
          let serviceKey = String(u?.serviceKey || '').trim();
          let email = String(u?.email || '').trim();
          if (!SERVICE_KEY_REGEX.test(serviceKey)) {
            serviceKey = generateServiceKey();
            await usersCol.updateOne(
              { _id: u._id },
              { $set: { serviceKey, serviceKeyUpdatedAt: new Date() } },
            );
          }
          if (!email) {
            const [recentComment, recentFeedback] = await Promise.all([
              commentsCol.findOne(
                { userId: String(u?.userId || '').trim() },
                { sort: { createdAt: -1 }, projection: { email: 1, userEmail: 1 } },
              ),
              feedbackCol.findOne(
                { userId: String(u?.userId || '').trim() },
                { sort: { createdAt: -1 }, projection: { email: 1, userEmail: 1 } },
              ),
            ]);
            email = String(
              recentComment?.email
              || recentComment?.userEmail
              || recentFeedback?.email
              || recentFeedback?.userEmail
              || '',
            ).trim();
            if (email) {
              await usersCol.updateOne({ _id: u._id }, { $set: { email } });
            }
          }
          return {
            ...u,
            email,
            serviceKey,
            verified: Boolean(u.verified),
          };
        }));
        return json(res, 200, { ok: true, users: hydratedUsers, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- Per-user active blocks (admin only) ---
      if (action === 'user-blocks') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const userId = getParam(req, 'userId');
        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        const blocksCol = db.collection('blocked_users');
        const now = new Date();
        // Return all active blocks: permanent all-blocks, still-valid temp blocks, and post-specific blocks
        const blocks = await blocksCol.find({
          userId,
          $or: [
            { blockType: { $in: ['all', 'post'] } },
            { blockType: 'temp', $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }] },
          ],
        }).sort({ createdAt: -1 }).toArray();
        return json(res, 200, { ok: true, blocks });
      }

      // --- Check if current user is blocked (public) ---
      if (action === 'check-block') {
        const userId = getParam(req, 'userId');
        const journalId = getParam(req, 'journalId');
        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        const { state } = await getUserModerationState(db, userId);
        if (state.full || state.comments) {
          return json(res, 200, {
            ok: true,
            blocked: true,
            message: buildModerationMessage('comments', state),
            blockType: 'moderation',
            expiresAt: state.entries.full?.until || state.entries.comments?.until || null,
          });
        }
        const block = await getActiveBlock(db, userId, journalId);
        if (!block) return json(res, 200, { ok: true, blocked: false, message: null, blockType: null, expiresAt: null });
        const msg = await buildBlockMessage(db, block);
        return json(res, 200, { ok: true, blocked: true, message: msg, blockType: block.blockType, expiresAt: block.expiresAt || null });
      }

      if (action === 'user-access') {
        const userId = getParam(req, 'userId');
        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        const { state } = await getUserModerationState(db, userId);
        return json(res, 200, {
          ok: true,
          access: {
            fullDeactivated: state.full,
            commentBlocked: state.comments,
            feedbackBlocked: state.feedback,
            profileHidden: state.profile,
            messages: {
              comments: state.comments ? buildModerationMessage('comments', state) : null,
              feedback: state.feedback ? buildModerationMessage('feedback', state) : null,
              profile: state.profile ? buildModerationMessage('profile', state) : null,
            },
          },
        });
      }

      // --- User comments: comments by a specific userId (admin only) ---
      if (action === 'user-comments') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const userId = getParam(req, 'userId');
        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const commentsCol = db.collection('comments');
        const total = await commentsCol.countDocuments({ userId, isDeleted: { $ne: true } });
        const comments = await commentsCol.find({ userId, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        // Attach journal title+slug for each comment
        const journalIds = [...new Set(comments.map(c => c.journalId?.toString()).filter(Boolean))].filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        let journalMap = {};
        if (journalIds.length) {
          const journals = await col.find({ _id: { $in: journalIds } }, { projection: { title: 1, slug: 1 } }).toArray();
          journals.forEach(j => { journalMap[j._id.toString()] = { _id: j._id, title: j.title, slug: j.slug }; });
        }
        const enriched = comments.map(c => ({ ...c, journalInfo: journalMap[c.journalId?.toString()] || null }));
        return json(res, 200, { ok: true, comments: enriched, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- Comment by ID: for permalink page (public) ---
      if (action === 'comment-by-id') {
        const commentId = getParam(req, 'id');
        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'id required' });
        const permalinkCommentsCol = db.collection('comments');
        const comment = await permalinkCommentsCol.findOne({ _id: new ObjectId(commentId) });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });
        const hiddenCommentUsers = new Set(await getHiddenUserIdsByScope(db, 'comments'));
        if (hiddenCommentUsers.has(String(comment.userId || ''))) return json(res, 404, { ok: false, message: 'Comment not found' });
        // Get the journal info
        const journal = await col.findOne({ _id: comment.journalId, published: true });
        if (!journal) return json(res, 404, { ok: false, message: 'Journal not found' });
        // Get replies if top-level comment
        let replies = [];
        if (!comment.parentId) {
          replies = await permalinkCommentsCol.find(await applyVisibleCommentUserFilter(db, { parentId: comment._id, isDeleted: { $ne: true } })).sort({ createdAt: 1 }).toArray();
        }
        // If it's a reply, get parent comment
        let parentComment = null;
        if (comment.parentId) {
          parentComment = await permalinkCommentsCol.findOne({ _id: comment.parentId });
        }
        const verifiedItems = await attachVerifiedFlagsToComments(db, [
          comment,
          ...replies,
          ...(parentComment ? [parentComment] : []),
        ]);
        const hydratedComment = verifiedItems[0] || comment;
        const hydratedReplies = verifiedItems.slice(1, 1 + replies.length);
        const hydratedParent = parentComment ? verifiedItems[1 + replies.length] : null;
        return json(res, 200, { ok: true, comment: hydratedComment, replies: hydratedReplies, parentComment: hydratedParent, journal: { _id: journal._id, title: journal.title, slug: journal.slug, summary: journal.summary, categoryName: journal.categoryName, publishedAtIST: journal.publishedAtIST, readMinutes: journal.readMinutes } });
      }

      // --- Admin: list comments for a journal with originalText, hasAbuse info ---
      if (action === 'comment-admin-list') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const journalId = getParam(req, 'journalId');
        if (!journalId || !ObjectId.isValid(journalId)) return json(res, 400, { ok: false, message: 'journalId required' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const adminCommentsCol = db.collection('comments');
        const total = await adminCommentsCol.countDocuments({ journalId: new ObjectId(journalId), parentId: null, isDeleted: { $ne: true } });
        const comments = await adminCommentsCol.find({ journalId: new ObjectId(journalId), parentId: null, isDeleted: { $ne: true } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        return json(res, 200, { ok: true, comments, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- Admin: list journals with comment counts for storage sub-tab ---
      if (action === 'journals-comment-stats') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const total = await col.countDocuments({});
        const journals = await col.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        const journalIds = journals.map(j => j._id);
        const commentsCol = db.collection('comments');
        const agg = await commentsCol.aggregate([
          { $match: { journalId: { $in: journalIds }, isDeleted: { $ne: true } } },
          { $group: { _id: '$journalId', count: { $sum: 1 }, abuseCount: { $sum: { $cond: ['$hasAbuse', 1, 0] } }, totalSize: { $sum: { $strLenCP: { $ifNull: ['$text', ''] } } } } },
        ]).toArray();
        const statsMap = {};
        agg.forEach(a => { statsMap[a._id.toString()] = { count: a.count, abuseCount: a.abuseCount, totalSize: a.totalSize }; });
        const enriched = journals.map(j => ({ _id: j._id, title: j.title, slug: j.slug, published: j.published, categoryName: j.categoryName, ...(statsMap[j._id.toString()] || { count: 0, abuseCount: 0, totalSize: 0 }) }));
        return json(res, 200, { ok: true, journals: enriched, pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) } });
      }

      // --- User profile (public) ---
      if (action === 'user-profile') {
        const userId = getParam(req, 'userId');
        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
        const limit = 10;
        const usersCol = db.collection('users');
        const userCommentsCol = db.collection('comments');

        // Special handling for owner
        if (userId === 'owner') {
          const ownerDoc = await usersCol.findOne({ userId: 'owner' });
          const total = await userCommentsCol.countDocuments({ userId: 'owner', isDeleted: { $ne: true } });
          const ownerComments = await userCommentsCol.find({ userId: 'owner', isDeleted: { $ne: true } }).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
          const journalIds = [...new Set(ownerComments.map(c => c.journalId?.toString()).filter(Boolean))].filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
          let journalMap = {};
          if (journalIds.length) {
            const journals = await col.find({ _id: { $in: journalIds }, published: true }, { projection: { title: 1, slug: 1 } }).toArray();
            journals.forEach(j => { journalMap[j._id.toString()] = { _id: j._id, title: j.title, slug: j.slug }; });
          }
          const enrichedComments = ownerComments.map(c => ({ ...c, originalText: undefined, journalInfo: journalMap[c.journalId?.toString()] || null }));
          const firstComment = total > 0 ? await userCommentsCol.findOne({ userId: 'owner', isDeleted: { $ne: true } }, { sort: { createdAt: 1 } }) : null;
          return json(res, 200, {
            ok: true,
            user: {
              userId: 'owner',
              userName: ownerDoc?.userName || 'Deep Dey',
              userPic: '',
              verified: true,
              firstCommentAt: firstComment?.createdAt || ownerDoc?.firstCommentAt || new Date().toISOString(),
              lastCommentAt: ownerDoc?.lastCommentAt,
              totalComments: total,
              profileTitle: ownerDoc?.profileTitle || 'Developer & Creator',
              bio: ownerDoc?.bio || '',
              description: ownerDoc?.description || '',
              socialLinks: ownerDoc?.socialLinks || [],
            },
            comments: enrichedComments,
            pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
          });
        }

        // Get user info from users collection (prefer) or fall back to first comment
        const userDoc = await usersCol.findOne({ userId });
        const moderationState = getUserModerationStateFromDoc(userDoc);
        if (moderationState.full || moderationState.profile) {
          if (!userDoc) return json(res, 404, { ok: false, message: 'User not found' });
          return json(res, 200, {
            ok: true,
            deactivated: true,
            user: {
              userId,
              userName: userDoc.userName,
              userPic: userDoc.userPic,
              verified: Boolean(userDoc.verified),
              firstCommentAt: userDoc.firstCommentAt || userDoc.createdAt || new Date().toISOString(),
              totalComments: 0,
              profileTitle: userDoc.profileTitle,
              bio: '',
              description: '',
              socialLinks: [],
              profileDeactivated: true,
              deactivationKind: moderationState.full ? 'full' : 'profile',
              deactivationMessage: buildModerationMessage(moderationState.full ? 'full' : 'profile', moderationState),
            },
            comments: [],
            pagination: { page, limit, total: 0, totalPages: 1 },
          });
        }
        const total = await userCommentsCol.countDocuments({ userId, isDeleted: { $ne: true } });
        if (total === 0 && !userDoc) return json(res, 404, { ok: false, message: 'User not found' });
        const visibleCommentFilter = moderationState.comments ? { userId, isDeleted: { $ne: true }, _id: { $in: [] } } : await applyVisibleCommentUserFilter(db, { userId, isDeleted: { $ne: true } });
        const totalVisibleComments = moderationState.comments ? 0 : await userCommentsCol.countDocuments(visibleCommentFilter);
        const comments = moderationState.comments
          ? []
          : await userCommentsCol.find(visibleCommentFilter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).toArray();
        const journalIds = [...new Set(comments.map(c => c.journalId?.toString()).filter(Boolean))].filter(id => ObjectId.isValid(id)).map(id => new ObjectId(id));
        let journalMap = {};
        if (journalIds.length) {
          const journals = await col.find({ _id: { $in: journalIds }, published: true }, { projection: { title: 1, slug: 1 } }).toArray();
          journals.forEach(j => { journalMap[j._id.toString()] = { _id: j._id, title: j.title, slug: j.slug }; });
        }
        const enrichedComments = comments.map(c => ({ ...c, originalText: undefined, journalInfo: journalMap[c.journalId?.toString()] || null }));
        const lastComment = comments.length > 0 ? comments[comments.length - 1] : null;
        const userFallback = lastComment ? { userId, userName: lastComment.userName, userPic: lastComment.userPic, firstCommentAt: lastComment.createdAt, totalComments: totalVisibleComments } : null;
        const profile = userDoc || userFallback;
        const isVerified = Boolean(userDoc?.verified);
        return json(res, 200, { ok: true, user: { userId, userName: profile?.userName, userPic: profile?.userPic, verified: isVerified, firstCommentAt: profile?.firstCommentAt || profile?.createdAt, totalComments: totalVisibleComments, profileTitle: userDoc?.profileTitle, bio: userDoc?.bio, description: userDoc?.description, socialLinks: userDoc?.socialLinks }, comments: enrichedComments.map(c => ({ ...c, isVerified })), pagination: { page, limit, total: totalVisibleComments, totalPages: Math.max(1, Math.ceil(totalVisibleComments / limit)) } });
      }

      const slug = getParam(req, 'slug');
      const id = getParam(req, 'id');

      // --- EXISTING: Journal Fetch Logic ---
      const wantsSingle = Boolean(getParam(req, 'slug') || getParam(req, 'id'));
      if (wantsSingle) {
        const entry = await getJournalByIdOrSlug(col, req);
        if (!entry) return json(res, 404, { ok: false, message: 'Not found' });

        const shouldCountView = getParam(req, 'countView') === 'true' || getParam(req, 'countView') === '1';
        let journal = entry;
        if (shouldCountView && entry._id) {
          await col.updateOne({ _id: entry._id }, { $inc: { views: 1 } });
          journal = { ...entry, views: Number(entry.views || 0) + 1 };
        }

        return json(res, 200, { ok: true, journal });
      }

      const page = Math.max(1, parseInt(getParam(req, 'page') || '1', 10));
      const limit = Math.min(20, Math.max(1, parseInt(getParam(req, 'limit') || '20', 10)));
      const onlyPublished = !isAuthenticated(req);

      const filter = {};
      if (onlyPublished) filter.published = true;

      const categoriesParam = getParam(req, 'categories');
      const singleCategoryParam = getParam(req, 'category');

      if (categoriesParam) {
        const cats = categoriesParam.split(',').map(c => c.trim()).filter(Boolean);
        if (cats.length > 0) {
          filter.categorySlug = { $in: cats };
        }
      } else if (singleCategoryParam) {
        filter.categorySlug = singleCategoryParam;
      }

      const sortParam = getParam(req, 'sort') || 'recent';
      let sortObj = { publishedAt: -1, createdAt: -1 };

      if (sortParam === 'old') {
        sortObj = { publishedAt: 1, createdAt: 1 };
      } else if (sortParam === 'most-liked') {
        sortObj = { likes: -1, publishedAt: -1 };
      } else if (sortParam === 'most-viewed') {
        sortObj = { views: -1, publishedAt: -1 };
      } else if (sortParam === 'relevant') {
        sortObj = { publishedAt: -1, createdAt: -1 };
      }

      const total = await col.countDocuments(filter);
      let journals = await col
        .find(filter)
        .sort(sortObj)
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray();

      if (sortParam === 'relevant') {
        journals = journals.sort(() => 0.5 - Math.random());
      }

      return json(res, 200, {
        ok: true,
        journals,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      });
    }

    // ==========================================
    // POST REQUESTS
    // ==========================================
    if (req.method === 'POST') {
      const action = getParam(req, 'action');

      if (action === 'status-monitor-config') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const mode = normalizeStatusMonitorMode(body.mode);
        const configCol = db.collection('config');
        const updatedAt = new Date();
        const updateDoc = {
          mode,
          updatedAt,
          updatedAtIST: nowIST(),
        };
        await configCol.updateOne(
          { _id: STATUS_MONITOR_CONFIG_ID },
          { $set: updateDoc, $setOnInsert: { createdAt: updatedAt } },
          { upsert: true },
        );
        return json(res, 200, { ok: true, ...updateDoc, availableModes: STATUS_MONITOR_MODES });
      }

      // --- Manual Refresh: Rate-limited health snapshot (public) ---
      if (action === 'refresh') {
        const clientIp = getClientIp(req);
        const rlCol = db.collection('refresh_rate_limits');
        const windowStart = new Date(Date.now() - 60_000);

        // Cleanup records older than 2 minutes (fire-and-forget)
        rlCol.deleteMany({ createdAt: { $lt: new Date(Date.now() - 120_000) } }).catch(() => {});

        const [globalCount, ipCount] = await Promise.all([
          rlCol.countDocuments({ createdAt: { $gte: windowStart } }),
          rlCol.countDocuments({ ip: clientIp, createdAt: { $gte: windowStart } }),
        ]);

        if (globalCount >= 20) {
          return json(res, 429, { ok: false, message: 'Global rate limit reached (20/min). Try again shortly.', globalUsed: globalCount, globalLimit: 20, ipUsed: ipCount, ipLimit: 2 });
        }
        if (ipCount >= 2) {
          return json(res, 429, { ok: false, message: 'Rate limited: max 2 manual refreshes per minute per IP.', globalUsed: globalCount, globalLimit: 20, ipUsed: ipCount, ipLimit: 2 });
        }

        // Record this refresh
        await rlCol.insertOne({ ip: clientIp, createdAt: new Date() });

        // Collect health data
        const os = require('os');
        const dbPingStart = Date.now();
        try { await db.command({ ping: 1 }); } catch { /* ignore */ }
        const dbPingMs = Date.now() - dbPingStart;
        const mem = process.memoryUsage();
        const cpus = os.cpus();

        let diskInfo = null;
        try {
          const fsModule = require('fs');
          if (typeof fsModule.statfsSync === 'function') {
            const st = fsModule.statfsSync('/tmp');
            diskInfo = { total: st.blocks * st.bsize, free: st.bfree * st.bsize, available: st.bavail * st.bsize };
          }
        } catch { /* ignore */ }

        const healthData = {
          timestamp: Date.now(),
          uptime: process.uptime(),
          nodeVersion: process.version,
          platform: os.platform(),
          arch: os.arch(),
          osType: os.type(),
          osRelease: os.release(),
          hostname: os.hostname(),
          serverRegion: process.env.VERCEL_REGION || process.env.AWS_REGION || process.env.FLY_REGION || '—',
          totalMemory: os.totalmem(),
          freeMemory: os.freemem(),
          cpus: cpus.map((c) => ({ model: c.model, speedMHz: c.speed, times: c.times })),
          cpuCount: cpus.length,
          processMemory: { rss: mem.rss, heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, external: mem.external },
          dbPingMs,
          loadAverage: os.loadavg(),
          diskInfo,
        };

        // Save health snapshot to DB
        const snapshotsCol = db.collection('health_snapshots');
        await snapshotsCol.insertOne({ ...healthData, ip: clientIp, createdAtIST: nowIST() });

        return json(res, 200, {
          ok: true,
          ...healthData,
          globalUsed: globalCount + 1,
          globalLimit: 20,
          ipUsed: ipCount + 1,
          ipLimit: 2,
        });
      }

      // --- NAYA: Live Status Update Logic (Admin Only) ---
      if (action === 'status') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);

        const isVisible = body.isVisible !== undefined ? Boolean(body.isVisible) : true;
        const message = String(body.message || '').trim();
        const hexColor = String(body.hexColor || '#22c55e').trim(); // Exact Hex code
        const icon = String(body.icon || 'Activity').trim(); // Lucide icon name
        const actionUrl = String(body.actionUrl || '').trim(); // Custom Link
        const glow = Boolean(body.glow);
        const freeBy = String(body.freeBy || '').trim();

        // Agar visible hai toh message zaroori hai
        if (isVisible && !message) return json(res, 400, { ok: false, message: 'Message is required' });

        const statusCol = db.collection('live_status');
        const now = new Date();
        const doc = {
          isVisible,
          message,
          hexColor,
          icon,
          actionUrl,
          glow,
          freeBy,
          createdAt: now,
          createdAtIST: nowIST()
        };

        // Old records ko delete NAHI karna hai, bas naya append karna hai
        const result = await statusCol.insertOne(doc);
        return json(res, 201, { ok: true, status: { ...doc, _id: result.insertedId } });
      }

      // --- EXISTING: Like Logic ---
      if (action === 'like') {
        const id = getParam(req, 'id');
        const session = String(getParam(req, 'session') || '').trim();
        if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'Valid id required' });
        if (!session) return json(res, 400, { ok: false, message: 'session required' });

        const existing = await col.findOne({ _id: new ObjectId(id), published: true });
        if (!existing) return json(res, 404, { ok: false, message: 'Not found' });

        const likedSessions = Array.isArray(existing.likedSessions) ? existing.likedSessions : [];
        if (likedSessions.includes(session)) {
          return json(res, 200, { ok: true, alreadyLiked: true, likes: Number(existing.likes || 0) });
        }

        const nextSessions = [...likedSessions, session].slice(-5000);
        await col.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 }, $set: { likedSessions: nextSessions } },
        );

        return json(res, 200, { ok: true, likes: Number(existing.likes || 0) + 1, alreadyLiked: false });
      }

      // --- Feedback add (public with Google token OR owner cookie) ---
      if (action === 'feedback') {
        const body = await readBody(req);
        const credential = String(body.credential || '').trim();
        const ownerPosting = isAuthenticated(req);
        const clientIp = getClientIp(req);

        let userInfo = null;
        if (ownerPosting) {
          userInfo = {
            userId: 'owner',
            name: 'Deep Dey',
            picture: '/assets/images/myphoto.png',
            email: '',
          };
        } else {
          userInfo = await verifyGoogleToken(credential);
          if (!userInfo) return json(res, 401, { ok: false, message: 'Authentication required' });
          const { state } = await getUserModerationState(db, userInfo.userId);
          if (state.full || state.feedback) {
            return json(res, 403, { ok: false, message: buildModerationMessage('feedback', state) });
          }
        }

        const subjectSlug = slugify(String(body.subject || body.subjectSlug || ''));
        const subSubjectSlug = slugify(String(body.subSubject || body.subSubjectSlug || ''));
        const title = String(body.title || '').trim().slice(0, 160);
        const text = String(body.text || '').trim().slice(0, 3000);
        const rating = normalizeFeedbackRating(body.rating);

        if (!subjectSlug) return json(res, 400, { ok: false, message: 'Subject required' });
        if (!subSubjectSlug) return json(res, 400, { ok: false, message: 'Sub-subject required' });
        if (!title) return json(res, 400, { ok: false, message: 'Subject line required' });
        if (!text) return json(res, 400, { ok: false, message: 'Feedback text required' });
        if (text.length < MIN_COMMUNITY_TEXT_LENGTH) return json(res, 400, { ok: false, message: `Feedback must be at least ${MIN_COMMUNITY_TEXT_LENGTH} characters.` });
        if (!rating) return json(res, 400, { ok: false, message: 'Rating required' });
        const feedbackCooldown = checkCommunityCooldown(clientIp, 'feedback');
        if (feedbackCooldown.limited) {
          return json(res, 429, { ok: false, message: `Feedback cooldown active. Please wait ${feedbackCooldown.retryAfterSec} second(s).`, retryAfterSec: feedbackCooldown.retryAfterSec, scope: 'feedback' });
        }

        const feedbackCategories = await getFeedbackCategoriesMap(db);
        const subjectInfo = feedbackCategories.get(subjectSlug);
        if (!subjectInfo) return json(res, 400, { ok: false, message: 'Invalid subject' });
        const validSubSubjectName = subjectInfo.sub.get(subSubjectSlug);
        if (!validSubSubjectName) return json(res, 400, { ok: false, message: 'Invalid sub-subject' });

        const feedbackCol = db.collection('feedbacks');
        const exists = await feedbackCol.findOne({ userId: userInfo.userId, subjectSlug, subSubjectSlug });
        if (exists) {
          return json(res, 409, { ok: false, message: 'You can submit only one feedback for this subject and sub-subject.' });
        }

        const { text: censoredText, hasAbuse } = await censorTextWithFlag(db, text);
        const now = new Date();

        const doc = {
          userId: userInfo.userId,
          userName: userInfo.name,
          userPic: userInfo.picture,
          isOwner: ownerPosting,
          subject: subjectInfo.subject,
          subjectSlug,
          subSubject: validSubSubjectName,
          subSubjectSlug,
          title,
          text: censoredText,
          originalText: hasAbuse ? text : null,
          hasAbuse,
          rating,
          isPinned: false,
          reactionSummary: { likes: 0, dislikes: 0, total: 0 },
          reactionSessions: {},
          createdAt: now,
          updatedAt: now,
        };

        const result = await feedbackCol.insertOne(doc);
        startCommunityCooldown(clientIp, 'feedback');

        if (!ownerPosting) {
          try {
            const clientIp = getClientIp(req);
            const clientCountry = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '').toString().trim();
            await db.collection('users').updateOne(
              { userId: userInfo.userId },
              {
                $set: {
                  userName: userInfo.name,
                  userPic: userInfo.picture,
                  email: userInfo.email || '',
                  lastCommentAt: now,
                  lastActivityIp: clientIp,
                  lastActivityCountry: clientCountry,
                },
                $setOnInsert: {
                  userId: userInfo.userId,
                  firstCommentAt: now,
                  createdAt: now,
                  verified: false,
                  serviceKey: generateServiceKey(),
                  registrationIp: clientIp,
                  registrationCountry: clientCountry,
                },
              },
              { upsert: true },
            );
          } catch { /* ignore */ }
        }

        return json(res, 201, { ok: true, feedback: { ...doc, _id: result.insertedId } });
      }

      // --- Feedback reaction: like/dislike by session ---
      if (action === 'feedback-reaction') {
        const body = await readBody(req);
        const feedbackId = String(body.feedbackId || body.id || '').trim();
        const session = String(body.session || '').trim();
        const reaction = normalizeFeedbackReaction(body.reaction);
        const isClear = body.clear === true || reaction === null;
        if (!feedbackId || !ObjectId.isValid(feedbackId)) return json(res, 400, { ok: false, message: 'feedbackId required' });
        if (!/^[a-zA-Z0-9_-]{6,120}$/.test(session)) return json(res, 400, { ok: false, message: 'Valid session required' });

        const feedbackCol = db.collection('feedbacks');
        const existing = await feedbackCol.findOne({ _id: new ObjectId(feedbackId) });
        if (!existing) return json(res, 404, { ok: false, message: 'Feedback not found' });

        const existingSessions = getFeedbackReactionSessions(existing.reactionSessions);
        const previousReaction = normalizeFeedbackReaction(existingSessions[session]);

        if (isClear) {
          delete existingSessions[session];
        } else {
          existingSessions[session] = reaction;
        }

        // Keep a bounded reaction-session map so one feedback document cannot grow unbounded over time.
        const entries = Object.entries(existingSessions).slice(-5000);
        const nextSessions = Object.fromEntries(entries);
        let likes = 0;
        let dislikes = 0;
        for (const value of Object.values(nextSessions)) {
          if (value === 'like') likes += 1;
          if (value === 'dislike') dislikes += 1;
        }
        const reactionSummary = { likes, dislikes, total: likes + dislikes };

        await feedbackCol.updateOne(
          { _id: new ObjectId(feedbackId) },
          { $set: { reactionSessions: nextSessions, reactionSummary, updatedAt: new Date() } },
        );

        return json(res, 200, {
          ok: true,
          feedbackId,
          previousReaction: previousReaction || null,
          viewerReaction: normalizeFeedbackReaction(nextSessions[session]),
          reactionSummary,
          reactionTotal: reactionSummary.total,
        });
      }

      // --- Feedback pin/unpin (admin only, unlimited) ---
      if (action === 'feedback-pin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const feedbackId = String(body.feedbackId || '').trim();
        const pin = body.pin !== false;
        if (!feedbackId || !ObjectId.isValid(feedbackId)) return json(res, 400, { ok: false, message: 'feedbackId required' });

        const result = await db.collection('feedbacks').updateOne(
          { _id: new ObjectId(feedbackId) },
          { $set: { isPinned: pin, updatedAt: new Date() } },
        );

        if (!result.matchedCount) return json(res, 404, { ok: false, message: 'Feedback not found' });
        return json(res, 200, { ok: true });
      }

      // --- Comment: Add new comment (Google user or owner) ---
      if (action === 'comment') {
        const body = await readBody(req);
        const credential = String(body.credential || '').trim();
        const ownerPosting = isAuthenticated(req);
        const clientIp = getClientIp(req);

        let userInfo;
        let isVerifiedUser = false;
        if (ownerPosting) {
          userInfo = { userId: 'owner', name: 'Deep Dey (Owner)', email: '', picture: '' };
          isVerifiedUser = true;
        } else {
          userInfo = await verifyGoogleToken(credential);
          if (!userInfo) return json(res, 401, { ok: false, message: 'Invalid or expired Google token. Please sign in again.' });
          const existingUser = await db.collection('users').findOne({ userId: userInfo.userId }, { projection: { verified: 1 } });
          isVerifiedUser = Boolean(existingUser?.verified);
          const { state } = await getUserModerationState(db, userInfo.userId);
          if (state.full || state.comments) {
            return json(res, 403, { ok: false, message: buildModerationMessage('comments', state) });
          }
        }

        const journalRef = String(body.journalId || '').trim();
        if (!journalRef) return json(res, 400, { ok: false, message: 'journalId required' });
        const resolvedJournalId = await resolveJournalObjectId(col, journalRef, true);
        if (!resolvedJournalId) return json(res, 404, { ok: false, message: 'Journal not found' });

        const text = String(body.text || '').trim();
        if (!text) return json(res, 400, { ok: false, message: 'Comment text is required' });
        const isKlipyMediaComment = isKlipyMediaCommentText(text);
        if (!isKlipyMediaComment && text.length < MIN_COMMUNITY_TEXT_LENGTH) return json(res, 400, { ok: false, message: `Comment must be at least ${MIN_COMMUNITY_TEXT_LENGTH} characters.` });
        if (text.length > 2000) return json(res, 400, { ok: false, message: 'Comment too long (max 2000 chars)' });

        const parentIdParam = body.parentId ? String(body.parentId) : null;
        const parentId = parentIdParam && ObjectId.isValid(parentIdParam) ? new ObjectId(parentIdParam) : null;
        const cooldownScope = parentId ? 'reply' : 'comment';
        const commentCooldown = checkCommunityCooldown(clientIp, cooldownScope);
        if (commentCooldown.limited) {
          return json(res, 429, { ok: false, message: `${cooldownScope === 'reply' ? 'Reply' : 'Comment'} cooldown active. Please wait ${commentCooldown.retryAfterSec} second(s).`, retryAfterSec: commentCooldown.retryAfterSec, scope: cooldownScope });
        }

        const journalExists = await col.findOne({ _id: resolvedJournalId, published: true });
        if (!journalExists) return json(res, 404, { ok: false, message: 'Journal not found' });

        // Check if user is blocked
        if (!ownerPosting) {
          const block = await getActiveBlock(db, userInfo.userId, resolvedJournalId.toString());
          if (block) {
            const msg = await buildBlockMessage(db, block);
            return json(res, 403, { ok: false, message: msg });
          }
        }

        const { text: censoredText, hasAbuse } = await censorTextWithFlag(db, text);
        const now = new Date();
        const commentDoc = {
          journalId: resolvedJournalId,
          userId: userInfo.userId,
          userName: userInfo.name,
          userPic: userInfo.picture,
          isVerified: isVerifiedUser,
          text: censoredText,
          originalText: hasAbuse ? text : null, // only stored if abuse detected
          hasAbuse,
          likes: 0,
          likedSessions: [],
          parentId,
          isPinned: false,
          pinnedOrder: 0,
          isDeleted: false,
          editedAt: null,
          createdAt: now,
          createdAtIST: nowIST(),
        };

        const result = await db.collection('comments').insertOne(commentDoc);
        startCommunityCooldown(clientIp, cooldownScope);

        // Upsert user profile record (so Users tab works without manual sync)
        if (!ownerPosting) {
          try {
            const clientIp = getClientIp(req);
            const clientCountry = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '').toString().trim();
            await db.collection('users').updateOne(
              { userId: userInfo.userId },
              {
                $set: {
                  userName: userInfo.name,
                  userPic: userInfo.picture,
                  email: userInfo.email || '',
                  lastCommentAt: now,
                  lastJournalId: resolvedJournalId,
                  lastActivityIp: clientIp,
                  lastActivityCountry: clientCountry,
                },
                $setOnInsert: {
                  userId: userInfo.userId,
                  firstCommentAt: now,
                  createdAt: now,
                  verified: false,
                  serviceKey: generateServiceKey(),
                  registrationIp: clientIp,
                  registrationCountry: clientCountry,
                },
                $inc: { totalComments: 1 },
              },
              { upsert: true },
            );
          } catch { /* non-critical, ignore */ }
        }

        return json(res, 201, { ok: true, comment: { ...commentDoc, _id: result.insertedId, replyCount: 0 } });
      }

      // --- Private user identity payload (email + service key) ---
      if (action === 'user-private') {
        const body = await readBody(req);
        const ownerRequest = isAuthenticated(req);
        const requestedUserId = String(body.userId || '').trim();
        const credential = String(body.credential || '').trim();

        let tokenUser = null;
        let targetUserId = '';
        if (ownerRequest) {
          targetUserId = requestedUserId;
        } else {
          if (!credential) return json(res, 401, { ok: false, message: 'Authentication required' });
          tokenUser = await verifyGoogleToken(credential);
          if (!tokenUser) return json(res, 401, { ok: false, message: 'Invalid or expired Google token' });
          targetUserId = tokenUser.userId;
          if (requestedUserId && requestedUserId !== targetUserId) {
            return json(res, 403, { ok: false, message: 'Not allowed to access this user' });
          }
        }

        if (!targetUserId) return json(res, 400, { ok: false, message: 'userId required' });
        if (targetUserId === 'owner') return json(res, 200, { ok: true, user: { userId: 'owner', email: '', serviceKey: '' } });

        const usersCol = db.collection('users');
        const now = new Date();
        const clientIp = getClientIp(req);
        const clientCountry = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '').toString().trim();

        let userDoc = await usersCol.findOne({ userId: targetUserId });
        if (!userDoc && tokenUser) {
          const seededDoc = {
            userId: targetUserId,
            userName: tokenUser.name,
            userPic: tokenUser.picture,
            email: tokenUser.email || '',
            firstCommentAt: now,
            lastCommentAt: now,
            totalComments: 0,
            createdAt: now,
            verified: false,
            serviceKey: generateServiceKey(),
            registrationIp: clientIp,
            registrationCountry: clientCountry,
            lastActivityIp: clientIp,
            lastActivityCountry: clientCountry,
          };
          await usersCol.insertOne(seededDoc);
          userDoc = seededDoc;
        }

        if (!userDoc) return json(res, 404, { ok: false, message: 'User not found' });

        let serviceKey = String(userDoc.serviceKey || '').trim();
        if (!SERVICE_KEY_REGEX.test(serviceKey)) {
          serviceKey = generateServiceKey();
          await usersCol.updateOne(
            { userId: targetUserId },
            { $set: { serviceKey, serviceKeyUpdatedAt: now } },
          );
        }

        const nextEmail = tokenUser?.email || String(userDoc.email || '');
        if (!ownerRequest && tokenUser?.email && tokenUser.email !== userDoc.email) {
          await usersCol.updateOne({ userId: targetUserId }, { $set: { email: tokenUser.email } });
        }

        return json(res, 200, {
          ok: true,
          user: {
            userId: targetUserId,
            email: nextEmail,
            serviceKey,
          },
        });
      }

      // --- Comment Like (session-based, same as journal like) ---
      if (action === 'comment-like') {
        const commentId = getParam(req, 'id');
        const session = String(getParam(req, 'session') || '').trim();
        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'Valid id required' });
        if (!session) return json(res, 400, { ok: false, message: 'session required' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        const likedSessions = Array.isArray(comment.likedSessions) ? comment.likedSessions : [];
        if (likedSessions.includes(session)) {
          return json(res, 200, { ok: true, alreadyLiked: true, likes: Number(comment.likes || 0) });
        }

        const nextSessions = [...likedSessions, session].slice(-5000);
        await commentsCol.updateOne(
          { _id: new ObjectId(commentId) },
          { $inc: { likes: 1 }, $set: { likedSessions: nextSessions } },
        );
        return json(res, 200, { ok: true, likes: Number(comment.likes || 0) + 1, alreadyLiked: false });
      }

      // --- Comment Pin/Unpin (admin only, max 3 per journal) ---
      if (action === 'comment-pin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const commentId = String(body.commentId || '').trim();
        const pin = body.pin !== false; // default true

        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'commentId required' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        if (pin) {
          const pinnedCount = await commentsCol.countDocuments({
            journalId: comment.journalId,
            parentId: null,
            isPinned: true,
            isDeleted: { $ne: true },
          });
          if (pinnedCount >= 3) return json(res, 400, { ok: false, message: 'Max 3 pinned comments per post' });
          await commentsCol.updateOne(
            { _id: new ObjectId(commentId) },
            { $set: { isPinned: true, pinnedOrder: pinnedCount + 1 } },
          );
        } else {
          await commentsCol.updateOne(
            { _id: new ObjectId(commentId) },
            { $set: { isPinned: false, pinnedOrder: 0 } },
          );
        }
        return json(res, 200, { ok: true });
      }

      // --- Blacklist: Add word (admin only) ---
      if (action === 'blacklist') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const word = String(body.word || '').trim().toLowerCase();
        if (!word) return json(res, 400, { ok: false, message: 'word required' });
        const blCol = db.collection('comment_blacklist');
        const exists = await blCol.findOne({ word });
        if (exists) return json(res, 200, { ok: true, message: 'Word already in blacklist', item: exists });
        const result = await blCol.insertOne({ word, createdAt: new Date(), createdAtIST: nowIST() });
        return json(res, 201, { ok: true, item: { _id: result.insertedId, word } });
      }

      // --- Block: block a user (admin only) ---
      if (action === 'block') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const body = await readBody(req);
        const userId = String(body.userId || '').trim();
        const userName = String(body.userName || '').trim();
        const userPic = String(body.userPic || '').trim();
        const blockType = String(body.blockType || 'all').trim(); // 'all' | 'post' | 'temp'
        const journalId = body.journalId && ObjectId.isValid(String(body.journalId)) ? new ObjectId(String(body.journalId)) : null;
        const reason = String(body.reason || '').trim();

        if (!userId) return json(res, 400, { ok: false, message: 'userId required' });
        if (userId === 'owner') return json(res, 400, { ok: false, message: 'Owner cannot be blocked' });
        if (!['all', 'post', 'temp'].includes(blockType)) return json(res, 400, { ok: false, message: 'Invalid blockType' });
        if (blockType === 'post' && !journalId) return json(res, 400, { ok: false, message: 'journalId required for post block' });

        let expiresAt = null;
        if (blockType === 'temp') {
          const hours = parseFloat(body.hours || '0') || 0;
          const minutes = parseFloat(body.minutes || '0') || 0;
          const days = parseFloat(body.days || '0') || 0;
          const ms = (days * 86400 + hours * 3600 + minutes * 60) * 1000;
          if (ms <= 0) return json(res, 400, { ok: false, message: 'Duration required for temp block' });
          expiresAt = new Date(Date.now() + ms);
        }

        const blocksCol = db.collection('blocked_users');
        if (blockType === 'post' && journalId) {
          await blocksCol.deleteMany({ userId, blockType: 'post', journalId });
        } else {
          await blocksCol.deleteMany({ userId, blockType: { $in: ['all', 'temp'] } });
        }
        const doc = { userId, userName, userPic, blockType, journalId, reason, expiresAt, createdAt: new Date(), createdAtIST: nowIST() };
        const result = await blocksCol.insertOne(doc);
        return json(res, 201, { ok: true, block: { ...doc, _id: result.insertedId } });
      }

      // --- EXISTING: Journal Creation Logic ---
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      const body = await readBody(req);
      const title = String(body.title || '').trim();
      const summary = String(body.summary || '').trim();
      const content = String(body.content || '').trim();
      const categorySlug = String(body.categorySlug || '').trim();
      const categoryName = String(body.categoryName || '').trim();
      const contentType = String(body.contentType || 'richtext').trim();
      const publish = Boolean(body.publish);
      const images = normalizeImages(body.images);

      if (!title) return json(res, 400, { ok: false, message: 'Title is required' });
      if (!content) return json(res, 400, { ok: false, message: 'Content is required' });

      const slug = slugify(title);
      const now = new Date();
      const doc = {
        title, slug, summary, content, contentType, categorySlug, categoryName, images,
        published: publish,
        publishedAt: publish ? now : null,
        publishedAtIST: publish ? nowIST() : null,
        createdAt: now, updatedAt: now,
        readMinutes: estimateReadMinutes(content),
        views: 0, likes: 0, likedSessions: [],
      };

      const result = await col.insertOne(doc);
      return json(res, 201, { ok: true, journal: { ...doc, _id: result.insertedId } });
    }

    // ==========================================
    // PUT & DELETE (Journal + Comments)
    // ==========================================
    if (req.method === 'PUT') {
      const action = getParam(req, 'action');
      const body = await readBody(req);



      // --- Feedback admin update (owner only) ---
      if (action === 'feedback-admin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

        const feedbackId = String(body.feedbackId || body._id || '').trim();
        if (!feedbackId || !ObjectId.isValid(feedbackId)) return json(res, 400, { ok: false, message: 'feedbackId required' });

        const feedbackCol = db.collection('feedbacks');
        const existingFeedback = await feedbackCol.findOne({ _id: new ObjectId(feedbackId) });
        if (!existingFeedback) return json(res, 404, { ok: false, message: 'Feedback not found' });

        const nextSubjectSlug = slugify(body.subject || body.subjectSlug || existingFeedback.subjectSlug || '');
        const nextSubSubjectSlug = slugify(body.subSubject || body.subSubjectSlug || existingFeedback.subSubjectSlug || '');
        const nextTitle = body.title !== undefined ? String(body.title || '').trim().slice(0, 160) : existingFeedback.title;
        const rawText = (body.text !== undefined
          ? String(body.text || '')
          : (existingFeedback.hasAbuse && existingFeedback.originalText
              ? String(existingFeedback.originalText || '')
              : String(existingFeedback.text || ''))).trim().slice(0, 3000);
        const nextRating = body.rating !== undefined ? normalizeFeedbackRating(body.rating) : Number(existingFeedback.rating || 0);
        const nextPinned = body.isPinned !== undefined ? Boolean(body.isPinned) : Boolean(existingFeedback.isPinned);

        if (!nextSubjectSlug) return json(res, 400, { ok: false, message: 'Subject required' });
        if (!nextSubSubjectSlug) return json(res, 400, { ok: false, message: 'Sub-subject required' });
        if (!nextTitle) return json(res, 400, { ok: false, message: 'Subject line required' });
        if (!rawText) return json(res, 400, { ok: false, message: 'Feedback text required' });
        if (!nextRating) return json(res, 400, { ok: false, message: 'Rating required' });

        const feedbackCategories = await getFeedbackCategoriesMap(db);
        const subjectInfo = feedbackCategories.get(nextSubjectSlug);
        if (!subjectInfo) return json(res, 400, { ok: false, message: 'Invalid subject' });
        const subName = subjectInfo.sub.get(nextSubSubjectSlug);
        if (!subName) return json(res, 400, { ok: false, message: 'Invalid sub-subject' });

        const { text: censoredText, hasAbuse: nextHasAbuse } = await censorTextWithFlag(db, rawText);

        await feedbackCol.updateOne(
          { _id: new ObjectId(feedbackId) },
          {
            $set: {
              subject: subjectInfo.subject,
              subjectSlug: nextSubjectSlug,
              subSubject: subName,
              subSubjectSlug: nextSubSubjectSlug,
              title: nextTitle,
              text: censoredText,
              originalText: nextHasAbuse ? rawText : null,
              hasAbuse: nextHasAbuse,
              rating: nextRating,
              isPinned: nextPinned,
              updatedAt: new Date(),
              moderatedAt: new Date(),
            },
          },
        );

        const updated = await feedbackCol.findOne({ _id: new ObjectId(feedbackId) });
        return json(res, 200, { ok: true, feedback: updated });
      }

      // --- User profile update (self, authenticated via Google token or owner session) ---
      if (action === 'user-profile-update') {
        const credential = String(body.credential || '').trim();
        const ownerUpdating = isAuthenticated(req);

        let targetUserId;
        if (ownerUpdating) {
          targetUserId = 'owner';
        } else {
          if (!credential) return json(res, 401, { ok: false, message: 'Authentication required' });
          const tokenUser = await verifyGoogleToken(credential);
          if (!tokenUser) return json(res, 401, { ok: false, message: 'Invalid or expired Google token' });
          targetUserId = tokenUser.userId;
          const { state } = await getUserModerationState(db, targetUserId);
          if (state.full) return json(res, 403, { ok: false, message: buildModerationMessage('full', state) });
        }

        const profileTitle = String(body.profileTitle || '').trim().slice(0, 80);
        const bio = String(body.bio || '').trim().slice(0, 500);
        const profileDescription = String(body.description || '').trim().slice(0, 200);
        const socialLinks = Array.isArray(body.socialLinks)
          ? body.socialLinks.slice(0, 10).map(l => ({
              platform: String(l.platform || 'custom').trim().slice(0, 30),
              url: String(l.url || '').trim().slice(0, 300),
              label: String(l.label || '').trim().slice(0, 50),
            })).filter(l => l.url)
          : [];

        const upUsersCol = db.collection('users');
        await upUsersCol.updateOne(
          { userId: targetUserId },
          { $set: { profileTitle, bio, description: profileDescription, socialLinks, profileUpdatedAt: new Date() } },
          { upsert: true },
        );
        return json(res, 200, { ok: true, message: 'Profile updated' });
      }

      if (action === 'user-moderation') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const userId = String(body.userId || '').trim();
        const operation = String(body.operation || '').trim();
        const scope = String(body.scope || '').trim();
        const reason = String(body.reason || '').trim().slice(0, 300);
        const confirmPassword = String(body.confirmPassword || '').trim();

        if (!verifyOwnerPassword(confirmPassword)) {
          return json(res, 403, { ok: false, message: 'Owner password confirmation failed.' });
        }
        if (!userId || userId === 'owner') return json(res, 400, { ok: false, message: 'Valid non-owner userId required' });
        if (!['deactivate', 'reactivate', 'delete-content', 'delete-user'].includes(operation)) {
          return json(res, 400, { ok: false, message: 'Invalid moderation operation' });
        }

        const usersCol = db.collection('users');
        const commentsCol = db.collection('comments');
        const feedbackCol = db.collection('feedbacks');
        const blocksCol = db.collection('blocked_users');
        const existingUser = await usersCol.findOne({ userId });
        if (!existingUser && operation !== 'delete-user') return json(res, 404, { ok: false, message: 'User not found' });

        if (operation === 'deactivate' || operation === 'reactivate') {
          if (!['full', 'comments', 'profile', 'feedback'].includes(scope)) {
            return json(res, 400, { ok: false, message: 'Valid moderation scope required' });
          }
          let until = null;
          if (operation === 'deactivate' && body.until) {
            const parsedUntil = new Date(String(body.until));
            if (Number.isNaN(parsedUntil.getTime()) || parsedUntil <= new Date()) {
              return json(res, 400, { ok: false, message: 'Valid future deactivation time required' });
            }
            until = parsedUntil;
          }
          await usersCol.updateOne(
            { userId },
            {
              $set: {
                [`moderation.${scope}`]: {
                  active: operation === 'deactivate',
                  until,
                  reason,
                  updatedAt: new Date(),
                  updatedAtIST: nowIST(),
                },
                moderationUpdatedAt: new Date(),
              },
            },
            { upsert: false },
          );
          const updatedUser = await usersCol.findOne({ userId });
          return json(res, 200, { ok: true, user: updatedUser, message: operation === 'deactivate' ? 'User deactivated.' : 'User reactivated.' });
        }

        if (operation === 'delete-content') {
          await Promise.all([
            commentsCol.deleteMany({ userId }),
            feedbackCol.deleteMany({ userId }),
          ]);
          const updatedUser = await recalculateUserCommentStats(db, userId);
          return json(res, 200, { ok: true, user: updatedUser, message: 'User comments, replies, and feedback deleted. Profile kept.' });
        }

        await Promise.all([
          commentsCol.deleteMany({ userId }),
          feedbackCol.deleteMany({ userId }),
          blocksCol.deleteMany({ userId }),
          usersCol.deleteOne({ userId }),
        ]);
        return json(res, 200, { ok: true, deletedUserId: userId, message: 'User and all related data permanently deleted.' });
      }

      if (action === 'user-verify') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const userId = String(body.userId || '').trim();
        const verified = Boolean(body.verified);
        if (!userId || userId === 'owner') return json(res, 400, { ok: false, message: 'Valid non-owner userId required' });

        const usersCol = db.collection('users');
        const commentsCol = db.collection('comments');
        const found = await usersCol.findOne({ userId }, { projection: { _id: 1 } });
        if (!found) return json(res, 404, { ok: false, message: 'User not found' });

        await usersCol.updateOne(
          { userId },
          { $set: { verified, verifiedUpdatedAt: new Date() } },
        );
        await commentsCol.updateMany(
          { userId },
          { $set: { isVerified: verified } },
        );
        return json(res, 200, { ok: true, userId, verified });
      }

      if (action === 'user-service-key') {
        const ownerUpdating = isAuthenticated(req);
        const credential = String(body.credential || '').trim();
        const requestedUserId = String(body.userId || '').trim();

        let tokenUser = null;
        let targetUserId = '';
        if (ownerUpdating) {
          targetUserId = requestedUserId;
          if (!targetUserId || targetUserId === 'owner') return json(res, 400, { ok: false, message: 'Valid non-owner userId required' });
        } else {
          if (!credential) return json(res, 401, { ok: false, message: 'Authentication required' });
          tokenUser = await verifyGoogleToken(credential);
          if (!tokenUser) return json(res, 401, { ok: false, message: 'Invalid or expired Google token' });
          targetUserId = tokenUser.userId;
          if (requestedUserId && requestedUserId !== targetUserId) {
            return json(res, 403, { ok: false, message: 'Not allowed to rotate this user key' });
          }
          if (targetUserId === 'owner') return json(res, 400, { ok: false, message: 'Owner service key is not available' });
        }

        const usersCol = db.collection('users');
        const now = new Date();
        const nextServiceKey = generateServiceKey();
        const clientIp = getClientIp(req);
        const clientCountry = (req.headers['x-vercel-ip-country'] || req.headers['cf-ipcountry'] || '').toString().trim();
        const updateResult = await usersCol.updateOne(
          { userId: targetUserId },
          ownerUpdating
            ? {
                $set: {
                  serviceKey: nextServiceKey,
                  serviceKeyUpdatedAt: now,
                },
              }
            : {
                $set: {
                  userName: tokenUser.name,
                  userPic: tokenUser.picture,
                  email: tokenUser.email || '',
                  lastActivityIp: clientIp,
                  lastActivityCountry: clientCountry,
                  serviceKey: nextServiceKey,
                  serviceKeyUpdatedAt: now,
                },
                $setOnInsert: {
                  userId: targetUserId,
                  firstCommentAt: now,
                  lastCommentAt: now,
                  totalComments: 0,
                  createdAt: now,
                  verified: false,
                  registrationIp: clientIp,
                  registrationCountry: clientCountry,
                },
              },
          { upsert: !ownerUpdating },
        );
        if (ownerUpdating && !updateResult.matchedCount) return json(res, 404, { ok: false, message: 'User not found' });

        const updatedUser = await usersCol.findOne({ userId: targetUserId }, { projection: { _id: 1, userId: 1, email: 1, serviceKey: 1 } });
        return json(res, 200, { ok: true, user: updatedUser });
      }

      // --- Comment Edit (Google user or owner) ---
      if (action === 'comment') {
        const commentId = String(body.commentId || '').trim();
        const newText = String(body.text || '').trim();
        const credential = String(body.credential || '').trim();

        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'commentId required' });
        if (!newText) return json(res, 400, { ok: false, message: 'text required' });
        if (newText.length > 2000) return json(res, 400, { ok: false, message: 'Comment too long (max 2000 chars)' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        const ownerEditing = isAuthenticated(req);
        if (!ownerEditing) {
          const userInfo = await verifyGoogleToken(credential);
          if (!userInfo || userInfo.userId !== comment.userId) {
            return json(res, 403, { ok: false, message: 'Not authorized to edit this comment' });
          }
        }

        const { text: censoredText, hasAbuse: newHasAbuse } = await censorTextWithFlag(db, newText);
        await commentsCol.updateOne(
          { _id: new ObjectId(commentId) },
          { $set: { text: censoredText, hasAbuse: newHasAbuse, originalText: newHasAbuse ? newText : null, editedAt: new Date() } },
        );
        return json(res, 200, { ok: true, comment: { ...comment, text: censoredText, editedAt: new Date() } });
      }

      // Admin-only operations below
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });

      const id = body._id;
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: '_id required' });

      if (action === 'status') {
        const update = {
          isVisible: body.isVisible ?? true,
          message: String(body.message || '').trim(),
          hexColor: String(body.hexColor || '#22c55e').trim(),
          icon: String(body.icon || 'Activity').trim(),
          actionUrl: String(body.actionUrl || '').trim(),
          glow: Boolean(body.glow),
          freeBy: String(body.freeBy || '').trim(),
          updatedAt: new Date()
        };
        await db.collection('live_status').updateOne({ _id: new ObjectId(id) }, { $set: update });
        return json(res, 200, { ok: true, message: 'Status updated' });
      }
      // ... baki journal update ka code waisa hi rahega
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: '_id required' });

      const existing = await col.findOne({ _id: new ObjectId(id) });
      if (!existing) return json(res, 404, { ok: false, message: 'Not found' });

      const title = body.title !== undefined ? String(body.title).trim() : existing.title;
      const content = body.content !== undefined ? String(body.content).trim() : existing.content;
      const publish = body.publish !== undefined ? Boolean(body.publish) : existing.published;
      const contentType = body.contentType !== undefined ? String(body.contentType).trim() : (existing.contentType || 'richtext');

      const now = new Date();
      const update = {
        title,
        slug: slugify(title),
        summary: body.summary !== undefined ? String(body.summary).trim() : existing.summary,
        content,
        contentType,
        categorySlug: body.categorySlug !== undefined ? String(body.categorySlug).trim() : existing.categorySlug,
        categoryName: body.categoryName !== undefined ? String(body.categoryName).trim() : existing.categoryName,
        images: body.images !== undefined ? normalizeImages(body.images) : normalizeImages(existing.images),
        published: publish,
        publishedAt: publish ? (existing.publishedAt || now) : (existing.publishedAt || null),
        publishedAtIST: publish ? (existing.publishedAtIST || nowIST()) : (existing.publishedAtIST || null),
        updatedAt: now,
        readMinutes: estimateReadMinutes(content),
      };

      await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
      return json(res, 200, { ok: true, journal: { ...existing, ...update } });
    }

    if (req.method === 'DELETE') {
      const action = getParam(req, 'action');

      // --- Comment Delete (Google user or owner) ---
      if (action === 'comment') {
        const commentId = getParam(req, 'id');
        const body = await readBody(req);
        const credential = String(body.credential || getParam(req, 'credential') || '').trim();

        if (!commentId || !ObjectId.isValid(commentId)) return json(res, 400, { ok: false, message: 'id required' });

        const commentsCol = db.collection('comments');
        const comment = await commentsCol.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
        if (!comment) return json(res, 404, { ok: false, message: 'Comment not found' });

        const ownerDeleting = isAuthenticated(req);
        if (!ownerDeleting) {
          const userInfo = await verifyGoogleToken(credential);
          if (!userInfo || userInfo.userId !== comment.userId) {
            return json(res, 403, { ok: false, message: 'Not authorized to delete this comment' });
          }
        }

        await commentsCol.updateOne({ _id: new ObjectId(commentId) }, { $set: { isDeleted: true } });
        return json(res, 200, { ok: true, message: 'Comment deleted' });
      }



      // --- Feedback admin delete (owner only) ---
      if (action === 'feedback-admin') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const feedbackId = String(getParam(req, 'id') || getParam(req, 'feedbackId') || '').trim();
        if (!feedbackId || !ObjectId.isValid(feedbackId)) return json(res, 400, { ok: false, message: 'id required' });
        await db.collection('feedbacks').deleteOne({ _id: new ObjectId(feedbackId) });
        return json(res, 200, { ok: true, message: 'Feedback deleted' });
      }

      // --- Blacklist: Delete word (admin only) ---
      if (action === 'blacklist') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const blId = getParam(req, 'id');
        if (!blId || !ObjectId.isValid(blId)) return json(res, 400, { ok: false, message: 'id required' });
        await db.collection('comment_blacklist').deleteOne({ _id: new ObjectId(blId) });
        return json(res, 200, { ok: true, message: 'Word removed from blacklist' });
      }

      // --- Block: remove a block (admin only) ---
      if (action === 'block') {
        if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
        const blockId = getParam(req, 'id');
        if (!blockId || !ObjectId.isValid(blockId)) return json(res, 400, { ok: false, message: 'id required' });
        await db.collection('blocked_users').deleteOne({ _id: new ObjectId(blockId) });
        return json(res, 200, { ok: true, message: 'Block removed' });
      }

      // Existing: Delete journal (admin only)
      if (!isAuthenticated(req)) return json(res, 401, { ok: false, message: 'Unauthorized' });
      const id = getParam(req, 'id');
      if (!id || !ObjectId.isValid(id)) return json(res, 400, { ok: false, message: 'id required' });

      if (action === 'status') {
        await db.collection('live_status').deleteOne({ _id: new ObjectId(id) });
        return json(res, 200, { ok: true, message: 'Status deleted' });
      }

      await col.deleteOne({ _id: new ObjectId(id) });
      return json(res, 200, { ok: true, message: 'Deleted' });
    }

    return json(res, 405, { ok: false, message: 'Method not allowed' });
  } catch (err) {
    console.error('Journal error:', err);
    if (err.message === 'MONGODB_URI not set') {
      return json(res, 503, { ok: false, message: 'Database not configured.' });
    }
    return json(res, 500, { ok: false, message: 'Internal server error.' });
  }
};
