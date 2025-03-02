/**
 * 算数問題生成・メール配信スクリプト
 * 
 * Gemini, OpenAI, Claude APIを使用して小学生向け算数問題を生成し、
 * 指定したメールアドレスに配信するGoogle Apps Scriptです。
 */

// ======== エントリーポイント ========

/**
 * テスト実行用のエントリーポイント - コンソール出力のみ
 */
function test() {
  const apiProvider = "claude"; // "gemini", "openai", "claude" から選択可能
  try {
    const questions = getQuestionsFromAPI(apiProvider);
    const response = questions.map((q, i) => `第${i + 1}問\n ${q}`).join("\n\n");
    console.log(response);
  } catch (error) {
    Logger.log(`Error in test execution: ${error.message}`);
    throw error;
  }
}

/**
 * テスト実行用のエントリーポイント - テスト用メール送信
 */
function test_with_email() {
  main({ isProd: false, apiProvider: "claude" });
}

/**
 * 本番実行用のエントリーポイント
 */
function execute() {
  main({ isProd: true, apiProvider: "claude" });
}

// ======== 設定 ========

// グローバル設定
const CONFIG = {
  // API設定
  API: {
    GEMINI: {
      ENDPOINT: "https://generativelanguage.googleapis.com/v1beta/models/",
      MODEL_NAME: "gemini-2.0-flash",
    },
    OPENAI: {
      ENDPOINT: "https://api.openai.com/v1/chat/completions",
      MODEL_NAME: "gpt-4o",
    },
    CLAUDE: {
      ENDPOINT: "https://api.anthropic.com/v1/messages",
      MODEL_NAME: "claude-3-7-sonnet-20250219",
    }
  },
  
  // メール設定
  EMAIL: {
    SUBJECT_PREFIX: "今日のパパからの問題"
  },
  
  // 生成設定
  GENERATION: {
    temperature: 1,
    topK: 64,
    topP: 0.95,
    maxOutputTokens: 8192,
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
    }
  },
  
  // 文章問題のテーマ一覧
  WORD_PROBLEM_TOPICS: [
    "小数", "分数", "図形", "四則計算", "複合問題", 
    "単位換算", "時間と時刻", "概数", "データの整理", 
    "角度", "図形の分類", "平均", "小数の倍", 
    "計算の工夫", "グラフ", "未知数を求める", "変わり方調べ"
  ]
};

// ======== メイン処理 ========

/**
 * メインの実行関数
 * @param {Object} options - 実行オプション
 * @param {boolean} options.isProd - 本番環境かどうか
 * @param {string} options.apiProvider - 使用するAPIのプロバイダ ("gemini", "openai", または "claude")
 * @returns {void}
 */
function main({ isProd = true, apiProvider = "claude" }) {
  const today = new Date();
  const env = isProd ? "PROD" : "DEV";
  
  // 休日チェック（本番環境のみ）
  if (isProd && isWeekend(today)) {
    Logger.log("Today is a weekend. The process will be skipped.");
    return;
  }

  try {
    // 問題の生成
    const questions = getQuestionsFromAPI(apiProvider);


    
    // メール内容の作成
    const emailContent = createEmailContent(questions);
    const emailRecipients = getEmailRecipients(env);
    const emailSubject = isProd ? createEmailSubject() : "[TEST]" + createEmailSubject();

    // メール送信
    sendEmailWithContent({
      recipient: emailRecipients.join(","),
      subject: emailSubject,
      content: emailContent
    });

    Logger.log("Email sent successfully!");
    logEmailContent(emailContent);
  } catch (error) {
    Logger.log(`Error in main execution: ${error.message}`);
    throw error;
  }
}

// ======== API呼び出し ========

/**
 * API を呼び出して質問を取得する
 * @param {string} apiProvider - 使用するAPIのプロバイダ ("gemini", "openai", または "claude")
 * @returns {string[]} 質問の配列
 * @throws {Error} API 呼び出しまたはデータ処理に失敗した場合
 */
function getQuestionsFromAPI(apiProvider) {
  // APIプロバイダに応じた関数を呼び出す
  const apiCallers = {
    'openai': callOpenAIApi,
    'claude': callClaudeApi,
    'gemini': callGeminiApi
  };
  
  const apiCaller = apiCallers[apiProvider] || callGeminiApi;
  const responseText = apiCaller();
  
  // レスポンスの解析
  const jsonObject = parseJsonResponse(responseText);
  return extractQuestionsFromResponse(jsonObject, apiProvider);
}

/**
 * プロンプトテンプレート内のプレースホルダーを置換して、プロンプトを作成
 * @returns {string} API に送信するプロンプト
 */
function createPrompt() {
  return PROMPT_TEMPLATE.replace(/##\{WORD_PROBLEM\}##/g, () =>
    selectRandomItem(CONFIG.WORD_PROBLEM_TOPICS)
  );
}

/**
 * Gemini API を呼び出す
 * @returns {string} API レスポンス
 * @throws {Error} API 呼び出しに失敗した場合
 */
