/**
 * アプリケーション定数設定
 */

// API設定
const API_CONFIG = {
  GEMINI: {
    ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/",
    MODEL_NAME: "gemini-2.5-pro-preview-06-05",
    GENERATION_CONFIG: {
      temperature: 1,
      topK: 64,
      topP: 0.95,
      maxOutputTokens: 65536,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          question_1: { type: "string" },
          question_2: { type: "string" },
          question_3: { type: "string" },
          question_4: { type: "string" },
          question_5: { type: "string" }
        }
      },
    }
  },
  OPENAI: {
    ENDPOINT: "https://api.openai.com/v1/chat/completions",
    MODEL_NAME: "gpt-4o",
    GENERATION_CONFIG: {
      temperature: 1,
      max_completion_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0
    }
  },
  CLAUDE: {
    ENDPOINT: "https://api.anthropic.com/v1/messages",
    MODEL_NAME: "claude-3-7-sonnet-20250219",
    GENERATION_CONFIG: {
      max_tokens: 2048,
      temperature: 1
    }
  }
};

// メール設定定数
const EMAIL_SUBJECT_CONFIG = {
  SUBJECT_PREFIX: "今日のパパからの問題",
  TEST_PREFIX: "[TEST]"
};

// 文章問題のテーマ
const WORD_PROBLEM_TOPICS = {
  "4": [
    "小数", "分数", "図形", "四則計算", "複合問題", 
    "単位換算", "時間と時刻", "概数", "データの整理", 
    "角度", "図形の分類", "平均", "小数の倍", 
    "計算の工夫", "グラフ", "未知数を求める", "変わり方調べ"
  ],
  "5": [
    "小数", "分数", "帯分数", "約分", "通分", "分数と小数の変換",
    "平面図形", "立体図形", "体積", "表面積", "四則計算", "複合問題", 
    "単位換算", "時間と時刻", "概数", "データの整理", "割合", "百分率",
    "角度", "図形の分類", "平均", "小数の倍", "速さ", 
    "計算の工夫", "グラフ", "未知数を求める", "変わり方調べ", "倍数と約数"
  ]
};

// APIプロバイダー定数
const API_PROVIDERS = {
  GEMINI: "gemini",
  OPENAI: "openai",
  CLAUDE: "claude"
};

// 学年定数
const GRADES = {
  FOURTH: "4",
  FIFTH: "5"
};

// 環境定数
const ENVIRONMENTS = {
  DEV: "DEV",
  PROD: "PROD"
};

// エラーメッセージ
const ERROR_MESSAGES = {
  API_KEY_NOT_FOUND: (keyName) => `${keyName} not found in script properties.`,
  API_CALL_FAILED: (apiName, message) => `${apiName} API call failed: ${message}`,
  INVALID_API_RESPONSE: (apiName) => `Invalid ${apiName} API response format`,
  JSON_PARSE_FAILED: (message) => `JSON parsing failed: ${message}`,
  QUESTION_EXTRACTION_FAILED: (message) => `Question extraction failed: ${message}`,
  UNSUPPORTED_API_PROVIDER: (provider) => `Unsupported API provider: ${provider}`
}; /**
 * ユーティリティ関数集
 */

/**
 * 配列からランダムに要素を選択する
 * @param {Array} items - 選択元の配列
 * @returns {*} ランダムに選択された要素
 */
function selectRandomItem(items) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('Invalid items array');
  }
  return items[Math.floor(Math.random() * items.length)];
}

/**
 * 0から指定された数未満のランダムな整数を取得する
 * @param {number} max - 最大値（この値は含まない）
 * @returns {number} ランダムな整数
 */
function getRandomInteger(max) {
  if (typeof max !== 'number' || max <= 0) {
    throw new Error('Max must be a positive number');
  }
  return Math.floor(Math.random() * max);
}

/**
 * 指定した日付が週末かどうか判定する
 * @param {Date} date - 判定する日付
 * @returns {boolean} 週末の場合true
 */
function isWeekend(date) {
  if (!(date instanceof Date)) {
    throw new Error('Parameter must be a Date object');
  }
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = 日曜, 6 = 土曜
}

