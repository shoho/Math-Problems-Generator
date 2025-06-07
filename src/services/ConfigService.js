/**
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
} 