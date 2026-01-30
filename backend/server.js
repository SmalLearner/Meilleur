import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.post("/analyze-cv", async (req, res) => {
  try {
    const { cvText } = req.body;
    if (!cvText) {
      return res.status(400).json({ error: "CV manquant" });
    }

    const prompt = `
IMPORTANT :
Tu dois répondre UNIQUEMENT avec un JSON valide.
Aucun texte avant ou après.

Tu es un expert en recrutement au Québec.

Retourne STRICTEMENT ce format :

{
  "analysis": {
    "score_global": number,
    "scores": {
      "structure": number,
      "mots_cles": number,
      "experience": number,
      "ats": number,
      "quebec": number
    },
    "problemes": [],
    "recommandations": []
  },
  "profile": {
    "poste": null,
    "resume": null,
    "competences": [],
    "experiences": [],
    "formation": null
  }
}

CV :
"""
${cvText}
"""
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = response.choices[0].message.content;
    const match = content.match(/\{[\s\S]*\}$/);

    if (!match) {
      console.error("Réponse IA invalide :", content);
      return res.status(500).json({ error: "Réponse IA invalide" });
    }

    const parsed = JSON.parse(match[0]);
    res.json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur IA" });
  }
});

app.post("/improve-field", async (req, res) => {
  try {
    const { field, profile } = req.body;

    const prompt = `
IMPORTANT :
Retourne UNIQUEMENT le contenu du champ.

Tu es un expert en CV québécois.

Profil :
${JSON.stringify(profile, null, 2)}

Champ à améliorer : ${field}
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
    });

    res.json({ suggestion: response.choices[0].message.content });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur amélioration IA" });
  }
});

app.listen(3000, () => {
  console.log("✅ Backend IA lancé sur http://localhost:3000");
});