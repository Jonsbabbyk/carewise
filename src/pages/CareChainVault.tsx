import React, { useState, useEffect } from 'react';
import { Shield, Coins, Wallet, CheckCircle, Hash, Award, Lock, Unlock, ArrowRight, Copy, ExternalLink } from 'lucide-react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { useVoice } from '../hooks/useVoice';
import { BlockchainService } from '../services/blockchainService';
import Button from '../components/UI/Button';
import Card from '../components/UI/Card';
import algosdk from 'algosdk';

interface HealthToken {
  id: string;
  name: string;
  symbol: string;
  balance: number;
  description: string;
  earnedFrom: string;
  color: string;
}

interface HealthRecord {
  id: string;
  hash: string;
  type: string;
  timestamp: Date;
  verified: boolean;
  txId?: string;
}

interface WalletInfo {
  address: string;
  balance: number;
  connected: boolean;
}

const CareChainVault: React.FC = () => {
  const [healthTokens, setHealthTokens] = useState<HealthToken[]>([]);
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [wallet, setWallet] = useState<WalletInfo>({
    address: '',
    balance: 0,
    connected: false
  });
  const [verificationHash, setVerificationHash] = useState('');
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const { announceToScreenReader } = useAccessibility();
  const { speak, resetSpeechCount } = useVoice();

  // Initialize demo tokens
  useEffect(() => {
    const demoTokens: HealthToken[] = [
      {
        id: 'care-1',
        name: 'CareWise Token',
        symbol: 'CARE-1',
        balance: 25,
        description: 'Earned from submitting health forms and assessments',
        earnedFrom: 'Health Form Submissions',
        color: 'primary'
      },
      {
        id: 'quiz-1',
        name: 'Quiz Master Token',
        symbol: 'QUIZ-1',
        balance: 15,
        description: 'Earned by completing health awareness quizzes',
        earnedFrom: 'Quiz Completions',
        color: 'success'
      },
      {
        id: 'well-1',
        name: 'Wellness Token',
        symbol: 'WELL-1',
        balance: 10,
        description: 'Earned by reading health awareness lessons',
        earnedFrom: 'Educational Content',
        color: 'secondary'
      },
      {
        id: 'rx-access',
        name: 'RX Access Token',
        symbol: 'RX-ACCESS',
        balance: 5,
        description: 'Used to unlock premium medicine information',
        earnedFrom: 'Premium Access',
        color: 'accent'
      }
    ];

    setHealthTokens(demoTokens);

    // Initialize demo wallet
    setWallet({
      address: 'DEMO7XKZJH4QZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQZQ',
      balance: 10.5, // Demo ALGO balance
      connected: true
    });

    // Initialize demo health records
    const demoRecords: HealthRecord[] = [
      {
        id: '1',
        hash: 'a1b2c3d4e5f6789012345678901234567890abcdef',
        type: 'Health Form Submission',
        timestamp: new Date(Date.now() - 86400000),
        verified: true,
        txId: 'DEMO_TXN_001'
      },
      {
        id: '2',
        hash: 'f6e5d4c3b2a1098765432109876543210fedcba09',
        type: 'Quiz Completion',
        timestamp: new Date(Date.now() - 172800000),
        verified: true,
        txId: 'DEMO_TXN_002'
      }
    ];

    setHealthRecords(demoRecords);

    announceToScreenReader('CareChain Vault loaded. Your blockchain-powered health identity and token management system.');
    resetSpeechCount();
    speak('Welcome to CareChain Vault! This is your blockchain-powered health identity system. Here you can manage your health tokens, verify records on the Algorand blockchain, and access premium services. Your health data is secured with cryptographic proof and you own your digital health identity.');
  }, [announceToScreenReader, speak, resetSpeechCount]);

  const generateHealthRecord = async () => {
    setIsProcessing(true);
    
    try {
      // Simulate health form data
      const healthData = {
        symptoms: 'Demo health assessment',
        timestamp: new Date().toISOString(),
        userId: 'demo-user'
      };

      // Generate hash and store on blockchain
      const hash = BlockchainService.createDataHash(healthData);
      const txId = await BlockchainService.storeSymptomReportHash(
        'demo-user',
        healthData.symptoms,
        'mild'
      );

      const newRecord: HealthRecord = {
        id: Date.now().toString(),
        hash,
        type: 'Health Assessment',
        timestamp: new Date(),
        verified: true,
        txId
      };

      setHealthRecords(prev => [newRecord, ...prev]);
      
      // Award CARE-1 tokens
      setHealthTokens(prev => prev.map(token => 
        token.symbol === 'CARE-1' 
          ? { ...token, balance: token.balance + 5 }
          : token
      ));

      announceToScreenReader('Health record generated and stored on blockchain. You earned 5 CARE-1 tokens!');
      speak('Success! Your health record has been securely stored on the Algorand blockchain and you earned 5 CARE-1 tokens for contributing to the health ecosystem.');
      
    } catch (error) {
      console.error('Error generating health record:', error);
      announceToScreenReader('Error generating health record. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const verifyRecord = async () => {
    if (!verificationHash.trim()) return;

    setIsProcessing(true);
    
    try {
      // Simulate blockchain verification
      const isValid = await BlockchainService.verifyHealthRecord(verificationHash, {});
      
      if (isValid) {
        setVerificationResult('✅ Record verified on Algorand blockchain! This health record is authentic and tamper-proof.');
        announceToScreenReader('Record verification successful. The health record is authentic.');
        speak('Verification successful! This health record is authentic and has been cryptographically verified on the Algorand blockchain.');
      } else {
        setVerificationResult('❌ Record not found or invalid. Please check the hash and try again.');
        announceToScreenReader('Record verification failed. Hash not found or invalid.');
        speak('Verification failed. This hash was not found on the blockchain or may be invalid.');
      }
    } catch (error) {
      setVerificationResult('⚠️ Verification error. Please try again later.');
      console.error('Verification error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const unlockPremiumService = (service: string, cost: number, tokenSymbol: string) => {
    const token = healthTokens.find(t => t.symbol === tokenSymbol);
    if (!token || token.balance < cost) {
      announceToScreenReader('Insufficient tokens for this service.');
      speak('You don\'t have enough tokens for this service. Complete more health activities to earn tokens.');
      return;
    }

    setSelectedService(service);
    setShowPaymentModal(true);
  };

  const processPayment = () => {
    if (!selectedService) return;

    // Simulate token spending
    const serviceCosts = {
      'Premium Medicine Info': { cost: 3, token: 'RX-ACCESS' },
      'Advanced Health Analysis': { cost: 10, token: 'CARE-1' },
      'Personalized Wellness Plan': { cost: 15, token: 'WELL-1' }
    };

    const serviceInfo = serviceCosts[selectedService as keyof typeof serviceCosts];
    if (!serviceInfo) return;

    setHealthTokens(prev => prev.map(token => 
      token.symbol === serviceInfo.token 
        ? { ...token, balance: token.balance - serviceInfo.cost }
        : token
    ));

    setShowPaymentModal(false);
    announceToScreenReader(`Payment successful! ${selectedService} unlocked.`);
    speak(`Payment successful! You've unlocked ${selectedService} using your health tokens. This demonstrates how blockchain technology can enable trustless payments for health services.`);
    setSelectedService('');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    announceToScreenReader('Copied to clipboard');
  };

  const premiumServices = [
    {
      name: 'Premium Medicine Info',
      description: 'Access detailed drug interactions and advanced medication guidance',
      cost: 3,
      token: 'RX-ACCESS',
      color: 'accent'
    },
    {
      name: 'Advanced Health Analysis',
      description: 'AI-powered comprehensive health assessment with personalized recommendations',
      cost: 10,
      token: 'CARE-1',
      color: 'primary'
    },
    {
      name: 'Personalized Wellness Plan',
      description: 'Custom wellness plan based on your health data and preferences',
      cost: 15,
      token: 'WELL-1',
      color: 'secondary'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" aria-hidden="true" />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">🔐 CareChain Vault</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Your blockchain-powered health identity system. Manage health tokens, verify records on Algorand, 
            and access premium services with cryptographic security and user ownership.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Wallet & Identity */}
          <div className="space-y-6">
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <Wallet className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Health Identity Wallet</h2>
              </div>
              
              <div className="space-y-4">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">Wallet Address:</span>
                    <button
                      onClick={() => copyToClipboard(wallet.address)}
                      className="text-blue-600 hover:text-blue-700"
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                    {wallet.address}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">ALGO Balance:</span>
                    <span className="text-lg font-bold text-blue-600">{wallet.balance} ALGO</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Algorand TestNet</p>
                </div>

                <div className="flex items-center space-x-2 text-sm text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Connected to Algorand TestNet</span>
                </div>
              </div>
            </Card>

            {/* Health Tokens */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Coins className="h-6 w-6 text-yellow-600" />
                <h2 className="text-xl font-bold text-gray-900">Health Tokens (ASA)</h2>
              </div>
              
              <div className="space-y-3">
                {healthTokens.map((token) => (
                  <div key={token.id} className={`bg-${token.color}-50 border border-${token.color}-200 rounded-lg p-4`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-8 h-8 bg-${token.color}-500 rounded-full flex items-center justify-center`}>
                          <span className="text-white text-xs font-bold">
                            {token.symbol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{token.symbol}</h3>
                          <p className="text-xs text-gray-600">{token.name}</p>
                        </div>
                      </div>
                      <span className={`text-lg font-bold text-${token.color}-600`}>
                        {token.balance}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">{token.description}</p>
                    <p className="text-xs text-gray-500 mt-1">Earned from: {token.earnedFrom}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Blockchain Operations */}
          <div className="space-y-6">
            {/* Record Generation */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Hash className="h-6 w-6 text-green-600" />
                <h2 className="text-xl font-bold text-gray-900">Generate Health Record</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Create a new health record and store its hash on the Algorand blockchain for verification.
              </p>
              
              <Button
                variant="success"
                onClick={generateHealthRecord}
                loading={isProcessing}
                fullWidth
                className="mb-4"
              >
                {isProcessing ? 'Storing on Blockchain...' : 'Generate & Store Record'}
              </Button>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Earn 5 CARE-1 tokens</strong> for each health record you contribute to the blockchain!
                </p>
              </div>
            </Card>

            {/* Record Verification */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-900">Verify Health Record</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Enter a record hash to verify its authenticity on the blockchain.
              </p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  value={verificationHash}
                  onChange={(e) => setVerificationHash(e.target.value)}
                  placeholder="Enter record hash (e.g., a1b2c3d4e5f6...)"
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500 focus:ring-opacity-20 font-mono text-sm"
                />
                
                <Button
                  variant="primary"
                  onClick={verifyRecord}
                  disabled={!verificationHash.trim()}
                  loading={isProcessing}
                  fullWidth
                >
                  Verify on Blockchain
                </Button>
                
                {verificationResult && (
                  <div className={`p-4 rounded-lg border ${
                    verificationResult.includes('✅') 
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : verificationResult.includes('❌')
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-yellow-50 border-yellow-200 text-yellow-800'
                  }`}>
                    <p className="text-sm">{verificationResult}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Health Records History */}
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Your Health Records</h2>
              </div>
              
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {healthRecords.map((record) => (
                  <div key={record.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">{record.type}</span>
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-xs">Verified</span>
                      </div>
                    </div>
                    <p className="text-xs font-mono text-gray-600 break-all mb-2">
                      Hash: {record.hash}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{record.timestamp.toLocaleDateString()}</span>
                      {record.txId && (
                        <button
                          onClick={() => copyToClipboard(record.txId!)}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <span>TX: {record.txId.substring(0, 8)}...</span>
                          <Copy className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Premium Services */}
          <div className="space-y-6">
            <Card>
              <div className="flex items-center space-x-3 mb-4">
                <Award className="h-6 w-6 text-orange-600" />
                <h2 className="text-xl font-bold text-gray-900">Premium Services</h2>
              </div>
              
              <p className="text-gray-600 mb-4">
                Use your health tokens to unlock premium features and services.
              </p>
              
              <div className="space-y-4">
                {premiumServices.map((service) => {
                  const userToken = healthTokens.find(t => t.symbol === service.token);
                  const canAfford = userToken && userToken.balance >= service.cost;
                  
                  return (
                    <div key={service.name} className={`border-2 rounded-lg p-4 ${
                      canAfford 
                        ? `border-${service.color}-200 bg-${service.color}-50` 
                        : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold text-gray-900">{service.name}</h3>
                        <div className="flex items-center space-x-1">
                          {canAfford ? (
                            <Unlock className="h-4 w-4 text-green-600" />
                          ) : (
                            <Lock className="h-4 w-4 text-gray-400" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{service.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          Cost: {service.cost} {service.token}
                        </span>
                        <Button
                          variant={canAfford ? service.color as any : 'outline'}
                          size="small"
                          onClick={() => unlockPremiumService(service.name, service.cost, service.token)}
                          disabled={!canAfford}
                        >
                          {canAfford ? 'Unlock' : 'Insufficient Tokens'}
                        </Button>
                      </div>
                      {userToken && (
                        
                        <p className="text-xs text-gray-500 mt-2">
                          Your balance: {userToken.balance} {service.token}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Blockchain Info */}
            <Card className="bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <ExternalLink className="h-6 w-6 text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Blockchain Technology</h2>
              </div>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Network:</span>
                  <span className="font-medium text-purple-600">Algorand TestNet</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Consensus:</span>
                  <span className="font-medium">Pure Proof of Stake</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Transaction Speed:</span>
                  <span className="font-medium">~4.5 seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Carbon Negative:</span>
                  <span className="font-medium text-green-600">✅ Eco-Friendly</span>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-white rounded-lg border border-purple-200">
                <p className="text-xs text-gray-700">
                  <strong>Why Algorand?</strong> Fast, secure, and environmentally sustainable blockchain 
                  perfect for healthcare applications requiring high throughput and low fees.
                </p>
              </div>
            </Card>

            {/* Token Earning Guide */}
            <Card className="bg-yellow-50 border-yellow-200">
              <h3 className="font-semibold text-yellow-800 mb-3">🪙 How to Earn Tokens</h3>
              <div className="space-y-2 text-sm text-yellow-700">
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>CARE-1:</strong> Submit health forms (+5 tokens)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>QUIZ-1:</strong> Complete health quizzes (+3 tokens)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>WELL-1:</strong> Read health lessons (+2 tokens)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                  <span><strong>RX-ACCESS:</strong> Earned through achievements</span>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Payment</h3>
              <p className="text-gray-600 mb-4">
                You are about to unlock <strong>{selectedService}</strong> using your health tokens.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-sm text-blue-800">
                  This demonstrates trustless payment using blockchain tokens. 
                  No intermediaries, instant settlement, and full transparency.
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  variant="primary"
                  onClick={processPayment}
                  fullWidth
                >
                  Confirm Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  fullWidth
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Footer Info */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <div className="text-center">
              <h3 className="text-lg font-bold text-gray-900 mb-2">🔐 Blockchain-Powered Health Ownership</h3>
              <p className="text-sm text-gray-700 mb-4">
                CareChain Vault demonstrates how blockchain technology can give users complete ownership 
                and control over their health data while enabling new economic models for healthcare.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <strong className="text-blue-600">Data Ownership:</strong> You control your health records with cryptographic keys
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <strong className="text-green-600">Incentive Alignment:</strong> Earn tokens for contributing valuable health data
                </div>
                <div className="bg-white p-3 rounded-lg border border-blue-200">
                  <strong className="text-purple-600">Trustless Payments:</strong> Access services without traditional payment intermediaries
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
};

export default CareChainVault;