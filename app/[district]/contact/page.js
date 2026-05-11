import Contact from "@/app/sections/contact/ContactSection";

export default async function Page({ params }) {

  const resolvedParams =
    await params;

  const district =
    resolvedParams?.district || "";

  return (
    <Contact city={district} />
  );
}