import React, { useState } from "react";
import axios from "axios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faPaperPlane,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import {
  faFacebook,
  faInstagram,
  faTwitter,
} from "@fortawesome/free-brands-svg-icons";

import BackToTopButton from "./BackToTopButton";
import "./stylle.css";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Use REACT_APP_API_URL if provided, otherwise default to local backend
  const API_BASE =
    process.env.REACT_APP_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3033";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    try {
      console.log("Sending form to:", `${API_BASE}/api/send`, formData);

      const res = await axios.post(`${API_BASE}/api/send`, formData, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000, // 10s
      });

      // Show friendly success
      alert(res?.data?.message || "Message sent successfully!");
      console.log("Send response:", res.data);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      console.error("Error sending email:", err);

      // Prefer server-provided message (good debugging info)
      const serverMsg =
        err?.response?.data?.error || err?.response?.data?.message;
      const clientMsg = err?.message;

      const finalMessage =
        serverMsg ||
        (clientMsg
          ? `Network/Client error: ${clientMsg}`
          : "Error sending email");

      // present clear message to user
      alert(finalMessage);

      // optionally show full response in console for debugging
      if (err?.response) console.debug("Server response:", err.response);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact">
      <h1 className="heading">Contact Me</h1>
      <div className="contact-wrapper">
        <div className="direct-contact-container">
          <ul className="contact-list">
            <li className="list-item">
              <FontAwesomeIcon icon={faPhone} />
              <span className="contact-text phone">
                <a href="tel:7032221526" title="Give me a call">
                  +91-7032221526
                </a>
              </span>
            </li>
            <li className="list-item">
              <FontAwesomeIcon icon={faEnvelope} />
              <span className="contact-text gmail">
                <a
                  href="mailto:gudapalavsteja1526@gmail.com"
                  title="Send me an email"
                >
                  gudapalavsteja1526@gmail.com
                </a>
              </span>
            </li>
          </ul>
          <hr />
          <ul className="social-media-list">
            <li>
              <a
                href="https://www.facebook.com/saiteja.gudapala"
                target="_blank"
                rel="noopener noreferrer"
                className="contact-icon"
              >
                <FontAwesomeIcon icon={faFacebook} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://www.instagram.com/black__squad__agent_sai_?igsh=MWJldGhnd3l6cWh3dQ=="
                target="_blank"
                className="contact-icon"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faInstagram} aria-hidden="true" />
              </a>
            </li>
            <li>
              <a
                href="https://x.com/GAMINGWITHPAVAN?t=8wXCmYsWKQMDgw9u3TPisA&s=09"
                target="_blank"
                className="contact-icon"
                rel="noreferrer"
              >
                <FontAwesomeIcon icon={faTwitter} aria-hidden="true" />
              </a>
            </li>
          </ul>
          <hr />
        </div>

        <form
          id="contact-form"
          className="form-horizontal"
          onSubmit={handleSubmit}
        >
          <div className="form-group">
            <div className="col-sm-12">
              <input
                type="text"
                className="form-control Name"
                id="name"
                placeholder="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoComplete="name"
              />
            </div>
          </div>

          <div className="form-group">
            <div className="col-sm-12">
              <input
                type="email"
                className="form-control Mail"
                id="email"
                placeholder="E-Mail"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
              />
            </div>
          </div>

          <textarea
            className="form-control1"
            rows="10"
            placeholder="Message"
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>

          <button
            className="btn btn-primary send-button"
            id="submit"
            type="submit"
            value="SEND"
            disabled={submitting}
          >
            <div className="alt-send-button">
              <FontAwesomeIcon icon={faPaperPlane} className="fa" />
              <span className="send-text">
                {submitting ? "SENDING..." : "SEND"}
              </span>
            </div>
          </button>
        </form>
      </div>
      <BackToTopButton />
    </section>
  );
};

export default ContactForm;
