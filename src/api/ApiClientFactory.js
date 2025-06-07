/**
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
      
      return geminiClient.generateExplanation(questions, explanationPrompt);
    } catch (error) {
      Logger.log(`Error generating explanation: ${error.message}`);
      throw error;
    }
  }
} 