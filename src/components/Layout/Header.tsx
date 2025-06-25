import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Menu, Settings, Volume2, VolumeX, X } from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useVoice } from '../../hooks/useVoice';

interface HeaderProps {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, isMenuOpen }) => {
  const location = useLocation();
  const { settings, updateSettings, announceToScreenReader } = useAccessibility();
  const { isSupported } = useVoice();

  const toggleVoice = () => {
    const newVoiceState = !settings.voiceEnabled;
    updateSettings({ voiceEnabled: newVoiceState });
    announceToScreenReader(
      newVoiceState ? 'Voice assistance enabled' : 'Voice assistance disabled'
    );
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titleMap: Record<string, string> = {
      '/': 'Home - Your Health Companion',
      '/ask-ai': 'Ask AI - Get Health Answers',
      '/health-form': 'Health Form - Report Symptoms',
      '/awareness': 'Health Awareness - Natural Remedies',
      '/location': 'Location - Local Health Resources',
      '/settings': 'Accessibility Settings',
      '/mental-health': 'Mental Health & Emergency',
      '/medicine': 'Medicine Information',
      '/game': 'Sunshine Hero Game',
      '/health-quest': 'Health Quest - Quiz Adventure',
    };
    return titleMap[path] || 'CareWise AI';
  };

  return (
    <header className="bg-white shadow-lg border-b-4 border-primary-500" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo and Title */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 group focus:outline-none focus:ring-4 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-2 -m-2"
            aria-label="CareWise AI Home"
          >
            <div className="bg-gradient-to-br from-primary-500 to-secondary-500 p-2 rounded-xl group-hover:scale-110 transition-transform duration-200">
              <Heart className="h-6 w-6 sm:h-8 sm:w-8 text-white" aria-hidden="true" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                CareWise AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 -mt-1">Your Health Companion</p>
            </div>
          </Link>

          {/* Current Page Title - Mobile */}
          <div className="sm:hidden flex-1 text-center mx-4">
            <h2 className="text-sm font-semibold text-gray-900 truncate" id="page-title">
              {getPageTitle()}
            </h2>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Voice Toggle */}
            {isSupported && (
              <button
                onClick={toggleVoice}
                className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 ${
                  settings.voiceEnabled
                    ? 'bg-primary-100 border-primary-500 text-primary-700 hover:bg-primary-200 focus:ring-primary-500'
                    : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200 focus:ring-gray-500'
                }`}
                aria-label={settings.voiceEnabled ? 'Disable voice assistance' : 'Enable voice assistance'}
                title={settings.voiceEnabled ? 'Voice On' : 'Voice Off'}
              >
                {settings.voiceEnabled ? (
                  <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                )}
              </button>
            )}

            {/* Settings Link */}
            <Link
              to="/settings"
              className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-secondary-500 ${
                location.pathname === '/settings'
                  ? 'bg-secondary-100 border-secondary-500 text-secondary-700'
                  : 'bg-gray-100 border-gray-300 text-gray-600 hover:bg-gray-200'
              }`}
              aria-label="Accessibility Settings"
              title="Settings"
            >
              <Settings className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Link>

            {/* Menu Toggle */}
            <button
              onClick={onMenuToggle}
              className="p-2 sm:p-3 rounded-xl bg-accent-100 border-2 border-accent-500 text-accent-700 hover:bg-accent-200 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-accent-500 focus:ring-offset-2"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="navigation-menu"
            >
              {isMenuOpen ? (
                <X className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              ) : (
                <Menu className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Page Title - Desktop */}
        <div className="hidden sm:block pb-4">
          <h2 className="text-lg font-semibold text-gray-700" id="page-title-desktop">
            {getPageTitle()}
          </h2>
        </div>
      </div>
    </header>
  );
};

export default Header;