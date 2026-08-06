"use client";
import Hero from "./components/Hero";
// import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  onSnapshot,
  getDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import Link from "next/link";

// import toast from "react-hot-toast";
import Image from "next/image";
import "./globals.css";



export default function Home({ city }) {

  const pathname = usePathname();
  const pathParts = pathname
    .split("/")
    .filter(Boolean);
  // current city
  // const currentCity = city || "";
  const [currentCity, setCurrentCity] = useState("");
  const [isValidCity, setIsValidCity] = useState(false);
  const [cityLoading, setCityLoading] = useState(true);


  useEffect(() => {
    const checkDistrict =
      async () => {
        const slug =
          pathParts[0];
        if (!slug) {
          setCurrentCity("");
          setIsValidCity(false);
          setCityLoading(false);
          return;
        }

        try {

          const snap = await getDoc(
            doc(
              db,
              "websites",
              "humanbiomedicalin",
              "districts",
              slug
            )
          );

          // valid city
          if (snap.exists()) {

            setCurrentCity(slug);
            setIsValidCity(true);

          } else {

            // invalid city
            setCurrentCity("");
            setIsValidCity(false);

          }
          setCityLoading(false);
        } catch {

          setCurrentCity("");
          setIsValidCity(false);
          setCityLoading(false);

        }

      };

    checkDistrict();

  }, [pathname]);

  // format city
  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const citySlug = currentCity
    ?.toLowerCase()
    ?.replace(/\s+/g, "-");

  const cityName =
    formatCity(currentCity);
  const [mounted, setMounted] = useState(false);
  const [counts, setCounts] = useState([0, 0, 0, 0]);
  const [animationData, setAnimationData] = useState(null);
  const [products, setProducts] = useState([]);
  const [services, setServices] = useState([]);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  //  FIX BLANK PAGE AFTER NAVIGATION
  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, [pathname]);
  const makeLink = (path = "") => {
    if (!citySlug) return path || "/";
    return `/${citySlug}${path}`;
  };
  // COUNTER
  useEffect(() => {
    const target = [500, 200, 15, 24];
    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((val, i) =>
          val < target[i]
            ? val + Math.ceil(target[i] / 40)
            : target[i]
        )
      );
    }, 50);

    setTimeout(() => clearInterval(interval), 2000);
    return () => clearInterval(interval);
  }, [pathname]);

  // FETCH PRODUCTS
