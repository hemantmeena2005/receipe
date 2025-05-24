import { CohereClient } from 'cohere-ai';
import { NextResponse } from 'next/server';

const cohere = new CohereClient({
  token: '7Xf69CHLEr7a6sdItyW9RMAA3F5DjtDOgCN5K8oi',
});

export async function POST(request) {
  try {
    const { ingredients } = await request.json();

    if (!ingredients) {
      return NextResponse.json(
        { error: 'Ingredients are required' },
        { status: 400 }
      );
    }

    const prompt = `I have the following ingredients: ${ingredients}. Suggest a simple, delicious recipe I can make. Include a title and numbered steps.`;

    const response = await cohere.generate({
      prompt,
      max_tokens: 500,
      temperature: 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE',
    });

    return NextResponse.json({ recipe: response.generations[0].text });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
} 