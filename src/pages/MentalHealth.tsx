import React, { useState, useEffect } from 'react';
import { Heart, Smile, Frown, Meh, AlertTriangle, Phone } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { AIServices } from '../services/aiServices';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import VoiceButton from '../components/UI/VoiceButton';
import TavusAvatar from '../components/UI/TavusAvatar';

interface MoodOption {
  id: string;
  label: string;
  emoji: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

const MentalHealth: React.FC = () => {
  const [selectedMood, setSelectedMood] = useState<string>('');
  const [moodNotes, setMoodNotes] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFirstAid, setShowFirstAid] = useState(false);

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  const moodOptions: MoodOption[] = [
    {
      id: 'great',
      label: 'Great',
      emoji: '😊',
      icon: Smile,
      color: 'success',
      description: 'Feeling wonderful and energetic'
    },
    {
      id: 'good',
      label: 'Good',
      emoji: '🙂',
      icon: Smile,
      color: 'primary',
      description: 'Feeling positive and content'
    },
    {
      id: 'okay',
      label: 'Okay',
      emoji: '😐',
      icon: Meh,
      color: 'warning',
      description: 'Feeling neutral or average'
    },
    {
      id: 'sad',
      label: 'Sad',
      emoji: '😢',
      icon: Frown,
      color: 'secondary',
      description: 'Feeling down or melancholy'
    },
    {
      id: 'anxious',
      label: 'Anxious',
      emoji: '😰',
      icon: AlertTriangle,
      color: 'accent',
      description: 'Feeling worried or stressed'
    },
    {
      id: 'angry',
      label: 'Angry',
      emoji: '😠',
      icon: AlertTriangle,
      color: 'error',
      description: 'Feeling frustrated or upset'
    }
  ];

  const firstAidTips = [
    {
      title: 'Panic Attack',
      steps: [
        'Find a quiet, safe space',
        'Practice deep breathing: 4 counts in, 4 counts hold, 4 counts out',
        'Ground yourself: name 5 things you can see, 4 you can touch, 3 you can hear',
        'Remind yourself: "This will pass, I am safe"',
        'If symptoms persist, seek medical help'
      ]
    },
    {
      title: 'Severe Anxiety',
      steps: [
        'Remove yourself from stressful environment if possible',
        'Use progressive muscle relaxation',
        'Focus on slow, controlled breathing',
        'Call a trusted friend or family member',
        'Consider professional help if anxiety is frequent'
      ]
    },
    {
      title: 'Depression Crisis',
      steps: [
        'Reach out to someone you trust immediately',
        'Call a crisis helpline: 988 (US)',
        'Remove any means of self-harm from your environment',
        'Go to the nearest emergency room if having suicidal thoughts',
        'Remember: You are not alone, help is available'
      ]
    }
  ];

