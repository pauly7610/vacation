// Client-side encryption service for protecting user data
export class EncryptionService {
  private static instance: EncryptionService;
  
  private constructor() {}
  
  static getInstance(): EncryptionService {
    if (!EncryptionService.instance) {
      EncryptionService.instance = new EncryptionService();
    }
    return EncryptionService.instance;
  }

  // Generate a cryptographically secure key from user's email + timestamp
  private async deriveKey(email: string, timestamp: number): Promise<CryptoKey> {
    const encoder = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw',
      encoder.encode(email + timestamp.toString()),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    return crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('wanderlist-salt-2024'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  }

  // Encrypt user data before storing
  async encryptData(data: any, email: string): Promise<{ encryptedData: string; timestamp: number }> {
    try {
      const timestamp = Date.now();
      const key = await this.deriveKey(email, timestamp);
      const encoder = new TextEncoder();
      const dataString = JSON.stringify(data);
      
      const iv = crypto.getRandomValues(new Uint8Array(12));
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        key,
        encoder.encode(dataString)
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedBuffer.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedBuffer), iv.length);

      return {
        encryptedData: this.arrayBufferToBase64(combined),
        timestamp
      };
    } catch (error) {
      console.error('Encryption failed:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  // Decrypt user data when retrieving
  async decryptData(encryptedData: string, email: string, timestamp: number): Promise<any> {
    try {
      const key = await this.deriveKey(email, timestamp);
      const combined = this.base64ToArrayBuffer(encryptedData);
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv },
        key,
        encrypted
      );

      const decoder = new TextDecoder();
      const dataString = decoder.decode(decryptedBuffer);
      return JSON.parse(dataString);
    } catch (error) {
      console.error('Decryption failed:', error);
      throw new Error('Failed to decrypt data - invalid code or corrupted data');
    }
  }

  // Utility functions for base64 conversion
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  }

  private base64ToArrayBuffer(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  // Generate secure random sync codes
  generateSecureCode(): string {
    const adjectives = [
      'GOLDEN', 'MYSTIC', 'AZURE', 'CORAL', 'EMERALD', 'CRIMSON', 'SILVER',
      'CRYSTAL', 'SUNSET', 'DAWN', 'OCEAN', 'MOUNTAIN', 'FOREST', 'DESERT'
    ];
    
    const destinations = [
      'TOKYO', 'PARIS', 'BALI', 'ICELAND', 'MOROCCO', 'PERU', 'GREECE',
      'NORWAY', 'THAILAND', 'EGYPT', 'BRAZIL', 'INDIA', 'JAPAN', 'ITALY'
    ];
    
    // Use crypto.getRandomValues for secure randomness
    const randomBytes = crypto.getRandomValues(new Uint32Array(3));
    const adjective = adjectives[randomBytes[0] % adjectives.length];
    const destination = destinations[randomBytes[1] % destinations.length];
    const number = (randomBytes[2] % 99) + 1;
    
    return `${adjective}-${destination}-${number}`;
  }

  // Hash email for privacy (one-way)
  async hashEmail(email: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(email.toLowerCase().trim());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.arrayBufferToBase64(hashBuffer).substring(0, 16); // First 16 chars for brevity
  }
}