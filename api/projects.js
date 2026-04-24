const puppeteer = require('puppeteer-core');
const chromium = require('@sparticuz/chromium');
const { MongoClient, ObjectId } = require('mongodb');

// ─── MONGODB CACHING (Vercel connection limits bachane ke liye) ───
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

// ─── ANTI-BOT HEADERS (Rotating headers for stealth) ───
const HUMAN_HEADERS = [
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1'
  },
  {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.3 Safari/605.1.15',
    'Accept-Language': 'en-GB,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate'
  },
  {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:123.0) Gecko/20100101 Firefox/123.0',
    'Accept-Language': 'en-IN,en;q=0.5',
    'Sec-Fetch-Dest': 'document'
  }
];

// ─── PUPPETEER RETRY MECHANISM (Robust Error Handling) ───
async function takeScreenshotWithRetry(url, maxRetries = 1) {
  let attempt = 0;
  
  while (attempt <= maxRetries) {
    let browser = null;
    try {
      const isLocal = process.env.NODE_ENV === 'development';
      
      // Browser launch setup optimized for serverless Vercel
      browser = await puppeteer.launch({
        args: isLocal ? puppeteer.defaultArgs() : [
          ...chromium.args, 
          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Memory crash se bachayega
          '--single-process' // Vercel me fast start hoga
        ],
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
      });

      const page = await browser.newPage();
      await page.setViewport({ width: 1280, height: 800 });
      
      // Inject human headers
      const randomHeader = HUMAN_HEADERS[Math.floor(Math.random() * HUMAN_HEADERS.length)];
      await page.setExtraHTTPHeaders(randomHeader);
      
      // FAST LOAD: 'networkidle2' ki jagah 'load' kiya, timeout thoda kam kiya
      await page.goto(url, { waitUntil: 'load', timeout: 12000 });
      
      // Capture screenshot directly
      const screenshotBuffer = await page.screenshot({ type: 'jpeg', quality: 70 }); // Quality thodi kam ki for speed
      await browser.close();

      return `data:image/jpeg;base64,${screenshotBuffer.toString('base64')}`;
      
    } catch (error) {
      if (browser) await browser.close().catch(() => {}); // Ensure browser is closed on crash
      console.error(`Screenshot attempt ${attempt + 1} failed for ${url}:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Browser Crash Info: ${error.message}`);
      }
      attempt++;
    }
  }
}

// ─── MAIN API HANDLER ───
module.exports = async (req, res) => {
  // CORS Handling (optional but safe)
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // =========================================================================
    // 1. SCREENSHOT GENERATOR ROUTE
    // Triggered only when { action: "screenshot" } is passed in POST body
    // =========================================================================
    if (req.method === 'POST' && req.body.action === 'screenshot') {
      const { url } = req.body;
      if (!url) return res.status(400).json({ ok: false, message: 'Live URL is required for screenshot' });

      try {
        const base64Image = await takeScreenshotWithRetry(url, 2); // Tries up to 3 times total
        return res.status(200).json({ ok: true, image: base64Image });
      } catch (screenshotError) {
        return res.status(500).json({ ok: false, message: screenshotError.message });
      }
    }

    // =========================================================================
    // 2. MONGODB PROJECTS CRUD ROUTES
    // =========================================================================
    const db = await connectToDatabase();
    const configCol = db.collection('config');
    const projectsCol = db.collection('projects');

    // GET: Fetch all projects & current mode
    if (req.method === 'GET') {
      const config = await configCol.findOne({ _id: 'site_config' });
      const mode = config?.projectsMode || 'default';
      const items = await projectsCol.find({}).sort({ sortOrder: 1 }).toArray();
      return res.status(200).json({ ok: true, mode, items });
    }

    // PUT: Update Project Mode OR Update Existing Project Data
    if (req.method === 'PUT') {
      if (req.body.mode) {
        // Toggle Default/Custom Mode
        await configCol.updateOne(
          { _id: 'site_config' },
          { $set: { projectsMode: req.body.mode } },
          { upsert: true }
        );
        return res.status(200).json({ ok: true, message: 'Mode updated successfully' });
      } else if (req.body._id) {
        // Edit Existing Project
        const { _id, ...updateData } = req.body;
        if (updateData.action) delete updateData.action; // Cleanup just in case
        await projectsCol.updateOne({ _id: new ObjectId(_id) }, { $set: updateData });
        return res.status(200).json({ ok: true, message: 'Project updated successfully' });
      }
      return res.status(400).json({ ok: false, message: 'Invalid PUT request payload' });
    }

    // POST: Create New Project
    if (req.method === 'POST') {
      const { action, ...newProjectData } = req.body; // Remove action if it exists
      const result = await projectsCol.insertOne(newProjectData);
      return res.status(201).json({ ok: true, _id: result.insertedId, message: 'Project saved to MongoDB' });
    }

    // DELETE: Delete a Project
    if (req.method === 'DELETE') {
      const { id } = req.query;
      if (!id) return res.status(400).json({ ok: false, message: 'Project ID is required for deletion' });
      await projectsCol.deleteOne({ _id: new ObjectId(id) });
      return res.status(200).json({ ok: true, message: 'Project deleted successfully' });
    }

    // Fallback for unsupported methods
    return res.status(405).json({ ok: false, message: 'Method Not Allowed' });

  } catch (error) {
    console.error('Fatal API Error:', error);
    return res.status(500).json({ ok: false, message: 'Internal Server Error', error: error.message });
  }
};
