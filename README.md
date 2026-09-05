# Luna — UGC Assistant (portfolio demo)

A single-page chatbot app: real AI replies (OpenRouter), real checkout (PayPal), deployed on Vercel straight from GitHub — no Next.js, no database.

## What's in this folder

```
index.html          the whole app (UI + logic)
luna-avatar.jpg      Luna's profile photo
api/chat.js          Vercel Serverless Function — Luna's replies (OpenRouter)
api/config.js        Vercel Serverless Function — hands the PayPal Client ID to the browser
assets/store/        10 product photos for Luna's Store
assets/affiliate/    5 product photos for My Affiliate
assets/portfolio/    10 photos for the Portfolio tab
.env.example         template for environment variables
.gitignore
```

Both `api/chat.js` and `api/config.js` work because Vercel automatically turns any `.js` file inside an `/api` folder into a serverless function — real backend endpoints without adding a framework. This is also what keeps your OpenRouter key out of the browser entirely.

## 1. Get your keys

**OpenRouter** (powers Luna's replies)
1. Sign up at [openrouter.ai](https://openrouter.ai) → **Keys** → Create key.
2. Add a small balance (a few dollars covers a lot of chat for a demo).
3. Optional but smart: set a monthly spend limit on the key, since this endpoint will be live on the public internet.

**PayPal** (powers checkout — optional, demo works without it)
1. Go to [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications) → **Create App**.
2. Use a **Sandbox** app while testing, switch to **Live** when you're ready for real charges.
3. Copy the **Client ID** (not the secret — the client ID is safe to expose, it's not sensitive the way an API key is).

## 2. Push to GitHub

Create a repo and add everything in this folder, keeping the folder structure intact (`api/chat.js`, `api/config.js`, and the full `assets/` tree need to stay at those exact paths):

```
git init
git add .
git commit -m "Luna demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/luna-demo.git
git push -u origin main
```

Or drag-and-drop everything into a new repo via GitHub's web UI — just make sure no folders get flattened in the process.

## 3. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New → Project** → import your repo.
3. Framework preset: leave as **Other** — no build command needed.
4. Before clicking Deploy, open **Environment Variables** and add both:
   | Key | Value |
   |---|---|
   | `OPENROUTER_API_KEY` | your real key from step 1 |
   | `PAYPAL_CLIENT_ID` | your real Client ID from step 1 (optional — leave it out and checkout falls back to a working "Demo checkout" button) |
5. Click **Deploy**. You'll get a live URL like `luna-demo.vercel.app`.

If you add or change an env var *after* the first deploy, go to **Settings → Environment Variables**, save it, then **Deployments → Redeploy** — env var changes only apply to new deployments, not retroactively to ones already live.

**Important:** the PayPal Client ID lives only in Vercel's Environment Variables — never paste it directly into `index.html`. The frontend fetches it at page load from `/api/config`, which reads it from the server-side env var. If you edit `index.html` looking for a place to paste the Client ID, that's a sign something's been reverted — it shouldn't be there.

## 4. Test it

- Open the live URL, send Luna a message — it should reply in character within a couple seconds.
- Tap the 📎 in the composer, attach a photo, and send it — Luna should respond based on what's actually in the image (see below).
- Go to **Buy credits** or **Buy subscription** and run through checkout. If `PAYPAL_CLIENT_ID` is set, this opens real PayPal Buttons (Sandbox account if you're testing, or a real card once you're on Live).
- If chat replies fail: check the Vercel **Functions** log for `api/chat` — 90% of the time it's a missing/incorrect `OPENROUTER_API_KEY` or an empty OpenRouter balance.
- If checkout still shows "Demo checkout": check the Vercel **Functions** log for `api/config`, and confirm `PAYPAL_CLIENT_ID` is set for the **Production** environment (not just Preview) if you're testing the live URL.

## How image attachments work

Attaching a photo in the chat uses a second model, `openai/gpt-5.1`, specifically because it can actually see the image — the default text model (`openai/gpt-oss-safeguard-20b`) can't. `api/chat.js` automatically switches models for that one message only:

- **No image attached** → `openai/gpt-oss-safeguard-20b` (cheaper, used for all normal text chat).
- **Image attached** → `openai/gpt-5.1` (vision-capable), given the photo plus Luna's personality, so it reacts to the photo in character rather than just captioning it.

The browser resizes any attached photo to a max of 1024px and compresses it before sending, to keep requests small and fast. This covers still images only — video understanding isn't implemented (that needs frame extraction and a fair bit more plumbing than a single API call).

## Notes for when this becomes a real client build

- **Storage is local to the browser.** Credits and chat history live in `localStorage`, so they reset if someone clears their browser or switches devices. Fine for a portfolio piece; swap in Supabase (or similar) before charging a client $4,000 for this. Attached images are stored inline in that same local history too, so a chat with several photos will use noticeably more local storage — expected for a demo, worth knowing about at scale.
- **PayPal capture happens client-side.** That's normal for a lot of small digital-goods checkouts, but for a production client build you'd add a server-side capture/verify step (a second tiny `/api` function) so a tampered client can't fake a successful payment.
- **Rate limiting.** Right now anyone with the URL can chat and spend your OpenRouter balance, and vision calls (`gpt-5.1`) cost more per message than text ones. For a live client site, add basic per-IP rate limiting in `api/chat.js` before launch.