/**
 * テキスト内のスラッシュをHTMLの分数表現に変換する
 * @param {string} text - 変換対象のテキスト
 * @returns {string} 変換後のテキスト
 */
function convertAllSlashesToHtmlFractions(text) {
  if (typeof text !== 'string') {
    return text;
  }
  
  // 数字/数字の形式をHTMLの分数表現に変換
  return text.replace(/(\d+)\/(\d+)/g, '<sup>$1</sup>/<sub>$2</sub>');
}

/**
 * JSON文字列を安全にパースする
 * @param {string} jsonText - パースするJSON文字列
 * @returns {Object} パースされたオブジェクト
 * @throws {Error} パースに失敗した場合
 */
function parseJsonResponse(jsonText) {
  if (typeof jsonText !== 'string') {
    throw new Error('Input must be a string');
  }
  
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(ERROR_MESSAGES.JSON_PARSE_FAILED(error.message));
  }
}

/**
 * APIキーを取得する
 * @param {string} keyName - スクリプトプロパティのキー名
 * @returns {string} APIキー
 * @throws {Error} APIキーが見つからない場合
 */
function getApiKey(keyName) {
  if (typeof keyName !== 'string' || keyName.trim() === '') {
    throw new Error('Key name must be a non-empty string');
  }
  
  const apiKey = PropertiesService.getScriptProperties().getProperty(keyName);
  if (!apiKey) {
    throw new Error(ERROR_MESSAGES.API_KEY_NOT_FOUND(keyName));
  }
  return apiKey;
}

/**
 * ログ出力用のメールコンテンツを整形する
 * @param {Object} content - メールコンテンツ
 * @param {string} content.textBody - テキスト本文
 * @param {string} content.htmlBody - HTML本文
 */
function logEmailContent({ textBody, htmlBody }) {
  Logger.log("=== Email Content ===");
  Logger.log("Text Body:");
  Logger.log(textBody);
        Logger.log("HTML Body:");
      Logger.log(htmlBody);
      Logger.log("=====================");
    }

    /**
     * 現在の日時を日本語形式で取得する
     * @returns {string} フォーマットされた日時文字列
     */
    function getFormattedDateTime() {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      
      return `${year}/${month}/${day} ${hours}:${minutes}`;
    }

    /**
     * 入力値のバリデーション
     * @param {*} value - チェックする値
     * @param {string} type - 期待する型
     * @param {string} name - パラメータ名（エラーメッセージ用）
     * @throws {Error} バリデーションに失敗した場合
     */
    function validateInput(value, type, name) {
      if (type === 'string' && (typeof value !== 'string' || value.trim() === '')) {
        throw new Error(`${name} must be a non-empty string`);
      }
      if (type === 'number' && (typeof value !== 'number' || isNaN(value))) {
        throw new Error(`${name} must be a valid number`);
      }
      if (type === 'array' && !Array.isArray(value)) {
        throw new Error(`${name} must be an array`);
      }
      if (type === 'object' && (typeof value !== 'object' || value === null)) {
        throw new Error(`${name} must be an object`);
      }
    } /**
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
      Logger.log(`Calling ${this.apiName} API...`);
      const response = UrlFetchApp.fetch(url, options);

      const statusCode = response.getResponseCode();
      if (statusCode >= 400) {
        const errorBody = response.getContentText();
        Logger.log(`${this.apiName} API Error Response: ${errorBody}`);
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
  generateQuestions(prompt) {
    try {
      validateInput(prompt, 'string', 'prompt');
      
      const responseText = this.generateContent(prompt);
      const jsonObject = parseJsonResponse(responseText);
      return this.extractQuestions(jsonObject);
    } catch (error) {
      throw new Error(ERROR_MESSAGES.QUESTION_EXTRACTION_FAILED(error.message));
    }
  }
} /**
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
        maxOutputTokens: 65536,
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

      // デバッグ: 問題数と内容を確認
      Logger.log("=== 解説生成デバッグ情報 ===");
      Logger.log("問題数: " + questions.length);
      Logger.log("各問題の内容:");
      questions.forEach((q, i) => {
        Logger.log(`問題${i + 1}: ${q}`);
      });

      const prompt = explanationPrompt + "\n" + questions.join("\n\n");
      
      // デバッグ: 生成されたプロンプトを確認
      Logger.log("\n生成されたプロンプト:");
      Logger.log(prompt);
      Logger.log("=== デバッグ情報終了 ===\n");

      const responseText = this.generateTextContent(prompt);
      
      // デバッグ: レスポンスのサイズを確認
      Logger.log("\n=== APIレスポンス情報 ===");
      Logger.log("レスポンスの長さ: " + responseText.length + " 文字");
      Logger.log("=== レスポンス情報終了 ===\n");
      
      const jsonObject = parseJsonResponse(responseText);
      const explanationText = this.extractExplanation(jsonObject);
      
      // デバッグ: 解説テキストのサイズを確認
      Logger.log("\n=== 解説テキスト情報 ===");
      Logger.log("解説テキストの長さ: " + explanationText.length + " 文字");
      Logger.log("解説テキストの最初の500文字:");
      Logger.log(explanationText.substring(0, 500));
      Logger.log("\n解説テキストの最後の500文字:");
      Logger.log(explanationText.substring(explanationText.length - 500));
      Logger.log("=== 解説テキスト情報終了 ===\n");
      
      return explanationText;
    } catch (error) {
      throw new Error(`Failed to generate explanation: ${error.message}`);
    }
  }
} /**
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
} /**
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
} /**
 * APIクライアントファクトリー
 * 異なるAPIプロバイダーのクライアントを統一的に管理
 */
