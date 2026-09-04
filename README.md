# Luna — UGC Assistant (portfolio demo)

A single-page chatbot app: real AI replies (OpenRouter), real checkout (PayPal), deployed on Vercel straight from GitHub — no Next.js, no database.

## What's in this folder

```
index.html         the whole app (UI + logic)
luna-avatar.jpg     Luna's profile photo
api/chat.js         Vercel Serverless Function — talks to OpenRouter, keeps your API key private
.env.example         template for the one environment variable you need
.gitignore
```

`api/chat.js` works because Vercel automatically turns any `.js` file inside an `/api` folder into a serverless function — you get a real backend endpoint (`/api/chat`) without adding a framework. It's what keeps your OpenRouter key out of the browser.

## 1. Get your keys

**OpenRouter** (powers Luna's replies)
1. Sign up at [openrouter.ai](https://openrouter.ai) → **Keys** → Create key.
2. Add a small balance (a few dollars covers a lot of chat for a demo).
3. Optional but smart: set a monthly spend limit on the key, since this endpoint will be live on the public internet.

**PayPal** (powers checkout — optional, demo works without it)
1. Go to [developer.paypal.com/dashboard/applications](https://developer.paypal.com/dashboard/applications) → **Create App**.
2. Use a **Sandbox** app while testing, switch to **Live** when you're ready for real charges.
3. Copy the **Client ID** (not the secret — the client ID is safe to put in front-end code).

## 2. Push to GitHub

Create a repo and add all the files in this folder (keep the `api/chat.js` path exactly as-is):

```
git init
git add .
git commit -m "Luna demo"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/luna-demo.git
git push -u origin main
```

Or just drag-and-drop everything into a new repo via GitHub's web UI — make sure `api/chat.js` ends up at that exact path, not flattened into the root.

## 3. Add your PayPal Client ID

Open `index.html`, near the top of the `<script>` block:

```js
const PAYPAL_CLIENT_ID = "YOUR_PAYPAL_CLIENT_ID";
```

Replace with your real Client ID and push the change. (Skipping this is fine — checkout falls back to a working "Demo checkout" button that still runs the credit/subscription logic, just without a real charge.)

## 4. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) → sign in with GitHub.
2. **Add New → Project** → import your repo.
3. Framework preset: leave as **Other** — no build command needed.
4. Before clicking Deploy, open **Environment Variables** and add:
   | Key | Value |
   |---|---|
   | `OPENROUTER_API_KEY` | your real key from step 1 |
5. Click **Deploy**. You'll get a live URL like `luna-demo.vercel.app`.

If you add the env var *after* the first deploy, go to **Settings → Environment Variables**, add it, then **Deployments → Redeploy** (env vars only apply to new deployments).

## 5. Test it

- Open the live URL, send Luna a message — it should reply in character within a couple seconds.
- Go to **Buy credits** or **Buy subscription** and run through checkout (PayPal Sandbox account if you're testing, or a real card once you're on Live).
- If chat replies fail: check the Vercel **Functions** log for `api/chat` — 90% of the time it's a missing/incorrect `OPENROUTER_API_KEY` or an empty OpenRouter balance.

## Notes for when this becomes a real client build

- **Storage is local to the browser.** Credits and chat history live in `localStorage`, so they reset if someone clears their browser or switches devices. Fine for a portfolio piece; swap in Supabase (or similar) before charging a client $4,000 for this.
- **PayPal capture happens client-side.** That's normal for a lot of small digital-goods checkouts, but for a production client build you'd add a server-side capture/verify step (a second tiny `/api` function) so a tampered client can't fake a successful payment.
- **Model choice.** `openai/gpt-oss-safeguard-20b` is set in `api/chat.js`. That model line was originally built for safety/policy classification rather than general conversation — if Luna's replies feel off in tone, swap the `model` string for any chat model listed at [openrouter.ai/models](https://openrouter.ai/models) (e.g. a Llama or Mistral instruct model) and compare.
- **Rate limiting.** Right now anyone with the URL can chat and spend your OpenRouter balance. For a live client site, add basic per-IP rate limiting in `api/chat.js` before launch.
