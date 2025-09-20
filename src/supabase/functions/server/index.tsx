import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-e0055e13/health", (c) => {
  return c.json({ status: "ok" });
});

// AI Chat endpoint
app.post("/make-server-e0055e13/chat", async (c) => {
  try {
    const { message, conversationHistory } = await c.req.json();
    
    if (!message || typeof message !== 'string') {
      return c.json({ error: 'Message is required' }, 400);
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      return c.json({ error: 'AI service not configured' }, 500);
    }

    // Prepare conversation context
    let contextPrompt = `Kamu adalah AI companion yang berempati dan mendukung untuk mahasiswa kedokteran dengan skizoafektif. Tugasmu adalah:

1. Mendengarkan dengan empati dan tanpa menghakimi
2. Memberikan dukungan emosional yang hangat
3. Membantu mengelola stress dan anxiety
4. Memberikan perspektif positif yang realistis
5. Mengingatkan tentang coping strategies yang sehat
6. Jika diperlukan, menyarankan untuk mencari bantuan profesional

Sifat komunikasimu:
- Hangat, empati, dan mendukung
- Menggunakan bahasa yang lembut dan tidak overwhelming
- Hindari saran medis spesifik, fokus pada dukungan emosional
- Gunakan bahasa Indonesia yang natural dan ramah
- Validasi perasaan dan pengalaman user
- Berikan hope dan encouragement

`;

    // Add conversation history for context
    if (conversationHistory && Array.isArray(conversationHistory)) {
      contextPrompt += "\nPercakapan sebelumnya:\n";
      conversationHistory.slice(-6).forEach(msg => {
        if (msg.type === 'user') {
          contextPrompt += `User: ${msg.content}\n`;
        } else if (msg.type === 'ai') {
          contextPrompt += `AI: ${msg.content}\n`;
        }
      });
    }

    contextPrompt += `\nPesan user saat ini: ${message}\n\nRespond dengan empati dan dukungan:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: contextPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.8,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!aiResponse) {
      console.error('No response from Gemini API:', data);
      throw new Error('No response generated');
    }

    return c.json({ response: aiResponse });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    return c.json({ 
      error: 'Terjadi kesalahan saat memproses pesan', 
      details: error.message 
    }, 500);
  }
});

// AI Reflection endpoint
app.post("/make-server-e0055e13/reflection", async (c) => {
  try {
    const { journalEntry } = await c.req.json();
    
    if (!journalEntry || !journalEntry.journalText) {
      return c.json({ error: 'Journal entry is required' }, 400);
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('GEMINI_API_KEY not found in environment');
      return c.json({ error: 'AI service not configured' }, 500);
    }

    // Create comprehensive reflection prompt
    const reflectionPrompt = `Kamu adalah AI assistant yang membantu mahasiswa kedokteran dengan skizoafektif untuk melakukan refleksi mendalam atas jurnal hariannya.

Berdasarkan jurnal harian berikut, buatlah refleksi yang:
1. Mengidentifikasi pola positif dan area untuk diperbaiki
2. Memberikan insight tentang kesehatan mental dan progress studi
3. Menyarankan strategi coping yang spesifik
4. Mengakui pencapaian dan kemajuan yang telah dibuat
5. Memberikan encouragement dan motivasi yang realistis

Data Jurnal:
- Jurnal bebas: ${journalEntry.journalText}
- Tantangan: ${journalEntry.challenges || 'Tidak disebutkan'}
- Wellness activities: ${journalEntry.wellness || 'Tidak disebutkan'}
- Hal yang disyukuri: ${journalEntry.gratitude || 'Tidak disebutkan'}
- Tujuan besok: ${journalEntry.goals || 'Tidak disebutkan'}
- Pembelajaran: ${journalEntry.learnings || 'Tidak disebutkan'}
- Mata kuliah: ${journalEntry.studySubjects || 'Tidak disebutkan'}
- Jam tidur: ${journalEntry.sleepHours || 'Tidak disebutkan'} jam
- Kualitas tidur: ${journalEntry.sleepQuality || 'Tidak disebutkan'}/10
- Jam belajar: ${journalEntry.studyHours || 'Tidak disebutkan'} jam

Buatlah refleksi yang empatis, insightful, dan mendukung dalam bahasa Indonesia. Fokus pada:
- Pengenalan pola behavior dan emosi
- Appreciation terhadap effort yang sudah dilakukan
- Gentle suggestions untuk improvement
- Validation terhadap pengalaman dan feelings
- Encouragement untuk continue positive habits

Panjang refleksi sekitar 200-300 kata.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: reflectionPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Gemini API error:', errorData);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const reflection = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!reflection) {
      console.error('No reflection from Gemini API:', data);
      throw new Error('No reflection generated');
    }

    return c.json({ reflection: reflection });

  } catch (error) {
    console.error('Error in reflection endpoint:', error);
    return c.json({ 
      error: 'Terjadi kesalahan saat membuat refleksi', 
      details: error.message 
    }, 500);
  }
});

Deno.serve(app.fetch);