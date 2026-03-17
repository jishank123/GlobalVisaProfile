/**
 * Encryption Manager Utility
 * Manages deferred encryption for bulk operations
 */

class EncryptionManager {
  
  /**
   * Disable encryption temporarily for bulk operations
   */
  static disableEncryption() {
    global.ENCRYPTION_DISABLED = true;
    console.log('🔓 Encryption temporarily disabled for bulk operations');
  }
  
  /**
   * Re-enable encryption
   */
  static enableEncryption() {
    global.ENCRYPTION_DISABLED = false;
    console.log('🔐 Encryption re-enabled');
  }
  
  /**
   * Execute a function with encryption disabled, then re-enable
   * @param {Function} operation - The operation to execute without encryption
   * @returns {Promise} - Result of the operation
   */
  static async withoutEncryption(operation) {
    this.disableEncryption();
    try {
      const result = await operation();
      return result;
    } finally {
      this.enableEncryption();
    }
  }
  
  /**
   * Manually encrypt multiple documents after they've been saved
   * @param {Array} documents - Array of mongoose documents to encrypt
   */
  static async encryptDocuments(documents) {
    console.log(`🔐 Processing ${documents.length} documents for encryption...`);
    
    const encryption = require('../middleware/encryptionMiddleware');
    
    const promises = documents.map(async (doc, index) => {
      if (doc && doc._id) {
        try {
          // Only encrypt if the document hasn't been encrypted yet
          if (!doc._isEncrypted) {
            console.log(`🔐 Encrypting document ${index + 1} (${doc.constructor.modelName}): ${doc._id}...`);
            
            // Get the plain document data
            const plainDoc = doc.toObject();
            
            // Encrypt the document
            const encryptedDoc = encryption.encryptDocument(plainDoc);
            
            // Use direct database update to avoid validation on encrypted data
            const updateResult = await doc.constructor.updateOne(
              { _id: doc._id }, 
              { $set: encryptedDoc },
              { 
                validateBeforeSave: false,
                runValidators: false // Skip all validation
              }
            );
            
            console.log(`✅ Document ${doc._id} encrypted successfully`);
          } else {
            console.log(`⏭️ Document ${index + 1} (${doc._id}) already encrypted, skipping`);
          }
        } catch (error) {
          console.error(`❌ Failed to encrypt document ${index + 1} (${doc._id}):`, error.message);
        }
      } else {
        console.log(`⚠️ Document ${index + 1} is invalid (no _id):`, doc);
      }
    });
    
    await Promise.all(promises);
    console.log(`✅ ${documents.length} documents processed for encryption`);
  }
  
  /**
   * Bulk operation with deferred encryption (ASYNC - non-blocking)
   * @param {Function} bulkOperation - Function that performs multiple saves
   * @returns {Promise} - Result immediately, encryption happens in background
   */
  static async bulkOperationWithDeferredEncryption(bulkOperation) {
    console.log('🚀 Starting bulk operation with deferred encryption...');
    
    // Disable encryption during bulk operations
    this.disableEncryption();
    
    try {
      // Execute the bulk operation
      const result = await bulkOperation();
      
      // Re-enable encryption
      this.enableEncryption();
      
      // Extract documents that need encryption
      const documentsToEncrypt = [];
      
      if (result.documents && Array.isArray(result.documents)) {
        documentsToEncrypt.push(...result.documents);
      }
      
      // Encrypt all documents in the background (non-blocking)
      if (documentsToEncrypt.length > 0) {
        // Don't await - let it run in background
        this.encryptDocumentsAsync(documentsToEncrypt).catch(error => {
          console.error('❌ Background encryption failed:', error.message);
        });
        console.log(`📤 ${documentsToEncrypt.length} documents queued for background encryption`);
      }
      
      console.log('✅ Bulk operation completed (encryption running in background)');
      return result;
      
    } catch (error) {
      // Re-enable encryption even if operation fails
      this.enableEncryption();
      throw error;
    }
  }
  
  /**
   * Encrypt documents asynchronously in background
   * @param {Array} documents - Array of mongoose documents to encrypt
   */
  static async encryptDocumentsAsync(documents) {
    console.log(`🔐 [BACKGROUND] Processing ${documents.length} documents for encryption...`);
    
    const encryption = require('../middleware/encryptionMiddleware');
    
    // Process documents in batches to avoid overwhelming the system
    const BATCH_SIZE = 5;
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, i + BATCH_SIZE);
      
      await Promise.all(batch.map(async (doc, index) => {
        if (doc && doc._id) {
          try {
            // Only encrypt if the document hasn't been encrypted yet
            if (!doc._isEncrypted) {
              // Get the plain document data
              const plainDoc = doc.toObject();
              
              // Encrypt the document
              const encryptedDoc = encryption.encryptDocument(plainDoc);
              
              // Use direct database update to avoid validation on encrypted data
              await doc.constructor.updateOne(
                { _id: doc._id }, 
                { $set: encryptedDoc },
                { 
                  validateBeforeSave: false,
                  runValidators: false
                }
              );
              
              console.log(`✅ [BACKGROUND] Document ${doc._id} encrypted`);
            }
          } catch (error) {
            console.error(`❌ [BACKGROUND] Failed to encrypt document ${doc._id}:`, error.message);
          }
        }
      }));
      
      // Small delay between batches to avoid overwhelming the system
      if (i + BATCH_SIZE < documents.length) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }
    
    console.log(`✅ [BACKGROUND] ${documents.length} documents encrypted`);
  }
}

module.exports = EncryptionManager;