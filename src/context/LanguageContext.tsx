import { createContext, useContext, useMemo, useState, useEffect, ReactNode } from 'react';

export type Language = string;

type Dict = Record<string, Record<string, string>>;

const dictionary: Dict = {
  'nav.home': { en: 'Home', bn: 'হোম', hi: 'होम' },
  'nav.about': { en: 'About', bn: 'আমার সম্পর্কে', hi: 'परिचय' },
  'nav.me': { en: 'Me', bn: 'আমি', hi: 'मैं' },
  'nav.projects': { en: 'Projects', bn: 'প্রজেক্ট', hi: 'प्रोजेक्ट्स' },
  'nav.portfolio': { en: 'Portfolio', bn: 'পোর্টফোলিও', hi: 'पोर्टफोलियो' },
  'nav.links': { en: 'Links', bn: 'লিংকস', hi: 'लिंक्स' },
  'nav.proof': { en: 'Proof', bn: 'প্রুফ', hi: 'प्रूफ' },
  'nav.journal': { en: 'Journal', bn: 'জার্নাল', hi: 'जर्नल' },
  'nav.now': { en: 'Now', bn: 'নাও', hi: 'नाउ' },
  'nav.faq': { en: 'FAQ', bn: 'জিজ্ঞাসা', hi: 'प्रश्न' },
  'nav.contact': { en: 'Contact', bn: 'যোগাযোগ', hi: 'संपर्क' },
  'nav.live': { en: 'Live', bn: 'লাইভ', hi: 'लाइव' },
  'home.cta.contact': { en: 'Get in Touch', bn: 'যোগাযোগ করুন', hi: 'संपर्क करें' },
  'home.cta.journal': { en: 'Read Build Journal', bn: 'বিল্ড জার্নাল পড়ুন', hi: 'बिल्ड जर्नल पढ़ें' },
  'home.cta.proof': { en: 'View Proof of Work', bn: 'প্রুফ অব ওয়ার্ক দেখুন', hi: 'प्रूफ ऑफ वर्क देखें' },
  'footer.subscribe': { en: 'Subscribe for updates', bn: 'আপডেট সাবস্ক্রাইব করুন', hi: 'अपडेट के लिए सब्सक्राइब करें' },
  'footer.book': { en: 'Book post-2027 collaboration', bn: '২০২৭ পর সহযোগিতা বুক করুন', hi: '2027 के बाद सहयोग बुक करें' },
};

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    if (!document.getElementById('google_translate_element')) {
      const node = document.createElement('div');
      node.id = 'google_translate_element';
      node.style.position = 'fixed';
      node.style.left = '-9999px';
      node.style.top = '0';
      document.body.appendChild(node);
    }

    (window as Window & { googleTranslateElementInit?: () => void }).googleTranslateElementInit = () => {
      const googleObj = (window as Window & { google?: any }).google;
      if (!googleObj?.translate?.TranslateElement) return;
      new googleObj.translate.TranslateElement(
        {
          pageLanguage: 'en',
          autoDisplay: false,
          includedLanguages: 'en,bn,hi,es,fr,de,ar,ru,pt,ja,ko,zh-CN',
        },
        'google_translate_element',
      );
    };

    if (!document.querySelector('script[data-google-translate="1"]')) {
      const script = document.createElement('script');
      script.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      script.setAttribute('data-google-translate', '1');
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    document.documentElement.lang = language;

    const langMap: Record<string, string> = {
      en: 'en',
      bn: 'bn',
      hi: 'hi',
      es: 'es',
      fr: 'fr',
      de: 'de',
      ar: 'ar',
      ru: 'ru',
      pt: 'pt',
      ja: 'ja',
      ko: 'ko',
      zh: 'zh-CN',
    };

    const target = langMap[language] || 'en';
    const applyTranslate = () => {
      const combo = document.querySelector<HTMLSelectElement>('.goog-te-combo');
      if (!combo) return;
      combo.value = target;
      combo.dispatchEvent(new Event('change'));
    };
    const timer = setTimeout(applyTranslate, 350);
    return () => clearTimeout(timer);
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: string, fallback?: string) =>
        dictionary[key]?.[language] ?? dictionary[key]?.en ?? fallback ?? key,
    }),
    [language],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return ctx;
}
