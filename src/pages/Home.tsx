import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Sparkles, Shield, Users, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import TavusAvatar from '../components/UI/TavusAvatar';

const Home: React.FC = () => {
  const { announceToScreenReader } = useAccessibility();
  const { speak, resetSpeechCount } = useVoice();
  const [avatarMessage, setAvatarMessage] = useState('');
  const [showAvatar, setShowAvatar] = useState(true);
  const [hasGreeted, setHasGreeted] = useState(false);

  useEffect(() => {
    announceToScreenReader('Welcome to CareWise AI, your accessible health companion');
    
    // Set initial avatar greeting only once per session
    if (!hasGreeted) {
      resetSpeechCount();
      const greeting = "Welcome to CareWise AI! I'm your AI health companion. I'm here to help you learn about natural health, answer your questions, and support your wellness journey. How can I assist you today?";
      setAvatarMessage(greeting);
      setHasGreeted(true);
    }
  }, [announceToScreenReader, hasGreeted, resetSpeechCount]);

  const handleAvatarComplete = () => {
    // Avatar has finished speaking, clear message to prevent repetition
    setAvatarMessage('');
    announceToScreenReader('AI assistant is ready for your questions');
  };

  const features = [
    {
      title: 'Ask AI Doctor',
      description: 'Get instant health answers from our AI companion with voice support',
      icon: Heart,
      link: '/ask-ai',
      color: 'primary',
    },
    {
      title: 'Health Form',
      description: 'Report symptoms easily with voice navigation and get AI guidance',
      icon: Shield,
      link: '/health-form',
      color: 'secondary',
    },
    {
      title: 'Natural Remedies',
      description: 'Learn about herbal medicines, nutrition, and wellness practices',
      icon: Sparkles,
      link: '/awareness',
      color: 'success',
    },
    {
      title: 'Sunshine Hero Game',
      description: 'Play our cheerful accessibility game for emotional wellness',
      icon: Users,
      link: '/game',
      color: 'accent',
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="relative pt-8 pb-16 px-4 sm:px-6 lg:px-8" aria-labelledby="hero-heading">
        <div className="max-w-4xl mx-auto text-center">
          {/* Tavus AI Avatar */}
          {showAvatar && avatarMessage && hasGreeted && (
            <div className="mb-8">
              <TavusAvatar 
                message={avatarMessage}
                autoPlay={true}
                onComplete={handleAvatarComplete}
                className="animate-fade-in"
              />
            </div>
          )}

          <h1 id="hero-heading" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
            <span className="text-primary-600">CareWise</span>{' '}
            <span className="text-secondary-600">AI</span>
          </h1>
          
          <p className="text-xl sm:text-2xl text-gray-700 mb-4 font-medium">
            Your Accessible Health & Wellness Companion
          </p>
          
          <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Designed for people with disabilities and all health learners. Get AI-powered health guidance, 
            learn natural remedies, and access emergency support with full voice and accessibility features.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/ask-ai">
              <Button 
                variant="primary" 
                size="large"
                className="shadow-2xl"
              >
                Ask AI Doctor <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
              </Button>
            </Link>
            <Link to="/settings">
              <Button 
                variant="outline" 
                size="large"
              >
                Accessibility Settings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white/50" aria-labelledby="features-heading">
        <div className="max-w-6xl mx-auto">
          <h2 id="features-heading" className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-12">
            Your Health Journey Starts Here
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.title} to={feature.link}>
                  <Card 
                    hover
                    className={`border-2 border-${feature.color}-200 hover:border-${feature.color}-400 transition-all duration-200 h-full`}
                  >
                    <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                      <Icon className={`h-6 w-6 text-${feature.color}-600`} aria-hidden="true" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                    <div className="mt-4">
                      <span className={`text-${feature.color}-600 font-semibold flex items-center text-sm`}>
                        Learn More <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Accessibility Highlight */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" aria-labelledby="accessibility-heading">
        <div className="max-w-4xl mx-auto text-center">
          <h2 id="accessibility-heading" className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">
            Built for Everyone
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fully Accessible</h3>
              <p className="text-gray-600">Screen reader compatible, keyboard navigation, and voice control</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-secondary-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Disability-First</h3>
              <p className="text-gray-600">Designed specifically for people with cognitive and physical disabilities</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="h-8 w-8 text-success-600" aria-hidden="true" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Natural Focus</h3>
              <p className="text-gray-600">Emphasis on natural remedies and holistic wellness approaches</p>
            </div>
          </div>
        </div>
      </section>

      {/* Blockchain Security Notice */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-blue-600" aria-hidden="true" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            🔐 Blockchain-Secured Health Data
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Your health information is protected with Algorand blockchain technology, ensuring privacy, 
            data ownership, and immutable health records that you control.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <strong className="text-blue-600">Verifiable Records:</strong> Digital prescriptions and diagnoses with cryptographic proof
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <strong className="text-green-600">Privacy-First:</strong> Your data is hashed and anonymized for maximum protection
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <strong className="text-purple-600">User-Owned:</strong> You control your health data and contribution to public health research
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-500 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Ready to Start Your Wellness Journey?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join thousands of users discovering natural health with AI assistance and blockchain security
          </p>
          <Link to="/ask-ai">
            <Button 
              variant="accent" 
              size="extra-large"
              className="shadow-2xl"
            >
              Get Started Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Built with Bolt.new Badge */}
      <div className="fixed bottom-4 right-4 z-50">
        <a 
          href="https://bolt.new" 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-black text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors duration-200 shadow-lg"
        >
          Built with Bolt.new ⚡
        </a>
      </div>
    </main>
  );
};

export default Home;