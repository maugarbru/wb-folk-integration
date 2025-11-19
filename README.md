# Folk Proxy (TypeScript)

This repository contains a small Express + TypeScript proxy to safely call the Folk API
without exposing your API key to the browser. Two endpoints are provided:

- `POST /api/folk/newsletter` — expects `{ email }` in the JSON body.
- `POST /api/folk/contact` — expects `{ name, email, company, role, country, project }`.

## Quick start

1. Install:
```
npm install
```

2. Set environment variable:
- On local: `export FOLK_API_KEY=your_key_here` (or use a .env in your platform)
- In Azure/Render/Vercel set `FOLK_API_KEY` in environment settings.

3. Development:
```
npm run dev
```

4. Build & Run:
```
npm run build
npm start
```

## Webflow client scripts

See `webflow-scripts/webflow-script.js` for the exact code to paste into your Webflow pages.

## Docker

```
docker build -t wb-folk-proxy .
docker run -p 3000:3000 -e FOLK_API_KEY=your_key_here wb-folk-proxy
```

