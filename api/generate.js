export const handler = async (event, context) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) return { statusCode: 500, body: JSON.stringify({ error: "API anahtarı bulunamadı." }) };

  try {
    const payload = JSON.parse(event.body);

    const geminiRequest = {
      contents: [{
        parts: [
          { text: payload.masterPrompt + "\n\nMüşteri Tarifi: " + payload.prompt },
          { inline_data: { mime_type: "image/jpeg", data: payload.imageBase64 } }
        ]
      }]
    };

    // Gemini API'ye doğru formatta bağlanıyoruz
    await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(geminiRequest)
    });

    // Arayüzün çökmemesi için yüklenen fotoğrafı şimdilik 4 test kopyası olarak döndürüyoruz.
    // İleride gerçek görsel üretimi için Google Imagen API'ye geçiş yapmalısın.
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        images: [
          `data:image/jpeg;base64,${payload.imageBase64}`,
          `data:image/jpeg;base64,${payload.imageBase64}`,
          `data:image/jpeg;base64,${payload.imageBase64}`,
          `data:image/jpeg;base64,${payload.imageBase64}`
        ]
      })
    };

  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: "Sunucu hatası oluştu." }) };
  }
};
