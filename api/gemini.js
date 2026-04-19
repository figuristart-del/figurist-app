export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const API_KEY = process.env.GEMINI_API_KEY;
  const { prompt, imageBase64, masterPrompt } = req.body;
  const fullPrompt = masterPrompt + '\n\n[USER DESCRIPTION]\n' + prompt;

  try {
    const requests = Array(4).fill(0).map(() =>
      fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: fullPrompt },
              { inline_data: { mime_type: 'image/jpeg', data: imageBase64 } }
            ]
          }]
        })
      }).then(r => r.json())
    );

    const results = await Promise.all(requests);
    const images = results.map(data => {
      const part = data.candidates?.[0]?.content?.parts?.find(p => p.inline_data);
      return part ? 'data:image/png;base64,' + part.inline_data.data : null;
    }).filter(Boolean);

    res.status(200).json({ images });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}