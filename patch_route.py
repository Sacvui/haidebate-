import re

file_path = r'd:\SE_Project\ncskt\haidebate-\app\api\gemini\route.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Enable edge runtime
content = content.replace("// export const runtime = 'edge';", "export const runtime = 'edge';")

# Replace executeGemini
execute_gemini_old = re.compile(r'const executeGemini = async \(targetModel: string\) => \{.*?\};\n\n        let data = await executeGemini\(model\);.*?return NextResponse.json\(\{ text \}\);\n', re.DOTALL)

execute_gemini_new = """        const executeGemini = async (targetModel: string) => {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:streamGenerateContent?alt=sse&key=${apiKey}`;
            
            const parts: any[] = [{ text: prompt }];
            if (inlineData) {
                parts.push({
                    inlineData: {
                        mimeType: inlineData.mimeType,
                        data: inlineData.data
                    }
                });
            }

            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts }],
                    generationConfig: {
                        maxOutputTokens: 8192
                    }
                })
            });
            
            if (!res.ok) {
                const rawText = await res.text();
                try {
                    return JSON.parse(rawText);
                } catch (e) {
                    return { error: { code: res.status || 502, message: "Invalid JSON response from Google API" } };
                }
            }
            
            // Return stream directly
            return new NextResponse(res.body, {
                headers: {
                    'Content-Type': 'text/event-stream',
                    'Cache-Control': 'no-cache',
                    'Connection': 'keep-alive',
                }
            });
        };

        const result = await executeGemini(model);
        
        // If it's a standard response (meaning it's a stream)
        if (result instanceof NextResponse || result instanceof Response) {
            return result;
        }
        
        // Otherwise it's an error object, handle it
        let data = result;

        // Auto-discovery logic if model is deprecated or not found (404)
        if (data.error && data.error.code === 404) {
            console.log(`Model ${model} not found, attempting auto-discovery...`);
            try {
                const modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
                const modelsRes = await fetch(modelsUrl);
                const modelsData = await modelsRes.json();
                
                if (modelsData.models) {
                    const isFlash = model.includes('flash');
                    
                    let availableModels = modelsData.models
                        .map((m: any) => m.name.replace('models/', ''))
                        .filter((m: string) => m.startsWith('gemini-') && !m.includes('vision') && !m.includes('exp'));
                        
                    const exactTypeModels = availableModels.filter((m: string) => isFlash ? m.includes('flash') : m.includes('pro'));
                    
                    if (exactTypeModels.length > 0) {
                        availableModels = exactTypeModels;
                    }
                    
                    if (availableModels.length > 0) {
                        availableModels.sort((a: string, b: string) => {
                            const matchA = a.match(/gemini-(\\d+\\.\\d+)/);
                            const matchB = b.match(/gemini-(\\d+\\.\\d+)/);
                            const numA = matchA ? parseFloat(matchA[1]) : 0;
                            const numB = matchB ? parseFloat(matchB[1]) : 0;
                            if (numA !== numB) return numB - numA; 
                            if (a.includes('latest') && !b.includes('latest')) return -1;
                            if (!a.includes('latest') && b.includes('latest')) return 1;
                            return b.localeCompare(a);
                        });
                        
                        const discoveredModel = availableModels[0];
                        console.log(`Auto-discovered fallback model: ${discoveredModel}`);
                        
                        const retryResult = await executeGemini(discoveredModel);
                        if (retryResult instanceof NextResponse || retryResult instanceof Response) return retryResult;
                        data = retryResult;
                    }
                }
            } catch (e) {
                console.error("Auto-discovery failed:", e);
            }
        }

        if (data.error) {
            const errorCode = data.error.code;
            const errorMsg = data.error.message;
            if (errorCode === 429 || errorMsg.toLowerCase().includes('quota')) {
                return NextResponse.json({ error: `API quota exceeded. Please wait or use your own API key in Settings.` }, { status: 429 });
            }
            if (errorCode === 404) {
                return NextResponse.json({ error: `Model "${model}" not found.` }, { status: 404 });
            }
            if (errorCode === 401 || errorCode === 403) {
                return NextResponse.json({ error: 'Invalid API key.' }, { status: 401 });
            }
            return NextResponse.json({ error: `Gemini API error (${errorCode}): ${errorMsg}` }, { status: 500 });
        }
        
        return NextResponse.json({ error: 'Unexpected error' }, { status: 500 });
"""

new_content = execute_gemini_old.sub(lambda m: execute_gemini_new, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)
print("Patch route applied successfully.")
