import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export function getGeminiModel(modelName) {
  return genAI.getGenerativeModel({ model: modelName });
}

export default genAI;
