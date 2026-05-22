"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {

  const pathname = usePathname();
  const [contactInfo, setContactInfo] =
    useState([]);
  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "products",
    "services",
  ];

  // district slug
const district =
  pathParts[0] &&
  !reservedRoutes.includes(pathParts[0])
    ? pathParts[0]
    : "";

  // format city
  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() + w.slice(1)
      )
      .join(" ");

  const citySlug = district;

  const city = formatCity(citySlug);
const [stateName, setStateName] =
  useState("");
  // dynamic links
const makeLink = (path = "") => {

  // no district
  if (!citySlug) {

    return path || "/";

  }

  // homepage
  if (!path) {

    return `/${citySlug}`;

  }

  // other pages
  return `/${citySlug}${path}`;
};
useEffect(() => {

  const fetchContact =
    async () => {

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

          setContactInfo(
            snap.data().contactInfo || []
          );

        }

      } catch (err) {

        console.log(err);

      }

    };

  fetchContact();

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

        setStateName(
          snap.data()?.state || ""
        );

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

        const label =
          x.label?.toLowerCase();

        return (
          label?.includes(key) ||
          (key === "address" &&
            label?.includes(
              "location"
            ))
        );

      })?.value || "-"
    );

  };
  return (
    <footer className="text-white pt-5 pb-3">

      <div className="container">

        <div className="row">

          {/* COMPANY */}
          <div className="col-md-3 mb-4">

            <h5 className="text-black">
              Human Biomedical
            </h5>

            <p className="text-secondary small">
              Providing high-quality medical equipment
              & diagnostic solutions with reliability
              and trust.
            </p>

          </div>

          {/* QUICK LINKS */}
          <div className="col-md-3 mb-4">

            <h6 className="text-black mb-3">
              Quick Links
            </h6>

            <ul className="list-unstyled text-secondary">

              <li>
                <Link
                  href={makeLink("")}
                  className="text-secondary text-decoration-none"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  href={makeLink("/about")}
                  className="text-secondary text-decoration-none"
                >
                  About
                </Link>
              </li>

              <li>
                <Link
                  href={makeLink("/products")}
                  className="text-secondary text-decoration-none"
                >
                  Products
                </Link>
              </li>

              {/* <li>
                <Link
                  href={makeLink("/services")}
                  className="text-secondary text-decoration-none"
                >
                  Services
                </Link>
              </li> */}

              <li>
                <Link
                  href={makeLink("/contact")}
                  className="text-secondary text-decoration-none"
                >
                  Contact
                </Link>
              </li>

            </ul>

          </div>

          {/* SERVICES */}
          <div className="col-md-3 mb-4">

            <h6 className="text-black mb-3">
              Services
            </h6>

            <ul className="list-unstyled text-secondary">

              <li>Diagnostic Equipment</li>

              <li>Medical Consumables</li>

              <li>Maintenance</li>

              <li>Support</li>

            </ul>

          </div>

          {/* CONTACT */}
          <div className="col-md-3 mb-4">

            <h6 className="text-black mb-3">
              Contact
            </h6>

<p className="text-secondary small mb-1">

  📍

{district && stateName
  ? `${city}, ${stateName}, India`
  : getValue("address")}

</p>

<p className="text-secondary small mb-1">
  📞 {getValue("phone")}
</p>

<p className="text-secondary small">
  📧 {getValue("email")}
</p>

          </div>

        </div>

        <hr className="border-secondary" />

        {/* COPYRIGHT */}
        <div className="text-center text-secondary small">

          © {new Date().getFullYear()}
          {" "}
          Human Biomedical.
          All rights reserved.

        </div>

      </div>

    </footer>
  );
}