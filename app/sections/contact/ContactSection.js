"use client";
import "./contact.css";
export default function ContactSection() {
  return (
    <div>

      {/* HERO */}
      <section className="contact-hero text-center">
        <div className="container">
          <h1>Contact Us</h1>
          <p>We’re here to help you with all your medical equipment needs</p>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="container py-5">
        <div className="row g-4">

          <div className="col-md-4">
           <div className="contact-card">
          <h5>📍 Location</h5>
          <p>
            Raj Biosis Pvt. Ltd. <br/>
            F-4, 1st Floor, Plot No. 16, <br/>
            D-Block, Tagore Nagar, <br/>
            200 Feet Bypass Rd (Ajmer-Delhi Road), <br/>
            Jaipur, Rajasthan - 302021
          </p>
        </div>
          </div>

          <div className="col-md-4">
            <div className="contact-card">
              <h5>📞 Phone</h5>
              <p>+91 98765 43210</p>
            </div>
          </div>

          <div className="col-md-4">
            <div className="contact-card">
              <h5>✉ Email</h5>
              <p>info@rajbiosis.com</p>
            </div>
          </div>

        </div>
      </section>

      {/* MAP + FORM */}
      <section className="container py-5">
        <div className="row g-5">

          {/* MAP */}
          <div className="col-md-6">
          <iframe
            src="https://www.google.com/maps?q=F-4,+1st+Floor,+Plot+No.+16,+D-Block+Tagore+Nagar,+200+Feet+Bypass+Rd,+Jaipur,+Rajasthan+302021&output=embed"
            width="100%"
            height="350"
            style={{ border: 0, borderRadius: "16px" }}
            loading="lazy"
            />
          </div>

          {/* FORM */}
          <div className="col-md-6">
            <div className="contact-form">
              <h4 className="mb-3">Send a Message</h4>

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
                placeholder="Your Message"
                className="form-control mb-3"
                rows="4"
              ></textarea>

              <button className="btn btn-dark w-100">
                Send Message
              </button>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}