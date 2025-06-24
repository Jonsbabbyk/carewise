import React, { useState, useEffect } from 'react';
import { BookOpen, Play, CheckCircle, Award, Leaf } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { AIServices } from '../services/aiServices';
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

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  const healthLessons: HealthLesson[] = [
    {
      id: 'sunlight',
      title: 'The Power of Sunlight',
      description: 'Learn how natural sunlight boosts vitamin D and improves mood',
      content: 'Sunlight is one of nature\'s most powerful healers. When your skin is exposed to sunlight, it produces vitamin D, which is essential for bone health, immune function, and mood regulation. Just 10-15 minutes of morning sunlight can help regulate your circadian rhythm and improve sleep quality.',
      remedy: 'Morning Sun Exposure',
      benefits: ['Vitamin D production', 'Improved mood', 'Better sleep', 'Stronger bones', 'Enhanced immune system'],
      preparation: 'Spend 10-15 minutes in morning sunlight (before 10 AM) with arms and face exposed. Avoid harsh midday sun.',
      cautions: 'Always protect your skin from overexposure. Use sunscreen for extended periods outdoors.'
    },
    {
      id: 'ginger',
      title: 'Ginger: Nature\'s Medicine',
      description: 'Discover the anti-inflammatory and digestive benefits of ginger',
      content: 'Ginger has been used for thousands of years as a natural medicine. It contains powerful compounds called gingerols that have anti-inflammatory and antioxidant properties. Ginger is particularly effective for nausea, digestive issues, and reducing inflammation in the body.',
      remedy: 'Fresh Ginger Tea',
      benefits: ['Reduces nausea', 'Aids digestion', 'Anti-inflammatory', 'Boosts immunity', 'Relieves pain'],
      preparation: 'Slice 1 inch of fresh ginger root, steep in hot water for 10 minutes. Add honey and lemon to taste.',
      cautions: 'Consult healthcare providers if taking blood thinners. Start with small amounts.'
    },
    {
      id: 'aloe',
      title: 'Aloe Vera: The Healing Plant',
      description: 'Explore the soothing and healing properties of aloe vera',
      content: 'Aloe vera is known as the "plant of immortality" and has been used for healing for over 4,000 years. The gel inside aloe leaves contains vitamins, minerals, amino acids, and antioxidants that promote healing and reduce inflammation.',
      remedy: 'Fresh Aloe Gel',
      benefits: ['Soothes burns', 'Heals wounds', 'Moisturizes skin', 'Reduces inflammation', 'Aids digestion'],
      preparation: 'Cut an aloe leaf, extract the clear gel, and apply directly to skin or consume small amounts.',
      cautions: 'Use only the clear gel, avoid the yellow latex. Test on small skin area first.'
    },
    {
      id: 'moringa',
      title: 'Moringa: The Miracle Tree',
      description: 'Learn about the nutritional powerhouse called moringa',
      content: 'Moringa is often called the "miracle tree" because every part of the plant is nutritious and beneficial. The leaves are packed with vitamins A, C, and E, calcium, potassium, and protein. Moringa has been used traditionally to boost energy and support overall health.',
      remedy: 'Moringa Leaf Powder',
      benefits: ['Rich in nutrients', 'Boosts energy', 'Supports immunity', 'Antioxidant properties', 'Supports heart health'],
      preparation: 'Mix 1 teaspoon of moringa powder in water, smoothies, or sprinkle on food daily.',
      cautions: 'Start with small amounts. Pregnant women should consult healthcare providers.'
    }
  ];

  const generateQuiz = (lesson: HealthLesson): QuizQuestion[] => {
    return [
      {
        id: `${lesson.id}-q1`,
        question: `What is the main benefit of ${lesson.remedy}?`,
        options: lesson.benefits.slice(0, 3).concat(['None of the above']),
        correctAnswer: 0,
        explanation: `${lesson.remedy} is particularly known for ${lesson.benefits[0].toLowerCase()}, among other benefits.`
      },
      {
        id: `${lesson.id}-q2`,
        question: `How should you prepare ${lesson.remedy}?`,
        options: [
          lesson.preparation.substring(0, 50) + '...',
          'Boil for 30 minutes',
          'Mix with cold water only',
          'Use only at night'
        ],
        correctAnswer: 0,
        explanation: lesson.preparation
      },
      {
        id: `${lesson.id}-q3`,
        question: `What precaution should you take with ${lesson.remedy}?`,
        options: [
          'No precautions needed',
          lesson.cautions.substring(0, 50) + '...',
          'Only use once per year',
          'Mix with alcohol'
        ],
        correctAnswer: 1,
        explanation: lesson.cautions
      }
    ];
  };

  const startLesson = (lesson: HealthLesson) => {
    setSelectedLesson(lesson);
    setIsPlayingLesson(true);
    announceToScreenReader(`Starting lesson: ${lesson.title}`);
    
    // Generate and play lesson content
    const lessonScript = `Welcome to today's health lesson about ${lesson.title}. ${lesson.content} ${lesson.remedy} offers many benefits including ${lesson.benefits.join(', ')}. To prepare this remedy, ${lesson.preparation} Remember to ${lesson.cautions}`;
    
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
    setTimeout(() => {
      if (currentQuestionIndex < currentQuiz.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer(null);
        const nextQuestion = currentQuiz[currentQuestionIndex + 1];
        announceToScreenReader(`Question ${currentQuestionIndex + 2} of ${currentQuiz.length}`);
        speak(nextQuestion.question);
      } else {
        // Quiz complete
        setShowQuizResults(true);
        const finalScore = isCorrect ? quizScore + 1 : quizScore;
        announceToScreenReader(`Quiz complete! You scored ${finalScore} out of ${currentQuiz.length}`);
        speak(`Congratulations! You completed the quiz with a score of ${finalScore} out of ${currentQuiz.length}. Great job learning about natural health!`);
        
        // Save quiz results
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
    announceToScreenReader('Returned to lesson selection');
  };

  useEffect(() => {
    announceToScreenReader('Health Awareness page loaded. Choose a natural health lesson to begin learning.');
    speak('Welcome to Health Awareness! Here you can learn about natural remedies like sunlight, ginger, aloe vera, and moringa. Each lesson includes a quiz to test your knowledge. Which topic would you like to explore?');
  }, [announceToScreenReader, speak]);

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
            Learn about natural remedies and traditional healing methods with interactive video lessons, 
            audio narration, and knowledge quizzes. All content is fully accessible.
          </p>
        </div>

        {!selectedLesson ? (
          /* Lesson Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                    message={isPlayingLesson ? `${selectedLesson.content} This natural remedy offers ${selectedLesson.benefits.join(', ')}. ${selectedLesson.preparation}` : ''}
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
                          Take Quiz
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
                          Great job learning about natural health! Keep exploring to expand your knowledge.
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
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Awareness;