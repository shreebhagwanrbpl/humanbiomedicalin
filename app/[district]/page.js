// import Home from "../page";

// export default async function Page({ params }) {

//   const resolvedParams = await params;

//   const district =
//     resolvedParams?.district || "jaipur";

//   const city = district
//     .replace(/-/g, " ")
//     .replace(/\b\w/g, (char) =>
//       char.toUpperCase()
//     );

//   return <Home city={city} />;
// }


import Home from "../page";

export async function generateMetadata({ params }) {
  const { district } = await params;

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return {
    title: `Laboratory Equipment Supplier in ${city} | Human Biomedical`,
    description: `Human Biomedical supplies laboratory equipment, pathology machines, diagnostic instruments and hospital equipment in ${city}.`,
    alternates: {
      canonical: `https://humanbiomedical.in/${district}`,
    },
  };
}

export default async function Page({ params }) {
  const { district } = await params;

  const city = district
    .replace(/-/g, " ")
    .replace(/\b\w/g, c => c.toUpperCase());

  return <Home city={city} />;
}