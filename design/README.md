# kumo.productions™ Design System

kumo.productions™ は東京を拠点とする映像制作会社(モーショングラフィックス/3DCG。CM・MV・ライブ演出)。
このプロジェクトは同社の Branding Standards v1.0 を基にしたデザインシステムです。

Source: `uploads/guideline-v1.0.pdf`(Branding Standards v1.0, Creation day: December 24th, 2024)
Web guideline(全文転記・ベクター図版・誤記修正済): `kumo Brand Guideline.dc.html`
個人情報(氏名・連絡先・口座等)は削除し、ダミー表記に置換済み。

## Index

- `styles.css` — グローバルCSSエントリ(@importのみ)
- `tokens/colors.css` / `tokens/typography.css` / `tokens/spacing.css` — トークン定義
- `assets/svg/` — シンボル・ロゴタイプ(PDF由来のベクター、単色 #040000)
- `fig-svg/` — ガイドライン図版(ベクター)
- `svg-pages/` — PDF各ページのベクター中間データ(再切り出し用)
- `components/` — UIコンポーネント(actions / forms / display / navigation / feedback)
- `guidelines/` — ファウンデーション見本カード
- `SKILL.md` — エージェント用スキル定義

## CONTENT FUNDAMENTALS

- ブランド名は常に小文字: `kumo.productions™` / 省略形 `kumo.` / `kumo™`。™ の位置はロゴ形態ごとに規定(アセット参照)。
- 日英併記が基本。EN が主、JA が補足。文体は事実記述・簡潔(マーケ的誇張なし)。
- ラベルは英大文字+モノスペース+レタースペーシング(例: `PRIMARY`, `CREATION DAY`)。
- 絵文字は使わない。装飾より余白。
- 例文: "kumo.productions™ is a video production company based in Tokyo." / "Motion Design and 3D Computer-generated Imagery"

## VISUAL FOUNDATIONS

- **ダークモード**: `<html data-theme="dark">` でセマンティックトークンが反転(地=Space black、文字=Base white、アクセント=Sky blue。Night sky blueは黒地NG)。ソリッド系は --solid / --on-solid を参照。
- **色**: 白ベース(#FFFFFF / #F7F7F7)+黒(#000000 / #1E1E1E)+Cloudiness gray #6A6E71。ハイライトは Sky blue #64ADD4 / Night sky blue #1E4B6B の2色のみ。ハイライトは Cloudiness gray 上に置かない。低コントラスト組み合わせ禁止。セマンティックは tokens/colors.css(--surface-* / --text-* / --accent 等)。
- **タイポ**: EN見出し Helvetica Now Display、本文 Helvetica Now Text、サブ Inter。JA主 TP Tokyo City、JA副 M PLUS 1p。等幅 Gravitica Mono(数値・メタ情報・ラベルに多用)。ロゴタイプのみ Object Sans(組版禁止、アセット使用)。
- **フォント代替(Web)**: Helvetica Now → Helvetica Neue系 / TP Tokyo City → M PLUS 1p / Gravitica Mono → IBM Plex Mono。正規ライセンスフォント(woff2)支給時は tokens/typography.css を差し替えること。
- **背景**: 白 or Cloud white の平面。画像・グラデーション・テクスチャは使わない。ダークは Space black。
- **罫線・影**: 1pxヘアライン(#E9EAEB系)が基本。影はほぼ使わない(--shadow-card は極薄、オーバーレイのみ --shadow-overlay)。
- **角丸**: 小さめ(4/6/10px)。シンボルのパーティクル角丸 R=2a に呼応。ピル形は使わない(--radius-full はスイッチ等の機構部のみ)。
- **余白**: グリッド単位 a=4px 由来のスケール(4〜64px)。密度は低く、編集的な余白を取る。
- **モーション**: 控えめ。150ms / cubic-bezier(0.2,0,0,1)。フェード・小さな位置変化のみ。バウンスなし。
- **ホバー**: 背景をわずかに暗く/明るく(Space black⇄Base black、白⇄Cloud white)。押下はさらに一段。リンクは Night sky blue → Sky blue。
- **フォーカス**: 2px リング rgba(100,173,212,.55)(--focus-ring)。
- **レイアウト**: 左固定サイドバー+本文カラム、上部に細いメタ行、P.番号タグなどドキュメンタリーな添え物。
- **シンボル運用**: グリッド上の正方形パーティクル(一辺 3a+3an, 1≤n≤7 / 角丸2a / 接続R 1.5a)。回転・変形・アウトライン・規定外配色は禁止。45°対角線をレイアウト基準線として使用可。

## ICONOGRAPHY

- ガイドラインに独自アイコンセットの規定なし。名刺では E / P / X の1文字ラベルを連絡先アイコン代わりに使用(この様式を優先)。
- UIでアイコンが必要な場合は暫定で Lucide(CDN, stroke 1.5-2px)を使用し、代替であることを明示。**独自SVGアイコンを描かない。**
- シンボル(雲)はアイコンではなくブランドマーク。`assets/svg/symbol-central.svg` を使用。

## Colors (base palette)

| Role         | Name            | HEX     | RGB         | CMYK         |
| ------------ | --------------- | ------- | ----------- | ------------ |
| Base (White) | Base white      | #FFFFFF | 255 255 255 | 00/00/00/00  |
| Base (White) | Cloud white     | #F7F7F7 | 247 247 247 | 05/05/05/05  |
| Base (Gray)  | Cloudiness gray | #6A6E71 | 106 110 113 | 65/55/50/05  |
| Base (Black) | Space black     | #1E1E1E | 30 30 30    | 85/80/80/60  |
| Base (Black) | Base black      | #000000 | 0 0 0       | 20/20/20/100 |
| Highlight    | Sky blue        | #64ADD4 | 100 173 212 | 60/20/10/00  |
| Highlight    | Night sky blue  | #1E4B6B | 30 75 107   | 90/70/45/10  |

## Components

標準セット(ソース定義がないため自作): actions(Button, IconButton) / forms(Input, Select, Checkbox, Radio, Switch) / display(Card, Badge, Tag, KumoLogo) / navigation(Tabs) / feedback(Dialog, Toast, Tooltip)。
各ディレクトリの `*.card.html` が見本。プロップ契約は `<Name>.d.ts`、使い方は `<Name>.prompt.md`。

### Intentional additions(原典に無い追加)

- `KumoLogo` — ロゴ/シンボルのベクターアセットを正しく配置するためのラッパー。
- 状態色トークン `--success` / `--warning` / `--danger` — UI上の必要から oklch で調和色を追加(ブランド外色。使用は最小限に)。

### 実装メモ

- コンポーネントは React + インラインスタイル + `var(--token)` 参照のみ。npm依存なし。
- 見本カードはCDNのReact/Babel+CJSシムで単体動作(デザインシステムタブ用)。

## v1.0からの修正(Web版・図版内テキストにも適用)

Typoraphy→Typography / Sky bule→Sky blue / Motion Designe→Motion Design / "Mand has been"→"and has been" / 作成日を Dec 24, 2024 に統一 / 目次スペース欠落修正 / 個人情報のダミー化
