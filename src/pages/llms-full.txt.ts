import type { APIRoute } from 'astro';

import { buildLlmsFull, requireSite, textResponse } from '../utils/llmsFull';

export const GET: APIRoute = async ({ site }) =>
  textResponse(await buildLlmsFull('ja', requireSite(site)));
