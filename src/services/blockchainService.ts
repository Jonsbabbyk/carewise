import algosdk from 'algosdk';
import CryptoJS from 'crypto-js';

interface HealthRecord {
  id: string;
  userId: string;
  type: 'diagnosis' | 'prescription' | 'symptom_report' | 'quiz_completion' | 'health_contribution';
  dataHash: string;
  timestamp: number;
  metadata?: {
    category?: string;
    severity?: string;
    score?: number;
  };
}

export class BlockchainService {
  private static algodClient: algosdk.Algodv2;
  private static isInitialized = false;

  // Initialize Algorand client
  static async initialize() {
    if (this.isInitialized) return;

    try {
      // Use Algorand TestNet for development
      const algodToken = import.meta.env.VITE_ALGORAND_TOKEN || '';
      const algodServer = import.meta.env.VITE_ALGORAND_SERVER || 'https://testnet-api.algonode.cloud';
      const algodPort = import.meta.env.VITE_ALGORAND_PORT || '';

      this.algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);
      
      // Test connection
      await this.algodClient.status().do();
      this.isInitialized = true;
      console.log('Algorand blockchain service initialized successfully');
    } catch (error) {
      console.warn('Algorand blockchain service initialization failed, using mock mode:', error);
      this.isInitialized = false;
    }
  }

  // Create a secure hash of health data
  static createDataHash(data: any): string {
    const dataString = JSON.stringify(data);
    return CryptoJS.SHA256(dataString).toString();
  }

  // Store health record on blockchain
  static async storeHealthRecord(record: Omit<HealthRecord, 'id' | 'timestamp'>): Promise<string> {
    await this.initialize();

    const healthRecord: HealthRecord = {
      ...record,
      id: this.generateRecordId(),
      timestamp: Date.now(),
    };

    if (!this.isInitialized) {
      // Mock blockchain storage for development
      return this.mockStoreRecord(healthRecord);
    }

    try {
      // Create application call transaction for storing health data
      const params = await this.algodClient.getTransactionParams().do();
      
      // For demo purposes, we'll store the hash in transaction notes
      const note = new Uint8Array(Buffer.from(JSON.stringify({
        type: 'health_record',
        dataHash: healthRecord.dataHash,
        recordType: healthRecord.type,
        metadata: healthRecord.metadata
      })));

      // Create a minimal transaction to store the hash
      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        from: this.getDemoAddress(),
        to: this.getDemoAddress(),
        amount: 0, // Zero amount transaction for data storage
        note: note,
        suggestedParams: params,
      });

      // In a real implementation, this would be signed and submitted
      // For demo, we'll return a mock transaction ID
      return `mock_txn_${healthRecord.id}`;
    } catch (error) {
      console.error('Blockchain storage error:', error);
      return this.mockStoreRecord(healthRecord);
    }
  }

  // Verify health record integrity
  static async verifyHealthRecord(recordId: string, originalData: any): Promise<boolean> {
    await this.initialize();

    const expectedHash = this.createDataHash(originalData);
    
    if (!this.isInitialized) {
      // Mock verification
      return this.mockVerifyRecord(recordId, expectedHash);
    }

    try {
      // In a real implementation, retrieve the transaction and verify the hash
      // For demo purposes, we'll simulate verification
      return true;
    } catch (error) {
      console.error('Blockchain verification error:', error);
      return false;
    }
  }

  // Store diagnosis hash for verification
  static async storeDiagnosisHash(userId: string, diagnosis: string, symptoms: string[]): Promise<string> {
    const diagnosisData = {
      diagnosis,
      symptoms,
      userId,
      timestamp: Date.now()
    };

    const dataHash = this.createDataHash(diagnosisData);
    
    return await this.storeHealthRecord({
      userId,
      type: 'diagnosis',
      dataHash,
      metadata: {
        category: 'ai_diagnosis'
      }
    });
  }

  // Store prescription hash
  static async storePrescriptionHash(userId: string, prescription: string, medications: string[]): Promise<string> {
    const prescriptionData = {
      prescription,
      medications,
      userId,
      timestamp: Date.now()
    };

    const dataHash = this.createDataHash(prescriptionData);
    
    return await this.storeHealthRecord({
      userId,
      type: 'prescription',
      dataHash,
      metadata: {
        category: 'digital_prescription'
      }
    });
  }

  // Store symptom report hash
  static async storeSymptomReportHash(userId: string, symptoms: string, severity: string): Promise<string> {
    const symptomData = {
      symptoms,
      severity,
      userId,
      timestamp: Date.now()
    };

    const dataHash = this.createDataHash(symptomData);
    
    return await this.storeHealthRecord({
      userId,
      type: 'symptom_report',
      dataHash,
      metadata: {
        severity,
        category: 'symptom_tracking'
      }
    });
  }

  // Store quiz completion hash
  static async storeQuizCompletionHash(userId: string, quizType: string, score: number, answers: any[]): Promise<string> {
    const quizData = {
      quizType,
      score,
      answers,
      userId,
      timestamp: Date.now()
    };

    const dataHash = this.createDataHash(quizData);
    
    return await this.storeHealthRecord({
      userId,
      type: 'quiz_completion',
      dataHash,
      metadata: {
        category: quizType,
        score
      }
    });
  }

  // Store health contribution hash (for public health data)
  static async storeHealthContributionHash(userId: string, contributionType: string, data: any): Promise<string> {
    const contributionData = {
      contributionType,
      data,
      userId: CryptoJS.SHA256(userId).toString(), // Anonymized user ID
      timestamp: Date.now()
    };

    const dataHash = this.createDataHash(contributionData);
    
    return await this.storeHealthRecord({
      userId: 'anonymous',
      type: 'health_contribution',
      dataHash,
      metadata: {
        category: contributionType
      }
    });
  }

  // Get user's health records (hashes only for privacy)
  static async getUserHealthRecords(userId: string): Promise<HealthRecord[]> {
    // In a real implementation, this would query the blockchain
    // For demo, return mock data
    return [
      {
        id: 'record_1',
        userId,
        type: 'symptom_report',
        dataHash: 'hash_123',
        timestamp: Date.now() - 86400000,
        metadata: { severity: 'mild', category: 'symptom_tracking' }
      }
    ];
  }

  // Private helper methods
  private static generateRecordId(): string {
    return `health_record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private static getDemoAddress(): string {
    // Demo address for testing
    return 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
  }

  private static mockStoreRecord(record: HealthRecord): string {
    console.log('Mock blockchain storage:', record);
    localStorage.setItem(`blockchain_record_${record.id}`, JSON.stringify(record));
    return `mock_txn_${record.id}`;
  }

  private static mockVerifyRecord(recordId: string, expectedHash: string): boolean {
    const stored = localStorage.getItem(`blockchain_record_${recordId.replace('mock_txn_', '')}`);
    if (!stored) return false;
    
    const record = JSON.parse(stored);
    return record.dataHash === expectedHash;
  }
}