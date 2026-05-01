"use client";

import Image from "next/image";
import "./globals.css"
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Home() {
 const [counts, setCounts] = useState([0, 0, 0, 0]);

  useEffect(() => {
    const target = [500, 200, 15, 24];

    const interval = setInterval(() => {
      setCounts((prev) =>
        prev.map((val, i) =>
          val < target[i] ? val + Math.ceil(target[i] / 40) : target[i]
        )
      );
    }, 50);

    setTimeout(() => clearInterval(interval), 2000);
  }, []);




useEffect(() => {
  const elements = document.querySelectorAll(".fade-up");

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  });

  elements.forEach((el) => observer.observe(el));
}, []);


  return (
    <div className="text-white">
     <section className="hero-section d-flex align-items-center text-center">
  <div className="container">
    <h1 className="hero-title">
      Premium Medical <br /> Equipment Collection
    </h1>

    <p className="hero-desc mt-3">
      High-quality diagnostic machines designed for precision & performance.
    </p>

    <div className="mt-4 d-flex justify-content-center gap-3 flex-wrap">
    <Link href="/products">
    <button className="btn btn-dark px-4">
      Explore Products
    </button>
  </Link>

  <Link href="/get-in-touch">
    <button className="btn btn-outline-dark px-4">
      Contact Us
    </button>
  </Link>
    </div>
  </div>
</section>

      {/* 📊 STATS SECTION */}
   <section className="stats-section text-center">
      <div className="container" style={{ marginTop: "-23px" }}>
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

      {/* 🧪 SERVICES SECTION */}
     <section className="services-section text-center">
  <div className="container">

    <h6 className="section-subtitle">Our Services</h6>
    <h2 className="section-title mb-5">What We Offer</h2>

    <div className="row">

      <div className="col-md-4 mb-4">
        <div className="service-card h-100">
          <div className="service-icon">🧪</div>
          <h5>Diagnostic Equipment</h5>
          <p>
            Advanced lab machines for accurate results.
          </p>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="service-card h-100">
          <div className="service-icon">💉</div>
          <h5>Medical Consumables</h5>
          <p>
            High-quality consumables for daily use.
          </p>
        </div>
      </div>

      <div className="col-md-4 mb-4">
        <div className="service-card h-100">
          <div className="service-icon">⚙️</div>
          <h5>Maintenance</h5>
          <p>
            Reliable support & servicing solutions.
          </p>
        </div>
      </div>

    </div>

  </div>
</section>

      {/* 🔥 FEATURED PRODUCTS */}
<section className="products-section fade-up">
  <div className="container text-center">

    <h6 className="section-subtitle">Our Products</h6>
    <h2 className="section-title mb-5">Featured Products</h2>

    <div className="row">

      {[ 
        {
          name: "Hematology Analyzer",
          img: "https://images.unsplash.com/photo-1581091870621-1c6c9a1b7c0d",
          desc: "Advanced blood testing machine"
        },
        {
          name: "Biochemistry Analyzer",
          img: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b",
          desc: "High precision diagnostic system"
        },
        {
          name: "Lab Reagents Kit",
          img: "https://images.unsplash.com/photo-1576086213369-97a306d36557",
          desc: "Reliable testing reagents"
        },
        {
          name: "Blood Collection Tubes",
          img: "https://images.unsplash.com/photo-1581594693702-fbdc51b2763b",
          desc: "Safe & sterile collection tubes"
        }
      ].map((item, i) => (

        <div className="col-md-3 mb-4" key={i}>
          <div className="product-card h-100">

            <div className="product-img">
              <img src={item.img} className="img-fluid" />
            </div>

           <div className="product-content">
            <h6>{item.name}</h6>
            <p>{item.desc}</p>

            <button className="btn product-btn w-100 view-btn">
              View Details
            </button>
          </div>

          </div>
        </div>

      ))}

    </div>

    <div className="mt-4">
      <button className="btn product-btn-main px-4">
        View All Products
      </button>
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
              <h6 className="text-secondary text-uppercase">About Us</h6>
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
                <button className="btn btn-light px-4">
                  Know More
                </button>

                <button className="btn btn-outline-light px-4">
                  Contact Us
                </button>
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
      
      <button className="btn cta-btn">
        Get Quote
      </button>

      <button className="btn cta-btn-outline">
        Contact Us
      </button>

    </div>

  </div>
</section>


{/* 🔥 TESTIMONIALS SECTION */}
<section className="testimonial-section">
  <div className="container text-center">

    <h6 className="section-subtitle">Testimonials</h6>
    <h2 className="section-title mb-5">What Our Clients Say</h2>

    <div className="row">
      <div className="col-md-4 mb-4">
        <div className="testimonial-card h-100">
          <p>
            "Amazing quality equipment and fast delivery. Their support team is very helpful and professional."
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
            "We upgraded our lab with their machines and saw immediate improvement in efficiency."
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
            "Reliable products and great pricing. Highly recommended for medical professionals."
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

{/* 🔥 CONTACT PREVIEW SECTION */}
<section className="contact-section">
  <div className="container">
    <div className="row align-items-center">
      {/* LEFT CONTENT */}
      <div className="col-md-6 mb-4 mb-md-0">
        <h6 className="section-subtitle">Contact Us</h6>
        <h2 className="section-title mb-3">
          Let’s Connect & Grow Together
        </h2>
        <p className="contact-text">
          Have questions about our products or need a custom quote?
          Our team is here to help you with the best solutions.
        </p>

        <div className="mt-4 contact-info">
          <p>📍 Jaipur, Rajasthan, India</p>
          <p>📞 +91 98765 43210</p>
          <p>📧 info@rajbiosis.com</p>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="col-md-6">
        <div className="contact-form">

          <h5 className="mb-3">Quick Enquiry</h5>

          <form>
            <input
              type="text"
              placeholder="Your Name"
              className="form-control mb-3"
            />

            <input
              type="email"
              placeholder="Your Email"
              className="form-control mb-3"
            />

            <textarea
              rows="3"
              placeholder="Your Message"
              className="form-control mb-3"
            ></textarea>

            <button className="btn contact-btn w-100">
              Send Message
            </button>
          </form>

        </div>
      </div>

    </div>
  </div>
</section>
    </div>
  );
}