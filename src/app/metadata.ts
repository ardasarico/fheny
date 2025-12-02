import type { Metadata } from 'next';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://fheny.vercel.app'),
  title: 'Fheny Wallet',
  description: 'Secure and modern crypto wallet',
  openGraph: {
    title: 'Fheny Wallet',
    url: 'https://fheny.vercel.app',
    description: 'Secure and modern crypto wallet',
    images: [
      {
        url: '/assets/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Fheny Wallet – Secure and Modern Crypto Wallet',
      },
    ],
    type: 'website',
    siteName: 'Fheny',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fheny Wallet',
    description: 'Secure and modern crypto wallet',
    images: ['/assets/og-image.jpg'],
  },
  keywords: ['Fheny', 'Fheny Wallet', 'crypto wallet', 'web3 wallet', 'non-custodial wallet', 'crypto', 'blockchain'],
  authors: [{ name: 'Fheny' }],
  creator: 'Fheny',
  publisher: 'Fheny',
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
  icons: {
    icon: [
      { url: '/assets/favicons/favicon.ico', sizes: 'any' },
      { url: '/assets/favicons/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/favicons/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/assets/favicons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
    other: [
      {
        rel: 'icon',
        url: '/assets/favicons/android-chrome-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        rel: 'icon',
        url: '/assets/favicons/android-chrome-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
};
