// Build-time Markdown rendering of the guideline for /llms-full.txt.
//
// The section components are the single source of truth for the guideline
// text, so the Markdown is derived from them: each section is rendered to
// HTML with the experimental Container API, then converted with Turndown
// rules keyed to the layout-system classes (global.css). Editing section
// copy therefore updates llms-full.txt on the next build with no manual sync.
import { experimental_AstroContainer } from 'astro/container';
import TurndownService from 'turndown';

import ColorCombinations from '../components/sections/ColorCombinations.astro';
import ColorStyle from '../components/sections/ColorStyle.astro';
import DesignTokens from '../components/sections/DesignTokens.astro';
import Examples from '../components/sections/Examples.astro';
import LogoSystems from '../components/sections/LogoSystems.astro';
import Logotype from '../components/sections/Logotype.astro';
import Naming from '../components/sections/Naming.astro';
import Overview from '../components/sections/Overview.astro';
import SymbolCentral from '../components/sections/SymbolCentral.astro';
import SymbolIncorrect from '../components/sections/SymbolIncorrect.astro';
import SymbolSystems from '../components/sections/SymbolSystems.astro';
import Typography from '../components/sections/Typography.astro';
import UiComponents from '../components/sections/UiComponents.astro';

export type Lang = 'ja' | 'en';

// Same order as GuidelinePage.astro.
const SECTIONS = [
  Overview,
  Naming,
  SymbolCentral,
  SymbolSystems,
  SymbolIncorrect,
  Logotype,
  Typography,
  LogoSystems,
  ColorStyle,
  ColorCombinations,
  Examples,
  DesignTokens,
  UiComponents,
];

const cls = (node: unknown, name: string): boolean =>
  (node as HTMLElement).classList?.contains(name) ?? false;

// Turndown's DOM (domino) returns array-like, non-iterable NodeLists.
const all = (node: unknown, selector: string): Element[] =>
  Array.from(
    (node as Element).querySelectorAll(selector) as ArrayLike<Element>
  );

const one = (node: unknown, selector: string): Element | null =>
  (node as Element).querySelector(selector);

// textContent drops <br> without a separator, gluing adjacent lines together.
const flatText = (node: Node | null | undefined, br: string): string => {
  if (!node) return '';
  if (node.nodeName.toUpperCase() === 'BR') return br;
  if (node.nodeType === 3) return node.nodeValue ?? '';
  return Array.from(node.childNodes as ArrayLike<Node>)
    .map((child) => flatText(child, br))
    .join('');
};

const text = (node: Element | null | undefined, br = ' '): string =>
  flatText(node, br).replace(/\s+/g, ' ').trim();

const cell = (value: string): string => value.replaceAll('|', '\\|');

const block = (body: string): string => `\n\n${body}\n\n`;

const quote = (body: string): string =>
  block(
    body
      .trim()
      .split('\n')
      .map((line) => `> ${line}`.trimEnd())
      .join('\n')
  );

