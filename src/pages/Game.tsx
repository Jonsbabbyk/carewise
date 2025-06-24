import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Play, Pause, RotateCcw, Trophy, Heart, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { GameState } from '../types';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const GAME_DURATION = 60; // seconds
const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const PLAYER_SIZE = 40;
const ITEM_SIZE = 30;

const SunshineHeroGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number>();
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    timeRemaining: GAME_DURATION,
    playerPosition: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    items: [],
    isPlaying: false,
    gameOver: false,
  });
  const [highScore, setHighScore] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  const encouragingMessages = [
    "You're amazing!",
    "Healing power activated!",
    "You're making healthy choices!",
    "Fantastic work!",
    "Keep going, sunshine hero!",
    "Wonderful job!",
    "You're spreading wellness!",
    "Brilliant move!",
  ];

  const generateRandomItem = useCallback(() => {
    const healthyItems = ['🍎', '💧', '🌞', '🌿', '🥕', '🥬', '🫐', '🍊'];
    const unhealthyItems = ['☁️', '🍔', '🚬', '😢'];
    const isHealthy = Math.random() > 0.3; // 70% chance of healthy items
    const items = isHealthy ? healthyItems : unhealthyItems;
    
    return {
      id: Math.random().toString(),
      type: isHealthy ? 'healthy' as const : 'unhealthy' as const,
      emoji: items[Math.floor(Math.random() * items.length)],
      position: {
        x: Math.random() * (CANVAS_WIDTH - ITEM_SIZE),
        y: Math.random() * (CANVAS_HEIGHT - ITEM_SIZE),
      },
      collected: false,
    };
  }, []);

  const initializeGame = useCallback(() => {
    const items = Array.from({ length: 15 }, generateRandomItem);
    setGameState({
      score: 0,
      timeRemaining: GAME_DURATION,
      playerPosition: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
      items,
      isPlaying: false,
      gameOver: false,
    });
  }, [generateRandomItem]);

  const startGame = () => {
    setShowInstructions(false);
    setGameState(prev => ({ ...prev, isPlaying: true }));
    announceToScreenReader('Game started! Move your sunshine hero to collect healthy items.');
    speak('Game started! Use arrow keys or touch to move your sunshine hero and collect healthy items like fruits and water. Avoid the unhealthy items!');
  };

  const pauseGame = () => {
    setGameState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
    announceToScreenReader(gameState.isPlaying ? 'Game paused' : 'Game resumed');
  };

  const endGame = useCallback(async () => {
    setGameState(prev => ({ ...prev, isPlaying: false, gameOver: true }));
    
    const finalScore = gameState.score;
    if (finalScore > highScore) {
      setHighScore(finalScore);
      announceToScreenReader(`New high score! You scored ${finalScore} points!`);
      speak(`Congratulations! You achieved a new high score of ${finalScore} points! You're a true sunshine hero!`);
    } else {
      announceToScreenReader(`Game over! You scored ${finalScore} points.`);
      speak(`Great job! You scored ${finalScore} points. Remember, every healthy choice you make in real life helps you and others feel better!`);
    }

    // Save score to database
    try {
      await supabase.from('game_scores').insert({
        user_id: 'anonymous-user', // In production, use actual user ID
        game_name: 'sunshine-hero',
        score: finalScore,
      });
    } catch (error) {
      console.error('Error saving score:', error);
    }
  }, [gameState.score, highScore, announceToScreenReader, speak]);

  const collectItem = useCallback((itemId: string, itemType: 'healthy' | 'unhealthy') => {
    setGameState(prev => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, collected: true } : item
      ),
      score: itemType === 'healthy' ? prev.score + 10 : Math.max(0, prev.score - 5),
    }));

    if (itemType === 'healthy') {
      const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      speak(message);
      announceToScreenReader(`Collected healthy item! ${message} Score: ${gameState.score + 10}`);
    } else {
      speak('Oops! Try to avoid unhealthy choices.');
      announceToScreenReader(`Avoided unhealthy item. Score: ${Math.max(0, gameState.score - 5)}`);
    }

    // Generate new item
    setTimeout(() => {
      setGameState(prev => ({
        ...prev,
        items: [...prev.items.filter(item => item.id !== itemId), generateRandomItem()],
      }));
    }, 500);
  }, [gameState.score, announceToScreenReader, speak, generateRandomItem, encouragingMessages]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameState.isPlaying) return;

    const moveDistance = 20;
    const { key } = e;
    
    setGameState(prev => {
      let newX = prev.playerPosition.x;
      let newY = prev.playerPosition.y;

      switch (key) {
        case 'ArrowLeft':
        case 'a':
        case 'A':
          newX = Math.max(0, newX - moveDistance);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          newX = Math.min(CANVAS_WIDTH - PLAYER_SIZE, newX + moveDistance);
          break;
        case 'ArrowUp':
        case 'w':
        case 'W':
          newY = Math.max(0, newY - moveDistance);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          newY = Math.min(CANVAS_HEIGHT - PLAYER_SIZE, newY + moveDistance);
          break;
        default:
          return prev;
      }

      return {
        ...prev,
        playerPosition: { x: newX, y: newY },
      };
    });
  }, [gameState.isPlaying]);

  const checkCollisions = useCallback(() => {
    const { playerPosition, items } = gameState;
    
    items.forEach(item => {
      if (item.collected) return;
      
      const distance = Math.sqrt(
        Math.pow(playerPosition.x - item.position.x, 2) + 
        Math.pow(playerPosition.y - item.position.y, 2)
      );
      
      if (distance < PLAYER_SIZE) {
        collectItem(item.id, item.type);
      }
    });
  }, [gameState, collectItem]);

  const drawGame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#E0F2FE'; // Light blue background
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw player (sunshine)
    ctx.font = `${PLAYER_SIZE}px Arial`;
    ctx.fillText('☀️', gameState.playerPosition.x, gameState.playerPosition.y + PLAYER_SIZE);

    // Draw items
    ctx.font = `${ITEM_SIZE}px Arial`;
    gameState.items.forEach(item => {
      if (!item.collected) {
        ctx.fillText(item.emoji, item.position.x, item.position.y + ITEM_SIZE);
      }
    });

    // Draw score and time
    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 24px Arial';
    ctx.fillText(`Score: ${gameState.score}`, 20, 40);
    ctx.fillText(`Time: ${gameState.timeRemaining}s`, 20, 80);
    
    if (highScore > 0) {
      ctx.fillText(`High Score: ${highScore}`, 20, 120);
    }
  }, [gameState, highScore]);

  // Game loop
  useEffect(() => {
    if (!gameState.isPlaying) return;

    const gameLoop = () => {
      checkCollisions();
      drawGame();
      
      setGameState(prev => {
        const newTime = prev.timeRemaining - 1;
        if (newTime <= 0) {
          return { ...prev, timeRemaining: 0 };
        }
        return { ...prev, timeRemaining: newTime };
      });
    };

    gameLoopRef.current = window.setInterval(gameLoop, 1000);

    return () => {
      if (gameLoopRef.current) {
        clearInterval(gameLoopRef.current);
      }
    };
  }, [gameState.isPlaying, checkCollisions, drawGame]);

  // End game when time runs out
  useEffect(() => {
    if (gameState.timeRemaining <= 0 && gameState.isPlaying) {
      endGame();
    }
  }, [gameState.timeRemaining, gameState.isPlaying, endGame]);

  // Event listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // Initialize game on mount
  useEffect(() => {
    initializeGame();
    announceToScreenReader('Sunshine Hero game loaded. This is an accessible game where you collect healthy items to boost your wellness score.');
  }, [initializeGame, announceToScreenReader]);

  // Draw game
  useEffect(() => {
    drawGame();
  }, [drawGame]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!gameState.isPlaying) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    setGameState(prev => ({
      ...prev,
      playerPosition: {
        x: Math.max(0, Math.min(CANVAS_WIDTH - PLAYER_SIZE, clickX - PLAYER_SIZE / 2)),
        y: Math.max(0, Math.min(CANVAS_HEIGHT - PLAYER_SIZE, clickY - PLAYER_SIZE / 2)),
      },
    }));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-50 to-pink-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            <span className="text-yellow-500">☀️</span> Sunshine Hero <span className="text-yellow-500">☀️</span>
          </h1>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto">
            An accessible wellness game that brings joy and teaches healthy choices. 
            Move your sunshine hero to collect healthy items and spread positivity!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Canvas */}
          <div className="lg:col-span-2">
            <Card className="relative overflow-hidden">
              {showInstructions && (
                <div className="absolute inset-0 bg-white bg-opacity-95 z-10 flex items-center justify-center p-8">
                  <div className="text-center max-w-md">
                    <div className="text-6xl mb-4">☀️</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">How to Play</h3>
                    <div className="text-left space-y-2 mb-6 text-gray-700">
                      <p>• <strong>Move:</strong> Use arrow keys or click/tap on screen</p>
                      <p>• <strong>Collect:</strong> Healthy items (🍎💧🌞🌿) = +10 points</p>
                      <p>• <strong>Avoid:</strong> Unhealthy items (☁️🍔) = -5 points</p>
                      <p>• <strong>Goal:</strong> Get the highest score in 60 seconds!</p>
                    </div>
                    <Button variant="primary" size="large" onClick={startGame}>
                      <Play className="mr-2 h-5 w-5" /> Start Playing
                    </Button>
                  </div>
                </div>
              )}
              
              <canvas
                ref={canvasRef}
                width={CANVAS_WIDTH}
                height={CANVAS_HEIGHT}
                onClick={handleCanvasClick}
                className="w-full h-auto border-4 border-yellow-300 rounded-lg cursor-pointer"
                style={{ maxHeight: '60vh' }}
                aria-label="Sunshine Hero game area. Use arrow keys to move your sunshine character."
                tabIndex={0}
              />
              
              {gameState.gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
                  <Card className="text-center max-w-md mx-4">
                    <div className="text-4xl mb-4">🏆</div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Game Complete!</h3>
                    <p className="text-xl text-gray-700 mb-4">Final Score: <strong>{gameState.score}</strong></p>
                    <p className="text-gray-600 mb-6">
                      Remember: Every healthy choice you make in real life is a victory! 
                      You're already a sunshine hero by caring about your wellness.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button variant="primary" onClick={initializeGame} fullWidth>
                        <RotateCcw className="mr-2 h-4 w-4" /> Play Again
                      </Button>
                      <Button variant="success" as={Link} to="/awareness" fullWidth>
                        <Heart className="mr-2 h-4 w-4" /> Learn Real Health Tips
                      </Button>
                    </div>
                  </Card>
                </div>
              )}
            </Card>
          </div>

          {/* Game Controls & Info */}
          <div className="space-y-6">
            {/* Score Card */}
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary-600 mb-2">{gameState.score}</div>
                <p className="text-gray-600">Current Score</p>
                {highScore > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-center space-x-2 text-yellow-600">
                      <Trophy className="h-5 w-5" />
                      <span className="font-semibold">High Score: {highScore}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Game Controls */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Controls</h3>
              <div className="space-y-3">
                {!gameState.isPlaying && !gameState.gameOver && (
                  <Button 
                    variant="primary" 
                    fullWidth 
                    onClick={startGame}
                    disabled={showInstructions}
                  >
                    <Play className="mr-2 h-4 w-4" /> Start Game
                  </Button>
                )}
                
                {gameState.isPlaying && (
                  <Button variant="warning" fullWidth onClick={pauseGame}>
                    <Pause className="mr-2 h-4 w-4" /> Pause Game
                  </Button>
                )}
                
                <Button variant="outline" fullWidth onClick={initializeGame}>
                  <RotateCcw className="mr-2 h-4 w-4" /> Reset Game
                </Button>
              </div>
            </Card>

            {/* Game Stats */}
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Game Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Time Remaining:</span>
                  <span className="font-semibold">{gameState.timeRemaining}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Items Collected:</span>
                  <span className="font-semibold">{gameState.items.filter(item => item.collected).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Active Items:</span>
                  <span className="font-semibold">{gameState.items.filter(item => !item.collected).length}</span>
                </div>
              </div>
            </Card>

            {/* Health Message */}
            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <div className="text-center">
                <div className="text-2xl mb-3">💚</div>
                <h3 className="font-semibold text-gray-900 mb-2">Real Life Sunshine Hero</h3>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Just like in this game, making healthy choices in real life gives you energy and happiness. 
                  Drink water, eat fruits, get sunlight, and stay active!
                </p>
                <Link 
                  to="/awareness" 
                  className="inline-flex items-center mt-3 text-green-600 hover:text-green-700 font-medium text-sm"
                >
                  Learn Real Health Tips <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </Card>
          </div>
        </div>

        {/* Accessibility Note */}
        <div className="mt-8 text-center">
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Accessibility:</strong> This game supports keyboard navigation (arrow keys, WASD), 
              mouse/touch input, and provides voice feedback for screen readers. 
              All interactions are announced for users with visual impairments.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default SunshineHeroGame;