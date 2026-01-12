import dotenv from 'dotenv';

dotenv.config();

const decodeBrevoKey = (v: string) => {
  if (!v) return '';
  try {
    const B: any = (globalThis as any).Buffer;
    if (!B) return v;
    const raw = B.from(v, 'base64').toString('utf8');
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && typeof obj.api_key === 'string' && obj.api_key.startsWith('xkeysib-')) {
      return obj.api_key;
    }
  } catch {}
  return v;
};

export const config = {
  port: process.env.PORT || 3000,
  hotmartToken: process.env.HOTMART_TOKEN || '',
  brevoApiKey: decodeBrevoKey(process.env.BREVO_API_KEY || ''),
  openRouterApiKey: process.env.OPENROUTER_API_KEY || '',
  openRouterModel: process.env.OPENROUTER_MODEL || 'openai/gpt-4o-mini', // Default model
};
