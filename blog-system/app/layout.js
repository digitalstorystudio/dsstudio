import './globals.css';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://digitalstorystudio.in'),
  title: {
    default: 'Blog | Digital Story Studio - Videography & Photography Delhi NCR',
    template: '%s | Digital Story Studio Delhi',
  },
  description: 'Expert tips, behind-the-scenes stories, and inspiration from Delhi NCR\'s top videography and photography studio.',
  keywords: ['videographer delhi', 'photographer delhi ncr', 'wedding photography delhi', 'digital story studio'],
  authors: [{ name: 'Digital Story Studio' }],
  creator: 'Digital Story Studio',
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'Digital Story Studio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
        {/* Geo tags - Delhi NCR */}
        <meta name="geo.region" content="IN-DL" />
        <meta name="geo.placename" content="Delhi NCR, India" />
        <meta name="geo.position" content="28.6139;77.2090" />
        <meta name="ICBM" content="28.6139, 77.2090" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="3 days" />
        <meta name="rating" content="general" />
        <meta name="distribution" content="global" />
        <meta name="HandheldFriendly" content="True" />
      </head>
      <body>{children}</body>
    </html>
  );
}
