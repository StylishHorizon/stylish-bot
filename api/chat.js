try {
  const hfRes = await fetch('https://api-inference.huggingface.co/models/microsoft/Phi-3-mini-4k-instruct', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${process.env.HF_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: siteContext,
      parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false }
    })
  });
  console.log('HF status:', hfRes.status);  // Log для Vercel logs
  const data = await hfRes.json();
  if (hfRes.ok) {
    aiResponse = Array.isArray(data) ? data[0].generated_text : 'Parsing issue.';
  } else {
    aiResponse = `HF error ${hfRes.status}: ${data.error || 'Unknown'}`;
  }
} catch (err) {
  console.log('Fetch error:', err.message);  // Log
  aiResponse = `Error: ${err.message}. Check token/logs.`;
}
