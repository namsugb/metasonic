import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ESTELLA MAX",
  description: "ESTELLA MAX AI personal skin coach recommendation flow",
  openGraph: {
    title: "ESTELLA MAX",
    description: "ESTELLA MAX AI personal skin coach recommendation flow",
  },
  twitter: {
    title: "ESTELLA MAX",
    description: "ESTELLA MAX AI personal skin coach recommendation flow",
  },
  icons: {
    icon: "/icon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
