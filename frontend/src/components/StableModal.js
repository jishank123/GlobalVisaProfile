import React, { useEffect, useRef } from 'react';
import { designSystem, componentStyles } from '../styles/designSystem';

const StableModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'lg',
  showCloseButton = true,
  footer = null,
  className = '',
  backdrop = true,
  keyboard = true
}) => {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
      
      // Focus management
      if (modalRef.current) {
        modalRef.current.focus();
      }
    } else {
      // Restore body scroll when modal is closed
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleBackdropClick = (e) => {
    if (backdrop && e.target === backdropRef.current) {
      onClose();
    }
  };

  const handleKeyDown = (e) => {
    if (keyboard && e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: { maxWidth: '400px' },
    md: { maxWidth: '600px' },
    lg: { maxWidth: '800px' },
    xl: { maxWidth: '1000px' },
    full: { maxWidth: '95vw' }
  };

  return (
    <div
      ref={backdropRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1050,
        padding: '20px',
        overflowY: 'auto'
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        ref={modalRef}
        className={className}
        style={{
          backgroundColor: 'white',
          borderRadius: designSystem.borderRadius.lg,
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          width: '100%',
          ...sizeClasses[size],
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          outline: 'none'
        }}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            style={{
              ...componentStyles.modalHeader,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: `1px solid ${designSystem.colors.gray[200]}`,
              borderRadius: `${designSystem.borderRadius.lg} ${designSystem.borderRadius.lg} 0 0`
            }}
          >
            {title && (
              <h5 style={{
                margin: 0,
                fontSize: designSystem.typography.fontSize.lg,
                fontWeight: designSystem.typography.fontWeight.semibold,
                color: designSystem.colors.dark
              }}>
                {title}
              </h5>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: designSystem.colors.gray[500],
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: designSystem.borderRadius.sm,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.color = designSystem.colors.gray[700];
                  e.target.style.backgroundColor = designSystem.colors.gray[100];
                }}
                onMouseLeave={(e) => {
                  e.target.style.color = designSystem.colors.gray[500];
                  e.target.style.backgroundColor = 'transparent';
                }}
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div
          style={{
            padding: '24px',
            flex: 1,
            overflowY: 'auto',
            maxHeight: 'calc(90vh - 140px)' // Account for header and footer
          }}
        >
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            style={{
              padding: '16px 24px',
              borderTop: `1px solid ${designSystem.colors.gray[200]}`,
              borderRadius: `0 0 ${designSystem.borderRadius.lg} ${designSystem.borderRadius.lg}`,
              display: 'flex',
              justifyContent: 'flex-end',
              gap: designSystem.spacing.sm,
              backgroundColor: designSystem.colors.gray[50]
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default StableModal;