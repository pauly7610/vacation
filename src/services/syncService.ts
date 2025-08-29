import { EncryptionService } from './encryptionService';

interface SyncData {
  savedDestinations: string[];
  rejectedDestinations: string[];
  filters: any;
  lastSync: number;
  deviceName: string;
}

interface SyncCode {
  code: string;
  emailHash: string; // Store hash instead of plain email
  expiresAt: number;
  encryptedData: string;
  timestamp: number;
}

export class SyncService {
  private static instance: SyncService;
  private syncCodes: Map<string, SyncCode> = new Map();
  private encryptionService: EncryptionService;
  
  private constructor() {
    this.encryptionService = EncryptionService.getInstance();
    // Load existing sync codes from localStorage
    this.loadSyncCodes();
    // Clean up expired codes on startup
    this.cleanupExpiredCodes();
  }
  
  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  // Create encrypted sync code
  async createSyncLink(email: string, userData: SyncData): Promise<string> {
    try {
      // Validate email format
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const code = this.encryptionService.generateSecureCode();
      const expiresAt = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
      
      // Encrypt user data
      const { encryptedData, timestamp } = await this.encryptionService.encryptData(userData, email);
      
      // Hash email for privacy
      const emailHash = await this.encryptionService.hashEmail(email);
      
      const syncCode: SyncCode = {
        code,
        emailHash,
        expiresAt,
        encryptedData,
        timestamp
      };
      
      this.syncCodes.set(code, syncCode);
      this.saveSyncCodes();
      
      // Log for development (remove in production)
      console.log(`🔐 Secure Sync Code Created: ${code} (expires in 24h)`);
      
      return code;
    } catch (error) {
      console.error('Failed to create sync link:', error);
      throw new Error('Failed to create sync link');
    }
  }

  // Apply sync code with decryption
  async applySyncCode(code: string, email: string): Promise<SyncData | null> {
    try {
      // Validate inputs
      if (!this.isValidEmail(email)) {
        throw new Error('Invalid email format');
      }

      const syncCode = this.syncCodes.get(code.toUpperCase());
      
      if (!syncCode) {
        throw new Error('Invalid sync code');
      }

      if (Date.now() > syncCode.expiresAt) {
        this.syncCodes.delete(code);
        this.saveSyncCodes();
        throw new Error('Sync code has expired');
      }

      // Verify email matches (compare hashes)
      const emailHash = await this.encryptionService.hashEmail(email);
      if (emailHash !== syncCode.emailHash) {
        throw new Error('Email does not match sync code');
      }

      // Decrypt data
      const decryptedData = await this.encryptionService.decryptData(
        syncCode.encryptedData, 
        email, 
        syncCode.timestamp
      );

      // Clean up used code (optional - you might want to keep it for multiple device sync)
      // this.syncCodes.delete(code);
      // this.saveSyncCodes();

      return {
        ...decryptedData,
        lastSync: Date.now(),
        deviceName: this.getDeviceName()
      };
    } catch (error) {
      console.error('Failed to apply sync code:', error);
      throw error; // Re-throw with original message
    }
  }

  // Email validation
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim().toLowerCase());
  }

  // Clean up expired codes
  private cleanupExpiredCodes(): void {
    const now = Date.now();
    let cleanedCount = 0;
    
    for (const [code, syncCode] of this.syncCodes.entries()) {
      if (now > syncCode.expiresAt) {
        this.syncCodes.delete(code);
        cleanedCount++;
      }
    }
    
    if (cleanedCount > 0) {
      this.saveSyncCodes();
      console.log(`🧹 Cleaned up ${cleanedCount} expired sync codes`);
    }
  }

  // Get device name for sync history
  private getDeviceName(): string {
    const userAgent = navigator.userAgent;
    if (userAgent.includes('iPhone')) return 'iPhone';
    if (userAgent.includes('iPad')) return 'iPad';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('Mac')) return 'Mac';
    if (userAgent.includes('Windows')) return 'Windows PC';
    return 'Unknown Device';
  }

  // Persist sync codes to localStorage
  private saveSyncCodes(): void {
    try {
      // Only store non-sensitive data in localStorage
      const codesArray = Array.from(this.syncCodes.entries()).map(([code, syncCode]) => [
        code,
        {
          emailHash: syncCode.emailHash, // Hash only, not plain email
          expiresAt: syncCode.expiresAt,
          encryptedData: syncCode.encryptedData, // Already encrypted
          timestamp: syncCode.timestamp
        }
      ]);
      localStorage.setItem('wanderlist-sync-codes', JSON.stringify(codesArray));
    } catch (error) {
      console.error('Error saving sync codes:', error);
    }
  }

  // Load sync codes from localStorage
  private loadSyncCodes(): void {
    try {
      const stored = localStorage.getItem('wanderlist-sync-codes');
      if (stored) {
        const codesArray = JSON.parse(stored);
        this.syncCodes = new Map(codesArray);
      }
    } catch (error) {
      console.error('Error loading sync codes:', error);
    }
  }

  // Check if URL has sync code
  checkForSyncCode(): string | null {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('sync');
  }

  // Clear URL after sync
  clearSyncFromURL(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('sync');
    window.history.replaceState({}, '', url.toString());
  }

  // Get sync statistics (for debugging/monitoring)
  getSyncStats(): { totalCodes: number; expiredCodes: number; activeCodes: number } {
    const now = Date.now();
    let expiredCount = 0;
    
    for (const syncCode of this.syncCodes.values()) {
      if (now > syncCode.expiresAt) {
        expiredCount++;
      }
    }
    
    return {
      totalCodes: this.syncCodes.size,
      expiredCodes: expiredCount,
      activeCodes: this.syncCodes.size - expiredCount
    };
  }

  // Clear all sync data (for privacy)
  clearAllSyncData(): void {
    this.syncCodes.clear();
    try {
      localStorage.removeItem('wanderlist-sync-codes');
      console.log('🧹 All sync data cleared for privacy');
    } catch (error) {
      console.error('Error clearing sync data:', error);
    }
  }
}