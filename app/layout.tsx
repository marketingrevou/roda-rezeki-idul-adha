import type { Metadata } from "next";
import { Poppins, Cinzel_Decorative, Cinzel, Pacifico } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins",
});

const cinzelDecorative = Cinzel_Decorative({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-cinzel-decorative",
});

const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-cinzel",
});

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-pacifico",
});

export const metadata: Metadata = {
  title: "Roda Rezeki RevoU — Ramadan Special",
  description: "Putar roda keberuntungan dan dapatkan bonus spesial Ramadan dari RevoU!",
  icons: [
    { rel: "icon", url: "/revoulogo.png" },
    // Keep default favicon.ico as fallback if necessary
    { rel: "icon", url: "/favicon.ico", type: "image/x-icon" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={`${poppins.variable} ${cinzelDecorative.variable} ${cinzel.variable} ${pacifico.variable} font-poppins antialiased`}>
        {children}
      </body>
    </html>
  );
}