function callGeminiApi() {
  const apiKey = getApiKey('GEMINI_API_KEY');
  const url = `${CONFIG.API.GEMINI.ENDPOINT}${CONFIG.API.GEMINI.MODEL_NAME}:generateContent?key=${apiKey}`;
  
  const payload = {
    contents: [{
      role: "user",
      parts: [{ text: createPrompt() }]
    }],
    generationConfig: CONFIG.GENERATION
  };

  return callApi("Gemini", url, {
    method: 'post',
    contentType: 'application/json',
    payload: JSON.stringify(payload)
  });
}

/**
 * OpenAI API を呼び出す
 * @returns {string} API レスポンス
 * @throws {Error} API 呼び出しに失敗した場合
 */
function callOpenAIApi() {
  const apiKey = getApiKey('OPENAI_API_KEY');
  const url = CONFIG.API.OPENAI.ENDPOINT;
  
  const payload = {
    model: CONFIG.API.OPENAI.MODEL_NAME,
    messages: [{
      role: "user",
      content: [{
        type: "text",
        text: createPrompt()
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
    temperature: 1,
    max_completion_tokens: 2048,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0
  };

  return callApi("OpenAI", url, {
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
 * Claude API を呼び出す
 * @returns {string} API レスポンス
 * @throws {Error} API 呼び出しに失敗した場合
 */
function callClaudeApi() {
  const apiKey = getApiKey('CLAUDE_API_KEY');
  const url = CONFIG.API.CLAUDE.ENDPOINT;
  
  const payload = {
    model: CONFIG.API.CLAUDE.MODEL_NAME,
    max_tokens: 2048,
    temperature: 1,
    messages: [{
      role: "user",
      content: createPrompt() + `

最終的な回答はJSON形式で以下の構造で返してください:
{
  "question_1": "問題1の内容",
  "question_2": "問題2の内容",
  "question_3": "問題3の内容",
  "question_4": "問題4の内容",
  "question_5": "問題5の内容"
}`
    }]
  };

  return callApi("Claude", url, {
    method: 'post',
    contentType: 'application/json',
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01"
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });
}

/**
 * APIキーを取得する
 * @param {string} keyName - スクリプトプロパティのキー名
 * @returns {string} APIキー
 * @throws {Error} APIキーが見つからない場合
 */
function getApiKey(keyName) {
  const apiKey = PropertiesService.getScriptProperties().getProperty(keyName);
  if (!apiKey) {
    throw new Error(`${keyName} not found in script properties.`);
  }
  return apiKey;
}

/**
 * 共通API呼び出し処理
 * @param {string} apiName - API名（ログ用）
 * @param {string} url - API URL
 * @param {Object} options - URLFetchApp.fetchのオプション
 * @returns {string} API レスポンス
 * @throws {Error} API 呼び出しに失敗した場合
 */
function callApi(apiName, url, options) {
  try {
    console.log(`Calling ${apiName} API...`);
	const safeOptions = {...options, muteHttpExceptions: false};
    const response = UrlFetchApp.fetch(url, options);

	const statusCode = response.getResponseCode();
    if (statusCode >= 400) {
      throw new Error(`${apiName} API returned status code ${statusCode}`);
    }

    return response.getContentText();
  } catch (error) {
    throw new Error(`${apiName} API call failed: ${error.message}`);
  }
}

// ======== レスポンス処理 ========

/**
 * JSON レスポンスをパースする
 * @param {string} jsonText - パースする JSON 文字列
 * @returns {Object} パースされた JSON オブジェクト
 * @throws {Error} JSON パースに失敗した場合
 */
function parseJsonResponse(jsonText) {
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    throw new Error(`JSON parsing failed: ${error.message}`);
  }
}

/**
 * レスポンスから質問を抽出する
 * @param {Object} jsonObject - パースされた JSON オブジェクト
 * @param {string} apiProvider - 使用したAPIのプロバイダ
 * @returns {string[]} 質問の配列
 * @throws {Error} 質問の抽出に失敗した場合
 */
function extractQuestionsFromResponse(jsonObject, apiProvider) {
  try {
    // APIプロバイダに応じた抽出処理
    const extractors = {
      'gemini': extractGeminiQuestions,
      'openai': extractOpenAIQuestions,
      'claude': extractClaudeQuestions
    };
    
    const extractor = extractors[apiProvider];
    if (!extractor) {
      throw new Error(`Unsupported API provider: ${apiProvider}`);
    }
    
    return extractor(jsonObject);
  } catch (error) {
    throw new Error(`Question extraction failed: ${error.message}`);
  }
}

/**
 * Gemini APIレスポンスから質問を抽出
 * @param {Object} jsonObject - パースされたJSONオブジェクト
 * @returns {string[]} 質問の配列
 */
function extractGeminiQuestions(jsonObject) {
  if (!jsonObject.candidates || !jsonObject.candidates[0].content || !jsonObject.candidates[0].content.parts) {
    throw new Error("Invalid Gemini API response format");
  }
  
  const questionsText = jsonObject.candidates[0].content.parts[0].text;
  const questionObj = JSON.parse(questionsText);
  return Object.values(questionObj);
}

/**
 * OpenAI APIレスポンスから質問を抽出
 * @param {Object} jsonObject - パースされたJSONオブジェクト
 * @returns {string[]} 質問の配列
 */
function extractOpenAIQuestions(jsonObject) {
  if (!jsonObject.choices || !jsonObject.choices[0].message || !jsonObject.choices[0].message.content) {
    throw new Error("Invalid OpenAI API response format");
  }
  
  const questionsText = jsonObject.choices[0].message.content;
  const questionObj = JSON.parse(questionsText);
  return Object.values(questionObj);
}

/**
 * Claude APIレスポンスから質問を抽出
 * @param {Object} jsonObject - パースされたJSONオブジェクト
 * @returns {string[]} 質問の配列
 */
function extractClaudeQuestions(jsonObject) {
  if (!jsonObject.content || jsonObject.content.length === 0) {
    throw new Error("Invalid Claude API response format");
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

// ======== メール処理 ========

/**
 * メールの内容を作成する
 * @param {string[]} questions - 質問の配列
 * @returns {{textBody: string, htmlBody: string}} メールの本文
 */
function createEmailContent(questions) {
  // 注意書き
  const notes = {
    text: [
      "ここに注意しよう",
      "* ノートに問題をうつして、きれいに、ていねいな字でちゃんと書こう！",
      "* いい姿勢でやろう",
      "* 時間をはかろう"
    ].join("\n"),
    html: [
      "<strong>ここに注意しよう</strong>",
      "<ul>",
      "<li>ノートに問題をうつして、<b>きれいに、ていねいな字で</b>ちゃんと書こう！</li>",
      "<li>いい姿勢でやろう</li>",
      "<li>時間をはかろう</li>",
      "</ul>"
    ].join("")
  };

  // プレーンテキストとHTML形式のメール本文を作成
  const textBody = questions.map((q, i) => `第${i + 1}問\n ${q}`).join("\n\n") + "\n\n" + notes.text;
  const htmlBody = questions.map((q, i) => `<b>第${i + 1}問</b><br> ${convertAllSlashesToHtmlFractions(q)}<br><br>`).join("") + "<br>" + notes.html;

  return { textBody, htmlBody };
}

/**
 * メールの件名を作成する
 * @returns {string} メールの件名
 */
function createEmailSubject() {
  const date = Utilities.formatDate(new Date(), Session.getTimeZone(), "yyyy/MM/dd");
  return `✏️${date} ${CONFIG.EMAIL.SUBJECT_PREFIX}`;
}

/**
 * メールを送信する
 * @param {Object} params - メール送信パラメータ
 * @param {string} params.recipient - 送信先メールアドレス
 * @param {string} params.subject - メールの件名
 * @param {Object} params.content - メールの内容
 * @param {string} params.content.textBody - プレーンテキスト形式の本文
 * @param {string} params.content.htmlBody - HTML形式の本文
 * @throws {Error} メール送信に失敗した場合
 */
function sendEmailWithContent({ recipient, subject, content }) {
  try {
    MailApp.sendEmail({
      to: recipient,
      subject: subject,
      body: content.textBody,
      htmlBody: content.htmlBody
    });
  } catch (error) {
    throw new Error(`Email sending failed: ${error.message}`);
  }
}

/**
 * メール内容をログに出力する
 * @param {Object} emailContent - メールの内容
 * @param {string} emailContent.textBody - プレーンテキスト形式の本文
 * @param {string} emailContent.htmlBody - HTML形式の本文
 */
function logEmailContent({ textBody, htmlBody }) {
  Logger.log(`Email Body (Text):\n${textBody}`);
  Logger.log(`Email Body (HTML):\n${htmlBody}`);
}

// ======== ユーティリティ関数 ========

/**
 * 数字/数字 のパターンを HTML 表示用に変換する
 * @param {string} text - 入力文字列
 * @returns {string} 変換後の文字列
 */
function convertAllSlashesToHtmlFractions(text) {
  return text.replace(/(\d+)\/(\d+)/g, '<sup>$1</sup>/<sub>$2</sub>');
}

/**
 * 配列からランダムに要素を1つ選択
 * @param {Array<T>} items - 要素の配列
 * @returns {T} ランダムに選択された要素
 * @template T
 */
function selectRandomItem(items) {
  const randomIndex = getRandomInteger(items.length);
  return items[randomIndex];
}

/**
 * 0 から指定された数までの範囲でランダムな整数を生成
 * @param {number} max - 範囲の最大値（この値は含まれない）
 * @returns {number} 生成されたランダムな整数
 */
function getRandomInteger(max) {
  return Math.floor(Math.random() * max);
}

/**
 * 指定された日付が土日かどうかを判定
 * @param {Date} date - 判定する日付
 * @returns {boolean} 土日の場合は true
 */
function isWeekend(date) {
  // 土日判定
  const day = date.getDay();
  return day === 0 || day === 6;
}
