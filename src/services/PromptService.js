/**
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
} 