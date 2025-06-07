# リファクタリング後移行ガイド

## 📋 概要

このガイドでは、旧バージョンから新しいリファクタリング版への移行方法を説明します。

## 🔄 主な変更点

### 1. ファイル構造の変更

**旧構造:**
```
math-problems-generator/
├── main.js (607行の巨大ファイル)
├── config.gs.js
├── explanation.js
└── PROMPT_*.js
```

**新構造:**
```
math-problems-generator/
├── src/
│   ├── config/constants.js
│   ├── utils/helpers.js
│   ├── api/
│   ├── services/
│   └── main.js
├── main.js (リファクタリング版)
├── main-original.js (旧版のバックアップ)
└── ...
```

### 2. API の変更

#### 問題生成

**旧API:**
```javascript
function getQuestionsFromAPI(apiProvider, grade) {
  // 複雑な実装...
}
```

**新API:**
```javascript
// サービスクラス経由
const questions = QuestionGenerationService.generateQuestions('gemini', '4');

// または直接APIクライアント使用
const apiClient = ApiClientFactory.createClient('gemini');
const questions = apiClient.generateQuestions(prompt);
```

#### 解説生成

**旧API:**
```javascript
function getExplanationFromAPI(questions) {
  // 複雑な実装...
}
```

**新API:**
```javascript
const explanation = QuestionGenerationService.generateExplanation(questions);
```

#### メール送信

**旧API:**
```javascript
function sendEmailWithContent({ recipient, subject, content }) {
  // 実装...
}
```

**新API:**
```javascript
EmailService.sendQuestionEmail({
  questions: questions,
  recipients: ['test@example.com'],
  isTest: true
});

EmailService.sendAnswerEmail({
  explanation: explanation,
  recipients: ['test@example.com'],
  isTest: true
});
```

## 📦 移行手順

### ステップ 1: バックアップの確認

元のコードは `main-original.js` にバックアップされています。

### ステップ 2: 設定の移行

既存の設定はそのまま使用できます：
- `config.gs.js` - メール設定（そのまま使用）
- `PROMPT_*.js` - プロンプトファイル（そのまま使用）
- スクリプトプロパティ - APIキー（そのまま使用）

### ステップ 3: 関数呼び出しの更新

#### エントリーポイント関数（変更なし）

これらの関数はそのまま使用できます：
- `test()`
- `test_with_email()`
- `execute()`

#### 新しい関数

追加された新しい関数：
- `execute_5th_grade()` - 5年生向け実行
- `test_openai()` - OpenAI APIテスト
- `test_claude()` - Claude APIテスト
- `show_config()` - 設定情報表示

### ステップ 4: カスタムコードの移行

独自にカスタマイズしたコードがある場合：

1. **設定関連**: `src/config/constants.js` に移動
2. **ユーティリティ関数**: `src/utils/helpers.js` に移動
3. **API拡張**: `src/api/` にクライアント追加
4. **ビジネスロジック**: `src/services/` にサービス追加

## ⚡ 下位互換性

### 非推奨関数

以下の関数は非推奨ですが、警告付きで動作します：

```javascript
// ❌ 非推奨（警告あり）
main({ isProd: true, apiProvider: "gemini", grade: "4" });

// ✅ 推奨
MathProblemService.execute({ isProd: true, apiProvider: "gemini", grade: "4" });
```

```javascript
// ❌ 非推奨（警告あり）
const questions = getQuestionsFromAPI("gemini", "4");

// ✅ 推奨
const questions = QuestionGenerationService.generateQuestions("gemini", "4");
```

### 段階的移行

1. **Phase 1**: 既存のエントリーポイントをそのまま使用
2. **Phase 2**: 新しいAPIを部分的に導入
3. **Phase 3**: 完全に新しい構造に移行

## 🧪 テスト方法

### 1. 基本動作確認

```javascript
// 設定情報の確認
show_config();

// 基本テスト
test();
```

### 2. メール送信テスト

```javascript
// テスト用メール送信
test_with_email();
```

### 3. 各API プロバイダーのテスト

```javascript
test_openai();  // OpenAI
test_claude();  // Claude
```

## 🚨 注意事項

### 1. Google Apps Script の制限

- クラスベースの実装はV8ランタイムが必要
- ファイル数の制限に注意

### 2. パフォーマンス

- モジュール化により若干のオーバーヘッドあり
- 機能追加により実行時間が増加する可能性

### 3. デバッグ

- エラーメッセージがより詳細になりました
- ログ出力を活用してください

## 📚 学習リソース

### 新しいパターンの理解

1. **ファクトリーパターン**: `ApiClientFactory`
2. **サービスレイヤー**: `*Service` クラス
3. **依存性注入**: コンストラクタ注入

### コード例

```javascript
// 新しいAPIプロバイダーの追加例
class NewApiClient extends BaseApiClient {
  constructor() {
    super('NewAPI', 'https://api.example.com', 'model-name', {});
  }
  
  getApiKey() {
    return getApiKey('NEW_API_KEY');
  }
  
  generateContent(prompt) {
    // 実装...
  }
  
  extractQuestions(jsonObject) {
    // 実装...
  }
}

// ファクトリーに追加
// ApiClientFactory.js を更新
```

## 🆘 トラブルシューティング

### よくある問題

1. **クラスが見つからない**
   - V8ランタイムを確認
   - ファイルの読み込み順序を確認

2. **関数が非推奨警告を出す**
   - 新しいAPIに移行してください

3. **設定が反映されない**
   - `config.gs.js` を確認
   - スクリプトプロパティを確認

### ロールバック方法

問題が発生した場合：

```bash
# 元のファイルに戻す
cp main-original.js main.js
```

## 📞 サポート

移行に関する質問や問題がある場合は、プロジェクトのIssueを作成してください。 