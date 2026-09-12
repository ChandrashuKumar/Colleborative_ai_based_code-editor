import { NextResponse } from "next/server";
import { getGeminiModel } from "@/config/gemini";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`${ip}:get-errors`);
    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a moment and try again.", retryAfter: retryAfterSeconds },
            { status: 429 }
        );
    }

    try {
        const { code } = await request.json();
        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        // Try to fix code with AI
        let fixedCode = await fixCodeWithAI(code);
        if (fixedCode) {
            return NextResponse.json({ fixedCode, aiFixed: true }, { status: 200 });
        }

        return NextResponse.json({ error: "Failed to fix code" }, { status: 422 });
    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
    }
}

// 🔹 AI-Based Auto-Fix for Code
async function fixCodeWithAI(code) {
    try {
        const model = getGeminiModel("gemini-3.6-flash");

        // Create a prompt to fix syntax errors without needing language specification
        const prompt = `Fix the syntax errors in the following code:\n\n${code}\n\nReturn only the corrected code without any comments or formatting like markdown.also if there are any existing comments , dont remove it `;

        const result = await model.generateContent(prompt);
        const fixedCode = result.response.text().replace(/```[a-z]*\n?/gi, "").trim(); // Remove markdown formatting

        return fixedCode;
    } catch (error) {
        console.error("AI Fix Error:", error);
        return null;
    }
}



