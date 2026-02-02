// Unified Design System for Admin Dashboard
export const designSystem = {
  colors: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    success: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    warning: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    danger: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',
    info: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
    light: '#f8fafc',
    dark: '#1e293b',
    white: '#ffffff',
    gray: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    green: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    }
  },
  shadows: {
    card: '0 10px 25px rgba(0,0,0,0.08), 0 4px 10px rgba(0,0,0,0.03)',
    button: '0 4px 15px rgba(102, 126, 234, 0.3)',
    modal: '0 25px 50px rgba(0, 0, 0, 0.25)',
    hover: '0 15px 35px rgba(0,0,0,0.12), 0 6px 15px rgba(0,0,0,0.05)'
  },
  borderRadius: {
    card: '16px',
    button: '12px',
    modal: '20px',
    input: '12px',
    small: '8px',
    md: '12px',
    lg: '16px',
    sm: '8px'
  },
  spacing: {
    xs: '8px',
    sm: '12px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  typography: {
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '12px',
      sm: '14px',
      base: '16px',
      lg: '18px',
      xl: '20px',
      '2xl': '24px',
      '3xl': '30px',
      '4xl': '36px'
    },
    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700'
    }
  }
};

// Unified Component Styles
export const componentStyles = {
  // Management Card Container
  managementCard: {
    background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
    borderRadius: designSystem.borderRadius.card,
    padding: designSystem.spacing.xl,
    boxShadow: designSystem.shadows.card,
    border: '1px solid rgba(226, 232, 240, 0.8)',
    marginBottom: designSystem.spacing.lg,
    fontFamily: designSystem.typography.fontFamily
  },

  // Header Section
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: designSystem.spacing.lg
  },

  headerIcon: {
    background: designSystem.colors.primary,
    borderRadius: designSystem.borderRadius.button,
    padding: designSystem.spacing.sm,
    color: 'white',
    marginRight: designSystem.spacing.md
  },

  headerTitle: {
    color: designSystem.colors.dark,
    fontWeight: designSystem.typography.fontWeight.semibold,
    fontSize: designSystem.typography.fontSize['2xl'],
    marginBottom: '4px'
  },

  headerSubtitle: {
    color: designSystem.colors.gray[500],
    fontSize: designSystem.typography.fontSize.sm,
    margin: 0
  },

  // Stats Cards
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: designSystem.spacing.md,
    marginBottom: designSystem.spacing.lg
  },

  // Stats Cards (ContactsManagement style)
  contactsStatCard: {
    border: '1px solid',
    borderRadius: designSystem.borderRadius.button,
    padding: designSystem.spacing.lg,
    textAlign: 'center',
    background: 'white',
    transition: 'all 0.3s ease'
  },

  // Buttons
  primaryButton: {
    background: designSystem.colors.primary,
    border: 'none',
    borderRadius: designSystem.borderRadius.button,
    color: 'white',
    fontWeight: designSystem.typography.fontWeight.medium,
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    boxShadow: designSystem.shadows.button,
    transition: 'all 0.3s ease',
    fontSize: designSystem.typography.fontSize.base
  },

  secondaryButton: {
    background: designSystem.colors.gray[100],
    border: 'none',
    borderRadius: designSystem.borderRadius.button,
    color: designSystem.colors.gray[600],
    fontWeight: designSystem.typography.fontWeight.medium,
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.lg}`,
    transition: 'all 0.3s ease',
    fontSize: designSystem.typography.fontSize.base
  },

  // Table Styles
  table: {
    borderRadius: designSystem.borderRadius.button,
    overflow: 'hidden',
    boxShadow: designSystem.shadows.card
  },

  tableHeader: {
    background: designSystem.colors.primary,
    color: 'white'
  },

  tableHeaderCell: {
    border: 'none',
    padding: designSystem.spacing.md,
    fontWeight: designSystem.typography.fontWeight.semibold,
    fontSize: designSystem.typography.fontSize.sm
  },

  tableCell: {
    padding: designSystem.spacing.md,
    border: 'none',
    borderBottom: `1px solid ${designSystem.colors.gray[100]}`,
    fontSize: designSystem.typography.fontSize.sm
  },

  tableRow: {
    transition: 'all 0.2s ease'
  },

  // Modal Styles
  modal: {
    display: 'block',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    backdropFilter: 'blur(8px)'
  },

  modalContent: {
    border: 'none',
    borderRadius: designSystem.borderRadius.modal,
    boxShadow: designSystem.shadows.modal,
    overflow: 'hidden'
  },

  modalHeader: {
    background: designSystem.colors.primary,
    color: 'white',
    padding: `${designSystem.spacing.lg} ${designSystem.spacing.xl} ${designSystem.spacing.md}`,
    border: 'none'
  },

  modalBody: {
    padding: designSystem.spacing.xl
  },

  modalFooter: {
    padding: `${designSystem.spacing.md} ${designSystem.spacing.xl} ${designSystem.spacing.xl}`,
    background: designSystem.colors.light,
    border: 'none'
  },

  // Form Styles
  formInput: {
    borderRadius: designSystem.borderRadius.input,
    border: `2px solid ${designSystem.colors.gray[200]}`,
    fontSize: designSystem.typography.fontSize.base,
    padding: `${designSystem.spacing.sm} ${designSystem.spacing.md}`,
    transition: 'all 0.3s ease'
  },

  // Badge Styles
  badge: {
    borderRadius: designSystem.borderRadius.small,
    padding: `${designSystem.spacing.xs} ${designSystem.spacing.sm}`,
    fontSize: designSystem.typography.fontSize.xs,
    fontWeight: designSystem.typography.fontWeight.medium
  },

  // Loading State
  loading: {
    textAlign: 'center',
    padding: `${designSystem.spacing.xxl} 0`,
    color: designSystem.colors.gray[500]
  },

  // Empty State
  emptyState: {
    textAlign: 'center',
    padding: `${designSystem.spacing.xxl} 0`,
    color: designSystem.colors.gray[500]
  }
};

// Status Badge Classes
export const statusBadges = {
  // Lead statuses
  new: { background: designSystem.colors.primary, color: 'white' },
  contacted: { background: designSystem.colors.info, color: 'white' },
  qualified: { background: designSystem.colors.success, color: 'white' },
  negotiation: { background: designSystem.colors.warning, color: 'white' },
  converted: { background: designSystem.colors.success, color: 'white' },
  lost: { background: designSystem.colors.danger, color: 'white' },
  
  // Project statuses
  pending: { background: designSystem.colors.warning, color: 'white' },
  in_progress: { background: designSystem.colors.primary, color: 'white' },
  on_hold: { background: designSystem.colors.gray[400], color: 'white' },
  completed: { background: designSystem.colors.success, color: 'white' },
  cancelled: { background: designSystem.colors.danger, color: 'white' },
  
  // Payment statuses
  payment_pending: { background: designSystem.colors.warning, color: 'white' },
  payment_completed: { background: designSystem.colors.success, color: 'white' },
  failed: { background: designSystem.colors.danger, color: 'white' },
  
  // Verification statuses
  verified: { background: designSystem.colors.success, color: 'white' },
  rejected: { background: designSystem.colors.danger, color: 'white' },
  
  // User statuses
  active: { background: designSystem.colors.success, color: 'white' },
  inactive: { background: designSystem.colors.warning, color: 'white' },
  suspended: { background: designSystem.colors.danger, color: 'white' },
  deleted: { background: designSystem.colors.gray[600], color: 'white' }
};

// Priority Classes
export const priorityClasses = {
  low: { color: designSystem.colors.success.split(' ')[0].split('(')[1] },
  medium: { color: designSystem.colors.warning.split(' ')[0].split('(')[1] },
  high: { color: designSystem.colors.danger.split(' ')[0].split('(')[1] },
  urgent: { color: designSystem.colors.danger.split(' ')[0].split('(')[1] }
};

// Utility Functions
export const getStatusBadgeStyle = (status) => {
  return statusBadges[status] || { background: designSystem.colors.gray[400], color: 'white' };
};

export const getPriorityStyle = (priority) => {
  return priorityClasses[priority] || { color: designSystem.colors.gray[500] };
};

// Hover Effects
export const hoverEffects = {
  card: {
    onMouseEnter: (e) => {
      e.currentTarget.style.boxShadow = designSystem.shadows.hover;
      e.currentTarget.style.transform = 'translateY(-2px)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.boxShadow = designSystem.shadows.card;
      e.currentTarget.style.transform = 'translateY(0)';
    }
  },
  
  button: {
    onMouseEnter: (e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = designSystem.shadows.button;
    }
  },
  
  tableRow: {
    onMouseEnter: (e) => {
      e.currentTarget.style.backgroundColor = designSystem.colors.gray[50];
    },
    onMouseLeave: (e) => {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  }
};