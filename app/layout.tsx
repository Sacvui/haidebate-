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
  title: "Hải Debate - Trợ lý AI Nghiên cứu Khoa học",
  description: "Công cụ hỗ trợ viết luận văn và nghiên cứu khoa học chuyên sâu với AI Phản biện. Được phát triển bởi Dr. Hai Show & Hải Rong Chơi.",
  openGraph: {
    title: "Hải Debate - Trợ lý AI Nghiên cứu Khoa học",
    description: "Công cụ hỗ trợ viết luận văn và nghiên cứu khoa học chuyên sâu với AI Phản biện.",
    images: ["/og-image.jpg"], // Placeholder, will default if not found or can be updated later
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
