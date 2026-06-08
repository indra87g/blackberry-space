import type {Metadata} from 'next';
import './globals.css';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { Sidebar } from '@/components/sidebar';
import { MobileNav } from '@/components/mobile-nav';
import Script from 'next/script';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Blackberry Space',
    template: '%s | Blackberry Space'
  },
  description: 'A platform for developers to share code snippets and solve programming challenges.',
  keywords: ['code snippets', 'developer tools', 'programming challenges', 'code sharing', 'blackberry space'],
  authors: [{ name: 'Blackberry Space Team' }],
  creator: 'Blackberry Space',
  openGraph: {
    title: 'Blackberry Space',
    description: 'A platform for developers to share code snippets and solve programming challenges.',
    url: 'https://blackberry.space',
    siteName: 'Blackberry Space',
    images: [
      {
        url: 'https://ik.imagekit.io/vmimm0jfp/blackberryhazard/blackberryspace.png',
        width: 1200,
        height: 630,
        alt: 'Blackberry Space - Code Snippet Sharing',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blackberry Space',
    description: 'A platform for developers to share code snippets and solve programming challenges.',
    images: ['https://ik.imagekit.io/vmimm0jfp/blackberryhazard/blackberryspace.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} dark`}>
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet" />
      </head>
      <body className="text-on-surface font-sans antialiased selection:bg-red-500/30 selection:text-red-200" suppressHydrationWarning>
        <Script defer src="https://cloud.umami.is/script.js" data-website-id="8ef70023-b83a-4258-813a-b492d10f77d8" strategy="afterInteractive" />
        <div className="min-h-screen bg-surface flex flex-col">

          <div className="flex flex-col min-w-0 w-full">

             <main className="w-full flex flex-col min-h-screen">
               {children}
             </main>
          </div>
        </div>
      </body>
    </html>
  );
}
