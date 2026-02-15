# 本プロジェクトについて

本プロジェクトは、アイテムをストレージに格納していくことで、何をどこに収納しているかをしっかり管理できるようなWebアプリケーションです。
現在の技術スキタックは Solid Startを ベースとし、Park UIをUIコンポーネントとしています。
テストライブラリとして、@solidjs/testing-libraryを採用しています。データベースのスキーマ管理として drizzle を使用しています。

## パッケージマネージャー

本プロジェクトでは **Bun** を使用する。`npm` ではなく `bun` コマンドを使うこと。

- パッケージインストール: `bun install`
- スクリプト実行: `bun <script名>` （例: `bun prepare`, `bun dev`）
- パッケージ追加: `bun add <パッケージ名>` / `bun add -D <パッケージ名>`

## 重要: ドキュメントの更新について

ユーザーから新しい情報（プロジェクトの規約、ツールの使い方、開発方針など）を教えてもらった場合は、必ず CLAUDE.md に追記すること。これにより、次回以降のセッションでも同じ情報を参照できるようにする。

## 開発フロー

### 機能開発におけるフロー

1. タスクの洗い出しを行う
2. 洗い出したタスクをVibe-Kanbanに登録する
3. そのタスクを実装する際、テストを先に書いて、それを満たすコードを実装する
4. テストが通ったら、そのタスクを完了にする
5. そこまでの変更をjjを使ってChangeとしてまとめる

上記のイテレーションを繰り返してください。

## Park UI コンポーネントの導入について

新しいUIコンポーネントが必要になった場合、自作する前に必ず Park UI の公式サイトで提供されているか確認すること。
Park UI は Solid.js 版のコンポーネントを全て提供している。

### 確認方法

`https://park-ui.com/docs/components/{コンポーネント名}` にアクセスして、該当コンポーネントが存在するか確認する。
（例: Dialog → `https://park-ui.com/docs/components/dialog`）

### 取得方法

Park UI に存在する場合は、以下のコマンドで取得する:

```bash
bunx @park-ui/cli add <コンポーネント名>
```

（例: `bunx @park-ui/cli add dialog`）

Park UI に存在しない場合のみ自作する。

## コード分離（scaffdog）

新しい機能を追加する際は、scaffdog を使って関心事が分離されたファイル構成を生成すること。

### 生成コマンド

```bash
bunx scaffdog generate feature
```

### 生成されるファイル構成

```
src/features/{機能名}/
├── types.ts          # 型定義、入力型、フォームパーサー
├── handlers.ts       # サーバー関数（"use server"）、CRUD操作
├── hooks.ts          # createAsync、useSubmission、派生状態
├── {Name}List.tsx    # 一覧コンポーネント（テーブル＋削除ダイアログ）
├── {Name}Form.tsx    # フォームコンポーネント（作成/編集）
└── {Name}Detail.tsx  # 詳細コンポーネント
```

### ルートファイルの書き方

ルートファイル（`src/routes/`）はシンラッパーとして、features からインポートする:

```tsx
import { useItemList } from "~/features/item/hooks";
import { ItemList } from "~/features/item/ItemList";

export default function ItemListPage() {
  const { items } = useItemList();
  return <ItemList items={items} />;
}
```

### 既存コードのリファクタリング

既存の混在ファイルを分離する場合は、`code-separator` SubAgent を使用できる。

### scaffdog の設定

- 設定ファイル: `.scaffdog/config.ts`
- テンプレートデリミタ: `<% %>` （JSX の `{{ }}` との衝突を回避）
- テンプレート: `.scaffdog/feature.md`
