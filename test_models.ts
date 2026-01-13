// Quick test to verify Gemini 3 model availability
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "test_key";

async function testModel(modelName: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello, test message" }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.log(`❌ Model "${modelName}" ERROR:`, data.error.message);
            return false;
        } else {
            console.log(`✅ Model "${modelName}" is VALID and working!`);
            return true;
        }
    } catch (error) {
        console.log(`❌ Model "${modelName}" NETWORK ERROR:`, error);
        return false;
    }
}

async function runTests() {
    console.log("=== TESTING GEMINI MODEL AVAILABILITY ===\n");

    const modelsToTest = [
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        'gemini-2.0-flash-exp',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];

    for (const model of modelsToTest) {
        await testModel(model);
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s delay between tests
    }
}

runTests();
