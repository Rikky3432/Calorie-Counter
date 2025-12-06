import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `
You are an expert nutritionist and food analyst. Your task is to analyze images of food and provide a detailed nutritional breakdown.
1. Identify each distinct food item in the image.
2. Estimate the portion size for each item.
3. Calculate the approximate calories, protein (g), carbs (g), and fat (g) for each item.
4. Provide a total summary for the entire meal.
5. Provide a short, actionable health tip based on the analysis.
6. Provide a confidence score (0-100) on how well you could identify the foods.

Return the data in strict JSON format.
`;

export const analyzeFoodImage = async (base64Image: string): Promise<AnalysisResult> => {
  try {
    // Remove header if present (e.g., "data:image/jpeg;base64,")
    const cleanBase64 = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this food image and provide nutritional details."
          }
        ]
      },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  portionSize: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER }
                },
                required: ["name", "portionSize", "calories", "protein", "carbs", "fat"]
              }
            },
            totalCalories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
            healthTip: { type: Type.STRING },
            confidenceScore: { type: Type.NUMBER }
          },
          required: ["items", "totalCalories", "protein", "carbs", "fat", "healthTip", "confidenceScore"]
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from Gemini.");
    }

    const result = JSON.parse(response.text) as AnalysisResult;
    return result;

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