function createTurndown(): TurndownService {
  const service = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced',
    bulletListMarker: '-',
    hr: '---',
  });

  // Interactive and purely visual elements carry no text worth keeping:
  // copy buttons, inline SVG ornaments, glyph specimens, decorative chips.
  service.addRule('drop', {
    filter: (node) =>
      ['BUTTON', 'SVG', 'STYLE', 'SCRIPT', 'IFRAME'].includes(
        node.nodeName.toUpperCase()
      ) ||
      node.getAttribute?.('aria-hidden') === 'true' ||
      cls(node, 'specimen') ||
      cls(node, 'tok-chip') ||
      cls(node, 'swatch-chip'),
    replacement: () => '',
  });

  // <br> inside headings would otherwise split the atx line.
  service.addRule('heading', {
    filter: ['h1', 'h2', 'h3', 'h4'],
    replacement: (_content, node) => {
      const level = Number(node.nodeName.charAt(1));
      return block(`${'#'.repeat(level)} ${text(node as Element)}`);
    },
  });

  service.addRule('inline-code', {
    filter: (node) => cls(node, 'hl') || cls(node, 'inline-code'),
    replacement: (_content, node) => `\`${text(node as Element)}\``,
  });

  service.addRule('meta-bar', {
    filter: (node) => cls(node, 'meta-bar'),
    replacement: (_content, node) => {
      const spans = all(node, 'span').map((span) => text(span));
      return block(`*${spans.filter(Boolean).join(' — ')}*`);
    },
  });

  service.addRule('hero-meta', {
    filter: (node) => cls(node, 'hero-meta'),
    replacement: (_content, node) => {
      const pairs = all(node, 'div').map(
        (item) => `${text(one(item, 'dt'))}: ${text(one(item, 'dd'))}`
      );
      return block(`*${pairs.join(' · ')}*`);
    },
  });

  service.addRule('toc-row', {
    filter: (node) => cls(node, 'toc-row'),
    replacement: (_content, node) => {
      const label = text(one(node, 'span'));
      const page = text(one(node, '.toc-page'));
      return `\n- ${page}. ${label}`;
    },
  });

  service.addRule('section-title', {
    filter: (node) => cls(node, 's-title-row'),
    replacement: (_content, node) => {
      const page = text(one(node, '.page-badge'));
      const title = text(one(node, '.s-title'));
      const sub = text(one(node, '.s-sub'));
      return block(
        `## ${page ? `${page}. ` : ''}${title}${sub ? `\n\n**${sub}**` : ''}`
      );
    },
  });

  service.addRule('kicker', {
    filter: (node) => cls(node, 'kicker'),
    replacement: (content) => block(`*${content.trim()}*`),
  });

  service.addRule('section-sub', {
    filter: (node) => cls(node, 's-sub'),
    replacement: (_content, node) => block(`**${text(node as Element)}**`),
  });

  service.addRule('block-label', {
    filter: (node) => cls(node, 'block-label'),
    replacement: (_content, node) => block(`### ${text(node as Element)}`),
  });

  service.addRule('note-label', {
    filter: (node) => cls(node, 'note-label'),
    replacement: (_content, node) => block(`**${text(node as Element)}**`),
  });

  service.addRule('note', {
    filter: (node) => cls(node, 'note'),
    replacement: (content) => quote(content),
  });

  // Do/Don't lists: `term` — note. The cap-num span is dropped inside
  // <ol> items where Markdown numbering already provides it.
  service.addRule('dodont-head', {
    filter: (node) => cls(node, 'dodont-head'),
    replacement: (_content, node) => block(`**${text(node as Element)}**`),
  });

  service.addRule('dd-term', {
    filter: (node) => cls(node, 'dd-term'),
    replacement: (_content, node) => {
      const copy = (node as Element).cloneNode(true) as Element;
      for (const num of all(copy, '.cap-num')) {
        num.parentNode?.removeChild(num);
      }
      return `\`${text(copy)}\``;
    },
  });

  service.addRule('dd-note', {
    filter: (node) => cls(node, 'dd-note'),
    replacement: (_content, node) => ` — ${text(node as Element)}`,
  });

  service.addRule('rule-row', {
    filter: (node) => cls(node, 'rule'),
    replacement: (_content, node) => {
      const term = text(one(node, '.rule-term'));
      const desc = text(one(node, '.rule-desc'));
      return `\n- **${term}** ${desc}`;
    },
  });

  service.addRule('figure', {
    filter: (node) => cls(node, 'fig'),
    replacement: (_content, node) => {
      const img = one(node, 'img');
      const cap = one(node, '.fig-cap');
      const parts = ['.cap-mono', '.cap-title', '.cap-mono-sub', '.cap-ja']
        .map((selector) => text(one(cap ?? node, selector)))
        .filter(Boolean);
      const caption = parts.length > 0 ? parts.join(' — ') : text(cap);
      const image = img
        ? `![${img.getAttribute('alt') ?? ''}](${img.getAttribute('src') ?? ''})`
        : '';
      return block(
        [image, caption && `*${caption}*`].filter(Boolean).join('\n')
      );
    },
  });

  service.addRule('asset-card', {
    filter: (node) => cls(node, 'asset-card'),
    replacement: (_content, node) => {
      const img = one(node, 'img');
      const src = img?.getAttribute('src') ?? '';
      const label = text(one(node, '.asset-label'));
      const downloads = all(node, '.asset-actions a')
        .map((anchor) => anchor.getAttribute('href') ?? '')
        .filter(Boolean);
      const lines = [
        img && `![${img.getAttribute('alt') ?? ''}](${src})`,
        label && `*${label}* — ${downloads.join(' · ')}`,
      ];
      return block(lines.filter(Boolean).join('\n'));
    },
  });

  // Chip rows of shipped files (favicons, type styles): one download link
  // per line, with the decorative arrow and byte size stripped.
  service.addRule('file-list', {
    filter: (node) => cls(node, 'file-list'),
    replacement: (_content, node) =>
      block(
        all(node, 'a')
          .map((anchor) => {
            const copy = anchor.cloneNode(true) as Element;
            for (const size of all(copy, '.chip-size')) {
              size.parentNode?.removeChild(size);
            }
            const label = text(copy).replace(/\s*↓$/, '');
            return `- [${label}](${anchor.getAttribute('href') ?? ''})`;
          })
          .join('\n')
      ),
  });

  service.addRule('swatch', {
    filter: (node) => cls(node, 'swatch'),
    replacement: (_content, node) => {
      const group = text(one(node, '.swatch-group'));
      const name = text(one(node, '.swatch-name'));
      const codes = text(one(node, '.swatch-codes'), ' · ');
      return `\n- **${name}** (${group}) — ${codes}`;
    },
  });

  service.addRule('tok-table', {
    filter: (node) => cls(node, 'tok-table'),
    replacement: (_content, node) => {
      const rows = all(node, '.tok-row').map(
        (row) =>
          `| \`${cell(text(one(row, '.tok-name')))}\` | ${cell(
            text(one(row, '.tok-src'))
          )} | ${cell(text(one(row, '.tok-use')))} |`
      );
      return block(
        ['| Token | Source | Usage |', '| --- | --- | --- |', ...rows].join(
          '\n'
        )
      );
    },
  });

  service.addRule('type-row', {
    filter: (node) => cls(node, 'type-row'),
    replacement: (_content, node) => {
      const role = text(one(node, '.type-role'));
      const name = text(one(node, '.type-name'));
      const sub = text(one(node, '.type-sub'));
      return `\n- **${role}** — ${name}${sub ? ` (${sub})` : ''}`;
    },
  });

  service.addRule('mini-item', {
    filter: (node) => cls(node, 'mini-item'),
    replacement: (_content, node) => `\n- \`${text(node as Element)}\``,
  });

  service.addRule('demo', {
    filter: (node) => cls(node, 'demo'),
    replacement: (_content, node) => {
      const title = text(one(node, '.demo-title'));
      const path = text(one(node, '.demo-path'));
      const src = one(node, 'iframe')?.getAttribute('src') ?? '';
      return `\n- **${title || path}** — live demo: ${src}`;
    },
  });

  service.addRule('transcript-summary', {
    filter: ['summary'],
    replacement: (_content, node) => block(`**${text(node as Element)}**`),
  });

  service.addRule('details', {
    filter: ['details'],
    replacement: (content) => block(content.trim()),
  });

  return service;
}

export async function renderGuidelineMarkdown(
  lang: Lang,
  site: URL
): Promise<string> {
  const container = await experimental_AstroContainer.create();
  const turndown = createTurndown();
  const parts = await Promise.all(
    SECTIONS.map(async (Section) => {
      const html = await container.renderToString(Section, {
        props: { lang },
        partial: true,
      });
      // Root-relative URLs must survive as absolute links in a plain-text file.
      const absolute = html.replaceAll(
        /(src|href)="\/(?!\/)/g,
        `$1="${site.origin}/`
      );
      // Token names like `--space-1` are data, not list syntax — undo the escape.
      return turndown.turndown(absolute).replaceAll('\\--', '--').trim();
    })
  );
  return parts.join('\n\n---\n\n');
}
