const crypto = require('crypto');
const mongoose = require('mongoose');

class DocumentEncryption {
  constructor() {
    this.algorithm = 'aes-256-cbc';
    this.secretKey = process.env.ENCRYPTION_SECRET;
    
    if (!this.secretKey) {
      console.warn('⚠️  ENCRYPTION_SECRET not found in environment variables');
      this.secretKey = 'default-key-for-development-only-change-in-production';
    }
    
    // Create 32-byte key for AES-256
    this.key = crypto.createHash('sha256').update(this.secretKey).digest();
  }

  encrypt(text) {
    if (!text || (typeof text !== 'string' && typeof text !== 'number')) return text;
    
    try {
      // Convert numbers to strings for encryption
      const textToEncrypt = typeof text === 'number' ? text.toString() : text;
      if (textToEncrypt.trim() === '') return text;
      
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
      
      let encrypted = cipher.update(textToEncrypt, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      return `${iv.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      return text; // Return original if encryption fails
    }
  }

  decrypt(encryptedText) {
    if (!encryptedText || typeof encryptedText !== 'string') return encryptedText;
    if (!encryptedText.includes(':')) return encryptedText; // Not encrypted format
    
    try {
      const parts = encryptedText.split(':');
      if (parts.length !== 2) return encryptedText; // Invalid format
      
      const ivHex = parts[0];
      const encrypted = parts[1];
      
      // Validate IV length (should be 32 hex characters = 16 bytes)
      if (ivHex.length !== 32) {
        // Silently return the original text if IV is invalid (likely corrupted data)
        return encryptedText;
      }
      
      const iv = Buffer.from(ivHex, 'hex');
      
      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Try to convert back to number if it was originally a number
      const asNumber = parseFloat(decrypted);
      if (!isNaN(asNumber) && isFinite(asNumber) && asNumber.toString() === decrypted) {
        return asNumber;
      }
      
      return decrypted;
    } catch (error) {
      // Silently return encrypted text if decryption fails
      // This handles cases where text looks like encrypted format but isn't
      return encryptedText;
    }
  }

  shouldSkipField(key, value) {
    // Skip ObjectIds, system fields, non-sensitive numbers, booleans, dates
    const sensitiveAmountFields = [
      'amount', 'paid_amount', 'outstanding_amount', 'total_amount',
      'salary', 'income', 'balance', 'payment_amount', 'invoice_amount',
      'fee', 'cost', 'price', 'value', 'worth', 'revenue'
    ];
    
    // If it's a number and it's a sensitive amount field, DON'T skip (encrypt it)
    if (typeof value === 'number' && sensitiveAmountFields.includes(key)) {
      return false; // Don't skip - encrypt this number
    }
    
    // Skip ObjectIds, system fields, non-sensitive numbers, booleans, dates
    return (
      key === '_id' ||
      key === '__v' ||
      key === 'password' ||
      key === 'role' ||  // NEVER encrypt role field
      key === 'status' ||  // NEVER encrypt status field
      key.endsWith('_id') ||
      key === 'createdAt' ||
      key === 'updatedAt' ||
      key === 'deleted_at' ||
      key === 'deleted_by' ||
      key === 'iat' ||
      key === 'exp' ||
      key === 'progress' ||
      key === 'age' ||
      key === 'count' ||
      key === 'quantity' ||
      key === 'priority' ||
      key === 'is_temp_password' ||  // NEVER encrypt boolean flags
      key === 'email_verified' ||
      key === 'terms_accepted' ||
      mongoose.Types.ObjectId.isValid(value) ||
      typeof value === 'boolean' ||
      (typeof value === 'number' && !sensitiveAmountFields.includes(key)) ||
      value instanceof Date ||
      value instanceof mongoose.Types.ObjectId ||
      (typeof value === 'string' && mongoose.Types.ObjectId.isValid(value))
    );
  }

  encryptDocument(doc) {
    if (!doc || typeof doc !== 'object') return doc;
    
    const encrypted = {};
    
    for (const [key, value] of Object.entries(doc)) {
      if (this.shouldSkipField(key, value)) {
        encrypted[key] = value; // Keep as is
      } else if (typeof value === 'string' || typeof value === 'number') {
        encrypted[key] = this.encrypt(value);
      } else if (Array.isArray(value)) {
        encrypted[key] = value.map(item => 
          typeof item === 'string' && !this.shouldSkipField(key, item) 
            ? this.encrypt(item) 
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        encrypted[key] = this.encryptDocument(value); // Recursive for nested objects
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }

  decryptDocument(doc) {
    if (!doc || typeof doc !== 'object') return doc;
    
    const decrypted = {};
    
    for (const [key, value] of Object.entries(doc)) {
      if (this.shouldSkipField(key, value)) {
        decrypted[key] = value; // Keep as is
      } else if (typeof value === 'string' || typeof value === 'number') {
        decrypted[key] = this.decrypt(value);
      } else if (Array.isArray(value)) {
        decrypted[key] = value.map(item => 
          typeof item === 'string' && !this.shouldSkipField(key, item)
            ? this.decrypt(item) 
            : item
        );
      } else if (typeof value === 'object' && value !== null) {
        decrypted[key] = this.decryptDocument(value); // Recursive for nested objects
      } else {
        decrypted[key] = value;
      }
    }
    
    return decrypted;
  }
}

module.exports = new DocumentEncryption();