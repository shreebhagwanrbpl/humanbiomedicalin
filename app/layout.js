import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const metadata = {
  metadataBase: new URL("https://humanbiomedical.in"),
title: {
  default:
    "Laboratory Equipment Supplier in India | Human Biomedical",

  template:
    "%s | Human Biomedical",
},
  description:
    "Human Biomedical is a trusted supplier of laboratory equipment, pathology machines, diagnostic instruments, biomedical products and hospital equipment across India.",

  keywords: [
    "laboratory equipment supplier",
    "hospital equipment supplier",
    "biomedical products",
    "pathology machines",
    "diagnostic instruments",
    "medical equipment supplier india",
    "human biomedical"
  ],

  robots: {
  index: true,
  follow: true,
  googleBot: {
    index: true,
    follow: true,
  },
},

  alternates: {
    canonical: "https://humanbiomedical.in",
  },

  openGraph: {
    title:
      "Laboratory Equipment Supplier in India | Human Biomedical",
    description:
      "Trusted supplier of laboratory equipment, pathology machines and biomedical products across India.",
    url: "https://humanbiomedical.in",
    siteName: "Human Biomedical",
    type: "website",
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
      </head>
      <body>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
} 