/**
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
} 