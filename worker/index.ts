import { initWasm, Resvg } from '@resvg/resvg-wasm';
import resvgWasm from '@resvg/resvg-wasm/index_bg.wasm';

const MAX_WIDTH = 4096;

// Width and quality snap to presets so the set of distinct (asset, params)
// combinations stays bounded — Images billing counts each unique
// transformation per month.
const WIDTH_STEPS = [
  16, 24, 32, 48, 64, 96, 128, 192, 256, 384, 512, 768, 1024, 1536, 2048, 3072,
  4096,
];

const FORMATS = {
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  jpeg: 'image/jpeg',
} as const;

type FormatKey = keyof typeof FORMATS;

// content/<category>/svg/ is the source of truth for every raster served here.
// Stems are prefixed by family, so the category is derivable from the name.
const CATEGORY_PREFIXES: Record<string, string> = {
  'logotype-': 'logotype',
  'logosystem-': 'logotype',
  'icon-': 'icon',
  'sphere-': 'sphere',
};

// Short stable URLs for embedding; query parameters still override the defaults.
const DIRECT_LINKS: Record<string, { stem: string; width: number }> = {
  '/icon.png': { stem: 'icon-black', width: 512 },
  '/icon-white.png': { stem: 'icon-white', width: 512 },
  '/logotype.png': { stem: 'logotype-primary-tm-black', width: 512 },
  '/logotype-white.png': { stem: 'logotype-primary-tm-white', width: 512 },
};

class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string
  ) {
    super(message);
  }
}

function snap(value: number, steps: number[]): number {
  let best = steps[0];
  for (const step of steps) {
    if (Math.abs(step - value) < Math.abs(best - value)) best = step;
  }
  return best;
}

function intParam(url: URL, name: string, max: number): number | undefined {
  const raw = url.searchParams.get(name);
  if (raw === null) return undefined;
  const value = Number.parseInt(raw, 10);
  if (!Number.isInteger(value) || value < 1 || value > max) {
    throw new HttpError(400, `${name} must be an integer between 1 and ${max}`);
  }
  return value;
}

interface ImageRequest {
  stem: string;
  format: FormatKey;
  width: number | undefined;
  quality: number | undefined;
  background: string | undefined;
}

function parseRequest(url: URL): ImageRequest {
  const direct = DIRECT_LINKS[url.pathname];
  const match = url.pathname.match(/^\/i\/([a-z0-9-]+)\.([a-z]+)$/);
  // Anything else is either a static asset (served before the worker runs) or
  // genuinely absent.
  if (!direct && !match) throw new HttpError(404, 'not found');

  const extension = match?.[2];
  if (extension === 'svg') {
    throw new HttpError(400, 'svg is the source and is served from /content/');
  }

  const formatKey =
    url.searchParams.get('f') ??
    (extension === 'jpg' ? 'jpeg' : (extension ?? 'png'));
  if (!(formatKey in FORMATS)) {
    throw new HttpError(
      400,
      `f must be one of: ${Object.keys(FORMATS).join(', ')}`
    );
  }

  const background = url.searchParams.get('bg') ?? undefined;
  if (
    background !== undefined &&
    !/^[0-9a-f]{3}$|^[0-9a-f]{6}$/.test(background)
  ) {
    throw new HttpError(
      400,
      'bg must be a hex color without "#", e.g. bg=64add4'
    );
  }

  const width = intParam(url, 'w', MAX_WIDTH);
  const quality = intParam(url, 'q', 100);

  return {
    stem: direct?.stem ?? (match?.[1] as string),
    format: formatKey as FormatKey,
    width: width === undefined ? direct?.width : snap(width, WIDTH_STEPS),
    quality:
      quality === undefined
        ? undefined
        : snap(quality, [50, 60, 70, 80, 90, 100]),
    background,
  };
}

