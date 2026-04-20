/* PRESET SVG LOGOS 
   These are common architectural icons for social nodes and platforms.
*/

export interface LinkItem {
  id: string;
  category: 'DeepDeyIITK Ecosystem' | 'JEE Journey & Studies' | 'Content & Chill' | 'Support & Community' | 'Social Links';
  title: string;
  description: string;
  url: string;
  isSvg: boolean;
  logoUrlOrSvgCode: string;
}

export const linksData: LinkItem[] = [
  // DeepDeyIITK Ecosystem
  {
    id: 'deepdey-official',
    category: 'DeepDeyIITK Ecosystem',
    title: 'DeepDeyIITK Website',
    description: 'The central hub for all technical and academic ventures.',
    url: 'https://www.deepdeyiitk.com/',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm-2 19.349v-1.106c-1.42 1.343-3 2.378-5 1.5-1.5-.658-2-2-1.5-3.5 1.5-.5 3 0 4 1.5 2 3.5 4 0 2.5-4h-2v1.1l2.1 2.1c-.139 1.137-.419 2.146-1 3zm11.5-1.5c-4 5-9 3.5-9 3.5s7-8.5 4.5-9.5c-1-.5-2 1-3.5 3s-3.5 3-4.5 1.5-1-4 1.5-6.5c1.5-1.5 3-2 5-2s4 .5 5 1.5c4.5 5 1 8.5 1 8.5z"/></svg>'
  },
  {
    id: 'study-bot',
    category: 'DeepDeyIITK Ecosystem',
    title: 'Discord Study Bot',
    description: 'Automated academic tools for global student communities.',
    url: 'https://studybots.vercel.app/',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 5v-1h-2v1h-1v-1h-2v1h-1v-1h-2v1h-1v-1h-2v1h-1c-1.104 0-2 .896-2 2v1h-1v2h1v1h-1v2h1v1h-1v2h1v1c0 1.104.896 2 2 2h1v1h2v-1h1v1h2v-1h1v1h2v-1h1v1h2v-1h1c1.104 0 2-.896 2-2v-1h1v-2h-1v-1h1v-2h-1v-1h1v-2h-1v-1c0-1.104-.896-2-2-2h-1zm-1 12h-8v-8h8v8z"/></svg>'
  },
  {
    id: 'apps-tools',
    category: 'DeepDeyIITK Ecosystem',
    title: 'Apps & Tools',
    description: 'A curated collection of my software releases and utilities.',
    url: 'https://deepdey.vercel.app/',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2v20h-20v-20h20zm2-2h-24v24h24v-24zm-21 4h2v2h-2v-2zm0 4h2v2h-2v-2zm0 4h2v2h-2v-2zm4 1h14v1h-14v-1zm0-4h14v1h-14v-1zm0-4h14v1h-14v-1z"/></svg>'
  },
  {
    id: 'portfolio-v1',
    category: 'DeepDeyIITK Ecosystem',
    title: 'Portfolio (V1)',
    description: 'The original technical core & Wikipedia legacy.',
    url: 'https://qlynk.vercel.app/v1/portfolio',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 16l-12-6 12-6 12 6-12 6zm0 2.667l10-5 2 1-12 6-12-6 2-1 10 5zm0 2.667l10-5 2 1-12 6-12-6 2-1 10 5z"/></svg>'
  },

  // JEE Journey & Studies
  {
    id: 'jee-journey',
    category: 'JEE Journey & Studies',
    title: 'My JEE Journey',
    description: 'Daily tracking, logs, and progress of my 2027 mission.',
    url: 'https://sites.google.com/view/deydeep',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2zm0-6h2v4h-2z"/></svg>'
  },
  {
    id: 'jee-store',
    category: 'JEE Journey & Studies',
    title: 'JEE Store',
    description: 'Elite resources, notes, and study materials for JEE.',
    url: 'https://sites.google.com/view/ddstorejee',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/></svg>'
  },
  {
    id: 'iit-gn',
    category: 'JEE Journey & Studies',
    title: 'IIT Gandhinagar',
    description: 'Official portal of one of my target dream institutions.',
    url: 'https://iitgn.ac.in/',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/></svg>'
  },

  // Content & Chill
  {
    id: 'youtube-main',
    category: 'Content & Chill',
    title: 'YouTube Channel',
    description: 'Documenting the grind, devlogs, and student life.',
    url: 'https://www.youtube.com/@deepdeyiit',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186c-.273-1.018-1.07-1.815-2.088-2.088C19.585 3.5 12 3.5 12 3.5s-7.585 0-9.41.598c-1.018.273-1.815 1.07-2.088 2.088C0 8.011 0 12 0 12s0 3.989.502 5.814c.273 1.018 1.07 1.815 2.088 2.088 1.825.598 9.41.598 9.41.598s7.585 0 9.41-.598c1.018-.273 1.815-1.07 2.088-2.088.502-1.825.502-5.814.502-5.814s0-3.989-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>'
  },
  {
    id: 'sukoon-playlist',
    category: 'Content & Chill',
    title: 'Sukoon Playlist',
    description: 'My curated selection for zero-distraction focus.',
    url: 'https://open.spotify.com/playlist/5TDJBbIoYxdv120nwkKeJa',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.49 17.306c-.215.353-.674.463-1.028.249-2.86-1.748-6.46-2.143-10.697-1.176-.404.093-.812-.162-.904-.566s.162-.812.566-.904c4.637-1.06 8.62-.605 11.815 1.347.354.215.464.674.248 1.028zm1.466-3.266c-.27.44-.848.58-1.288.31-3.27-2.01-8.25-2.592-12.115-1.42-.497.15-1.02-.13-1.17-.627s.13-1.02.627-1.17c4.43-1.34 9.91-.68 13.637 1.61.44.27.58.847.31 1.287zm.126-3.41c-3.916-2.325-10.374-2.54-14.137-1.398-.6.184-1.238-.155-1.422-.756-.184-.6.155-1.238.756-1.422 4.316-1.312 11.432-1.056 15.937 1.62.54.32.72 1.02.4 1.56-.32.54-1.02.72-1.56.4z"/></svg>'
  },

  // Support & Community
  {
    id: 'donate-deep',
    category: 'Support & Community',
    title: 'Donate',
    description: 'Support my academic and digital endeavors.',
    url: 'https://payments.cashfree.com/forms/donatedeepona',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>'
  },
  {
    id: 'iskcon-bhiwandi',
    category: 'Support & Community',
    title: 'ISKCON Bhiwandi',
    description: 'Community and spiritual roots I support.',
    url: 'https://iskconbhiwandi.org/',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm0 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.487-10 10-10zm0 3c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 2c2.757 0 5 2.243 5 5s-2.243 5-5 5-5-2.243-5-5 2.243-5 5-5z"/></svg>'
  },

  // Social Links
  {
    id: 'facebook-main',
    category: 'Social Links',
    title: 'Facebook',
    description: 'Personal updates and long-form thoughts.',
    url: 'https://www.facebook.com/deepdeyiit',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>'
  },
  {
    id: 'linkedin-main',
    category: 'Social Links',
    title: 'LinkedIn',
    description: 'Professional networking and technical track record.',
    url: 'https://www.linkedin.com/in/deepdeyiit/',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554V15.034c0-1.291-.026-2.953-1.799-2.953-1.8 0-2.077 1.406-2.077 2.859v5.512h-3.556V9h3.413v1.561h.048c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>'
  },
  {
    id: 'insta-main',
    category: 'Social Links',
    title: 'Instagram',
    description: 'Visual stories and photography archive.',
    url: 'https://instagram.com/justdeepdey',
    isSvg: true,
    logoUrlOrSvgCode: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.76 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>'
  }
];
