import Home from "../page";

export const revalidate = 3600; // 1 hour ISR for local district pages

export async function generateMetadata({ params }) {
  const { district } = await params;
  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const url = `https://humanbiomedical.in/${district}`;

  return {
    title: `Laboratory Equipment & Biomedical Diagnostic Analyzers in ${city} | Human Biomedical`,
    description: `Human Biomedical is a certified distributor of clinical laboratory equipment, pathology diagnostic analyzers, medical test strips, and hospital devices in ${city}. Fast delivery, calibration and on-site maintenance.`,
    keywords: [
      `Laboratory Equipment Supplier ${city}`,
      `Biomedical Equipment Supplier ${city}`,
      `Medical Equipment Supplier ${city}`,
      `Diagnostic Analyzers ${city}`,
      `Hospital Equipment Supplier ${city}`,
      `Pathology Lab Machines ${city}`,
      `Test Strips Supplier ${city}`,
      `Human Biomedical ${city}`,
    ],
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `Laboratory Equipment Supplier in ${city} | Human Biomedical`,
      description: `Trusted supplier of clinical analyzers, laboratory equipment, and biomedical diagnostic products in ${city}.`,
      url,
      siteName: "Human Biomedical",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `Laboratory Equipment Supplier in ${city} | Human Biomedical`,
      description: `Premium laboratory equipment and biomedical products in ${city}.`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-video-preview": -1,
        "max-snippet": -1,
      },
    },
    category: "Healthcare",
  };
}

export default async function Page({ params }) {
  const { district } = await params;
  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `Human Biomedical - ${city}`,
    description: `Leading supplier and distributor of laboratory equipment, diagnostic analyzers, and biomedical products in ${city}.`,
    url: `https://humanbiomedical.in/${district}`,
    telephone: "+91-9199095737",
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressRegion: "India",
      addressCountry: "IN",
    },
    priceRange: "₹₹",
    areaServed: {
      "@type": "City",
      name: city,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      <Home city={city} />
    </>
  );
}