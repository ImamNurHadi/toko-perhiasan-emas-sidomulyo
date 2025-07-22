import { Geist, Geist_Mono } from "next/font/google";
import Navbar from "../../components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Toko Emasku - Perhiasan Emas Berkualitas",
  description: "Toko perhiasan emas terpercaya dengan koleksi cincin, kalung, gelang, dan anting berkualitas tinggi. Harga kompetitif dan pelayanan terbaik.",
  keywords: ["perhiasan emas", "cincin emas", "kalung emas", "gelang emas", "anting emas", "toko emas terpercaya"],
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50`}>
        <Navbar />
        <main>
          {children}
        </main>
      </body>
    </html>
  );
} 