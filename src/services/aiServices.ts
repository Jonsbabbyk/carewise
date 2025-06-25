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

  // Enhanced AI Health Response Generator with expanded knowledge base
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
    // Expanded symptom knowledge base
    
    // Respiratory conditions
    if (symptoms.includes('asthma') || symptoms.includes('wheezing') || symptoms.includes('breathing')) {
      return "For respiratory concerns like asthma or breathing difficulties, natural supportive approaches include: steam inhalation with eucalyptus oil, breathing exercises, avoiding triggers like dust and allergens, consuming anti-inflammatory foods like turmeric and ginger, and maintaining good air quality. However, asthma requires proper medical management - please ensure you have your prescribed medications and consult your healthcare provider for a comprehensive treatment plan.";
    }

    if (symptoms.includes('pneumonia') || symptoms.includes('chest infection')) {
      return "Chest infections and pneumonia are serious conditions requiring immediate medical attention. While receiving proper medical treatment, supportive natural approaches may include: staying well-hydrated, consuming immune-boosting foods like garlic and honey, getting adequate rest, and using a humidifier. Please seek immediate medical care if you have difficulty breathing, high fever, or chest pain.";
    }

    // Cardiovascular conditions
    if (symptoms.includes('heart') || symptoms.includes('chest pain') || symptoms.includes('palpitations')) {
      return "Heart-related symptoms require immediate medical evaluation. While maintaining heart health naturally, consider: regular gentle exercise as approved by your doctor, omega-3 rich foods like fish and walnuts, reducing sodium intake, managing stress through meditation, and avoiding smoking. If you're experiencing chest pain, shortness of breath, or irregular heartbeat, seek emergency medical care immediately.";
    }

    if (symptoms.includes('high blood pressure') || symptoms.includes('hypertension')) {
      return "High blood pressure management benefits from both medical care and lifestyle approaches: reduce sodium intake, increase potassium-rich foods like bananas and leafy greens, practice stress reduction techniques, maintain a healthy weight, limit alcohol, and engage in regular physical activity as approved by your healthcare provider. Monitor your blood pressure regularly and take prescribed medications as directed.";
    }

    // Diabetes and metabolic conditions
    if (symptoms.includes('diabetes') || symptoms.includes('blood sugar') || symptoms.includes('glucose')) {
      return "Diabetes management requires medical supervision combined with lifestyle approaches: monitor blood glucose regularly, follow a balanced diet with complex carbohydrates, include fiber-rich foods, practice portion control, engage in regular physical activity, manage stress, and take medications as prescribed. Natural supportive foods include cinnamon, bitter melon, and chromium-rich foods, but always consult your healthcare team before making changes.";
    }

    // Neurological conditions
    if (symptoms.includes('migraine') || symptoms.includes('severe headache')) {
      return "For migraines, natural management strategies include: identifying and avoiding triggers (certain foods, stress, lack of sleep), staying hydrated, applying cold or warm compresses, practicing relaxation techniques, maintaining regular sleep patterns, and considering magnesium supplementation under medical guidance. Keep a headache diary to identify patterns. If migraines are frequent or severe, consult a neurologist.";
    }

    if (symptoms.includes('seizure') || symptoms.includes('epilepsy')) {
      return "Seizure disorders require immediate medical attention and ongoing neurological care. While receiving proper medical treatment, supportive approaches may include: maintaining consistent medication schedules, getting adequate sleep, managing stress, avoiding known triggers, and following a balanced diet. Some people benefit from specific diets under medical supervision. Never stop seizure medications without medical guidance.";
    }

    // Gastrointestinal conditions
    if (symptoms.includes('ibs') || symptoms.includes('irritable bowel')) {
      return "For IBS management, natural approaches include: identifying trigger foods through an elimination diet, increasing soluble fiber gradually, staying hydrated, managing stress through relaxation techniques, considering probiotics, eating smaller frequent meals, and avoiding known irritants like caffeine and alcohol. Keep a food and symptom diary to identify patterns. Work with a healthcare provider for comprehensive management.";
    }

    if (symptoms.includes('ulcer') || symptoms.includes('stomach ulcer')) {
      return "Stomach ulcers require medical treatment, often involving antibiotics for H. pylori bacteria. Supportive natural approaches include: avoiding NSAIDs and alcohol, eating smaller frequent meals, consuming foods rich in flavonoids like berries and green tea, including probiotics, managing stress, and avoiding spicy or acidic foods that worsen symptoms. Always complete prescribed antibiotic courses and follow up with your healthcare provider.";
    }

    // Autoimmune conditions
    if (symptoms.includes('arthritis') || symptoms.includes('joint pain') || symptoms.includes('rheumatoid')) {
      return "For arthritis and joint pain, natural supportive approaches include: anti-inflammatory foods like turmeric, ginger, and omega-3 fatty acids, gentle exercise like swimming or yoga, maintaining a healthy weight, applying heat or cold therapy, getting adequate sleep, and managing stress. Some people benefit from glucosamine and chondroitin supplements. Work with a rheumatologist for comprehensive care, especially for autoimmune forms of arthritis.";
    }

    if (symptoms.includes('lupus') || symptoms.includes('autoimmune')) {
      return "Autoimmune conditions like lupus require specialized medical care from a rheumatologist. Supportive natural approaches may include: anti-inflammatory diet rich in omega-3s, adequate vitamin D, stress management, gentle exercise, sun protection, adequate sleep, and avoiding known triggers. Some people benefit from turmeric and other anti-inflammatory supplements under medical guidance. Never replace prescribed medications with natural remedies alone.";
    }

    // Mental health conditions
    if (symptoms.includes('depression') || symptoms.includes('major depression')) {
      return "Depression is a serious medical condition requiring professional mental health care. Supportive natural approaches alongside treatment include: regular exercise, maintaining social connections, practicing mindfulness or meditation, ensuring adequate sleep, eating a balanced diet rich in omega-3s, getting sunlight exposure, and engaging in meaningful activities. If you're having thoughts of self-harm, please seek immediate help by calling 988 or going to the nearest emergency room.";
    }

    if (symptoms.includes('anxiety disorder') || symptoms.includes('panic attacks')) {
      return "Anxiety disorders benefit from professional mental health treatment combined with natural coping strategies: deep breathing exercises, progressive muscle relaxation, regular exercise, limiting caffeine, practicing mindfulness, maintaining a consistent sleep schedule, and using grounding techniques. Herbal teas like chamomile may provide mild relaxation. If you're experiencing panic attacks or severe anxiety, please consult a mental health professional.";
    }

    // Skin conditions
    if (symptoms.includes('eczema') || symptoms.includes('dermatitis')) {
      return "For eczema and dermatitis, natural management includes: using gentle, fragrance-free moisturizers, avoiding known triggers, taking lukewarm baths with oatmeal or baking soda, wearing soft cotton clothing, managing stress, and considering elimination diets to identify food triggers. Some people benefit from probiotics and omega-3 supplements. For severe cases, consult a dermatologist for additional treatment options.";
    }

    if (symptoms.includes('psoriasis')) {
      return "Psoriasis management combines medical treatment with natural approaches: moisturizing regularly, getting controlled sun exposure, managing stress, maintaining a healthy weight, avoiding alcohol and smoking, and considering anti-inflammatory foods. Some people benefit from aloe vera, turmeric, and omega-3 supplements. Dead Sea salt baths may provide relief. Work with a dermatologist for comprehensive care.";
    }

    // Common symptoms with expanded responses
    if (symptoms.includes('headache') || symptoms.includes('head pain')) {
      return "For headaches, natural approaches include: staying well-hydrated, applying cold or warm compresses, practicing relaxation techniques, maintaining regular sleep patterns, identifying and avoiding triggers (certain foods, stress, bright lights), gentle neck stretches, and peppermint or lavender essential oils. If headaches are frequent, severe, or accompanied by other symptoms like vision changes or fever, consult a healthcare provider promptly.";
    }
    
    if (symptoms.includes('cough') || symptoms.includes('cold') || symptoms.includes('sore throat')) {
      return "For respiratory symptoms, supportive natural remedies include: warm honey and lemon water (not for children under 1 year), ginger tea with turmeric, steam inhalation with eucalyptus oil, gargling with salt water, staying hydrated, getting adequate rest, and consuming immune-supporting foods like garlic and vitamin C-rich fruits. If symptoms persist beyond 10 days, worsen, or include high fever, consult a healthcare provider.";
    }
    
    if (symptoms.includes('stomach') || symptoms.includes('nausea') || symptoms.includes('digestive')) {
      return "For digestive discomfort, gentle approaches include: fresh ginger tea for nausea, peppermint tea for stomach upset, staying hydrated with small frequent sips, eating bland foods like rice or toast, avoiding dairy temporarily, and consuming probiotics from yogurt or kefir. The BRAT diet (bananas, rice, applesauce, toast) can help during acute episodes. If symptoms are severe, persistent, or include blood, seek medical attention.";
    }

    if (symptoms.includes('fever')) {
      return "For fever management, natural supportive measures include: staying hydrated with water and electrolyte solutions, getting adequate rest, using cool compresses, wearing light clothing, eating light nutritious foods, and monitoring temperature regularly. Elderberry and echinacea may support immune function. Seek medical attention if fever exceeds 103°F (39.4°C), persists beyond 3 days, or is accompanied by severe symptoms like difficulty breathing or persistent vomiting.";
    }

    if (symptoms.includes('insomnia') || symptoms.includes('sleep problems')) {
      return "For sleep difficulties, natural approaches include: maintaining a consistent sleep schedule, creating a relaxing bedtime routine, avoiding screens 1-2 hours before bed, keeping the bedroom cool and dark, trying chamomile tea or valerian root, practicing relaxation techniques, avoiding caffeine after 2 PM, and getting morning sunlight exposure. If sleep problems persist or significantly impact daily life, consult a healthcare provider or sleep specialist.";
    }

    return "Thank you for sharing your symptoms. While I can provide general wellness information, it's essential to consult with qualified healthcare professionals for proper diagnosis and treatment, especially for persistent, severe, or concerning symptoms. Natural approaches can often complement medical treatment but should not replace professional medical care. Please seek immediate medical attention if you experience severe symptoms, difficulty breathing, chest pain, or other emergency signs.";
  }

  private static generateMoodResponse(mood: string): string {
    if (mood.includes('sad') || mood.includes('down') || mood.includes('depressed')) {
      return "I hear that you're feeling down, and I want you to know that your feelings are completely valid and important. Here are some gentle ways to nurture your wellbeing: Try spending time in natural sunlight or near a bright window, practice deep breathing exercises or meditation, listen to uplifting music that resonates with you, engage in a small creative activity you enjoy, reach out to a trusted friend or family member, or consider journaling your thoughts. Remember, it's always okay and often helpful to speak with a mental health professional. You're not alone in this journey, and brighter days are ahead. 🌟";
    }
    
    if (mood.includes('anxious') || mood.includes('worried') || mood.includes('stressed')) {
      return "I understand you're feeling anxious or stressed, and these feelings are completely normal responses to life's challenges. Here are some calming techniques that might help: Try the 4-7-8 breathing technique (breathe in for 4 counts, hold for 7, exhale for 8), practice grounding by naming 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. Gentle movement like walking or stretching, herbal tea like chamomile or passionflower, progressive muscle relaxation, and talking to someone you trust can also provide relief. Remember, you have the inner strength to navigate through this. 💙";
    }
    
    if (mood.includes('angry') || mood.includes('frustrated')) {
      return "It sounds like you're feeling frustrated or angry, and these are completely valid emotions that signal something important needs attention. Here are some healthy ways to process these feelings: Try physical movement like walking, jogging, or stretching to release tension, practice deep breathing or counting to ten, write down your thoughts and feelings, talk to someone you trust about what's bothering you, or engage in a creative outlet like drawing or music. Remember that anger often masks other emotions like hurt or fear, and it's okay to explore what's underneath. Take care of yourself, and know that these intense feelings will pass. 🌈";
    }

    if (mood.includes('great') || mood.includes('happy') || mood.includes('wonderful')) {
      return "It's wonderful to hear that you're feeling great! Your positive energy is truly uplifting. Here are some ways to maintain and share this beautiful state: Practice gratitude by noting three things you're thankful for, engage in activities that bring you joy, share your positive energy with others through acts of kindness, spend time in nature to ground yourself, celebrate your achievements no matter how small, and remember this feeling for times when you might need encouragement. Your happiness matters and contributes to making the world a brighter place! ✨";
    }

    return "Thank you for sharing how you're feeling with me. Your emotional wellbeing is incredibly important, and it takes courage to check in with yourself like this. Remember to be gentle and compassionate with yourself, practice regular self-care that nourishes your mind and body, stay connected with supportive people in your life, and don't hesitate to reach out to a mental health professional if you need additional support. You deserve to feel well, happy, and at peace. Every step you take toward caring for your mental health is valuable and meaningful. ✨";
  }

  private static generateMedicineResponse(medicine: string): string {
    // Expanded medicine knowledge base
    
    if (medicine.includes('panadol') || medicine.includes('paracetamol') || medicine.includes('acetaminophen')) {
      return "Panadol (paracetamol/acetaminophen) is commonly used for pain and fever relief. For adults, the typical dose is 500-1000mg every 4-6 hours, not exceeding 4000mg in 24 hours. For children, dosing must be based on weight and age - always follow package instructions or consult a pharmacist or doctor. Natural alternatives for mild pain include: cold/warm compresses, rest, adequate hydration, gentle massage, willow bark tea (nature's aspirin), and turmeric for inflammation. For fever, ensure proper hydration, light clothing, and cool compresses. Always consult healthcare professionals for children's medications and if symptoms persist beyond 3 days.";
    }
    
    if (medicine.includes('ibuprofen') || medicine.includes('advil') || medicine.includes('nurofen')) {
      return "Ibuprofen is an anti-inflammatory medication for pain, fever, and inflammation. Adult dose is typically 200-400mg every 4-6 hours, not exceeding 1200mg daily without medical supervision. Always take with food to protect the stomach. Natural anti-inflammatory alternatives include: turmeric with black pepper, ginger tea, tart cherry juice, omega-3 rich foods like fish or flaxseeds, boswellia extract, and green tea. Avoid ibuprofen if you have stomach ulcers, kidney problems, or heart conditions. Always consult healthcare providers for children or if you have other medical conditions.";
    }

    if (medicine.includes('aspirin')) {
      return "Aspirin is used for pain, fever, and heart protection. Adult dose varies by purpose: 325-650mg for pain/fever, 81mg daily for heart protection (only under medical supervision). Never give aspirin to children under 16 due to Reye's syndrome risk. Natural alternatives include: willow bark (original source of aspirin), turmeric, ginger, and omega-3 fatty acids for inflammation. For heart health, consider garlic, hawthorn, and CoQ10 under medical guidance. Always consult healthcare providers before starting aspirin therapy, especially for heart protection.";
    }

    if (medicine.includes('antibiotic') || medicine.includes('amoxicillin') || medicine.includes('penicillin')) {
      return "Antibiotics like amoxicillin and penicillin fight bacterial infections and must be taken exactly as prescribed. Always complete the full course even if you feel better, take with or without food as directed, and never share with others. Natural immune support during antibiotic treatment includes: probiotics to restore gut bacteria, prebiotic foods like garlic and onions, vitamin C from citrus fruits, zinc from pumpkin seeds, and staying well-hydrated. Report any allergic reactions immediately. Antibiotics don't work against viral infections like colds or flu.";
    }

    if (medicine.includes('insulin') || medicine.includes('metformin') || medicine.includes('diabetes medication')) {
      return "Diabetes medications require careful management and regular monitoring. Never adjust doses without medical supervision. Insulin timing and dosing depend on blood glucose levels and meals. Metformin is typically taken with meals to reduce stomach upset. Natural blood sugar support includes: cinnamon, chromium, bitter melon, alpha-lipoic acid, regular exercise, and a low-glycemic diet rich in fiber. Monitor blood glucose regularly, maintain consistent meal timing, and work closely with your healthcare team for optimal management.";
    }

    if (medicine.includes('blood pressure') || medicine.includes('lisinopril') || medicine.includes('amlodipine')) {
      return "Blood pressure medications require consistent daily use and regular monitoring. Never stop suddenly as this can cause dangerous blood pressure spikes. Take at the same time daily, monitor for side effects like dizziness, and check blood pressure regularly. Natural blood pressure support includes: reducing sodium intake, increasing potassium-rich foods, regular exercise, stress management, limiting alcohol, maintaining healthy weight, and considering garlic, hawthorn, and magnesium supplements under medical guidance.";
    }

    if (medicine.includes('antidepressant') || medicine.includes('ssri') || medicine.includes('sertraline')) {
      return "Antidepressants require consistent use and medical supervision. Never stop suddenly as this can cause withdrawal symptoms. It may take 4-6 weeks to feel full effects. Take at the same time daily, report side effects to your doctor, and attend regular follow-up appointments. Natural mood support alongside medication includes: regular exercise, omega-3 fatty acids, vitamin D, B-complex vitamins, St. John's Wort (only under medical supervision due to interactions), mindfulness practices, and maintaining social connections. Always work with your healthcare provider for comprehensive mental health care.";
    }

    if (medicine.includes('thyroid') || medicine.includes('levothyroxine') || medicine.includes('synthroid')) {
      return "Thyroid medications like levothyroxine require consistent timing and careful management. Take on an empty stomach 30-60 minutes before breakfast, avoid calcium, iron, and coffee for 4 hours, and maintain consistent timing daily. Natural thyroid support includes: iodine-rich foods like seaweed (in moderation), selenium from Brazil nuts, zinc, vitamin D, and avoiding goitrogenic foods like raw cruciferous vegetables in excess. Regular blood tests are essential to monitor thyroid levels and adjust medication as needed.";
    }

    if (medicine.includes('statin') || medicine.includes('cholesterol') || medicine.includes('atorvastatin')) {
      return "Statin medications for cholesterol require regular monitoring and lifestyle support. Take as prescribed, usually in the evening, report muscle pain or weakness immediately, and have regular liver function tests. Natural cholesterol support includes: soluble fiber from oats and beans, plant sterols, omega-3 fatty acids, red yeast rice (under medical supervision), regular exercise, and a Mediterranean-style diet. CoQ10 supplements may help with statin-related muscle symptoms. Work with your healthcare provider to monitor effectiveness and side effects.";
    }

    if (medicine.includes('vitamin') || medicine.includes('supplement')) {
      return "Vitamins and supplements can support health but should be used wisely. Fat-soluble vitamins (A, D, E, K) can accumulate and cause toxicity, while water-soluble vitamins (B, C) are generally safer. Take with appropriate meals for better absorption, check for interactions with medications, and choose reputable brands with third-party testing. Natural sources are often preferable: vitamin D from sunlight, vitamin C from citrus fruits, B vitamins from whole grains, and minerals from varied whole foods. Consult healthcare providers before starting new supplements, especially if you have medical conditions or take medications.";
    }

    return "For any medication questions, it's essential to consult with a pharmacist, doctor, or healthcare provider who can give you personalized advice based on your specific situation, medical history, age, weight, and other medications. They can provide guidance on proper dosing, timing, food interactions, side effects to watch for, and when natural alternatives might be appropriate. Never hesitate to ask healthcare professionals about any concerns - your safety and wellbeing are the top priority. Keep an updated list of all medications and supplements you take to share with all your healthcare providers.";
  }

  private static generateGeneralResponse(input: string): string {
    // Expanded general health knowledge base
    
    if (input.includes('sleep') || input.includes('insomnia')) {
      return "For better sleep naturally: Establish a consistent sleep schedule going to bed and waking at the same time daily, create a relaxing bedtime routine including activities like reading or gentle stretching, avoid screens 1-2 hours before bed due to blue light interference, keep your bedroom cool (65-68°F), dark, and quiet, try chamomile tea or valerian root 30 minutes before bed, practice progressive muscle relaxation or meditation, avoid caffeine after 2 PM and large meals before bedtime, get morning sunlight exposure to regulate circadian rhythms, and consider magnesium supplementation. If sleep issues persist beyond 2 weeks or significantly impact daily life, consult a healthcare provider or sleep specialist.";
    }
    
    if (input.includes('energy') || input.includes('tired') || input.includes('fatigue')) {
      return "To boost energy naturally: Ensure adequate sleep (7-9 hours nightly), stay consistently hydrated throughout the day, eat balanced meals with protein, complex carbohydrates, and healthy fats, include iron-rich foods like spinach, legumes, and lean meats, get regular sunlight exposure and fresh air, engage in regular physical activity even if just 10-minute walks, manage stress through relaxation techniques, consider B-complex vitamins and vitamin D if deficient, limit processed foods and sugar which cause energy crashes, and maintain social connections. If persistent fatigue lasts more than 2 weeks despite lifestyle changes, consult a healthcare provider to rule out underlying conditions like anemia, thyroid disorders, or sleep apnea.";
    }

    if (input.includes('immune') || input.includes('immunity') || input.includes('immune system')) {
      return "To support immune system naturally: Eat a rainbow of fruits and vegetables rich in vitamins A, C, and E, include zinc-rich foods like pumpkin seeds and shellfish, consume probiotic foods like yogurt, kefir, and fermented vegetables, get adequate sleep as immune cells regenerate during rest, engage in moderate regular exercise, manage stress through meditation or yoga, stay hydrated, get sufficient vitamin D from sunlight or supplements, include immune-supporting herbs like echinacea, elderberry, and astragalus, avoid excessive alcohol and smoking, and maintain good hygiene practices. A strong immune system is built through consistent healthy habits rather than quick fixes.";
    }

    if (input.includes('weight') || input.includes('lose weight') || input.includes('obesity')) {
      return "For healthy weight management: Focus on whole, unprocessed foods including plenty of vegetables, lean proteins, and complex carbohydrates, practice portion control using smaller plates and mindful eating, stay hydrated as thirst is often mistaken for hunger, engage in regular physical activity combining cardio and strength training, get adequate sleep as poor sleep affects hunger hormones, manage stress which can lead to emotional eating, eat regular meals to maintain stable blood sugar, include fiber-rich foods that promote satiety, limit sugary drinks and processed foods, and be patient as sustainable weight loss is 1-2 pounds per week. Consider working with a registered dietitian for personalized guidance.";
    }

    if (input.includes('stress') || input.includes('stress management')) {
      return "For natural stress management: Practice deep breathing exercises like the 4-7-8 technique, engage in regular physical activity which releases stress-reducing endorphins, try meditation or mindfulness practices even for 5-10 minutes daily, maintain social connections and talk to trusted friends or family, spend time in nature which naturally reduces cortisol levels, practice progressive muscle relaxation, consider adaptogenic herbs like ashwagandha or rhodiola under guidance, maintain a gratitude journal, ensure adequate sleep and nutrition, limit caffeine and alcohol which can increase anxiety, and consider professional counseling for chronic stress. Remember that some stress is normal, but chronic stress requires active management.";
    }

    if (input.includes('heart') || input.includes('cardiovascular') || input.includes('heart health')) {
      return "For heart health naturally: Engage in regular aerobic exercise like walking, swimming, or cycling for at least 150 minutes weekly, eat a Mediterranean-style diet rich in omega-3 fatty acids, whole grains, and antioxidants, maintain a healthy weight, don't smoke and limit alcohol consumption, manage stress through relaxation techniques, get adequate sleep, include heart-healthy foods like salmon, walnuts, berries, and leafy greens, limit sodium and processed foods, consider CoQ10 and magnesium supplements under medical guidance, monitor blood pressure regularly, and maintain social connections which support heart health. Regular check-ups with healthcare providers are essential for cardiovascular monitoring.";
    }

    if (input.includes('brain') || input.includes('memory') || input.includes('cognitive')) {
      return "For brain health and memory: Engage in regular mental challenges like puzzles, reading, or learning new skills, exercise regularly as it increases blood flow to the brain, eat brain-healthy foods rich in omega-3s like fish, walnuts, and flaxseeds, include antioxidant-rich berries and dark leafy greens, get quality sleep for memory consolidation, practice stress management as chronic stress damages brain cells, stay socially connected, limit alcohol and avoid smoking, consider meditation which can increase gray matter, include turmeric and green tea for their neuroprotective properties, maintain good cardiovascular health, and challenge yourself with new experiences. If you notice significant memory changes, consult a healthcare provider.";
    }

    if (input.includes('detox') || input.includes('cleanse') || input.includes('toxins')) {
      return "Your body naturally detoxifies through the liver, kidneys, lungs, and skin. To support natural detoxification: Stay well-hydrated to help kidneys flush toxins, eat fiber-rich foods to support digestive elimination, include cruciferous vegetables like broccoli and Brussels sprouts which support liver function, consume antioxidant-rich foods to combat free radicals, get adequate sleep for cellular repair, exercise regularly to promote circulation and sweating, limit exposure to environmental toxins when possible, support gut health with probiotics, include herbs like milk thistle and dandelion under guidance, and avoid extreme detox programs which can be harmful. Your body's natural detox systems work best with consistent healthy lifestyle support rather than dramatic cleanses.";
    }

    if (input.includes('inflammation') || input.includes('anti-inflammatory')) {
      return "To reduce inflammation naturally: Include anti-inflammatory foods like turmeric with black pepper, ginger, fatty fish rich in omega-3s, berries, leafy greens, and olive oil, limit pro-inflammatory foods like processed meats, refined sugars, and trans fats, maintain a healthy weight as excess fat tissue produces inflammatory compounds, engage in regular moderate exercise, get adequate quality sleep, manage stress through relaxation techniques, consider omega-3 supplements if you don't eat fish regularly, include green tea and tart cherry juice, avoid smoking and limit alcohol, and address any underlying health conditions. Chronic inflammation is linked to many diseases, so lifestyle management is crucial for long-term health.";
    }

    return "Thank you for your health question. While I can provide general wellness information based on natural health principles, I always recommend consulting with qualified healthcare professionals for personalized medical advice, especially for specific conditions or persistent symptoms. For comprehensive natural health approaches, consider working with integrative medicine practitioners who combine conventional and complementary therapies. Focus on foundational health practices: adequate sleep, balanced nutrition, regular movement, stress management, and strong social connections. Is there a specific area of natural health you'd like to explore further?";
  }
}