import React, { useState, useEffect } from 'react';
import { Trophy, Star, CheckCircle, ArrowRight, RotateCcw } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  category: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface PlayerProgress {
  level: number;
  experience: number;
  questionsAnswered: number;
  correctAnswers: number;
  unlockedCategories: string[];
}

const HealthQuest: React.FC = () => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [progress, setProgress] = useState<PlayerProgress>({
    level: 1,
    experience: 0,
    questionsAnswered: 0,
    correctAnswers: 0,
    unlockedCategories: ['basics']
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('basics');

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  const categories = [
    { id: 'basics', name: 'Health Basics', unlockLevel: 1, color: 'primary' },
    { id: 'nutrition', name: 'Nutrition', unlockLevel: 2, color: 'success' },
    { id: 'natural', name: 'Natural Remedies', unlockLevel: 3, color: 'accent' },
    { id: 'mental', name: 'Mental Health', unlockLevel: 4, color: 'secondary' },
    { id: 'emergency', name: 'Emergency Care', unlockLevel: 5, color: 'error' }
  ];

  const questions: Question[] = [
    // Health Basics
    {
      id: '1',
      question: 'How much water should an average adult drink per day?',
      options: ['4 glasses', '6-8 glasses', '12 glasses', '2 glasses'],
      correctAnswer: 1,
      explanation: 'Adults should drink 6-8 glasses (about 2 liters) of water daily to stay properly hydrated.',
      category: 'basics',
      difficulty: 'easy'
    },
    {
      id: '2',
      question: 'What is the recommended amount of sleep for adults?',
      options: ['5-6 hours', '7-9 hours', '10-12 hours', '4-5 hours'],
      correctAnswer: 1,
      explanation: 'Adults need 7-9 hours of quality sleep per night for optimal health and wellbeing.',
      category: 'basics',
      difficulty: 'easy'
    },
    // Nutrition
    {
      id: '3',
      question: 'Which vitamin is primarily obtained from sunlight?',
      options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
      correctAnswer: 2,
      explanation: 'Vitamin D is synthesized in the skin when exposed to sunlight, making it the "sunshine vitamin."',
      category: 'nutrition',
      difficulty: 'medium'
    },
    {
      id: '4',
      question: 'What are antioxidants good for?',
      options: ['Building muscle', 'Fighting free radicals', 'Increasing appetite', 'Storing fat'],
      correctAnswer: 1,
      explanation: 'Antioxidants help protect cells from damage caused by free radicals, supporting overall health.',
      category: 'nutrition',
      difficulty: 'medium'
    },
    // Natural Remedies
    {
      id: '5',
      question: 'Which natural remedy is commonly used for nausea?',
      options: ['Lavender', 'Ginger', 'Rosemary', 'Mint'],
      correctAnswer: 1,
      explanation: 'Ginger has been used for centuries to treat nausea and is scientifically proven to be effective.',
      category: 'natural',
      difficulty: 'medium'
    },
    {
      id: '6',
      question: 'What is aloe vera commonly used for?',
      options: ['Headaches', 'Burns and skin irritation', 'Colds', 'Insomnia'],
      correctAnswer: 1,
      explanation: 'Aloe vera gel has cooling and healing properties, making it excellent for treating burns and skin irritation.',
      category: 'natural',
      difficulty: 'easy'
    },
    // Mental Health
    {
      id: '7',
      question: 'What is a healthy way to manage stress?',
      options: ['Avoiding all challenges', 'Deep breathing exercises', 'Staying indoors always', 'Skipping meals'],
      correctAnswer: 1,
      explanation: 'Deep breathing exercises activate the relaxation response and help reduce stress hormones.',
      category: 'mental',
      difficulty: 'easy'
    },
    {
      id: '8',
      question: 'How does regular exercise affect mental health?',
      options: ['No effect', 'Increases anxiety', 'Improves mood and reduces depression', 'Causes confusion'],
      correctAnswer: 2,
      explanation: 'Regular exercise releases endorphins and helps improve mood while reducing symptoms of depression and anxiety.',
      category: 'mental',
      difficulty: 'medium'
    }
  ];

  const encouragingMessages = [
    "Fantastic! You're becoming a health expert! 🌟",
    "Excellent work! Your knowledge is growing! 💪",
    "Amazing! You're on the path to wellness wisdom! ✨",
    "Brilliant! Keep up the great learning! 🎉",
    "Outstanding! You're a health champion! 🏆",
    "Wonderful! Your health IQ is rising! 🧠",
    "Superb! You're mastering wellness! 🌈",
    "Incredible! Knowledge is your superpower! ⚡"
  ];

  useEffect(() => {
    announceToScreenReader('Health Quest Quiz Adventure loaded. Answer questions to unlock new health knowledge levels.');
    speak('Welcome to Health Quest! This is an adventure game where you answer health questions to level up and unlock new categories. Are you ready to become a health champion?');
  }, [announceToScreenReader, speak]);

  const getRandomQuestion = (category: string): Question => {
    const categoryQuestions = questions.filter(q => q.category === category);
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
  };

  const startGame = () => {
    setGameStarted(true);
    loadNextQuestion();
    announceToScreenReader('Health Quest started! Answer questions to gain experience and level up.');
  };

  const loadNextQuestion = () => {
    const question = getRandomQuestion(selectedCategory);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowExplanation(false);
    announceToScreenReader(`New question loaded: ${question.question}`);
    speak(question.question);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    announceToScreenReader(`Selected answer: ${currentQuestion?.options[answerIndex]}`);
  };

  const submitAnswer = async () => {
    if (!currentQuestion || selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    setShowExplanation(true);

    // Update progress
    const newProgress = {
      ...progress,
      questionsAnswered: progress.questionsAnswered + 1,
      correctAnswers: isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers,
      experience: progress.experience + (isCorrect ? 10 : 5)
    };

    // Check for level up
    const newLevel = Math.floor(newProgress.experience / 50) + 1;
    if (newLevel > progress.level) {
      newProgress.level = newLevel;
      
      // Unlock new categories
      const unlockedCategories = categories
        .filter(cat => cat.unlockLevel <= newLevel)
        .map(cat => cat.id);
      newProgress.unlockedCategories = unlockedCategories;

      announceToScreenReader(`Level up! You are now level ${newLevel}!`);
      speak(`Congratulations! You leveled up to level ${newLevel}! New health topics are now available!`);
    }

    setProgress(newProgress);

    // Provide feedback
    if (isCorrect) {
      const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      announceToScreenReader(`Correct! ${message} ${currentQuestion.explanation}`);
      speak(`Correct! ${message} ${currentQuestion.explanation}`);
    } else {
      announceToScreenReader(`Not quite right. ${currentQuestion.explanation}`);
      speak(`That's not quite right, but great try! ${currentQuestion.explanation}`);
    }

    // Save progress to Supabase
    try {
      await supabase.from('quiz_results').insert({
        user_id: 'anonymous-user',
        quiz_topic: `Health Quest - ${currentQuestion.category}`,
        score: isCorrect ? 1 : 0,
        total_questions: 1,
      });
    } catch (error) {
      console.error('Error saving quiz result:', error);
    }
  };

  const nextQuestion = () => {
    loadNextQuestion();
  };

  const changeCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
    announceToScreenReader(`Switched to ${categories.find(c => c.id === categoryId)?.name} category`);
    if (gameStarted) {
      loadNextQuestion();
    }
  };

  const resetGame = () => {
    setProgress({
      level: 1,
      experience: 0,
      questionsAnswered: 0,
      correctAnswers: 0,
      unlockedCategories: ['basics']
    });
    setGameStarted(false);
    setCurrentQuestion(null);
    setSelectedCategory('basics');
    announceToScreenReader('Game reset. Ready to start a new health quest!');
  };

  const getAccuracyPercentage = () => {
    if (progress.questionsAnswered === 0) return 0;
    return Math.round((progress.correctAnswers / progress.questionsAnswered) * 100);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center shadow-lg">
              <Trophy className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            🎮 Health Quest - Quiz Adventure
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Embark on a learning adventure! Answer health questions to gain experience, 
            level up, and unlock new categories. Become the ultimate health champion!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {!gameStarted ? (
              /* Start Screen */
              <Card className="text-center py-12">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trophy className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready for Your Health Quest?</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Answer questions correctly to gain experience points, level up, and unlock new health topics. 
                  Every question teaches you something valuable about wellness!
                </p>
                <Button variant="primary" size="large" onClick={startGame}>
                  <Star className="mr-2 h-5 w-5" />
                  Start Your Quest
                </Button>
              </Card>
            ) : currentQuestion ? (
              /* Question Display */
              <div className="space-y-6">
                <Card>
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-gray-900">
                      {categories.find(c => c.id === selectedCategory)?.name} Question
                    </h2>
                    <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                      {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-6">
                    {currentQuestion.question}
                  </h3>
                  
                  <div className="space-y-3 mb-6">
                    {currentQuestion.options.map((option, index) => (
                      <button
                        key={index}
                        onClick={() => handleAnswerSelect(index)}
                        disabled={showExplanation}
                        className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                          showExplanation
                            ? index === currentQuestion.correctAnswer
                              ? 'border-success-500 bg-success-50 text-success-800'
                              : index === selectedAnswer && index !== currentQuestion.correctAnswer
                              ? 'border-error-500 bg-error-50 text-error-800'
                              : 'border-gray-200 bg-gray-50 text-gray-600'
                            : selectedAnswer === index
                            ? 'border-primary-500 bg-primary-50 text-primary-800 focus:ring-primary-500'
                            : 'border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                        }`}
                        aria-pressed={selectedAnswer === index}
                      >
                        <div className="flex items-center">
                          <span className="font-medium mr-3">
                            {String.fromCharCode(65 + index)}.
                          </span>
                          <span>{option}</span>
                          {showExplanation && index === currentQuestion.correctAnswer && (
                            <CheckCircle className="ml-auto h-5 w-5 text-success-600" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>

                  {showExplanation && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <h4 className="font-semibold text-blue-900 mb-2">Explanation:</h4>
                      <p className="text-blue-800">{currentQuestion.explanation}</p>
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    {!showExplanation ? (
                      <Button
                        variant="primary"
                        onClick={submitAnswer}
                        disabled={selectedAnswer === null}
                        fullWidth
                      >
                        Submit Answer
                      </Button>
                    ) : (
                      <Button
                        variant="success"
                        onClick={nextQuestion}
                        fullWidth
                      >
                        Next Question <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            ) : null}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Progress */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Your Progress</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary-600 mb-1">
                    Level {progress.level}
                  </div>
                  <div className="text-sm text-gray-600">Health Champion</div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Experience</span>
                    <span>{progress.experience} XP</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(progress.experience % 50) * 2}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {50 - (progress.experience % 50)} XP to next level
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-success-600">
                      {progress.correctAnswers}
                    </div>
                    <div className="text-xs text-gray-600">Correct</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-secondary-600">
                      {getAccuracyPercentage()}%
                    </div>
                    <div className="text-xs text-gray-600">Accuracy</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Category Selection */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Health Topics</h3>
              <div className="space-y-2">
                {categories.map((category) => {
                  const isUnlocked = progress.unlockedCategories.includes(category.id);
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => isUnlocked && changeCategory(category.id)}
                      disabled={!isUnlocked}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                        !isUnlocked
                          ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                          : isSelected
                          ? `border-${category.color}-500 bg-${category.color}-50 text-${category.color}-800 focus:ring-${category.color}-500`
                          : 'border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                      }`}
                      aria-pressed={isSelected}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{category.name}</span>
                        {!isUnlocked ? (
                          <span className="text-xs bg-gray-200 px-2 py-1 rounded">
                            Level {category.unlockLevel}
                          </span>
                        ) : isSelected ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : null}
                      </div>
                    </button>
                  );
                })}
              </div>
            </Card>

            {/* Game Controls */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Game Controls</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={resetGame}
                  fullWidth
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Progress
                </Button>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">🏆 Achievements</h3>
              <div className="space-y-2 text-sm">
                {progress.questionsAnswered >= 5 && (
                  <div className="flex items-center text-yellow-700">
                    <Star className="h-4 w-4 mr-2" />
                    Curious Learner (5+ questions)
                  </div>
                )}
                {progress.level >= 3 && (
                  <div className="flex items-center text-yellow-700">
                    <Trophy className="h-4 w-4 mr-2" />
                    Health Explorer (Level 3+)
                  </div>
                )}
                {getAccuracyPercentage() >= 80 && progress.questionsAnswered >= 5 && (
                  <div className="flex items-center text-yellow-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Accuracy Expert (80%+ correct)
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default HealthQuest;