import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cris Charles Garcia | Software Developer",
  description: "Cris Charles Garcia — BSIT Software Development student based in Laguna, Philippines. Building digital products with purpose using MERN Stack and PHP.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
      </head>
      <body>
        <input type="checkbox" id="dark-mode-toggle" className="toggle-checkbox" defaultChecked />

        {/* Animated Mesh Background */}
        <div className="mesh-bg" aria-hidden="true">
          <div className="orb orb-1"></div>
          <div className="orb orb-2"></div>
          <div className="orb orb-3"></div>
        </div>

        <div className="site-wrapper">
          {children}
        </div>
      </body>
    </html>
  );
}
