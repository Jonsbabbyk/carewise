import React from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { useVoice } from '../../hooks/useVoice';
import Button from './Button';

interface VoiceButtonProps {
  onResult: (transcript: string) => void;
  disabled?: boolean;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ onResult, disabled = false, className = '' }) => {
  const { startListening, isListening, isSupported } = useVoice();

  const handleVoiceInput = async () => {
    if (!isSupported || disabled) return;

    try {
      const transcript = await startListening();
      onResult(transcript);
    } catch (error) {
      console.error('Voice input error:', error);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      size="medium"
      onClick={handleVoiceInput}
      disabled={disabled || isListening}
      className={className}
      aria-label={isListening ? 'Listening...' : 'Start voice input'}
    >
      {isListening ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" aria-hidden="true" />
          Listening...
        </>
      ) : (
        <>
          <Mic className="h-5 w-5 mr-2" aria-hidden="true" />
          Speak
        </>
      )}
    </Button>
  );
};

export default VoiceButton;