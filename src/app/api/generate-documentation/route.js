import { NextResponse } from "next/server";
import { getGeminiModel } from "@/config/gemini";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(request) {
    const ip = getClientIp(request);
    const { allowed, retryAfterSeconds } = checkRateLimit(`${ip}:generate-documentation`);
    if (!allowed) {
        return NextResponse.json(
            { error: "Too many requests. Please wait a moment and try again.", retryAfter: retryAfterSeconds },
            { status: 429 }
        );
    }

    try {
        const { code, language } = await request.json();
        if (!code) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        const model = getGeminiModel("gemini-3.6-flash");


        const prompt = `
        Generate documentation for the following code.
        Ensure that the documentation is in the form of inline comments to be added at the end of the file. 
        Dont write comment for each and every line of code.
        Use the appropriate comment style for the provided language.
        Dont include the language at the top just the comments.
        do not include the code or any markdowns just the comments.
        and amke it as detailed and descriptive as possible.dont write the language
        Code:
        ${code}
        `;

        const result = await model.generateContent(prompt);
        let documentation = result.response.text().trim();

        // Ensure the response doesn't contain the code or markdown
        //documentation = documentation.replace(/```[\s\S]*?```/g, ""); // Remove triple backticks if any
        documentation = documentation.replace(code, "").trim(); // Remove the code if it appears
        documentation = documentation.replace(language, "").trim(); 
        documentation = documentation.replace(/`{3}/g, "").replace(/`{3}$/g, "");



        return NextResponse.json({ documentation }, { status: 200 });
    } catch (error) {
        console.error("Gemini API Error:", error.response?.data || error.message);
        return NextResponse.json({ error: "Failed to generate documentation" }, { status: 500 });
    }
}



