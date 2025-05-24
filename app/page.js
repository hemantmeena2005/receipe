'use client';

import { useState } from 'react';
import { TextField, Button, Card, CircularProgress } from '@mui/material';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe('');

    try {
      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipe');
      }

      setRecipe(data.recipe);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          AI Recipe Generator
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Enter your ingredients (one per line)"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            className="bg-white"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={loading || !ingredients.trim()}
            className="h-12"
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              'Generate Recipe'
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}

        {recipe && (
          <Card className="mt-8 p-6 bg-white">
            <div className="prose max-w-none">
              {recipe.split('\n').map((line, index) => (
                <p key={index} className="mb-2">
                  {line}
                </p>
              ))}
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}
