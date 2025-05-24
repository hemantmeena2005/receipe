'use client';

import { useState, useEffect } from 'react';
import { TextField, Button, Card, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function Home() {
  const [ingredients, setIngredients] = useState('');
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [recipeHistory, setRecipeHistory] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentChat, setCurrentChat] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchRecipeHistory(savedToken);
    }
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const fetchRecipeHistory = async (authToken) => {
    try {
      const response = await fetch('/api/recipes', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setRecipeHistory(data.recipes);
      }
    } catch (error) {
      console.error('Error fetching recipe history:', error);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        fetchRecipeHistory(data.token);
      }

      setShowAuth(false);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken('');
    setUser(null);
    setRecipeHistory([]);
    setCurrentChat(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const handleNewChat = () => {
    setCurrentChat(null);
    setIngredients('');
    setRecipe('');
  };

  const handleSelectChat = (chat) => {
    setCurrentChat(chat);
    setIngredients(chat.ingredients);
    setRecipe(chat.recipe);
  };

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
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ ingredients }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate recipe');
      }

      setRecipe(data.recipe);
      if (token) {
        fetchRecipeHistory(token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecipe = async (recipeId) => {
    try {
      const response = await fetch('/api/recipes', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ recipeId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete recipe');
      }

      fetchRecipeHistory(token);
      if (currentChat?._id === recipeId) {
        handleNewChat();
      }
    } catch (error) {
      console.error('Error deleting recipe:', error);
    }
  };

  return (
    <div className={`flex h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      {/* Sidebar */}
      {user && (
        <Drawer
          variant="persistent"
          anchor="left"
          open={sidebarOpen}
          className="w-64"
          classes={{
            paper: `w-64 ${darkMode ? 'bg-gray-800' : 'bg-white'}`,
          }}
        >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleNewChat}
              >
                New Chat
              </Button>
              <IconButton onClick={() => setDarkMode(!darkMode)} color="inherit">
                {darkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </div>
            <Divider className={darkMode ? 'bg-gray-700' : 'bg-gray-200'} />
            <List>
              {recipeHistory.map((chat) => (
                <ListItem
                  key={chat._id}
                  onClick={() => handleSelectChat(chat)}
                  className={`cursor-pointer transition-colors duration-200 ${
                    currentChat?._id === chat._id
                      ? darkMode
                        ? 'bg-gray-700'
                        : 'bg-blue-50'
                      : darkMode
                      ? 'hover:bg-gray-700'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ListItemIcon>
                    <HistoryIcon className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </ListItemIcon>
                  <ListItemText
                    primary={chat.ingredients.split('\n')[0]}
                    secondary={new Date(chat.createdAt).toLocaleDateString()}
                    primaryTypographyProps={{
                      className: darkMode ? 'text-gray-100' : 'text-gray-900',
                    }}
                    secondaryTypographyProps={{
                      className: darkMode ? 'text-gray-400' : 'text-gray-500',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecipe(chat._id);
                    }}
                    className={darkMode ? 'text-gray-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600'}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </div>
          <div className={`mt-auto p-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center mb-4">
              <PersonIcon className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
              <span className={`text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>{user.email}</span>
            </div>
            <Button
              variant="outlined"
              color={darkMode ? 'inherit' : 'primary'}
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
              className={darkMode ? 'text-gray-100 border-gray-600 hover:border-gray-500' : ''}
            >
              Logout
            </Button>
          </div>
        </Drawer>
      )}

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {!user ? (
            <div className="text-center">
              <h1 className={`text-4xl font-bold mb-8 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                AI Recipe Generator
              </h1>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => setShowAuth(true)}
              >
                Login / Signup to Start
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Enter your ingredients (one per line)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className={darkMode ? 'bg-gray-800' : 'bg-white'}
                  InputProps={{
                    className: darkMode ? 'text-gray-100' : 'text-gray-900',
                  }}
                  InputLabelProps={{
                    className: darkMode ? 'text-gray-400' : 'text-gray-700',
                  }}
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
                <Card className={`mt-8 p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <div className="prose max-w-none">
                    {recipe.split('\n').map((line, index) => (
                      <p key={index} className={`mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                        {line}
                      </p>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </main>

      {/* Auth Dialog */}
      <Dialog 
        open={showAuth} 
        onClose={() => setShowAuth(false)}
        PaperProps={{
          className: darkMode ? 'bg-gray-800' : 'bg-white',
        }}
      >
        <DialogTitle className={darkMode ? 'text-gray-100' : 'text-gray-900'}>
          {isLogin ? 'Login' : 'Sign Up'}
        </DialogTitle>
        <DialogContent>
          <form onSubmit={handleAuth} className="space-y-4 mt-4">
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={darkMode ? 'text-gray-100' : 'text-gray-900'}
              InputProps={{
                className: darkMode ? 'text-gray-100' : 'text-gray-900',
              }}
              InputLabelProps={{
                className: darkMode ? 'text-gray-400' : 'text-gray-700',
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={darkMode ? 'text-gray-100' : 'text-gray-900'}
              InputProps={{
                className: darkMode ? 'text-gray-100' : 'text-gray-900',
              }}
              InputLabelProps={{
                className: darkMode ? 'text-gray-400' : 'text-gray-700',
              }}
            />
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <DialogActions>
              <Button
                onClick={() => setIsLogin(!isLogin)}
                color="primary"
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  isLogin ? 'Login' : 'Sign Up'
                )}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
