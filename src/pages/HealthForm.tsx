import React, { useState } from 'react';
import { FileText, Download, Send, Mic } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import { AIServices } from '../services/aiServices';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import VoiceButton from '../components/UI/VoiceButton';
import TavusAvatar from '../components/UI/TavusAvatar';
import jsPDF from 'jspdf';

interface HealthFormData {
  symptoms: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration: string;
  additionalNotes: string;
}

const HealthForm: React.FC = () => {
  const [formData, setFormData] = useState<HealthFormData>({
    symptoms: '',
    severity: 'mild',
    duration: '',
    additionalNotes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  const handleInputChange = (field: keyof HealthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleVoiceInput = (field: keyof HealthFormData) => (transcript: string) => {
    handleInputChange(field, transcript);
    announceToScreenReader(`Voice input received for ${field}: ${transcript}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) return;

    setIsSubmitting(true);
    announceToScreenReader('Processing your health form submission');

    try {
      // Generate AI response based on symptoms
      const symptomDescription = `Symptoms: ${formData.symptoms}. Severity: ${formData.severity}. Duration: ${formData.duration}. Additional notes: ${formData.additionalNotes}`;
      const response = AIServices.generateHealthResponse(symptomDescription, 'symptoms');
      
      setAiResponse(response);
      setShowResponse(true);

      // Save to Supabase
      try {
        await supabase.from('health_forms').insert({
          user_id: 'anonymous-user',
          symptoms: formData.symptoms,
          severity: formData.severity,
          duration: formData.duration,
          additional_notes: formData.additionalNotes,
          ai_response: response,
        });
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }

      // Speak the response
      announceToScreenReader('Health assessment complete. AI response generated.');
      setTimeout(() => {
        AIServices.generateSpeech(response).catch(() => speak(response));
      }, 1000);

    } catch (error) {
      console.error('Error processing form:', error);
      announceToScreenReader('Error processing your form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const downloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;

    // Title
    doc.setFontSize(20);
    doc.text('CareWise AI - Health Assessment Report', margin, 30);

    // Date
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, margin, 50);

    // Symptoms
    doc.setFontSize(14);
    doc.text('Reported Symptoms:', margin, 70);
    doc.setFontSize(12);
    const symptomsLines = doc.splitTextToSize(formData.symptoms, maxWidth);
    doc.text(symptomsLines, margin, 85);

    // Severity and Duration
    let yPosition = 85 + (symptomsLines.length * 7) + 10;
    doc.text(`Severity: ${formData.severity}`, margin, yPosition);
    doc.text(`Duration: ${formData.duration}`, margin, yPosition + 15);

    // Additional Notes
    if (formData.additionalNotes) {
      yPosition += 35;
      doc.setFontSize(14);
      doc.text('Additional Notes:', margin, yPosition);
      doc.setFontSize(12);
      const notesLines = doc.splitTextToSize(formData.additionalNotes, maxWidth);
      doc.text(notesLines, margin, yPosition + 15);
      yPosition += 15 + (notesLines.length * 7);
    }

    // AI Response
    yPosition += 20;
    doc.setFontSize(14);
    doc.text('AI Health Guidance:', margin, yPosition);
    doc.setFontSize(12);
    const responseLines = doc.splitTextToSize(aiResponse, maxWidth);
    doc.text(responseLines, margin, yPosition + 15);

    // Disclaimer
    yPosition += 15 + (responseLines.length * 7) + 20;
    doc.setFontSize(10);
    doc.text('Disclaimer: This is general health information. Consult healthcare professionals for medical advice.', margin, yPosition);

    doc.save('carewise-health-assessment.pdf');
    announceToScreenReader('Health assessment PDF downloaded successfully');
  };

  const resetForm = () => {
    setFormData({
      symptoms: '',
      severity: 'mild',
      duration: '',
      additionalNotes: '',
    });
    setAiResponse('');
    setShowResponse(false);
    announceToScreenReader('Form reset successfully');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-secondary-50 via-white to-accent-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-full flex items-center justify-center shadow-lg">
              <FileText className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Health Symptom Report</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Report your symptoms using voice or text input. Get AI-powered health guidance 
            and download a summary for your records. Fully accessible with screen reader support.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form Section */}
          <div>
            <Card>
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Describe Your Symptoms</h2>

                {/* Symptoms Input */}
                <div>
                  <label htmlFor="symptoms" className="block text-sm font-semibold text-gray-900 mb-2">
                    What symptoms are you experiencing? *
                  </label>
                  <div className="relative">
                    <textarea
                      id="symptoms"
                      value={formData.symptoms}
                      onChange={(e) => handleInputChange('symptoms', e.target.value)}
                      placeholder="Describe your symptoms in detail (e.g., 'I have a headache, feel tired, and have a sore throat')"
                      className="w-full min-h-[120px] p-4 border-2 border-gray-300 rounded-xl focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500 focus:ring-opacity-20 resize-vertical text-lg"
                      required
                      rows={4}
                    />
                    <div className="absolute top-2 right-2">
                      <VoiceButton 
                        onResult={handleVoiceInput('symptoms')}
                        className="!p-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Severity Selection */}
                <div>
                  <label htmlFor="severity" className="block text-sm font-semibold text-gray-900 mb-2">
                    How severe are your symptoms?
                  </label>
                  <select
                    id="severity"
                    value={formData.severity}
                    onChange={(e) => handleInputChange('severity', e.target.value as 'mild' | 'moderate' | 'severe')}
                    className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500 focus:ring-opacity-20 text-lg"
                  >
                    <option value="mild">Mild - Manageable discomfort</option>
                    <option value="moderate">Moderate - Noticeable impact on daily activities</option>
                    <option value="severe">Severe - Significant distress or limitation</option>
                  </select>
                </div>

                {/* Duration Input */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-semibold text-gray-900 mb-2">
                    How long have you had these symptoms?
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      placeholder="e.g., '2 days', '1 week', 'since this morning'"
                      className="w-full p-4 border-2 border-gray-300 rounded-xl focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500 focus:ring-opacity-20 text-lg"
                    />
                    <div className="absolute top-2 right-2">
                      <VoiceButton 
                        onResult={handleVoiceInput('duration')}
                        className="!p-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-semibold text-gray-900 mb-2">
                    Any additional information?
                  </label>
                  <div className="relative">
                    <textarea
                      id="notes"
                      value={formData.additionalNotes}
                      onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                      placeholder="Any other details, medications you're taking, or questions you have"
                      className="w-full min-h-[80px] p-4 border-2 border-gray-300 rounded-xl focus:border-secondary-500 focus:ring-4 focus:ring-secondary-500 focus:ring-opacity-20 resize-vertical text-lg"
                      rows={3}
                    />
                    <div className="absolute top-2 right-2">
                      <VoiceButton 
                        onResult={handleVoiceInput('additionalNotes')}
                        className="!p-2"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    variant="secondary"
                    size="large"
                    disabled={!formData.symptoms.trim() || isSubmitting}
                    loading={isSubmitting}
                    fullWidth
                  >
                    {isSubmitting ? 'Processing...' : (
                      <>
                        Get AI Health Guidance <Send className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  
                  <Button
                    type="button"
                    variant="outline"
                    size="large"
                    onClick={resetForm}
                    className="sm:w-auto"
                  >
                    Reset Form
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Response Section */}
          <div>
            {showResponse ? (
              <div className="space-y-6">
                {/* AI Avatar Response */}
                <Card>
                  <TavusAvatar 
                    message={aiResponse}
                    autoPlay={true}
                    className="mb-4"
                  />
                  <h3 className="text-xl font-bold text-gray-900 mb-3">AI Health Guidance</h3>
                  <p className="text-gray-800 leading-relaxed mb-4">{aiResponse}</p>
                  
                  <div className="flex flex-col gap-3">
                    <Button
                      variant="success"
                      size="medium"
                      onClick={downloadPDF}
                      fullWidth
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download PDF Report
                    </Button>
                  </div>
                </Card>

                {/* Important Notice */}
                <Card className="bg-yellow-50 border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-2">Important Medical Notice</h4>
                  <p className="text-sm text-yellow-700">
                    This AI guidance is for informational purposes only and should not replace professional medical advice. 
                    If symptoms are severe, persistent, or concerning, please consult a healthcare provider immediately. 
                    In emergencies, call your local emergency services.
                  </p>
                </Card>
              </div>
            ) : (
              <Card className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">AI Response Will Appear Here</h3>
                <p className="text-gray-600">
                  Fill out the form and submit to receive personalized health guidance from our AI companion.
                </p>
              </Card>
            )}
          </div>
        </div>

        {/* Accessibility Features */}
        <div className="mt-8">
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">Accessibility Features</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Voice input available for all text fields</li>
              <li>• Screen reader compatible with proper labels and announcements</li>
              <li>• Large click targets and keyboard navigation support</li>
              <li>• High contrast mode available in accessibility settings</li>
              <li>• Audio responses with ElevenLabs voice synthesis</li>
            </ul>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default HealthForm;