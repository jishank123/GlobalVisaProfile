const encryption = require('./encryptionMiddleware');

/**
 * Deferred Encryption Mongoose Plugin
 * Allows disabling encryption during bulk operations and encrypting at the end
 */
function mongooseEncryptionPlugin(schema, options) {
  
  // Encrypt AFTER successful validation, just before saving
  schema.pre('save', function(next) {
    try {
      // Skip encryption if disabled globally or for this document
      if (global.ENCRYPTION_DISABLED || this._skipEncryption || this._isEncrypted) {
        return next();
      }
      
      // Only encrypt if validation has passed (no validation errors)
      if (this.$__.validationError) {
        return next();
      }
      
      // Quick encryption without logging
      const plainDoc = this.toObject();
      const encryptedDoc = encryption.encryptDocument(plainDoc);
      
      // Apply encrypted values
      Object.keys(encryptedDoc).forEach(key => {
        if (!encryption.shouldSkipField(key, encryptedDoc[key])) {
          this[key] = encryptedDoc[key];
        }
      });
      
      this._isEncrypted = true;
      next();
    } catch (error) {
      next(error);
    }
  });

  // Encrypt before updating
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    try {
      // Skip if encryption disabled
      if (global.ENCRYPTION_DISABLED) {
        return next();
      }
      
      const update = this.getUpdate();
      if (update && typeof update === 'object') {
        const encryptedUpdate = encryption.encryptDocument(update);
        this.setUpdate(encryptedUpdate);
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  // Decrypt after finding documents - optimized
  schema.post(['find', 'findOne'], function(docs, next) {
    try {
      if (!docs) return next();

      const decryptDoc = (doc) => {
        if (doc && typeof doc === 'object') {
          // Get the raw document data without transforms
          const rawDoc = doc._doc || doc;
          const decryptedDoc = encryption.decryptDocument(rawDoc);
          
          Object.keys(decryptedDoc).forEach(key => {
            // Only update fields that were actually decrypted (different from original)
            if (decryptedDoc[key] !== rawDoc[key]) {
              doc[key] = decryptedDoc[key];
            }
          });
        }
      };

      if (Array.isArray(docs)) {
        docs.forEach(decryptDoc);
      } else {
        decryptDoc(docs);
      }
      
      next();
    } catch (error) {
      next(error);
    }
  });

  // Decrypt after findOneAndUpdate
  schema.post('findOneAndUpdate', function(doc, next) {
    try {
      if (doc && typeof doc === 'object') {
        // Get the raw document data without transforms
        const rawDoc = doc._doc || doc;
        const decryptedDoc = encryption.decryptDocument(rawDoc);
        
        Object.keys(decryptedDoc).forEach(key => {
          // Only update fields that were actually decrypted (different from original)
          if (decryptedDoc[key] !== rawDoc[key]) {
            doc[key] = decryptedDoc[key];
          }
        });
      }
      next();
    } catch (error) {
      next(error);
    }
  });

  // Minimal transform for JSON serialization
  schema.set('toJSON', {
    transform: function(doc, ret, options) {
      try {
        return encryption.decryptDocument(ret);
      } catch (error) {
        return ret;
      }
    }
  });

  schema.set('toObject', {
    transform: function(doc, ret, options) {
      try {
        return encryption.decryptDocument(ret);
      } catch (error) {
        return ret;
      }
    }
  });
}

module.exports = mongooseEncryptionPlugin;