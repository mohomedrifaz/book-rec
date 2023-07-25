import openai from 'openai';

openai.api_key = "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";

async function getSuggestions(message) {
  const response = await openai.ChatCompletion.create({
    model: "gpt-3.5-turbo",
    messages: [
      { role: "user", 
      content: 'give me examples of books in the same genre as this book ' + message + ' give me a list of five books. they have to be as the same genre as the book i have given.' }
    ]
  });
  return response.choices[0].message.content;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const { message } = req.body;

  try {
    const response = await getSuggestions(message);
    return res.status(200).json(response);
  } catch (error) {
    return res.status(500).json({ error: 'Error generating response' });
  }
}
