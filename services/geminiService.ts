import { GoogleGenAI, Type } from "@google/genai";
import { Trade, AIAnalysisResult } from "../types";

export const analyzeTradesWithGemini = async (trades: Trade[]): Promise<AIAnalysisResult> => {
  // If no API key is present or trades are empty, return a dummy fallback (or handle error upstream)
  if (!trades || trades.length === 0) {
    throw new Error("No trades to analyze.");
  }

  // Filter mainly closed trades for accurate PnL analysis
  const closedTrades = trades.filter(t => t.exitDate);
  
  // Prepare a summarized version of trades to save token context
  const tradeSummary = closedTrades.map(t => ({
    symbol: t.symbol,
    type: t.type,
    pnl: t.pnl,
    setup: t.setup,
    mistakes: t.mistakes,
    notes: t.notes
  }));

  const prompt = `
    You are a professional trading coach and risk manager at a top proprietary trading firm.
    Analyze the following recent trading journal entries. 
    Identify patterns in behavior, profitability, and mistakes.
    
    Data: ${JSON.stringify(tradeSummary)}
    
    Provide your output in strictly valid JSON format matching this schema:
    {
      "summary": "A concise paragraph summarizing performance and style.",
      "strengths": ["Strength 1", "Strength 2"],
      "weaknesses": ["Weakness 1", "Weakness 2"],
      "actionableTips": ["Specific tip 1", "Specific tip 2"],
      "sentimentScore": 75 (integer 0-100 representing discipline/performance)
    }
  `;

  const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });

  try {
    const response = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
            weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
            actionableTips: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentimentScore: { type: Type.INTEGER },
          },
          required: ["summary", "strengths", "weaknesses", "actionableTips", "sentimentScore"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Empty response from AI");

    return JSON.parse(text) as AIAnalysisResult;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};