"use strict";

const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");

require("dotenv").config();

const app = express();
app.set("trust proxy", 1);

app.use(express.json({ limit: "50kb" }));
app.use(express.urlencoded({ extended: false }));

// Hard-block PHP endpoints in the Node deployment
app.all(/\.php$/i, (req, res) => {
    res.status(404).json({ ok: false, error: "Not found." });
});

function normalizeText(value, maxLen) {
    if (value == null) return "";
    const text = String(value).replace(/\r/g, "").replace(/\n/g, "\n").trim();
    return text.length > maxLen ? text.slice(0, maxLen) : text;
}

function buildTransporter() {
    const host = process.env.SMTP_HOST || "smtppro.zoho.com";
    const port = Number(process.env.SMTP_PORT || 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!user || !pass) {
        return null;
    }

    return nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        requireTLS: port === 587,
        auth: { user, pass },
    });
}

function isTestEndpointAllowed(req) {
    // By default: allow only in non-production.
    // In production: require a shared secret token to prevent abuse.
    if ((process.env.NODE_ENV || "").toLowerCase() !== "production") return true;

    const token = String(req.query.token || req.get("x-test-token") || "").trim();
    const expected = String(process.env.TEST_TOKEN || "").trim();
    return Boolean(expected) && token === expected;
}

app.get("/healthz", (req, res) => {
    res.status(200).json({ ok: true });
});

// SMTP verification endpoint (does not send email)
app.get("/api/_test/smtp", async (req, res) => {
    try {
        if (!isTestEndpointAllowed(req)) {
            return res.status(404).json({ ok: false, error: "Not found." });
        }

        const transporter = buildTransporter();
        if (!transporter) {
            return res.status(500).json({ ok: false, error: "Email is not configured on the server." });
        }

        await transporter.verify();
        return res.status(200).json({ ok: true, verified: true });
    } catch (err) {
        console.error("/api/_test/smtp error", err);
        const isProd = (process.env.NODE_ENV || "").toLowerCase() === "production";
        const payload = { ok: false, verified: false, error: "SMTP verification failed." };
        if (!isProd) {
            payload.detail = {
                code: err && err.code,
                responseCode: err && err.responseCode,
                response: err && err.response,
                command: err && err.command,
                message: err && err.message,
            };
        }
        return res.status(500).json(payload);
    }
});

app.post("/api/contact", async (req, res) => {
    try {
        const name = normalizeText(req.body.name, 120);
        const email = normalizeText(req.body.email, 200);
        const phone = normalizeText(req.body.phone, 60);
        const service = normalizeText(req.body.service, 120);
        const vehicle = normalizeText(req.body.vehicle, 200);
        const message = normalizeText(req.body.message, 4000);

        if (!name || !email) {
            return res.status(400).json({ ok: false, error: "Missing required fields." });
        }

        const transporter = buildTransporter();
        if (!transporter) {
            return res.status(500).json({ ok: false, error: "Email is not configured on the server." });
        }

        const mailTo = process.env.MAIL_TO || process.env.SMTP_USER;
        const mailFrom = process.env.MAIL_FROM || process.env.SMTP_USER;
        const subjectPrefix = process.env.MAIL_SUBJECT_PREFIX || "PrimeAuto";
        const ref = normalizeText(req.get("referer") || "", 500);
        const ip = normalizeText(req.ip || "", 80);

        const subject = `${subjectPrefix} - New Website Lead (${service || "General"})`;

        const lines = [
            `Name: ${name}`,
            `Email: ${email}`,
            phone ? `Phone: ${phone}` : null,
            service ? `Service: ${service}` : null,
            vehicle ? `Vehicle: ${vehicle}` : null,
            ref ? `Referrer: ${ref}` : null,
            ip ? `IP: ${ip}` : null,
            "",
            "Message:",
            message || "(no message)",
        ].filter(Boolean);

        await transporter.sendMail({
            from: mailFrom,
            to: mailTo,
            replyTo: email,
            subject,
            text: lines.join("\n"),
            html: `
				<h2>New Website Lead</h2>
				<ul>
					<li><strong>Name:</strong> ${escapeHtml(name)}</li>
					<li><strong>Email:</strong> ${escapeHtml(email)}</li>
					${phone ? `<li><strong>Phone:</strong> ${escapeHtml(phone)}</li>` : ""}
					${service ? `<li><strong>Service:</strong> ${escapeHtml(service)}</li>` : ""}
					${vehicle ? `<li><strong>Vehicle:</strong> ${escapeHtml(vehicle)}</li>` : ""}
					${ref ? `<li><strong>Referrer:</strong> ${escapeHtml(ref)}</li>` : ""}
					${ip ? `<li><strong>IP:</strong> ${escapeHtml(ip)}</li>` : ""}
				</ul>
				<h3>Message</h3>
				<pre style="white-space: pre-wrap; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;">${escapeHtml(
                    message || "(no message)"
                )}</pre>
			`,
        });

        return res.status(200).json({ ok: true });
    } catch (err) {
        console.error("/api/contact error", err);
        return res.status(500).json({ ok: false, error: "Failed to send email." });
    }
});

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

// Static assets
app.use(
    "/assets",
    express.static(path.join(__dirname, "assets"), {
        maxAge: "30d",
        immutable: true,
        dotfiles: "ignore",
    })
);

// Root-level static files (favicons, webmanifest, .html, etc)
app.use(
    express.static(__dirname, {
        index: false,
        dotfiles: "ignore",
    })
);

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Pretty URL routes for standalone pages
app.get("/auto", (req, res) => {
    res.sendFile(path.join(__dirname, "auto.html"));
});

app.get("/collision", (req, res) => {
    res.sendFile(path.join(__dirname, "collision.html"));
});

const port = Number(process.env.PORT || 3003);
app.listen(port, () => {
    console.log(`PrimeAuto server listening on port ${port}`);
});
