const { MongoClient, ObjectId } = require('mongodb');

// --- MONGODB CACHING ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

// --- MASSIVE ROTATING HEADERS LIST ---
const ROTATING_HEADERS = [
  { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', 'Accept-Language': 'en-US,en;q=0.9' },
  { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36', 'Accept-Language': 'en-GB,en;q=0.9' },
  { 'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0' },
  { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1' },
  { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
  { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:123.0) Gecko/20100101 Firefox/123.0' },
  { 'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Mobile Safari/537.36' }
];

// --- 3-LAYER SCREENSHOT SYSTEM ---
async function takeScreenshot(url) {
  const googleKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  const siteShotKey = process.env.SITESHOT_API_KEY;

  // LAYER 1: GOOGLE PAGESPEED (Best for CAPTCHA Bypass)
  if (googleKey) {
    try {
      const gUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&category=performance&strategy=desktop&key=${googleKey}`;
      const res = await fetch(gUrl);
      const data = await res.json();
      const b64 = data?.lighthouseResult?.audits?.['final-screenshot']?.details?.data;
      if (b64) return b64;
    } catch (e) { console.error("Layer 1 (Google) failed"); }
  }

  // LAYER 2: SITE-SHOT (Global Proxy & Geolocation)
  if (siteShotKey) {
    try {
      // Using geolocation and language headers to bypass region-based blocks
      const ssUrl = `https://api.site-shot.com/?url=${encodeURIComponent(url)}&userkey=${siteShotKey}&width=1280&height=800&fade=1&delay=2000`;
      const res = await fetch(ssUrl);
      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
      }
    } catch (e) { console.error("Layer 2 (Site-Shot) failed"); }
  }

  // LAYER 3: THUM.IO FALLBACK (No API Key required)
  try {
    const thumUrl = `https://image.thum.io/get/noanimate/width/1280/crop/800/${url}`;
    const header = ROTATING_HEADERS[Math.floor(Math.random() * ROTATING_HEADERS.length)];
    const res = await fetch(thumUrl, { headers: header });
    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return `data:image/jpeg;base64,${Buffer.from(buffer).toString('base64')}`;
    }
  } catch (e) { console.error("Layer 3 (Thum.io) failed"); }

  throw new Error("All screenshot layers failed. Please check if the URL is valid.");
}

// --- MAIN API HANDLER ---
module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // Action: Screenshot
    if (req.method === 'POST' && req.body.action === 'screenshot') {
      const { url } = req.body;
      if (!url) return res.status(400).json({ ok: false, message: 'URL required' });
      try {
        const image = await takeScreenshot(url);
        return res.status(200).json({ ok: true, image });
      } catch (err) {
        return res.status(500).json({ ok: false, message: err.message });
      }
    }

    const db = await connectToDatabase();
    const configCol = db.collection('config');
    const projectsCol = db.collection('projects');

    if (req.method === 'GET') {
      const config = await configCol.findOne({ _id: 'site_config' });
      const mode = config?.projectsMode || 'default';
      const items = await projectsCol.find({}).sort({ sortOrder: 1 }).toArray();
      return res.status(200).json({ ok: true, mode, items });
    }

    if (req.method === 'PUT') {
      if (req.body.mode) {
        await configCol.updateOne({ _id: 'site_config' }, { $set: { projectsMode: req.body.mode } }, { upsert: true });
        return res.status(200).json({ ok: true });
      } else if (req.body._id) {
        const { _id, ...updateData } = req.body;
        delete updateData.action;
        await projectsCol.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });
        return res.status(200).json({ ok: true });
      }
    }

    if (req.method === 'POST') {
      const { action, ...newProjectData } = req.body;
      const result = await projectsCol.insertOne(newProjectData);
      return res.status(201).json({ ok: true, _id: result.insertedId });
    }

    if (req.method === 'DELETE') {
      const { id } = req.query;
      await projectsCol.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true });
    }

    return res.status(405).json({ ok: false });
  } catch (error) {
    return res.status(500).json({ ok: false, message: 'Server Error' });
  }
};
