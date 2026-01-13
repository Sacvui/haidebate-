
import { AgentSession } from './lib/agents';

// Mock global fetch
const originalFetch = global.fetch;

// Counter to track calls
let callCount = 0;

global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    callCount++;
    const url = input.toString();

    console.log(`\n[API Call #${callCount}] Requesting URL: ${url}`);

    // Extract model name from URL
    const modelMatch = url.match(/models\/(.*?):generateContent/);
    const model = modelMatch ? modelMatch[1] : "unknown";

    if (model === 'gemini-2.0-flash-exp') {
        console.log("--> SIMULATING QUOTA ERROR for gemini-2.0-flash-exp");
        return {
            json: async () => ({
                error: {
                    code: 429,
                    message: "Resource has been exhausted (Quota Exceeded)",
                    status: "RESOURCE_EXHAUSTED"
                }
            })
        } as Response;
    }

    if (model === 'gemini-1.5-flash') {
        console.log("--> SUCCESS for gemini-1.5-flash (Fallback Model)");
        return {
            json: async () => ({
                candidates: [{
                    content: {
                        parts: [{ text: "Fallback response successful! The logic works." }]
                    }
                }]
            })
        } as Response;
    }

    return originalFetch(input, init);
};

async function runTest() {
    console.log("=== STARTING FALLBACK LOGIC TEST ===");

    const session = new AgentSession(
        "AI Fallback Test",
        "Test Goal",
        "Test Audience",
        "MASTER",
        "vi",
        "dummy_key_writer",
        "dummy_key_critic"
    );

    console.log("Calling generateWriterTurn for '1_TOPIC'...");
    const result = await session.generateWriterTurn('1_TOPIC');

    console.log("\n=== TEST RESULT ===");
    console.log("Final Output:", result);

    if (result.includes("Fallback response successful")) {
        console.log("✅ TEST PASSED: System successfully switched to fallback model!");
    } else {
        console.log("❌ TEST FAILED: Fallback did not happen as expected.");
    }
}

runTest();