class ApiClientFactory {
  /**
   * 指定されたプロバイダーに対応するAPIクライアントを作成
   * @param {string} provider - APIプロバイダー名
   * @returns {BaseApiClient} APIクライアントインスタンス
   * @throws {Error} サポートされていないプロバイダーの場合
   */
  static createClient(provider) {
    validateInput(provider, 'string', 'provider');

    switch (provider.toLowerCase()) {
      case API_PROVIDERS.GEMINI:
        return new GeminiApiClient();
      
      case API_PROVIDERS.OPENAI:
        return new OpenAiApiClient();
      
      case API_PROVIDERS.CLAUDE:
        return new ClaudeApiClient();
      
      default:
        throw new Error(ERROR_MESSAGES.UNSUPPORTED_API_PROVIDER(provider));
    }
  }

  /**
   * 利用可能なAPIプロバイダー一覧を取得
   * @returns {Array<string>} プロバイダー名の配列
   */
  static getAvailableProviders() {
    return Object.values(API_PROVIDERS);
  }

  /**
   * プロバイダーがサポートされているかチェック
   * @param {string} provider - チェックするプロバイダー名
   * @returns {boolean} サポートされている場合true
   */
  static isProviderSupported(provider) {
    return Object.values(API_PROVIDERS).includes(provider?.toLowerCase());
  }
}

/**
 * 問題生成サービス
 * APIクライアントファクトリーを使用して問題を生成する
 */
class QuestionGenerationService {
  /**
   * 指定されたAPIプロバイダーと学年で問題を生成
   * @param {string} provider - APIプロバイダー名
   * @param {string} grade - 学年
   * @returns {Array<string>} 生成された問題の配列
   */
  static generateQuestions(provider, grade) {
    try {
      validateInput(provider, 'string', 'provider');
      validateInput(grade, 'string', 'grade');

      if (!ApiClientFactory.isProviderSupported(provider)) {
        throw new Error(ERROR_MESSAGES.UNSUPPORTED_API_PROVIDER(provider));
      }

      const apiClient = ApiClientFactory.createClient(provider);
      const prompt = PromptService.createPrompt(grade);
      
      return apiClient.generateQuestions(prompt);
    } catch (error) {
      Logger.log(`Error generating questions: ${error.message}`);
      throw error;
    }
  }

