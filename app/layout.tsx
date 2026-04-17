import type { Metadata, Viewport } from "next";
import "./globals.css";
import { QueryProvider } from "@/lib/query-client";
import { Nav } from "@/components/layout/nav";

const SITE_URL = "https://proto-community-hub.vercel.app";
const TITLE = "Proto Community Hub | Members, events, referrals";
const DESCRIPTION =
  "A lightweight operating system for your community. Members directory with shareable URL filters, optimistic event booking, and referral tracking - all in one focused app.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: TITLE,
    template: "%s | Proto Community Hub",
  },
  description: DESCRIPTION,
  authors: [{ name: "Oliver Leonor" }],
  keywords: [
    "community platform",
    "members directory",
    "event booking",
    "referral tracking",
    "Next.js",
    "React Query",
    "Zustand",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "Proto Community Hub",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Proto Community Hub",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/og.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Apply the stored theme before first paint to avoid a flash of the wrong theme. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var stored = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var useDark = stored ? stored === 'dark' : prefersDark;
                if (useDark) document.documentElement.classList.add('dark');
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body>
        <QueryProvider>
          <Nav />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
