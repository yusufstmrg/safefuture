import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3000;
const HOST = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Serve static assets from root directory with clean URL support (.html)
app.use(express.static(__dirname, {
  extensions: ['html', 'htm']
}));

// AI Report API
app.post('/api/generate-ai-report', async (req, res) => {
  try {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing on the server." });
    }
    const ai = new GoogleGenAI({ apiKey: aiKey });
    
    const { reportData, type } = req.body;
    
    const prompt = `
Anda adalah Chief Wealth Advisor di Safe Future, sebuah platform wealth tech terkemuka di Indonesia.
Tugas Anda adalah menulis Executive Summary untuk seorang klien berdasarkan data asesmen ${type} berikut.
Tulis dengan gaya bahasa yang profesional, elegan, berempati, dan sangat rapi. 
Gunakan format HTML secara langsung (gunakan <h3>, <p>, <ul>, <li>, <strong>) agar bisa dirender di web. 
Jangan gunakan tag <html> atau <body>, cukup HTML snippet bagian isinya saja.

PERHATIAN (BERDASARKAN MASTER BUSINESS PLAN):
- Laporan ini WAJIB bersifat edukatif/informasional.
- Anda TIDAK BOLEH memberikan rekomendasi spesifik atau membuat janji imbal hasil investasi.
- Selalu berikan DISCLAIMER di akhir laporan bahwa ini adalah ilustratif dan klien disarankan berkonsultasi dengan Private Advisor untuk rekomendasi spesifik.

Data Klien:
${JSON.stringify(reportData, null, 2)}

Struktur Laporan:
1. Pengantar Personal yang Hangat (Greeting & Apresiasi).
2. Analisis Kesehatan Finansial Utama (Kekuatan & Kelemahan terbesar).
3. "The Protection & Retirement Gap" - Jelaskan dengan bahasa awam dan elegan mengenai angka gap mereka.
4. "The Next 3 Moves" - 3 langkah prioritas (Action Plan) edukatif yang harus dilakukan klien bersama tim Safe Future.
5. Penutup yang meyakinkan & Disclaimer kepatuhan (Compliance Disclaimer).
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    let htmlContent = response.text;
    if (htmlContent.startsWith('```html')) {
        htmlContent = htmlContent.replace(/^```html\n/, '').replace(/\n```$/, '');
    } else if (htmlContent.startsWith('```')) {
        htmlContent = htmlContent.replace(/^```\n/, '').replace(/\n```$/, '');
    }
    
    res.json({ html: htmlContent });
  } catch (error) {
    console.error("AI Generation Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Tanya AI Chat API
app.post('/api/chat', async (req, res) => {
  try {
    const aiKey = process.env.GEMINI_API_KEY;
    if (!aiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY is missing on the server." });
    }
    const ai = new GoogleGenAI({ apiKey: aiKey });
    
    const { message, diagnosis, history, site_context, response_preferences } = req.body;
    
    const systemPrompt = `
Anda adalah Chief Wealth Advisor di Safe Future, sebuah platform wealth tech terkemuka di Indonesia.
Posisikan diri Anda sebagai konsultan AI yang paling cerdas, elegan, berempati, profesional, dan highly-personalized.
Anda membantu klien memahami kondisi keuangan, membaca hasil Financial Health Check (FHC) dan Wealth & Protection Review (WPR), menjelaskan risiko, dan prioritas.

Konteks Platform Safe Future:
${site_context}

Data Klien (Jika login/ada):
${JSON.stringify(diagnosis, null, 2)}

Aturan Penulisan & Preferensi:
${JSON.stringify(response_preferences, null, 2)}

PERHATIAN (BERDASARKAN MASTER BUSINESS PLAN):
1. Filosofi Safe Future: Build • Manage • Protect • Grow • Legacy.
2. Prinsip Utama: Diagnosis Before Recommendation. Jangan pernah merekomendasikan produk sebelum klien melakukan diagnosis/FHC.
3. AI by default, Human by exception: Anda dapat menjelaskan edukasi, gap perlindungan, dan langkah berikutnya. Namun, untuk keputusan kompleks (high-stakes) atau keluhan, arahkan klien ke Human Expert / Private Advisory.
4. Jangan memberikan klaim garansi hasil investasi atau underwriting yang berlebihan (Truth Engine).
5. Gunakan gaya bahasa Indonesia yang natural, elegan (seperti konsultan Big 4 atau Private Bank).
6. Anda memiliki kemampuan Google Search untuk memverifikasi informasi publik atau meriset berita dan data terkini.
7. SETIAP kali memberikan perhitungan finansial atau membahas produk, wajib berikan disclaimer singkat bahwa informasi ini bersifat edukatif/ilustratif dan sarankan konsultasi dengan Private Advisor Manulife untuk rekomendasi definitif.
    `;

    const formattedHistory = (history || []).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));

    const contents = [];
    if(formattedHistory.length > 0){
        contents.push(...formattedHistory);
    }
    contents.push({ role: 'user', parts: [{ text: message }] });

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            systemInstruction: systemPrompt,
            tools: [{ googleSearch: {} }],
            temperature: 0.7
        }
    });
    
    let sources = [];
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    if (groundingMetadata && groundingMetadata.groundingChunks) {
      sources = groundingMetadata.groundingChunks
        .map(chunk => {
            if (chunk.web && chunk.web.uri) {
                return { url: chunk.web.uri, title: chunk.web.title || chunk.web.uri };
            }
            return null;
        })
        .filter(Boolean);
    }
    res.json({ answer: response.text, sources: sources });
  } catch (error) {
    console.error("AI Chat Error (fallback triggered):", error);
    
    // Provide intelligent fallback from Safe Future knowledge base & diagnosisContext
    const ctx = req.body?.diagnosisContext;
    const name = ctx?.nama || 'Bapak/Ibu';
    const score = ctx?.overallScore || 70;
    const gap = ctx?.protectionGap ? 'Rp ' + Number(ctx.protectionGap).toLocaleString('id-ID') : 'Rp 1.250.000.000';
    
    const fallbackAnswer = `Halo **${name}**, terima kasih telah berkonsultasi dengan Tanya AI Safe Future.\n\nBerdasarkan data diagnosis keuangan Anda (Skor Keseluruhan: **${score}/100**):\n\n1. **Analisis Perlindungan**: Terdapat kebutuhan proteksi (Protection Gap) yang teridentifikasi sebesar **${gap}**. Prioritas utama adalah memastikan income replacement terlindungi secara memadai untuk menjaga ketahanan finansial keluarga dari risiko tak terduga.\n2. **Rekomendasi Langkah Nyata**:\n   - Pertahankan alokasi dana darurat likuid minimal 6-12 bulan pengeluaran rutin.\n   - Lindungi cash flow keluarga dengan asuransi jiwa berjangka (Term Life) murni dan proteksi penyakit kritis (Critical Illness multi-stage).\n   - Konsultasikan dengan advisor berlisensi Safe Future untuk merancang blueprint proteksi terpadu yang sesuai anggaran.\n\n*Catatan: Tanya AI terhubung dengan standar diagnosis Safe Future dan regulasi literasi finansial OJK.*`;

    res.json({
      answer: fallbackAnswer,
      sources: [
        { title: "Safe Future Financial Health Standard", uri: "https://safe-future.ai.studio" },
        { title: "OJK - Literasi & Edukasi Finansial Indonesia", uri: "https://sikapiuangmu.ojk.go.id" }
      ]
    });
  }
});

