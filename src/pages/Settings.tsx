import React, { useEffect } from 'react';
import { Settings as SettingsIcon, Eye, Brain, Type, Volume2, Palette, Sun, Moon, Contrast } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

const Settings: React.FC = () => {
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  useEffect(() => {
    announceToScreenReader('Accessibility Settings page loaded. Customize your experience here.');
    speak('Welcome to Accessibility Settings. Here you can customize your experience with different accessibility modes, font sizes, contrast options, and visual preferences.');
  }, [announceToScreenReader, speak]);

  const handleModeChange = async (mode: typeof settings.mode) => {
    updateSettings({ mode });
    announceToScreenReader(`Accessibility mode changed to ${mode.replace('-', ' ')}`);
    speak(`Switched to ${mode.replace('-', ' ')} mode`);
    
    // Save to Supabase
    try {
      await supabase.from('user_preferences').upsert({
        user_id: 'anonymous-user',
        accessibility_mode: mode,
        font_preference: settings.fontSize,
        voice_enabled: settings.voiceEnabled,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleFontSizeChange = async (fontSize: typeof settings.fontSize) => {
    updateSettings({ fontSize });
    announceToScreenReader(`Font size changed to ${fontSize}`);
    speak(`Font size set to ${fontSize}`);
    
    // Save to Supabase
    try {
      await supabase.from('user_preferences').upsert({
        user_id: 'anonymous-user',
        accessibility_mode: settings.mode,
        font_preference: fontSize,
        voice_enabled: settings.voiceEnabled,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleContrastModeChange = async (contrastMode: typeof settings.contrastMode) => {
    updateSettings({ contrastMode });
    announceToScreenReader(`Contrast mode changed to ${contrastMode} contrast`);
    speak(`Switched to ${contrastMode} contrast mode`);
    
    // Save to Supabase
    try {
      await supabase.from('user_preferences').upsert({
        user_id: 'anonymous-user',
        accessibility_mode: settings.mode,
        font_preference: settings.fontSize,
        voice_enabled: settings.voiceEnabled,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const handleToggleSetting = async (setting: keyof typeof settings, value: boolean) => {
    updateSettings({ [setting]: value });
    announceToScreenReader(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'enabled' : 'disabled'}`);
    speak(`${setting.replace(/([A-Z])/g, ' $1').toLowerCase()} ${value ? 'turned on' : 'turned off'}`);
    
    // Save to Supabase
    try {
      await supabase.from('user_preferences').upsert({
        user_id: 'anonymous-user',
        accessibility_mode: settings.mode,
        font_preference: settings.fontSize,
        voice_enabled: setting === 'voiceEnabled' ? value : settings.voiceEnabled,
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  };

  const accessibilityModes = [
    {
      id: 'standard',
      name: 'Standard Mode',
      description: 'Default experience with standard fonts and colors',
      icon: SettingsIcon,
      color: 'primary'
    },
    {
      id: 'visual-impairment',
      name: 'Visual Impairment Mode',
      description: 'Audio-first experience with enhanced screen reader support',
      icon: Eye,
      color: 'secondary'
    },
    {
      id: 'cognitive-support',
      name: 'Cognitive Support Mode',
      description: 'Simplified interface with clear language and reduced complexity',
      icon: Brain,
      color: 'success'
    },
    {
      id: 'dyslexia-friendly',
      name: 'Dyslexia-Friendly Mode',
      description: 'OpenDyslexic font and optimized text spacing for better readability',
      icon: Type,
      color: 'accent'
    }
  ];

  const fontSizes = [
    { id: 'small', name: 'Small', description: '14px - Compact text' },
    { id: 'medium', name: 'Medium', description: '16px - Standard size' },
    { id: 'large', name: 'Large', description: '18px - Easier to read' },
    { id: 'extra-large', name: 'Extra Large', description: '20px - Maximum readability' }
  ];

  const contrastModes = [
    {
      id: 'light',
      name: 'Light Mode',
      description: 'Standard light background with dark text',
      icon: Sun,
      color: 'primary'
    },
    {
      id: 'medium',
      name: 'Medium Contrast',
      description: 'Enhanced contrast for better visibility',
      icon: Contrast,
      color: 'warning'
    },
    {
      id: 'high',
      name: 'High Contrast (Dark)',
      description: 'Dark background with high contrast text',
      icon: Moon,
      color: 'secondary'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center shadow-lg">
              <SettingsIcon className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Accessibility Settings</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Customize your CareWise AI experience with accessibility features designed for different needs and preferences.
          </p>
        </div>

        <div className="space-y-8">
          {/* Accessibility Modes */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Accessibility Modes</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accessibilityModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = settings.mode === mode.id;
                
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleModeChange(mode.id as typeof settings.mode)}
                    className={`p-6 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                      isActive
                        ? `border-${mode.color}-500 bg-${mode.color}-50 focus:ring-${mode.color}-500`
                        : 'border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isActive ? `bg-${mode.color}-100` : 'bg-gray-100'
                      }`}>
                        <Icon className={`h-6 w-6 ${
                          isActive ? `text-${mode.color}-600` : 'text-gray-600'
                        }`} aria-hidden="true" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold mb-2 ${
                          isActive ? `text-${mode.color}-900` : 'text-gray-900'
                        }`}>
                          {mode.name}
                        </h3>
                        <p className={`text-sm ${
                          isActive ? `text-${mode.color}-700` : 'text-gray-600'
                        }`}>
                          {mode.description}
                        </p>
                      </div>
                      {isActive && (
                        <div className={`w-6 h-6 rounded-full bg-${mode.color}-500 flex items-center justify-center`}>
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Contrast Control */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Visual Contrast</h2>
            <p className="text-gray-600 mb-4">
              Choose the contrast level that works best for your vision and environment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {contrastModes.map((mode) => {
                const Icon = mode.icon;
                const isActive = settings.contrastMode === mode.id;
                
                return (
                  <button
                    key={mode.id}
                    onClick={() => handleContrastModeChange(mode.id as typeof settings.contrastMode)}
                    className={`p-6 rounded-xl border-2 text-center transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                      isActive
                        ? `border-${mode.color}-500 bg-${mode.color}-50 focus:ring-${mode.color}-500`
                        : 'border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                    }`}
                    aria-pressed={isActive}
                  >
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-3 ${
                      isActive ? `bg-${mode.color}-100` : 'bg-gray-100'
                    }`}>
                      <Icon className={`h-6 w-6 ${
                        isActive ? `text-${mode.color}-600` : 'text-gray-600'
                      }`} aria-hidden="true" />
                    </div>
                    <h3 className={`font-semibold mb-2 ${
                      isActive ? `text-${mode.color}-900` : 'text-gray-900'
                    }`}>
                      {mode.name}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? `text-${mode.color}-700` : 'text-gray-600'
                    }`}>
                      {mode.description}
                    </p>
                    {isActive && (
                      <div className="mt-3">
                        <div className={`w-4 h-4 rounded-full bg-${mode.color}-500 mx-auto`}></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Font Size Settings */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Font Size</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {fontSizes.map((size) => {
                const isActive = settings.fontSize === size.id;
                
                return (
                  <button
                    key={size.id}
                    onClick={() => handleFontSizeChange(size.id as typeof settings.fontSize)}
                    className={`p-4 rounded-xl border-2 text-left transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                      isActive
                        ? 'border-primary-500 bg-primary-50 focus:ring-primary-500'
                        : 'border-gray-200 hover:border-gray-300 focus:ring-gray-500'
                    }`}
                    aria-pressed={isActive}
                  >
                    <h3 className={`font-semibold mb-1 ${
                      isActive ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {size.name}
                    </h3>
                    <p className={`text-sm ${
                      isActive ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      {size.description}
                    </p>
                    {isActive && (
                      <div className="mt-2">
                        <div className="w-4 h-4 rounded-full bg-primary-500"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Toggle Settings */}
          <Card>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Additional Settings</h2>
            <div className="space-y-6">
              {/* Legacy High Contrast Toggle (for backward compatibility) */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Palette className="h-6 w-6 text-gray-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Legacy High Contrast</h3>
                    <p className="text-sm text-gray-600">Override contrast mode with legacy high contrast</p>
                  </div>
                </div>
                <Button
                  variant={settings.highContrast ? 'primary' : 'outline'}
                  onClick={() => handleToggleSetting('highContrast', !settings.highContrast)}
                  aria-pressed={settings.highContrast}
                >
                  {settings.highContrast ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Voice Enabled */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Volume2 className="h-6 w-6 text-gray-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Voice Assistance</h3>
                    <p className="text-sm text-gray-600">Enable text-to-speech and voice responses</p>
                  </div>
                </div>
                <Button
                  variant={settings.voiceEnabled ? 'primary' : 'outline'}
                  onClick={() => handleToggleSetting('voiceEnabled', !settings.voiceEnabled)}
                  aria-pressed={settings.voiceEnabled}
                >
                  {settings.voiceEnabled ? 'On' : 'Off'}
                </Button>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                    <SettingsIcon className="h-6 w-6 text-gray-600" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Reduced Motion</h3>
                    <p className="text-sm text-gray-600">Minimize animations and transitions</p>
                  </div>
                </div>
                <Button
                  variant={settings.reducedMotion ? 'primary' : 'outline'}
                  onClick={() => handleToggleSetting('reducedMotion', !settings.reducedMotion)}
                  aria-pressed={settings.reducedMotion}
                >
                  {settings.reducedMotion ? 'On' : 'Off'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Current Settings Summary */}
          <Card className="bg-blue-50 border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Current Settings Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-blue-800">Mode:</span>
                <span className="ml-2 text-blue-700">{settings.mode.replace('-', ' ')}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Font Size:</span>
                <span className="ml-2 text-blue-700">{settings.fontSize}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Contrast:</span>
                <span className="ml-2 text-blue-700">{settings.contrastMode} contrast</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Voice:</span>
                <span className="ml-2 text-blue-700">{settings.voiceEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Reduced Motion:</span>
                <span className="ml-2 text-blue-700">{settings.reducedMotion ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div>
                <span className="font-medium text-blue-800">Legacy High Contrast:</span>
                <span className="ml-2 text-blue-700">{settings.highContrast ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-4">
              Settings are automatically saved and will persist across sessions.
            </p>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default Settings;