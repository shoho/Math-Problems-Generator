/**
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
  static async execute(options = {}) {
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
  static async testConsoleOutput(options = {}) {
    try {
      const apiProvider = options.apiProvider || API_PROVIDERS.GEMINI;
      const grade = options.grade || GRADES.FOURTH;

      Logger.log(`Testing with API Provider: ${apiProvider}, Grade: ${grade}`);

      // 問題の生成
      const questions = QuestionGenerationService.generateQuestions(apiProvider, grade);
      const questionsText = questions.map((q, i) => `第${i + 1}問\n ${q}`).join("\n\n");
      
      console.log("=== 問題 ===");
      console.log(questionsText);

      // 解説の生成
      const explanation = QuestionGenerationService.generateExplanation(questions);
      
      console.log("\n=== 解説 ===");
      console.log(explanation);

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
    console.log("=== 利用可能な設定 ===");
    console.log("APIプロバイダー:", ApiClientFactory.getAvailableProviders());
    console.log("学年:", PromptService.getAvailableGrades());
    console.log("環境:", ConfigService.getAvailableEnvironments());
    
    console.log("\n=== 文章問題テーマ ===");
    PromptService.getAvailableGrades().forEach(grade => {
      console.log(`${grade}年生:`, PromptService.getWordProblemTopics(grade));
    });
  }
} 