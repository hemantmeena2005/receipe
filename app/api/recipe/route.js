import { CohereClient } from 'cohere-ai';
import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';

const cohere = new CohereClient({
  token: '7Xf69CHLEr7a6sdItyW9RMAA3F5DjtDOgCN5K8oi',
});

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

export async function POST(request) {
  try {
    const { ingredients } = await request.json();
    const token = request.headers.get('authorization')?.split(' ')[1];

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

    const recipe = response.generations[0].text;

    // If user is logged in, save the recipe
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await connectDB();
        
        await User.findByIdAndUpdate(decoded.userId, {
          $push: {
            recipes: {
              ingredients,
              recipe,
            },
          },
        });
      } catch (error) {
        console.error('Error saving recipe:', error);
      }
    }

    return NextResponse.json({ recipe });
  } catch (error) {
    console.error('Error generating recipe:', error);
    return NextResponse.json(
      { error: 'Failed to generate recipe' },
      { status: 500 }
    );
  }
} 