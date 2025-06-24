import React, { useState, useRef, useEffect } from 'react';
import { Send, Heart, Loader2 } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { AIServices } from '../services/aiServices';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const conversationsEndRef = useRef<HTMLDivElement>(null);

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  useEffect(() => {
    announceToScreenReader('Ask AI page loaded. You can type or speak your health questions here.');
    speak('Hello! I am your AI health companion. You can ask me any health-related questions by typing or using the voice button. How can I help you today?');
  }, [announceToScreenReader, speak]);

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
      // Generate AI response
      const aiAnswer = AIServices.generateHealthResponse(userQuestion, 'general');
      setCurrentResponse(aiAnswer);
      
      const newConversation: AIConversation = {
        id: Date.now().toString(),
        question: userQuestion,
        answer: aiAnswer,
        timestamp: new Date(),
      };

      setConversations(prev => [...prev, newConversation]);
      
      // Announce and speak the response using ElevenLabs (or fallback)
      announceToScreenReader('AI response received');
      
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
          user_id: 'anonymous-user', // In production, use actual user ID
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <TavusAvatar 
            message={currentResponse || "I'm ready to answer your health questions!"}
            autoPlay={!!currentResponse}
            className="mb-6"
          />
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Ask Your AI Health Companion</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get instant, accessible health guidance with voice and video responses. 
            Ask questions by typing or using voice input with ElevenLabs and Tavus integration.
          </p>
        </div>

        {/* Conversation History */}
        <div className="mb-8 space-y-6 max-h-96 overflow-y-auto">
          {conversations.length === 0 ? (
            <Card className="text-center py-12">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-primary-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to AI Health Chat</h3>
              <p className="text-gray-600">Ask me anything about natural health, wellness, or symptoms. I'm here to help!</p>
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
                        <span className="text-xs text-gray-500 mt-2 block">
                          AI Health Companion • {conv.timestamp.toLocaleTimeString()}
                        </span>
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
                placeholder="Type your health question here... (e.g., 'I have a headache and feel tired', 'How can I sleep better naturally?')"
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

        {/* Disclaimer */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <strong>Important:</strong> This AI provides general wellness information and natural health suggestions. 
            Always consult qualified healthcare professionals for medical diagnosis and treatment. 
            In emergencies, call your local emergency services immediately.
          </p>
        </div>
      </div>
    </main>
  );
};

export default AskAI;