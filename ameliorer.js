console.log("ameliorer.js chargé ✅");

let currentStep = 0;

document.addEventListener("DOMContentLoaded", () => {
  const steps = document.querySelectorAll(".form-step");
  const indicators = document.querySelectorAll(".step");

  const cvData = JSON.parse(localStorage.getItem("cvData") || "{}");

  if (!cvData.profile) {
    alert("Veuillez d’abord analyser votre CV.");
    window.location.href = "evaluer.html";
    return;
  }

  window.nameInput = document.getElementById("nameInput");
  window.jobInput = document.getElementById("jobInput");
  window.emailInput = document.getElementById("emailInput");
  window.phoneInput = document.getElementById("phoneInput");

  const prevBtn = document.getElementById("prevBtn");
  const nextBtn = document.getElementById("nextBtn");

  function showStep(i) {
    steps.forEach((s, idx) => s.classList.toggle("active", idx === i));
    indicators.forEach((el, idx) => el.classList.toggle("active", idx <= i));
    prevBtn.disabled = (i === 0);
    nextBtn.disabled = (i === steps.length - 1);
  }

  prevBtn.onclick = () => currentStep > 0 && showStep(--currentStep);
  nextBtn.onclick = () => currentStep < steps.length - 1 && showStep(++currentStep);

  // 🔥 PREFILL DEPUIS IA
  nameInput.value = cvData.profile.nom || "";
  jobInput.value = cvData.profile.poste || "";
  emailInput.value = cvData.profile.email || "";
  phoneInput.value = cvData.profile.telephone || "";

  const summaryInput = document.getElementById("summaryInput");
  const skillsInput = document.getElementById("skillsInput");

  if (summaryInput && !summaryInput.value) {
    improveField("resume", summaryInput);
  }

  if (skillsInput && !skillsInput.value) {
    improveField("competences", skillsInput);
  }

  showStep(0);
  updateAll();
});

// 🔥 IA PAR CHAMP
async function improveField(field, input) {
  const cvData = JSON.parse(localStorage.getItem("cvData"));

  const response = await fetch("http://localhost:3000/improve-field", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      field,
      profile: cvData.profile
    })
  });

  const data = await response.json();
  input.value = data.suggestion;
  updateAll();
}

// ======================
// LIVE PREVIEW (inchangé)
// ======================
function updateAll() {
  const livePreview = document.getElementById("livePreview");
  const summaryInput = document.getElementById("summaryInput");
  const skillsInput = document.getElementById("skillsInput");

  let h = `
    <h2>${nameInput.value || "Nom complet"}</h2>
    <h4>${jobInput.value || "Poste visé"}</h4>
    <p>${emailInput.value || ""}</p>
    <p>${phoneInput.value || ""}</p>
    <hr>
  `;

  if (summaryInput?.value) {
    h += `<h3>Résumé</h3><p>${summaryInput.value.replace(/\n/g,"<br>")}</p><hr>`;
  }

  if (skillsInput?.value) {
    h += `<h3>Compétences</h3><p>${skillsInput.value}</p>`;
  }

  livePreview.innerHTML = h;
}