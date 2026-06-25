import Contact from "@/app/sections/contact/ContactSection";

export async function generateMetadata({ params }) {
  const resolvedParams = await params;

  const district = resolvedParams?.district || "jaipur";

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  const url = `https://humanbiomedical.in/${district}/contact`;

  return {
    title: `Contact Human Biomedical | Laboratory & Biomedical Equipment Supplier in ${city}`,

    description:
      `Contact Human Biomedical in ${city} for laboratory equipment, biomedical instruments, diagnostic analyzers, medical devices, laboratory reagents, installation, calibration, repair, AMC, and technical support. We serve hospitals, pathology laboratories, diagnostic centres, and healthcare institutions.`,

    keywords: [
      `Contact Human Biomedical ${city}`,
      `Human Biomedical ${city}`,
      `Laboratory Equipment Supplier ${city}`,
      `Biomedical Equipment Supplier ${city}`,
      `Medical Equipment Supplier ${city}`,
      `Diagnostic Equipment Supplier ${city}`,
      `Hospital Equipment Supplier ${city}`,
      `Laboratory Equipment Dealer ${city}`,
      `Biomedical Equipment Service ${city}`,
      `Laboratory Equipment Repair ${city}`,
      `Laboratory Equipment AMC ${city}`,
      `Laboratory Equipment Installation ${city}`,
      `Laboratory Equipment Calibration ${city}`,
      `Medical Devices ${city}`,
      `Laboratory Instruments ${city}`,
      `Healthcare Equipment ${city}`,
      `Clinical Laboratory Equipment ${city}`,
      "Human Biomedical Contact",
    ],

    alternates: {
      canonical: url,
    },

    openGraph: {
      title: `Contact Human Biomedical | Laboratory Equipment Supplier in ${city}`,
      description:
        `Get in touch with Human Biomedical for laboratory equipment, biomedical products, installation, maintenance, calibration, and technical support in ${city}.`,
      url,
      siteName: "Human Biomedical",
      locale: "en_IN",
      type: "website",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: `Contact Human Biomedical ${city}`,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: `Contact Human Biomedical | ${city}`,
      description:
        `Trusted laboratory equipment and biomedical solutions provider in ${city}.`,
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

  return <Contact city={city} />;
}