// Test script to verify gemini-3-flash-preview model name
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || "YOUR_KEY_HERE";

async function testModelName(modelName: string) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`;

    console.log(`\n=== Testing: ${modelName} ===`);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Hello" }] }]
            })
        });

        const data = await response.json();

        if (data.error) {
            console.log(`❌ ERROR:`, data.error);
            console.log(`   Code: ${data.error.code}`);
            console.log(`   Message: ${data.error.message}`);
            return false;
        } else {
            console.log(`✅ SUCCESS!`);
            console.log(`   Response:`, data.candidates?.[0]?.content?.parts?.[0]?.text);
            return true;
        }
    } catch (error) {
        console.log(`❌ NETWORK ERROR:`, error);
        return false;
    }
}

async function runTests() {
    console.log("=== TESTING GEMINI MODEL NAMES ===");

    const modelsToTest = [
        'gemini-3-flash-preview',
        'gemini-3-pro-preview',
        'gemini-2.0-flash-exp',
        'gemini-2.0-flash',
        'gemini-1.5-flash',
        'gemini-1.5-pro'
    ];

    for (const model of modelsToTest) {
        await testModelName(model);
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay
    }

    console.log("\n=== TEST COMPLETE ===");
}

runTests();
