import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-amber-500 selection:text-black flex flex-col">
      <Header />
      
      <main className="flex-grow pt-28">
        {children}
      </main>

      <Footer />
    </div>
  );
}
