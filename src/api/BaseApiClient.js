/**
 * APIクライアントの基底クラス
 */
class BaseApiClient {
  /**
   * @param {string} apiName - API名
   * @param {string} endpoint - APIエンドポイント
   * @param {string} modelName - モデル名
   * @param {Object} generationConfig - 生成設定
   */
  constructor(apiName, endpoint, modelName, generationConfig) {
    validateInput(apiName, 'string', 'API name');
    validateInput(endpoint, 'string', 'endpoint');
    validateInput(modelName, 'string', 'model name');
    validateInput(generationConfig, 'object', 'generation config');
    
    this.apiName = apiName;
    this.endpoint = endpoint;
    this.modelName = modelName;
    this.generationConfig = generationConfig;
  }

  /**
   * 共通API呼び出し処理
   * @param {string} url - API URL
   * @param {Object} options - URLFetchApp.fetchのオプション
   * @returns {string} API レスポンス
   * @throws {Error} API 呼び出しに失敗した場合
   */
  callApi(url, options) {
    try {
      console.log(`Calling ${this.apiName} API...`);
      const response = UrlFetchApp.fetch(url, options);

      const statusCode = response.getResponseCode();
      if (statusCode >= 400) {
        const errorBody = response.getContentText();
        console.error(`${this.apiName} API Error Response:`, errorBody);
        throw new Error(`${this.apiName} API returned status code ${statusCode}: ${errorBody}`);
      }

      return response.getContentText();
    } catch (error) {
      throw new Error(ERROR_MESSAGES.API_CALL_FAILED(this.apiName, error.message));
    }
  }

  /**
   * APIキーを取得する（サブクラスで実装）
   * @abstract
   * @returns {string} APIキー
   */
  getApiKey() {
    throw new Error('getApiKey method must be implemented by subclasses');
  }

  /**
   * プロンプトを送信して応答を取得する（サブクラスで実装）
   * @abstract
   * @param {string} prompt - 送信するプロンプト
   * @returns {string} API応答
   */
  generateContent(prompt) {
    throw new Error('generateContent method must be implemented by subclasses');
  }

  /**
   * レスポンスから質問を抽出する（サブクラスで実装）
   * @abstract
   * @param {Object} jsonObject - パースされたJSON応答
   * @returns {Array<string>} 質問の配列
   */
  extractQuestions(jsonObject) {
    throw new Error('extractQuestions method must be implemented by subclasses');
  }

  /**
   * 質問を生成する統一インターフェース
   * @param {string} prompt - 送信するプロンプト
   * @returns {Array<string>} 質問の配列
   */
  async generateQuestions(prompt) {
    try {
      validateInput(prompt, 'string', 'prompt');
      
      const responseText = this.generateContent(prompt);
      const jsonObject = parseJsonResponse(responseText);
      return this.extractQuestions(jsonObject);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.QUESTION_EXTRACTION_FAILED(error.message));
    }
  }
} 