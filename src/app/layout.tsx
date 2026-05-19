import type { Metadata } from 'next';
import { Sora, Manrope, JetBrains_Mono, Noto_Sans_TC } from 'next/font/google';
import AuthProviderWrapper from '@/components/AuthProviderWrapper';
import '@/styles/globals.css';

// 以 next/font 載入字型，避免外部 Google Fonts 請求，同時取得 CSS variable 名稱
const sora = Sora({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-sora',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const notoSansTC = Noto_Sans_TC({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-noto-sans-tc',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'VocalCanvas',
  description: 'Give your words a voice. Turn any text into lifelike AI speech.',
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/logo-mark.svg',
    apple: '/assets/logo-mark.svg',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VocalCanvas',
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <html
      lang="zh-TW"
      className={[
        sora.variable,
        manrope.variable,
        jetbrainsMono.variable,
        notoSansTC.variable,
      ].join(' ')}
    >
      <body>
        <AuthProviderWrapper>{children}</AuthProviderWrapper>
      </body>
    </html>
  );
}
