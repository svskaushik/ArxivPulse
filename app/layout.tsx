import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "arXiv Research Paper Summarizer",
  description: "An MVP for summarizing recent AI research papers from arXiv",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gradient-to-b from-gray-900 to-black text-white min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
