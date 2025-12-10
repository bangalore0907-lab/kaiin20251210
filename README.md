# 会員管理システム

## プロジェクト概要
- **名前**: 会員管理システム
- **目的**: シンプルな会員情報の管理（会員No、名前）
- **機能**: 
  - 会員一覧表示
  - 会員新規登録
  - 会員情報修正
  - 会員削除

## URL
- **GitHub**: https://github.com/bangalore0907-lab/kaiin20251210
- **デプロイ先**: Render (PostgreSQL)

## API エンドポイント
- `GET /api/members` - 会員一覧取得
- `GET /api/members/:id` - 会員詳細取得
- `POST /api/members` - 会員新規作成
- `PUT /api/members/:id` - 会員情報更新
- `DELETE /api/members/:id` - 会員削除

## データ構造
- **テーブル**: members
  - `id` - 主キー（自動採番）
  - `member_no` - 会員No（ユニーク）VARCHAR(255)
  - `name` - 名前 VARCHAR(255)
  - `created_at` - 作成日時 TIMESTAMP
  - `updated_at` - 更新日時 TIMESTAMP

- **データベース**: PostgreSQL (Render)

## 使用方法

### 会員一覧画面
1. トップページにアクセスすると、登録済みの会員一覧が表示されます
2. 「新規登録」ボタンをクリックして新規登録画面に移動できます
3. 各会員の行には「修正」と「削除」ボタンがあります

### 新規登録
1. 一覧画面から「新規登録」ボタンをクリック
2. 会員Noと名前を入力
3. 「登録」ボタンをクリックして登録完了
4. 登録後、自動的に一覧画面に戻ります

### 情報修正
1. 一覧画面から修正したい会員の「修正」ボタンをクリック
2. 会員Noと名前を編集
3. 「更新」ボタンをクリックして更新完了
4. 更新後、自動的に一覧画面に戻ります

### 削除
1. 一覧画面から削除したい会員の「削除」ボタンをクリック
2. 確認ダイアログが表示されるので「OK」をクリック
3. 会員が削除され、一覧が更新されます

## 技術スタック
- **バックエンド**: Hono + Node.js
- **フロントエンド**: Vanilla JavaScript
- **データベース**: PostgreSQL
- **スタイル**: カスタムCSS
- **デプロイ**: Render

## 開発環境セットアップ

### 必要な環境
- Node.js 18以上
- npm
- PostgreSQL（本番環境ではRenderが提供）

### インストールと起動
```bash
# 依存関係のインストール
npm install

# 環境変数の設定
cp .env.example .env
# .envファイルを編集してDATABASE_URLを設定

# データベースマイグレーション
npm run db:migrate

# テストデータの投入
npm run db:seed

# 開発サーバー起動
npm run dev

# または本番モード
npm start
```

### 環境変数
`.env`ファイルに以下を設定：
```
DATABASE_URL=postgresql://username:password@localhost:5432/webapp
PORT=3000
NODE_ENV=development
```

## Renderへのデプロイ

### 前提条件
1. Renderアカウントの作成
2. GitHubリポジトリとの連携

### デプロイ手順
1. Renderダッシュボードで「New +」→「Blueprint」を選択
2. GitHubリポジトリ（kaiin20251210）を接続
3. `render.yaml`が自動検出されます
4. 以下が自動作成されます：
   - Web Service: webapp
   - PostgreSQL Database: webapp-db
5. デプロイ完了後、自動的にマイグレーションを実行：
   ```bash
   # Renderのシェルから実行
   npm run db:migrate
   npm run db:seed
   ```

### Render設定の確認
- `render.yaml`にサービス設定が記述されています
- データベース接続は環境変数`DATABASE_URL`で自動設定されます
- 無料プランで動作します

## プロジェクト構成
```
webapp/
├── src/
│   ├── server.js       # メインサーバーファイル（Hono + Node.js）
│   └── db.js           # PostgreSQL接続設定
├── scripts/
│   ├── migrate.js      # データベースマイグレーション
│   └── seed.js         # テストデータ投入
├── public/
│   └── static/
│       ├── style.css   # スタイルシート
│       ├── app.js      # 一覧画面のJavaScript
│       ├── new.js      # 新規登録画面のJavaScript
│       └── edit.js     # 修正画面のJavaScript
├── render.yaml         # Renderデプロイ設定
├── .env.example        # 環境変数テンプレート
├── package.json        # 依存関係とスクリプト
└── README.md           # このファイル
```

## データベース操作
```bash
# マイグレーション実行
npm run db:migrate

# テストデータ投入
npm run db:seed
```

## デプロイ状況
- **プラットフォーム**: Render
- **データベース**: PostgreSQL (Render提供)
- **ステータス**: 準備完了（デプロイ待ち）
- **最終更新**: 2025-12-10

## 完了済み機能
- ✅ 会員一覧表示機能
- ✅ 会員新規登録機能
- ✅ 会員情報修正機能
- ✅ 会員削除機能
- ✅ PostgreSQL対応
- ✅ RESTful API実装
- ✅ Render対応（render.yaml）
- ✅ データベースマイグレーション・シード機能

## 今後の拡張案
- ログイン機能の追加
- 会員の詳細情報項目追加（電話番号、メールアドレスなど）
- 検索・フィルター機能
- ページネーション
- CSVエクスポート機能
- 会員統計ダッシュボード

## トラブルシューティング

### データベース接続エラー
- `DATABASE_URL`が正しく設定されているか確認
- PostgreSQLサーバーが起動しているか確認
- Renderの場合、データベースが正常に作成されているか確認

### ポート競合
```bash
# ポート3000をクリーンアップ
npm run clean-port
```

### マイグレーションエラー
- データベース接続を確認
- `scripts/migrate.js`のSQL文法を確認
- PostgreSQLのバージョン互換性を確認
