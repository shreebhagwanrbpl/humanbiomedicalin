"use client";

import "./contact.css";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { fetchContactData, fetchDistrictData } from "@/lib/data-fetcher";

export default function ContactSection({ city }) {
  const pathname = usePathname();

  const pathParts = pathname
    .split("/")
    .filter(Boolean);

  const [currentCity, setCurrentCity] = useState("");
  const [isValidCity, setIsValidCity] = useState(false);
  const [contactInfo, setContactInfo] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [stateName, setStateName] = useState("");

  const formatCity = (name = "") =>
    name
      .split("-")
      .map(
        (w) =>
          w.charAt(0).toUpperCase() +
          w.slice(1)
      )
      .join(" ");

  const citySlug = currentCity
    ?.toLowerCase()
    ?.replace(/\s+/g, "-");

  const cityName = formatCity(currentCity);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkDistrict = async () => {
      const slug = pathParts[0];
      setStateName("");

      if (!slug) {
        setCurrentCity("");
        setIsValidCity(false);
        return;
      }

      try {
        const data = await fetchDistrictData(slug);
        if (data) {
          setCurrentCity(slug);
          setStateName(data?.state || "");
          setIsValidCity(true);
        } else {
          setCurrentCity("");
          setIsValidCity(false);
        }
      } catch {
        setCurrentCity("");
        setIsValidCity(false);
      }
    };

    checkDistrict();
  }, [pathname]);

  // LOAD CONTACT INFO
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchContactData();
        if (data) {
          if (Array.isArray(data.contactInfo)) {
            setContactInfo(data.contactInfo);
          } else if (Array.isArray(data)) {
            setContactInfo(data);
          }
        }
      } catch (err) {
        console.error("Error fetching contact data:", err);
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

    const name = form.name.trim();
    const email = form.email.trim();
    const phone = form.phone.trim();
    const message = form.message.trim();

    // Empty validation
    if (!name || !email || !phone || !message) {
      return toast.error("Please fill all fields");
    }

    // Name validation
    if (name.length < 2) {
      return toast.error("Please enter a valid name");
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return toast.error("Please enter a valid email address");
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return toast.error("Please enter a valid 10 digit mobile number");
    }

    // Message validation
    if (message.length < 10) {
      return toast.error("Message must be at least 10 characters");
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/contact-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          phone,
          message,
          city: cityName,
          district: currentCity,
          websiteId: "humanbiomedicalin",
          companyId: "human",
        }),
      });

      if (res.ok) {
        toast.success("Message Sent Successfully");
        setForm({
          name: "",
          email: "",
          phone: "",
          message: "",
        });
      } else {
        toast.error("Failed to send message");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
    } finally {
      setSubmitting(false);
    }
  };

  // HELPERS
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

  if (!mounted || loading) {
    return (
      <div className="page-loader">
        <div className="loader-circle"></div>
        <h2>Human Biomedical</h2>
        <p>Loading amazing healthcare solutions...</p>
      </div>
    );
  }

  const mapAddress = isValidCity
    ? `${cityName}, ${stateName}, India`
    : getValue("address") !== "-"
      ? getValue("address")
      : "";

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      <div>
        {/* HERO */}
        <section className="contact-hero text-center">
          <div className="container">
            <div className="contact-badge">
              Get In Touch
            </div>

            <h1 className="contact-title">
              Contact <span>Experts</span>
              {isValidCity && <> in {cityName}</>}
            </h1>

            <p className="contact-subtitle">
              Get expert assistance for laboratory,
              diagnostic and medical equipment solutions
              {isValidCity && <> in {cityName}</>}
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
                    : isValidCity
                      ? `${cityName}, ${stateName}, India`
                      : getValue("address") !== "-"
                        ? getValue("address")
                        : "India"}
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
                    : getValue("phone") !== "-"
                      ? getValue("phone")
                      : "-"}
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
                    : getValue("email") !== "-"
                      ? getValue("email")
                      : "-"}
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
              {mapAddress ? (
                <iframe
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(
                    mapAddress
                  )}&output=embed`}
                  width="100%"
                  height="450"
                  style={{
                    border: 0,
                    borderRadius: "20px",
                    boxShadow: "0 15px 35px rgba(0,0,0,.08)"
                  }}
                  loading="lazy"
                />
              ) : (
                <div
                  style={{
                    height: "450px",
                    borderRadius: "20px",
                    background: "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid #e2e8f0"
                  }}
                >
                  <p className="text-secondary m-0">Human Biomedical</p>
                </div>
              )}
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
                    onChange={(e) =>
                      setForm({
                        ...form,
                        phone: e.target.value.replace(/\D/g, ""),
                      })
                    }
                    required
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
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? "Sending Message..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}