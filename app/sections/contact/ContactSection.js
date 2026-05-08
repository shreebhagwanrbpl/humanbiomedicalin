"use client";

import "./contact.css";
import { useEffect, useState } from "react";

import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";

export default function ContactSection() {

  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    name: "",
    email: "",
     phone: "",
    message: "",
  });

  // LOAD CONTACT INFO
  useEffect(() => {
    const fetchData = async () => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // HANDLE CHANGE
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await addDoc(
        collection(
          db,
          "websitesQueries",
          "humanbiomedicalin",
          "contactQueries"
        ),
        {
          ...form,
          createdAt: new Date(),
        }
      );

      alert("Message Sent");

      setForm({
        name: "",
        email: "",
         phone: "",
        message: "",
      });

    } catch (err) {
      console.log(err);
    }
  };

  // HELPERS
const getValue = (key) => {
  return (
    contactInfo.find((x) => {
      const label = x.label?.toLowerCase();

      return (
        label?.includes(key) ||
        (key === "address" &&
          label?.includes("location"))
      );
    })?.value || "-"
  );
};

  return (
    <div>

      {/* HERO */}
      <section className="contact-hero text-center">
        <div className="container">
          <h1>Contact Us</h1>

          <p>
            We’re here to help you with all
            your medical equipment needs
          </p>
        </div>
      </section>

      {/* CONTACT INFO */}
      <section className="container py-5">
        <div className="row g-4">

          {/* LOCATION */}
          <div className="col-md-4">
            <div className="contact-card">

              <h5>📍 Location</h5>

              <p>
                {loading
                  ? "Loading..."
                  : getValue("address")}
              </p>

            </div>
          </div>

          {/* PHONE */}
          <div className="col-md-4">
            <div className="contact-card">

              <h5>📞 Phone</h5>

              <p>
                {loading
                  ? "Loading..."
                  : getValue("phone")}
              </p>

            </div>
          </div>

          {/* EMAIL */}
          <div className="col-md-4">
            <div className="contact-card">

              <h5>✉ Email</h5>

              <p>
                {loading
                  ? "Loading..."
                  : getValue("email")}
              </p>

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

              <h4 className="mb-3">
                Send a Message
              </h4>

              <form onSubmit={handleSubmit}>

                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  className="form-control mb-3"
                  value={form.name}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  className="form-control mb-3"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
<input
  type="tel"
  name="phone"
  placeholder="Your Number"
  className="form-control mb-3"
  value={form.phone}
  onChange={handleChange}
  required
  pattern="[0-9]{10}"
  maxLength={10}
/>

                <textarea
                  name="message"
                  placeholder="Your Message"
                  className="form-control mb-3"
                  rows="4"
                  value={form.message}
                  onChange={handleChange}
                  required
                ></textarea>

                <button
                  className="btn btn-dark w-100"
                >
                  Send Message
                </button>

              </form>

            </div>

          </div>

        </div>

      </section>

    </div>
  );
}