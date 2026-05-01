"use client";

export default function Footer() {
  return (
   <footer className="text-white pt-5 pb-3">
  <div className="container">

    <div className="row">
      <div className="col-md-3 mb-4">
        <h5 className="text-black">Raj Biosis</h5>
        <p className="text-secondary small">
          Providing high-quality medical equipment & diagnostic solutions
          with reliability and trust.
        </p>
      </div>

      {/* QUICK LINKS */}
      <div className="col-md-3 mb-4">
        <h6 className="text-black mb-3">Quick Links</h6>
        <ul className="list-unstyled text-secondary">
          <li><a href="/" className="text-secondary text-decoration-none">Home</a></li>
          <li><a href="/about" className="text-secondary text-decoration-none">About</a></li>
          <li><a href="/products" className="text-secondary text-decoration-none">Products</a></li>
          <li><a href="/contact" className="text-secondary text-decoration-none">Contact</a></li>
        </ul>
      </div>

      {/* SERVICES */}
      <div className="col-md-3 mb-4">
        <h6 className="text-black mb-3">Services</h6>
        <ul className="list-unstyled text-secondary">
          <li>Diagnostic Equipment</li>
          <li>Medical Consumables</li>
          <li>Maintenance</li>
          <li>Support</li>
        </ul>
      </div>

      {/* CONTACT */}
      <div className="col-md-3 mb-4">
        <h6 className="text-black mb-3">Contact</h6>
        <p className="text-secondary small mb-1">📍 Jaipur, India</p>
        <p className="text-secondary small mb-1">📞 +91 98765 43210</p>
        <p className="text-secondary small">📧 info@rajbiosis.com</p>
      </div>

    </div>

    <hr className="border-secondary" />

    {/* COPYRIGHT */}
    <div className="text-center text-secondary small">
      © {new Date().getFullYear()} Raj Biosis. All rights reserved.
    </div>
  </div>
</footer>
  );
}