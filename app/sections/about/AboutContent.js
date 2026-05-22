"use client";
import { useEffect, useState } from "react";
import "./about.css"
export default function AboutSection() {
const [mounted, setMounted] = useState(false);
const [loading, setLoading] = useState(true);
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

  }, 600);

  return () => clearTimeout(timer);

}, []);
  if (!mounted || loading) {

    return (
<div className="page-loader">
  <div className="loader-circle"></div>

  <h2>Human Biomedical</h2>

  <p>Loading amazing healthcare solutions...</p>
</div>
    );

  }
  return (
    <div className="about-page">
      {/* HERO */}
     <section className="about-hero">
        <div className="container text-center hero-inner">
            <h1 className="hero-title">
            About <span>Human Biomedical</span>
            </h1>
            <p className="hero-subtitle">
            Delivering advanced medical solutions with precision, trust, and innovation.
            </p>
        </div>
        </section>

      {/* ABOUT */}
      <section className="container py-5">
        <div className="row align-items-center g-5">

          <div className="col-md-6 fade-up">
            <img
              src="https://images.unsplash.com/photo-1581093588401-12cddbe33a9c"
              className="img-fluid about-img"
              alt="about"
            />
          </div>

          <div className="col-md-6 fade-up">
            <h2 className="fw-bold mb-3">Who We Are</h2>
            <p>
              Human Biomedical is a trusted name in the field of medical and diagnostic
              equipment. We provide high-quality instruments, reagents, and lab
              solutions designed for accuracy and performance.
            </p>
            <p>
              Our mission is to empower laboratories with cutting-edge technology
              and reliable solutions.
            </p>
          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="about-stats text-center">
        <div className="container">
          <div className="row">

            <div className="col-md-3 fade-up">
              <h2>500+</h2>
              <p>Products</p>
            </div>

            <div className="col-md-3 fade-up">
              <h2>200+</h2>
              <p>Clients</p>
            </div>

            <div className="col-md-3 fade-up">
              <h2>15+</h2>
              <p>Years Experience</p>
            </div>

            <div className="col-md-3 fade-up">
              <h2>24/7</h2>
              <p>Support</p>
            </div>

          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="container py-5 text-center">
        <h2 className="mb-5 fade-up">Why Choose Us</h2>

        <div className="row g-4">

          <div className="col-md-4 fade-up">
            <div className="about-card">
              <div className="icon">✔</div>
              <h5>Premium Quality</h5>
              <p>High precision and reliable medical equipment.</p>
            </div>
          </div>

          <div className="col-md-4 fade-up">
            <div className="about-card">
              <div className="icon">⚡</div>
              <h5>Fast Delivery</h5>
              <p>Quick and secure delivery across India.</p>
            </div>
          </div>

          <div className="col-md-4 fade-up">
            <div className="about-card">
              <div className="icon">💬</div>
              <h5>Expert Support</h5>
              <p>Dedicated team for customer assistance.</p>
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}
      {/* <section className="about-cta text-center">
        <div className="container">
          <h2>Looking for Medical Equipment?</h2>
          <p>Contact us today for best pricing and solutions.</p>
          <button className="btn btn-light mt-3 px-4">Get Quote</button>
        </div>
      </section> */}

    </div>
  );
}