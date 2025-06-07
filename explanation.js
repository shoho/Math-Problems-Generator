/**
 * 解説生成モジュール
 * @deprecated このファイルの機能は GeminiApiClient クラスに移行されました
 * 新しい機能は src/api/GeminiApiClient.js を使用してください
 */

/**
 * @deprecated 代わりに GeminiApiClient.generateTextContent() を使用してください
 */
function callGeminiApiForText(prompt) {
    Logger.log("Warning: callGeminiApiForText() is deprecated. Use GeminiApiClient.generateTextContent() instead.");
    
    try {
        const geminiClient = new GeminiApiClient();
        return geminiClient.generateTextContent(prompt);
    } catch (error) {
        console.error('Error occurred while calling Gemini API:', error);
        throw error;
    }
}

/**
 * @deprecated 代わりに GeminiApiClient.extractExplanation() を使用してください
 */
function extractExplanationFromResponse(jsonObject) {
    Logger.log("Warning: extractExplanationFromResponse() is deprecated. Use GeminiApiClient.extractExplanation() instead.");
    
    try {
        const geminiClient = new GeminiApiClient();
        return geminiClient.extractExplanation(jsonObject);
    } catch (error) {
        console.error('Error occurred while extracting explanation:', error);
        throw error;
    }
}

/**
 * @deprecated 代わりに QuestionGenerationService.generateExplanation() を使用してください
 */
function getExplanationFromAPI(questions) {
    Logger.log("Warning: getExplanationFromAPI() is deprecated. Use QuestionGenerationService.generateExplanation() instead.");
    
    try {
        return QuestionGenerationService.generateExplanation(questions);
    } catch (error) {
        console.error('Error occurred while getting explanation:', error);
        throw error;
    }
}