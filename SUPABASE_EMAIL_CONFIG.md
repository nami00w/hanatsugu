# Supabase メール認証設定ガイド

## 概要
Hanatuguの新規登録フローを本格的なメール認証付きに変更するための、Supabase設定変更手順です。

## 必要な設定変更

### 1. メール認証の有効化

1. [Supabase Dashboard](https://app.supabase.com/) にログイン
2. プロジェクトを選択
3. `Authentication` → `Settings` にアクセス
4. 以下の設定を確認・変更：

```
✅ Enable email confirmations: ON
✅ Secure email change: ON (推奨)
```

### 2. メールテンプレートの設定

`Authentication` → `Email Templates` で以下のテンプレートをカスタマイズ：

#### Confirm signup テンプレート
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Hanatsugu - メール認証</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px;">
    <h1 style="color: #16a34a; margin-bottom: 16px;">🌸 Hanatuguへようこそ！</h1>
    <p style="color: #374151; font-size: 16px; margin-bottom: 24px;">
      アカウント登録を完了するため、下のボタンをクリックしてメールアドレスを確認してください。
    </p>
    <a href="{{ .ConfirmationURL }}" 
       style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
      メールアドレスを確認する
    </a>
    <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">
      このリンクは24時間有効です。<br>
      もしボタンが機能しない場合は、以下のURLをブラウザにコピー&amp;ペーストしてください：<br>
      <span style="word-break: break-all;">{{ .ConfirmationURL }}</span>
    </p>
  </div>
</body>
</html>
```

### 3. リダイレクトURL設定

`Authentication` → `URL Configuration` で以下を設定：

```
Site URL: https://your-domain.com
Redirect URLs: 
  - https://your-domain.com/auth/welcome
  - http://localhost:3000/auth/welcome (開発用)
```

### 4. 開発環境での設定

開発中も実際のメール送信をテストするため、以下を確認：

1. `Authentication` → `Settings` → `SMTP Settings`
2. カスタムSMTPまたはSupabaseの内蔵SMTP使用
3. 送信者メールアドレスの確認

### 5. 環境変数の確認

`.env.local` ファイルで以下が正しく設定されていることを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## テスト手順

### 1. 新規登録フローのテスト

1. http://localhost:3000/auth/signup にアクセス
2. 新しいメールアドレスで登録
3. メール認証画面 (`/auth/verify-email`) が表示されることを確認
4. 実際にメールが送信されることを確認
5. メール内のリンクをクリック
6. ウェルカム画面 (`/auth/welcome`) が表示されることを確認

### 2. メール再送信機能のテスト

1. 認証画面で「確認メールを再送信」ボタンをクリック
2. 成功メッセージが表示されることを確認
3. 実際に再送信メールが届くことを確認

### 3. ログイン機能のテスト

1. メール認証完了前にログインを試行
2. 「メールアドレスの確認が完了していません」エラーが表示されることを確認
3. メール認証完了後にログイン成功することを確認

## 注意事項

- **セキュリティ**: 本番環境では必ずHTTPS URLを使用
- **メール配信**: 迷惑メールフォルダに入らないよう、カスタムドメインの使用を推奨
- **Rate Limiting**: Supabaseの無料プランでは1時間あたりのメール送信数に制限あり

## トラブルシューティング

### メールが届かない場合

1. Supabase Dashboard の `Authentication` → `Users` でユーザーの `email_confirmed_at` を確認
2. `Logs` でメール送信エラーを確認
3. 迷惑メールフォルダを確認
4. SMTP設定を確認

### リダイレクトエラーの場合

1. `URL Configuration` のリダイレクトURL設定を確認
2. 本番環境のドメイン設定を確認
3. HTTPSの設定を確認

## 実装済み機能

✅ AuthContextでのメール認証スキップ機能削除
✅ `/auth/verify-email` メール確認待ち画面
✅ `/auth/welcome` 登録完了画面  
✅ メール再送信機能
✅ サインアップフォームのリダイレクト対応
✅ エラーハンドリングの日本語対応

## ソーシャルログイン設定

### Google OAuth設定
1. [Google Cloud Console](https://console.cloud.google.com) でプロジェクト作成
2. `APIs & Services` → `Credentials` → `OAuth 2.0 Client IDs` を作成
3. **Application type**: Web application
4. **Authorized redirect URIs**: `https://your-project-id.supabase.co/auth/v1/callback`
5. Supabaseの `Authentication` → `Providers` → `Google` で設定:
   ```
   Enabled: ON
   Client ID: [Google Cloud Consoleで取得]
   Client Secret: [Google Cloud Consoleで取得]
   ```

### OAuth同意画面の設定
- **User Type**: External
- **App name**: Hanatsugu
- **Scopes**: email, profile, openid

## 実装済み機能（完了）

✅ AuthContextでのメール認証スキップ機能削除  
✅ `/auth/verify-email` メール確認待ち画面
✅ `/auth/welcome` 登録完了画面  
✅ メール再送信機能
✅ サインアップフォームのリダイレクト対応
✅ エラーハンドリングの日本語対応
✅ パスワードリセット機能の実装
✅ プロフィール情報の追加入力画面
✅ メール変更機能の実装
✅ ソーシャルログイン（Google）の追加