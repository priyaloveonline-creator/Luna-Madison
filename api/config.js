// /api/config.js
// Exposes non-secret, frontend-safe config pulled from Vercel Environment Variables.
// A PayPal Client ID is meant to be public (it's not a secret key), so it's fine
// to hand it to the browser this way — this just avoids hardcoding it in index.html.

module.exports = async (req, res) => {
  res.status(200).json({
    paypalClientId: process.env.PAYPAL_CLIENT_ID || null,
  });
};
