import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";

import {
  ALLOWED_DOMAINS,
  NEWSLETTER_GROUP_ID,
  CONTACT_FORM_GROUP_ID,
} from "./constants";

dotenv.config();
const app = express();
app.use(express.json());

app.use(
  cors({
    origin: (origin, callback) => {
      // ❌ Bloquear cualquier request sin 'origin'
      if (!origin) {
        return callback(new Error("CORS: Requests sin Origin no permitidos"), false);
      }

      // ✔️ Permitir solo dominios autorizados
      if (ALLOWED_DOMAINS.includes(origin)) {
        return callback(null, true);
      }

      // ❌ Rechazar peticiones desde otros sitios
      return callback(new Error("CORS: Origin no permitido"), false);
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

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
        tags: ["website"],
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
        company,
        jobTitle: role,
        location: country,
        notes: project,
        tags: ["website"],
        groups: [
          {
            id: CONTACT_FORM_GROUP_ID,
          },
        ],
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
