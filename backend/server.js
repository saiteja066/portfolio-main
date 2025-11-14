// server.js — production-ready (SendGrid)
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const sgMail = require("@sendgrid/mail");
const morgan = require("morgan");
const { body, validationResult } = require("express-validator");

const app = express();
app.use(express.json());

// Security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // enable and tune if you add inline scripts
  })
);

// Logging: verbose only in development
if (process.env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// CORS whitelist
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); // allow server-to-server or curl
      if (ALLOWED_ORIGINS.length === 0) {
        return callback(null, false); // no origins configured — block
      }
      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    optionsSuccessStatus: 200,
  })
);

// Stronger rate limiting for POST /api/send
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_MAX || "5", 10), // default 5/min
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/send", limiter);

// Setup SendGrid
if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️  Missing SENDGRID_API_KEY");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}

const MAIL_FROM = process.env.MAIL_FROM;
const MAIL_TO = process.env.MAIL_TO || MAIL_FROM || "";

// Basic health check
app.get("/api/health", (req, res) => res.json({ ok: true }));

// Optional: verify reCAPTCHA token server-side (if you implement reCAPTCHA)
// function verifyRecaptcha(token) { ... } // implement if used

// Validate & sanitize inputs
const contactValidators = [
  body("name").trim().isLength({ min: 2, max: 100 }).escape(),
  body("email").trim().isEmail().normalizeEmail(),
  body("message").trim().isLength({ min: 2, max: 5000 }).escape(),
];

async function sendMail({ name, email, message }) {
  if (!process.env.SENDGRID_API_KEY)
    throw new Error("Missing SendGrid API key");
  if (!MAIL_FROM || !MAIL_TO)
    throw new Error("MAIL_FROM or MAIL_TO not configured");

  const msg = {
    to: MAIL_TO,
    from: MAIL_FROM,
    subject: `Portfolio Contact — ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    html: `<div style="font-family:Arial,sans-serif">
            <h3>Portfolio Contact</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div>${message.replace(/\n/g, "<br/>")}</div>
           </div>`,
  };
  return sgMail.send(msg);
}

app.post("/api/send", contactValidators, async (req, res) => {
  // Validation
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(422)
      .json({
        success: false,
        message: "Invalid input",
        errors: errors.array(),
      });
  }

  // Receive
  const { name, email, message } = req.body;

  try {
    // Optional: verify reCAPTCHA here if implemented

    await sendMail({ name, email, message });
    return res.json({ success: true, message: "Email sent" });
  } catch (err) {
    // Log full error internally
    console.error("Error in /api/send:", err && err.stack ? err.stack : err);

    // Return minimal error to client
    return res
      .status(500)
      .json({ success: false, message: "Error sending email" });
  }
});

// Generic 404
app.use((req, res) =>
  res.status(404).json({ success: false, message: "Not found" })
);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err && err.stack ? err.stack : err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 3033;
app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT} — NODE_ENV=${
      process.env.NODE_ENV || "development"
    }`
  );
});
