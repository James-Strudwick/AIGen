import type { Metadata, Viewport } from "next";
import { Analytics } from '@vercel/analytics/next';
import "./globals.css";

export const metadata: Metadata = {
  title: "FomoForms",
  description: "AI-powered lead generation for coaches — turn followers into paying clients",
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-white text-black font-sans">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
