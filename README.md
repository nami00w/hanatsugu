# Hanatsugu - ウェディングドレスマーケットプレイス

## 開発サーバーの管理

### 基本的な使用方法

```bash
# 通常の開発サーバー起動
npm run dev

# 安全な開発サーバー管理（推奨）
npm run dev:safe     # サーバー開始
npm run dev:stop     # サーバー停止
npm run dev:restart  # サーバー再起動
npm run dev:status   # サーバー状態確認
```

### 開発サーバーの問題が発生した場合

1. **サーバーが応答しない場合**
   ```bash
   npm run dev:restart
   ```

2. **ポートが占有されている場合**
   ```bash
   npm run dev:stop
   npm run dev:safe
   ```

3. **手動でのトラブルシューティング**
   ```bash
   # プロセス確認
   lsof -ti:3000
   
   # 強制終了
   kill -9 $(lsof -ti:3000)
   
   # キャッシュクリア
   rm -rf .next
   
   # 再起動
   npm run dev:safe
   ```

## プロジェクト構成

### 主要ファイル
- `app/page.tsx` - トップページ
- `app/products/[id]/page.tsx` - 商品詳細ページ
- `components/Header.tsx` - ヘッダーコンポーネント
- `components/MobileMenu.tsx` - モバイルメニュー
- `components/RelatedProductsCarousel.tsx` - 関連商品カルーセル

### 最新の機能
1. **レスポンシブナビゲーション**
   - PC版: ヘッダーに出品ボタン
   - モバイル版: ハンバーガーメニュー

2. **商品詳細ページ**
   - PC/モバイル対応の画像ナビゲーション
   - 関連商品表示
   - シェア機能（LINE, Twitter, Web Share API）

3. **トップページ**
   - グラデーション背景のヒーローセクション
   - 集約された検索バー
   - ブランドカルーセル

### 開発者向け情報

#### 認証システム
現在はダミー認証を使用中：
- `localStorage` ベースの認証状態管理
- お気に入り機能の実装

#### 画像配信
- Unsplash API を使用
- 一部の画像で404エラーが発生する場合がありますが、機能に影響はありません

#### 環境設定
- `.env.local` で Supabase の設定が必要
- 現在はダミー認証情報を使用

## トラブルシューティング

### よくある問題

1. **localhost:3000 にアクセスできない**
   - `npm run dev:status` でサーバー状態を確認
   - `npm run dev:restart` で再起動

2. **ビルドエラー**
   - `npm run build` でエラー内容を確認
   - TypeScript エラーの場合は型定義を確認

3. **画像が表示されない**
   - Unsplash API の制限による404エラー
   - 機能に影響はありませんが、実運用時は独自の画像を使用

4. **モバイルメニューが動作しない**
   - ブラウザのキャッシュをクリア
   - 開発サーバーを再起動

### パフォーマンス最適化

- `.next` フォルダの定期的なクリア
- 不要なコンソールログの削除
- 画像の最適化（実運用時）

---

## Next.js について

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

### Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

### Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.