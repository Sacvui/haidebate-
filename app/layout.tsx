import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://haidebate-ocsd.vercel.app'),
  title: "Hải Debate - Trợ lý AI Nghiên cứu Khoa học",
  description: "Công cụ hỗ trợ viết luận văn và nghiên cứu khoa học chuyên sâu với AI Phản biện. Được phát triển bởi Dr. Hai Show & Hải Rong Chơi.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/og-image.jpg', // Using OG image as a placeholder for apple touch icon if we don't have a specific one
  },
  openGraph: {
    title: "Hải Debate - Trợ lý AI Nghiên cứu Khoa học",
    description: "Công cụ hỗ trợ viết luận văn và nghiên cứu khoa học chuyên sâu với AI Phản biện.",
    url: 'https://haidebate-ocsd.vercel.app', // Explicitly setting the URL if known or using a default
    siteName: 'Hải Debate',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Hải Debate Social Card',
      },
    ],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
