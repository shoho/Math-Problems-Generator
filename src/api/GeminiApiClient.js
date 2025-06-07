/**
 * Gemini APIクライアント
 */
class GeminiApiClient extends BaseApiClient {
  constructor() {
    super(
      'Gemini',
      API_CONFIG.GEMINI.ENDPOINT,
      API_CONFIG.GEMINI.MODEL_NAME,
      API_CONFIG.GEMINI.GENERATION_CONFIG
    );
  }

  /**
   * Gemini APIキーを取得
   * @returns {string} APIキー
   */
  getApiKey() {
    return getApiKey('GEMINI_API_KEY');
  }

  /**
   * Gemini APIに問題生成リクエストを送信
   * @param {string} prompt - 送信するプロンプト
   * @returns {string} API応答
   */
  generateContent(prompt) {
    const apiKey = this.getApiKey();
    const url = `${this.endpoint}${this.modelName}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: this.generationConfig
    };

    return this.callApi(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  }

  /**
   * Gemini APIに解説生成リクエストを送信（テキスト応答用）
   * @param {string} prompt - 送信するプロンプト
   * @returns {string} API応答
   */
  generateTextContent(prompt) {
    const apiKey = this.getApiKey();
    const url = `${this.endpoint}${this.modelName}:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{
        role: "user",
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: 1,
        topK: 64,
        topP: 0.95,
        maxOutputTokens: 8192,
        responseMimeType: "text/plain"
      }
    };

    return this.callApi(url, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(payload)
    });
  }

  /**
   * Gemini APIレスポンスから質問を抽出
   * @param {Object} jsonObject - パースされたJSON応答
   * @returns {Array<string>} 質問の配列
   */
  extractQuestions(jsonObject) {
    if (!jsonObject.candidates || 
        !jsonObject.candidates[0].content || 
        !jsonObject.candidates[0].content.parts) {
      throw new Error(ERROR_MESSAGES.INVALID_API_RESPONSE('Gemini'));
    }

    const questionsText = jsonObject.candidates[0].content.parts[0].text;
    const questionObj = JSON.parse(questionsText);
    return Object.values(questionObj);
  }

  /**
   * Gemini APIレスポンスから解説を抽出
   * @param {Object} jsonObject - パースされたJSON応答
   * @returns {string} 解説テキスト
   */
  extractExplanation(jsonObject) {
    if (!jsonObject.candidates || 
        !jsonObject.candidates[0].content || 
        !jsonObject.candidates[0].content.parts) {
      throw new Error(ERROR_MESSAGES.INVALID_API_RESPONSE('Gemini'));
    }

    return jsonObject.candidates[0].content.parts[0].text;
  }

  /**
   * 問題の解説を生成する
   * @param {Array<string>} questions - 問題の配列
   * @param {string} explanationPrompt - 解説用プロンプト
   * @returns {string} 解説テキスト
   */
  generateExplanation(questions, explanationPrompt) {
    try {
      validateInput(questions, 'array', 'questions');
      validateInput(explanationPrompt, 'string', 'explanation prompt');

      const prompt = explanationPrompt + "\n" + questions.join("\n\n");
      const responseText = this.generateTextContent(prompt);
      const jsonObject = parseJsonResponse(responseText);
      return this.extractExplanation(jsonObject);
    } catch (error) {
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
  }
} 