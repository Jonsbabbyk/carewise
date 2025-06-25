import React, { useState, useEffect } from 'react';
import { Pill, Search, AlertTriangle, Leaf, Info } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { AIServices } from '../services/aiServices';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import VoiceButton from '../components/UI/VoiceButton';
import TavusAvatar from '../components/UI/TavusAvatar';

interface MedicineQuery {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

const Medicine: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [queries, setQueries] = useState<MedicineQuery[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [hasSpokenWelcome, setHasSpokenWelcome] = useState(false);

  const { announceToScreenReader } = useAccessibility();
  const { speak, resetSpeechCount } = useVoice();

  useEffect(() => {
    announceToScreenReader('Medicine Information page loaded. Ask questions about medications and get natural alternatives.');
    
    // Welcome message - only speak once per session
    if (!hasSpokenWelcome) {
      resetSpeechCount();
      speak('Welcome to Medicine Information! You can ask questions about medications, dosages, interactions, and natural alternatives. I will speak the full answer aloud to help with accessibility. How can I help you today?');
      setHasSpokenWelcome(true);
    }
  }, [announceToScreenReader, speak, resetSpeechCount, hasSpokenWelcome]);

  const commonQuestions = [
    {
      question: "Can children take Panadol?",
      category: "Pediatric Dosing"
    },
    {
      question: "What are natural alternatives to ibuprofen?",
      category: "Natural Alternatives"
    },
    {
      question: "How much acetaminophen is safe per day?",
      category: "Dosage Information"
    },
    {
      question: "Can I take vitamins with prescription medications?",
      category: "Drug Interactions"
    },
    {
      question: "What natural remedies help with pain relief?",
      category: "Natural Pain Relief"
    },
    {
      question: "Is it safe to take expired medications?",
      category: "Medication Safety"
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    const userQuestion = question.trim();
    setQuestion('');

    try {
      // Generate AI response for medicine questions
      const aiAnswer = AIServices.generateHealthResponse(userQuestion, 'medicine');
      setCurrentResponse(aiAnswer);
      
      const newQuery: MedicineQuery = {
        id: Date.now().toString(),
        question: userQuestion,
        answer: aiAnswer,
        timestamp: new Date(),
      };

      setQueries(prev => [...prev, newQuery]);
      
      // Announce and speak the FULL response for accessibility
      announceToScreenReader('Medicine information received. Speaking full response aloud.');
      resetSpeechCount();
      setTimeout(() => {
        // Speak the full answer aloud for accessibility
        AIServices.generateSpeech(aiAnswer).catch(() => speak(aiAnswer));
      }, 500);

    } catch (error) {
      console.error('Error generating medicine response:', error);
      announceToScreenReader('Sorry, there was an error processing your question. Please try again.');
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setQuestion(transcript);
    announceToScreenReader(`Voice input received: ${transcript}`);
  };

  const handleCommonQuestion = (commonQuestion: string) => {
    setQuestion(commonQuestion);
    announceToScreenReader(`Selected common question: ${commonQuestion}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-primary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-primary-500 rounded-full flex items-center justify-center shadow-lg">
              <Pill className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Medicine Information</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get reliable information about medications, dosages, interactions, and natural alternatives. 
            Always consult healthcare professionals for personalized medical advice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Query Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* AI Avatar Response */}
            {currentResponse && (
              <Card className="bg-blue-50 border-blue-200">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Pill className="w-6 h-6 text-blue-600" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">AI Medicine Information</h3>
                    <div className="bg-white rounded-lg p-4 border border-blue-200">
                      <p className="text-gray-800 leading-relaxed">{currentResponse}</p>
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Query Form */}
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="medicine-question" className="block text-sm font-semibold text-gray-900 mb-2">
                    Ask about medications:
                  </label>
                  <div className="relative">
                    <textarea
                      id="medicine-question"
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Ask about dosages, interactions, side effects, or natural alternatives... (e.g., 'Can kids take Panadol?', 'What are natural pain relievers?')"
                      className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-xl focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500 focus:ring-opacity-20 resize-vertical text-lg"
                      disabled={isLoading}
                      rows={4}
                    />
                    <div className="absolute top-2 right-2">
                      <VoiceButton 
                        onResult={handleVoiceResult}
                        disabled={isLoading}
                        className="!p-2"
                      />
                    </div>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  variant="secondary"
                  size="large"
                  disabled={!question.trim() || isLoading}
                  loading={isLoading}
                  fullWidth
                >
                  {isLoading ? 'Getting Information...' : (
                    <>
                      Get Medicine Information <Search className="ml-2 h-5 w-5" aria-hidden="true" />
                    </>
                  )}
                </Button>
              </form>
            </Card>

            {/* Query History */}
            <div className="space-y-4">
              {queries.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="w-12 h-12 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Pill className="w-6 h-6 text-secondary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Ask Your First Medicine Question</h3>
                  <p className="text-gray-600">Get reliable information about medications and natural alternatives.</p>
                </Card>
              ) : (
                queries.map((query) => (
                  <div key={query.id} className="space-y-4">
                    {/* User Question - Fixed text visibility */}
                    <div className="flex justify-end">
                      <Card className="max-w-sm bg-secondary-500 text-white">
                        <p className="font-medium text-white">{query.question}</p>
                        <span className="text-xs text-secondary-100 mt-2 block">
                          {query.timestamp.toLocaleTimeString()}
                        </span>
                      </Card>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <Card className="max-w-2xl bg-white border-l-4 border-primary-500">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Pill className="w-4 h-4 text-primary-600" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">{query.answer}</p>
                            <span className="text-xs text-gray-500 mt-2 block">
                              Medicine Information • {query.timestamp.toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Common Questions */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Common Questions</h3>
              <div className="space-y-2">
                {commonQuestions.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleCommonQuestion(item.question)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-secondary-300 hover:bg-secondary-50 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-secondary-500 focus:ring-opacity-20"
                  >
                    <p className="text-sm font-medium text-gray-900">{item.question}</p>
                    <p className="text-xs text-gray-600 mt-1">{item.category}</p>
                  </button>
                ))}
              </div>
            </Card>

            {/* Safety Notice */}
            <Card className="bg-yellow-50 border-yellow-200">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="h-6 w-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Safety Notice</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Always consult healthcare professionals for medical advice</li>
                    <li>• Never stop prescribed medications without doctor approval</li>
                    <li>• Check with pharmacists about drug interactions</li>
                    <li>• Follow dosage instructions carefully</li>
                    <li>• Seek immediate help for severe reactions</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Natural Alternatives Info */}
            <Card className="bg-success-50 border-success-200">
              <div className="flex items-start space-x-3">
                <Leaf className="h-6 w-6 text-success-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-success-800 mb-2">Natural Alternatives</h3>
                  <p className="text-sm text-success-700 mb-2">
                    Many natural remedies can complement traditional medicine:
                  </p>
                  <ul className="text-sm text-success-700 space-y-1">
                    <li>• Ginger for nausea and inflammation</li>
                    <li>• Turmeric for pain and inflammation</li>
                    <li>• Honey for coughs and wound healing</li>
                    <li>• Chamomile for anxiety and sleep</li>
                    <li>• Aloe vera for skin conditions</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* Emergency Contacts */}
            <Card className="bg-error-50 border-error-200">
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-error-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-error-800 mb-2">Emergency Contacts</h3>
                  <div className="text-sm text-error-700 space-y-1">
                    <p><strong>Poison Control:</strong> 1-800-222-1222</p>
                    <p><strong>Emergency:</strong> 911</p>
                    <p><strong>Pharmacy Consultation:</strong> Contact your local pharmacy</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>Medical Disclaimer:</strong> This information is for educational purposes only and should not replace professional medical advice, diagnosis, or treatment. 
              Always seek the advice of qualified healthcare providers with questions about medications, medical conditions, or treatment options. 
              Never disregard professional medical advice or delay seeking it because of information provided here.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Medicine;