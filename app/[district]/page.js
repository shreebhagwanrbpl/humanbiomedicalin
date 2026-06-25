import Home from "../page";
export async function generateMetadata({ params }) {
  const { district } = await params;
  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

  const url = `https://humanbiomedical.in/${district}`;

  return {
    title: `Laboratory Equipment, Biomedical Equipment & Diagnostic Instruments Supplier in ${city} | Human Biomedical`,

    description:
      `Human Biomedical is a trusted supplier of laboratory equipment, biomedical instruments, pathology lab equipment, diagnostic analyzers, laboratory reagents, hospital equipment, and medical devices in ${city}. We serve hospitals, diagnostic centres, research laboratories, and healthcare institutions with quality products and expert support.`,

    keywords: [
      `Laboratory Equipment Supplier ${city}`,
      `Biomedical Equipment Supplier ${city}`,
      `Medical Equipment Supplier ${city}`,
      `Diagnostic Equipment Supplier ${city}`,
      `Hospital Equipment Supplier ${city}`,
      `Pathology Lab Equipment ${city}`,
      `Laboratory Instruments ${city}`,
      `Laboratory Reagents ${city}`,
      `Medical Devices ${city}`,
      `Diagnostic Analyzers ${city}`,
      `Electrolyte Analyzer ${city}`,
      `Blood Gas Analyzer ${city}`,
      `Healthcare Equipment ${city}`,
      `Clinical Laboratory Equipment ${city}`,
      `Human Biomedical ${city}`,
      "Human Biomedical",
    ],

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `Laboratory Equipment Supplier in ${city} | Human Biomedical`,

      description:
        `Trusted supplier of laboratory equipment, biomedical instruments, diagnostic analyzers, and hospital equipment in ${city}.`,
      url,
      siteName: "Human Biomedical",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Human Biomedical ${city}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `Laboratory Equipment Supplier in ${city} | Human Biomedical`,
      description:
        `Premium laboratory equipment and biomedical products in ${city}.`,
      images: ["/og-image.jpg"],
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
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
  return <Home city={city} />;
}