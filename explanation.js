/**
 * Module for getting math problem explanations using Gemini API
 */

/**
 * Calls Gemini API (for text response)
 * @param {string} prompt - Prompt to send to API
 * @returns {string} API response
 * @throws {Error} When API call fails
 */
function callGeminiApiForText(prompt) {
    try {
        const apiKey = getApiKey('GEMINI_API_KEY');
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY is not set');
        }

        const url = `${CONFIG.API.GEMINI.ENDPOINT}${CONFIG.API.GEMINI.MODEL_NAME}:generateContent?key=${apiKey}`;
        
        const payload = {
            contents: [{
                role: "user",
                parts: [{ text: prompt }]
            }],
            generationConfig: CONFIG.GENERATION
        };
    
        return callApi("Gemini", url, {
            method: 'post',
            contentType: 'text/plain',
            payload: JSON.stringify(payload)
        });
    } catch (error) {
        console.error('Error occurred while calling Gemini API:', error);
        throw error;
    }
}

/**
 * Extracts explanation from API response
 * @param {Object} jsonObject - JSON object from API response
 * @returns {Array} Array of explanations
 * @throws {Error} When response format is invalid
 */
function extractExplanationFromResponse(jsonObject) {
    try {
        if (!jsonObject.candidates || !jsonObject.candidates[0].content || !jsonObject.candidates[0].content.parts) {
            throw new Error("Invalid Gemini API response format");
        }
        
        return jsonObject.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error occurred while extracting explanation:', error);
        throw error;
    }
}

/**
 * Gets problem explanations by calling API
 * @param {string[]} questions - Array of questions
 * @returns {string} Explanation text
 * @throws {Error} When explanation retrieval fails
 */
function getExplanationFromAPI(questions) {
    try {
        // Generate prompt
        const prompt = getExplanationPrompt() + "\n" + questions.join("\n\n");

        // Call Gemini API (get response in text format)
        const responseText = callGeminiApiForText(prompt);

        // Parse response
        const jsonObject = parseJsonResponse(responseText);
        return extractExplanationFromResponse(jsonObject);
    } catch (error) {
        console.error('Error occurred while getting explanation:', error);
        throw error;
    }
}

function getExplanationPrompt() {
  return EXPLANATION_PROMPT;
}