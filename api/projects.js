// api/projects.js
const { MongoClient, ObjectId } = require('mongodb');

// --- MONGODB CACHING ---
let cachedDb = null;
async function connectToDatabase() {
  if (cachedDb) return cachedDb;
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is not defined in environment variables');
  
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  cachedDb = client.db();
  return cachedDb;
}

// --- CLOUD SCREENSHOT API (Best-Effort with Rotating Headers) ---
// We cannot guarantee bypassing all CAPTCHAs, but dynamic headers help.
const HUMAN_HEADERS_FOR_MICROLINK = [
  // 1. Common Chrome on Windows
  {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept-Language': 'en-US,en;q=0.9',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Upgrade-Insecure-Requests': '1'
  },
  // 2. Common Chrome on Mac
  {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept-Language': 'en-GB,en;q=0.9'
  },
  // 3. Firefox on Linux
  {
    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0',
    'Accept-Language': 'en-IN,en;q=0.5',
    'Sec-Fetch-Dest': 'document'
  },
  // 4. Googlebot (Human-like behavior is better, but bots are often white-listed)
  {
    'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
  },
  // 5. Common Mobile Chrome (Android)
  {
    'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36'
  }
];

// ─── CLOUD SCREENSHOT API (Bypasses Vercel Limits & Auto-Crops) ───
async function takeScreenshot(url) {
  try {
    // Thum.io API: No API key needed, bypasses most bot checks, 
    // and automatically crops portrait sites to landscape!
    // width/1280 aur crop/800 ka matlab hai ye perfectly 16:10 desktop view nikalega.
    const apiUrl = `https://image.thum.io/get/width/1280/crop/800/noanimate/${url}`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`Thum.io API failed with status ${response.status}`);
    }
    
    // Fetch image data directly
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Convert to Base64 (Compressed JPEG format from Thum.io)
    const base64Image = `data:image/jpeg;base64,${buffer.toString('base64')}`;
    
    return base64Image;
  } catch (error) {
    console.error("Screenshot API Error:", error.message);
    throw new Error(`Screenshot Failed: Target site might be offline or strictly blocking access.`);
  }
}

// --- MAIN API HANDLER ---
module.exports = async (req, res) => {
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
        const base64Image = await takeScreenshotWithRotatedHeaders(url);
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
