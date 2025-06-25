import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import Header from './components/Layout/Header';
import Navigation from './components/Layout/Navigation';
import Home from './pages/Home';
import AskAI from './pages/AskAI';
import HealthForm from './pages/HealthForm';
import Awareness from './pages/Awareness';
import Settings from './pages/Settings';
import Game from './pages/Game';
import Location from './pages/Location';
import MentalHealth from './pages/MentalHealth';
import Medicine from './pages/Medicine';
import HealthQuest from './pages/HealthQuest';
import CareChainVault from './pages/CareChainVault';

function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <AccessibilityProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Header onMenuToggle={toggleMenu} isMenuOpen={isMenuOpen} />
          
          <div className="flex">
            <Navigation isOpen={isMenuOpen} onClose={closeMenu} />
            
            <div className="flex-1 min-h-screen">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/ask-ai" element={<AskAI />} />
                <Route path="/health-form" element={<HealthForm />} />
                <Route path="/awareness" element={<Awareness />} />
                <Route path="/location" element={<Location />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/mental-health" element={<MentalHealth />} />
                <Route path="/medicine" element={<Medicine />} />
                <Route path="/game" element={<Game />} />
                <Route path="/health-quest" element={<HealthQuest />} />
                <Route path="/carechain-vault" element={<CareChainVault />} />
              </Routes>
            </div>
          </div>
        </div>
      </Router>
    </AccessibilityProvider>
  );
}

export default App;