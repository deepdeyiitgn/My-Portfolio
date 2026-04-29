import React, { useState, useEffect, useRef } from 'react';
import { X, Clock, History, ExternalLink, ChevronLeft, ChevronRight, Activity, Radio } from 'lucide-react';
import { renderIcon } from '../utils/iconMap'; // Dashboard me jo icon map use hota hai wahi idhar use karenge

interface StatusRecord {
  _id: string;
  isVisible: boolean;
  message: string;
  hexColor: string;
  icon: string;
  actionUrl: string;
  glow: boolean;
  freeBy: string;
  createdAtIST: string;
  createdAt: string;
}

// Time ago calculate karne ka function (e.g. "2h ago")
function timeAgo(dateString: string) {
  const past = new Date(dateString).getTime();
  const now = new Date().getTime();
  const diffMins = Math.floor((now - past) / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default function StatusWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [showHint, setShowHint] = useState(false); // <-- Naya Hint State
  const [activeTab, setActiveTab] = useState<'live' | 'history'>('live');
  const [historyPage, setHistoryPage] = useState(1);
  const itemsPerPage = 5;

  const [current, setCurrent] = useState<StatusRecord | null>(null);
  const [history, setHistory] = useState<StatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const popupRef = useRef<HTMLDivElement>(null);

  // Hint Logic: Session mein sirf ek baar dikhane ke liye
  useEffect(() => {
    const hasSeenHint = sessionStorage.getItem('dd_status_hint');
    if (!hasSeenHint) {
      // Page load hone ke 2 second baad hint dikhega (smoothness ke liye)
      const timer = setTimeout(() => setShowHint(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Custom Toggle: Click karte hi hint hide aur session save
  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (showHint) {
      setShowHint(false);
      sessionStorage.setItem('dd_status_hint', 'true');
    }
  };

  // Database se status aur history fetch karna  |  Fetch Logic
  useEffect(() => {
    fetch('/api/journal?action=status')
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.current) {
          setCurrent(data.current);
          setHistory(data.history || []);
        }
      })
      .catch(err => console.error('Status fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Agar loading hai, ya fir admin ne widget hide (isVisible: false) kar diya hai, toh kuch mat dikhao
  if (loading || !current || !current.isVisible) return null;

  // Pagination Logic for History
  const totalPages = Math.ceil(history.length / itemsPerPage);
  const currentHistory = history.slice((historyPage - 1) * itemsPerPage, historyPage * itemsPerPage);

  // Hex color safely convert for shadows (adds opacity)
  const hexToRgba = (hex: string, alpha: number) => {
    const r = parseInt(hex.slice(1, 3), 16) || 34;
    const g = parseInt(hex.slice(3, 5), 16) || 197;
    const b = parseInt(hex.slice(5, 7), 16) || 94;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <div className="fixed bottom-6 left-6 z-50 font-sans">
      
      {/* 🟢 Expandable Popup Box */}
      {isOpen && (
        <div 
          ref={popupRef}
          className="absolute bottom-16 left-0 w-72 sm:w-80 bg-[#121212] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden mb-2 origin-bottom-left animate-in fade-in zoom-in duration-200"
        >
          {/* Header & Tabs */}
          <div className="bg-zinc-900/50 border-b border-zinc-800 p-3 pb-0 flex justify-between items-start">
            <div className="flex gap-4">
              <button 
                onClick={() => setActiveTab('live')}
                className={`pb-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${activeTab === 'live' ? 'border-zinc-300 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-400'}`}
              >
                Live
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`pb-2 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-1 ${activeTab === 'history' ? 'border-zinc-300 text-zinc-100' : 'border-transparent text-zinc-500 hover:text-zinc-400'}`}
              >
                History <span className="bg-zinc-800 text-[9px] px-1.5 rounded-full">{history.length}</span>
              </button>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-zinc-500 hover:text-zinc-300 pb-2">
              <X size={16} />
            </button>
          </div>

          <div className="p-5">
            {/* 🔴 LIVE TAB */}
            {activeTab === 'live' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  {/* Dynamic Icon & Glowing Dot */}
                  <div className="mt-1 relative shrink-0">
                    <span className="relative flex h-3 w-3 absolute -top-1 -right-1 z-10">
                      {current.glow && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: current.hexColor }}></span>}
                      <span className="relative inline-flex rounded-full h-3 w-3" style={{ backgroundColor: current.hexColor }}></span>
                    </span>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
                       {/* Try rendering custom icon, fallback to Activity if invalid */}
                       {renderIcon(current.icon, 20) || <Activity size={20} />}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-zinc-100 text-sm font-medium leading-snug mb-1">{current.message}</h3>
                    <p className="text-[10px] text-zinc-500 font-mono">Updated {timeAgo(current.createdAt)}</p>
                  </div>
                </div>

                {/* Optional Free By / Action Url */}
                {(current.freeBy || current.actionUrl) && (
                  <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap gap-2">
                    {current.freeBy && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-900/60 w-fit px-2.5 py-1.5 rounded-md border border-zinc-800">
                        <Clock size={12} style={{ color: current.hexColor }} />
                        <span>Free by {current.freeBy}</span>
                      </div>
                    )}
                    {current.actionUrl && (
                      <a href={current.actionUrl} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-1.5 text-xs text-black font-medium w-fit px-3 py-1.5 rounded-md transition-opacity hover:opacity-80"
                         style={{ backgroundColor: current.hexColor }}>
                        <ExternalLink size={12} /> View Link
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 🕒 HISTORY TAB */}
            {activeTab === 'history' && (
              <div>
                {history.length === 0 ? (
                  <p className="text-zinc-500 text-xs text-center py-4">No history available yet.</p>
                ) : (
                  <>
                    <div className="space-y-4 min-h-[140px]">
                      {currentHistory.map((hist, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="flex flex-col items-center mt-1">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hist.hexColor || '#22c55e' }} />
                            {i !== currentHistory.length - 1 && <div className="w-[1px] h-8 bg-zinc-800 my-1" />}
                          </div>
                          <div className="flex-1 pb-1">
                            <p className="text-xs text-zinc-300 leading-tight mb-1">{hist.message}</p>
                            <div className="flex gap-2 items-center">
                              <span className="text-[10px] font-mono text-zinc-600">{timeAgo(hist.createdAt)}</span>
                              {hist.actionUrl && (
                                <a href={hist.actionUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-600 hover:text-amber-500 transition-colors">
                                  <ExternalLink size={10} />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/50">
                        <button 
                          onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                          disabled={historyPage === 1}
                          className="p-1 rounded bg-zinc-900 text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <span className="text-[10px] font-mono text-zinc-600">Page {historyPage} / {totalPages}</span>
                        <button 
                          onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                          disabled={historyPage === totalPages}
                          className="p-1 rounded bg-zinc-900 text-zinc-400 disabled:opacity-30 hover:bg-zinc-800 transition-colors"
                        >
                          <ChevronRight size={14} />
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 🗨️ The Hint Bubble (Tool-tip) */}
      {showHint && !isOpen && (
        <div className="absolute bottom-16 left-0 mb-1 w-max bg-zinc-800 text-zinc-200 text-xs px-3 py-2 rounded-xl border border-zinc-700 shadow-xl animate-in fade-in slide-in-from-bottom-2 flex items-center gap-2 z-50">
          <span>👀 See what Deep is doing!</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowHint(false);
              sessionStorage.setItem('dd_status_hint', 'true');
            }}
            className="text-zinc-500 hover:text-zinc-300 ml-1"
          >
            <X size={12} />
          </button>
          {/* Bottom Triangle Pointer */}
          <div className="absolute -bottom-1.5 left-5 w-3 h-3 bg-zinc-800 border-b border-r border-zinc-700 transform rotate-45"></div>
        </div>
      )}

      {/* 🔴 Small Floating Button (Ball) - Translucent Version */}
      <button
        onClick={handleToggle}
        className={`flex items-center justify-center w-12 h-12 rounded-full transition-all hover:scale-105 active:scale-95 backdrop-blur-sm ${
          current.glow ? 'shadow-lg' : ''
        }`}
        style={{
          // Background ko pure black se hata kar translucent black (bg-black/40 jaisa) kiya
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          // Border ko tere choose kiye hue color ke sath match kiya translucent mode mein
          border: `1px solid ${hexToRgba(current.hexColor, 0.3)}`,
          // Glow shadow waisa hi rakha
          boxShadow: current.glow ? `0 0 18px ${hexToRgba(current.hexColor, 0.45)}` : undefined,
        }}
      >
        <span className="relative flex items-center justify-center h-3.5 w-3.5">
          {current.glow && (
            // Ping (expanding circle) waisa hi glowing rahega attention ke liye
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: current.hexColor }}></span>
          )}
          {/* 👇 Main Central Dot: Iski opacity 0.80 (80%) ki taaki ye halka soft dikhe */}
          <span className="relative inline-flex rounded-full h-3.5 w-3.5" style={{ backgroundColor: hexToRgba(current.hexColor, 0.80) }}></span>
        </span>
      </button>
      
    </div>
  );
}