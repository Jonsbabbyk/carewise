import { useState, useCallback } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';

export const useVoice = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechCount, setSpeechCount] = useState(0);
  const { settings } = useAccessibility();

  const speak = useCallback((text: string, resetCount: boolean = false) => {
    if (!settings.voiceEnabled || !window.speechSynthesis) return;

    // Reset count if requested or if it's a new session
    if (resetCount) {
      setSpeechCount(0);
    }

    // Limit to 2 speech outputs per prompt to prevent repetition
    if (speechCount >= 2) {
      console.log('Speech limit reached for this prompt');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeechCount(prev => prev + 1);
    };
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  }, [settings.voiceEnabled, speechCount]);

  const resetSpeechCount = useCallback(() => {
    setSpeechCount(0);
  }, []);

  const startListening = useCallback((): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        resolve(transcript);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        reject(new Error(`Speech recognition error: ${event.error}`));
      };

      recognition.start();
    });
  }, []);

  const stopSpeaking = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    speak,
    startListening,
    stopSpeaking,
    resetSpeechCount,
    isListening,
    isSpeaking,
    speechCount,
    isSupported: 'speechSynthesis' in window && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window),
  };
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}