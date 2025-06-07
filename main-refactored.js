/**
 * 算数問題生成・メール配信スクリプト - リファクタリング版
 * 
 * Gemini, OpenAI, Claude APIを使用して小学生向け算数問題を生成
 * 指定したメールアドレスに配信するGoogle Apps Scriptです。
 */

// ======== エントリーポイント ========

/**
 * テスト実行用のエントリーポイント - コンソール出力のみ
 */
function test() {
  try {
    MathProblemService.testConsoleOutput({
      apiProvider: API_PROVIDERS.GEMINI,
      grade: GRADES.FOURTH
    });
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
    MathProblemService.execute({
      isProd: false,
      apiProvider: API_PROVIDERS.GEMINI,
      grade: GRADES.FOURTH
    });
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

// ======== 下位互換性のための関数（旧バージョンとの互換性維持） ========

/**
 * @deprecated 代わりに MathProblemService.execute() を使用してください
 */
function main(options) {
  Logger.log("Warning: main() function is deprecated. Use MathProblemService.execute() instead.");
  return MathProblemService.execute(options);
}

/**
 * @deprecated 代わりに QuestionGenerationService.generateQuestions() を使用してください
 */
function getQuestionsFromAPI(apiProvider, grade) {
  Logger.log("Warning: getQuestionsFromAPI() function is deprecated. Use QuestionGenerationService.generateQuestions() instead.");
  return QuestionGenerationService.generateQuestions(apiProvider, grade);
}

/**
 * @deprecated 代わりに QuestionGenerationService.generateExplanation() を使用してください
 */
function getExplanationFromAPI(questions) {
  Logger.log("Warning: getExplanationFromAPI() function is deprecated. Use QuestionGenerationService.generateExplanation() instead.");
  return QuestionGenerationService.generateExplanation(questions);
}

/**
 * @deprecated 代わりに PromptService.createPrompt() を使用してください
 */
function createPrompt(grade) {
  Logger.log("Warning: createPrompt() function is deprecated. Use PromptService.createPrompt() instead.");
  return PromptService.createPrompt(grade);
} 