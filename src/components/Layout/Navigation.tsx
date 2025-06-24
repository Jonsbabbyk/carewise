import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  MessageCircle, 
  FileText, 
  BookOpen, 
  MapPin, 
  Heart, 
  Pill, 
  Gamepad2,
  Trophy,
  X
} from 'lucide-react';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const { announceToScreenReader } = useAccessibility();

  const navigationItems = [
    {
      path: '/',
      label: 'Home',
      description: 'Welcome & AI Doctor',
      icon: Home,
      color: 'primary',
    },
    {
      path: '/ask-ai',
      label: 'Ask AI',
      description: 'Health Questions & Answers',
      icon: MessageCircle,
      color: 'secondary',
    },
    {
      path: '/health-form',
      label: 'Health Form',
      description: 'Report Symptoms',
      icon: FileText,
      color: 'accent',
    },
    {
      path: '/awareness',
      label: 'Health Awareness',
      description: 'Natural Remedies & Lessons',
      icon: BookOpen,
      color: 'success',
    },
    {
      path: '/location',
      label: 'Location',
      description: 'Local Health Resources',
      icon: MapPin,
      color: 'warning',
    },
    {
      path: '/mental-health',
      label: 'Mental Health',
      description: 'Mood Check & Emergency',
      icon: Heart,
      color: 'error',
    },
    {
      path: '/medicine',
      label: 'Medicine Info',
      description: 'Medication Questions',
      icon: Pill,
      color: 'primary',
    },
    {
      path: '/game',
      label: 'Sunshine Hero',
      description: 'Cheer-Up Game',
      icon: Gamepad2,
      color: 'accent',
    },
    {
      path: '/health-quest',
      label: 'Health Quest',
      description: 'Quiz Adventure Game',
      icon: Trophy,
      color: 'success',
    },
  ];

  const handleNavigation = (label: string) => {
    announceToScreenReader(`Navigating to ${label}`);
    onClose();
  };

  const getColorClasses = (color: string, isActive: boolean) => {
    const colorMap = {
      primary: isActive 
        ? 'bg-primary-100 border-primary-500 text-primary-700' 
        : 'hover:bg-primary-50 hover:border-primary-300',
      secondary: isActive 
        ? 'bg-secondary-100 border-secondary-500 text-secondary-700' 
        : 'hover:bg-secondary-50 hover:border-secondary-300',
      accent: isActive 
        ? 'bg-accent-100 border-accent-500 text-accent-700' 
        : 'hover:bg-accent-50 hover:border-accent-300',
      success: isActive 
        ? 'bg-success-100 border-success-500 text-success-700' 
        : 'hover:bg-success-50 hover:border-success-300',
      warning: isActive 
        ? 'bg-warning-100 border-warning-500 text-warning-700' 
        : 'hover:bg-warning-50 hover:border-warning-300',
      error: isActive 
        ? 'bg-error-100 border-error-500 text-error-700' 
        : 'hover:bg-error-50 hover:border-error-300',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.primary;
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Navigation Menu */}
      <nav
        id="navigation-menu"
        className={`fixed top-0 right-0 h-full w-80 max-w-[90vw] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } lg:relative lg:transform-none lg:w-64 lg:shadow-lg lg:block`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 lg:hidden">
            <h2 className="text-xl font-bold text-gray-900">Navigation</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-500 focus:ring-offset-2"
              aria-label="Close navigation menu"
            >
              <X className="h-6 w-6 text-gray-600" aria-hidden="true" />
            </button>
          </div>

          {/* Navigation Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => handleNavigation(item.label)}
                  className={`flex items-center p-4 rounded-xl border-2 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-opacity-50 ${
                    isActive 
                      ? getColorClasses(item.color, true)
                      : `border-gray-200 text-gray-700 ${getColorClasses(item.color, false)}`
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <div className={`p-2 rounded-lg mr-4 ${
                    isActive 
                      ? `bg-${item.color}-200` 
                      : 'bg-gray-100 group-hover:bg-gray-200'
                  }`}>
                    <Icon className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base truncate">{item.label}</h3>
                    <p className="text-sm opacity-75 truncate">{item.description}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center">
              CareWise AI v1.0<br />
              <span className="text-xs">Accessible Health Companion</span>
            </p>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navigation;