export const runtime = 'edge';

export async function POST(request) {
  const { message } = await request.json();
  console.log('Request received:', message);

  const token = process.env.OR_KEY || 'no token';
  console.log('OR_KEY present?', !!token && token !== 'no token');

  const siteContext = `
  You are a helpful assistant for Stylish Horizon: no-hype restoration of VHS/Hi8/MiniDV. Keep it honest, concise, with a subtle wit—clear as a square-pixel horizon.

  Key facts:
  - First pass always: Deinterlace PAL/NTSC to PAR=1.0 (no distortions for YouTube/archives).
  - Packages: Legacy ($5-15/min, 720p ProRes: deinterlace/PAR fix/denoise/colors/square pixels/50fps/audio normalize; stabilization if shaky; upload expires 14 days). Ultimate ($20-50/min: all Legacy + upscale to 1920x1080/1200 for YT/Vimeo). UHD (4K on request: all Ultimate + premium upscale—prices? Fun territory, ask for quote).
  - Process: Upload raw to expiring link → free private YT preview (PAR-fixed) → comment trims → approve → 4-6 weeks finalize → pay.
  - Tone: Conversational EN/RU/ES/JP/SV/ZH, professional, no push—facts with a nod. Detect lang from user and respond in it (EN default). Suggest /archive.html naturally.
  User: ${message}
  `;

  let aiResponse = 'Default reply: Hi! Tell me about your tapes.';  // Fallback
  try {
    if (!token || token === 'no token') {
      aiResponse = 'No OR_KEY in env — check Vercel settings.';
      return Response.json({ reply: aiResponse });
    }

    const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'openchat/openchat-3.5',  // Free conversational, detect lang, stable
        messages: [{ role: 'system', content: siteContext }, { role: 'user', content: message }],
        max_tokens: 300,
        temperature: 0.7
      })
    });
    console.log('OR status:', orRes.status);
    if (orRes.ok) {
      const data = await orRes.json();
      aiResponse = data.choices[0].message.content;
    } else {
      const errorText = await orRes.text();
      console.log('OR error text:', errorText.substring(0, 100));
      aiResponse = `OR error ${orRes.status}: ${errorText.substring(0, 100)}...`;
    }
  } catch (err) {
    console.log('Fetch error:', err.message);
    aiResponse = `Error: ${err.message}. Check key/logs.`;
  }

  return Response.json({ reply: aiResponse });
}
