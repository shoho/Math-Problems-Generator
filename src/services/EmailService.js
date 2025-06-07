/**
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
    return `${EMAIL_CONFIG.SUBJECT_PREFIX} ${month}月${day}日`;
  }

  /**
   * 回答のメール件名を作成
   * @returns {string} メール件名
   */
  static createAnswerEmailSubject() {
    const today = new Date();
    const month = today.getMonth() + 1;
    const day = today.getDate();
    return `${EMAIL_CONFIG.SUBJECT_PREFIX} ${month}月${day}日 【回答・解説】`;
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
      const subject = isTest ? `${EMAIL_CONFIG.TEST_PREFIX}${baseSubject}` : baseSubject;

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
      const subject = isTest ? `${EMAIL_CONFIG.TEST_PREFIX}${baseSubject}` : baseSubject;

      this.sendEmailWithContent({
        recipient: recipients.join(","),
        subject: subject,
        content: content
      });

      console.log(content.textBody);

      if (isTest) {
        logEmailContent(content);
      }
    } catch (error) {
      throw new Error(`Failed to send answer email: ${error.message}`);
    }
  }
} 