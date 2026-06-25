import ProductsList from "@/app/sections/items/ProductsList";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const url = `https://humanbiomedical.in/${district}/products`;

  return {
    title: `Laboratory Equipment, Biomedical Products & Medical Devices in ${city} | Human Biomedical`,

    description:
      `Explore premium laboratory equipment, biomedical instruments, electrolyte analyzers, laboratory reagents, diagnostic devices, hospital equipment, and medical devices in ${city}. Human Biomedical offers trusted products with expert support.`,

    keywords: [
      `Laboratory Equipment ${city}`,
      `Biomedical Products ${city}`,
      `Biomedical Equipment Supplier ${city}`,
      `Medical Equipment Supplier ${city}`,
      `Diagnostic Equipment ${city}`,
      `Hospital Equipment ${city}`,
      `Laboratory Instruments ${city}`,
      `Laboratory Reagents ${city}`,
      `Electrolyte Analyzer ${city}`,
      `Electrolyte Reagents ${city}`,
      `Blood Gas Analyzer ${city}`,
      `Laboratory Consumables ${city}`,
      `Medical Devices ${city}`,
      `Healthcare Equipment ${city}`,
      `Pathology Lab Equipment ${city}`,
      `Clinical Laboratory Equipment ${city}`,
      `Human Biomedical ${city}`,
      "Human Biomedical Products",
    ],

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `Laboratory Equipment & Biomedical Products in ${city} | Human Biomedical`,
      description:
        `Browse premium laboratory equipment, diagnostic instruments, analyzers, and biomedical products in ${city}.`,
      url,
      siteName: "Human Biomedical",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Human Biomedical Products ${city}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `Biomedical Products in ${city} | Human Biomedical`,
      description:
        `Trusted supplier of laboratory equipment and biomedical products in ${city}.`,
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

export default async function ProductsPage({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return <ProductsList city={city} />;
}