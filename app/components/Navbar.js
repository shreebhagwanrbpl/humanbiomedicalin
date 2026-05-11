"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import "@/app/components/pages.css";
import "./Navbar.css";

export default function Navbar() {

  const [open, setOpen] =
    useState(false);

  const [scrolled, setScrolled] =
    useState(false);

  const pathname =
    usePathname();

  // current path
  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  // reserved routes
  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "products",
    "services",
    "get-in-touch",
  ];

  // district slug
  const district =
    pathParts[0] &&
    !reservedRoutes.includes(
      pathParts[0]
    )
      ? pathParts[0]
      : "";

  // dynamic links
  const makeLink = (
    path = ""
  ) => {

    // no district
    if (!district) {

      return path || "/";

    }

    // homepage
    if (!path) {

      return `/${district}`;

    }

    // other pages
    return `/${district}${path}`;

  };

  // scroll effect
  useEffect(() => {

    const handleScroll = () => {

      setScrolled(
        window.scrollY > 50
      );

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, []);

  return (
    <>
      <nav
        className={`navbar ${
          scrolled
            ? "scrolled"
            : ""
        }`}
      >

        <div className="nav-container">

          {/* LEFT - LOGO */}
          <div className="logo-box">

            <Link href={makeLink("")}>

              <Image
                src="/logo.png"
                alt="logo"
                width={96}
                height={83}
              />

            </Link>

          </div>

          {/* CENTER - MENU */}
          <div
            className={`nav-links ${
              open
                ? "active"
                : ""
            }`}
          >

            {/* HOME */}
            <Link
              className={
                pathname ===
                  makeLink("") ||
                pathname === "/"
                  ? "active"
                  : ""
              }
              href={makeLink("")}
            >
              Home
            </Link>

            {/* ABOUT */}
            <Link
            className={
              pathname.includes("/about")
                ? "active"
                : ""
            }
              href={makeLink("/about")}
            >
              About
            </Link>

            {/* PRODUCTS */}
            <Link
            className={
              pathname.includes("/products")
                ? "active"
                : ""
            }
              href={makeLink("/products")}
            >
              Products
            </Link>

            {/* CONTACT */}
            <Link
            className={
              pathname.includes("/contact")
                ? "active"
                : ""
            }
              href={makeLink("/contact")}
            >
              Contact
            </Link>

          </div>

          {/* RIGHT */}
          <div className="nav-right">

            <Link
              href={makeLink("/contact")}
            >

              <button className="quote-btn">
                Get Quote
              </button>

            </Link>

            {/* HAMBURGER */}
            <div
              className={`hamburger ${
                open
                  ? "open"
                  : ""
              }`}
              onClick={() =>
                setOpen(!open)
              }
            >

              <span></span>
              <span></span>
              <span></span>

            </div>

          </div>

        </div>

      </nav>
    </>
  );
}