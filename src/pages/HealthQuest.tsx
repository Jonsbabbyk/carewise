import React, { useState, useEffect } from 'react';
import { Trophy, Star, CheckCircle, ArrowRight, RotateCcw, Scroll, Sparkles } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { BlockchainService } from '../services/blockchainService';
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
  storyContext: string;
}

interface PlayerProgress {
  level: number;
  experience: number;
  questionsAnswered: number;
  correctAnswers: number;
  unlockedCategories: string[];
  currentStoryChapter: number;
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
    unlockedCategories: ['basics'],
    currentStoryChapter: 1
  });
  const [gameStarted, setGameStarted] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('basics');
  const [storyText, setStoryText] = useState('');
  const [usedQuestions, setUsedQuestions] = useState<Set<string>>(new Set());
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  const { announceToScreenReader } = useAccessibility();
  const { speak, resetSpeechCount } = useVoice();

  const categories = [
    { id: 'basics', name: 'Health Basics', unlockLevel: 1, color: 'primary' },
    { id: 'nutrition', name: 'Nutrition Quest', unlockLevel: 2, color: 'success' },
    { id: 'natural', name: 'Herbal Mysteries', unlockLevel: 3, color: 'accent' },
    { id: 'mental', name: 'Mind Wellness', unlockLevel: 4, color: 'secondary' },
    { id: 'emergency', name: 'Emergency Hero', unlockLevel: 5, color: 'error' }
  ];

  // Enhanced story-based questions with UNIQUE questions per category (5 per category = 25 total)
  const questions: Question[] = [
    // Health Basics - The Village of Wellness (5 unique questions)
    {
      id: 'basics-1',
      question: 'In the Village of Wellness, the wise elder asks: "How much water should a healthy adult drink daily to maintain the magical spring of life?"',
      options: ['4 glasses', '6-8 glasses', '12 glasses', '2 glasses'],
      correctAnswer: 1,
      explanation: 'The magical spring teaches us that 6-8 glasses (about 2 liters) of water daily keeps our body\'s rivers flowing smoothly, just like the village\'s life-giving spring.',
      category: 'basics',
      difficulty: 'easy',
      storyContext: 'You arrive at the Village of Wellness, where a crystal-clear spring provides life to all inhabitants. The village elder, keeper of ancient health wisdom, greets you with your first challenge.'
    },
    {
      id: 'basics-2',
      question: 'The Sleep Guardian of the village reveals: "To unlock the power of restorative dreams, how many hours should adults rest in the realm of sleep?"',
      options: ['5-6 hours', '7-9 hours', '10-12 hours', '4-5 hours'],
      correctAnswer: 1,
      explanation: 'The Sleep Guardian\'s wisdom shows that 7-9 hours of quality sleep allows your body and mind to repair, restore, and prepare for new adventures.',
      category: 'basics',
      difficulty: 'easy',
      storyContext: 'As night falls in the village, you meet the Sleep Guardian, a mystical figure who protects the dreams of all villagers and teaches the secrets of restorative rest.'
    },
    {
      id: 'basics-3',
      question: 'The Sun Temple priest asks: "Which vitamin does the golden sun bestow upon those who seek its morning rays?"',
      options: ['Vitamin A', 'Vitamin C', 'Vitamin D', 'Vitamin E'],
      correctAnswer: 2,
      explanation: 'The Sun Temple\'s ancient knowledge reveals that Vitamin D, the "sunshine vitamin," is created when your skin receives the sun\'s morning blessing.',
      category: 'basics',
      difficulty: 'medium',
      storyContext: 'You discover a magnificent Sun Temple where priests have studied the healing power of sunlight for centuries. The morning rays illuminate golden inscriptions about health.'
    },
    {
      id: 'basics-4',
      question: 'The Village Healer asks: "What is the most important foundation of all health in our village?"',
      options: ['Expensive medicines', 'Regular exercise', 'Magic potions', 'Sleeping all day'],
      correctAnswer: 1,
      explanation: 'The Village Healer smiles knowingly. Regular movement and exercise is the foundation that supports all other health practices in the village.',
      category: 'basics',
      difficulty: 'easy',
      storyContext: 'The Village Healer, respected by all, tends to a garden of healing herbs while demonstrating gentle movements that keep the villagers strong and healthy.'
    },
    {
      id: 'basics-5',
      question: 'The Breath Master teaches: "In times of stress, what is the most powerful tool you carry within you?"',
      options: ['Your smartphone', 'Deep breathing', 'Loud shouting', 'Running away'],
      correctAnswer: 1,
      explanation: 'The Breath Master nods approvingly. Deep, conscious breathing is always with you and can calm the storm of stress in any moment.',
      category: 'basics',
      difficulty: 'medium',
      storyContext: 'High atop the village mountain, the Breath Master sits in meditation, teaching visitors how the simple act of breathing can transform their entire being.'
    },

    // Nutrition Quest - The Garden of Vitality (5 unique questions)
    {
      id: 'nutrition-1',
      question: 'In the Garden of Vitality, the Plant Whisperer asks: "Which colorful warriors fight the dark forces of free radicals in your body?"',
      options: ['Proteins', 'Antioxidants', 'Sugars', 'Fats'],
      correctAnswer: 1,
      explanation: 'The Plant Whisperer\'s garden teaches that antioxidants are nature\'s warriors, found in colorful fruits and vegetables, protecting your cells from damage.',
      category: 'nutrition',
      difficulty: 'medium',
      storyContext: 'You enter a magical garden where plants glow with vibrant colors. The Plant Whisperer, who can speak to all growing things, shares the secrets of nutritional power.'
    },
    {
      id: 'nutrition-2',
      question: 'The Fruit Oracle presents a riddle: "I am orange, rich in beta-carotene, and help your eyes see clearly in the twilight. What am I?"',
      options: ['Apple', 'Carrot', 'Banana', 'Grape'],
      correctAnswer: 1,
      explanation: 'The Fruit Oracle smiles as you recognize the carrot, whose beta-carotene transforms into Vitamin A, supporting your vision and immune system.',
      category: 'nutrition',
      difficulty: 'easy',
      storyContext: 'Deep in the garden, you find the Fruit Oracle, an ancient tree spirit who speaks in riddles about the healing properties of nature\'s bounty.'
    },
    {
      id: 'nutrition-3',
      question: 'The Protein Guardian asks: "Which plant-based foods can provide complete proteins for building strong muscles?"',
      options: ['Only meat', 'Quinoa and hemp seeds', 'White bread', 'Candy'],
      correctAnswer: 1,
      explanation: 'The Protein Guardian reveals that quinoa and hemp seeds contain all essential amino acids, making them complete protein sources from the plant kingdom.',
      category: 'nutrition',
      difficulty: 'medium',
      storyContext: 'In the strength section of the garden, the Protein Guardian tends to plants that build muscle and repair tissue, showing the power of plant-based nutrition.'
    },
    {
      id: 'nutrition-4',
      question: 'The Fiber Sage teaches: "What happens when you eat foods rich in fiber regularly?"',
      options: ['Nothing changes', 'Better digestion and heart health', 'You become tired', 'You lose your appetite'],
      correctAnswer: 1,
      explanation: 'The Fiber Sage explains that fiber acts like a gentle broom, cleaning your digestive system and helping maintain healthy cholesterol levels.',
      category: 'nutrition',
      difficulty: 'easy',
      storyContext: 'Among the tall grasses and grains, the Fiber Sage demonstrates how these humble plants provide the foundation for digestive health and vitality.'
    },
    {
      id: 'nutrition-5',
      question: 'The Omega Keeper asks: "Which healthy fats are essential for brain function and cannot be made by your body?"',
      options: ['Trans fats', 'Omega-3 fatty acids', 'Saturated fats', 'Artificial fats'],
      correctAnswer: 1,
      explanation: 'The Omega Keeper reveals that omega-3 fatty acids are essential fats that your brain needs but your body cannot produce, so you must get them from food.',
      category: 'nutrition',
      difficulty: 'medium',
      storyContext: 'By the garden\'s crystal pond, the Omega Keeper tends to flax plants and explains how certain fats are like liquid gold for your brain and heart.'
    },

    // Herbal Mysteries - The Enchanted Forest (5 unique questions)
    {
      id: 'natural-1',
      question: 'The Forest Sage reveals an ancient secret: "Which golden root calms the storms of nausea and inflammation in the body\'s kingdom?"',
      options: ['Lavender', 'Ginger', 'Rosemary', 'Mint'],
      correctAnswer: 1,
      explanation: 'The Forest Sage nods approvingly. Ginger, the golden root, has been nature\'s remedy for nausea and inflammation for thousands of years.',
      category: 'natural',
      difficulty: 'medium',
      storyContext: 'You venture into an enchanted forest where ancient trees whisper healing secrets. The Forest Sage, guardian of herbal wisdom, tests your knowledge of nature\'s pharmacy.'
    },
    {
      id: 'natural-2',
      question: 'The Aloe Spirit asks: "What healing gift do I offer to those who suffer from burns and wounded skin?"',
      options: ['Energy boost', 'Cooling and healing gel', 'Better sleep', 'Improved memory'],
      correctAnswer: 1,
      explanation: 'The Aloe Spirit\'s gift is its cooling, healing gel that soothes burns and promotes skin repair, earning it the title "plant of immortality."',
      category: 'natural',
      difficulty: 'easy',
      storyContext: 'In a desert oasis within the forest, you encounter the Aloe Spirit, a gentle being who has healed travelers\' wounds for millennia.'
    },
    {
      id: 'natural-3',
      question: 'The Turmeric Guardian asks: "What makes my golden powder so powerful against inflammation?"',
      options: ['Sugar content', 'Curcumin compound', 'Water content', 'Salt minerals'],
      correctAnswer: 1,
      explanation: 'The Turmeric Guardian reveals that curcumin is the magical compound that gives turmeric its powerful anti-inflammatory properties.',
      category: 'natural',
      difficulty: 'medium',
      storyContext: 'In a golden grove, the Turmeric Guardian tends to plants that glow with healing light, sharing the secrets of this ancient anti-inflammatory spice.'
    },
    {
      id: 'natural-4',
      question: 'The Echinacea Protector asks: "When should you call upon my purple flowers for aid?"',
      options: ['When you\'re happy', 'At the first sign of cold symptoms', 'Only in summer', 'Never'],
      correctAnswer: 1,
      explanation: 'The Echinacea Protector teaches that purple coneflower is most effective when taken at the very first signs of cold or flu symptoms.',
      category: 'natural',
      difficulty: 'easy',
      storyContext: 'Among purple wildflowers, the Echinacea Protector stands guard, ready to boost the immune systems of those who seek natural protection.'
    },
    {
      id: 'natural-5',
      question: 'The Garlic Warrior asks: "What happens when you crush my cloves and let them rest before eating?"',
      options: ['Nothing special', 'Allicin is activated', 'They become poisonous', 'They lose all benefits'],
      correctAnswer: 1,
      explanation: 'The Garlic Warrior explains that crushing garlic and letting it rest for 10 minutes activates allicin, the powerful compound that fights infections.',
      category: 'natural',
      difficulty: 'medium',
      storyContext: 'In the warrior section of the forest, the Garlic Warrior demonstrates how proper preparation unlocks the full protective power of this natural antibiotic.'
    },

    // Mind Wellness - The Temple of Serenity (5 unique questions)
    {
      id: 'mental-1',
      question: 'The Meditation Master teaches: "When anxiety clouds your mind like storm clouds, which breathing technique brings back the sunshine?"',
      options: ['Holding your breath', 'Deep, slow breathing', 'Rapid breathing', 'Breathing through mouth only'],
      correctAnswer: 1,
      explanation: 'The Meditation Master\'s wisdom: Deep, slow breathing activates your body\'s relaxation response, clearing the storm clouds of anxiety from your mind.',
      category: 'mental',
      difficulty: 'easy',
      storyContext: 'You climb to the Temple of Serenity, where the Meditation Master sits in peaceful contemplation, surrounded by an aura of calm that soothes all who approach.'
    },
    {
      id: 'mental-2',
      question: 'The Happiness Guardian asks: "Which magical activity releases the body\'s natural joy potions called endorphins?"',
      options: ['Sitting still', 'Regular exercise', 'Eating sugar', 'Watching screens'],
      correctAnswer: 1,
      explanation: 'The Happiness Guardian celebrates your wisdom! Regular exercise releases endorphins, your body\'s natural "happiness potions" that boost mood and reduce stress.',
      category: 'mental',
      difficulty: 'medium',
      storyContext: 'In the temple\'s courtyard, you meet the Happiness Guardian, a joyful spirit who dances with golden light and teaches the secrets of natural mood enhancement.'
    },
    {
      id: 'mental-3',
      question: 'The Stress Alchemist asks: "What transforms the poison of chronic stress into the medicine of resilience?"',
      options: ['Ignoring problems', 'Mindfulness and self-care', 'Working harder', 'Avoiding all challenges'],
      correctAnswer: 1,
      explanation: 'The Stress Alchemist reveals that mindfulness practices and regular self-care transform stress from a destructive force into a teacher of resilience.',
      category: 'mental',
      difficulty: 'medium',
      storyContext: 'In the temple\'s alchemy chamber, the Stress Alchemist works with bubbling potions, showing how to transform life\'s challenges into wisdom and strength.'
    },
    {
      id: 'mental-4',
      question: 'The Sleep Priestess asks: "What ritual prepares your mind for the sacred journey into restorative sleep?"',
      options: ['Drinking coffee', 'A consistent bedtime routine', 'Watching exciting movies', 'Eating large meals'],
      correctAnswer: 1,
      explanation: 'The Sleep Priestess teaches that a consistent, calming bedtime routine signals to your mind and body that it\'s time to enter the healing realm of sleep.',
      category: 'mental',
      difficulty: 'easy',
      storyContext: 'In the temple\'s moonlit chamber, the Sleep Priestess performs nightly rituals that guide visitors into peaceful, restorative slumber.'
    },
    {
      id: 'mental-5',
      question: 'The Gratitude Keeper asks: "What simple daily practice can rewire your brain for greater happiness and resilience?"',
      options: ['Complaining more', 'Practicing gratitude', 'Avoiding people', 'Staying indoors'],
      correctAnswer: 1,
      explanation: 'The Gratitude Keeper reveals that regularly practicing gratitude literally rewires your brain to notice more positive experiences and build emotional resilience.',
      category: 'mental',
      difficulty: 'medium',
      storyContext: 'In the temple\'s garden of reflection, the Gratitude Keeper tends to flowers that bloom brighter when appreciated, teaching the transformative power of thankfulness.'
    },

    // Emergency Hero - The Crisis Academy (5 unique questions)
    {
      id: 'emergency-1',
      question: 'The Emergency Instructor presents a critical scenario: "A fellow adventurer is choking. What is your first heroic action?"',
      options: ['Give them water', 'Perform the Heimlich maneuver', 'Tell them to cough harder', 'Wait and see'],
      correctAnswer: 1,
      explanation: 'The Emergency Instructor commends your heroic knowledge! The Heimlich maneuver can save a life by dislodging the obstruction from the airway.',
      category: 'emergency',
      difficulty: 'hard',
      storyContext: 'You enter the Crisis Academy, where the Emergency Instructor trains heroes to save lives. The atmosphere is serious but filled with the noble purpose of helping others.'
    },
    {
      id: 'emergency-2',
      question: 'The First Aid Master asks: "A companion has a severe allergic reaction. What emergency number should you call in most countries?"',
      options: ['411', '911 or local emergency number', '311', '211'],
      correctAnswer: 1,
      explanation: 'The First Aid Master nods with approval. 911 (or your local emergency number) connects you to life-saving help when every second counts.',
      category: 'emergency',
      difficulty: 'medium',
      storyContext: 'In the academy\'s emergency simulation room, the First Aid Master creates realistic scenarios to test your ability to respond to medical crises.'
    },
    {
      id: 'emergency-3',
      question: 'The Burn Specialist asks: "What is the immediate treatment for a minor burn?"',
      options: ['Apply ice directly', 'Cool running water for 10-20 minutes', 'Use butter or oil', 'Ignore it'],
      correctAnswer: 1,
      explanation: 'The Burn Specialist teaches that cool (not cold) running water for 10-20 minutes is the best immediate treatment for minor burns.',
      category: 'emergency',
      difficulty: 'medium',
      storyContext: 'In the academy\'s treatment wing, the Burn Specialist demonstrates proper burn care using flowing water that seems to have magical healing properties.'
    },
    {
      id: 'emergency-4',
      question: 'The Heart Guardian asks: "What are the warning signs of a heart attack that every hero should recognize?"',
      options: ['Only chest pain', 'Chest pain, shortness of breath, nausea, sweating', 'Just feeling tired', 'Headache only'],
      correctAnswer: 1,
      explanation: 'The Heart Guardian emphasizes that heart attacks can present with multiple symptoms: chest pain, shortness of breath, nausea, sweating, and arm pain.',
      category: 'emergency',
      difficulty: 'hard',
      storyContext: 'In the academy\'s cardiac wing, the Heart Guardian teaches the vital signs that can help heroes recognize when someone\'s heart is in danger.'
    },
    {
      id: 'emergency-5',
      question: 'The Poison Control Sage asks: "If someone accidentally ingests a harmful substance, what should you do first?"',
      options: ['Make them vomit', 'Call Poison Control immediately', 'Give them milk', 'Wait to see what happens'],
      correctAnswer: 1,
      explanation: 'The Poison Control Sage stresses that calling Poison Control (1-800-222-1222 in the US) immediately is crucial, as they can provide specific guidance for each situation.',
      category: 'emergency',
      difficulty: 'hard',
      storyContext: 'In the academy\'s toxicology lab, the Poison Control Sage maintains antidotes and teaches the critical importance of immediate professional guidance in poisoning cases.'
    }
  ];

  const storyChapters = [
    "Welcome, brave health seeker! You stand at the entrance to the Realm of Wellness, where ancient wisdom meets modern knowledge. Your quest is to become a true Health Champion by mastering the secrets of natural healing and wellness.",
    "As you progress through the realm, you unlock new territories filled with greater challenges and deeper wisdom. Each correct answer strengthens your health knowledge and brings you closer to becoming a legendary Health Hero.",
    "The realm recognizes your growing wisdom! New lands of knowledge open before you, revealing advanced secrets of nutrition, herbal medicine, and emergency care. Your journey transforms you into a guardian of health.",
    "You have achieved great wisdom, Health Champion! The final challenges await in the most sacred temples of the realm, where only the most dedicated seekers can unlock the ultimate secrets of wellness and healing.",
    "Congratulations, Master of Health! You have completed your quest and earned the title of Health Legend. Your knowledge now serves as a beacon of hope and healing for all who seek the path of wellness."
  ];

  const encouragingMessages = [
    "Excellent! Your wisdom grows stronger! 🌟",
    "Brilliant! You're becoming a true Health Champion! 💪",
    "Amazing! The realm recognizes your dedication! ✨",
    "Outstanding! Your knowledge lights the way for others! 🎉",
    "Incredible! You're mastering the ancient health secrets! 🏆",
    "Wonderful! Your healing wisdom expands! 🌈",
    "Superb! You're on the path to Health Mastery! ⚡",
    "Magnificent! The Health Spirits smile upon you! 🌟"
  ];

  useEffect(() => {
    announceToScreenReader('Health Quest Quiz Adventure loaded. Answer questions to unlock new health knowledge levels.');
    
    // Welcome message - only speak once per session
    if (!hasSpokenWelcome) {
      resetSpeechCount();
      speak('Welcome to Health Quest! This is an epic adventure game where you answer health questions to level up and unlock new categories. Each question is part of an engaging story. Are you ready to become a Health Champion?');
      setHasSpokenWelcome(true);
    }
  }, [announceToScreenReader, speak, resetSpeechCount, hasSpokenWelcome]);

  const getRandomQuestion = (category: string): Question => {
    const categoryQuestions = questions.filter(q => 
      q.category === category && !usedQuestions.has(q.id)
    );
    
    if (categoryQuestions.length === 0) {
      // Reset used questions for this category if all have been used
      const allCategoryQuestions = questions.filter(q => q.category === category);
      setUsedQuestions(prev => {
        const newSet = new Set(prev);
        allCategoryQuestions.forEach(q => newSet.delete(q.id));
        return newSet;
      });
      return allCategoryQuestions[Math.floor(Math.random() * allCategoryQuestions.length)];
    }
    
    return categoryQuestions[Math.floor(Math.random() * categoryQuestions.length)];
  };

  const startGame = () => {
    setGameStarted(true);
    setStoryText(storyChapters[0]);
    setUsedQuestions(new Set());
    loadNextQuestion();
    announceToScreenReader('Health Quest started! Answer questions to gain experience and level up.');
    resetSpeechCount();
    speak(storyChapters[0]);
  };

  const loadNextQuestion = () => {
    const question = getRandomQuestion(selectedCategory);
    setCurrentQuestion(question);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setStoryText(question.storyContext);
    
    // Mark question as used
    setUsedQuestions(prev => new Set(prev).add(question.id));
    
    announceToScreenReader(`New quest challenge: ${question.question}`);
    resetSpeechCount();
    speak(`${question.storyContext} ${question.question}`);
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
    const experienceGained = isCorrect ? 15 : 8; // More XP for story-based game
    const newProgress = {
      ...progress,
      questionsAnswered: progress.questionsAnswered + 1,
      correctAnswers: isCorrect ? progress.correctAnswers + 1 : progress.correctAnswers,
      experience: progress.experience + experienceGained
    };

    // Check for level up and story progression
    const newLevel = Math.floor(newProgress.experience / 75) + 1; // Adjusted for story progression
    if (newLevel > progress.level) {
      newProgress.level = newLevel;
      newProgress.currentStoryChapter = Math.min(newLevel, storyChapters.length);
      
      // Unlock new categories
      const unlockedCategories = categories
        .filter(cat => cat.unlockLevel <= newLevel)
        .map(cat => cat.id);
      newProgress.unlockedCategories = unlockedCategories;

      announceToScreenReader(`Level up! You are now level ${newLevel}! New chapter unlocked!`);
      resetSpeechCount();
      speak(`Congratulations! You leveled up to level ${newLevel}! ${storyChapters[Math.min(newLevel - 1, storyChapters.length - 1)]}`);
    }

    setProgress(newProgress);

    // Provide feedback with story context
    if (isCorrect) {
      const message = encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)];
      announceToScreenReader(`Correct! ${message} ${currentQuestion.explanation}`);
      resetSpeechCount();
      speak(`Correct! ${message} ${currentQuestion.explanation}`);
    } else {
      announceToScreenReader(`The quest continues. ${currentQuestion.explanation}`);
      resetSpeechCount();
      speak(`Not quite right, but every challenge teaches us something valuable. ${currentQuestion.explanation}`);
    }

    // Store quest completion on blockchain
    try {
      await BlockchainService.storeQuizCompletionHash(
        'anonymous-user',
        `Health Quest - ${currentQuestion.category}`,
        isCorrect ? 1 : 0,
        [{
          question: currentQuestion.question,
          selectedAnswer: currentQuestion.options[selectedAnswer],
          correct: isCorrect,
          storyContext: currentQuestion.storyContext
        }]
      );
    } catch (error) {
      console.warn('Blockchain storage failed:', error);
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
    setUsedQuestions(new Set()); // Reset used questions for new category
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
      unlockedCategories: ['basics'],
      currentStoryChapter: 1
    });
    setGameStarted(false);
    setCurrentQuestion(null);
    setSelectedCategory('basics');
    setStoryText('');
    setUsedQuestions(new Set());
    announceToScreenReader('Game reset. Ready to start a new health quest adventure!');
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
            🎮 Health Quest - Epic Adventure
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Embark on an epic story-driven adventure! Answer health questions to progress through 
            mystical realms, level up your character, and become the ultimate Health Champion!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Game Area */}
          <div className="lg:col-span-2 space-y-6">
            {!gameStarted ? (
              /* Start Screen */
              <Card className="text-center py-12">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Scroll className="w-10 h-10 text-primary-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Begin Your Health Quest!</h2>
                <p className="text-gray-600 mb-6 max-w-md mx-auto">
                  Enter the Realm of Wellness where ancient wisdom meets modern health knowledge. 
                  Answer story-driven questions to unlock new territories and become a Health Legend!
                </p>
                <Button variant="primary" size="large" onClick={startGame}>
                  <Sparkles className="mr-2 h-5 w-5" />
                  Start Epic Adventure
                </Button>
              </Card>
            ) : (
              /* Game Content */
              <div className="space-y-6">
                {/* Story Context */}
                {storyText && (
                  <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
                    <div className="flex items-start space-x-3">
                      <Scroll className="h-6 w-6 text-purple-600 flex-shrink-0 mt-1" />
                      <div>
                        <h3 className="font-semibold text-purple-900 mb-2">📖 Story Chapter {progress.currentStoryChapter}</h3>
                        <p className="text-purple-800 leading-relaxed">{storyText}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Question Display */}
                {currentQuestion && (
                  <Card>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">
                        {categories.find(c => c.id === selectedCategory)?.name} Challenge
                      </h2>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                          {currentQuestion.difficulty.charAt(0).toUpperCase() + currentQuestion.difficulty.slice(1)}
                        </span>
                        <span className="text-sm text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                          Level {progress.level}
                        </span>
                      </div>
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
                        <h4 className="font-semibold text-blue-900 mb-2">Quest Wisdom:</h4>
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
                          Continue Quest <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Player Progress */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Health Champion Status</h3>
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
                      style={{ width: `${(progress.experience % 75) * 100 / 75}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {75 - (progress.experience % 75)} XP to next level
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-xl font-bold text-success-600">
                      {progress.correctAnswers}
                    </div>
                    <div className="text-xs text-gray-600">Victories</div>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-secondary-600">
                      {getAccuracyPercentage()}%
                    </div>
                    <div className="text-xs text-gray-600">Wisdom</div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quest Categories */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quest Realms</h3>
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
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quest Controls</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  onClick={resetGame}
                  fullWidth
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  New Adventure
                </Button>
              </div>
            </Card>

            {/* Achievements */}
            <Card className="bg-yellow-50 border-yellow-200">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">🏆 Quest Achievements</h3>
              <div className="space-y-2 text-sm">
                {progress.questionsAnswered >= 5 && (
                  <div className="flex items-center text-yellow-700">
                    <Star className="h-4 w-4 mr-2" />
                    Curious Explorer (5+ questions)
                  </div>
                )}
                {progress.level >= 3 && (
                  <div className="flex items-center text-yellow-700">
                    <Trophy className="h-4 w-4 mr-2" />
                    Health Adventurer (Level 3+)
                  </div>
                )}
                {getAccuracyPercentage() >= 80 && progress.questionsAnswered >= 5 && (
                  <div className="flex items-center text-yellow-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Wisdom Master (80%+ accuracy)
                  </div>
                )}
                {progress.level >= 5 && (
                  <div className="flex items-center text-yellow-700">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Health Legend (Max Level)
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