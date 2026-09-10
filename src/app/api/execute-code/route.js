import { NextResponse } from "next/server";
import axios from "axios";

const LANGUAGE_MAP = {
  javascript: { language: "nodejs", versionIndex: "4" },
  typescript: { language: "typescript", versionIndex: "4" },
  python: { language: "python3", versionIndex: "4" },
  java: { language: "java", versionIndex: "4" },
  csharp: { language: "csharp", versionIndex: "4" },
  php: { language: "php", versionIndex: "4" },
  cpp: { language: "cpp17", versionIndex: "1" },
};

export async function POST(request) {
  try {
    const { language, sourceCode } = await request.json();
    const mapped = LANGUAGE_MAP[language];
    if (!mapped) {
      return NextResponse.json({ error: "Unsupported language" }, { status: 400 });
    }

    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      script: sourceCode,
      language: mapped.language,
      versionIndex: mapped.versionIndex,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    });

    return NextResponse.json(response.data, { status: 200 });
  } catch (error) {
    console.error("JDoodle execution error:", error.response?.data || error.message);
    return NextResponse.json({ error: "Failed to execute code" }, { status: 500 });
  }
}