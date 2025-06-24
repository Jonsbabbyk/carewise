import React, { useState, useEffect } from 'react';
import { MapPin, Search, Leaf, Building2, Phone } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

interface LocationData {
  city: string;
  region: string;
  country: string;
}

interface HealthResource {
  id: string;
  name: string;
  type: 'clinic' | 'hospital' | 'pharmacy' | 'natural';
  address: string;
  phone?: string;
  description: string;
  region: string;
}

interface NaturalRemedy {
  id: string;
  name: string;
  localName: string;
  description: string;
  uses: string[];
  region: string;
  availability: string;
}

const Location: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [healthResources, setHealthResources] = useState<HealthResource[]>([]);
  const [naturalRemedies, setNaturalRemedies] = useState<NaturalRemedy[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'remedies'>('resources');

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  // Sample data - in production, this would come from APIs/databases
  const sampleResources: HealthResource[] = [
    {
      id: '1',
      name: 'Community Health Center',
      type: 'clinic',
      address: '123 Main Street',
      phone: '+1-555-0123',
      description: 'Primary healthcare services with accessibility features',
      region: 'general'
    },
    {
      id: '2',
      name: 'City General Hospital',
      type: 'hospital',
      address: '456 Hospital Drive',
      phone: '+1-555-0456',
      description: 'Full-service hospital with emergency care',
      region: 'general'
    },
    {
      id: '3',
      name: 'Natural Health Pharmacy',
      type: 'pharmacy',
      address: '789 Wellness Ave',
      phone: '+1-555-0789',
      description: 'Pharmacy specializing in natural and traditional medicines',
      region: 'general'
    }
  ];

  const sampleRemedies: NaturalRemedy[] = [
    {
      id: '1',
      name: 'Aloe Vera',
      localName: 'Healing Plant',
      description: 'Succulent plant with healing gel inside leaves',
      uses: ['Burns', 'Skin irritation', 'Digestive health'],
      region: 'general',
      availability: 'Available year-round, grows well indoors'
    },
    {
      id: '2',
      name: 'Ginger',
      localName: 'Ginger Root',
      description: 'Spicy root with anti-inflammatory properties',
      uses: ['Nausea', 'Digestive issues', 'Cold symptoms'],
      region: 'general',
      availability: 'Available in grocery stores and markets'
    },
    {
      id: '3',
      name: 'Chamomile',
      localName: 'Calming Flower',
      description: 'Gentle flower with soothing properties',
      uses: ['Sleep aid', 'Anxiety relief', 'Stomach upset'],
      region: 'general',
      availability: 'Grows in gardens, available as tea'
    },
    {
      id: '4',
      name: 'Echinacea',
      localName: 'Purple Coneflower',
      description: 'Native flower that boosts immune system',
      uses: ['Cold prevention', 'Immune support', 'Wound healing'],
      region: 'temperate',
      availability: 'Available in health stores, grows in gardens'
    }
  ];

  useEffect(() => {
    announceToScreenReader('Location services page loaded. Find local health resources and natural remedies in your area.');
    speak('Welcome to Location Services! Here you can find local health resources and discover natural remedies available in your region.');
    
    // Load sample data
    setHealthResources(sampleResources);
    setNaturalRemedies(sampleRemedies);
  }, [announceToScreenReader, speak]);

  const detectLocation = async () => {
    setIsDetecting(true);
    announceToScreenReader('Detecting your location...');

    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            // In production, use reverse geocoding API
            // For demo, we'll simulate location detection
            const mockLocation: LocationData = {
              city: 'Demo City',
              region: 'Demo Region',
              country: 'Demo Country'
            };
            
            setLocation(mockLocation);
            announceToScreenReader(`Location detected: ${mockLocation.city}, ${mockLocation.region}`);
            speak(`Location detected as ${mockLocation.city}, ${mockLocation.region}. Loading local health resources.`);
            setIsDetecting(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            announceToScreenReader('Unable to detect location. Please enter your location manually.');
            speak('Unable to detect your location automatically. Please enter your city or region manually.');
            setIsDetecting(false);
          }
        );
      } else {
        throw new Error('Geolocation not supported');
      }
    } catch (error) {
      console.error('Location detection error:', error);
      announceToScreenReader('Location detection not available. Please enter your location manually.');
      setIsDetecting(false);
    }
  };

  const handleManualLocation = () => {
    if (!manualLocation.trim()) return;

    const locationData: LocationData = {
      city: manualLocation.trim(),
      region: 'User Specified',
      country: 'Unknown'
    };

    setLocation(locationData);
    announceToScreenReader(`Location set to: ${locationData.city}`);
    speak(`Location set to ${locationData.city}. Loading local health information.`);
    setManualLocation('');
  };

  const getResourceIcon = (type: HealthResource['type']) => {
    switch (type) {
      case 'clinic':
        return Building2;
      case 'hospital':
        return Building2;
      case 'pharmacy':
        return Building2;
      case 'natural':
        return Leaf;
      default:
        return Building2;
    }
  };

  const getResourceColor = (type: HealthResource['type']) => {
    switch (type) {
      case 'clinic':
        return 'primary';
      case 'hospital':
        return 'error';
      case 'pharmacy':
        return 'secondary';
      case 'natural':
        return 'success';
      default:
        return 'primary';
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-success-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-success-500 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Local Health Resources</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find nearby health facilities and discover natural remedies available in your region. 
            All information is accessible and includes contact details.
          </p>
        </div>

        {/* Location Detection */}
        <Card className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Location</h2>
          
          {!location ? (
            <div className="space-y-4">
              <p className="text-gray-600">
                To provide you with relevant local health resources, we need to know your location.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  onClick={detectLocation}
                  loading={isDetecting}
                  disabled={isDetecting}
                  className="sm:w-auto"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  {isDetecting ? 'Detecting...' : 'Detect My Location'}
                </Button>
                
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Or enter your city/region"
                    className="flex-1 p-3 border-2 border-gray-300 rounded-xl focus:border-primary-500 focus:ring-4 focus:ring-primary-500 focus:ring-opacity-20"
                    onKeyPress={(e) => e.key === 'Enter' && handleManualLocation()}
                  />
                  <Button
                    variant="outline"
                    onClick={handleManualLocation}
                    disabled={!manualLocation.trim()}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  📍 {location.city}, {location.region}
                </h3>
                <p className="text-gray-600">Showing resources for your area</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setLocation(null)}
              >
                Change Location
              </Button>
            </div>
          )}
        </Card>

        {location && (
          <>
            {/* Tab Navigation */}
            <div className="flex mb-6">
              <button
                onClick={() => setActiveTab('resources')}
                className={`flex-1 py-3 px-6 text-center font-semibold rounded-l-xl border-2 transition-colors ${
                  activeTab === 'resources'
                    ? 'bg-primary-500 text-white border-primary-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={activeTab === 'resources'}
              >
                <Building2 className="inline-block mr-2 h-5 w-5" />
                Health Facilities
              </button>
              <button
                onClick={() => setActiveTab('remedies')}
                className={`flex-1 py-3 px-6 text-center font-semibold rounded-r-xl border-2 border-l-0 transition-colors ${
                  activeTab === 'remedies'
                    ? 'bg-success-500 text-white border-success-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
                aria-pressed={activeTab === 'remedies'}
              >
                <Leaf className="inline-block mr-2 h-5 w-5" />
                Natural Remedies
              </button>
            </div>

            {/* Health Resources Tab */}
            {activeTab === 'resources' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Nearby Health Facilities</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {healthResources.map((resource) => {
                    const Icon = getResourceIcon(resource.type);
                    const color = getResourceColor(resource.type);
                    
                    return (
                      <Card key={resource.id} hover className={`border-2 border-${color}-200`}>
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`h-6 w-6 text-${color}-600`} aria-hidden="true" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{resource.description}</p>
                            <div className="space-y-1 text-sm">
                              <p className="text-gray-700">
                                <MapPin className="inline h-4 w-4 mr-1" />
                                {resource.address}
                              </p>
                              {resource.phone && (
                                <p className="text-gray-700">
                                  <Phone className="inline h-4 w-4 mr-1" />
                                  <a 
                                    href={`tel:${resource.phone}`}
                                    className="text-primary-600 hover:text-primary-700 underline"
                                  >
                                    {resource.phone}
                                  </a>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Natural Remedies Tab */}
            {activeTab === 'remedies' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900">Local Natural Remedies</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {naturalRemedies.map((remedy) => (
                    <Card key={remedy.id} hover className="border-2 border-success-200">
                      <div className="flex items-start space-x-4">
                        <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <Leaf className="h-6 w-6 text-success-600" aria-hidden="true" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">{remedy.name}</h3>
                          <p className="text-sm text-success-600 font-medium mb-2">{remedy.localName}</p>
                          <p className="text-gray-700 mb-3">{remedy.description}</p>
                          
                          <div className="space-y-2">
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">Common Uses:</h4>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {remedy.uses.map((use, index) => (
                                  <li key={index}>{use}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">Availability:</h4>
                              <p className="text-sm text-gray-600">{remedy.availability}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Emergency Information */}
            <Card className="mt-8 bg-error-50 border-error-200">
              <h3 className="text-lg font-bold text-error-800 mb-2">Emergency Information</h3>
              <p className="text-error-700 mb-4">
                In case of medical emergencies, always call your local emergency services immediately.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-error-800">Emergency:</span>
                  <span className="ml-2 text-error-700">911 (US/Canada)</span>
                </div>
                <div>
                  <span className="font-semibold text-error-800">Poison Control:</span>
                  <span className="ml-2 text-error-700">1-800-222-1222</span>
                </div>
                <div>
                  <span className="font-semibold text-error-800">Crisis Line:</span>
                  <span className="ml-2 text-error-700">988 (Suicide & Crisis)</span>
                </div>
              </div>
            </Card>
          </>
        )}
      </div>
    </main>
  );
};

export default Location;