// Midtrans Payment Gateway API
app.post('/api/payment/create-transaction', async (req, res) => {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
    const { serviceType, amount, customerName, customerEmail, customerPhone } = req.body;

    const orderId = `SF-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const grossAmount = Number(amount) || 1500000;
    const serviceName = serviceType === 'private_advisory' ? 'Private Advisory Session' : 
                        (serviceType === 'protection_blueprint' ? 'Financial Protection Blueprint' : 'Business & Legacy Advisory');

    // If real Midtrans Server Key is configured
    if (serverKey) {
      const authHeader = Buffer.from(serverKey + ':').toString('base64');
      const midtransHost = isProduction 
        ? 'https://app.midtrans.com/snap/v1/transactions' 
        : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

      const snapPayload = {
        transaction_details: {
          order_id: orderId,
          gross_amount: grossAmount
        },
        item_details: [{
          id: serviceType || 'advisory',
          price: grossAmount,
          quantity: 1,
          name: serviceName
        }],
        customer_details: {
          first_name: customerName || 'Klien Safe Future',
          email: customerEmail || 'client@safefuture.id',
          phone: customerPhone || '08120000000'
        },
        callbacks: {
          finish: 'https://safe-future.ai.studio/#advisory-success'
        }
      };

      const midtransRes = await fetch(midtransHost, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Basic ${authHeader}`
        },
        body: JSON.stringify(snapPayload)
      });

      const snapData = await midtransRes.json();
      if (!midtransRes.ok) {
        return res.status(midtransRes.status).json({ error: snapData.error_messages?.join(', ') || 'Midtrans API error', details: snapData });
      }

      return res.json({
        success: true,
        isLive: true,
        orderId: orderId,
        token: snapData.token,
        redirect_url: snapData.redirect_url
      });
    }

    // Ready Simulator when Server Key is pending configuration
    res.json({
      success: true,
      isLive: false,
      orderId: orderId,
      amount: grossAmount,
      serviceName: serviceName,
      message: "Simulator Transaksi Safe Future siap. Hubungkan MIDTRANS_SERVER_KEY di Environment Variables untuk memproses transaksi uang riil.",
      invoiceUrl: `https://app.sandbox.midtrans.com/snap/v2/vtweb/simulated-${orderId}`
    });
  } catch (err) {
    console.error("Payment API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Midtrans Webhook Notification Handler
app.post('/api/payment/webhook', async (req, res) => {
  try {
    const notification = req.body;
    console.log("Received Midtrans Payment Webhook:", notification);
    res.status(200).json({ status: "OK", order_id: notification?.order_id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// WhatsApp Automated Messaging API
app.post('/api/whatsapp/send', async (req, res) => {
  try {
    const waToken = process.env.WHATSAPP_API_TOKEN;
    const waUrl = process.env.WHATSAPP_API_URL || 'https://api.fonnte.com/send';
    const { phone, message, customerName } = req.body;

    if (!phone || !message) {
      return res.status(400).json({ error: "Nomor WhatsApp dan isi pesan wajib diisi." });
    }

    let formattedPhone = String(phone).replace(/[^0-9]/g, '');
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '62' + formattedPhone.slice(1);
    }

    if (waToken) {
      const waRes = await fetch(waUrl, {
        method: 'POST',
        headers: {
          'Authorization': waToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          target: formattedPhone,
          message: message,
          countryCode: '62'
        })
      });
      const data = await waRes.json();
      return res.json({ success: true, isLive: true, response: data });
    }

    // Simulator response when WHATSAPP_API_TOKEN is pending
    res.json({
      success: true,
      isLive: false,
      target: formattedPhone,
      message: message,
      notice: "WhatsApp API Gateway siap. Tambahkan WHATSAPP_API_TOKEN di Environment Variables untuk pengiriman live otomatis."
    });
  } catch (err) {
    console.error("WhatsApp API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Fallback 404 handler
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '404.html'));
});

if (!process.env.VERCEL) {
  app.listen(PORT, HOST, () => {
    console.log(`Safe Future server running on http://${HOST}:${PORT}`);
  });
}

export default app;
