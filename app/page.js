import Hero from "./components/Hero";
import StatsCounter from "./components/StatsCounter";
import {
  getCatalogFromMongo,
  getHomeDataFromMongo,
  getServicesDataFromMongo,
} from "@/lib/mongodb";
import { fetchHomeData, fetchServicesData, fetchFullCatalog } from "@/lib/data-fetcher";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

export const revalidate = 60; // ISR cache revalidation every 60s for peak speed

export default async function Home({ city: cityProp = "" }) {
  // 1. Fetch Dynamic Data directly from MongoDB with memory connection pooling
  let rawHomeData = null;
  let rawServicesData = null;
  let catalog = [];

  try {
    [rawHomeData, rawServicesData, catalog] = await Promise.all([
      getHomeDataFromMongo().catch(() => null),
      getServicesDataFromMongo().catch(() => null),
      getCatalogFromMongo().catch(() => []),
    ]);
  } catch (e) {
    // Fallback to API fetchers
    [rawHomeData, rawServicesData, catalog] = await Promise.all([
      fetchHomeData().catch(() => null),
      fetchServicesData().catch(() => null),
      fetchFullCatalog().catch(() => []),
    ]);
  }

  const defaultHomeData = {
    title: "High-Precision Clinical Laboratory Analyzers & Biomedical Equipment - Human Biomedicals",
    description:
      "From advanced clinical chemistry and hematology systems to rapid diagnostic test kits and point-of-care instruments, Human Biomedicals supplies certified, dependable biomedical equipment engineered for clinical precision and continuous lab uptime.",
    button1Text: "Browse Diagnostic Systems",
    button2Text: "Inquire for Lab Setup",
  };

  const data = rawHomeData || defaultHomeData;

  let services = [];
  if (rawServicesData && Array.isArray(rawServicesData.services)) {
    services = rawServicesData.services;
  } else if (Array.isArray(rawServicesData)) {
    services = rawServicesData;
  } else {
    services = [
      {
        title: "Scheduled Maintenance, Calibration & Performance Validation",
        desc: "Proactive maintenance packages, routine calibration standards, and precision validation ensuring strict compliance with clinical quality benchmarks.",
      },
      {
        title: "Comprehensive Lab Instrumentation Setup & Turnkey Solutions",
        desc: "Complete procurement advisory, equipment installation, site readiness verification, and operational dry-runs for hospital pathology laboratories.",
      },
      {
        title: "Biomedical Instrumentation Deployment & Method Verification",
        desc: "Expert equipment installation followed by linearity checks, carryover assessments, precision study verification, and seamless integration.",
      },
      {
        title: "Immunoassay, Chemistry & Hematology Reagent Distribution",
        desc: "High-stability enzymatic reagents, test strips, lyse solutions, and cleaning solutions compatible with major automated analyzers.",
      },
      {
        title: "Rapid-Response Technical Support & On-Site Machine Repairs",
        desc: "Dedicated field engineering teams equipped with diagnostic tools to troubleshoot hardware anomalies and hydraulic issues.",
      },
      {
        title: "Total Quality Management (TQM) & Continuous QC Verification",
        desc: "Structured quality management frameworks, daily blank checks, CV% tracking, and regular analyzer audits.",
      },
    ];
  }

  const allProducts = Array.isArray(catalog) ? catalog : catalog.products || [];
  const featuredProducts = allProducts.slice(0, 8);

  const icons = ["🧪", "💊", "⚙️", "🔧", "🌍", "📊"];

  const isValidCity = Boolean(cityProp && cityProp.trim().length > 0);
  const cityName = isValidCity
    ? cityProp
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "";
  const citySlug = isValidCity
    ? cityProp.toLowerCase().replace(/\s+/g, "-")
    : "";

  const makeLink = (path = "") => {
    if (!citySlug) return path || "/";
    return `/${citySlug}${path}`;
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Human Biomedical",
    url: "https://humanbiomedical.in",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://humanbiomedical.in/items?search={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  const productListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Featured Biomedical Equipment and Test Strips",
    itemListElement: featuredProducts.map((p, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: p.title || p.name,
      url: `https://humanbiomedical.in/items/${p.slug || p.id}`,
    })),
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productListSchema) }}
      />

      {/* HERO SECTION */}
      <Hero
        data={data}
        isValidCity={isValidCity}
        cityName={cityName}
        citySlug={citySlug}
      />

      {/* STATS SECTION (Animated Counter Client Component) */}
      <StatsCounter />

      {/* SERVICES SECTION */}
      <section className="services-section">
        <div className="container">
          <div className="row g-4">
            <div className="section-title text-center">
              <h1>Our Services</h1>
              <p className="section-subtitle">
                Reliable Healthcare & Diagnostic Solutions
                {isValidCity ? ` in ${cityName}` : ""}
              </p>
            </div>

            {services.map((item, i) => (
              <div className="col-md-4" key={i}>
                <div className="service-card">
                  <div className="icon">{icons[i % icons.length] || "⚙️"}</div>
                  <h5>{item.title}</h5>
                  <p>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS SECTION */}
      <section className="products-section fade-up py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="products-badge">OUR PRODUCTS</span>
            <h2 className="section-title mb-2">
              Featured Products & Diagnostic Solutions
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "600px", fontSize: "15px" }}>
              Explore certified laboratory equipment, diagnostic analyzers, test strips, and hospital devices engineered for maximum clinical precision.
            </p>
          </div>

          <div className="row g-4">
            {featuredProducts.map((item, i) => {
              const displayImage =
                item.images?.[0] || item.image || "/placeholder.jpg";
              const productUrl = makeLink(`/items/${item.slug || item.id}`);

              return (
                <div
                  className="col-lg-3 col-md-6 col-sm-12"
                  key={item.uid || item.slug || item.id || i}
                >
                  <div className="product-card h-100 d-flex flex-column">
                    <div className="product-img-wrapper">
                      <span className="product-category-badge">
                        {item.category || "Medical Equipment"}
                      </span>
                      <Image
                        src={displayImage}
                        className="product-img"
                        alt={item.title || "Product Image"}
                        width={300}
                        height={260}
                        style={{ objectFit: "contain" }}
                        priority={i < 4}
                        loading={i < 4 ? "eager" : "lazy"}
                      />
                    </div>

                    <div className="product-content d-flex flex-column flex-grow-1">
                      <div>
                        {item.brand && (
                          <span className="product-brand-tag">
                            {item.brand}
                          </span>
                        )}
                        <h5 className="product-title" title={item.title}>
                          {item.title}
                        </h5>
                        <p className="product-desc">
                          {item.desc ||
                            item.description ||
                            "Premium laboratory and diagnostic medical equipment."}
                        </p>
                      </div>

                      <div className="product-footer mt-auto pt-2">
                        <Link
                          href={productUrl}
                          className="w-100 text-decoration-none"
                        >
                          <button className="btn product-btn w-100 d-flex align-items-center justify-content-center gap-2">
                            <span>View Details</span>
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <line x1="5" y1="12" x2="19" y2="12"></line>
                              <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-5">
            <Link href={makeLink("/items")} className="text-decoration-none">
              <button
                className="btn px-4 py-2.5 rounded-pill font-semibold"
                style={{
                  border: "2px solid #0f766e",
                  color: "#0f766e",
                  fontWeight: "700",
                  fontSize: "14px",
                  background: "transparent",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                }}
              >
                Explore Full Product Catalog ({allProducts.length} Items) →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section className="py-5 text-white bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <Image
                src="/about.png"
                className="img-fluid rounded shadow"
                alt="About Human Biomedical"
                width={600}
                height={400}
                style={{ objectFit: "cover" }}
              />
            </div>

            <div className="col-md-6">
              <h6 className="text-secondary text-uppercase fw-bold">
                About Human Biomedical
              </h6>
              <h2 className="fw-bold mb-3 text-dark">
                Trusted Partner in Clinical Diagnostics & Medical Equipment
              </h2>
              <p className="text-secondary">
                Human Biomedical is a reputable medical technology provider delivering state-of-the-art laboratory analyzers, diagnostic consumables, and equipment for clinical laboratories, research centers, and hospitals.
              </p>
              <p className="text-secondary">
                With a nationwide network, comprehensive warranty support, and prompt on-site engineering services, we empower healthcare specialists to achieve diagnostic accuracy with zero downtime.
              </p>

              <div className="mt-4 d-flex gap-3">
                <Link href={makeLink("/about")}>
                  <button className="btn btn-dark px-4 py-2">
                    Know More About Us
                  </button>
                </Link>
                <Link href={makeLink("/contact")}>
                  <button className="btn btn-outline-dark px-4 py-2">
                    Get in Touch
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="cta-section text-center">
        <div className="container">
          <h2 className="cta-title mb-3">
            Looking for Medical Equipment or Diagnostics Setup?
          </h2>
          <p className="cta-desc mb-4">
            Get best direct distributor pricing, manufacturer warranty, and turnkey installation support for your clinical laboratory or hospital.
          </p>
          <div className="d-flex justify-content-center gap-3 flex-wrap">
            <Link href={makeLink("/contact")}>
              <button className="btn cta-btn">Request Quotation</button>
            </Link>
            <Link href={makeLink("/items")}>
              <button className="btn cta-btn-outline">Browse Catalog</button>
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonial-section">
        <div className="container text-center">
          <h6 className="section-subtitle">Client Reviews</h6>
          <h2 className="section-title mb-5">Trusted by Pathologists & Clinicians</h2>
          <div className="row">
            <div className="col-md-4 mb-4">
              <div className="testimonial-card h-100">
                <p>
                  "Outstanding quality equipment and prompt installation. The diagnostic test strips and analyzer accuracy are exceptional."
                </p>
                <div className="mt-3">
                  <h6 className="fw-bold">Dr. Sharma</h6>
                  <small className="text-muted">Senior Pathologist, Diagnostic Lab</small>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="testimonial-card h-100">
                <p>
                  "We upgraded our hospital lab machinery through Human Biomedical. Seamless deployment, great training, and zero breakdowns."
                </p>
                <div className="mt-3">
                  <h6 className="fw-bold">Dr. Mehta</h6>
                  <small className="text-muted">Hospital Laboratory Director</small>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-4">
              <div className="testimonial-card h-100">
                <p>
                  "Genuine products, competitive quotes, and immediate customer care. Highly recommended for any medical institution."
                </p>
                <div className="mt-3">
                  <h6 className="fw-bold">Dr. Verma</h6>
                  <small className="text-muted">Clinical Laboratory Owner</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}