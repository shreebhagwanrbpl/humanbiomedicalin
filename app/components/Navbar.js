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

  const pathParts =
    pathname
      .split("/")
      .filter(Boolean);

  const reservedRoutes = [
    "about",
    "contact",
    "items",
    "products",
    "services",
    "get-in-touch",
  ];

  const district =
    pathParts[0] &&
      !reservedRoutes.includes(
        pathParts[0]
      )
      ? pathParts[0]
      : "";

  const makeLink = (
    path = ""
  ) => {
    if (!district) {
      return path || "/";
    }

    if (!path) {
      return `/${district}`;
    }

    return `/${district}${path}`;
  };

  useEffect(() => {
    const handleScroll =
      () => {
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
    <nav
      className={`navbar ${scrolled
        ? "scrolled"
        : ""
        }`}
    >
      <div className="nav-container">

        {/* LOGO */}
        <div className="logo-box">
          <Link
            href={makeLink("")}
          >
            <Image
              src="/humanlogo.png"
              alt="logo"
              width={140}
              height={70}
              priority
            />
          </Link>
        </div>

        {/* NAV LINKS */}
        <div
          className={`nav-links ${open
            ? "active"
            : ""
            }`}
        >
          <Link
            className={
              pathname ===
                makeLink("") ||
                pathname === "/"
                ? "active"
                : ""
            }
            href={makeLink("")}
            onClick={() =>
              setOpen(false)
            }
          >
            Home
          </Link>

          <Link
            className={
              pathname.includes(
                "/about"
              )
                ? "active"
                : ""
            }
            href={makeLink(
              "/about"
            )}
            onClick={() =>
              setOpen(false)
            }
          >
            About
          </Link>

          <Link
            className={
              pathname.includes(
                "/items"
              )
                ? "active"
                : ""
            }
            href={makeLink(
              "/items"
            )}
            onClick={() =>
              setOpen(false)
            }
          >
            Products
          </Link>

          <Link
            className={
              pathname.includes(
                "/contact"
              )
                ? "active"
                : ""
            }
            href={makeLink(
              "/contact"
            )}
            onClick={() =>
              setOpen(false)
            }
          >
            Contact
          </Link>
        </div>

        {/* HAMBURGER */}
        <div
          className={`hamburger ${open
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
    </nav>
  );
}