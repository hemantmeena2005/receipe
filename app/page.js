'use client';

import { useState, useEffect } from 'react';
import { TextField, Button, Card, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Drawer, List, ListItem, ListItemText, ListItemIcon, Divider, Typography, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import StopIcon from '@mui/icons-material/Stop';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
  const [isMobile, setIsMobile] = useState(false);
  const [copySuccess, setCopySuccess] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      fetchRecipeHistory(savedToken);
    }
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setSidebarOpen(window.innerWidth >= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess('Copied!');
      setTimeout(() => setCopySuccess(''), 2000);
    } catch (err) {
      setCopySuccess('Failed to copy');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setRecipe('');

    try {
      const prompt = `Create a simple Indian recipe using these ingredients: ${ingredients}. 
      Please write the recipe in clear, easy-to-follow steps.
      Include common Indian cooking terms and measurements.
      Make it sound like a typical Indian home recipe.`;

      const response = await fetch('/api/recipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: JSON.stringify({ 
          ingredients,
          prompt,
          cuisine: 'indian',
          style: 'home_style'
        }),
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

  const speakText = (text, lang = 'en-IN') => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      {user && (
        <div className="fixed top-0 left-0 right-0 h-14 bg-white shadow-sm z-40 flex items-center justify-between px-4">
          <IconButton
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-600"
          >
            <MenuIcon />
          </IconButton>
          <div className="flex items-center gap-2">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              size="small"
              onClick={handleNewChat}
            >
              New Chat
            </Button>
          </div>
        </div>
      )}

      {/* Sidebar */}
      {user && (
        <Drawer
          variant={isMobile ? "temporary" : "persistent"}
          anchor="left"
          open={sidebarOpen}
          onClose={() => isMobile && setSidebarOpen(false)}
          className={`${isMobile ? 'w-[280px]' : 'w-64'}`}
          classes={{
            paper: `${isMobile ? 'w-[280px]' : 'w-64'} bg-white`,
          }}
        >
          <div className="p-4 bg-white">
            <div className="mb-4">
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={() => {
                  handleNewChat();
                  isMobile && setSidebarOpen(false);
                }}
                fullWidth
              >
                New Chat
              </Button>
            </div>
            <Divider className="bg-gray-200" />
            <List className="bg-white">
              {recipeHistory.map((chat) => (
                <ListItem
                  key={chat._id}
                  onClick={() => {
                    handleSelectChat(chat);
                    isMobile && setSidebarOpen(false);
                  }}
                  className={`cursor-pointer transition-colors duration-200 ${
                    currentChat?._id === chat._id
                      ? 'bg-blue-50'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <ListItemIcon>
                    <HistoryIcon className="text-gray-600" />
                  </ListItemIcon>
                  <ListItemText
                    primary={chat.ingredients.split('\n')[0]}
                    secondary={new Date(chat.createdAt).toLocaleDateString()}
                    primaryTypographyProps={{
                      className: 'text-gray-900 truncate',
                    }}
                    secondaryTypographyProps={{
                      className: 'text-gray-500',
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRecipe(chat._id);
                    }}
                    className="text-gray-500 hover:text-red-600"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          </div>
          <div className="mt-auto p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center mb-4">
              <PersonIcon className="mr-2 text-gray-600" />
              <span className="text-sm text-gray-900 truncate">{user.email}</span>
            </div>
            <Button
              variant="outlined"
              color="primary"
              fullWidth
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
        </Drawer>
      )}

      {/* Main Content */}
      <main className={`flex-1 p-4 md:p-8 overflow-auto bg-gray-50 ${user ? 'pt-20' : ''}`}>
        <div className="max-w-2xl mx-auto">
          {!user ? (
            <div className="text-center">
              <div className="mb-8">
                <div className="relative w-full h-64 mb-8 rounded-xl overflow-hidden">
                  <img 
                    src="https://plus.unsplash.com/premium_photo-1673590981810-894dadc93a6d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZCUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D"
                    alt="Delicious Food" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-white">
                      AI Recipe Generator
                    </h1>
                  </div>
                </div>
                <p className="text-lg text-gray-600 mb-8 max-w-lg mx-auto">
                  Transform your ingredients into delicious Indian recipes with our AI-powered recipe generator. 
                  Get step-by-step instructions and cooking tips instantly!
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Zm9vZCUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D"
                        alt="Ingredients" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-xl text-gray-800 mb-2">Add Ingredients</h3>
                    <p className="text-gray-600">List what you have in your kitchen</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                      <img 
                        src="https://images.unsplash.com/photo-1550547660-d9450f859349?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8Zm9vZCUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D"
                        alt="Recipe" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-xl text-gray-800 mb-2">Get Recipe</h3>
                    <p className="text-gray-600">AI generates perfect instructions</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                    <div className="relative h-40 mb-4 rounded-lg overflow-hidden">
                      <img 
                        src="https://plus.unsplash.com/premium_photo-1673590981810-894dadc93a6d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Zm9vZCUyMGltYWdlc3xlbnwwfHwwfHx8MA%3D%3D"
                        alt="Cook" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-semibold text-xl text-gray-800 mb-2">Start Cooking</h3>
                    <p className="text-gray-600">Follow easy steps to create magic</p>
                  </div>
                </div>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => setShowAuth(true)}
                  className="h-14 px-8 text-lg hover:scale-105 transition-transform"
                >
                  Get Started
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                  Create Your Recipe
                </h2>
                <p className="text-gray-600">
                  Enter your ingredients and let AI create a delicious recipe for you
                </p>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Enter ingredients (e.g., potatoes, cauliflower, tomatoes)"
                  value={ingredients}
                  onChange={(e) => setIngredients(e.target.value)}
                  className="bg-white"
                  InputProps={{
                    className: 'text-gray-900',
                  }}
                  InputLabelProps={{
                    className: 'text-gray-700',
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
                <Card className="mt-8 p-4 md:p-6 bg-white">
                  <div className="prose max-w-none">
                    <div className="flex justify-between items-center mb-4">
                      <Typography variant="h6" className="text-gray-900">
                        Recipe
                      </Typography>
                      <div className="flex gap-2">
                        <IconButton
                          onClick={() => copyToClipboard(recipe)}
                          className="text-gray-600 hover:text-gray-900"
                          title="Copy recipe"
                        >
                          <ContentCopyIcon />
                        </IconButton>
                        <IconButton
                          onClick={() => speakText(recipe, 'en-IN')}
                          className={`text-gray-600 hover:text-gray-900 ${isSpeaking ? 'text-blue-600' : ''}`}
                          title={isSpeaking ? 'Stop reading' : 'Listen to recipe'}
                        >
                          {isSpeaking ? <StopIcon /> : <VolumeUpIcon />}
                        </IconButton>
                      </div>
                    </div>
                    {recipe.split('\n').map((line, index) => (
                      <p key={index} className="mb-2 text-gray-900">
                        {line}
                      </p>
                    ))}
                    {copySuccess && (
                      <Typography className="text-green-600 text-sm mt-2">
                        {copySuccess}
                      </Typography>
                    )}
                  </div>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Auth Dialog */}
      <Dialog 
        open={showAuth} 
        onClose={() => setShowAuth(false)}
        PaperProps={{
          className: 'bg-white w-full max-w-md mx-4',
        }}
      >
        <DialogTitle className="text-gray-900">
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
              className="text-gray-900"
              InputProps={{
                className: 'text-gray-900',
              }}
              InputLabelProps={{
                className: 'text-gray-700',
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="text-gray-900"
              InputProps={{
                className: 'text-gray-900',
              }}
              InputLabelProps={{
                className: 'text-gray-700',
              }}
            />
            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}
            <DialogActions className="flex-col sm:flex-row gap-2">
              <Button
                onClick={() => setIsLogin(!isLogin)}
                color="primary"
                fullWidth
              >
                {isLogin ? 'Need an account? Sign up' : 'Already have an account? Login'}
              </Button>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading}
                fullWidth
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
