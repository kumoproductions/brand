import { type Lang, renderGuidelineMarkdown } from './guidelineMarkdown';
import { renderResourcesAppendix } from './llmsResources';

export async function buildLlmsFull(lang: Lang, site: URL): Promise<string> {
  const note =
    lang === 'ja'
      ? [
          `> Markdown version of the kumo.productions™ brand guidelines (Japanese — the canonical text), generated at build time from ${site.href}.`,
          `> English version: ${new URL('/en/llms-full.txt', site).href}`,
          `> Design system by Minami Fuji (CARAVAN); extended by Tomoya Eguchi (kumo.productions™).`,
        ]
      : [
          `> Markdown version of the kumo.productions™ brand guidelines (English translation), generated at build time from ${new URL('/en/', site).href}.`,
          `> The Japanese text is canonical: ${new URL('/llms-full.txt', site).href}`,
          `> Design system by Minami Fuji (CARAVAN); extended by Tomoya Eguchi (kumo.productions™).`,
        ];
  const body = await renderGuidelineMarkdown(lang, site);
  const appendix = renderResourcesAppendix(site);
  return `${note.join('\n')}\n\n${body}\n\n---\n\n${appendix}\n`;
}

export function textResponse(body: string): Response {
  return new Response(body, {
    headers: { 'content-type': 'text/plain; charset=utf-8' },
  });
}

export function requireSite(site: URL | undefined): URL {
  if (!site) throw new Error('astro.config `site` must be set');
  return site;
}
