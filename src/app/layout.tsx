import { NavBar } from "~/components/NavBar.tsx";
import "./globals.css";
// biome-ignore lint/correctness/noUnresolvedImports: incorrect flag
import { Geist_Mono } from "next/font/google";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({
  children,
}: RootLayoutProps): React.ReactNode {
  return (
    <html lang="de" className={`${geistMono.variable} antialiased`}>
      <body className="container mx-auto max-sm:px-4">
        <NavBar />

        {children}
      </body>
    </html>
  );
}
