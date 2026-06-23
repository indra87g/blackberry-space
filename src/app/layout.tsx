import type { Metadata } from 'next';
import './globals.css';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import { Navbar } from '@/components/navbar';
import Script from 'next/script';
import { createClient } from '@/utils/supabase/server';
import { Providers } from '@/components/providers';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'Blackberry Space',
    template: '%s | Blackberry Space',
  },
  description: 'A platform for developers to share code snippets and solve programming challenges.',
  keywords: [
    'code snippets',
    'developer tools',
    'programming challenges',
    'code sharing',
    'blackberry space',
  ],
  authors: [{ name: 'Blackberry Space Team' }],
  creator: 'Blackberry Space',
  openGraph: {
    title: 'Blackberry Space',
    description:
      'A platform for developers to share code snippets and solve programming challenges.',
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
    description:
      'A platform for developers to share code snippets and solve programming challenges.',
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <html lang="en" className={`${outfit.variable} ${jetbrainsMono.variable} dark`}>
      <body
        className="bg-background text-on-background font-sans antialiased selection:bg-primary/30 selection:text-primary min-h-screen flex flex-col relative overflow-x-hidden"
        suppressHydrationWarning
      >
        <Script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="8ef70023-b83a-4258-813a-b492d10f77d8"
          strategy="afterInteractive"
        />

        <Providers>
          <Navbar initialUser={user} />
          <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
