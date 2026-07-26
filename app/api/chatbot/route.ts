import { NextResponse } from 'next/server';
import { getSiteKnowledge } from '@/lib/chatbot-knowledge';
import { getCatalogData, searchCatalog, type SearchResult } from '@/lib/search';
import { getClientIp, isRateLimited } from '@/lib/rate-limit';

export const runtime = 'nodejs';

type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
};

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 1200;

function isValidMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== 'object') return false;
  const message = value as Record<string, unknown>;
  return (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
    && message.content.trim().length > 0;
}

const searchTool = {
  type: 'function' as const,
  function: {
    name: 'search_catalog',
    description: 'Cari produk alat baking atau kelas kursus di situs berdasarkan kata kunci (nama, kategori, atau topik).',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Kata kunci pencarian, misalnya nama produk atau topik kelas.' },
      },
      required: ['query'],
    },
  },
};

async function callDeepSeek(messages: unknown[], includeTools: boolean) {
  return fetch('https://api.deepseek.com/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'deepseek-v4-flash',
      messages,
      temperature: 0.3,
      max_tokens: 500,
      stream: false,
      ...(includeTools ? { tools: [searchTool], tool_choice: 'auto' } : {}),
    }),
  });
}

export async function POST(request: Request) {
  if (isRateLimited(`chatbot:${getClientIp(request)}`, 10, 60_000)) {
    return NextResponse.json({ error: 'Terlalu banyak pesan. Coba lagi sebentar lagi ya.' }, { status: 429 });
  }

  if (!process.env.DEEPSEEK_API_KEY) {
    return NextResponse.json({ error: 'Layanan chat belum dikonfigurasi.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const rawMessages: unknown[] = Array.isArray(body.messages) ? body.messages : [];
    const messages = rawMessages
      .filter(isValidMessage)
      .slice(-MAX_MESSAGES)
      .map((message) => ({ role: message.role, content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH) }));

    if (!messages.length || !messages.some((message) => message.role === 'user')) {
      return NextResponse.json({ error: 'Pesan tidak valid.' }, { status: 400 });
    }

    const pagePath = typeof body.pagePath === 'string' ? body.pagePath.slice(0, 200) : 'tidak diketahui';
    const knowledge = await getSiteKnowledge();
    const systemPrompt = `
Anda adalah Lina, sahabat dapur virtual dari Cece Lina Chang. Jawab dalam bahasa Indonesia yang hangat, lembut, dan akrab seperti Cece sedang membantu pengunjung di dapurnya sendiri. Gunakan sapaan natural seperti "Hai", "boleh banget", "tenang ya", atau "senang bisa bantu", tetapi tetap ringkas dan jangan berlebihan memakai emoji (maksimal satu emoji jika cocok).

Gunakan HANYA informasi situs di bawah untuk fakta tentang bisnis, kursus, produk, harga, pengiriman, dan kontak. Jika informasi tidak tersedia atau pertanyaan membutuhkan konfirmasi (stok, pembayaran, status pesanan, akses kelas, keluhan, perubahan harga), katakan dengan jujur bahwa admin WhatsApp perlu mengonfirmasi. Jangan membuat janji, kebijakan, diskon, atau detail pribadi.

Jika pengunjung menanyakan produk atau kelas tertentu, gunakan tool search_catalog untuk mencarikan hasil yang relevan sebelum menjawab.

Jika pengguna ingin membeli, mendaftar, meminta tindak lanjut, atau masalahnya tidak dapat Anda selesaikan, ajak mereka menggunakan tombol WhatsApp atau formulir "Minta dihubungi". Jangan meminta data sensitif seperti kata sandi, nomor kartu, OTP, atau alamat lengkap di chat.

Halaman yang sedang dilihat pengunjung: ${pagePath}

PENGETAHUAN SITUS:
${knowledge}`;

    const conversation: unknown[] = [{ role: 'system', content: systemPrompt }, ...messages];

    let response = await callDeepSeek(conversation, true);
    if (!response.ok) {
      console.error('DeepSeek chat error:', response.status, await response.text());
      return NextResponse.json({ error: 'Maaf, chat sedang tidak tersedia. Silakan hubungi admin WhatsApp.' }, { status: 502 });
    }

    let result = await response.json();
    let assistantMessage = result?.choices?.[0]?.message;
    let results: SearchResult[] | undefined;

    const toolCall = assistantMessage?.tool_calls?.[0];
    if (toolCall?.function?.name === 'search_catalog') {
      let query = '';
      try {
        query = JSON.parse(toolCall.function.arguments || '{}').query || '';
      } catch {
        query = '';
      }

      const catalog = await getCatalogData();
      results = searchCatalog(query, catalog).slice(0, 6);

      conversation.push(assistantMessage);
      conversation.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(results),
      });

      response = await callDeepSeek(conversation, false);
      if (!response.ok) {
        console.error('DeepSeek follow-up error:', response.status, await response.text());
        return NextResponse.json({ error: 'Maaf, chat sedang tidak tersedia. Silakan hubungi admin WhatsApp.' }, { status: 502 });
      }
      result = await response.json();
      assistantMessage = result?.choices?.[0]?.message;
    }

    const reply = assistantMessage?.content;
    if (typeof reply !== 'string' || !reply.trim()) {
      return NextResponse.json({ error: 'Maaf, saya belum bisa menjawab saat ini.' }, { status: 502 });
    }

    return NextResponse.json({ reply: reply.trim(), ...(results?.length ? { results } : {}) });
  } catch (error) {
    console.error('Chatbot request error:', error);
    return NextResponse.json({ error: 'Maaf, terjadi kendala pada chat. Silakan coba lagi atau hubungi admin WhatsApp.' }, { status: 500 });
  }
}
