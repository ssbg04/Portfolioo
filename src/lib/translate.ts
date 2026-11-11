/**
 * translate.zvo.cn (translate.js) Integration Utilities
 * Open-source multi-language translation engine for web applications.
 * Official site: https://translate.zvo.cn/
 */

export interface LanguageOption {
  id: string;
  name: string;
  nativeName?: string;
  flag?: string;
}

export const POPULAR_LANGUAGES: LanguageOption[] = [
  { id: 'english', name: 'English', nativeName: 'English' },
  { id: 'filipino', name: 'Filipino', nativeName: 'Tagalog' },
  { id: 'chinese_simplified', name: 'Simplified Chinese', nativeName: '简体中文' },
  { id: 'chinese_traditional', name: 'Traditional Chinese', nativeName: '繁體中文' },
  { id: 'japanese', name: 'Japanese', nativeName: '日本語' },
  { id: 'korean', name: 'Korean', nativeName: '한국어' },
  { id: 'spanish', name: 'Spanish', nativeName: 'Español' },
  { id: 'deutsch', name: 'German', nativeName: 'Deutsch' },
  { id: 'french', name: 'French', nativeName: 'Français' },
  { id: 'italian', name: 'Italian', nativeName: 'Italiano' },
  { id: 'portuguese', name: 'Portuguese', nativeName: 'Português' },
  { id: 'russian', name: 'Russian', nativeName: 'Русский' },
  { id: 'hindi', name: 'Hindi', nativeName: 'हिन्दी' },
  { id: 'arabic', name: 'Arabic', nativeName: 'العربية' },
  { id: 'vietnamese', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  { id: 'indonesian', name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
];

export const ALL_LANGUAGES: LanguageOption[] = [
  ...POPULAR_LANGUAGES,
  { id: 'afrikaans', name: 'Afrikaans', nativeName: 'Afrikaans' },
  { id: 'albanian', name: 'Albanian', nativeName: 'Shqip' },
  { id: 'amharic', name: 'Amharic', nativeName: 'አማርኛ' },
  { id: 'armenian', name: 'Armenian', nativeName: 'Հայերեն' },
  { id: 'azerbaijani', name: 'Azerbaijani', nativeName: 'Azərbaycan' },
  { id: 'basque', name: 'Basque', nativeName: 'Euskara' },
  { id: 'belarusian', name: 'Belarusian', nativeName: 'Беларуская' },
  { id: 'bengali', name: 'Bengali', nativeName: 'বাংলা' },
  { id: 'bosnian', name: 'Bosnian', nativeName: 'Bosanski' },
  { id: 'bulgarian', name: 'Bulgarian', nativeName: 'Български' },
  { id: 'catalan', name: 'Catalan', nativeName: 'Català' },
  { id: 'cebuano', name: 'Cebuano', nativeName: 'Binisaya' },
  { id: 'croatian', name: 'Croatian', nativeName: 'Hrvatski' },
  { id: 'czech', name: 'Czech', nativeName: 'Čeština' },
  { id: 'danish', name: 'Danish', nativeName: 'Dansk' },
  { id: 'dutch', name: 'Dutch', nativeName: 'Nederlands' },
  { id: 'esperanto', name: 'Esperanto', nativeName: 'Esperanto' },
  { id: 'estonian', name: 'Estonian', nativeName: 'Eesti' },
  { id: 'finnish', name: 'Finnish', nativeName: 'Suomi' },
  { id: 'galician', name: 'Galician', nativeName: 'Galego' },
  { id: 'georgian', name: 'Georgian', nativeName: 'ქართული' },
  { id: 'greek', name: 'Greek', nativeName: 'Ελληνικά' },
  { id: 'gujarati', name: 'Gujarati', nativeName: 'ગુજરાતી' },
  { id: 'haitian_creole', name: 'Haitian Creole', nativeName: 'Kreyòl' },
  { id: 'hebrew', name: 'Hebrew', nativeName: 'עברית' },
  { id: 'hungarian', name: 'Hungarian', nativeName: 'Magyar' },
  { id: 'icelandic', name: 'Icelandic', nativeName: 'Íslenska' },
  { id: 'irish', name: 'Irish', nativeName: 'Gaeilge' },
  { id: 'javanese', name: 'Javanese', nativeName: 'Basa Jawa' },
  { id: 'kannada', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { id: 'kazakh', name: 'Kazakh', nativeName: 'Қазақша' },
  { id: 'khmer', name: 'Khmer', nativeName: 'ខ្មែរ' },
  { id: 'lao', name: 'Lao', nativeName: 'ລາວ' },
  { id: 'latin', name: 'Latin', nativeName: 'Latina' },
  { id: 'latvian', name: 'Latvian', nativeName: 'Latviešu' },
  { id: 'lithuanian', name: 'Lithuanian', nativeName: 'Lietuvių' },
  { id: 'luxembourgish', name: 'Luxembourgish', nativeName: 'Lëtzebuergesch' },
  { id: 'macedonian', name: 'Macedonian', nativeName: 'Македонски' },
  { id: 'malay', name: 'Malay', nativeName: 'Bahasa Melayu' },
  { id: 'malayalam', name: 'Malayalam', nativeName: 'മലയാളം' },
  { id: 'maltese', name: 'Maltese', nativeName: 'Malti' },
  { id: 'maori', name: 'Maori', nativeName: 'Te Reo Māori' },
  { id: 'marathi', name: 'Marathi', nativeName: 'मराठी' },
  { id: 'mongolian', name: 'Mongolian', nativeName: 'Монгол' },
  { id: 'nepali', name: 'Nepali', nativeName: 'नेपाली' },
  { id: 'norwegian', name: 'Norwegian', nativeName: 'Norsk' },
  { id: 'pashto', name: 'Pashto', nativeName: 'پښتو' },
  { id: 'persian', name: 'Persian', nativeName: 'فارسی' },
  { id: 'polish', name: 'Polish', nativeName: 'Polski' },
  { id: 'punjabi', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  { id: 'romanian', name: 'Romanian', nativeName: 'Română' },
  { id: 'samoan', name: 'Samoan', nativeName: 'Gagana Sāmoa' },
  { id: 'serbian', name: 'Serbian', nativeName: 'Српски' },
  { id: 'slovak', name: 'Slovak', nativeName: 'Slovenčina' },
  { id: 'slovenian', name: 'Slovenian', nativeName: 'Slovenščina' },
  { id: 'somali', name: 'Somali', nativeName: 'Soomaali' },
  { id: 'sundanese', name: 'Sundanese', nativeName: 'Basa Sunda' },
  { id: 'swahili', name: 'Swahili', nativeName: 'Kiswahili' },
  { id: 'swedish', name: 'Swedish', nativeName: 'Svenska' },
  { id: 'tamil', name: 'Tamil', nativeName: 'தமிழ்' },
  { id: 'telugu', name: 'Telugu', nativeName: 'తెలుగు' },
  { id: 'thai', name: 'Thai', nativeName: 'ไทย' },
  { id: 'turkish', name: 'Turkish', nativeName: 'Türkçe' },
  { id: 'ukrainian', name: 'Ukrainian', nativeName: 'Українська' },
  { id: 'urdu', name: 'Urdu', nativeName: 'اردو' },
  { id: 'uzbek', name: 'Uzbek', nativeName: 'Oʻzbekcha' },
  { id: 'welsh', name: 'Welsh', nativeName: 'Cymraeg' },
  { id: 'yiddish', name: 'Yiddish', nativeName: 'ייִדיש' },
  { id: 'yoruba', name: 'Yoruba', nativeName: 'Èdè Yorùbá' },
  { id: 'zulu', name: 'Zulu', nativeName: 'isiZulu' },
];

declare global {
  interface Window {
    translate?: {
      changeLanguage: (lang: string) => void;
      execute: () => void;
      to?: string;
      language?: {
        getCurrent: () => string;
        setLocal: (lang: string) => void;
      };
      selectLanguageTag?: {
        show: boolean;
        languages: string;
      };
      service?: {
        use: (service: string) => void;
      };
      listener?: {
        start: () => void;
      };
      storage?: {
        get: (key: string) => string | null;
        set: (key: string, value: string) => void;
      };
    };
  }
}

/**
 * Get current active language code.
 * Defaults to 'english' (the site's native language).
 */
export function getCurrentLanguage(): string {
  if (typeof window === 'undefined') return 'english';
  try {
    if (window.translate?.language?.getCurrent) {
      const cur = window.translate.language.getCurrent();
      if (cur) return cur;
    }
    if (window.translate?.to) {
      return window.translate.to;
    }
    const saved = localStorage.getItem('to') || sessionStorage.getItem('to');
    if (saved) return saved;
  } catch (e) {
    // Ignore storage issues
  }
  return 'english';
}

/**
 * Switch page translation using translate.zvo.cn
 */
export function switchLanguage(targetLang: string): void {
  if (typeof window === 'undefined') return;

  const validLang = targetLang || 'english';

  try {
    if (window.translate && typeof window.translate.changeLanguage === 'function') {
      window.translate.changeLanguage(validLang);
    } else {
      // Fallback: save to storage and wait for translate.js to execute
      try {
        localStorage.setItem('to', validLang);
      } catch (err) {}
    }

    // Broadcast event for responsive UI sync
    window.dispatchEvent(
      new CustomEvent('language-change', {
        detail: { language: validLang },
      })
    );
  } catch (err) {
    console.error('Error switching language:', err);
  }
}

/**
 * Find language option object by its ID
 */
export function getLanguageById(id: string): LanguageOption {
  return (
    ALL_LANGUAGES.find((l) => l.id.toLowerCase() === id.toLowerCase()) || {
      id,
      name: id,
      nativeName: id,
    }
  );
}

