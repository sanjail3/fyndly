import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { Toaster } from '@/components/ui/toaster'

export const metadata = {
  title: {
    default: 'Fyndly - Campus Discovery Platform',
    template: '%s | Fyndly Campus Connect',
  },
  description: 'Find your campus tribe. Discover like-minded students for projects, hackathons, startups, and more. Swipe, match, and build your network at your college.',
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  openGraph: {
    title: 'Fyndly - Campus Discovery Platform',
    description: 'Find your campus tribe. Discover like-minded students for projects, hackathons, startups, and more. Swipe, match, and build your network at your college.',
    url: 'https://fyndly.app',
    siteName: 'Fyndly',
    images: [
      {
        url: '/icon.png',
        width: 512,
        height: 512,
        alt: 'Fyndly Logo',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fyndly - Campus Discovery Platform',
    description: 'Find your campus tribe. Discover like-minded students for projects, hackathons, startups, and more. Swipe, match, and build your network at your college.',
    images: ['/icon.png'],
    creator: '@fyndlyapp',
  },
  metadataBase: new URL('https://fyndly.app'),
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/icon.png" />
        <link rel="shortcut icon" href="/icon.png" />
        <link rel="apple-touch-icon" href="/icon.png" />
        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-T8VGMLV0YM"></script>
        <script dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-T8VGMLV0YM', {
              page_path: window.location.pathname,
            });
          `,
        }} />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  )
}