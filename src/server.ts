import express, { Request, Response } from "express";
import dotenv from "dotenv";

import {
  ALLOWED_DOMAINS,
  NEWSLETTER_GROUP_ID,
  CONTACT_FORM_GROUP_ID,
} from "./constants";

dotenv.config();
const app = express();
app.use(express.json());

app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_DOMAINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  // Manejar OPTIONS al toque
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  next();
});


// Endpoint: Newsletter (solo email)
app.post("/api/folk/newsletter", async (req: Request, res: Response) => {
  const { email } = req.body;
  console.log("Received newsletter signup:", req.body);
  if (!email) return res.status(400).json({ error: "Email is required" });

  try {
    const response = await fetch("https://api.folk.app/v1/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FOLK_API_KEY}`,
      },
      body: JSON.stringify({
        fullName: email.split("@")[0],
        emails: [email],
        description: "website newsletter signup",
        groups: [
          {
            id: NEWSLETTER_GROUP_ID,
          },
        ],
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Newsletter error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint: Contact form (completo)
app.post("/api/folk/contact", async (req: Request, res: Response) => {
  const { name, email, company, role, country, project } = req.body;
  console.log("Received contact form data:", req.body);
  if (!name || !email)
    return res.status(400).json({ error: "Name and email are required" });

  try {
    const response = await fetch("https://api.folk.app/v1/people", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.FOLK_API_KEY}`,
      },
      body: JSON.stringify({
        fullName: name,
        emails: [email],
        jobTitle: role,
        description: project,
        groups: [
          {
            id: CONTACT_FORM_GROUP_ID,
          },
        ],
        customFieldValues: {
          [CONTACT_FORM_GROUP_ID]: {
            "Company Name": company,
            Location: country,
          },
        },
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (_req: Request, res: Response) =>
  res.send("Folk proxy API running (TypeScript).")
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
