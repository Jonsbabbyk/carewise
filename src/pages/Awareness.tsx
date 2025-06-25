import React, { useState, useEffect } from 'react';
import { BookOpen, Play, CheckCircle, Award, Leaf, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { AIServices } from '../services/aiServices';
import { BlockchainService } from '../services/blockchainService';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import TavusAvatar from '../components/UI/TavusAvatar';

interface HealthLesson {
  id: string;
  title: string;
  description: string;
  content: string;
  remedy: string;
  benefits: string[];
  preparation: string;
  cautions: string;
  aiResponse: string;
}

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const Awareness: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<HealthLesson | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [isPlayingLesson, setIsPlayingLesson] = useState(false);
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  const { announceToScreenReader } = useAccessibility();
  const { speak, resetSpeechCount } = useVoice();

  // Expanded natural remedies (10+ unique remedies)
  const healthLessons: HealthLesson[] = [
    {
      id: 'sunlight',
      title: 'The Power of Sunlight',
      description: 'Learn how natural sunlight boosts vitamin D and improves mood',
      content: 'Sunlight is one of nature\'s most powerful healers. When your skin is exposed to sunlight, it produces vitamin D, which is essential for bone health, immune function, and mood regulation. Just 10-15 minutes of morning sunlight can help regulate your circadian rhythm and improve sleep quality.',
      remedy: 'Morning Sun Exposure',
      benefits: ['Vitamin D production', 'Improved mood', 'Better sleep', 'Stronger bones', 'Enhanced immune system'],
      preparation: 'Spend 10-15 minutes in morning sunlight (before 10 AM) with arms and face exposed. Avoid harsh midday sun.',
      cautions: 'Always protect your skin from overexposure. Use sunscreen for extended periods outdoors.',
      aiResponse: 'Sunlight therapy has been used for thousands of years. The UV-B rays trigger vitamin D synthesis in your skin, which acts more like a hormone than a vitamin. This supports calcium absorption, immune function, and mental health. Morning sunlight also helps reset your circadian rhythm for better sleep patterns.'
    },
    {
      id: 'ginger',
      title: 'Ginger: Nature\'s Medicine',
      description: 'Discover the anti-inflammatory and digestive benefits of ginger',
      content: 'Ginger has been used for thousands of years as a natural medicine. It contains powerful compounds called gingerols that have anti-inflammatory and antioxidant properties. Ginger is particularly effective for nausea, digestive issues, and reducing inflammation in the body.',
      remedy: 'Fresh Ginger Tea',
      benefits: ['Reduces nausea', 'Aids digestion', 'Anti-inflammatory', 'Boosts immunity', 'Relieves pain'],
      preparation: 'Slice 1 inch of fresh ginger root, steep in hot water for 10 minutes. Add honey and lemon to taste.',
      cautions: 'Consult healthcare providers if taking blood thinners. Start with small amounts.',
      aiResponse: 'Ginger contains over 400 bioactive compounds, with gingerol being the most potent. It works by inhibiting inflammatory pathways and supporting digestive enzyme production. Studies show it\'s as effective as some medications for motion sickness and morning sickness during pregnancy.'
    },
    {
      id: 'aloe',
      title: 'Aloe Vera: The Healing Plant',
      description: 'Explore the soothing and healing properties of aloe vera',
      content: 'Aloe vera is known as the "plant of immortality" and has been used for healing for over 4,000 years. The gel inside aloe leaves contains vitamins, minerals, amino acids, and antioxidants that promote healing and reduce inflammation.',
      remedy: 'Fresh Aloe Gel',
      benefits: ['Soothes burns', 'Heals wounds', 'Moisturizes skin', 'Reduces inflammation', 'Aids digestion'],
      preparation: 'Cut an aloe leaf, extract the clear gel, and apply directly to skin or consume small amounts.',
      cautions: 'Use only the clear gel, avoid the yellow latex. Test on small skin area first.',
      aiResponse: 'Aloe vera contains over 75 active compounds including vitamins A, C, E, and B12, plus minerals like zinc and magnesium. The polysaccharides in aloe gel stimulate immune function and wound healing, while its anti-inflammatory properties come from compounds like salicylic acid.'
    },
    {
      id: 'moringa',
      title: 'Moringa: The Miracle Tree',
      description: 'Learn about the nutritional powerhouse called moringa',
      content: 'Moringa is often called the "miracle tree" because every part of the plant is nutritious and beneficial. The leaves are packed with vitamins A, C, and E, calcium, potassium, and protein. Moringa has been used traditionally to boost energy and support overall health.',
      remedy: 'Moringa Leaf Powder',
      benefits: ['Rich in nutrients', 'Boosts energy', 'Supports immunity', 'Antioxidant properties', 'Supports heart health'],
      preparation: 'Mix 1 teaspoon of moringa powder in water, smoothies, or sprinkle on food daily.',
      cautions: 'Start with small amounts. Pregnant women should consult healthcare providers.',
      aiResponse: 'Moringa leaves contain 7 times more vitamin C than oranges, 4 times more calcium than milk, and 3 times more potassium than bananas. The isothiocyanates in moringa have powerful anti-inflammatory and antimicrobial properties, making it excellent for immune support.'
    },
    {
      id: 'turmeric',
      title: 'Turmeric: Golden Healer',
      description: 'Discover the powerful anti-inflammatory properties of turmeric',
      content: 'Turmeric contains curcumin, one of nature\'s most powerful anti-inflammatory compounds. Used in Ayurvedic medicine for thousands of years, turmeric supports joint health, brain function, and overall wellness.',
      remedy: 'Golden Milk (Turmeric Latte)',
      benefits: ['Reduces inflammation', 'Supports joint health', 'Boosts brain function', 'Antioxidant properties', 'Supports liver health'],
      preparation: 'Mix 1 tsp turmeric powder with warm milk, add black pepper and honey. Heat gently and drink before bed.',
      cautions: 'May interact with blood thinners. Avoid large amounts if you have gallstones.',
      aiResponse: 'Curcumin, turmeric\'s active compound, is poorly absorbed alone but black pepper increases absorption by 2000%. It works by inhibiting inflammatory enzymes and supporting the body\'s natural antioxidant systems. Research shows it may be as effective as some anti-inflammatory drugs.'
    },
    {
      id: 'echinacea',
      title: 'Echinacea: Immune Booster',
      description: 'Learn how echinacea supports immune system function',
      content: 'Echinacea is a purple flower native to North America, traditionally used by Native Americans for immune support. Modern research shows it can help reduce the duration and severity of cold symptoms.',
      remedy: 'Echinacea Tea',
      benefits: ['Boosts immune function', 'Reduces cold duration', 'Anti-viral properties', 'Supports respiratory health', 'Reduces inflammation'],
      preparation: 'Steep 1-2 tsp dried echinacea in hot water for 10-15 minutes. Drink 2-3 times daily during illness.',
      cautions: 'Avoid if allergic to ragweed family plants. Don\'t use continuously for more than 8 weeks.',
      aiResponse: 'Echinacea contains alkamides, glycoproteins, and polysaccharides that stimulate various immune cells including macrophages and natural killer cells. Studies show it can reduce cold symptoms by up to 58% when taken at first signs of illness.'
    },
    {
      id: 'garlic',
      title: 'Garlic: Nature\'s Antibiotic',
      description: 'Explore garlic\'s antimicrobial and cardiovascular benefits',
      content: 'Garlic has been used medicinally for over 5,000 years. It contains allicin, a powerful compound with antimicrobial, antiviral, and cardiovascular protective properties.',
      remedy: 'Raw Garlic Preparation',
      benefits: ['Antimicrobial properties', 'Supports heart health', 'Lowers blood pressure', 'Boosts immunity', 'Anti-cancer properties'],
      preparation: 'Crush 1-2 fresh garlic cloves, let sit 10 minutes to activate allicin, then consume with food.',
      cautions: 'May interact with blood thinners. Can cause stomach upset if taken on empty stomach.',
      aiResponse: 'Allicin is formed when garlic is crushed or chopped, converting alliin into this powerful compound. It has broad-spectrum antimicrobial activity and can help reduce blood pressure and cholesterol levels. The sulfur compounds in garlic also support liver detoxification.'
    },
    {
      id: 'chamomile',
      title: 'Chamomile: Gentle Calmer',
      description: 'Discover chamomile\'s soothing and sleep-promoting properties',
      content: 'Chamomile is one of the most gentle and widely used herbs for relaxation and sleep. It contains apigenin, a compound that binds to brain receptors to promote calmness and reduce anxiety.',
      remedy: 'Chamomile Tea',
      benefits: ['Promotes sleep', 'Reduces anxiety', 'Soothes digestion', 'Anti-inflammatory', 'Skin healing'],
      preparation: 'Steep 1-2 tsp dried chamomile flowers in hot water for 5-10 minutes. Drink 30 minutes before bedtime.',
      cautions: 'Avoid if allergic to ragweed family. May interact with blood thinners.',
      aiResponse: 'Chamomile\'s apigenin binds to benzodiazepine receptors in the brain, producing mild sedative effects without dependency. It also contains bisabolol and chamazulene, which have anti-inflammatory and antimicrobial properties, making it excellent for digestive and skin issues.'
    },
    {
      id: 'lavender',
      title: 'Lavender: Aromatic Healer',
      description: 'Learn about lavender\'s calming and therapeutic properties',
      content: 'Lavender is renowned for its calming fragrance and therapeutic properties. The essential oils in lavender flowers have been shown to reduce anxiety, improve sleep quality, and promote wound healing.',
      remedy: 'Lavender Essential Oil',
      benefits: ['Reduces anxiety', 'Improves sleep', 'Relieves headaches', 'Heals minor wounds', 'Antimicrobial properties'],
      preparation: 'Add 2-3 drops to a diffuser, or dilute in carrier oil for topical use. Dried flowers can be used for tea.',
      cautions: 'Essential oil should be diluted before skin application. Avoid during pregnancy.',
      aiResponse: 'Lavender\'s main compounds, linalool and linalyl acetate, interact with the nervous system to promote relaxation. Inhaling lavender can reduce cortisol levels and activate the parasympathetic nervous system, leading to decreased heart rate and blood pressure.'
    },
    {
      id: 'green-tea',
      title: 'Green Tea: Antioxidant Powerhouse',
      description: 'Explore green tea\'s antioxidant and metabolic benefits',
      content: 'Green tea contains powerful antioxidants called catechins, particularly EGCG (epigallocatechin gallate). These compounds support brain health, metabolism, and may help prevent various diseases.',
      remedy: 'Daily Green Tea',
      benefits: ['High in antioxidants', 'Boosts metabolism', 'Supports brain health', 'May prevent cancer', 'Improves heart health'],
      preparation: 'Steep green tea leaves in 175°F water for 2-3 minutes. Drink 2-3 cups daily between meals.',
      cautions: 'Contains caffeine. Avoid on empty stomach. May interact with iron absorption.',
      aiResponse: 'EGCG in green tea is one of the most potent antioxidants known, with 25-100 times the antioxidant power of vitamins C and E. It supports mitochondrial function, enhances fat oxidation, and may help protect against neurodegenerative diseases through its neuroprotective effects.'
    }
  ];

  const generateQuiz = (lesson: HealthLesson): QuizQuestion[] => {
    return [
      {
        id: `${lesson.id}-q1`,
        question: `What is the main active compound in ${lesson.remedy}?`,
        options: [
          lesson.id === 'turmeric' ? 'Curcumin' : lesson.id === 'ginger' ? 'Gingerol' : lesson.id === 'garlic' ? 'Allicin' : lesson.id === 'sunlight' ? 'Vitamin D' : lesson.id === 'echinacea' ? 'Alkamides' : 'Active compounds',
          'Caffeine',
          'Sugar',
          'Salt'
        ],
        correctAnswer: 0,
        explanation: `${lesson.remedy} contains powerful bioactive compounds that give it its therapeutic properties. ${lesson.aiResponse.split('.')[0]}.`
      },
      {
        id: `${lesson.id}-q2`,
        question: `Which of these is a primary benefit of ${lesson.remedy}?`,
        options: lesson.benefits.slice(0, 3).concat(['Causes drowsiness']),
        correctAnswer: 0,
        explanation: `${lesson.remedy} is particularly known for ${lesson.benefits[0].toLowerCase()}, among its many other health benefits.`
      },
      {
        id: `${lesson.id}-q3`,
        question: `How should you prepare ${lesson.remedy}?`,
        options: [
          lesson.preparation.substring(0, 50) + '...',
          'Boil for 30 minutes',
          'Mix with alcohol only',
          'Use only at night'
        ],
        correctAnswer: 0,
        explanation: lesson.preparation
      },
      {
        id: `${lesson.id}-q4`,
        question: `What precaution should you take with ${lesson.remedy}?`,
        options: [
          'No precautions needed',
          lesson.cautions.substring(0, 50) + '...',
          'Only use once per year',
          'Mix with sugar'
        ],
        correctAnswer: 1,
        explanation: lesson.cautions
      },
      {
        id: `${lesson.id}-q5`,
        question: `According to traditional use, ${lesson.title.split(':')[0]} has been used for approximately how long?`,
        options: [
          lesson.content.includes('thousands') ? 'Thousands of years' : lesson.content.includes('4,000') ? '4,000+ years' : 'Hundreds of years',
          'Only recently discovered',
          'Since the 1900s',
          'About 50 years'
        ],
        correctAnswer: 0,
        explanation: `${lesson.title.split(':')[0]} has a long history of traditional use, as mentioned in ancient texts and traditional medicine systems.`
      }
    ];
  };

  useEffect(() => {
    announceToScreenReader('Health Awareness page loaded. Choose a natural health lesson to begin learning.');
    
    // Only speak welcome message once per session
    if (!hasSpokenWelcome) {
      resetSpeechCount();
      speak('Welcome to Natural Health Awareness! Here you can learn about 10 unique natural remedies with detailed information and quizzes. Each remedy includes AI-powered educational content. Which topic would you like to explore?');
      setHasSpokenWelcome(true);
    }
  }, [announceToScreenReader, speak, hasSpokenWelcome, resetSpeechCount]);

  const startLesson = (lesson: HealthLesson) => {
    setSelectedLesson(lesson);
    setIsPlayingLesson(true);
    resetSpeechCount();
    announceToScreenReader(`Starting lesson: ${lesson.title}`);
    
    // Generate and play lesson content with AI response
    const lessonScript = `${lesson.content} ${lesson.aiResponse}`;
    
    AIServices.generateSpeech(lessonScript).catch(() => speak(lessonScript));
  };

  const startQuiz = () => {
    if (!selectedLesson) return;
    
    const quiz = generateQuiz(selectedLesson);
    setCurrentQuiz(quiz);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowQuizResults(false);
    setIsPlayingLesson(false);
    
    resetSpeechCount();
    announceToScreenReader(`Starting quiz for ${selectedLesson.title}. Question 1 of ${quiz.length}`);
    speak(quiz[0].question);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
    announceToScreenReader(`Selected answer: ${currentQuiz[currentQuestionIndex].options[answerIndex]}`);
  };

  const submitAnswer = async () => {
    if (selectedAnswer === null) return;

    const currentQuestion = currentQuiz[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setQuizScore(prev => prev + 1);
      speak('Correct! ' + currentQuestion.explanation);
      announceToScreenReader('Correct answer! ' + currentQuestion.explanation);
    } else {
      speak('Not quite right. ' + currentQuestion.explanation);
      announceToScreenReader('Incorrect. ' + currentQuestion.explanation);
    }

    // Move to next question or show results
    setTimeout(async () => {
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        const nextQuestion = currentQuiz[currentQuestionIndex + 1];
        announceToScreenReader(`Question ${currentQuestionIndex + 2} of ${currentQuiz.length}`);
        resetSpeechCount();
        speak(nextQuestion.question);
      } else {
        // Quiz complete
        setShowQuizResults(true);
        const finalScore = isCorrect ? quizScore + 1 : quizScore;
        announceToScreenReader(`Quiz complete! You scored ${finalScore} out of ${currentQuiz.length}`);
        resetSpeechCount();
        speak(`Congratulations! You completed the quiz with a score of ${finalScore} out of ${currentQuiz.length}. Great job learning about natural health!`);
        
        // Store quiz completion on blockchain
        if (selectedLesson) {
          try {
            const answers = currentQuiz.map((q, index) => ({
              question: q.question,
              selectedAnswer: index === currentQuestionIndex ? selectedAnswer : null,
              correct: index < currentQuestionIndex ? true : isCorrect
            }));
            
            await BlockchainService.storeQuizCompletionHash(
              'anonymous-user',
              selectedLesson.title,
              finalScore,
              answers
            );
          } catch (error) {
            console.warn('Blockchain storage failed:', error);
          }
        }
        
        // Save quiz results to Supabase
        if (selectedLesson) {
          try {
            await supabase.from('quiz_results').insert({
              user_id: 'anonymous-user',
              quiz_topic: selectedLesson.title,
              score: finalScore,
              total_questions: currentQuiz.length,
            });
          } catch (error) {
            console.error('Error saving quiz results:', error);
          }
        }
      }
    }, 3000);
  };

  const resetLesson = () => {
    setSelectedLesson(null);
    setCurrentQuiz([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setQuizScore(0);
    setShowQuizResults(false);
    setIsPlayingLesson(false);
    resetSpeechCount();
    announceToScreenReader('Returned to lesson selection');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-success-50 via-white to-primary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-success-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <BookOpen className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Natural Health Awareness</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Learn about 10+ unique natural remedies with interactive video lessons, 
            AI-powered educational content, and comprehensive quizzes. All content is fully accessible.
          </p>
        </div>

        {!selectedLesson ? (
          /* Lesson Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {healthLessons.map((lesson) => (
              <Card 
                key={lesson.id}
                hover
                clickable
                onClick={() => startLesson(lesson)}
                className="border-2 border-success-200 hover:border-success-400 transition-all duration-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Leaf className="h-6 w-6 text-success-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{lesson.title}</h3>
                    <p className="text-gray-600 mb-4">{lesson.description}</p>
                    <div className="flex items-center text-success-600 font-semibold">
                      <Play className="mr-2 h-4 w-4" />
                      Start Lesson
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          /* Lesson Content */
          <div className="space-y-8">
            {/* Back Button */}
            <Button variant="outline" onClick={resetLesson}>
              ← Back to Lessons
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Video/Avatar Section */}
              <div>
                <Card>
                  <TavusAvatar 
                    message={isPlayingLesson ? `${selectedLesson.content} ${selectedLesson.aiResponse}` : ''}
                    autoPlay={isPlayingLesson}
                    className="mb-6"
                    onComplete={() => setIsPlayingLesson(false)}
                  />
                  
                  <div className="text-center space-y-4">
                    <h2 className="text-2xl font-bold text-gray-900">{selectedLesson.title}</h2>
                    <p className="text-gray-600">{selectedLesson.description}</p>
                    
                    {!isPlayingLesson && (
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button 
                          variant="success" 
                          onClick={() => startLesson(selectedLesson)}
                          fullWidth
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Replay Lesson
                        </Button>
                        <Button 
                          variant="primary" 
                          onClick={startQuiz}
                          fullWidth
                        >
                          <Award className="mr-2 h-4 w-4" />
                          Take Quiz (5 Questions)
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              </div>

              {/* Content Section */}
              <div className="space-y-6">
                {/* Lesson Content */}
                <Card>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">About {selectedLesson.remedy}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">{selectedLesson.content}</p>
                  
                  {/* AI Educational Response */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-blue-900 mb-2">🤖 AI Educational Insight:</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{selectedLesson.aiResponse}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Benefits:</h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-700">
                        {selectedLesson.benefits.map((benefit, index) => (
                          <li key={index}>{benefit}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">How to Prepare:</h4>
                      <p className="text-gray-700">{selectedLesson.preparation}</p>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Important Notes:</h4>
                      <p className="text-gray-700">{selectedLesson.cautions}</p>
                    </div>
                  </div>
                </Card>

                {/* Quiz Section */}
                {currentQuiz.length > 0 && (
                  <Card>
                    {!showQuizResults ? (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-xl font-bold text-gray-900">Knowledge Quiz</h3>
                          <span className="text-sm text-gray-600">
                            Question {currentQuestionIndex + 1} of {currentQuiz.length}
                          </span>
                        </div>
                        
                        <div className="mb-6">
                          <h4 className="text-lg font-semibold text-gray-900 mb-4">
                            {currentQuiz[currentQuestionIndex].question}
                          </h4>
                          
                          <div className="space-y-3">
                            {currentQuiz[currentQuestionIndex].options.map((option, index) => (
                              <button
                                key={index}
                                onClick={() => handleAnswerSelect(index)}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ${
                                  selectedAnswer === index
                                    ? 'border-primary-500 bg-primary-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                                aria-pressed={selectedAnswer === index}
                              >
                                {option}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <Button
                          variant="primary"
                          onClick={submitAnswer}
                          disabled={selectedAnswer === null}
                          fullWidth
                        >
                          Submit Answer
                        </Button>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Award className="w-8 h-8 text-success-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Quiz Complete!</h3>
                        <p className="text-lg text-gray-700 mb-4">
                          You scored {quizScore} out of {currentQuiz.length}
                        </p>
                        <p className="text-gray-600 mb-6">
                          Great job learning about natural health! Your results are securely stored with blockchain technology.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-3">
                          <Button variant="success" onClick={startQuiz} fullWidth>
                            Retake Quiz
                          </Button>
                          <Button variant="outline" onClick={resetLesson} fullWidth>
                            Choose New Lesson
                          </Button>
                        </div>
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <div className="mt-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Educational Content:</strong> This information is for educational purposes only and should not replace professional medical advice. 
              Always consult healthcare providers before using natural remedies, especially if you have medical conditions or take medications.
              Your learning progress is secured with blockchain technology for privacy and data ownership.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Awareness;