  useEffect(() => {
    announceToScreenReader('Mental Health and Emergency page loaded. Check in with your mood and get supportive guidance.');
    speak('Welcome to Mental Health Support. This is a safe space to check in with your feelings and get supportive guidance. How are you feeling today?');
  }, [announceToScreenReader, speak]);

  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId);
    const mood = moodOptions.find(m => m.id === moodId);
    if (mood) {
      announceToScreenReader(`Selected mood: ${mood.label} - ${mood.description}`);
      speak(`You selected ${mood.label}. ${mood.description}.`);
    }
  };

  const handleVoiceNotes = (transcript: string) => {
    setMoodNotes(transcript);
    announceToScreenReader(`Voice notes recorded: ${transcript}`);
  };

  const handleSubmitMoodCheck = async () => {
    if (!selectedMood) return;

    setIsSubmitting(true);
    const mood = moodOptions.find(m => m.id === selectedMood);
    
    try {
      // Generate supportive AI response
      const moodContext = `User is feeling ${selectedMood}. Additional notes: ${moodNotes}`;
      const response = AIServices.generateHealthResponse(moodContext, 'mood');
      
      setAiResponse(response);
      setShowResponse(true);

      // Save mood check-in to Supabase
      try {
        await supabase.from('mood_checkins').insert({
          user_id: 'anonymous-user',
          mood: selectedMood,
          notes: moodNotes,
          ai_response: response,
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }

      // Speak the supportive response
      announceToScreenReader('Mood check-in complete. Receiving supportive guidance.');
      setTimeout(() => {
        AIServices.generateSpeech(response).catch(() => speak(response));
      }, 1000);

    } catch (error) {
      console.error('Error processing mood check-in:', error);
      announceToScreenReader('Error processing your mood check-in. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetMoodCheck = () => {
    setSelectedMood('');
    setMoodNotes('');
    setAiResponse('');
    setShowResponse(false);
    announceToScreenReader('Mood check-in reset. You can select a new mood.');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Mental Health & Emergency Support</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            A safe space for mood check-ins, emotional support, and emergency mental health resources. 
            Your wellbeing matters, and help is always available.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Mood Check-in Section */}
          <div className="space-y-6">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">How are you feeling today?</h2>
              
              {!showResponse ? (
                <div className="space-y-6">
                  {/* Mood Selection */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {moodOptions.map((mood) => {
                      const Icon = mood.icon;
                      const isSelected = selectedMood === mood.id;
                      
                      return (
                        <button
                          key={mood.id}
                          onClick={() => handleMoodSelect(mood.id)}
                          className={`p-4 rounded-xl border-2 text-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                            isSelected
                              ? `border-${mood.color}-500 bg-${mood.color}-50 focus:ring-${mood.color}-500`
                              : 'border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                          }`}
                          aria-pressed={isSelected}
                        >
                          <div className="text-3xl mb-2">{mood.emoji}</div>
                          <h3 className={`font-semibold mb-1 ${
                            isSelected ? `text-${mood.color}-900` : 'text-gray-900'
                          }`}>
                            {mood.label}
                          </h3>
                          <p className={`text-xs ${
                            isSelected ? `text-${mood.color}-700` : 'text-gray-600'
                          }`}>
                            {mood.description}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label htmlFor="mood-notes" className="block text-sm font-semibold text-gray-900 mb-2">
                      Want to share more about how you're feeling? (Optional)
                    </label>
                    <div className="relative">
                      <textarea
                        id="mood-notes"
                        value={moodNotes}
                        onChange={(e) => setMoodNotes(e.target.value)}
                        placeholder="Tell me what's on your mind... I'm here to listen and support you."
                        className="w-full min-h-[100px] p-4 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20 resize-vertical"
                        rows={4}
                      />
                      <div className="absolute top-2 right-2">
                        <VoiceButton 
                          onResult={handleVoiceNotes}
                          className="!p-2"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      size="large"
                      onClick={handleSubmitMoodCheck}
                      disabled={!selectedMood || isSubmitting}
                      loading={isSubmitting}
                      fullWidth
                    >
                      {isSubmitting ? 'Getting Support...' : 'Get Supportive Guidance'}
                    </Button>
                  </div>
                </div>
              ) : (
                /* AI Response */
                <div className="space-y-6">
                  <TavusAvatar 
                    message={aiResponse}
                    autoPlay={true}
                    className="mb-4"
                  />
                  
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Supportive Guidance</h3>
                    <p className="text-gray-800 leading-relaxed mb-4">{aiResponse}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="primary"
                      onClick={resetMoodCheck}
                      fullWidth
                    >
                      New Mood Check-in
                    </Button>
                  </div>
                </div>
              )}
            </Card>

            {/* Crisis Resources */}
            <Card className="bg-error-50 border-error-200">
              <h3 className="text-lg font-bold text-error-800 mb-4">🚨 Crisis Resources - Available 24/7</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-error-600" />
                  <div>
                    <span className="font-semibold text-error-800">Suicide & Crisis Lifeline:</span>
                    <a href="tel:988" className="ml-2 text-error-700 underline font-bold">988</a>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-error-600" />
                  <div>
                    <span className="font-semibold text-error-800">Crisis Text Line:</span>
                    <span className="ml-2 text-error-700">Text HOME to 741741</span>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-4 w-4 text-error-600" />
                  <div>
                    <span className="font-semibold text-error-800">Emergency Services:</span>
                    <a href="tel:911" className="ml-2 text-error-700 underline font-bold">911</a>
                  </div>
                </div>
              </div>
              <p className="text-xs text-error-600 mt-4">
                If you're having thoughts of self-harm or suicide, please reach out immediately. You are not alone.
              </p>
            </Card>
          </div>

          {/* Emergency First Aid Section */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Mental Health First Aid</h2>
                <Button
                  variant="outline"
                  onClick={() => setShowFirstAid(!showFirstAid)}
                  aria-expanded={showFirstAid}
                >
                  {showFirstAid ? 'Hide' : 'Show'} First Aid
                </Button>
              </div>
              
              <p className="text-gray-600 mb-4">
                Quick reference guide for mental health emergencies. These tips can help you or someone else in crisis.
              </p>

              {showFirstAid && (
                <div className="space-y-6">
                  {firstAidTips.map((tip, index) => (
                    <div key={index} className="border-l-4 border-primary-500 pl-4">
                      <h3 className="font-bold text-gray-900 mb-2">{tip.title}</h3>
                      <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700">
                        {tip.steps.map((step, stepIndex) => (
                          <li key={stepIndex}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Positive Affirmations */}
            <Card className="bg-success-50 border-success-200">
              <h3 className="text-lg font-bold text-success-800 mb-4">💚 Daily Affirmations</h3>
              <div className="space-y-2 text-sm text-success-700">
                <p>• You are worthy of love and care</p>
                <p>• Your feelings are valid and important</p>
                <p>• You have the strength to overcome challenges</p>
                <p>• It's okay to ask for help when you need it</p>
                <p>• You are not alone in your journey</p>
                <p>• Every small step forward matters</p>
                <p>• You deserve happiness and peace</p>
              </div>
            </Card>

            {/* Self-Care Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <h3 className="text-lg font-bold text-blue-800 mb-4">🌟 Self-Care Reminders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-blue-700">
                <div>
                  <h4 className="font-semibold mb-1">Physical Care:</h4>
                  <ul className="space-y-1">
                    <li>• Stay hydrated</li>
                    <li>• Get enough sleep</li>
                    <li>• Take gentle walks</li>
                    <li>• Eat nourishing foods</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Emotional Care:</h4>
                  <ul className="space-y-1">
                    <li>• Practice deep breathing</li>
                    <li>• Connect with loved ones</li>
                    <li>• Journal your thoughts</li>
                    <li>• Do activities you enjoy</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Professional Help Notice */}
        <div className="mt-8">
          <Card className="bg-yellow-50 border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">Professional Support</h3>
            <p className="text-sm text-yellow-700">
              While this tool provides supportive guidance, it's not a replacement for professional mental health care. 
              If you're experiencing persistent mental health challenges, please consider reaching out to a licensed 
              mental health professional, your doctor, or a counseling service in your area.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default MentalHealth;