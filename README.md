# Forsale AI (Pi Testnet Demo)
This package is a ready-to-deploy demo of the Forsale AI payment integration for Pi Network (testnet).
**Important:** Do NOT commit your private Pi API keys. Put them in environment variables (Vercel Project > Environment Variables).

## Included files
- `index.html` (frontend)
- `script.js` (frontend logic)
- `style.css`
- `server.js` (Node/Express demo server)
- `package.json`
- `vercel.json`
- `validation-key.txt` (domain validation file for Pi Developer)
- `privacy-policy.html`, `terms-of-service.html`

## Deploy instructions (Vercel)
1. Push this repo to GitHub.
2. In Vercel create a new project connected to the repo.
3. Set Environment Variable `PI_API_KEY` in Vercel (Project Settings > Environment Variables).
4. Deploy. The project uses a Node server (server.js) — Vercel will run it via `@vercel/node`.

## Frontend notes
- Edit `index.html` and replace `REPLACE_WITH_YOUR_APP_PUBLIC_KEY` with the **App Public Key** from Pi Developer → API Key (this is the public key, not the secret).
- Open the page **inside Pi Browser** for the SDK features to work.

## Security
- Do **not** publish PI_API_KEY or any secret keys publicly.
- `validation-key.txt` should be served at `https://<your-domain>/validation-key.txt` to validate domain on Pi Developer.

