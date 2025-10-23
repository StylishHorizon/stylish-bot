try {
  const hfRes = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {  // Reliable free model
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      inputs: siteContext,
      parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false }
    })
  });
  console.log('HF status:', hfRes.status);
  if (hfRes.ok) {
    const data = await hfRes.json();
    aiResponse = Array.isArray(data) ? data[0].generated_text : 'Parsing issue.';
  } else {
    const errorText = await hfRes.text();
    console.log('HF error text:', errorText);
    aiResponse = `HF error ${hfRes.status}: ${errorText.substring(0, 100)}...`;
  }
} catch (err) {
  console.log('Fetch error:', err.message);
  aiResponse = `Error: ${err.message}. Check token/logs.`;
}
