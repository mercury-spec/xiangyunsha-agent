export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  const baseURL = process.env.API_BASE_URL || 'https://api.anthropic.com'

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' })
  }

  try {
    // 转换 Anthropic 格式 → OpenAI 格式
    const { model, messages, system, max_tokens } = req.body
    const openaiMessages = system
      ? [{ role: 'system', content: system }, ...messages]
      : messages

    const response = await fetch(`${baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        messages: openaiMessages,
        max_tokens: max_tokens || 1000,
      }),
    })

    const data = await response.json()

    // 转换回 Anthropic 响应格式
    const text = data.choices?.[0]?.message?.content || '抱歉，请稍后再试。'
    return res.status(200).json({
      content: [{ type: 'text', text }]
    })
  } catch (error) {
    return res.status(500).json({ error: '服务器错误，请稍后重试' })
  }
}
