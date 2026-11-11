import React, { useState, useEffect } from 'react';
import haptic from '../lib/haptics';
import {
  POPULAR_LANGUAGES,
  ALL_LANGUAGES,
  getCurrentLanguage,
  switchLanguage,
  getLanguageById,
  type LanguageOption,
} from '../lib/translate';

interface LanguageSelectorProps {
  compact?: boolean;
  onLanguageChanged?: (lang: string) => void;
}

export default function LanguageSelector({ compact = false, onLanguageChanged }: LanguageSelectorProps) {
  const [currentLang, setCurrentLang] = useState<string>('english');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Initial sync
    setCurrentLang(getCurrentLanguage());

    const handleLangChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ language: string }>;
      if (customEvent.detail?.language) {
        setCurrentLang(customEvent.detail.language);
      } else {
        setCurrentLang(getCurrentLanguage());
      }
    };

    window.addEventListener('language-change', handleLangChange);
    document.addEventListener('astro:page-load', () => {
      setCurrentLang(getCurrentLanguage());
    });

    return () => {
      window.removeEventListener('language-change', handleLangChange);
    };
  }, []);

  const handleSelect = (langId: string) => {
    haptic.tap();
    setCurrentLang(langId);
    switchLanguage(langId);
    setIsDropdownOpen(false);
    onLanguageChanged?.(langId);
  };

  const activeLangObj = getLanguageById(currentLang);

  const filteredLanguages = ALL_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      (l.nativeName && l.nativeName.toLowerCase().includes(search.toLowerCase())) ||
      l.id.toLowerCase().includes(search.toLowerCase())
  );

  if (compact) {
    return (
      <div className="relative inline-block ignore">
        <button
          type="button"
          onClick={() => {
            haptic.tap();
            setIsDropdownOpen(!isDropdownOpen);
          }}
          className="flex items-center gap-1.5 py-1 px-2.5 rounded-lg text-xs font-mono border border-border-custom bg-card-custom hover:bg-elevated-custom text-foreground-custom transition-all cursor-pointer shadow-xs active:translate-y-px"
          aria-label="Select website language"
        >
          <svg className="w-3.5 h-3.5 stroke-[1.75] opacity-75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
          <span className="font-medium truncate max-w-[80px]">
            {activeLangObj.nativeName || activeLangObj.name}
          </span>
          <svg className="w-3 h-3 stroke-[2] opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>

        {isDropdownOpen && (
          <div className="absolute right-0 bottom-full mb-2 w-56 max-h-72 overflow-y-auto rounded-xl bg-card-custom border border-border-custom shadow-xl p-1 z-50 flex flex-col gap-0.5 animate-modal-scale">
            <div className="p-1.5 border-b border-border-custom">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search language..."
                className="w-full px-2 py-1 text-xs font-mono rounded-md bg-muted-custom/60 border border-border-custom text-foreground-custom placeholder:text-muted-foreground-custom focus:outline-none"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto max-h-48 py-1">
              {filteredLanguages.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => handleSelect(l.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                    currentLang === l.id
                      ? 'bg-foreground-custom text-background-custom font-semibold'
                      : 'text-foreground-custom hover:bg-muted-custom/60'
                  }`}
                >
                  <span className="truncate">{l.nativeName || l.name}</span>
                  <span className="text-[10px] opacity-70 ml-2">{l.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2.5 ignore">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-muted-foreground-custom">
            Language / 多语言
          </span>
          <a
            href="https://translate.zvo.cn/"
            target="_blank"
            rel="noopener noreferrer"
            title="Powered by translate.zvo.cn open-source engine"
            className="text-[9px] font-mono text-muted-foreground-custom hover:text-foreground-custom underline underline-offset-2 opacity-70 hover:opacity-100 transition-opacity flex items-center gap-0.5"
          >
            <span>zvo.cn</span>
            <span className="text-[8px]">↗</span>
          </a>
        </div>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border bg-foreground-custom text-background-custom border-foreground-custom">
          {activeLangObj.nativeName || activeLangObj.name}
        </span>
      </div>

      {/* Quick Select Grid (Popular Languages) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5 p-1 bg-muted-custom/50 rounded-xl border border-border-custom">
        {POPULAR_LANGUAGES.slice(0, 8).map((lang) => {
          const isSelected = currentLang === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => handleSelect(lang.id)}
              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg text-center transition-all cursor-pointer ${
                isSelected
                  ? 'bg-foreground-custom text-background-custom border border-foreground-custom shadow-xs font-semibold'
                  : 'text-muted-foreground-custom hover:text-foreground-custom hover:bg-card-custom/60 border border-transparent font-medium'
              }`}
              title={`${lang.name} (${lang.nativeName})`}
            >
              <span className="text-xs leading-tight truncate w-full">{lang.nativeName}</span>
              <span className={`text-[9px] font-mono tracking-tight opacity-75 truncate w-full ${isSelected ? 'text-background-custom' : 'text-muted-foreground-custom'}`}>
                {lang.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Extended Language Select Dropdown */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <select
            value={currentLang}
            onChange={(e) => handleSelect(e.target.value)}
            className="w-full py-1.5 px-2.5 rounded-lg text-xs font-mono bg-card-custom hover:bg-elevated-custom text-foreground-custom border border-border-custom shadow-xs transition-colors cursor-pointer appearance-none pr-8 focus:outline-none"
            aria-label="All supported languages"
          >
            <option value="english" disabled={false}>
              -- Select from 100+ Languages --
            </option>
            {ALL_LANGUAGES.map((l) => (
              <option key={l.id} value={l.id}>
                {l.nativeName ? `${l.nativeName} — ${l.name}` : l.name}
              </option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </div>
        </div>

        {currentLang !== 'english' && (
          <button
            type="button"
            onClick={() => handleSelect('english')}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium text-muted-foreground-custom hover:text-foreground-custom hover:bg-muted-custom border border-border-custom transition-all cursor-pointer whitespace-nowrap active:translate-y-px"
            title="Reset translation back to original English"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

