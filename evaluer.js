console.log("evaluer.js chargé ✅");

document.addEventListener("DOMContentLoaded", () => {
  const uploadZone = document.getElementById("uploadZone");
  const fileInput = document.getElementById("cvFile");
  const fileNameSpan = document.getElementById("fileName");
  const fileChip = document.getElementById("fileChip");
  const removeFileBtn = document.getElementById("removeFile");

  const analyzeBtn = document.getElementById("analyzeBtn");
  const progressWrap = document.getElementById("progressWrap");
  const progressFill = document.getElementById("progressFill");
  const progressText = document.getElementById("progressText");

  const resultsSection = document.getElementById("results");
  const goodList = document.getElementById("goodList");
  const badList = document.getElementById("badList");

  const scoreNumber = document.getElementById("scoreNumber");
  const scoreArc = document.getElementById("scoreArc");

  // ---- Upload UI ----
  uploadZone.addEventListener("click", () => fileInput.click());

  uploadZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadZone.classList.add("dragover");
  });

  uploadZone.addEventListener("dragleave", () => {
    uploadZone.classList.remove("dragover");
  });

  uploadZone.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadZone.classList.remove("dragover");

    if (e.dataTransfer.files.length) {
      fileInput.files = e.dataTransfer.files;
      showFileChip();
    }
  });

  fileInput.addEventListener("change", showFileChip);

  function showFileChip() {
    fileNameSpan.textContent = fileInput.files[0].name;
    fileChip.style.display = "flex";
  }

  removeFileBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    fileInput.value = "";
    fileChip.style.display = "none";
  });

  // ---- Analyse ----
  analyzeBtn.addEventListener("click", async () => {
    if (!fileInput.files.length) {
      alert("Veuillez téléverser votre CV.");
      return;
    }

    progressWrap.style.display = "block";
    progressFill.style.width = "0%";
    progressText.textContent = "Extraction du CV…";
    resultsSection.style.display = "none";

    const file = fileInput.files[0];

    // Animation de progression
    let progress = 0;
    const interval = setInterval(() => {
      progress = Math.min(progress + 5, 90);
      progressFill.style.width = progress + "%";
    }, 120);

    try {
      // 1️⃣ Extraction texte
      const text = await extractTextFromCV(file);

      progressText.textContent = "Analyse IA en cours…";

      // 2️⃣ Appel au backend IA
      const response = await fetch("http://localhost:3000/analyze-cv", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ cvText: text })
      });

      if (!response.ok) {
        throw new Error("Erreur analyse IA");
      }

      const aiResult = await response.json();

      // 3️⃣ Construction du cvData final
      const cvData = {
        fileName: file.name,
        rawText: text.slice(0, 5000),
        analysis: aiResult.analysis,
        profile: aiResult.profile
      };

      // 4️⃣ Sauvegarde pour ameliorer.html
      localStorage.setItem("cvData", JSON.stringify(cvData));

      clearInterval(interval);
      progressFill.style.width = "100%";
      progressText.textContent = "Analyse terminée ✔";

      setScoreRing(aiResult.analysis.score_global);
      showResults(cvData);

    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'analyse du CV.");
      progressWrap.style.display = "none";
    }
  });

  // ---- Score ring ----
  function setScoreRing(score) {
    scoreNumber.textContent = score;
    scoreArc.setAttribute("stroke-dasharray", `${score}, 100`);

    let color = "#e63946";
    if (score >= 60) color = "#f4a261";
    if (score >= 80) color = "#3DDC97";
    scoreArc.setAttribute("stroke", color);
  }

  // ---- Résultats IA ----
  function showResults(cvData) {
    goodList.innerHTML = "";
    badList.innerHTML = "";

    const goodPoints = cvData.analysis.recommandations || [];
    const badPoints = cvData.analysis.problemes || [];

    goodPoints.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      goodList.appendChild(li);
    });

    badPoints.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      badList.appendChild(li);
    });

    resultsSection.style.display = "block";
    resultsSection.scrollIntoView({ behavior: "smooth" });
  }
});

/* ===========================
   EXTRACTION PDF / DOCX
=========================== */

async function extractTextFromCV(file) {
  const ext = file.name.split(".").pop().toLowerCase();

  if (ext === "pdf") return extractTextFromPDF(file);
  if (ext === "docx") return extractTextFromDOCX(file);

  throw new Error("Format non supporté");
}

async function extractTextFromPDF(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  let fullText = "";
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    fullText += content.items.map(it => it.str).join(" ") + "\n";
  }
  return fullText.trim();
}

async function extractTextFromDOCX(file) {
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return (result.value || "").trim();
}
