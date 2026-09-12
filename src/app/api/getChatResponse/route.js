import { NextResponse } from "next/server";
import { getGeminiModel } from "@/config/gemini";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`${ip}:getChatResponse`);
    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a moment and try again.", retryAfter: retryAfterSeconds },
            { status: 429 }
        );
    }

    try {
        const { message} = await request.json();
        if (!message) {

            return NextResponse.json({ error: "Message is required" }, { status: 400 });
        }

        const model = getGeminiModel("gemini-3.6-flash");


        const prompt = `you an ai chat bot , who helps people in giving code and solve their probems . your response will directly be shown in the text , so give the response like a chat  and your request is this  ${message}`;

        const result = await model.generateContent(prompt);
        let aiResponse = result.response.text().trim();

        console.log(aiResponse);

        return NextResponse.json({ aiResponse }, { status: 200 });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to generate response" }, { status: 500 });
    }
}


