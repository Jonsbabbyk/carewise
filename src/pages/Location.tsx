import React, { useState, useEffect } from 'react';
import { MapPin, Search, Leaf, Building2, Phone, Navigation } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { supabase } from '../lib/supabase';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';

interface LocationData {
  city: string;
  region: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

interface HealthResource {
  id: string;
  name: string;
  type: 'clinic' | 'hospital' | 'pharmacy' | 'natural';
  address: string;
  phone?: string;
  description: string;
  region: string;
  distance?: string;
}

interface NaturalRemedy {
  id: string;
  name: string;
  localName: string;
  description: string;
  uses: string[];
  region: string;
  availability: string;
  culturalUse?: string;
}

const Location: React.FC = () => {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [manualLocation, setManualLocation] = useState('');
  const [isDetecting, setIsDetecting] = useState(false);
  const [healthResources, setHealthResources] = useState<HealthResource[]>([]);
  const [naturalRemedies, setNaturalRemedies] = useState<NaturalRemedy[]>([]);
  const [activeTab, setActiveTab] = useState<'resources' | 'remedies'>('resources');
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  const { announceToScreenReader } = useAccessibility();
  const { speak } = useVoice();

  // Regional health resources based on location
  const getRegionalResources = (region: string): HealthResource[] => {
    const baseResources = [
      {
        id: '1',
        name: 'Community Health Center',
        type: 'clinic' as const,
        address: '123 Main Street',
        phone: '+1-555-0123',
        description: 'Primary healthcare services with accessibility features',
        region: 'general',
        distance: '0.5 miles'
      },
      {
        id: '2',
        name: 'Regional Medical Center',
        type: 'hospital' as const,
        address: '456 Hospital Drive',
        phone: '+1-555-0456',
        description: 'Full-service hospital with emergency care',
        region: 'general',
        distance: '1.2 miles'
      },
      {
        id: '3',
        name: 'Natural Health Pharmacy',
        type: 'pharmacy' as const,
        address: '789 Wellness Ave',
        phone: '+1-555-0789',
        description: 'Pharmacy specializing in natural and traditional medicines',
        region: 'general',
        distance: '0.8 miles'
      }
    ];

    // Add region-specific resources
    if (region.toLowerCase().includes('california') || region.toLowerCase().includes('west')) {
      baseResources.push({
        id: '4',
        name: 'Holistic Wellness Center',
        type: 'natural' as const,
        address: '321 Pacific Coast Hwy',
        phone: '+1-555-0321',
        description: 'Integrative medicine with acupuncture and herbal treatments',
        region: 'west',
        distance: '2.1 miles'
      });
    }

    return baseResources;
  };

  // Regional natural remedies based on location
  const getRegionalRemedies = (region: string): NaturalRemedy[] => {
    const baseRemedies = [
      {
        id: '1',
        name: 'Aloe Vera',
        localName: 'Healing Plant',
        description: 'Succulent plant with healing gel inside leaves',
        uses: ['Burns', 'Skin irritation', 'Digestive health'],
        region: 'general',
        availability: 'Available year-round, grows well indoors',
        culturalUse: 'Used globally for thousands of years'
      },
      {
        id: '2',
        name: 'Ginger',
        localName: 'Ginger Root',
        description: 'Spicy root with anti-inflammatory properties',
        uses: ['Nausea', 'Digestive issues', 'Cold symptoms'],
        region: 'general',
        availability: 'Available in grocery stores and markets',
        culturalUse: 'Traditional Asian medicine staple'
      }
    ];

    // Add region-specific remedies
    if (region.toLowerCase().includes('california') || region.toLowerCase().includes('west')) {
      baseRemedies.push(
        {
          id: '3',
          name: 'California Poppy',
          localName: 'Golden Poppy',
          description: 'Native California flower with calming properties',
          uses: ['Sleep aid', 'Anxiety relief', 'Pain management'],
          region: 'california',
          availability: 'Grows wild in California, available as supplements',
          culturalUse: 'Used by Native Californian tribes for centuries'
        },
        {
          id: '4',
          name: 'Yerba Buena',
          localName: 'Good Herb',
          description: 'Native mint variety with digestive benefits',
          uses: ['Stomach upset', 'Headaches', 'Respiratory issues'],
          region: 'california',
          availability: 'Grows in coastal California, available dried',
          culturalUse: 'Traditional remedy of California indigenous peoples'
        }
      );
    }

    if (region.toLowerCase().includes('texas') || region.toLowerCase().includes('south')) {
      baseRemedies.push(
        {
          id: '5',
          name: 'Prickly Pear Cactus',
          localName: 'Nopal',
          description: 'Desert cactus with medicinal pads and fruits',
          uses: ['Blood sugar control', 'Inflammation', 'Digestive health'],
          region: 'southwest',
          availability: 'Grows wild in desert regions, available in Mexican markets',
          culturalUse: 'Traditional Mexican and Native American medicine'
        }
      );
    }

    if (region.toLowerCase().includes('florida') || region.toLowerCase().includes('southeast')) {
      baseRemedies.push(
        {
          id: '6',
          name: 'Saw Palmetto',
          localName: 'Cabbage Palm',
          description: 'Native palm with berries used for health',
          uses: ['Prostate health', 'Hair loss', 'Urinary issues'],
          region: 'southeast',
          availability: 'Grows in Florida wetlands, available as supplements',
          culturalUse: 'Used by Seminole and other southeastern tribes'
        }
      );
    }

    return baseRemedies;
  };

  useEffect(() => {
    announceToScreenReader('Location services page loaded. Find local health resources and natural remedies in your area.');
    speak('Welcome to Location Services! I can help you find local health resources and discover natural remedies available in your region. Would you like me to detect your location automatically?');
    
    // Check for geolocation permission status
    if ('permissions' in navigator) {
      navigator.permissions.query({ name: 'geolocation' }).then((result) => {
        setLocationPermission(result.state as 'granted' | 'denied' | 'prompt');
        
        // Auto-detect location if permission is already granted
        if (result.state === 'granted') {
          detectLocation();
        }
      });
    }
  }, [announceToScreenReader, speak]);

  const detectLocation = async () => {
    setIsDetecting(true);
    announceToScreenReader('Detecting your location...');

    try {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            
            try {
              // Use reverse geocoding to get location details
              // For demo, we'll simulate this with a more realistic location
              const mockLocation: LocationData = {
                city: 'San Francisco',
                region: 'California',
                country: 'United States',
                latitude,
                longitude
              };
              
              setLocation(mockLocation);
              
              // Load regional resources and remedies
              const resources = getRegionalResources(mockLocation.region);
              const remedies = getRegionalRemedies(mockLocation.region);
              
              setHealthResources(resources);
              setNaturalRemedies(remedies);
              
              announceToScreenReader(`Location detected: ${mockLocation.city}, ${mockLocation.region}. Loading ${resources.length} local health resources and ${remedies.length} regional natural remedies.`);
              speak(`Location detected as ${mockLocation.city}, ${mockLocation.region}. I found ${resources.length} local health resources and ${remedies.length} natural remedies commonly used in your area.`);
              setLocationPermission('granted');
            } catch (geocodeError) {
              console.error('Geocoding error:', geocodeError);
              // Fallback with coordinates
              const fallbackLocation: LocationData = {
                city: 'Your Location',
                region: 'Local Area',
                country: 'Unknown',
                latitude,
                longitude
              };
              setLocation(fallbackLocation);
              setHealthResources(getRegionalResources('general'));
              setNaturalRemedies(getRegionalRemedies('general'));
            }
            
            setIsDetecting(false);
          },
          (error) => {
            console.error('Geolocation error:', error);
            setLocationPermission('denied');
            announceToScreenReader('Unable to detect location. Please enter your location manually or check location permissions.');
            speak('I was unable to detect your location automatically. You can enter your city or region manually, or check your browser location permissions.');
            setIsDetecting(false);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
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
      region: manualLocation.trim(),
      country: 'User Specified'
    };

    setLocation(locationData);
    
    // Load resources based on manual location
    const resources = getRegionalResources(locationData.region);
    const remedies = getRegionalRemedies(locationData.region);
    
    setHealthResources(resources);
    setNaturalRemedies(remedies);
    
    announceToScreenReader(`Location set to: ${locationData.city}. Loading ${resources.length} health resources and ${remedies.length} natural remedies.`);
    speak(`Location set to ${locationData.city}. I found ${resources.length} health resources and ${remedies.length} natural remedies for your area.`);
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
                To provide you with relevant local health resources and regional natural remedies, 
                I need to know your location. This helps me show you resources that are actually available in your area.
              </p>
              
              {locationPermission === 'denied' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Location access denied.</strong> To enable automatic location detection, 
                    please allow location access in your browser settings and refresh the page.
                  </p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  variant="primary"
                  onClick={detectLocation}
                  loading={isDetecting}
                  disabled={isDetecting || locationPermission === 'denied'}
                  className="sm:w-auto"
                >
                  <Navigation className="mr-2 h-4 w-4" />
                  {isDetecting ? 'Detecting Location...' : 'Auto-Detect My Location'}
                </Button>
                
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Or enter your city/region (e.g., 'San Francisco, CA')"
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
                <p className="text-gray-600">
                  Showing {healthResources.length} health resources and {naturalRemedies.length} regional natural remedies
                </p>
                {location.latitude && location.longitude && (
                  <p className="text-xs text-gray-500 mt-1">
                    Coordinates: {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
                  </p>
                )}
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setLocation(null);
                  setHealthResources([]);
                  setNaturalRemedies([]);
                }}
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
                Health Facilities ({healthResources.length})
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
                Regional Natural Remedies ({naturalRemedies.length})
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
                              {resource.distance && (
                                <p className="text-success-600 font-medium">
                                  📍 {resource.distance} away
                                </p>
                              )}
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
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Regional Natural Remedies</h2>
                  <p className="text-gray-600">
                    Natural remedies commonly found and used in {location.region}. 
                    These have been traditionally used by local communities and indigenous peoples.
                  </p>
                </div>
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
                              <h4 className="font-semibold text-gray-900 text-sm">Traditional Uses:</h4>
                              <ul className="text-sm text-gray-600 list-disc list-inside">
                                {remedy.uses.map((use, index) => (
                                  <li key={index}>{use}</li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h4 className="font-semibold text-gray-900 text-sm">Local Availability:</h4>
                              <p className="text-sm text-gray-600">{remedy.availability}</p>
                            </div>

                            {remedy.culturalUse && (
                              <div>
                                <h4 className="font-semibold text-gray-900 text-sm">Cultural Heritage:</h4>
                                <p className="text-sm text-gray-600">{remedy.culturalUse}</p>
                              </div>
                            )}
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
              <h3 className="text-lg font-bold text-error-800 mb-2">Emergency Information for {location.city}</h3>
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