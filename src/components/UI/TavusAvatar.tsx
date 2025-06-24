import React, { useEffect, useRef, useState } from 'react';
import { Heart, Play, Pause } from 'lucide-react';

interface TavusAvatarProps {
  message?: string;
  autoPlay?: boolean;
  className?: string;
  onComplete?: () => void;
}

const TavusAvatar: React.FC<TavusAvatarProps> = ({ 
  message, 
  autoPlay = false, 
  className = '',
  onComplete 
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (message && autoPlay) {
      generateVideo();
    }
  }, [message, autoPlay]);

  const generateVideo = async () => {
    if (!message) return;
    
    setIsPlaying(true);
    
    // For demo purposes, we'll use a placeholder avatar animation
    // In production, this would call the Tavus API
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Use a placeholder video or create animated avatar
      setVideoUrl('https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg');
      
      // Simulate speaking the message
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.9;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        utterance.onend = () => {
          setIsPlaying(false);
          onComplete?.();
        };
        window.speechSynthesis.speak(utterance);
      } else {
        setTimeout(() => {
          setIsPlaying(false);
          onComplete?.();
        }, message.length * 50); // Approximate speaking time
      }
    } catch (error) {
      console.error('Error generating video:', error);
      setIsPlaying(false);
    }
  };

  const togglePlayback = () => {
    if (isPlaying) {
      window.speechSynthesis?.cancel();
      setIsPlaying(false);
    } else {
      generateVideo();
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* Avatar Container */}
      <div className="relative w-32 h-32 mx-auto mb-4">
        {/* Animated Avatar Background */}
        <div className={`w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isPlaying ? 'animate-pulse scale-105' : ''
        }`}>
          <Heart className="w-16 h-16 text-white" aria-hidden="true" />
        </div>
        
        {/* Speaking Animation Rings */}
        {isPlaying && (
          <>
            <div className="absolute inset-0 rounded-full border-4 border-primary-300 animate-ping opacity-75"></div>
            <div className="absolute inset-2 rounded-full border-2 border-secondary-300 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          </>
        )}
        
        {/* Play/Pause Button */}
        <button
          onClick={togglePlayback}
          className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 transition-transform duration-200 focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2"
          aria-label={isPlaying ? 'Pause avatar' : 'Play avatar message'}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-primary-600" />
          ) : (
            <Play className="w-5 h-5 text-primary-600 ml-0.5" />
          )}
        </button>
      </div>
      
      {/* Status Text */}
      <div className="text-center">
        <p className="text-sm text-gray-600">
          {isPlaying ? 'Speaking...' : 'AI Health Assistant'}
        </p>
        {message && !isPlaying && (
          <p className="text-xs text-gray-500 mt-1 max-w-xs mx-auto">
            Click play to hear the message
          </p>
        )}
      </div>
    </div>
  );
};

export default TavusAvatar;