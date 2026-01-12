
const apiKey = 'AIzaSyB-T34bULn21EbRGk-okHI4mjux665vNW0';
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.models) {
            console.log("Available Models:");
            data.models.forEach(m => {
                if (m.name.includes('gemini')) {
                    console.log(`- ${m.name} (Supported: ${m.supportedGenerationMethods.join(', ')})`);
                }
            });
        } else {
            console.error("Error:", data);
        }
    } catch (e) {
        console.error("Fetch Error:", e);
    }
}

listModels();
