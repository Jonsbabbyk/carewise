// AI Services for ElevenLabs and Tavus integration
export class AIServices {
  private static elevenLabsApiKey = import.meta.env.VITE_ELEVENLABS_API_KEY || '';
  private static tavusApiKey = import.meta.env.VITE_TAVUS_API_KEY || '';

  // ElevenLabs Text-to-Speech
  static async generateSpeech(text: string): Promise<string> {
    if (!this.elevenLabsApiKey) {
      console.warn('ElevenLabs API key not configured, using browser speech synthesis');
      return this.fallbackSpeech(text);
    }

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': this.elevenLabsApiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('ElevenLabs API error');
      }

      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (error) {
      console.error('ElevenLabs error:', error);
      return this.fallbackSpeech(text);
    }
  }

  // Fallback to browser speech synthesis
  private static fallbackSpeech(text: string): Promise<string> {
    return new Promise((resolve) => {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        window.speechSynthesis.speak(utterance);
      }
      resolve(''); // Return empty string for fallback
    });
  }

  // Tavus Video Avatar
  static async generateVideoResponse(text: string): Promise<string> {
    if (!this.tavusApiKey) {
      console.warn('Tavus API key not configured, using placeholder video');
      return this.getPlaceholderVideo();
    }

    try {
      const response = await fetch('https://tavusapi.com/v2/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.tavusApiKey,
        },
        body: JSON.stringify({
          replica_id: 'default-replica',
          script: text,
          background_url: 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg',
        }),
      });

      if (!response.ok) {
        throw new Error('Tavus API error');
      }

      const data = await response.json();
      return data.download_url || this.getPlaceholderVideo();
    } catch (error) {
      console.error('Tavus error:', error);
      return this.getPlaceholderVideo();
    }
  }

  private static getPlaceholderVideo(): string {
    // Return a placeholder video URL or create a simple animated avatar
    return 'https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg';
  }

  // AI Health Response Generator
  static generateHealthResponse(input: string, context: 'general' | 'symptoms' | 'mood' | 'medicine' = 'general'): string {
    const inputLower = input.toLowerCase();
    
    switch (context) {
      case 'symptoms':
        return this.generateSymptomResponse(inputLower);
      case 'mood':
        return this.generateMoodResponse(inputLower);
      case 'medicine':
        return this.generateMedicineResponse(inputLower);
      default:
        return this.generateGeneralResponse(inputLower);
    }
  }

  private static generateSymptomResponse(symptoms: string): string {
    if (symptoms.includes('headache') || symptoms.includes('head pain')) {
      return "I understand you're experiencing headaches. Here are some natural approaches that may help: Stay well-hydrated with plenty of water, apply a cool compress to your forehead, try gentle neck stretches, and consider peppermint tea which has natural pain-relieving properties. Ensure you're getting adequate rest in a quiet, dark room. If headaches persist, are severe, or are accompanied by other concerning symptoms, please consult a healthcare professional promptly.";
    }
    
    if (symptoms.includes('cough') || symptoms.includes('cold') || symptoms.includes('sore throat')) {
      return "For cough and cold symptoms, natural remedies can provide comfort: Try warm honey and lemon water (not for children under 1 year), ginger tea with a pinch of turmeric, steam inhalation with eucalyptus oil, and plenty of rest. Garlic has natural antibacterial properties. Stay hydrated and maintain good nutrition. If symptoms worsen, persist beyond a week, or you develop fever, please seek medical attention.";
    }
    
    if (symptoms.includes('stomach') || symptoms.includes('nausea') || symptoms.includes('digestive')) {
      return "For digestive discomfort, gentle natural approaches include: Fresh ginger tea for nausea, peppermint tea for stomach upset, staying hydrated with small sips of water, eating bland foods like rice or toast, and avoiding dairy temporarily. Probiotics from yogurt can help restore gut balance. If symptoms are severe, persistent, or accompanied by fever, please consult a healthcare provider.";
    }

    return "Thank you for sharing your symptoms. While I can suggest some general wellness approaches, it's important to consult with a qualified healthcare professional for proper diagnosis and treatment. In the meantime, ensure you're getting adequate rest, staying hydrated, eating nutritious foods, and monitoring your symptoms. If you experience severe or worsening symptoms, seek medical attention promptly.";
  }

  private static generateMoodResponse(mood: string): string {
    if (mood.includes('sad') || mood.includes('down') || mood.includes('depressed')) {
      return "I hear that you're feeling down, and I want you to know that your feelings are valid. Here are some gentle ways to nurture your wellbeing: Try spending a few minutes in sunlight or near a window, practice deep breathing exercises, listen to uplifting music, or do a small activity you enjoy. Remember, it's okay to reach out to friends, family, or a mental health professional. You're not alone, and things can get better. 🌟";
    }
    
    if (mood.includes('anxious') || mood.includes('worried') || mood.includes('stressed')) {
      return "I understand you're feeling anxious or stressed. Here are some calming techniques that might help: Try the 4-7-8 breathing technique (breathe in for 4, hold for 7, exhale for 8), practice grounding by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Gentle movement, herbal tea like chamomile, and talking to someone you trust can also help. Remember, you're stronger than you know. 💙";
    }
    
    if (mood.includes('angry') || mood.includes('frustrated')) {
      return "It sounds like you're feeling frustrated or angry, and that's completely understandable. Here are some healthy ways to process these feelings: Try physical movement like walking or stretching, practice deep breathing, write down your thoughts, or talk to someone you trust. Remember that anger often signals that something important to you needs attention. Take care of yourself, and know that these intense feelings will pass. 🌈";
    }

    return "Thank you for sharing how you're feeling. Your emotional wellbeing matters, and it's brave of you to check in with yourself. Remember to be kind to yourself, practice self-care, stay connected with supportive people, and don't hesitate to reach out to a mental health professional if you need additional support. You deserve to feel well and happy. ✨";
  }

  private static generateMedicineResponse(medicine: string): string {
    if (medicine.includes('panadol') || medicine.includes('paracetamol') || medicine.includes('acetaminophen')) {
      return "Panadol (paracetamol/acetaminophen) is commonly used for pain and fever relief. For children, dosing must be based on weight and age - always follow package instructions or consult a pharmacist or doctor. Natural alternatives for mild pain include: cold/warm compresses, rest, adequate hydration, and gentle massage. For fever, ensure proper hydration and light clothing. Always consult healthcare professionals for children's medications and if symptoms persist.";
    }
    
    if (medicine.includes('ibuprofen') || medicine.includes('advil') || medicine.includes('nurofen')) {
      return "Ibuprofen is an anti-inflammatory medication for pain and fever. It should be taken with food to protect the stomach. Natural anti-inflammatory alternatives include: turmeric tea, ginger, tart cherry juice, and omega-3 rich foods like fish or flaxseeds. Always follow dosing instructions, avoid if you have stomach issues, and consult healthcare providers for children or if you have other medical conditions.";
    }

    return "For any medication questions, it's essential to consult with a pharmacist, doctor, or healthcare provider who can give you personalized advice based on your specific situation, age, weight, and other medications. They can also suggest natural alternatives when appropriate. Never hesitate to ask healthcare professionals about dosing, interactions, or side effects. Your safety is the top priority.";
  }

  private static generateGeneralResponse(input: string): string {
    if (input.includes('sleep') || input.includes('insomnia')) {
      return "For better sleep naturally: Create a relaxing bedtime routine, avoid screens 1 hour before bed, try chamomile tea, practice gentle stretching or meditation, and keep your room cool and dark. Lavender essential oil can promote relaxation. Maintain consistent sleep and wake times. If you have chronic sleep issues, consider speaking with a healthcare provider.";
    }
    
    if (input.includes('energy') || input.includes('tired') || input.includes('fatigue')) {
      return "To boost energy naturally: Ensure you're getting adequate sleep (7-9 hours), stay hydrated throughout the day, eat balanced meals with protein and complex carbs, get some sunlight and fresh air, and try gentle exercise like walking. Iron-rich foods like spinach and legumes can help if you're deficient. If fatigue persists, consult a healthcare provider to rule out underlying conditions.";
    }

    return "Thank you for your health question. While I can provide general wellness information, I always recommend consulting with qualified healthcare professionals for personalized medical advice. For natural health approaches, consider: staying hydrated, eating nutrient-rich foods, getting adequate sleep, regular gentle exercise, and managing stress through relaxation techniques. Is there a specific area of natural health you'd like to learn more about?";
  }
}