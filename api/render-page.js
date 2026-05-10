const fs = require('fs');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');

const BASE_URL = 'https://deepdey.vercel.app';
const DEFAULT_IMAGE = '/assets/images/myphoto.png';

let cachedClient = null;
let cachedTemplate = null;

const STATIC_PAGE_META = {
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

const PROJECT_META = {
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

async function getDb() {
  if (!process.env.MONGODB_URI) return null;
  if (!cachedClient) {
    cachedClient = new MongoClient(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    await cachedClient.connect();
  }
  return cachedClient.db();
}

function readTemplate() {
  if (!cachedTemplate) {
    cachedTemplate = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
  }
  return cachedTemplate;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(value) {
  return escapeHtml(value).replace(/"/g, '&quot;');
}

function toAbsoluteUrl(value) {
  const raw = String(value || '').trim();
  if (!raw) return `${BASE_URL}${DEFAULT_IMAGE}`;
  if (/^https?:\/\//i.test(raw)) return raw;
  return `${BASE_URL}${raw.startsWith('/') ? raw : `/${raw}`}`;
}

function sanitizeSocialImage(value) {
  const raw = String(value || '').trim();
  if (!raw) return '';
  try {
    const parsed = new URL(raw, BASE_URL);
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

function pickRandomImage(images) {
  const validImages = Array.isArray(images)
    ? images.map((item) => sanitizeSocialImage(item)).filter(Boolean)
    : [];
  if (!validImages.length) return `${BASE_URL}${DEFAULT_IMAGE}`;
  return validImages[Math.floor(Math.random() * validImages.length)];
}

function replaceTag(html, pattern, replacement) {
  return pattern.test(html) ? html.replace(pattern, replacement) : html;
}

function buildRenderedHtml(meta) {
  const fullUrl = `${BASE_URL}${meta.path === '/' ? '' : meta.path}${meta.query || ''}`;
  const title = escapeHtml(meta.title);
  const titleAttr = escapeAttr(meta.title);
  const description = escapeAttr(meta.description);
  const image = escapeAttr(meta.image || `${BASE_URL}${DEFAULT_IMAGE}`);
  const canonical = escapeAttr(fullUrl);
  const ogType = escapeAttr(meta.type || 'website');

  let html = readTemplate();

  html = replaceTag(html, /<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  html = replaceTag(html, /<meta\s+name="title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="title" content="${titleAttr}" />`);
  html = replaceTag(html, /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  html = replaceTag(html, /<link\s+rel="canonical"\s+href="[\s\S]*?"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  html = replaceTag(html, /<meta\s+property="og:type"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:type" content="${ogType}" />`);
  html = replaceTag(html, /<meta\s+property="og:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  html = replaceTag(html, /<meta\s+property="og:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:title" content="${titleAttr}" />`);
  html = replaceTag(html, /<meta\s+property="og:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+property="og:image"\s+content="[\s\S]*?"\s*\/?>/i, `<meta property="og:image" content="${image}" />`);
  html = replaceTag(html, /<meta\s+(?:name|property)="twitter:card"\s+content="[\s\S]*?"\s*\/?>/i, '<meta name="twitter:card" content="summary_large_image" />');
  html = replaceTag(html, /<meta\s+(?:name|property)="twitter:url"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:url" content="${canonical}" />`);
  html = replaceTag(html, /<meta\s+(?:name|property)="twitter:title"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:title" content="${titleAttr}" />`);
  html = replaceTag(html, /<meta\s+(?:name|property)="twitter:description"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  html = replaceTag(html, /<meta\s+(?:name|property)="twitter:image"\s+content="[\s\S]*?"\s*\/?>/i, `<meta name="twitter:image" content="${image}" />`);

  return html;
}

async function getJournalMeta(db, ref) {
  if (!db || !ref) return null;
  const journals = db.collection('journals');
  const queries = [];
  if (ObjectId.isValid(ref)) queries.push({ _id: new ObjectId(ref), published: true });
  queries.push({ slug: ref, published: true });
  for (const query of queries) {
    const journal = await journals.findOne(query, {
      projection: { _id: 1, slug: 1, title: 1, summary: 1, images: 1 },
    });
    if (journal) {
      const path = `/journal/view/${encodeURIComponent(journal.slug || journal._id.toString())}`;
      return {
        title: `${journal.title} | Journal`,
        description: String(journal.summary || 'Journal post'),
        image: pickRandomImage(journal.images),
        path,
        type: 'article',
      };
    }
  }
  return null;
}

async function getJournalCommentsMeta(db, ref) {
  if (!db || !ref) return null;
  const journals = db.collection('journals');
  const queries = [];
  if (ObjectId.isValid(ref)) queries.push({ _id: new ObjectId(ref), published: true });
  queries.push({ slug: ref, published: true });
  for (const query of queries) {
    const journal = await journals.findOne(query, {
      projection: { _id: 1, slug: 1, title: 1, summary: 1, images: 1 },
    });
    if (journal) {
      const routeKey = encodeURIComponent(journal.slug || journal._id.toString());
      return {
        title: `Comments on "${journal.title}" | Deep Dey Journal`,
        description: journal.summary
          ? `Comments and replies on "${journal.title}". ${String(journal.summary).slice(0, 120)}`
          : `Comments and replies on "${journal.title}".`,
        image: pickRandomImage(journal.images),
        path: `/journal/view/${routeKey}/comments`,
        type: 'article',
      };
    }
  }
  return null;
}

async function getCommentMeta(db, commentId) {
  if (!db || !ObjectId.isValid(commentId)) return null;
  const comments = db.collection('comments');
  const journals = db.collection('journals');
  const comment = await comments.findOne({ _id: new ObjectId(commentId), isDeleted: { $ne: true } });
  if (!comment?.journalId) return null;
  const journal = await journals.findOne(
    { _id: comment.journalId, published: true },
    { projection: { _id: 1, slug: 1, title: 1, images: 1 } },
  );
  if (!journal) return null;
  const preview = String(comment.text || '').trim();
  return {
    title: `Comment by ${comment.userName || 'User'} | ${journal.title}`,
    description: `"${preview.length > 120 ? `${preview.slice(0, 120)}…` : preview}" — comment on "${journal.title}" by ${comment.userName || 'User'}`,
    image: pickRandomImage(journal.images),
    path: `/journal/comment/${encodeURIComponent(commentId)}`,
    type: 'article',
  };
}

async function getUserMeta(db, userId) {
  if (!db || !userId) return null;
  const user = await db.collection('users').findOne(
    { userId },
    { projection: { userId: 1, userName: 1, profileTitle: 1, bio: 1, description: 1, totalComments: 1, userPic: 1 } },
  );
  if (!user) return null;
  const titleName = user.profileTitle || user.userName || user.userId;
  const description = user.bio
    || user.description
    || `${user.userName || user.userId} has commented ${Number(user.totalComments || 0)} time${Number(user.totalComments || 0) === 1 ? '' : 's'} on journal posts.`;
  return {
    title: `${titleName}'s Profile | Deep Dey Journal`,
    description,
    image: sanitizeSocialImage(user.userPic) || `${BASE_URL}${DEFAULT_IMAGE}`,
    path: `/user/${encodeURIComponent(userId)}`,
    type: 'profile',
  };
}

async function resolveMeta(pathname, query) {
  const db = await getDb();

  const journalMatch = pathname.match(/^\/journal\/view\/([^/]+)$/);
  if (journalMatch) {
    return await getJournalMeta(db, decodeURIComponent(journalMatch[1]));
  }

  const journalCommentsMatch = pathname.match(/^\/journal\/view\/([^/]+)\/comments$/);
  if (journalCommentsMatch) {
    return await getJournalCommentsMeta(db, decodeURIComponent(journalCommentsMatch[1]));
  }

  const journalCommentMatch = pathname.match(/^\/journal\/(?:comment\/([^/]+)|view\/[^/]+\/comment\/([^/]+))$/);
  if (journalCommentMatch) {
    const commentId = decodeURIComponent(journalCommentMatch[1] || journalCommentMatch[2] || '');
    return await getCommentMeta(db, commentId);
  }

  const userMatch = pathname.match(/^\/user\/([^/]+)$/);
  if (userMatch) {
    return await getUserMeta(db, decodeURIComponent(userMatch[1]));
  }

  const projectMatch = pathname.match(/^\/projects\/([^/]+)$/);
  if (projectMatch) {
    const project = PROJECT_META[decodeURIComponent(projectMatch[1])];
    if (project) {
      return {
        ...project,
        image: toAbsoluteUrl(project.image || DEFAULT_IMAGE),
        path: pathname,
      };
    }
  }

  if (pathname === '/search') {
    const q = String(query.get('q') || '').trim();
    return {
      ...(STATIC_PAGE_META['/search']),
      title: q ? `Results for "${q}"` : STATIC_PAGE_META['/search'].title,
      path: pathname,
    };
  }

  if (pathname === '/journal/embed' || pathname.startsWith('/journal/embed/')) {
    const ref = pathname.split('/').filter(Boolean)[2] || '';
    const journalMeta = await getJournalMeta(db, decodeURIComponent(ref));
    if (journalMeta) {
      return {
        ...journalMeta,
        title: `${journalMeta.title} | Embed`,
        path: pathname,
      };
    }
  }

  if (STATIC_PAGE_META[pathname]) {
    return {
      ...STATIC_PAGE_META[pathname],
      path: pathname,
      image: `${BASE_URL}${DEFAULT_IMAGE}`,
    };
  }

  return {
    title: 'Deep Dey | Software Architect & JEE 2027 Aspirant',
    description: 'Official portfolio of Deep Dey. Software Architect specializing in AI prompting, system thinking, and web development.',
    image: `${BASE_URL}${DEFAULT_IMAGE}`,
    path: pathname,
  };
}

module.exports = async (req, res) => {
  try {
    const requestUrl = new URL(req.url, BASE_URL);
    const rawPath = String(requestUrl.searchParams.get('path') || '/').trim() || '/';
    const pathname = rawPath === '/' ? '/' : rawPath.replace(/\/+$/, '') || '/';
    const query = new URLSearchParams(requestUrl.searchParams);
    query.delete('path');
    const queryString = query.toString();
    const meta = await resolveMeta(pathname, query) || {};

    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.end(buildRenderedHtml({
      ...meta,
      image: toAbsoluteUrl(meta.image || DEFAULT_IMAGE),
      path: meta.path || pathname,
      query: queryString ? `?${queryString}` : '',
    }));
  } catch {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end(readTemplate());
  }
};
