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

// メール設定
const EMAIL_CONFIG = {
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
}; 