console.log("paiement.js chargé ✅");

// ✅ Liens Stripe Payment Links (TEST)
const STRIPE_LINK_DOWNLOAD = "https://buy.stripe.com/test_28EdR9a122ve7nJ23Yds403";
const STRIPE_LINK_MONTHLY  = "https://buy.stripe.com/test_cNi5kD0qs1ra6jF8smds404";
const STRIPE_LINK_YEARLY   = "https://buy.stripe.com/test_7sYbJ15KM1ra23p0ZUds406";

// Boutons
const payOnceBtn = document.getElementById("payOnceBtn");
const subscribeMonthlyBtn = document.getElementById("subscribeMonthlyBtn");
const subscribeYearlyBtn = document.getElementById("subscribeYearlyBtn");

// ✅ Téléchargement unique
payOnceBtn.addEventListener("click", () => {
  window.location.href = STRIPE_LINK_DOWNLOAD;
});

// ✅ Abonnement mensuel
subscribeMonthlyBtn.addEventListener("click", () => {
  window.location.href = STRIPE_LINK_MONTHLY;
});

// ✅ Abonnement annuel
subscribeYearlyBtn.addEventListener("click", () => {
  window.location.href = STRIPE_LINK_YEARLY;
});