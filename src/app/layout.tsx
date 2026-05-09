import NavBar from "~/components/NavBar";
import "./globals.css";
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type RootLayoutProps = { children: React.ReactNode };

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="de" className={`${geistMono.variable} antialiased`}>
      <body className="container mx-auto max-sm:px-4">
        <NavBar />

        {children}
      </body>
    </html>
  );
}
