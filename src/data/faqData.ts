export interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

export const faqData: FAQItem[] = [
  {
    id: 1,
    question: "Why is development paused on your projects?",
    answer: "As of April 9, 2026, I have officially paused all active software development to dedicate 100% of my energy toward JEE Advanced 2027 preparation. My target is securing a seat in the Computer Science and Engineering (CSE) department at IIT Kharagpur (KGP).",
  },
  {
    id: 2,
    question: "Do you really build systems using AI Prompt Engineering?",
    answer: "Yes. I act as an Expert Software Architect. I utilize advanced Prompt Engineering and System Thinking to architect complex applications. I use models like GPT-4o, Gemini 1.5 Pro, and Claude 3.5 Sonnet as development partners to iterate quickly and build scalable systems.",
  },
  {
    id: 3,
    question: "What is qlynk.me exactly?",
    answer: "qlynk.me is my primary SaaS platform designed for high-performance URL shortening and digital productivity hooks. It serves as the hub for my ecosystem of tools, managed with a focus on SEO, performance, and clean architecture.",
  },
  {
    id: 4,
    question: "What are your core technical skills?",
    answer: "I specialize in Full-Stack Web Development (React, TypeScript, Node.js), AI System Design, SEO Optimization, and Product Management. My strength lies in seeing the 'big picture' of how components intersect to form a cohesive system.",
  },
  {
    id: 5,
    question: "How do you manage to balance academics and development?",
    answer: "Discipline and deep work sessions are key. While development was a significant part of my journey, I have structured my time to prioritize my academic goal: cracking the JEE and making it to an IIT.",
  },
  {
    id: 6,
    question: "Can I use your projects currently?",
    answer: "Yes, most projects like QuickLink and StudyBot are live and functional. However, keep in mind they are in a 'stability-only' mode as new feature development is paused until my academic goals are met.",
  },
  {
    id: 7,
    question: "What inspired the 'Dark-Amber' aesthetic?",
    answer: "The Dark-Amber aesthetic (Zinc-950 and Amber-500) represents clarity, focus, and a premium feel. It is designed to be easy on the eyes during long sessions while highlighting the most important calls to action.",
  },
  {
    id: 8,
    question: "What is your target rank for JEE?",
    answer: "I am aiming for a top-tier rank that ensures admission into IIT Kharagpur's CSE program. Every project I've built has been a lesson in problem-solving that I now apply to my Physics, Chemistry, and Math studies.",
  },
  {
    id: 9,
    question: "Do you ever do custom development work?",
    answer: "Currently, I am not accepting new custom projects or freelance inquiries due to my strict study schedule. You are welcome to leave an inquiry on the Contact page for information I might review in the future.",
  },
  {
    id: 10,
    question: "What will happen to your projects after 2027?",
    answer: "Once I enter IIT, I plan to resume development on my existing ecosystem and scale qlynk.me into a more robust suite of tools, incorporating the advanced engineering knowledge I'll gain at the institute.",
  },
  {
    id: 11,
    question: "What programming language is Transparent Clock built with?",
    answer: "The application is developed using C# (C-Sharp) and the .NET 8 framework, utilizing Windows Presentation Foundation (WPF) for the UI layer.",
  },
  {
    id: 12,
    question: "Is my personal data stored in the cloud?",
    answer: "No. Transparent Clock follows a 'Privacy-First' architecture. All your Todo lists and Focus session data are stored locally on your machine in a SQLite database.",
  },
  {
    id: 13,
    question: "How does the Pomodoro timer logic work?",
    answer: "The app follows the standard 25-minute focus and 5-minute break cycle. However, these intervals are fully customizable within the settings to match your specific study stamina.",
  },
  {
    id: 14,
    question: "How do I make Transparent Clock run on system startup?",
    answer: "Inside the Settings tab, there is a 'Run on Startup' toggle. Enabling this will ensure the clock loads automatically whenever you turn on your PC.",
  },
  {
    id: 15,
    question: "Can I adjust the transparency level of the clock?",
    answer: "Yes, the app features an opacity slider that allows you to make the clock as subtle or as visible as you need to prevent it from becoming a distraction.",
  },
  {
    id: 16,
    question: "What exactly is the JEE Prep Meter?",
    answer: "The Prep Meter is a specialized dashboard widget that visualizes your daily study hours and tracks your consistency against your target admission goals (like IIT KGP).",
  },
  {
    id: 17,
    question: "What data points are shown in Focus Insights?",
    answer: "Focus Insights provides an hourly breakdown of your productivity, daily trends, and weekly focus graphs calculated with machine-level precision.",
  },
  {
    id: 18,
    question: "Can I prioritize tasks in the Todo List?",
    answer: "Yes, the app includes priority labels, allowing you to move critical chapters or urgent assignments to the top of your list.",
  },
  {
    id: 19,
    question: "How is the QuickLink Shortener integrated into the app?",
    answer: "The 'Utilities' tab contains an API wrapper that allows you to shorten long URLs directly through the qlynk.me engine without leaving the app.",
  },
  {
    id: 20,
    question: "Does Transparent Clock support Linux or macOS?",
    answer: "Currently, it is a native Windows Application (.exe). There are no immediate plans for Linux/Mac support as the focus is currently on JEE preparation.",
  },
  {
    id: 21,
    question: "What should I do if the app crashes?",
    answer: "Ensure you have the .NET 8 Desktop Runtime installed. If the issue persists, please raise an issue on GitHub with the log details.",
  },
  {
    id: 22,
    question: "Can I set a custom background image for the dashboard?",
    answer: "To maintain a minimal and focus-oriented environment, the app currently only supports solid accent colors and varying transparency levels.",
  },
  {
    id: 23,
    question: "Why is there a Durga Puja playlist in your links?",
    answer: "As I am from Tripura, the local culture and festivals like Durga Puja are a big part of my identity, so I keep these personal nodes in my digital ecosystem.",
  },
  {
    id: 24,
    question: "What is the difference between the Odoo Store and the Google Site?",
    answer: "The DeepDeyIIT Odoo store is our new, modern e-commerce hub. The older Google sites are now archived and will no longer receive updates.",
  },
  {
    id: 25,
    question: "What is the purpose of the QR Generator in the app?",
    answer: "It is an offline-first utility designed for students to quickly share notes or transfer links from their PC to their mobile devices via QR codes.",
  },
  {
    id: 26,
    question: "Is Deep Dey the sole developer of these projects?",
    answer: "Yes, Deep Dey acts as the Lead Architect, utilizing AI models as advanced development partners to build and maintain the entire ecosystem.",
  },
  {
    id: 27,
    question: "Why are IIT Kanpur and Gandhinagar mentioned as targets?",
    answer: "While IIT Kharagpur is the primary goal, Kanpur and Gandhinagar are secondary targets due to their excellent CSE departments and research culture.",
  },
  {
    id: 28,
    question: "Why did you choose WPF over Electron for the desktop app?",
    answer: "WPF is more resource-efficient on Windows hardware and consumes significantly less RAM than Electron, making it ideal for student PCs.",
  },
  {
    id: 29,
    question: "Is the source code of Transparent Clock open-source?",
    answer: "It is 'Source Available' for educational and viewing purposes. However, commercial use or redistribution is strictly prohibited.",
  },
  {
    id: 30,
    question: "How do I reset all my settings to default?",
    answer: "You can navigate to the app's local data folder and delete the `config.json` file. The app will generate a fresh one on the next launch.",
  },
  {
    id: 31,
    question: "Any timing tips for a fellow JEE 2027 aspirant?",
    answer: "Deep recommends a 6:00 AM start. The clock app's 'Early Bird' focus sessions are designed to help you build and maintain this specific routine.",
  },
  {
    id: 32,
    question: "Where can I find the 'Sukoon' study playlist?",
    answer: "It is available on Spotify. You can find the direct link on the 'Links' page of this portfolio.",
  },
  {
    id: 33,
    question: "Does the app work without an internet connection?",
    answer: "Yes, 90% of the features (Clock, Todo, Pomodoro, Focus Insights) are 100% offline. Internet is only required for URL shortening and updates.",
  },
  {
    id: 34,
    question: "Who designed the DeepDeyIIT logo?",
    answer: "The logo was custom-designed by Deep Dey himself, keeping the 'Dark-Amber' and minimal tech aesthetic in mind.",
  },
  {
    id: 35,
    question: "What’s new in Transparent Clock v08.02.2026?",
    answer: "This version finalized the Pomodoro focus tracking algorithm and added a stable QR scanner utility to the suite.",
  },
  {
    id: 36,
    question: "Why was the deepdeyiitk.com domain discontinued?",
    answer: "Due to infrastructure restructuring, the focus has shifted to more scalable systems hosted on Odoo and Vercel.",
  },
  {
    id: 37,
    question: "How does the app prevent memory leaks?",
    answer: "The app uses efficient C# Garbage Collection and optimized UI rendering logic (DrawingContext) to ensure smooth performance even on low-end hardware.",
  },
  {
    id: 38,
    question: "Does the app have a dedicated Dark Mode?",
    answer: "Transparent Clock is built on a permanent 'Dark-Amber' theme designed to reduce eye strain during long night-time study sessions.",
  },
  {
    id: 39,
    question: "How do Physics Wallah batches influence the app?",
    answer: "Since Deep studies from PW, the app's default focus intervals are synced with the typical lengths of 'Arjuna' and 'Manzil' marathon lectures.",
  },
  {
    id: 40,
    question: "How do I fix a 'SQLite Read-Only' error?",
    answer: "Ensure the app folder has 'Write' permissions. It is recommended to install the app in a non-system drive (like D: or E:) to avoid permission issues.",
  },
  {
    id: 41,
    question: "What is the Discord Study Bot?",
    answer: "It is a part of the qlynk ecosystem that helps students track their study hours on Discord and compete on global leaderboards.",
  },
  {
    id: 42,
    question: "Why was Portfolio v2.x created?",
    answer: "While v1 was a legacy HTML project, v2.x was built using React and Framer Motion to provide a faster, cinematic system dashboard experience.",
  },
  {
    id: 43,
    question: "How does the app check for updates?",
    answer: "The app uses an internal `UpdateChecker.cs` logic that automatically pings GitHub releases on startup to see if a newer version is available.",
  },
  {
    id: 44,
    question: "Can I show my handwritten notes on the clock?",
    answer: "Currently, only text-based Todo items are supported. A 'Sticky Notes' feature is on the long-term roadmap for post-2027 development.",
  },
  {
    id: 45,
    question: "What does 'Project Restructuring' mean in your status?",
    answer: "It means the underlying code is being made more modular and efficient to ensure easier maintenance and fewer bugs in the long run.",
  },
  {
    id: 46,
    question: "What is Deep's favorite coding language?",
    answer: "Deep prefers TypeScript and Python for web/AI work, but chooses C# for high-performance desktop applications.",
  },
  {
    id: 47,
    question: "Why is the app installer size so small?",
    answer: "The app uses a framework-dependent architecture, which means it only ships the necessary application code without bundling the entire .NET runtime.",
  },
  {
    id: 48,
    question: "When was the app published on Uptodown?",
    answer: "Transparent Clock was officially listed on the Uptodown store in the early phase of 2026.",
  },
  {
    id: 49,
    question: "Does the app provide audio notifications?",
    answer: "Yes, the app uses native Windows system sounds to notify you when a Pomodoro focus or break session is completed.",
  },
  {
    id: 50,
    question: "What happens to these projects after you enter IIT?",
    answer: "Deep plans to use the advanced engineering knowledge gained at IIT to scale these apps into global SaaS products.",
  },
  {
    id: 51,
    question: "Why isn't HEIC image format supported in utilities?",
    answer: "Due to native Windows codec limitations, the image utility currently only supports standard formats like JPEG and PNG.",
  },
  {
    id: 52,
    question: "Where are the app's icons sourced from?",
    answer: "Most icons are from Lucide React or custom-designed SVGs, manually color-coded to match the 'Dark-Amber' palette.",
  },
  {
    id: 53,
    question: "Why is the architecture modular?",
    answer: "It allows for adding new features (like a new dashboard tab) without having to rewrite the entire system from scratch.",
  },
  {
    id: 54,
    question: "How can I find Deep Dey on LinkedIn?",
    answer: "You can search for the handle 'deepdeyiit' on LinkedIn to connect with him.",
  },
  {
    id: 55,
    question: "Where can I find the System Architecture documents?",
    answer: "The 'Projects' section of this portfolio provides a deep-dive PDF blueprint for every major tool built.",
  },
  {
    id: 56,
    question: "Does the app block background noise?",
    answer: "No, it is a visual productivity tool. For audio focus, Deep recommends his curated 'Sukoon' Spotify playlist.",
  },
  {
    id: 57,
    question: "Why are there quotes on the website loading screen?",
    answer: "They are designed to provide value and keep the user engaged while the heavy 3D assets of the portfolio load in the background.",
  },
  {
    id: 58,
    question: "What happened during the GitHub account flagging incident?",
    answer: "In April 2026, a high-volume backup script caused a temporary flag. Deep contacted GitHub support immediately to resolve and restore the account.",
  },
  {
    id: 59,
    question: "How does Deep manage JEE pressure?",
    answer: "Coding acts as a stress-buster for Deep. When he feels academic burnout, he shifts to designing system architectures for a while.",
  },
  {
    id: 60,
    question: "What is the next big project?",
    answer: "Currently, 'The Great Academic Grind' is the main project. Active software development will resume post-JEE 2027.",
  },
  {
    id: 61,
    question: "What is the role of 'main.py' in your static files repository?",
    answer: "It serves as the core execution engine for my Python-based automation scripts, handling task scheduling and internal system pings.",
  },
  {
    id: 62,
    question: "How does the Discord Bot handle continuous uptime?",
    answer: "The bot utilizes a 'keep-alive' logic combined with a Flask-based web server, allowing it to remain responsive 24/7 even on free-tier hosting.",
  },
  {
    id: 63,
    question: "What Python libraries are essential for your study tools?",
    answer: "I rely heavily on 'discord.py' for bot interactions, 'requests' for API communication, and 'Flask' for maintaining web hooks.",
  },
  {
    id: 64,
    question: "How does Transparent Clock interact with the Windows Registry?",
    answer: "The app only accesses the Registry to toggle the 'Run on Startup' feature. It does not modify system-critical keys to ensure stability.",
  },
  {
    id: 65,
    question: "What is the 'System Status' section in the Legal Hub?",
    answer: "It is a real-time (manually updated) tracker that shows which version of my digital ecosystem (V1 vs V2) is currently active and supported.",
  },
  {
    id: 66,
    question: "Why did you choose SQLite for local storage?",
    answer: "SQLite is serverless, zero-configuration, and extremely fast for local Windows apps. It ensures your study data stays on your PC, not a server.",
  },
  {
    id: 67,
    question: "Can I contribute to the FAQ or Documentation?",
    answer: "Due to the academic hiatus, I am not accepting pull requests. However, you can email suggestions to team.deepdey@gmail.com.",
  },
  {
    id: 68,
    question: "How does the '120fps Cinematic Marquee' affect CPU usage?",
    answer: "By using GPU acceleration (translate3d), the marquee offloads the heavy lifting from the CPU, keeping the portfolio smooth even on older laptops.",
  },
  {
    id: 69,
    question: "What are 'Static Files' in your ecosystem?",
    answer: "They are pre-rendered assets, scripts, and basic HTML pages that serve as backbones for secondary tools like my Discord bot's dashboard.",
  },
  {
    id: 70,
    question: "Is there an API available for Transparent Clock data?",
    answer: "Not currently. Since data is local SQLite, third-party API access is restricted to ensure user privacy and security.",
  },
  {
    id: 71,
    question: "What inspired the 'Radhe Radhe' branding in the index?",
    answer: "It reflects my personal spiritual values and provides a positive, peaceful vibe to my workspace and projects.",
  },
  {
    id: 72,
    question: "Does the portfolio work in offline mode?",
    answer: "As a React SPA, many assets are cached, but a connection is required to load dynamic data like my 3D PDF blueprints.",
  },
  {
    id: 73,
    question: "How do you handle HEIC to JPG conversion in tools?",
    answer: "I use custom C# wrappers that utilize Windows Imaging Component (WIC) codecs to process and convert modern image formats.",
  },
  {
    id: 74,
    question: "What is 'System Architecture' vs 'Web Development'?",
    answer: "Web dev is building the site; System Architecture is designing how the site, the bots, the apps, and the databases all communicate reliably.",
  },
  {
    id: 75,
    question: "How does the 'Focus Insights' algorithm calculate stats?",
    answer: "It uses a timestamp-delta logic. It records 'Start' and 'Pause' events and calculates the net productive seconds spent per session.",
  },
  {
    id: 76,
    question: "Is your Python code containerized?",
    answer: "Yes, I use Dockerfiles to ensure that my bots and scripts run exactly the same way on my local machine as they do in the cloud.",
  },
  {
    id: 77,
    question: "Why include a DMCA policy for a personal site?",
    answer: "To protect community-contributed assets and ensure a clear, legal path for intellectual property resolution within my projects.",
  },
  {
    id: 78,
    question: "How does Transparent Clock handle high-DPI displays?",
    answer: "WPF provides native DPI-awareness. The clock scales its vectors automatically so it looks sharp on 4K monitors.",
  },
  {
    id: 79,
    question: "What does 'Source Available' mean exactly?",
    answer: "It means you can see the code to learn from it, but you don't have the 'Open Source' right to modify or sell it as your own.",
  },
  {
    id: 80,
    question: "How do I report a security bug in your Discord Bot?",
    answer: "Please use the official security email: a@qlynk.me. Do not post vulnerability details on public Discord servers.",
  },
  {
    id: 81,
    question: "What is the 'QuickLink API Wrapper'?",
    answer: "It's a specialized class in my C# apps that converts a standard URL into a short 'qlynk.me' link using an authenticated POST request.",
  },
  {
    id: 82,
    question: "Does your Odoo store support international users?",
    answer: "The store is currently optimized for the Indian student community, focusing on JEE-specific resources and digital toolkits.",
  },
  {
    id: 83,
    question: "Why is 'Vercel' your preferred hosting platform?",
    answer: "Vercel offers elite performance, automatic SSL, and a seamless deployment pipeline that matches my architectural standards.",
  },
  {
    id: 84,
    question: "How does the '3D PDF Flipper' work technically?",
    answer: "It uses 'react-pdf' for rendering and Framer Motion's 'transform-style: preserve-3d' for the kinetic flipping animation.",
  },
  {
    id: 85,
    question: "Will you ever build a mobile app version of Transparent Clock?",
    answer: "Android/iOS versions are not in the immediate plan. The tool is designed specifically to keep students away from phone distractions.",
  },
  {
    id: 86,
    question: "How do you manage cross-language projects?",
    answer: "I use standardized JSON APIs and shared environment variables to ensure my Python bots and React frontend remain in sync.",
  },
  {
    id: 87,
    question: "What is the 'Prep Meter' contribution calendar?",
    answer: "Similar to a GitHub commit graph, it shows your study consistency. Green blocks represent days you hit your hourly JEE goals.",
  },
  {
    id: 88,
    question: "How does the bot handle Discord rate limits?",
    answer: "The 'bot.py' script includes an asynchronous back-off logic that waits and retries if too many requests are sent to Discord.",
  },
  {
    id: 89,
    question: "Can I use your custom SVG icons?",
    answer: "No. All custom-designed assets are protected under the copyright policy found in the Legal Hub.",
  },
  {
    id: 90,
    question: "What is 'Clean Architecture' in your context?",
    answer: "It's the practice of keeping logic (code) separate from data (JSON) so that updating a link doesn't require rebuilding the whole site.",
  },
  {
    id: 91,
    question: "How do you test your C# apps for bugs?",
    answer: "I use manual regression testing and custom log parsers to track app behavior during long study sessions.",
  },
  {
    id: 92,
    question: "What is the 'system-parsing' loading state?",
    answer: "It's a simulated progress phase (85% to 99%) on the loading screen that ensures all React components are fully mounted before showing the UI.",
  },
  {
    id: 93,
    question: "How can I find your old YouTube tutorials?",
    answer: "Most are archived or unlisted to reflect my current focus, but some legacy links remain in the 'Links' ecosystem.",
  },
  {
    id: 94,
    question: "Does the qlynk.me shortener track users?",
    answer: "We only track 'Click Counts' for analytics. We do not store IP addresses or personal browsing data of the people who click your links.",
  },
  {
    id: 95,
    question: "What was the biggest challenge in building the V2 portfolio?",
    answer: "Implementing page-specific SEO in a Single Page Application while maintaining high performance and smooth animations.",
  },
  {
    id: 96,
    question: "How does 'SplashForm.cs' work in your clock app?",
    answer: "It manages the initial loading screen of the Windows app, checking for updates and initializing the database before the main UI appears.",
  },
  {
    id: 97,
    question: "Is there any cost to use your tools?",
    answer: "Basic versions of my tools are free for students. Some advanced features or physical resources may be available on the Odoo store.",
  },
  {
    id: 98,
    question: "How do you handle 'Dark-Amber' color consistency?",
    answer: "I use a global Tailwind config with custom 'brand-amber' and 'brand-zinc' hex codes used across all projects.",
  },
  {
    id: 99,
    question: "What is the purpose of the 'requirements.txt' file?",
    answer: "It lists all the Python dependencies needed to run my automation scripts, ensuring a consistent environment across different machines.",
  },
  {
    id: 100,
    question: "Is 'Deep Dey' your real name?",
    answer: "Yes, Deep Dey is my real name. I use it across all my professional and academic platforms.",
  },
  {
    id: 101,
    question: "How does the 'Vertical Timeline' know it's 2027?",
    answer: "It doesn't 'know' the future; it reads the system clock and uses a JavaScript condition to highlight the year that matches the current date.",
  },
  {
    id: 102,
    question: "What happens if I forget my Odoo store password?",
    answer: "You can use the standard Odoo 'Reset Password' link, or contact the Odoo support node for account recovery.",
  },
  {
    id: 103,
    question: "How do you organize your TypeScript interfaces?",
    answer: "I keep them in the same file as the data (e.g., `linksData.ts`) to ensure that the data structures are always strictly typed.",
  },
  {
    id: 104,
    question: "Why target IIT Gandhinagar as a secondary option?",
    answer: "IITGN has a very modern campus and a strong focus on interdisciplinary engineering, which aligns with my interest in AI and System Design.",
  },
  {
    id: 105,
    question: "Does 'Transparent Clock' support multiple Todo lists?",
    answer: "In the current version, it supports one centralized list. Multi-list support is a feature planned for a future major release.",
  },
  {
    id: 106,
    question: "How do you handle 'responsive design' for the 3D elements?",
    answer: "I use conditional scaling. If the screen width is less than 768px, the 3D flip intensity is reduced to ensure readability.",
  },
  {
    id: 107,
    question: "What is the 'bot.py' script doing currently?",
    answer: "It manages the real-time study-hour tracking for my private Discord community and synchronizes it with my internal logs.",
  },
  {
    id: 108,
    question: "How do you balance 12h of study with project maintenance?",
    answer: "I don't. Maintenance is restricted to 30 minutes a week. 99% of my time is strictly for PCM (Physics, Chemistry, Maths).",
  },
  {
    id: 109,
    question: "Are your blueprints accurate?",
    answer: "They are architectural blueprints, meaning they represent the *structure* and *flow* of the software rather than every single line of code.",
  },
  {
    id: 110,
    question: "What is your message to other student developers?",
    answer: "Focus on the foundation. C# or React is easy to learn once you master the logic and discipline required for high-level engineering.",
  },
  {
    id: 111,
    question: "What is the primary tech stack behind QuickLink (qlynk.me)?",
    answer: "QuickLink is built using a high-performance stack comprising Node.js and Express for the backend, TypeScript for type-safe logic, and Vercel for edge-network deployments.",
  },
  {
    id: 112,
    question: "How does the URL shortening logic handle collisions?",
    answer: "The system uses a Base62 encoding algorithm combined with a unique database ID to ensure that every short alias generated is mathematically unique.",
  },
  {
    id: 113,
    question: "Is there a limit to how many links I can shorten?",
    answer: "For standard users, there is a generous soft limit. High-volume users or developers can request API keys for extended rate limits via the Contact page.",
  },
  {
    id: 114,
    question: "How does the 'Custom Alias' feature work?",
    answer: "Users can specify a preferred keyword. The system checks the database in real-time; if the alias is available, it is reserved instantly for that destination URL.",
  },
  {
    id: 115,
    question: "Does QuickLink support password-protected links?",
    answer: "Currently, QuickLink focuses on speed and public redirection. Advanced security features like password protection are part of the post-2027 technical roadmap.",
  },
  {
    id: 116,
    question: "What makes the QuickLink QR Generator different?",
    answer: "It is directly integrated with the shortening engine. When you shorten a link, a corresponding high-resolution QR code is generated automatically without extra steps.",
  },
  {
    id: 117,
    question: "How do you handle expired or 'Dead' links?",
    answer: "Our system periodically pings destination URLs. If a link remains 404 for an extended period, it is flagged for review to keep the ecosystem clean.",
  },
  {
    id: 118,
    question: "Are QuickLink redirects 'Permanent' (301) or 'Temporary' (302)?",
    answer: "We primarily use 301 Permanent Redirects for SEO benefits, ensuring that the link juice from the short URL is passed to the destination site.",
  },
  {
    id: 119,
    question: "Can I track the geographic location of clicks?",
    answer: "To maintain our strict privacy policy, we only provide total click counts. We do not track or store the IP-based locations of individual visitors.",
  },
  {
    id: 120,
    question: "How is the QuickLink API authenticated?",
    answer: "Developers use a Bearer Token system. You must include your unique API Key in the 'Authorization' header for all POST requests.",
  },
  {
    id: 121,
    question: "What is the uptime SLA for qlynk.me servers?",
    answer: "By utilizing Vercel's global edge network, we maintain a 99.9% uptime, ensuring your redirects work from anywhere in the world at any time.",
  },
  {
    id: 122,
    question: "How does QuickLink prevent spam and phishing?",
    answer: "We use automated blocklists and manual reporting. Any link redirecting to known malicious domains is instantly disabled by our security node.",
  },
  {
    id: 123,
    question: "Is there a way to edit a destination URL after shortening?",
    answer: "Currently, links are immutable once generated to prevent 'bait-and-switch' tactics. You must create a new short link for a new destination.",
  },
  {
    id: 124,
    question: "How does the Discord Bot integrate with QuickLink?",
    answer: "The bot uses our internal API to shorten links directly from the chat interface, allowing students to share resources without cluttered messages.",
  },
  {
    id: 125,
    question: "What format does the API return data in?",
    answer: "The API returns standardized JSON objects, making it easy to parse in Python, JavaScript, C#, or any modern programming language.",
  },
  {
    id: 126,
    question: "Is QuickLink's database scalable?",
    answer: "Yes, we use a cloud-native database architecture that can scale to millions of records without increasing redirection latency.",
  },
  {
    id: 127,
    question: "What was the inspiration behind the name 'QuickLink'?",
    answer: "The name reflects our core architectural goal: providing the fastest path from a complex URL to a simplified, shareable digital hook.",
  },
  {
    id: 128,
    question: "Does the system support 'Dark Mode' for QR codes?",
    answer: "Yes, you can generate inverted QR codes (white on dark background) to match high-end dark-themed presentations and sites.",
  },
  {
    id: 129,
    question: "How do you manage cross-origin (CORS) requests?",
    answer: "Our backend is configured with strict CORS policies to allow requests only from authorized domains and tools within the Deep Dey ecosystem.",
  },
  {
    id: 130,
    question: "Why use Vercel for a backend instead of a dedicated VPS?",
    answer: "Serverless functions on Vercel provide better latency for global users and require zero server maintenance, allowing me to focus 100% on JEE prep.",
  },
  {
    id: 131,
    question: "How are short aliases validated for safety?",
    answer: "The system runs a regex filter on all custom aliases to prevent the use of offensive language or system-reserved keywords like /admin.",
  },
  {
    id: 132,
    question: "Can I use the QuickLink API for commercial apps?",
    answer: "Commercial use of the API is currently restricted. Please refer to the Custom License in the Legal Hub for specific educational usage terms.",
  },
  {
    id: 133,
    question: "Does QuickLink use cookies?",
    answer: "No. QuickLink is a cookie-less platform. We do not track sessions or store user behavior data via browser cookies.",
  },
  {
    id: 134,
    question: "How does the 'Bulk Shortening' tool work?",
    answer: "It is a utility script that processes a JSON array of URLs and returns a mapped array of short links in a single batch operation.",
  },
  {
    id: 135,
    question: "What is the maximum length for a destination URL?",
    answer: "The system supports URLs up to 2048 characters, covering even the most complex tracking and deep-link parameters.",
  },
  {
    id: 136,
    question: "Is the QuickLink frontend SEO optimized?",
    answer: "Yes, the landing page uses server-side rendering (SSR) principles to ensure that search engines can easily index our tools and services.",
  },
  {
    id: 137,
    question: "How do you handle API rate limiting?",
    answer: "We use a sliding-window algorithm that limits requests per IP to prevent DDoS attacks and ensure fair usage for the entire student community.",
  },
  {
    id: 138,
    question: "Will QuickLink support custom domains in the future?",
    answer: "Post-2027, I plan to introduce 'Branded Links' where users can connect their own domains to our shortening engine.",
  },
  {
    id: 139,
    question: "How does the 'Check Status' page work?",
    answer: "It executes a lightweight health check across our Vercel functions and database nodes to report real-time system performance.",
  },
  {
    id: 140,
    question: "Is the QuickLink source code available on GitHub?",
    answer: "Yes, you can find the repository at github.com/deepdeyiitgn/QuickLink-URL-Shortener for educational review.",
  },
  {
    id: 141,
    question: "What is the 'Radhe Radhe' easter egg in the code?",
    answer: "It is a hidden comment in the source code headers, serving as a personal blessing and a reminder of my values during late-night coding.",
  },
  {
    id: 142,
    question: "Does QuickLink support UTM parameter preservation?",
    answer: "Yes, any UTM tags or tracking parameters attached to the long URL are preserved perfectly through the redirection process.",
  },
  {
    id: 143,
    question: "How do you handle system updates without downtime?",
    answer: "I use Vercel's 'Instant Rollback' and 'Atomic Deployments,' ensuring that nary a single redirect is missed during an update.",
  },
  {
    id: 144,
    question: "Why is the qlynk.me domain so short?",
    answer: "A shorter domain reduces the total character count of the final link, which is crucial for SMS marketing and character-limited social bios.",
  },
  {
    id: 145,
    question: "Can I report a broken link?",
    answer: "Yes, you can use the 'Report Abuse/Issue' form in the Contact section to alert us about any technical failures or malicious links.",
  },
  {
    id: 146,
    question: "Is the QR code SVG or PNG?",
    answer: "Our system defaults to SVG for the highest possible quality and scalability, though PNG versions are available for mobile downloads.",
  },
  {
    id: 147,
    question: "How does the 'Auto-Copy' feature work?",
    answer: "It utilizes the modern Navigator Clipboard API to instantly save the shortened link to your clipboard upon successful generation.",
  },
  {
    id: 148,
    question: "What is the difference between qlynk.me and qlynk.vercel.app?",
    answer: "qlynk.me is our primary production domain, while the Vercel URL serves as a secondary mirror and deployment preview environment.",
  },
  {
    id: 149,
    question: "Are there any ads on the redirection page?",
    answer: "No. QuickLink is 100% ad-free. We believe redirects should be instant and non-intrusive for the best user experience.",
  },
  {
    id: 150,
    question: "How do you handle 'HTTPS' for all shortened links?",
    answer: "All qlynk.me links are forced over HTTPS using HSTS (HTTP Strict Transport Security) to ensure encrypted communication for every user.",
  },
  {
    id: 151,
    question: "How does the 'Advanced Dashboard' (V1) differ from V2?",
    answer: "V1 was a standalone tool; V2 is now integrated into the central portfolio architecture for a more unified developer experience.",
  },
  {
    id: 152,
    question: "Is there a limit on Custom Alias characters?",
    answer: "Aliases must be between 3 and 20 characters to ensure they remain 'short' while allowing for enough unique combinations.",
  },
  {
    id: 153,
    question: "How does QuickLink help JEE aspirants?",
    answer: "It allows students to organize massive libraries of PDF drives, lecture links, and mock tests into a few simple, easy-to-remember short links.",
  },
  {
    id: 154,
    question: "What language is the API written in?",
    answer: "The API logic is written in TypeScript, ensuring that all data inputs and outputs are strictly validated before processing.",
  },
  {
    id: 155,
    question: "Can I see my history of shortened links?",
    answer: "For privacy reasons, we do not store a public history. Users are encouraged to save their short links locally after generation.",
  },
  {
    id: 156,
    question: "How is the 'Loading Quote' selected for QuickLink?",
    answer: "It uses a Math.random() seed to pick an inspiring quote from our 'Deep Archive' of 150+ academic and tech-focused sayings.",
  },
  {
    id: 157,
    question: "Does qlynk.me support deep-linking for apps?",
    answer: "Yes, it can redirect to app-specific protocols (like discord:// or intent://) just as easily as standard web URLs.",
  },
  {
    id: 158,
    question: "How do you prevent 'Link Rot' in the system?",
    answer: "By using a redundant cloud database, we ensure that as long as the internet is running, your qlynk.me redirects will remain active.",
  },
  {
    id: 159,
    question: "What is the 'Developer Node' in your Contact page?",
    answer: "It is a specialized intake channel for fellow engineers to discuss the QuickLink API, integration bugs, or architectural improvements.",
  },
  {
    id: 160,
    question: "What is the final goal for the QuickLink project?",
    answer: "To become the most trusted, student-centric productivity hub in India, helping millions navigate their digital academic journeys with ease.",
  },
  {
    id: 161,
    question: "What is the primary function of the DeepDey Discord Bot?",
    answer: "The bot, often referred to as StudyBot, is a comprehensive productivity tool designed to help students track study hours, manage Pomodoro sessions, and engage with AI-driven academic assistance directly within Discord.",
  },
  {
    id: 162,
    question: "How does the bot track study hours?",
    answer: "It uses a voice-channel monitoring system. When a user joins a designated 'Study Room,' the bot records the entry time and calculates the total duration once the user leaves or the session is manually ended.",
  },
  {
    id: 163,
    question: "What is the 'Global Leaderboard' feature?",
    answer: "The Leaderboard ranks users based on their cumulative study minutes. It fosters healthy competition within the student community, encouraging consistency in JEE preparation.",
  },
  {
    id: 164,
    question: "How is Google Gemini integrated into the bot?",
    answer: "The bot uses the Gemini API (via cogs/gemini_reply.py) to provide intelligent answers to student doubts. It can process text-based queries and provide structured explanations for complex problems.",
  },
  {
    id: 165,
    question: "What is a 'Cog' in the bot's architecture?",
    answer: "Cogs are modular Python classes used by the discord.py library to organize commands and listeners. Each feature (like music, focus, or admin) is contained in its own Cog for easier maintenance.",
  },
  {
    id: 166,
    question: "How does the bot handle database operations?",
    answer: "The bot utilizes MongoDB for cloud-based data storage, ensuring that user study stats, preferences, and leaderboards are persisted across restarts.",
  },
  {
    id: 167,
    question: "What is the 'Focus Mode' command?",
    answer: "The /focus command allows users to set a specific study goal. During this time, the bot can restrict certain interactions or provide periodic reminders to keep the user on track.",
  },
  {
    id: 168,
    question: "How does the bot stay online 24/7 on free hosting?",
    answer: "It employs a Flask web server (utils/web_server.py) that provides a 'pingable' endpoint. External services like UptimeRobot ping this URL every few minutes to prevent the hosting instance from sleeping.",
  },
  {
    id: 169,
    question: "What does the 'self_ping.py' cog do?",
    answer: "It is an internal utility that periodically sends requests to the bot's own web server to ensure the asynchronous event loop remains active and responsive.",
  },
  {
    id: 170,
    question: "Can the bot play music in study rooms?",
    answer: "Yes, the Music Cog (cogs/music.py) allows users to play Lo-Fi and study-centric tracks to help improve concentration during long sessions.",
  },
  {
    id: 171,
    question: "How are 'Study Streaks' calculated?",
    answer: "The bot checks if a user has recorded a minimum study session duration every 24 hours. If they hit the goal daily, their streak increment is displayed on their profile.",
  },
  {
    id: 172,
    question: "What is the 'Mentor' feature?",
    answer: "The Mentor Cog (cogs/mentor.py) provides automated guidance and motivational prompts based on the user's recent study performance and goals.",
  },
  {
    id: 173,
    question: "How does the bot handle 'AFK' status?",
    answer: "Users can use /afk to let others know they are away. The bot automatically clears the AFK status once the user sends a message or rejoins a study room.",
  },
  {
    id: 174,
    question: "What is the 'Auto-Reply' system?",
    answer: "It is a customizable trigger system (data/autoreply.json) that allows the bot to respond to specific keywords with helpful links or community guidelines.",
  },
  {
    id: 175,
    question: "How do you ensure user privacy on the Discord bot?",
    answer: "The bot only stores Discord IDs and study-related timestamps. It does not record voice conversations or personal chat history outside of specific doubt-clearing sessions.",
  },
  {
    id: 176,
    question: "What is the 'Doubt Room' logic?",
    answer: "In Doubt Rooms, the bot prioritizes AI-driven doubt clearing (Gemini) and notifies available mentors or high-ranking students to assist.",
  },
  {
    id: 177,
    question: "How does 'cogs/activity.py' track engagement?",
    answer: "It monitors message frequency and voice activity to assign 'Experience Points' (XP), which help users level up within the community hierarchy.",
  },
  {
    id: 178,
    question: "What happens if the bot loses connection to MongoDB?",
    answer: "The bot includes a 'retry' logic in utils/mongo.py. If the connection fails, it attempts to reconnect while logging the error locally to prevent data loss.",
  },
  {
    id: 179,
    question: "What are 'Focus Rooms'?",
    answer: "These are dynamic voice channels managed by the bot. They are created or managed to ensure that study environments remain quiet and productive.",
  },
  {
    id: 180,
    question: "How does the bot handle Discord Slash Commands?",
    answer: "It uses the modern app_commands tree from discord.py, which provides a native UI in the Discord client for easier interaction compared to old prefix commands.",
  },
  {
    id: 181,
    question: "What is the purpose of 'utils/timeutil.py'?",
    answer: "It is a helper module that standardizes timezone conversions (like UTC to IST) and formats duration strings (e.g., converting 3600 seconds to '1 Hour').",
  },
  {
    id: 182,
    question: "Can I host a copy of this bot myself?",
    answer: "While the source is available for viewing, self-hosting requires your own API keys for Discord, MongoDB, and Gemini, as per the Custom Restricted License.",
  },
  {
    id: 183,
    question: "How does 'cogs/reminders.py' work?",
    answer: "It uses a background task loop to check the database for scheduled reminders and sends a Direct Message (DM) to the user when the time expires.",
  },
  {
    id: 184,
    question: "What is the 'Bot Landing Page'?",
    answer: "Located at bot.qlynk.me, it provides a web-based dashboard where users can see global stats and invite the bot to their own servers.",
  },
  {
    id: 185,
    question: "How does the bot prevent command spam?",
    answer: "I've implemented Cooldown decorators on all major commands, limiting how frequently a single user can trigger heavy operations like AI queries.",
  },
  {
    id: 186,
    question: "What is the 'Coach' feature (cogs/coach.py)?",
    answer: "It is an advanced personality for the bot that uses AI to analyze a user's study patterns and offer harsh but effective 'tough love' motivation.",
  },
  {
    id: 187,
    question: "How does the bot manage environment variables?",
    answer: "It uses a .env file and the 'python-dotenv' library to securely load sensitive tokens without hardcoding them into the source code.",
  },
  {
    id: 188,
    question: "What is 'cogs/games.py' used for?",
    answer: "It provides light academic games like Math Quizzes and Word Scrambles to help students take productive breaks without leaving the study environment.",
  },
  {
    id: 189,
    question: "How does the 'Uploader' Cog work?",
    answer: "It allows authorized admins to upload static assets or configuration files directly to the server via Discord attachments for quick updates.",
  },
  {
    id: 190,
    question: "Why use 'Asynchronous' programming for the bot?",
    answer: "Async allows the bot to handle hundreds of users simultaneously. It can wait for a database response or an AI reply without freezing the rest of the commands.",
  },
  {
    id: 191,
    question: "What is the 'Health' command?",
    answer: "It checks the bot's internal status, including latency (heartbeat), database connectivity, and the current version of the architecture.",
  },
  {
    id: 192,
    question: "How are 'Study Groups' managed?",
    answer: "The bot allows users to join 'Study Clans.' Total study hours of all clan members are aggregated to compete on a Clan Leaderboard.",
  },
  {
    id: 193,
    question: "What does 'cogs/instagram.py' do?",
    answer: "It uses webhooks to notify the Discord server whenever I post new photography or tech updates on @captivatedeep or @justdeepdey.",
  },
  {
    id: 194,
    question: "How do you handle bot errors?",
    answer: "The bot has a global error handler that catches command failures and sends a user-friendly message while logging the full traceback for my review.",
  },
  {
    id: 195,
    question: "What is the 'Study Guide' feature?",
    answer: "It is a curated database of JEE resources (Physics Wallah links, PDF drives) accessible via the /studyguide command.",
  },
  {
    id: 196,
    question: "How does the bot interact with qlynk.me?",
    answer: "The bot has a dedicated QuickLink Cog that allows users to shorten URLs and generate QR codes directly within a Discord channel.",
  },
  {
    id: 197,
    question: "What is 'utils/cog_manager.py'?",
    answer: "It is a management script that allows me to load, unload, or reload Cogs without restarting the entire bot—crucial for hot-patching bugs.",
  },
  {
    id: 198,
    question: "How are 'Voice Levels' calculated?",
    answer: "Users earn XP every minute they are active in a voice channel with at least one other person, preventing solo-farming of levels.",
  },
  {
    id: 199,
    question: "What is the 'Planner' Cog?",
    answer: "It allows users to set daily study targets (e.g., 'Do 50 MCQ'). The bot then checks in at the end of the day to see if the goal was met.",
  },
  {
    id: 200,
    question: "Why did you build the bot in Python instead of C#?",
    answer: "While my desktop apps use C#, Python is the industry standard for Discord bots due to its superior async libraries and AI integration capabilities.",
  },
  {
    id: 201,
    question: "How does 'cogs/reactions.py' work?",
    answer: "It manages 'Reaction Roles,' allowing users to self-assign roles (like Class 11, Class 12, or JEE Aspirant) by clicking on emoji reactions.",
  },
  {
    id: 202,
    question: "What is the 'Self-Update' mechanism?",
    answer: "I use GitHub Webhooks. When I push a change to the bot's repository, the server pulls the latest code and reloads the modified Cogs automatically.",
  },
  {
    id: 203,
    question: "How do you handle API outages (like Gemini)?",
    answer: "The bot includes fallback logic. If Gemini is down, it can provide basic pre-programmed study tips or suggest peer-to-peer help rooms.",
  },
  {
    id: 204,
    question: "What is the 'Motivation' Cog?",
    answer: "It sends daily quotes from the 50-set database to a dedicated #motivation channel to keep the community spirits high.",
  },
  {
    id: 205,
    question: "Can I block the bot from DM-ing me?",
    answer: "Yes, you can toggle bot notifications in your personal settings, and the bot will respect your privacy for reminders and level-ups.",
  },
  {
    id: 206,
    question: "What is 'utils/web_server.py'?",
    answer: "It is a micro-service running alongside the bot that serves a simple 'I am alive' text page for monitoring tools.",
  },
  {
    id: 207,
    question: "How are custom emojis handled?",
    answer: "The bot uses a configuration file that maps emoji IDs to actions, ensuring the UI looks premium with custom 'Dark-Amber' themed icons.",
  },
  {
    id: 208,
    question: "What is the 'StudyBot Intro' (cogs/studybot_intro.py)?",
    answer: "It is a cinematic onboarding sequence for new members, explaining how to use the focus rooms and track their hours effectively.",
  },
  {
    id: 209,
    question: "How do you manage the bot's logs?",
    answer: "Logs are categorized into 'General,' 'Errors,' and 'Moderation.' They are stored in a rotating file system to manage server storage efficiently.",
  },
  {
    id: 210,
    question: "What is the future of StudyBot?",
    answer: "Post-2027, I plan to integrate the bot more deeply with the Transparent Clock desktop app for a unified cross-platform study ecosystem.",
  },
  // Final Legendary Batch (211 - 260): The Human behind the Code & Personal Identity

  {
    id: 211,
    question: "Where is Deep Dey originally from?",
    answer: "Deep is from Dharmanagar, a town in the North Tripura district of Tripura, India. His journey from a small town to building global-standard software defines his ambition.",
  },
  {
    id: 212,
    question: "What is the significance of 'Radhe Radhe' in your projects?",
    answer: "It is a reflection of Deep's spiritual grounding. It serves as a reminder to stay humble, peaceful, and dedicated to one's path while navigating the high-pressure world of tech and academics.",
  },
  {
    id: 213,
    question: "Why did you switch from TBSE to CBSE for Class 11 and 12?",
    answer: "The switch to Golden Valley High School (CBSE) was a strategic decision to better align his curriculum with the national JEE Advanced requirements and gain a competitive edge.",
  },
  {
    id: 214,
    question: "What is Deep's '1% Rule' mentioned in the portfolio?",
    answer: "It refers to his motto: '100% effort + extra 1% = Dream Achieved.' The 'extra 1%' represents the discipline to do one more problem or fix one more bug when everyone else stops.",
  },
  {
    id: 215,
    question: "How did Minecraft influence your engineering career?",
    answer: "Hosting local Bedrock servers for his brother and managing family networking wasn't just gaming; it was Deep's first lesson in server management, RAM allocation, and latency optimization.",
  },
  {
    id: 216,
    question: "Does Deep provide tech support for his family?",
    answer: "Yes. From setting up serial-streaming servers for his grandmother to troubleshooting family networking, Deep applies his skills to make technology accessible for his loved ones.",
  },
  {
    id: 217,
    question: "What was the 'YouTube Phase' of your journey?",
    answer: "Between 2020 and 2023, Deep operated as 'Tarzan The Gamer,' creating Minecraft content. This phase taught him the basics of video editing, community engagement, and digital branding.",
  },
  {
    id: 218,
    question: "Why is IIT Kharagpur (KGP) the primary target?",
    answer: "IIT KGP's rich history in Computer Science and its elite alumni network perfectly match Deep's vision of becoming a global Software Architect.",
  },
  {
    id: 219,
    question: "What does 'The Architect's Methodology' mean on the About page?",
    answer: "It refers to Deep's approach of using AI as a leverage tool—where he provides the high-level system architecture and uses LLMs to handle the heavy lifting of code generation.",
  },
  {
    id: 220,
    question: "How does Deep manage 12+ hours of JEE study daily?",
    answer: "Through extreme time-blocking and digital discipline. He uses his own Transparent Clock app to ensure not a single minute is wasted during his Physics Wallah sessions.",
  },
  {
    id: 221,
    question: "What is the 'Coming Soon' teal page in your projects?",
    answer: "It was a hype-driven landing page for a new AI project. While development is on hiatus, the page remains as a testament to his design-first approach.",
  },
  {
    id: 222,
    question: "Why is the portfolio aesthetic specifically 'Dark-Amber'?",
    answer: "Amber represents energy and focus, while the dark background represents the 'late-night' grind of a developer. Together, they create a premium, non-distracting environment.",
  },
  {
    id: 223,
    question: "Who is Deep's biggest academic inspiration?",
    answer: "He draws inspiration from the disciplined teaching methods of Physics Wallah mentors, specifically those in the Arjuna and Manzil batches.",
  },
  {
    id: 224,
    question: "Does Deep Dey do photography professionally?",
    answer: "It is currently a high-level creative pursuit. You can see his detail-oriented eye for visuals on his dedicated photography profile, @captivatedeep.",
  },
  {
    id: 225,
    question: "What was the 'GitHub Flagging' incident in April 2026?",
    answer: "A high-volume API request from a repository backup script caused an automatic flag. Deep resolved this within hours by providing technical documentation to GitHub Support.",
  },
  {
    id: 226,
    question: "Why is the 'Odoo' store replacing the Google Site?",
    answer: "Odoo provides a more professional ERP and e-commerce structure, allowing for better inventory management of digital resources and student tools.",
  },
  {
    id: 227,
    question: "What is the 'Sukoon' playlist used for?",
    answer: "It is a curated set of instrumental and calming tracks Deep uses to enter a 'Flow State' during intense Mathematics and Physics problem-solving sessions.",
  },
  {
    id: 228,
    question: "How old is Deep Dey currently?",
    answer: "Born in 2008, Deep is currently 17-18 years old, making him one of the youngest self-taught System Architects in his region.",
  },
  {
    id: 229,
    question: "Can I contact Deep for personal advice on JEE?",
    answer: "Due to his own intense schedule, he may not reply immediately, but you can leave a message on the 'General Comm' node of his Contact page.",
  },
  {
    id: 230,
    question: "What is the future of 'qlynk.me'?",
    answer: "Post-2027, Deep envisions qlynk.me as a full-scale productivity suite that bridges the gap between AI automation and daily student life.",
  },
  {
    id: 231,
    question: "Is Deep's sister also in the tech field?",
    answer: "Yes, his sister is a BCA student at IGNOU and also serves in the postal service, reflecting a family culture of education and service.",
  },
  {
    id: 232,
    question: "Why is there a mention of 'Durga Puja' in personal interests?",
    answer: "It is the most significant festival in Tripura. For Deep, it represents a time of cultural connection, family bonding, and a mental reset before returning to the grind.",
  },
  {
    id: 233,
    question: "What is the 'Digital Genesis' milestone in 2020?",
    answer: "It marks the exact moment Deep started his online journey, transitioning from a consumer of technology to a creator and developer.",
  },
  {
    id: 234,
    question: "Why is there a 'Hiatus' banner on all projects?",
    answer: "To manage user expectations. Deep believes in 'Extreme Focus'—right now, that focus belongs to JEE 2027, not feature updates.",
  },
  {
    id: 235,
    question: "What is the 'Blue-Check' status on some links?",
    answer: "It represents verified nodes within the DeepDeyIIT ecosystem that have passed security and performance audits.",
  },
  {
    id: 236,
    question: "How does Deep handle 'Anti-Debugging' on his sites?",
    answer: "He uses custom scripts that detect browser dev-tools opening, protecting his UI logic and preventing unauthorized scraping of his digital blueprints.",
  },
  {
    id: 237,
    question: "Does Deep believe in AI replacing developers?",
    answer: "No. He believes AI will replace developers who don't know how to use AI. He advocates for the 'AI-Partner' model of development.",
  },
  {
    id: 238,
    question: "What is his favorite Physics topic?",
    answer: "Deep has a strong affinity for Mechanics and Electromagnetism, as they represent the fundamental 'Architecture' of the physical world.",
  },
  {
    id: 239,
    question: "What is the 'V2 Portfolio' build date?",
    answer: "The cinematic V2 architecture was finalized and deployed on April 20, 2026, marking a new era of his digital identity.",
  },
  {
    id: 240,
    question: "Can I request a custom feature for Transparent Clock?",
    answer: "You can submit requests via the Contact page, but note that they will only be reviewed and implemented after the 2027 academic phase.",
  },
  {
    id: 241,
    question: "Does Deep use a specialized keyboard for coding?",
    answer: "He focuses more on system efficiency than hardware, though he prefers a setup that minimizes friction during 12-hour study/code sessions.",
  },
  {
    id: 242,
    question: "Why target London in the 'Travel' section?",
    answer: "London represents a global hub of history and modern innovation, a dream destination that fuels Deep's desire for international success.",
  },
  {
    id: 243,
    question: "How does Deep handle software versioning?",
    answer: "He uses a Date-Based versioning system (e.g., v08.02.2026) for his apps to give users immediate clarity on how 'fresh' the build is.",
  },
  {
    id: 244,
    question: "What is the 'Guard' layer in your Spotify widgets?",
    answer: "It is a transparent CSS overlay that prevents accidental clicks and scrolls on the iframe, keeping the user focused on the main content.",
  },
  {
    id: 245,
    question: "What is Deep's view on 'Open Source'?",
    answer: "He respects the community but prefers 'Source Available' for his personal projects to prevent clones and maintain the integrity of his work.",
  },
  {
    id: 246,
    question: "Does the portfolio use any external fonts?",
    answer: "It primarily uses high-performance system fonts and 'Times New Roman' for the Wiki section to give it an authoritative, academic feel.",
  },
  {
    id: 247,
    question: "How is 'Glassmorphism' used in the UI?",
    answer: "By using backdrop-blur and semi-transparent zinc-900 backgrounds, the UI feels deep and futuristic without losing readability.",
  },
  {
    id: 248,
    question: "What is the 'System Year Sensor'?",
    answer: "A piece of logic in the Home page that automatically highlights the current year in the vertical timeline, making the site self-updating.",
  },
  {
    id: 249,
    question: "Is there a 'Secret' on the site?",
    answer: "As an Architect, Deep often leaves 'Easter Eggs' in the code comments and console logs. Only fellow developers might find them.",
  },
  {
    id: 250,
    question: "What is the ultimate goal of this portfolio?",
    answer: "To serve as a 'Digital Headquarters'—a single source of truth for Deep Dey's projects, values, and his journey toward IIT and beyond.",
  },
  {
    id: 251,
    question: "How does Deep handle DNS management?",
    answer: "He uses Cloudflare for high-security DNS routing, ensuring his domains like qlynk.me are protected from DDoS and DNS poisoning.",
  },
  {
    id: 252,
    question: "What is the 'Modular Pattern v4.2'?",
    answer: "Deep's internal coding standard that prioritizes splitting every feature into small, reusable components that can be updated independently.",
  },
  {
    id: 253,
    question: "Does the site support 'Reduced Motion'?",
    answer: "Yes, the CSS includes media queries to disable heavy animations for users who have motion sensitivity settings enabled in their OS.",
  },
  {
    id: 254,
    question: "Why use 'Lucide React' for icons?",
    answer: "Lucide icons are lightweight, customizable, and match the 'System Dashboard' look better than standard heavy icon packs.",
  },
  {
    id: 255,
    question: "How does Deep keep his MongoDB safe?",
    answer: "He uses IP-whitelisting and secure environment variables, ensuring that only his authorized bot and server can access user data.",
  },
  {
    id: 256,
    question: "What is the 'Human Archive' narrative?",
    answer: "Found on the /me page, it treats Deep's life as a structured archive, merging his human emotions with his robotic work discipline.",
  },
  {
    id: 257,
    question: "Why include 'ISKCON Bhiwandi' in the links?",
    answer: "It reflects Deep's support for spiritual and community welfare organizations that align with his personal values of service.",
  },
  {
    id: 258,
    question: "What happens to the portfolio during 12th Board exams?",
    answer: "It remains in 'Read-Only' stability mode. No new code is pushed during exam weeks to ensure zero distractions.",
  },
  {
    id: 259,
    question: "Is Deep Dey active on Instagram currently?",
    answer: "Mainly for photography and tech updates, but personal engagement is limited to prioritize his 2027 JEE mission.",
  },
  {
    id: 260,
    question: "What is the final message of the FAQ?",
    answer: "Technology is just a tool; the real power lies in the discipline and vision of the person using it. Stay focused, stay humble. Radhe Radhe.",
  },
];
