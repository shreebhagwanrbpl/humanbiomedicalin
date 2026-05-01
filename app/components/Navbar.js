"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import "@/app/components/pages.css"
import Link from "next/link";

export default function Navbar() {

  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  // SCROLL EFFECT
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
    
<div className="nav-container">
  {/* LEFT - LOGO */}
<div className="logo-box">
  <Link href="/">
    <Image src="/logo.png" alt="logo" width={96} height={83} />
  </Link>
</div>

  {/* CENTER - MENU */}
<div className={`nav-links ${open ? "active" : ""}`}>
  <Link className={pathname === "/" ? "active" : ""} href="/">Home</Link>
  <Link className={pathname === "/products" ? "active" : ""} href="/products">Products</Link>
  <Link className={pathname === "/about" ? "active" : ""} href="/about">About</Link>
  <Link className={pathname === "/get-in-touch" ? "active" : ""} href="/get-in-touch">Contact</Link>
</div>

  {/* RIGHT */}
  <div className="nav-right">
    <Link href="/get-in-touch">
    <button className="nav-btn">Get Quote</button>
      </Link>
    <div className={`hamburger ${open ? "open" : ""}`} onClick={() => setOpen(!open)}>
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