'use client';

import { createContext, useContext, useState } from 'react';

type Lang = 'zh' | 'en';

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  rendering: boolean;
  setRendering: (v: boolean) => void;
}

const LangContext = createContext<LangContextValue>({
  lang: 'zh',
  setLang: () => undefined,
  rendering: false,
  setRendering: () => undefined,
});

export function LangProvider({ children }: { children: React.ReactNode }): React.JSX.Element {
  const [lang, setLang] = useState<Lang>('zh');
  const [rendering, setRendering] = useState(false);
  return (
    <LangContext.Provider value={{ lang, setLang, rendering, setRendering }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang(): LangContextValue {
  return useContext(LangContext);
}
