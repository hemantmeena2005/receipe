import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'your-secret-key'; // In production, use environment variable

export async function GET(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();

    const user = await User.findById(decoded.userId).select('recipes');
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ recipes: user.recipes });
  } catch (error) {
    console.error('Error fetching recipes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch recipes' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const token = request.headers.get('authorization')?.split(' ')[1];
    const { recipeId } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    await connectDB();

    const user = await User.findByIdAndUpdate(
      decoded.userId,
      { $pull: { recipes: { _id: recipeId } } },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    return NextResponse.json(
      { error: 'Failed to delete recipe' },
      { status: 500 }
    );
  }
} 