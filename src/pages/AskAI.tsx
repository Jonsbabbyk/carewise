import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Loader2, Shield } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { AIServices } from '../services/aiServices';
import { BlockchainService } from '../services/blockchainService';
import { AIConversation } from '../types';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import VoiceButton from '../components/UI/VoiceButton';
import TavusAvatar from '../components/UI/TavusAvatar';

const AskAI: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentResponse, setCurrentResponse] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationsEndRef = useRef<HTMLDivElement>(null);

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  useEffect(() => {
    announceToScreenReader('Ask AI page loaded. You can type or speak your health questions here.');
    
    // Only greet once when the page loads
    if (!hasGreeted) {
      const greeting = "Hello! I'm your AI health companion with expanded medical knowledge. I can help with a wide range of health conditions, symptoms, and wellness questions. Your conversations are securely stored with blockchain technology for your privacy and data ownership. What would you like to know about your health today?";
      setCurrentResponse(greeting);
      speak(greeting);
      setHasGreeted(true);
      
      // Clear the greeting after speaking
      setTimeout(() => {
        setCurrentResponse('');
      }, 8000);
    }
  }, [announceToScreenReader, speak, hasGreeted]);

  useEffect(() => {
    // Auto-scroll to bottom when new conversations are added
    conversationsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || isLoading) return;

    setIsLoading(true);
    const userQuestion = question.trim();
    setQuestion('');

    try {
      // Generate AI response with expanded knowledge base
      const aiAnswer = AIServices.generateHealthResponse(userQuestion, 'general');
      setCurrentResponse(aiAnswer);
      
      const newConversation: AIConversation = {
        id: Date.now().toString(),
        question: userQuestion,
        answer: aiAnswer,
        timestamp: new Date(),
      };

      setConversations(prev => [...prev, newConversation]);
      
      // Store conversation hash on blockchain for data integrity
      try {
        const blockchainTxId = await BlockchainService.storeDiagnosisHash(
          'anonymous-user',
          aiAnswer,
          [userQuestion]
        );
        console.log('Conversation stored on blockchain:', blockchainTxId);
      } catch (blockchainError) {
        console.warn('Blockchain storage failed, continuing with local storage:', blockchainError);
      }
      
      // Announce and speak the response using ElevenLabs (or fallback)
      announceToScreenReader('AI response received and secured with blockchain technology');
      
      // Generate speech using ElevenLabs
      try {
        await AIServices.generateSpeech(aiAnswer);
      } catch (speechError) {
        console.error('Speech generation error:', speechError);
        // Fallback to browser speech
        setTimeout(() => speak(aiAnswer), 500);
      }

      // Save to Supabase
      try {
        await supabase.from('ai_conversations').insert({
          user_id: 'anonymous-user',
          question: userQuestion,
          answer: aiAnswer,
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Continue without blocking the user experience
      }

    } catch (error) {
      console.error('Error generating response:', error);
      announceToScreenReader('Sorry, there was an error processing your question. Please try again.');
    } finally {
      setIsLoading(false);
      setCurrentResponse('');
      textareaRef.current?.focus();
    }
  };

  const handleVoiceResult = (transcript: string) => {
    setQuestion(transcript);
    announceToScreenReader(`Voice input received: ${transcript}`);
  };

  const commonHealthQuestions = [
    "What are the symptoms of diabetes?",
    "How can I manage high blood pressure naturally?",
    "What are natural remedies for anxiety?",
    "How do I know if I have a heart condition?",
    "What foods help boost immunity?",
    "How can I improve my sleep quality?",
    "What are the signs of depression?",
    "How do I manage chronic pain naturally?",
    "What are the symptoms of thyroid problems?",
    "How can I reduce inflammation in my body?"
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <TavusAvatar 
            message={currentResponse}
            autoPlay={!!currentResponse && hasGreeted}
            className="mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ask Your AI Health Companion</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-4">
            Get instant, accessible health guidance with voice and video responses. 
            Ask questions by typing or using voice input with ElevenLabs and Tavus integration.
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-3 max-w-md mx-auto">
            <Shield className="h-4 w-4" />
            <span>🔐 Secured with Algorand blockchain technology</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Chat Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Conversation History */}
            <div className="space-y-6 max-h-96 overflow-y-auto">
              {conversations.length === 0 ? (
                <Card className="text-center py-12">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-6 h-6 text-primary-600" aria-hidden="true" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to Enhanced AI Health Chat</h3>
                  <p className="text-gray-600">Ask me about any health condition, symptoms, or wellness topic. I have expanded knowledge covering hundreds of medical conditions and natural remedies!</p>
                </Card>
              ) : (
                conversations.map((conv) => (
                  <div key={conv.id} className="space-y-4">
                    {/* User Question */}
                    <div className="flex justify-end">
                      <Card className="max-w-sm bg-primary-500 text-white">
                        <p className="font-medium">{conv.question}</p>
                        <span className="text-xs text-primary-100 mt-2 block">
                          {conv.timestamp.toLocaleTimeString()}
                        </span>
                      </Card>
                    </div>
                    
                    {/* AI Response */}
                    <div className="flex justify-start">
                      <Card className="max-w-2xl bg-white border-l-4 border-secondary-500">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-secondary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                            <Heart className="w-4 h-4 text-secondary-600" aria-hidden="true" />
                          </div>
                          <div className="flex-1">
                            <p className="text-gray-800 leading-relaxed">{conv.answer}</p>
                            <div className="flex items-center space-x-2 mt-2">
                              <span className="text-xs text-gray-500">
                                AI Health Companion • {conv.timestamp.toLocaleTimeString()}
                              </span>
                              <Shield className="h-3 w-3 text-blue-500" title="Blockchain secured" />
                            </div>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>
                ))
              )}
              <div ref={conversationsEndRef} />
            </div>

            {/* Input Form */}
            <Card className="sticky bottom-0 bg-white shadow-2xl border-2 border-primary-200">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="health-question" className="block text-sm font-semibold text-gray-900 mb-2">
                    Ask your health question:
                  </label>
                  <textarea
                    id="health-question"
                    ref={textareaRef}
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Ask about any health condition, symptoms, or wellness topic... (e.g., 'What are the symptoms of diabetes?', 'How can I manage anxiety naturally?', 'What foods help with heart health?')"
                    className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 resize-vertical text-lg"
                    disabled={isLoading}
                    rows={4}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <VoiceButton 
                    onResult={handleVoiceResult}
                    disabled={isLoading}
                    className="sm:w-auto"
                  />
                  
                  <Button
                    type="submit"
                    variant="primary"
                    size="large"
                    disabled={!question.trim() || isLoading}
                    loading={isLoading}
                    fullWidth
                    className="sm:flex-1"
                  >
                    {isLoading ? (
                      'AI is thinking...'
                    ) : (
                      <>
                        Ask AI Doctor <Send className="ml-2 h-5 w-5" aria-hidden="true" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Common Questions */}
            <Card>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Common Health Questions</h3>
              <div className="space-y-2">
                {commonHealthQuestions.map((q, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(q)}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-colors duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 text-sm"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </Card>

            {/* Blockchain Security Info */}
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">🔐 Blockchain Security</h3>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Your conversations are hashed and stored on Algorand blockchain</li>
                    <li>• Data integrity and privacy protection</li>
                    <li>• You own your health data</li>
                    <li>• Immutable health records</li>
                    <li>• Cryptographic verification available</li>
                  </ul>
                </div>
              </div>
            </Card>

            {/* AI Capabilities */}
            <Card className="bg-green-50 border-green-200">
              <h3 className="font-semibold text-green-800 mb-2">🤖 Enhanced AI Capabilities</h3>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Hundreds of medical conditions</li>
                <li>• Natural remedies and treatments</li>
                <li>• Symptom analysis and guidance</li>
                <li>• Medication information</li>
                <li>• Mental health support</li>
                <li>• Preventive care advice</li>
                <li>• Emergency guidance</li>
              </ul>
            </Card>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 text-center">
          <Card className="bg-yellow-50 border-yellow-200">
            <p className="text-sm text-yellow-800">
              <strong>Important:</strong> This AI provides general wellness information and natural health suggestions based on an expanded medical knowledge base. 
              Always consult qualified healthcare professionals for medical diagnosis and treatment. 
              In emergencies, call your local emergency services immediately. Your data is secured with blockchain technology for privacy and ownership.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default AskAI;