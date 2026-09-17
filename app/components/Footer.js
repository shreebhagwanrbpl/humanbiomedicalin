"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaYoutube,
} from "react-icons/fa";

export default function Footer() {
  const pathname = usePathname();
  const [contactInfo, setContactInfo] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const pathParts = pathname.split("/").filter(Boolean);

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "products",
    "services",
  ];

  // district slug
  const district =
    pathParts[0] && !reservedRoutes.includes(pathParts[0])
      ? pathParts[0]
      : "";

  // format city
  const formatCity = (name = "") =>
    name
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

  const citySlug = district;
  const city = formatCity(citySlug);
  const [stateName, setStateName] = useState("");

  const isContactPage = pathname.includes("/contact");

  // dynamic links
  const makeLink = (path = "") => {
    if (!citySlug) {
      return path || "/";
    }
    if (!path) {
      return `/${citySlug}`;
    }
    return `/${citySlug}${path}`;
  };

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "humanbiomedicalin",
            "pages",
            "contact"
          )
        );

        if (snap.exists()) {
          setContactInfo(snap.data().contactInfo || []);
        }
      } catch (err) {
        console.log(err);
      }
    };

    fetchContact();
  }, []);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const { fetchFullCatalog } = await import("@/lib/data-fetcher");
        const catalog = await fetchFullCatalog();
        if (catalog && catalog.length > 0) {
          const catMap = {};
          catalog.forEach((item) => {
            if (item.category && item.category !== "Other Products") {
              catMap[item.category] = (catMap[item.category] || 0) + 1;
            }
          });
          const catList = Object.keys(catMap).sort();
          setActiveCategories(catList);
        }
      } catch (err) {
        console.error("Error fetching categories for footer:", err);
      }
    };

    loadCategories();
  }, []);

  useEffect(() => {
    const loadDistrict = async () => {
      if (!citySlug) return;

      try {
        const snap = await getDoc(
          doc(
            db,
            "websites",
            "humanbiomedicalin",
            "districts",
            citySlug
          )
        );

        if (snap.exists()) {
          setStateName(snap.data()?.state || "");
        }
      } catch (err) {
        console.log(err);
      }
    };

    loadDistrict();
  }, [citySlug]);

  const getValue = (key) => {
    return (
      contactInfo.find((x) => {
        const label = x.label?.toLowerCase();
        return (
          label?.includes(key) ||
          (key === "address" && label?.includes("location"))
        );
      })?.value || "-"
    );
  };

  return (
    <footer className="footer-container text-white pt-5 pb-3">
      <style jsx>{`
        .footer-container {
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          color: #334155;
        }
        .social-icon-btn {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: #f8fafc;
          color: #475569;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: all 0.3s ease;
          text-decoration: none;
          border: 1px solid #e2e8f0;
        }
        .social-icon-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .social-icon-btn.whatsapp:hover { background: #25d366; color: #fff; border-color: #25d366; }
        .social-icon-btn.facebook:hover { background: #1877f2; color: #fff; border-color: #1877f2; }
        .social-icon-btn.instagram:hover { background: #e4405f; color: #fff; border-color: #e4405f; }
        .social-icon-btn.linkedin:hover { background: #0a66c2; color: #fff; border-color: #0a66c2; }
        .social-icon-btn.youtube:hover { background: #ff0000; color: #fff; border-color: #ff0000; }
        .category-footer-link {
          color: #64748b;
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s ease;
        }
        .category-footer-link:hover {
          color: #d62828;
          text-decoration: underline;
        }
      `}</style>
      <div className="container">
        <div className="row g-4">
          {/* COMPANY */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h5 className="text-black fw-bold mb-3">
              Human Biomedical LLP
            </h5>

            <p className="text-secondary small mt-2" style={{ lineHeight: "1.6" }}>
              Providing high-quality medical equipment & diagnostic solutions with reliability and trust across India.
            </p>

            {/* SOCIAL MEDIA ICONS */}
            <div className="d-flex gap-2 mt-3">
              <a
                href="https://wa.me/918112279728"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn whatsapp"
                title="WhatsApp"
              >
                <FaWhatsapp size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn facebook"
                title="Facebook"
              >
                <FaFacebook size={18} />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn instagram"
                title="Instagram"
              >
                <FaInstagram size={18} />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn linkedin"
                title="LinkedIn"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="social-icon-btn youtube"
                title="YouTube"
              >
                <FaYoutube size={18} />
              </a>
            </div>
          </div>

          {/* QUICK LINKS */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-black mb-3 fw-bold">
              Quick Links
            </h6>

            <ul className="list-unstyled text-secondary">
              <li className="mb-2">
                <Link
                  href={makeLink("")}
                  className="text-secondary text-decoration-none hover:text-dark"
                >
                  Home
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href={makeLink("/about")}
                  className="text-secondary text-decoration-none hover:text-dark"
                >
                  About Us
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href={makeLink("/items")}
                  className="text-secondary text-decoration-none hover:text-dark"
                >
                  All Products
                </Link>
              </li>

              <li className="mb-2">
                <Link
                  href={makeLink("/contact")}
                  className="text-secondary text-decoration-none hover:text-dark"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* ACTIVE CATEGORIES */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-black mb-3 fw-bold">
              Active Categories
            </h6>

            <ul className="list-unstyled text-secondary">
              {activeCategories.length > 0 ? (
                activeCategories.slice(0, 6).map((cat) => (
                  <li key={cat} className="mb-2">
                    <Link
                      href={`${makeLink("/items")}?category=${encodeURIComponent(cat)}`}
                      className="category-footer-link d-flex align-items-center gap-1"
                    >
                      <span style={{ color: "#d62828", fontWeight: "bold" }}>›</span> {cat}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li className="mb-2">
                    <Link href={`${makeLink("/items")}?category=Biochemistry%20Analyzer`} className="category-footer-link">
                      <span style={{ color: "#d62828", fontWeight: "bold" }}>›</span> Biochemistry Analyzer
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href={`${makeLink("/items")}?category=Hematology%20Analyzer`} className="category-footer-link">
                      <span style={{ color: "#d62828", fontWeight: "bold" }}>›</span> Hematology Analyzer
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href={`${makeLink("/items")}?category=Electrolyte%20Analyzer`} className="category-footer-link">
                      <span style={{ color: "#d62828", fontWeight: "bold" }}>›</span> Electrolyte Analyzer
                    </Link>
                  </li>
                  <li className="mb-2">
                    <Link href={`${makeLink("/items")}?category=Immunology%20Analyzer`} className="category-footer-link">
                      <span style={{ color: "#d62828", fontWeight: "bold" }}>›</span> Immunology Analyzer
                    </Link>
                  </li>
                </>
              )}
              {activeCategories.length > 6 && (
                <li className="mt-2">
                  <Link
                    href={makeLink("/items")}
                    className="text-decoration-none fw-bold"
                    style={{ color: "#d62828", fontSize: "13px" }}
                  >
                    + View All Categories →
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* CONTACT */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h6 className="text-black mb-3 fw-bold">
              Contact Us
            </h6>

            <p className="text-secondary small mb-2" style={{ lineHeight: "1.5" }}>
              📍{" "}
              {district && stateName
                ? `${city}, ${stateName}, India`
                : getValue("address")}
            </p>

            <p className="text-secondary small mb-2">
              📞 {getValue("phone") !== "-" ? getValue("phone") : "+91 8112279728"}
            </p>

            {/* LOCATION MAP (Hidden on contact page to prevent duplicate maps) */}
            {!isContactPage && (
              <div className="mt-3">
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    district && stateName
                      ? `${city}, ${stateName}, India`
                      : getValue("address") && getValue("address") !== "-"
                        ? getValue("address")
                        : "Amrapali, Vaishali Nagar, Jaipur, Rajasthan 302021"
                  )}&output=embed`}
                  width="100%"
                  height="130"
                  loading="lazy"
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.06)"
                  }}
                  title="Location Map"
                ></iframe>
              </div>
            )}
          </div>
        </div>

        <hr className="border-secondary my-4" />

        {/* COPYRIGHT */}
        <div className="text-center text-secondary small">
          © {new Date().getFullYear()} Human Biomedical LLP. All rights reserved.
        </div>
      </div>
    </footer>
  );
}