  /**
   * Gemini APIを使用して問題の解説を生成
   * @param {Array<string>} questions - 問題の配列
   * @returns {string} 解説テキスト
   */
  static generateExplanation(questions) {
    try {
      validateInput(questions, 'array', 'questions');

      const geminiClient = new GeminiApiClient();
      const explanationPrompt = ConfigService.getExplanationPrompt();
      
      // デバッグ: 解説プロンプトの内容を確認
      Logger.log("=== QuestionGenerationService デバッグ ===");
      Logger.log("解説プロンプト:", explanationPrompt);
      Logger.log("問題数:", questions.length);
      Logger.log("=== デバッグ終了 ===\n");
      
      return geminiClient.generateExplanation(questions, explanationPrompt);
    } catch (error) {
      Logger.log(`Error generating explanation: ${error.message}`);
      throw error;
    }
  }
} /**
 * メール送信サービス
 */
class EmailService {
  /**
   * 問題のメール件名を作成
   * @returns {string} メール件名
   */
  static createQuestionEmailSubject() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${EMAIL_SUBJECT_CONFIG.SUBJECT_PREFIX} ${month}月${day}日`;
  }

  /**
   * 回答のメール件名を作成
   * @returns {string} メール件名
   */
  static createAnswerEmailSubject() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${EMAIL_SUBJECT_CONFIG.SUBJECT_PREFIX} ${month}月${day}日 【回答・解説】`;
  }

  /**
   * 問題のメール内容を作成
   * @param {Array<string>} questions - 問題の配列
   * @returns {Object} メール内容オブジェクト
   */
  static createQuestionEmailContent(questions) {
    validateInput(questions, 'array', 'questions');
    
    const textBody = questions
      .map((q, i) => `第${i + 1}問\n${q}`)
      .join("\n\n");
    
    const htmlBody = questions
      .map((q, i) => `<h3>第${i + 1}問</h3><p>${convertAllSlashesToHtmlFractions(q)}</p>`)
      .join("\n");
    
    return {
      textBody: textBody,
      htmlBody: htmlBody
    };
  }

  /**
   * 回答のメール内容を作成
   * @param {string} explanation - 解説テキスト
   * @returns {Object} メール内容オブジェクト
   */
  static createAnswerEmailContent(explanation) {
    validateInput(explanation, 'string', 'explanation');
    
    const processedExplanation = convertAllSlashesToHtmlFractions(explanation);
    
    return {
      textBody: explanation,
      htmlBody: processedExplanation
    };
  }

  /**
   * メールを送信
   * @param {Object} params - 送信パラメータ
   * @param {string} params.recipient - 受信者
   * @param {string} params.subject - 件名
   * @param {Object} params.content - メール内容
   * @param {string} params.content.textBody - テキスト本文
   * @param {string} params.content.htmlBody - HTML本文
   */
  static sendEmailWithContent({ recipient, subject, content }) {
    try {
      validateInput(recipient, 'string', 'recipient');
      validateInput(subject, 'string', 'subject');
      validateInput(content, 'object', 'content');
      validateInput(content.textBody, 'string', 'content.textBody');
      validateInput(content.htmlBody, 'string', 'content.htmlBody');

      Logger.log(`Sending email to: ${recipient}`);
      Logger.log(`Subject: ${subject}`);
      
      // デバッグ: メール内容のサイズを確認
      Logger.log("\n=== メール内容情報 ===");
      Logger.log("テキスト本文の長さ: " + content.textBody.length + " 文字");
      Logger.log("HTML本文の長さ: " + content.htmlBody.length + " 文字");
      Logger.log("=== メール内容情報終了 ===\n");

      MailApp.sendEmail({
        to: recipient,
        subject: subject,
        body: content.textBody,
        htmlBody: content.htmlBody
      });

      Logger.log("Email sent successfully!");
    } catch (error) {
      Logger.log(`Email sending failed: ${error.message}`);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * 問題メールを送信
   * @param {Object} params - 送信パラメータ
   * @param {Array<string>} params.questions - 問題の配列
   * @param {Array<string>} params.recipients - 受信者リスト
   * @param {boolean} params.isTest - テストモードかどうか
   */
  static sendQuestionEmail({ questions, recipients, isTest = false }) {
    try {
      const content = this.createQuestionEmailContent(questions);
      const baseSubject = this.createQuestionEmailSubject();
      const subject = isTest ? `${EMAIL_SUBJECT_CONFIG.TEST_PREFIX}${baseSubject}` : baseSubject;

      this.sendEmailWithContent({
        recipient: recipients.join(","),
        subject: subject,
        content: content
      });

      if (isTest) {
        logEmailContent(content);
      }
    } catch (error) {
      throw new Error(`Failed to send question email: ${error.message}`);
    }
  }

  /**
   * 回答メールを送信
   * @param {Object} params - 送信パラメータ
   * @param {string} params.explanation - 解説テキスト
   * @param {Array<string>} params.recipients - 受信者リスト
   * @param {boolean} params.isTest - テストモードかどうか
   */
  static sendAnswerEmail({ explanation, recipients, isTest = false }) {
    try {
      const content = this.createAnswerEmailContent(explanation);
      const baseSubject = this.createAnswerEmailSubject();
      const subject = isTest ? `${EMAIL_SUBJECT_CONFIG.TEST_PREFIX}${baseSubject}` : baseSubject;

      this.sendEmailWithContent({
        recipient: recipients.join(","),
        subject: subject,
        content: content
      });

      Logger.log(content.textBody);

      if (isTest) {
        logEmailContent(content);
      }
    } catch (error) {
      throw new Error(`Failed to send answer email: ${error.message}`);
    }
  }
} /**
 * プロンプト管理サービス
 */
class PromptService {
  /**
   * 指定された学年に対応するプロンプトを作成
   * @param {string} grade - 学年 ("4" または "5")
   * @returns {string} 生成されたプロンプト
   * @throws {Error} サポートされていない学年の場合
   */
  static createPrompt(grade) {
    validateInput(grade, 'string', 'grade');

    // ランダムな文章問題テーマを選択
    const topics = WORD_PROBLEM_TOPICS[grade];
    if (!topics) {
      throw new Error(`Unsupported grade: ${grade}`);
    }

    const randomTopic1 = selectRandomItem(topics);
    const randomTopic2 = selectRandomItem(topics);

    // プロンプトテンプレートを取得
    const basePrompt = this.getPromptTemplate(grade);
    
    // テーマをプロンプトに挿入
    return basePrompt
      .replace(/##{WORD_PROBLEM}##/g, randomTopic1)
      .replace(/##{WORD_PROBLEM}##/g, randomTopic2);
  }

  /**
   * 学年に対応するプロンプトテンプレートを取得
   * @param {string} grade - 学年
   * @returns {string} プロンプトテンプレート
   * @throws {Error} サポートされていない学年の場合
   */
  static getPromptTemplate(grade) {
    switch (grade) {
      case GRADES.FOURTH:
        return PROMPT_MATH_PROBLEMS_4TH_GRADE;
      case GRADES.FIFTH:
        return PROMPT_MATH_PROBLEMS_5TH_GRADE;
      default:
        throw new Error(`Unsupported grade: ${grade}. Supported grades: ${Object.values(GRADES).join(', ')}`);
    }
  }

  /**
   * 利用可能な学年一覧を取得
   * @returns {Array<string>} 学年の配列
   */
  static getAvailableGrades() {
    return Object.values(GRADES);
  }

  /**
   * 学年がサポートされているかチェック
   * @param {string} grade - チェックする学年
   * @returns {boolean} サポートされている場合true
   */
  static isGradeSupported(grade) {
    return Object.values(GRADES).includes(grade);
  }

  /**
   * 指定学年の文章問題テーマ一覧を取得
   * @param {string} grade - 学年
   * @returns {Array<string>} テーマの配列
   */
  static getWordProblemTopics(grade) {
    validateInput(grade, 'string', 'grade');
    
    const topics = WORD_PROBLEM_TOPICS[grade];
    if (!topics) {
      throw new Error(`No topics found for grade: ${grade}`);
    }
    
    return [...topics]; // 配列のコピーを返す
  }
} /**
 * 設定管理サービス
 */
class ConfigService {
  /**
   * 問題メール受信者リストを取得
   * @param {string} env - 環境 ("DEV" または "PROD")
   * @returns {Array<string>} 受信者メールアドレスの配列
   */
  static getQuestionRecipients(env) {
    validateInput(env, 'string', 'environment');
    
    if (!Object.values(ENVIRONMENTS).includes(env)) {
      throw new Error(`Invalid environment: ${env}. Must be one of: ${Object.values(ENVIRONMENTS).join(', ')}`);
    }
    
    return getQuestionRecipients(env);
  }

  /**
   * 回答メール受信者リストを取得
   * @param {string} env - 環境 ("DEV" または "PROD")
   * @returns {Array<string>} 受信者メールアドレスの配列
   */
  static getAnswerRecipients(env) {
    validateInput(env, 'string', 'environment');
    
    if (!Object.values(ENVIRONMENTS).includes(env)) {
      throw new Error(`Invalid environment: ${env}. Must be one of: ${Object.values(ENVIRONMENTS).join(', ')}`);
    }
    
    return getAnswerRecipients(env);
  }

  /**
   * 解説プロンプトを取得
   * @returns {string} 解説プロンプト
   */
  static getExplanationPrompt() {
    return getExplanationPrompt();
  }

  /**
   * 環境設定を検証
   * @param {string} env - 検証する環境
   * @returns {boolean} 有効な環境の場合true
   */
  static isValidEnvironment(env) {
    return Object.values(ENVIRONMENTS).includes(env);
  }

  /**
   * 利用可能な環境一覧を取得
   * @returns {Array<string>} 環境名の配列
   */
  static getAvailableEnvironments() {
    return Object.values(ENVIRONMENTS);
  }

  /**
   * アプリケーション設定の検証
   * @param {Object} config - 検証する設定オブジェクト
   * @param {string} config.apiProvider - APIプロバイダー
   * @param {string} config.grade - 学年
   * @param {string} config.env - 環境
   * @throws {Error} 無効な設定の場合
   */
  static validateConfig({ apiProvider, grade, env }) {
    if (!ApiClientFactory.isProviderSupported(apiProvider)) {
      throw new Error(`Unsupported API provider: ${apiProvider}`);
    }

    if (!PromptService.isGradeSupported(grade)) {
      throw new Error(`Unsupported grade: ${grade}`);
    }

    if (!this.isValidEnvironment(env)) {
      throw new Error(`Invalid environment: ${env}`);
    }
  }

  /**
   * 実行時設定オブジェクトを作成
   * @param {Object} options - オプション
   * @param {boolean} options.isProd - 本番環境かどうか
   * @param {string} options.apiProvider - APIプロバイダー
   * @param {string} options.grade - 学年
   * @returns {Object} 設定オブジェクト
   */
  static createExecutionConfig({ isProd = true, apiProvider = API_PROVIDERS.GEMINI, grade = GRADES.FOURTH }) {
    const env = isProd ? ENVIRONMENTS.PROD : ENVIRONMENTS.DEV;
    
    const config = {
      apiProvider,
      grade,
      env,
      isProd,
      questionRecipients: this.getQuestionRecipients(env),
      answerRecipients: this.getAnswerRecipients(env)
    };

    this.validateConfig(config);
    return config;
  }
} /**
 * 算数問題生成・配信メインサービス
 */
class MathProblemService {
  /**
   * メイン実行処理
   * @param {Object} options - 実行オプション
   * @param {boolean} options.isProd - 本番環境かどうか
   * @param {string} options.apiProvider - 使用するAPIプロバイダー
   * @param {string} options.grade - 対象学年
   */
  static execute(options = {}) {
    try {
      const config = ConfigService.createExecutionConfig(options);
      const today = new Date();

      Logger.log(`Starting math problem generation with config:`, config);

      // 休日チェック（本番環境のみ）
      if (config.isProd && isWeekend(today)) {
        Logger.log("Today is a weekend. The process will be skipped.");
        return;
      }

      // 問題の生成
      Logger.log("Generating questions...");
      const questions = QuestionGenerationService.generateQuestions(
        config.apiProvider,
        config.grade
      );

      // 問題メールの送信
      Logger.log("Sending question email...");
      EmailService.sendQuestionEmail({
        questions: questions,
        recipients: config.questionRecipients,
        isTest: !config.isProd
      });

      // 解説の生成
      Logger.log("Generating explanation...");
      const explanation = QuestionGenerationService.generateExplanation(questions);

      // 回答メールの送信
      Logger.log("Sending answer email...");
      EmailService.sendAnswerEmail({
        explanation: explanation,
        recipients: config.answerRecipients,
        isTest: !config.isProd
      });

      Logger.log("Math problem generation and email sending completed successfully!");

    } catch (error) {
      Logger.log(`Error in math problem service execution: ${error.message}`);
      throw error;
    }
  }

  /**
   * テスト実行（コンソール出力のみ）
   * @param {Object} options - 実行オプション
   * @param {string} options.apiProvider - APIプロバイダー
   * @param {string} options.grade - 学年
   */
  static testConsoleOutput(options = {}) {
    try {
      const apiProvider = options.apiProvider || API_PROVIDERS.GEMINI;
      const grade = options.grade || GRADES.FOURTH;

      Logger.log(`Testing with API Provider: ${apiProvider}, Grade: ${grade}`);

      // 問題の生成
      const questions = QuestionGenerationService.generateQuestions(apiProvider, grade);
      const questionsText = questions.map((q, i) => `第${i + 1}問\n ${q}`).join("\n\n");
      
      Logger.log("=== 問題 ===");
      Logger.log(questionsText);

      // 解説の生成
      const explanation = QuestionGenerationService.generateExplanation(questions);
      
      Logger.log("\n=== 解説 ===");
      Logger.log(explanation);

      Logger.log("Test execution completed successfully!");

    } catch (error) {
      Logger.log(`Error in test execution: ${error.message}`);
      throw error;
    }
  }

  /**
   * 設定情報を表示
   */
  static displayConfiguration() {
    Logger.log("=== 利用可能な設定 ===");
    Logger.log("APIプロバイダー: " + ApiClientFactory.getAvailableProviders().join(", "));
    Logger.log("学年: " + PromptService.getAvailableGrades().join(", "));
    Logger.log("環境: " + ConfigService.getAvailableEnvironments().join(", "));
    
    Logger.log("\n=== 文章問題テーマ ===");
    PromptService.getAvailableGrades().forEach(grade => {
      Logger.log(`${grade}年生: ${PromptService.getWordProblemTopics(grade).join(", ")}`);
    });
  }
} /**
 * 算数問題生成・メール配信スクリプト
 * 
 * Gemini APIを使用して小学生向け算数問題を生成し、
 * 指定したメールアドレスに配信するGoogle Apps Scriptです。
 */

// ======== エントリーポイント ========

/**
 * テスト実行用のエントリーポイント - コンソール出力のみ
 */
function test() {
  try {
    const options = {
      apiProvider: API_PROVIDERS.GEMINI,
      grade: GRADES.FOURTH
    };
    // プロンプト生成とログ出力
    const prompt = PromptService.createPrompt(options.grade);
    Logger.log("=== 問題生成プロンプト (test) ===");
    Logger.log(prompt);
    Logger.log("===============================");

    MathProblemService.testConsoleOutput(options);
  } catch (error) {
    Logger.log(`Error in test execution: ${error.message}`);
    throw error;
  }
}

/**
 * テスト実行用のエントリーポイント - テスト用メール送信
 */
function test_with_email() {
  try {
    const options = {
      isProd: false,
      apiProvider: API_PROVIDERS.GEMINI,
      grade: GRADES.FOURTH
    };
    // プロンプト生成とログ出力
    const prompt = PromptService.createPrompt(options.grade);
    Logger.log("=== 問題生成プロンプト (test_with_email) ===");
    Logger.log(prompt);
    Logger.log("======================================");

    MathProblemService.execute(options);
  } catch (error) {
    Logger.log(`Error in test with email execution: ${error.message}`);
    throw error;
  }
}

/**
 * 4年生向け本番実行用のエントリーポイント
 */
function execute() {
  try {
    MathProblemService.execute({
      isProd: true,
      apiProvider: API_PROVIDERS.GEMINI,
      grade: GRADES.FOURTH
    });
  } catch (error) {
    Logger.log(`Error in production execution: ${error.message}`);
    throw error;
  }
}

/**
 * 5年生向け本番実行用のエントリーポイント
 */
function execute_5th_grade() {
  try {
    MathProblemService.execute({
      isProd: true,
      apiProvider: API_PROVIDERS.GEMINI,
      grade: GRADES.FIFTH
    });
  } catch (error) {
    Logger.log(`Error in 5th grade execution: ${error.message}`);
    throw error;
  }
}

/**
 * OpenAI APIを使用したテスト実行
 */
function test_openai() {
  try {
    MathProblemService.testConsoleOutput({
      apiProvider: API_PROVIDERS.OPENAI,
      grade: GRADES.FOURTH
    });
  } catch (error) {
    Logger.log(`Error in OpenAI test execution: ${error.message}`);
    throw error;
  }
}

/**
 * Claude APIを使用したテスト実行
 */
function test_claude() {
  try {
    MathProblemService.testConsoleOutput({
      apiProvider: API_PROVIDERS.CLAUDE,
      grade: GRADES.FOURTH
    });
  } catch (error) {
    Logger.log(`Error in Claude test execution: ${error.message}`);
    throw error;
  }
}

/**
 * 設定情報を表示
 */
function show_config() {
  MathProblemService.displayConfiguration();
}

/**
 * 解説生成のテスト（シンプル版）
 */
function test_explanation_simple() {
  const apiKey = getApiKey('GEMINI_API_KEY');
  const explanationPrompt = ConfigService.getExplanationPrompt();
  
  // テスト用の問題
  const questions = [
    "1と2/3 + 1/4 + 3/5",
    "3と1/4 - 2/3 + 1/5",
    "(65 + 35) × 8 - 250",
    "4年生3クラスの好きなスポーツを調べたところ、1組はサッカーが12人、野球が8人、バスケットボールが10人でした。2組はサッカーが10人、野球が11人、バスケットボールが9人でした。3組はサッカーが13人、野球が7人、バスケットボールが11人でした。3つのクラス全体で、一番人気のあるスポーツは何ですか。",
    "あるお店の1週間のアイスクリームの売上を調べました。月曜日に38個、火曜日に45個、水曜日に32個、木曜日に51個、金曜日に63個売れました。月曜日から水曜日までの3日間で売れたアイスクリームの合計と、木曜日と金曜日の2日間で売れたアイスクリームの合計では、どちらが何個多いですか。"
  ];
  
  const prompt = explanationPrompt + "\n" + questions.join("\n\n");
  
  const data = {
    contents: [{
      role: 'user',
      parts: [{ text: prompt }]
    }],
    generationConfig: {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 65536,
      responseMimeType: 'text/plain'
    }
  };
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro-preview-06-05:generateContent?key=${apiKey}`;
  const options = {
    method: 'POST',
    contentType: 'application/json',
    payload: JSON.stringify(data)
  };
  
  try {
    const response = UrlFetchApp.fetch(url, options);
    const responseText = response.getContentText();
    Logger.log("レスポンスの長さ: " + responseText.length);
    
    const jsonObject = JSON.parse(responseText);
    const explanation = jsonObject.candidates[0].content.parts[0].text;
    Logger.log("解説の長さ: " + explanation.length);
    Logger.log("\n最初の1000文字:");
    Logger.log(explanation.substring(0, 1000));
    Logger.log("\n最後の1000文字:");
    Logger.log(explanation.substring(explanation.length - 1000));
    
    return explanation;
  } catch (error) {
    Logger.log("エラー: " + error);
    throw error;
  }
}

