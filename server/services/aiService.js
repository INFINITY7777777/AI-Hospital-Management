const OpenAI = require("openai");

/**
 * OpenRouter-Primary Multi-Model Execution Engine
 */
const executeChatCompletion = async (systemMessage, userPrompt) => {
    const openrouterKey = process.env.OPENROUTER_API_KEY;

    if (!openrouterKey) {
        throw new Error("OPENROUTER_API_KEY is missing in .env file.");
    }

    // Correct OpenRouter Model Slugs
    const primaryModels = [
        "cohere/north-mini-code:free",
        "nvidia/nemotron-3-ultra:free",
        "nvidia/nemotron-3-super",
        "nex-ai/nex-n2.5-mini",
        "nex-ai/nex-n2.5-pro",
        "openrouter/free" // General fallback to any available free OpenRouter model
    ];

    const openrouter = new OpenAI({
        baseURL: "https://openrouter.ai/api/v1",
        apiKey: openrouterKey,
        defaultHeaders: {
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Hospital Management System"
        }
    });

    for (const modelName of primaryModels) {
        try {
            const completion = await openrouter.chat.completions.create({
                model: modelName,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userPrompt }
                ],
                temperature: 0.2
            });

            if (completion.choices && completion.choices[0]?.message?.content) {
                return {
                    text: completion.choices[0].message.content,
                    providerUsed: `OpenRouter (${modelName})`
                };
            }
        } catch (err) {
            console.warn(`[AI Service] OpenRouter model '${modelName}' failed:`, err.message);
        }
    }

    // Secondary Fallback: Groq (if configured)
    const groqKey = process.env.GROQ_API_KEY || process.env.AI_API_KEY;
    if (groqKey && groqKey !== "gsk") {
        try {
            const groq = new OpenAI({
                baseURL: "https://api.groq.com/openai/v1",
                apiKey: groqKey
            });

            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userPrompt }
                ]
            });

            return {
                text: completion.choices[0].message.content,
                providerUsed: "Groq (llama-3.3-70b-versatile)"
            };
        } catch (err) {
            console.warn("[AI Service] Groq fallback failed:", err.message);
        }
    }

    throw new Error("All specified OpenRouter models failed. Check your OPENROUTER_API_KEY.");
};

module.exports = {
    executeChatCompletion
};