import { Github, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-12 px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        <div>
          <p className="text-sm text-zinc-500 tracking-wider">
            © 2020 - {new Date().getFullYear()} Deep Dey | All Rights Reserved
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <a
            href="https://github.com/deepdeyiitgn"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-amber-500 transition-colors"
            aria-label="GitHub"
          >
            <Github size={20} />
          </a>
          <a
            href="mailto:thedeeparise@gmail.com"
            className="text-zinc-500 hover:text-amber-500 transition-colors"
            aria-label="Email"
          >
            <Mail size={20} />
          </a>
        </div>
      </div>
    </footer>
  );
}
