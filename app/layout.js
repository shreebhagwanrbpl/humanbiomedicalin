import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#0f766e",
};

export const metadata = {
  metadataBase: new URL("https://humanbiomedical.in"),
  title: {
    default: "Laboratory Equipment & Diagnostic Instruments Supplier in India | Human Biomedical",
    template: "%s | Human Biomedical",
  },
  description:
    "Human Biomedical is a leading supplier of certified laboratory equipment, clinical analyzers, pathology diagnostic instruments, test strips, and biomedical hospital solutions across India.",
  keywords: [
    "laboratory equipment supplier",
    "hospital equipment supplier india",
    "biomedical products",
    "pathology machines",
    "diagnostic instruments",
    "clinical chemistry analyzers",
    "test strips supplier",
    "medical equipment supplier jaipur india",
    "human biomedical",
    "human biomedical india",
  ],
  authors: [{ name: "Human Biomedical", url: "https://humanbiomedical.in" }],
  creator: "Human Biomedical",
  publisher: "Human Biomedical",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://humanbiomedical.in",
  },
  openGraph: {
    title: "Laboratory Equipment & Diagnostic Instruments Supplier in India | Human Biomedical",
    description:
      "Premier supplier of high-precision laboratory analyzers, pathology equipment, diagnostic test strips, and biomedical solutions across India.",
    url: "https://humanbiomedical.in",
    siteName: "Human Biomedical",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Laboratory Equipment Supplier in India | Human Biomedical",
    description:
      "Trusted supplier of clinical diagnostic analyzers, pathology equipment, and biomedical products in India.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const orgSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Human Biomedical",
  alternateName: "Human Biomedical India",
  url: "https://humanbiomedical.in",
  logo: "https://humanbiomedical.in/favicon.ico",
  description:
    "Human Biomedical is a trusted supplier of laboratory equipment, clinical analyzers, diagnostic instruments, and hospital medical devices across India.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Unit S-1, 2nd Floor, Pn 16, D Block, Tagore Nagar, Vaishali Nagar",
    addressLocality: "Jaipur",
    addressRegion: "Rajasthan",
    postalCode: "302021",
    addressCountry: "IN",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      telephone: "+91-9199095737",
      contactType: "sales",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}