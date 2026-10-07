import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(req: Request) {
  try {
    // We now expect 'currentVideo' from the frontend
    const { message, currentVideo } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash-lite" });
    
    // Give Gemini the exact context of what the user is looking at
    const outfitDescription = currentVideo === "/video1.mp4" 
      ? "four models wearing elegant white dresses and a structured white coat with intricate floral embroidery" 
      : "a bright neon pink mini dress walking down a sunny street";
    
    const prompt = `You are an elite Zara fashion stylist. The user is currently looking at a video of a model wearing ${outfitDescription}. 
    Give a short, punchy, 1 to 2 sentence styling recommendation based on their question. 
    You MUST specifically reference the color and style of the outfit they are looking at in your answer so they know you can see it. 
    Keep it chic, modern, and highly relevant. Do not use markdown. 
    User question: ${message}`;
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    return NextResponse.json({ reply: text });
  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
  }
}