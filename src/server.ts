import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

// Endpoint: Newsletter (solo email)
app.post("/api/folk/newsletter", async (req: Request, res: Response) => {
  const { email } = req.body;
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
        tags: ["newsletter"]
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
  if (!name || !email) return res.status(400).json({ error: "Name and email are required" });

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
        tags: ["contact-form"]
      }),
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error("Contact form error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/", (_req: Request, res: Response) => res.send("Folk proxy API running (TypeScript)."));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at port ${PORT}`));
