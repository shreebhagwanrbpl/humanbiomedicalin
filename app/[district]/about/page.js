import About from "@/app/about/page";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const url = `https://humanbiomedical.in/${district}/about`;

  return {
    title: `About Human Biomedical | Laboratory & Biomedical Equipment Supplier in ${city}`,

    description:
      `Human Biomedical is a trusted supplier of laboratory equipment, biomedical instruments, diagnostic analyzers, laboratory reagents, hospital equipment, and healthcare solutions in ${city}. Learn about our company, expertise, quality products, and commitment to serving hospitals, pathology laboratories, diagnostic centres, and research institutes.`,

    keywords: [
      `About Human Biomedical ${city}`,
      `Human Biomedical ${city}`,
      `Laboratory Equipment Supplier ${city}`,
      `Biomedical Equipment Supplier ${city}`,
      `Medical Equipment Supplier ${city}`,
      `Diagnostic Equipment Supplier ${city}`,
      `Hospital Equipment Supplier ${city}`,
      `Laboratory Instruments ${city}`,
      `Laboratory Reagents ${city}`,
      `Medical Devices ${city}`,
      `Healthcare Equipment ${city}`,
      `Clinical Laboratory Equipment ${city}`,
      `Pathology Lab Equipment ${city}`,
      `Biomedical Company ${city}`,
      `Diagnostic Lab Equipment ${city}`,
      "Human Biomedical",
      "Biomedical Company India",
    ],

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `About Human Biomedical | Laboratory Equipment Supplier in ${city}`,
      description:
        `Learn about Human Biomedical, a trusted supplier of laboratory equipment, biomedical instruments, diagnostic analyzers, and healthcare solutions in ${city}.`,
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
      title: `About Human Biomedical | ${city}`,
      description:
        `Trusted laboratory and biomedical equipment supplier in ${city}.`,
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
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return <About city={city} />;
}