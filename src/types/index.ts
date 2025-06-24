export interface AccessibilitySettings {
  mode: 'standard' | 'visual-impairment' | 'cognitive-support' | 'dyslexia-friendly';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  highContrast: boolean;
  voiceEnabled: boolean;
  reducedMotion: boolean;
}

export interface AIConversation {
  id: string;
  question: string;
  answer: string;
  timestamp: Date;
}

export interface HealthSymptom {
  symptom: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  additionalNotes?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface GameState {
  score: number;
  timeRemaining: number;
  playerPosition: { x: number; y: number };
  items: Array<{
    id: string;
    type: 'healthy' | 'unhealthy';
    position: { x: number; y: number };
    collected: boolean;
  }>;
  isPlaying: boolean;
  gameOver: boolean;
}

export interface NaturalRemedy {
  name: string;
  description: string;
  uses: string[];
  preparation: string;
  cautions?: string;
  region?: string;
}