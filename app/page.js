"use client";

// import Lottie from "lottie-react";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
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
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const checkDistrict =
      async () => {
        const slug =
          pathParts[0];
        if (!slug) {
          setCurrentCity("");
          setIsValidCity(false);
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

        } catch {

          setCurrentCity("");
          setIsValidCity(false);

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
  const [data, setData] = useState({
    // title: "Premium Medical Equipment Collection",
    // description:
    //   "High-quality diagnostic machines designed for precision & performance.",
    // button1Text: "Explore Products",
    // button2Text: "Get Quote",
  });
  const [homeLoading, setHomeLoading] =
    useState(true);
  // ✅ FIX BLANK PAGE AFTER NAVIGATION
  useEffect(() => {
    setMounted(true);
    window.scrollTo(0, 0);
  }, [pathname]);
  const makeLink = (path = "") => {
    if (!citySlug) return path || "/";
    return `/${citySlug}${path}`;
  };
  // ✅ COUNTER
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

  // ✅ FETCH PRODUCTS
  useEffect(() => {

    const fetchProducts = async () => {

      try {

        const snap = await getDoc(
          doc(
            db,
            "websites",
            "humanbiomedicalin",
            "pages",
            "products"
          )
        );

        if (snap.exists()) {

          const data = snap.data().products || [];

          const filtered = data
            .filter((item) => item.isPublished)
            .slice(0, 4);

          setProducts(filtered);

        }

      } catch (err) {
        console.error(err);
      }

    };

    fetchProducts();

  }, [pathname]);

  const icons = ["🧪", "💊", "⚙️", "🔧", "🌍", "📊"];

  // ✅ SERVICES
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

  // ✅ HOME DATA
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

        setHomeLoading(false);

      }
    );

    return () => unsub();

  }, [pathname]);

  // ✅ ANIMATION FIX
  useEffect(() => {

    setLoading(true);

    const items =
      document.querySelectorAll(".fade-up");

    items.forEach((el, i) => {

      el.classList.remove("active");

      setTimeout(() => {
        el.classList.add("active");
      }, i * 150);

    });

    const timer = setTimeout(() => {

      setMounted(true);

      setLoading(false);

    }, 500);

    return () => clearTimeout(timer);

  }, [pathname]);

  // ✅ PREVENT BLANK PAGE
  if (!mounted || homeLoading || loading) {

    return (
      <div className="page-loader">
        <div className="loader-circle"></div>

        <h2>Human Biomedical</h2>

        <p>Loading amazing healthcare solutions...</p>
      </div>
    );

  }
  return (
    <div className="text-white">

      {/* HERO */}
      <section className="hero-section d-flex align-items-center text-center">
        <div className="container">
          {/* <h1 className="hero-title">
            {data.title}
            {" "}
            {isValidCity
              ? ` in ${cityName}`
              : ""} 
          </h1> */}

          {/* <p className="hero-desc mt-3">
            {data.description}
            {" "}
            {isValidCity
              ? ` available in ${cityName}`
              : ""}
          </p> */}
          <h1 className="text-dark">Laboratory Equipment Supplier in India</h1> 
            <p>
            Human Biomedical is a trusted supplier of laboratory equipment,
            diagnostic instruments, pathology machines, hospital equipment,
            biomedical products and scientific instruments across India.
            We serve hospitals, laboratories, research institutes and healthcare
            organizations with reliable and high-quality solutions.
            </p>

          <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">

            <Link href={
              isValidCity
                ? `/${citySlug}/items`
                : "/items"
            }>
              <button className="btn btn-dark px-4">
                {data.button1Text}
              </button>
            </Link>

            <Link href={
              isValidCity
                ? `/${citySlug}/contact`
                : "/contact"
            }>
              <button className="btn btn-outline-dark px-4">
                {data.button2Text}
              </button>
            </Link>

          </div>

        </div>
      </section>

      {/* 📊 STATS SECTION */}
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

      {/* 🔥 SERVICES CARDS */}
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

      {/* 🔥 FEATURED PRODUCTS */}
      <section className="products-section fade-up">
        <div className="container text-center">
          <h6 className="section-subtitle">
            Our Products
          </h6>
          <h2 className="section-title mb-5">
            Featured Products
          </h2>
          <div className="row">
            {products.map((item, i) => (
              <div
                className="col-lg-3 col-md-6 mb-4"
                key={i}
              >
                <div className="product-card h-100">
                  {/* ✅ IMAGE FIX */}
                  <div className="product-img-wrapper">
                    <img
                      src={
                        item.image ||
                        "/no-image.png"
                      }
                      className="product-img"
                      alt={item.title}
                    />
                  </div>

                  <div className="product-content">
                    <h6>{item.title}</h6>
                    <p>
                      {item.desc?.slice(0, 50)}...
                    </p>
                    <Link href={`/${citySlug}/items`}>
                      <button className="btn product-btn w-100 view-btn">
                        View Details
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">

            {/* <button className="btn product-btn-main px-4">
              View All Products
            </button> */}

          </div>

        </div>

      </section>

      {/* 🔥 ABOUT SECTION */}
      <section className="py-5 text-white">

        <div className="container">

          <div className="row align-items-center">

            {/* LEFT IMAGE */}
            <div className="col-md-6 mb-4 mb-md-0">

              <img
                src="https://images.unsplash.com/photo-1581093458791-9d3c2c54b4e3"
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

      {/* 🔥 CTA SECTION */}
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

      {/* 🔥 TESTIMONIALS SECTION */}
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