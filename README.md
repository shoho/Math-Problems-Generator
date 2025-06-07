# Math Problems Generator

小学生向けの算数問題を自動生成し、メールで配信するGoogle Apps Scriptプロジェクトです。
Gemini APIを使用して問題を生成し、解説も自動生成します。

## 🚀 主な機能

- **Gemini API対応**: Google の最新AI APIを使用
- **学年別問題生成**: 4年生・5年生向けの問題を生成
- **自動メール配信**: 問題と解説を別々にメール送信
- **柔軟な設定管理**: 環境別の受信者設定
- **豊富なテスト機能**: ログ出力やテスト配信機能

## 📁 プロジェクト構造

```
math-problems-generator/
├── main.js                           # メインスクリプト（全機能統合）
├── config.gs.js                      # メール設定
├── PROMPT_MATH_PROBLEMS_4TH_GRADE.js # 4年生用プロンプト
├── PROMPT_MATH_PROBLEMS_5TH_GRADE.js  # 5年生用プロンプト
├── PROMPT_MATH_PROBLEMS_EXPLANATION.js # 解説用プロンプト
└── appsscript.json                   # Google Apps Script設定
```

## ⚙️ セットアップ

### 1. Google Apps Script プロジェクトの作成

1. [Google Apps Script](https://script.google.com) にアクセス
2. 新規プロジェクトを作成
3. プロジェクト名を設定（例：Math Problems Generator）

### 2. ファイルのコピー

各ファイルの内容をGoogle Apps Scriptエディタにコピー：

1. `main.js` → メインのコードファイル
2. `config.gs.js` → 新規ファイルを作成してコピー
3. `PROMPT_MATH_PROBLEMS_4TH_GRADE.js` → 新規ファイルを作成してコピー
4. `PROMPT_MATH_PROBLEMS_5TH_GRADE.js` → 新規ファイルを作成してコピー
5. `PROMPT_MATH_PROBLEMS_EXPLANATION.js` → 新規ファイルを作成してコピー

### 3. API キーの設定

1. プロジェクト設定 → スクリプトプロパティ
2. 以下のプロパティを追加：
   - プロパティ名: `GEMINI_API_KEY`
   - 値: あなたのGemini APIキー

### 4. メール受信者の設定

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

### 5. マニフェストファイルの設定

1. プロジェクト設定 → 「appsscript.json」マニフェスト ファイルをエディタで表示
2. `appsscript.json` の内容をコピー＆ペースト

## 🔧 使用方法

### 実行関数

| 関数名 | 説明 | 用途 |
|--------|------|------|
| `execute()` | 4年生向け本番実行 | 毎日のトリガー設定用 |
| `execute_5th_grade()` | 5年生向け本番実行 | 毎日のトリガー設定用 |
| `test()` | テスト実行（ログ出力のみ） | 動作確認用 |
| `test_with_email()` | テスト用メール送信 | メール送信テスト用 |
| `test_openai()` | OpenAI APIテスト | API動作確認用 |
| `test_claude()` | Claude APIテスト | API動作確認用 |
| `test_explanation_simple()` | 解説生成テスト | 解説機能確認用 |
| `show_config()` | 設定情報表示 | 設定確認用 |

### トリガーの設定

毎日自動実行するには：

1. エディタ左側の時計アイコン（トリガー）をクリック
2. 「トリガーを追加」をクリック
3. 以下を設定：
   - 実行する関数: `execute` または `execute_5th_grade`
   - イベントのソース: 時間主導型
   - 時間ベースのトリガーのタイプ: 日付ベースのタイマー
   - 時刻を選択: 希望の時刻（例：午前7時〜8時）

## 📊 機能詳細

### クラス構成

- **BaseApiClient**: API通信の基底クラス
- **GeminiApiClient**: Gemini API専用クライアント
- **OpenAiApiClient**: OpenAI API専用クライアント（オプション）
- **ClaudeApiClient**: Claude API専用クライアント（オプション）
- **ApiClientFactory**: APIクライアントのファクトリー
- **QuestionGenerationService**: 問題生成サービス
- **EmailService**: メール送信サービス
- **PromptService**: プロンプト管理サービス
- **ConfigService**: 設定管理サービス
- **MathProblemService**: メインサービス

### 問題の種類

#### 4年生向け
- 小数・分数の計算
- 図形問題
- 単位換算
- データの整理
- 文章問題

#### 5年生向け
- 帯分数・約分・通分
- 立体図形・体積・表面積
- 割合・百分率
- 速さの問題
- 倍数と約数

## 🧪 テスト方法

### 1. 基本動作確認
```javascript
// 設定情報を確認
show_config();

// ログ出力のみのテスト
test();
```

### 2. メール送信テスト
```javascript
// テスト環境でメール送信
test_with_email();
```

### 3. 本番実行
```javascript
// 4年生向け
execute();

// 5年生向け
execute_5th_grade();
```

## 🛠️ トラブルシューティング

### よくあるエラーと対処法

1. **「GEMINI_API_KEY not found」エラー**
   - スクリプトプロパティにAPIキーが設定されているか確認
   - プロパティ名が正確に `GEMINI_API_KEY` になっているか確認

2. **メール送信エラー**
   - Gmail APIの権限が付与されているか確認
   - 受信者のメールアドレスが正しいか確認

3. **API呼び出しエラー**
   - APIキーが有効か確認
   - API利用制限に達していないか確認

### ログの確認方法

1. エディタ上部の「実行ログ」をクリック
2. または、表示 → ログ で確認

## 📝 カスタマイズ

### 問題の難易度調整

各プロンプトファイル（`PROMPT_MATH_PROBLEMS_*_GRADE.js`）を編集して、問題の難易度や種類を調整できます。

### メール本文のカスタマイズ

`EmailService` クラスの以下のメソッドを編集：
- `createQuestionEmailContent()`: 問題メールの本文
- `createAnswerEmailContent()`: 解説メールの本文

### 新しい学年の追加

1. 新しいプロンプトファイルを作成
2. `GRADES` 定数に追加
3. `WORD_PROBLEM_TOPICS` に問題テーマを追加
4. 新しい実行関数を作成

## 🔒 セキュリティ

- APIキーはスクリプトプロパティに保存（コードに直接記載しない）
- メールアドレスは設定ファイルで管理
- 本番環境では週末の実行をスキップ

## 📞 サポート

問題や質問がある場合は、プロジェクトのIssueを作成してください。
