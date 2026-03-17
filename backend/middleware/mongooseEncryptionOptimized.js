const encryption = require('./encryptionMiddleware');

/**
 * Highly Optimized Mongoose Plugin for Document Encryption
 * Minimal overhead, no excessive logging, fast encryption/decryption
 */
function mongooseEncryptionPlugin(schema, options) {
  // Encrypt AFTER successful validation, just before saving
  schema.pre('save', async function(next) {
    try {
      // Skip if already encrypted
      if (this._isEncrypted) {
        return next();
      }
      
      // Only encrypt if validation has passed (no validation errors)
      if (this.$__.validationError) {
        return next();
      }
      
      // Run validation first, then encrypt
      try {
        await this.validate();
        
        // Now encrypt after validation passes
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
      } catch (validationError) {
        next(validationError);
      }
    } catch (error) {
      next(error);
    }
  });

  // Encrypt before updating
  schema.pre(['updateOne', 'updateMany', 'findOneAndUpdate'], function(next) {
    try {
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
      if (doc && doc.toObject) {
        const plainDoc = doc.toObject();
        const decryptedDoc = encryption.decryptDocument(plainDoc);
        
        Object.keys(decryptedDoc).forEach(key => {
          // Only update fields that were actually decrypted (different from original)
          if (decryptedDoc[key] !== plainDoc[key]) {
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