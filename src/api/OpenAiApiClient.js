/**
 * OpenAI APIクライアント
 */
class OpenAiApiClient extends BaseApiClient {
  constructor() {
    super(
      'OpenAI',
      API_CONFIG.OPENAI.ENDPOINT,
      API_CONFIG.OPENAI.MODEL_NAME,
      API_CONFIG.OPENAI.GENERATION_CONFIG
    );
  }

  /**
   * OpenAI APIキーを取得
   * @returns {string} APIキー
   */
  getApiKey() {
    return getApiKey('OPENAI_API_KEY');
  }

  /**
   * OpenAI APIに問題生成リクエストを送信
   * @param {string} prompt - 送信するプロンプト
   * @returns {string} API応答
   */
  generateContent(prompt) {
    const apiKey = this.getApiKey();

    const payload = {
      model: this.modelName,
      messages: [{
        role: "user",
        content: [{
          type: "text",
          text: prompt
        }]
      }],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "response",
          strict: true,
          schema: {
            type: "object",
            properties: {
              question_1: { type: "string" },
              question_2: { type: "string" },
              question_3: { type: "string" },
              question_4: { type: "string" },
              question_5: { type: "string" }
            },
            required: ["question_1", "question_2", "question_3", "question_4", "question_5"],
            additionalProperties: false
          }
        }
      },
      ...this.generationConfig
    };

    return this.callApi(this.endpoint, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        "Authorization": "Bearer " + apiKey
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
  }

  /**
   * OpenAI APIレスポンスから質問を抽出
   * @param {Object} jsonObject - パースされたJSON応答
   * @returns {Array<string>} 質問の配列
   */
  extractQuestions(jsonObject) {
    if (!jsonObject.choices || 
        !jsonObject.choices[0].message || 
        !jsonObject.choices[0].message.content) {
      throw new Error(ERROR_MESSAGES.INVALID_API_RESPONSE('OpenAI'));
    }

    const questionsText = jsonObject.choices[0].message.content;
    const questionObj = JSON.parse(questionsText);
    return Object.values(questionObj);
  }
} 