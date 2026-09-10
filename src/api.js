import axios from "axios";

export const executeCode = async (language, sourceCode) => {
  const response = await axios.post("/api/execute-code", { language, sourceCode });
  return {
    run: {
      output: response.data.output || "",
      stderr: response.data.error,
    },
  };
};