useEffect(() => {

  const fetchProducts = async () => {
    try {
      const { fetchFullCatalog } = await import("@/lib/data-fetcher");
      const catalog = await fetchFullCatalog();
      if (catalog && catalog.length > 0) {
        setProducts(catalog.slice(0, 4));
      }
    } catch (err) {
      console.error("Error loading featured products:", err);
    }
  };

  fetchProducts();
}, [pathname]);

  const icons = ["🧪", "💊", "⚙️", "🔧", "🌍", "📊"];

  //  SERVICES
  useEffect(() => {

    const unsub = onSnapshot(
      doc(
        db,
        "websites",
        "humanbiomedicalin",
        "pages",
        "services"
      ),
      (snap) => {

        if (snap.exists()) {
          setServices(snap.data().services || []);
        }

      }
    );

    return () => unsub();

  }, [pathname]);

  // HOME DATA
  useEffect(() => {

    const unsub = onSnapshot(
      doc(
        db,
        "websites",
        "humanbiomedicalin",
        "pages",
        "home"
      ),
      (docSnap) => {

        if (docSnap.exists()) {
          setData(docSnap.data());
        }

        setLoading(false);



      }
    );

    return () => unsub();

  }, [pathname]);
  if (loading || cityLoading) {
    return (
      <div className="page-loader">
        <div className="loader-circle"></div>

        <h2>Human Biomedical</h2>

        <p>Loading amazing healthcare solutions...</p>
      </div>
    );
  }
  return (
    <div>

      <Hero
        data={data}
        isValidCity={isValidCity}
        cityName={cityName}
        citySlug={citySlug}
      />

      {/*  STATS SECTION */}
      <section className="stats-section text-center">

        <div className="container">

          <div className="row">

            <div className="col-md-3 mb-4 stat-anim">
              <div className="stat-box">
                <h2>{counts[0]}+</h2>
                <p>Products</p>
              </div>
            </div>

            <div className="col-md-3 mb-4 stat-anim">
              <div className="stat-box">
                <h2>{counts[1]}+</h2>
                <p>Clients</p>
              </div>
            </div>

            <div className="col-md-3 mb-4 stat-anim">
              <div className="stat-box">
                <h2>{counts[2]}+</h2>
                <p>Years Experience</p>
              </div>
            </div>

            <div className="col-md-3 mb-4 stat-anim">
              <div className="stat-box">
                <h2>24/7</h2>
                <p>Support</p>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/*  SERVICES CARDS */}
      <section className="services-section">

        <div className="container">

          <div className="row g-4">

            <div className="section-title text-center">
              <h1>Our Services</h1>

              <p className="section-subtitle">
                Reliable Healthcare & Diagnostic Solutions
              </p>
            </div>

            {services.map((item, i) => (

              <div className="col-md-4" key={i}>

                <div className="service-card">

                  <div className="icon">
                    {icons[i] || "⚙️"}
                  </div>

                  <h5>{item.title}</h5>

                  <p>{item.desc}</p>

                </div>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products-section fade-up py-5">
        <div className="container">
          <div className="text-center mb-5">
            <span className="products-badge">
              OUR PRODUCTS
            </span>
            <h2 className="section-title mb-2">
              Featured Products & Solutions
            </h2>
            <p className="text-muted mx-auto" style={{ maxWidth: "600px", fontSize: "15px" }}>
              Explore high-performance biomedical instruments, analyzers and medical devices engineered for laboratories & hospitals.
            </p>
          </div>

          <div className="row g-4">
            {products.map((item, i) => (
              <div
                className="col-lg-3 col-md-6 col-sm-12"
                key={item.uid || item.slug || i}
              >
                <div className="product-card h-100 d-flex flex-column">
                  {/* IMAGE WRAPPER */}
                  <div className="product-img-wrapper">
                    <span className="product-category-badge">
                      {item.category || "Biomedical"}
                    </span>
                    <img
                      src={
                        item.images?.[0] ||
                        item.image ||
                        item.images?.[0]?.url ||
                        "/placeholder.jpg"
                      }
                      className="product-img"
                      alt={item.title}
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.jpg";
                      }}
                    />
                  </div>

                  {/* CONTENT */}
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

                    {/* ACTION BUTTON AT BOTTOM */}
                    <div className="product-footer mt-auto pt-2">
                      <Link
                        href={makeLink(item.slug ? `/items/${item.slug}` : "/items")}
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
            ))}
          </div>

          <div className="text-center mt-5">
            <Link href={makeLink("/items")} className="text-decoration-none">
              <button
                className="btn px-4 py-2.5 rounded-pill font-semibold"
                style={{
                  border: "2px solid #d62828",
                  color: "#d62828",
                  fontWeight: "700",
                  fontSize: "14px",
                  background: "transparent",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#d62828";
                  e.currentTarget.style.color = "#ffffff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#d62828";
                }}
              >
                Explore Full Product Catalog →
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/*  ABOUT SECTION */}
      <section className="py-5 text-white">

        <div className="container">

          <div className="row align-items-center">

            <div className="col-md-6 mb-4 mb-md-0">

              <img
                src="/about.png"
                className="img-fluid rounded shadow"
                alt="About"
              />

            </div>

            {/* RIGHT CONTENT */}
            <div className="col-md-6">

              <h6 className="text-secondary text-uppercase">
                About Us
              </h6>

              <h2 className="fw-bold mb-3 text-black">
                Trusted Partner in Medical Equipment
              </h2>

              <p className="text-secondary">
                We provide high-quality diagnostic machines and medical
                solutions designed for accuracy, performance, and reliability.
                Our mission is to empower healthcare professionals with the
                best tools.
              </p>

              <p className="text-secondary">
                With years of experience and a strong client base, we ensure
                top-notch service, support, and innovative solutions tailored
                to your needs.
              </p>

              <div className="mt-4 d-flex gap-3">
                <Link href={makeLink("/about")}>
                  <button className="btn btn-light px-4">
                    Know More
                  </button>
                </Link>
                {/* <button className="btn btn-outline-light px-4">
                  Contact Us
                </button> */}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/*  CTA SECTION */}
      <section className="cta-section text-center">

        <div className="container">

          <h2 className="cta-title mb-3">
            Need Medical Equipment for Your Lab?
          </h2>

          <p className="cta-desc mb-4">
            Get the best pricing, quality products, and expert support.
            Let’s help you grow your healthcare business.
          </p>

          <div className="d-flex justify-content-center gap-3 flex-wrap">

            {/* <button className="btn cta-btn">
              Get Quote
            </button> */}
            <Link href={makeLink("/contact")}>
              <button className="btn cta-btn-outline">
                Contact Us
              </button>
            </Link>
          </div>

        </div>

      </section>

      {/*  TESTIMONIALS SECTION */}
      <section className="testimonial-section">

        <div className="container text-center">

          <h6 className="section-subtitle">
            Testimonials
          </h6>

          <h2 className="section-title mb-5">
            What Our Clients Say
          </h2>

          <div className="row">

            <div className="col-md-4 mb-4">

              <div className="testimonial-card h-100">

                <p>
                  "Amazing quality equipment and fast delivery.
                  Their support team is very helpful and professional."
                </p>

                <div className="mt-3">
                  <h6>Dr. Sharma</h6>
                  <small>Pathologist</small>
                </div>

              </div>

            </div>

            <div className="col-md-4 mb-4">

              <div className="testimonial-card h-100">

                <p>
                  "We upgraded our lab with their machines and saw
                  immediate improvement in efficiency."
                </p>

                <div className="mt-3">
                  <h6>Dr. Mehta</h6>
                  <small>Lab Owner</small>
                </div>

              </div>

            </div>

            <div className="col-md-4 mb-4">

              <div className="testimonial-card h-100">

                <p>
                  "Reliable products and great pricing.
                  Highly recommended for medical professionals."
                </p>

                <div className="mt-3">
                  <h6>Dr. Verma</h6>
                  <small>Clinic Owner</small>
                </div>

              </div>

            </div>

          </div>

        </div>

      </section>
    </div>
  );
}