async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function analyzeCase(prompt, retries = 3) {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;

  for (let i = 0; i < retries; i++) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        temperature: 0.3,
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    if (response.ok) {
      const data = await response.json();
      return data.choices[0].message.content;
    }

    const errData = await response.json();
    console.error('API 오류:', errData);

    if (response.status === 429) {
      console.log(`429 오류 - ${i + 1}번째 재시도... 5초 대기`);
      await sleep(5000);
      continue;
    }

    throw new Error('API 호출에 실패했습니다.');
  }

  throw new Error('API 호출에 실패했습니다. 잠시 후 다시 시도해주세요.');
}