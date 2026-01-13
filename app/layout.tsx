import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Switch to Inter for better Vietnamese support
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: 'swap',
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

import { AuthProvider } from "@/components/auth/AuthProvider";
import { NextAuthProvider } from "@/components/auth/NextAuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased font-sans`} // Use Inter variable and safe defaults
      >
        <NextAuthProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
