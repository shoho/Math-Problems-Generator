# Math Problems Generator - リファクタリング版

小学生向けの算数問題を自動生成し、メールで配信するGoogle Apps Scriptプロジェクトです。
Gemini、OpenAI、Claude APIを使用して問題を生成し、解説も自動生成します。

## 🚀 主な機能

- **多様なAI API対応**: Gemini、OpenAI、Claude APIに対応
- **学年別問題生成**: 4年生・5年生向けの問題を生成
- **自動メール配信**: 問題と解説を別々にメール送信
- **柔軟な設定管理**: 環境別の受信者設定
- **豊富なテスト機能**: コンソール出力やテスト配信機能

## 📁 プロジェクト構造（リファクタリング後）

```
math-problems-generator/
├── src/                          # 新しいモジュール構造
│   ├── config/
│   │   └── constants.js          # 定数・設定値
│   ├── utils/
│   │   └── helpers.js            # ユーティリティ関数
│   ├── api/
│   │   ├── BaseApiClient.js      # API基底クラス
│   │   ├── GeminiApiClient.js    # Gemini API
│   │   ├── OpenAiApiClient.js    # OpenAI API
│   │   ├── ClaudeApiClient.js    # Claude API
│   │   └── ApiClientFactory.js   # APIファクトリー
│   ├── services/
│   │   ├── EmailService.js       # メール送信
│   │   ├── PromptService.js      # プロンプト管理
│   │   ├── ConfigService.js      # 設定管理
│   │   └── MathProblemService.js # メインサービス
│   └── main.js                   # エントリーポイント
├── main.js                       # 旧バージョン（下位互換性）
├── config.gs.js                  # メール設定
├── explanation.js                # 解説生成（非推奨）
├── PROMPT_*.js                   # プロンプトファイル
└── README.md                     # このファイル
```

## ⚙️ セットアップ

### 1. 基本設定

1. リポジトリをクローン
2. `config.sample.js` を `config.js` にコピー
3. `config.js` 内のメールアドレスを更新

### 2. API キーの設定

Google Apps Scriptのスクリプトプロパティに以下のキーを設定：

- `GEMINI_API_KEY`: Gemini API キー
- `OPENAI_API_KEY`: OpenAI API キー（オプション）
- `CLAUDE_API_KEY`: Claude API キー（オプション）

### 3. 環境設定

`config.gs.js` でメール受信者を設定：

```javascript
const EMAIL_CONFIG = {
  DEV: {
    questionRecipients: ['test@example.com'],
    answerRecipients: ['test+answer@example.com']
  },
  PROD: {
    questionRecipients: ['user1@example.com', 'user2@example.com'],
    answerRecipients: ['answers@example.com']
  }
};
```

## 🔧 使用方法

### エントリーポイント関数

| 関数名 | 説明 |
|--------|------|
| `test()` | コンソール出力のみのテスト |
| `test_with_email()` | テスト用メール送信 |
| `execute()` | 4年生向け本番実行 |
| `execute_5th_grade()` | 5年生向け本番実行 |
| `test_openai()` | OpenAI APIテスト |
| `test_claude()` | Claude APIテスト |
| `show_config()` | 設定情報表示 |

### 新しいAPI使用例

```javascript
// 問題生成
const questions = QuestionGenerationService.generateQuestions('gemini', '4');

// 解説生成
const explanation = QuestionGenerationService.generateExplanation(questions);

// メール送信
EmailService.sendQuestionEmail({
  questions: questions,
  recipients: ['test@example.com'],
  isTest: true
});
```

## 🔄 リファクタリングの改善点

### 1. モジュール化
- 大きなファイルを機能別に分割
- 単一責任の原則に従った設計
- 再利用可能なコンポーネント

### 2. エラーハンドリング
- 統一されたエラーメッセージ
- 適切な例外処理
- 詳細なログ出力

### 3. 設定管理
- 定数の一元管理
- 環境別設定の明確化
- バリデーション機能の追加

### 4. コードの可読性
- 詳細なJSDocコメント
- 一貫した命名規則
- TypeScriptライクな型注釈

### 5. 拡張性
- プラグイン形式のAPI対応
- ファクトリーパターンの採用
- 設定駆動の実装

## 🧪 テスト

### コンソールテスト
```javascript
// 基本テスト
test();

// 異なるAPIプロバイダーのテスト
test_openai();
test_claude();
```

### メールテスト
```javascript
// テスト用メール送信
test_with_email();
```

### 設定確認
```javascript
// 利用可能な設定を表示
show_config();
```

## 📈 下位互換性

既存の関数は非推奨警告とともに動作します：

- `main()` → `MathProblemService.execute()`
- `getQuestionsFromAPI()` → `QuestionGenerationService.generateQuestions()`
- `getExplanationFromAPI()` → `QuestionGenerationService.generateExplanation()`

## 🛠️ 開発者向け情報

### 新しいAPIプロバイダーの追加

1. `BaseApiClient` を継承したクラスを作成
2. `ApiClientFactory` に追加
3. `API_PROVIDERS` 定数に登録

### カスタム機能の追加

新しいサービスクラスを `src/services/` に追加し、`MathProblemService` から呼び出してください。

## 🐛 トラブルシューティング

### よくあるエラー

1. **APIキーエラー**: スクリプトプロパティを確認
2. **メール送信エラー**: Gmail権限を確認
3. **プロンプトエラー**: 学年設定を確認

### ログの確認

Google Apps Scriptのログビューアーで詳細なエラー情報を確認できます。

## 📞 サポート

問題や質問がある場合は、プロジェクトのIssueを作成してください。
