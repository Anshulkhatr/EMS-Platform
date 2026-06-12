const dotenv = require('dotenv');
dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct';

const getAiResponse = async (systemPrompt, userPrompt, responseFormatJson = true) => {
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key is missing.');
  }

  const payload = {
    model: OPENROUTER_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    ...(responseFormatJson && { response_format: { type: 'json_object' } })
  };

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000',
        'X-Title': 'EMS Platform'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (responseFormatJson) {
      try {
        return JSON.parse(content);
      } catch (parseErr) {
        console.error('Failed to parse response as JSON:', content);
        return {
          error: 'Invalid JSON response from AI',
          rawContent: content,
          confidenceScore: 30,
          requiresHumanApproval: false
        };
      }
    }

    return content;
  } catch (error) {
    console.error('Error in aiService:', error);
    throw error;
  }
};

module.exports = {
  getAiResponse
};
