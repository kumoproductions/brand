# AGENTS.md

## Languages

- コードコメントは英語で書く。
- 回答は日本語で行う。

## 作業開始前に確認すること

- ライブラリやパッケージを使うことで簡潔に実装できないか。
- 各ライブラリの最新の仕様・機能を確認し、できるだけ新機能を使う。
- 最小変更 < クリーンな設計、最小差分 < 小さいコードベース。
- 後方互換性は、既存ユーザーがいる場合のみ検討する。いない場合は互換維持のコードを書かず、フォールバックも設けず、正常系に集中する。

## 作業終了後にすること

- lint / format / typecheck を必ず実行し、すべて解決する。
- コード内のコメントをクリーンアップし、必要なものだけ簡潔に英語で残す。残すのは特殊な設計判断・TODO・FIXME など、後で確認するべきもののみ。
- より一貫性・可読性が高まる、ロジックがまとまるリファクタリングがあれば提案する。

## Error Handling

- 正常系を重視し、想定外の状態は必ず throw する。サイレント失敗（空の catch、console.error のみで終了）は禁止。
- 下層（repository / usecase / domain）は HTTP を知らない。失敗は AppError（推奨）または Error を throw する。
- 例外 → HTTP レスポンスの変換は一箇所（Hono の onError）だけで行う。ルート内での `return c.json({ error })` は基本禁止。
- エラーレスポンスは常に `{ error: string }`。内部情報は `cause` に載せ、レスポンスには含めない。
- 成功レスポンスにエンベロープ（`ok: true` 等）は使わない。ただしトップレベルに配列を直接返すことは禁止し、必ずオブジェクトでラップする（例: `{ items: [...] }`）。将来のメタ情報追加を破壊的変更なく行えるようにするため。

## コード分割

- 500 行を超えるファイルは分割する。分割で見通しが悪くなる場合は相談する。

## 相談・確認

- 修正が難しい場合や設計に疑問がある場合は、進める前に相談する。
- DB のマイグレーションや破壊的な書き込み操作は、明示的な許可なく行わない。

---

## プロジェクト固有ルール（@kumoproductions/branding）

- このリポジトリは kumo.productions™ のブランドアセット置き場 + ブランドポータル（brand.kumo.productions）。
- `apps/web` が Astro 製ポータル。ガイドライン本文は `src/components/sections/*.astro`（原本 `design/kumo-brand-guideline.dc.html` のテキストを、クラスベースのレイアウトシステム — `src/styles/global.css` + SectionHeader/Figure/AssetCard — に再実装したもの）。本文・数値は原本と等価を維持し、勝手に文言を変更しない。ただしオーナー指示（2026-08-12）により、原本PDF由来の言及は削除済み: P.xx ページ参照、Corrections セクション、「Based on」表記、EXT.01/02 バッジ（すべてサイドバーと揃えたセクション番号 01–12 に統一）。等価チェック時はこれらを除外して判断する。
- `apps/web/public/` 配下（assets/svg, fig-svg, components, tokens, styles.css）はデザインシステムの成果物。ロゴ・図版 SVG のパスデータは編集禁止（差し替えは claude.ai/design プロジェクト側で行い再インポートする）。
- UI コンポーネントデモ（public/components/**）は CDN React + babel-standalone による iframe 単体動作。ビルドに組み込まない。
- デザイントークンの正は `public/tokens/*.css`。ダークモードは `<html data-theme="dark">` で切り替え、ロゴ画像は `.invert-on-dark` で反転する。
- ルートの `banner/ favicon/ icon/ logotype/ sphere/ typestyle/` は配布用アセット（従来どおり）。`pnpm assets:build` でラスタライズ、`pnpm assets:deploy` で R2 同期。
- ブランド規定: ハイライト色は Sky blue #64ADD4 / Night sky blue #1E4B6B のみ。Night sky blue を黒地に置かない。ロゴの変形・回転・アウトライン化・規定外配色は禁止。
- Web フォントは実フォントを self-host（`public/fonts/` の PP Object Sans / Inter Variable — git/kumoproductions と同一構成、`public/fonts.css` で宣言）。見出し=PP Object Sans、本文EN=Inter、JA=M PLUS 1p、mono=IBM Plex Mono。PP Object Sans は ™ をキャップハイトで描くため、見出しでは `<span class="tm">™</span>` で縮小する。
- アセットの実用機能: `data-copy`（テキストコピー）/ `data-copy-src`（URL 先の内容をコピー）属性 + Layout の委譲ハンドラで動く。ダウンロードは同一オリジンの `<a download>`。