async function loadSvg(
  env: Env,
  origin: string,
  stem: string
): Promise<string> {
  const prefix = Object.keys(CATEGORY_PREFIXES).find((key) =>
    stem.startsWith(key)
  );
  if (!prefix) throw new HttpError(404, `unknown asset: ${stem}`);

  const source = await env.ASSETS.fetch(
    new URL(`/content/${CATEGORY_PREFIXES[prefix]}/svg/${stem}.svg`, origin)
  );
  if (!source.ok) throw new HttpError(404, `unknown asset: ${stem}`);

  const svg = await source.text();
  if (!svg.includes('<svg')) {
    throw new HttpError(404, `unknown asset: ${stem}`);
  }
  return svg;
}

// Paints a full-bleed background behind the artwork. Required for formats
// without an alpha channel, where transparent would otherwise flatten to black.
function withBackground(svg: string, background: string): string {
  const viewBox = svg.match(
    /viewBox=["']\s*[\d.eE+-]+[,\s]+[\d.eE+-]+[,\s]+([\d.eE+-]+)[,\s]+([\d.eE+-]+)\s*["']/
  );
  if (!viewBox) throw new Error('source svg has no parsable viewBox');
  const openEnd = svg.indexOf('>', svg.indexOf('<svg')) + 1;
  const closeStart = svg.lastIndexOf('</svg>');
  return `${svg.slice(0, openEnd)}<rect width="${viewBox[1]}" height="${viewBox[2]}" fill="#${background}"/>${svg.slice(openEnd, closeStart)}</svg>`;
}

let resvgReady: Promise<void> | undefined;

async function rasterize(
  svg: string,
  width: number | undefined
): Promise<Uint8Array> {
  resvgReady ??= initWasm(resvgWasm);
  await resvgReady;
  const renderer = new Resvg(
    svg,
    width === undefined ? undefined : { fitTo: { mode: 'width', value: width } }
  );
  return renderer.render().asPng();
}

function canonicalKey(origin: string, image: ImageRequest): Request {
  // Fixed parameter order so equivalent URLs share a single cache entry.
  const url = new URL(`/i/${image.stem}`, origin);
  url.searchParams.set('f', image.format);
  if (image.width !== undefined) {
    url.searchParams.set('w', String(image.width));
  }
  if (image.quality !== undefined) {
    url.searchParams.set('q', String(image.quality));
  }
  if (image.background !== undefined) {
    url.searchParams.set('bg', image.background);
  }
  return new Request(url);
}

async function handle(
  request: Request,
  env: Env,
  ctx: ExecutionContext
): Promise<Response> {
  const url = new URL(request.url);
  const image = parseRequest(url);

  const cacheKey = canonicalKey(url.origin, image);
  const cached = await caches.default.match(cacheKey);
  if (cached) return cached;

  const background =
    image.background ?? (image.format === 'jpeg' ? 'ffffff' : undefined);
  const svg = await loadSvg(env, url.origin, image.stem);
  const png = await rasterize(
    background === undefined ? svg : withBackground(svg, background),
    image.width
  );

  let response: Response;
  if (image.format === 'png' && image.quality === undefined) {
    response = new Response(png, { headers: { 'content-type': 'image/png' } });
  } else {
    const encoded = await env.IMAGES.input(
      new Response(png).body as ReadableStream
    ).output({ format: FORMATS[image.format], quality: image.quality });
    const out = encoded.response();
    response = new Response(out.body, out);
  }

  response.headers.set('cache-control', 'public, max-age=31536000, immutable');
  response.headers.set('x-robots-tag', 'noindex');
  ctx.waitUntil(caches.default.put(cacheKey, response.clone()));
  return response;
}

export default {
  async fetch(request, env, ctx) {
    try {
      return await handle(request, env, ctx);
    } catch (error) {
      if (error instanceof HttpError) {
        return Response.json(
          { error: error.message },
          { status: error.status }
        );
      }
      throw error;
    }
  },
} satisfies ExportedHandler<Env>;
