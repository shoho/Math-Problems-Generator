/**
 * Claude APIクライアント
 */
class ClaudeApiClient extends BaseApiClient {
  constructor() {
    super(
      'Claude',
      API_CONFIG.CLAUDE.ENDPOINT,
      API_CONFIG.CLAUDE.MODEL_NAME,
      API_CONFIG.CLAUDE.GENERATION_CONFIG
    );
  }

  /**
   * Claude APIキーを取得
   * @returns {string} APIキー
   */
  getApiKey() {
    return getApiKey('CLAUDE_API_KEY');
  }

  /**
   * Claude APIに問題生成リクエストを送信
   * @param {string} prompt - 送信するプロンプト
   * @returns {string} API応答
   */
  generateContent(prompt) {
    const apiKey = this.getApiKey();

    const payload = {
      model: this.modelName,
      messages: [{
        role: "user",
        content: prompt + `

最終的な回答はJSON形式で以下の構造で返してください:
{
  "question_1": "問題1の内容",
  "question_2": "問題2の内容",
  "question_3": "問題3の内容",
  "question_4": "問題4の内容",
  "question_5": "問題5の内容"
}`
      }],
      ...this.generationConfig
    };

    return this.callApi(this.endpoint, {
      method: 'post',
      contentType: 'application/json',
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01"
      },
      payload: JSON.stringify(payload)
    });
  }

  /**
   * Claude APIレスポンスから質問を抽出
   * @param {Object} jsonObject - パースされたJSON応答
   * @returns {Array<string>} 質問の配列
   */
  extractQuestions(jsonObject) {
    if (!jsonObject.content || jsonObject.content.length === 0) {
      throw new Error(ERROR_MESSAGES.INVALID_API_RESPONSE('Claude'));
    }

    const messageText = jsonObject.content[0].text;
    
    // JSONを抽出するための正規表現パターン
    const jsonPattern = /```json\s*([\s\S]*?)\s*```|({[\s\S]*})/;
    const matches = messageText.match(jsonPattern);
    
    if (matches && (matches[1] || matches[2])) {
      const jsonString = matches[1] || matches[2];
      const questionObj = JSON.parse(jsonString);
      return Object.values(questionObj);
    }
    
    // もしJSON形式が見つからない場合は、JSON部分を抽出して解析を試みる
    const startIdx = messageText.indexOf('{');
    const endIdx = messageText.lastIndexOf('}') + 1;
    
    if (startIdx !== -1 && endIdx !== -1) {
      const jsonString = messageText.substring(startIdx, endIdx);
      const questionObj = JSON.parse(jsonString);
      return Object.values(questionObj);
    }
    
    throw new Error("Could not extract JSON from Claude response");
  }
} 