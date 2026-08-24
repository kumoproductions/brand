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

## Development

- dev サーバーはバックグラウンドモードで起動する: `astro dev --background`（管理: `astro dev stop` / `status` / `logs`）。portless 経由は `pnpm dev`（https://brand.kumo.localhost）。
- Astro のドキュメント: https://docs.astro.build （ルーティング・コンポーネント・スタイリング・i18n 等は作業前に該当ガイドを確認する）。

## プロジェクト固有ルール（@kumoproductions/branding）

- このリポジトリは kumo.productions™ のブランドアセット置き場 + ブランドポータル（brand.kumo.productions）。単一パッケージ構成: `src/`（Astro ポータル）、`content/`（配布アセットの正）、`worker/`（画像生成 Worker）、`public/`（サイト静的ファイル）、`scripts/`（ビルド時のアセット収集）、`design/`（デザインソース）。
- ガイドライン本文は `src/components/sections/*.astro`（原本 `design/kumo-brand-guideline.dc.html` のテキストを、クラスベースのレイアウトシステム — `src/styles/global.css` + SectionHeader/Figure/AssetCard — に再実装したもの）。日本語本文が正で、原本と等価を維持し、勝手に文言を変更しない。ただしオーナー指示（2026-08-12）により、原本PDF由来の言及は削除済み: P.xx ページ参照、Corrections セクション、「Based on」表記、EXT.01/02 バッジ（すべてサイドバーと揃えた連番セクション番号に統一 — 2026-08-23 に「Naming & Notation」を 02 として追加し現在 01–13）。また 2026-08-24 のオーナー指示で、08 Logo Systems 末尾の「Text (v1.0)」note（図版 SVG 内の文言を転記しただけのブロック）を削除済み。等価チェック時はこれらを除外して判断する。
- レイアウトはページ全体で **単一の 12 カラムグリッド**（2026-08-23、オーナー指示）。`body` がトラックを定義し、サイドバー = 列 1–3 / コンテンツ = 列 4–12。`.main` → `.container` → `.section` → 各ブロックはすべて `grid-template-columns: subgrid` で同じ線を受け継ぎ、**トラックを再定義しない**（別グリッドを作らない）。コンテンツ側のスパンは 9 列基準で書く（本文＝列 1–6、3 列並び＝span 3、2 列並びは `--pair-a` / `--pair-b` で列 1–4 / 6–9・中央列をチャネルとして空ける）。幅の制御は `max-width` ではなく列スパンで行う。サイドバーなしの `/assets` のみ `.main` が 12 列全部を取る。ブレークポイントは 1100px（シェル解除）/ 960px（6 列）/ 720px（2 列）で、列数の切替と `--pair-*` の再定義だけで畳む。
- i18n: `/` = 日本語（正）、`/en/` = 英訳。各セクションコンポーネントが `lang` prop を受け、ja/en の文言辞書を同居させる。日本語本文を変更したら英訳も追従させる。
- `public/` 配下（assets/svg, fig-svg, components, tokens, styles.css）はデザインシステムの成果物。ロゴ・図版 SVG のパスデータは編集禁止（差し替えは claude.ai/design プロジェクト側で行い再インポートする）。
- UI コンポーネントデモ（public/components/**）は CDN React + babel-standalone による iframe 単体動作。ビルドに組み込まない。
- デザイントークンの正は `public/tokens/*.css`。ダークモードは `<html data-theme="dark">` で切り替え、ロゴ画像は `.invert-on-dark` で反転する。
- **SVG が唯一の正（SSOT）**。`content/<family>/svg/` にベクタ原本を置き、ラスタはリポジトリに一切保存しない（2026-08-23 に PNG/WebP/JPG 220 ファイルと R2 同期を廃止）。ラスタは `worker/index.ts` が resvg-wasm + Images binding でオンデマンド生成し、エッジにキャッシュする。
- 命名規則: 小文字 kebab-case で `<family>-<variant>[-tm]-<tone>`。variant はガイドラインの語彙に揃える（`primary` / `secondary` / `tertiary` / `abbreviation` / `microspace`。旧 `short` / `micro` は廃止）。`-tm` は ™ 付き、`-black` / `-white` は**見た目のトーン**を指す（`icon-black` は黒地＋白マーク、`icon-white` はその反転）。
- 生成 URL: `/i/<stem>.<png|webp|avif|jpg>?w=&q=&bg=`。`w` はプリセット段（16〜4096）、`q` は 10 刻みにスナップして課金対象の変換数を有界に保つ。`bg` は `#` なし hex で全面背景を敷く（JPEG は alpha がないため既定で白）。
- 直リンク: `/icon.svg` `/icon-white.svg` `/logotype.svg` `/logotype-white.svg` `/sphere.svg` `/banner.jpg` とファビコン一式は `scripts/collect-assets.mjs`（prebuild）が `content/` から `public/` 直下へコピー（gitignore 済み）。`/icon.png` `/icon-white.png` `/logotype.png` `/logotype-white.png` は Worker が 512px で生成する（クエリで上書き可）。`public/content/` へのミラーは prune 付きで、content/ の正確な反映を保つ。
- `content/banner|favicon|typestyle/` はベクタ原本を持たないため実ファイルのまま配布する。
- デプロイ: Cloudflare Workers（`wrangler.jsonc` — static assets + `ASSETS` / `IMAGES` binding、custom domain brand.kumo.productions）。`pnpm deploy`。静的ファイルが先に解決され、該当がないパスだけ Worker に落ちる。
- ブランド規定: ハイライト色は Sky blue #64ADD4 / Night sky blue #1E4B6B のみ。Night sky blue を黒地に置かない。ロゴの変形・回転・アウトライン化・規定外配色は禁止。
- Web フォントは実フォントを self-host（`public/fonts/` の PP Object Sans / Inter Variable — git/kumoproductions と同一構成、`public/fonts.css` で宣言）。見出し=Helvetica Now Display（Web 表示は Helvetica Neue 代替）、本文EN=Inter、JA=BIZ UDPGothic（2026-08-23 に M PLUS 1p から変更）、mono=IBM Plex Mono。PP Object Sans はロゴタイプ専用の書体で、見出し・本文には使用禁止。
- アセットの実用機能: `data-copy`（テキストコピー）/ `data-copy-src`（URL 先の内容をコピー）属性 + Layout の委譲ハンドラで動く。ダウンロードは同一オリジンの `<a download>`。全図版はクリックで Lightbox（`<dialog id="lightbox">`）。
