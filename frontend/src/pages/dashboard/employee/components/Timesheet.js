import { designSystem, componentStyles } from '../../../../styles/designSystem';

const Timesheet = () => {
  return (
    <div style={componentStyles.managementCard}>
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-clock fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>Timesheet</h4>
            <p style={componentStyles.headerSubtitle}>Track your work hours and attendance</p>
          </div>
        </div>
      </div>
      <div style={componentStyles.emptyState}>
        <i className="fas fa-clock fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
        <h6 style={{ color: designSystem.colors.gray[500] }}>Timesheet Coming Soon</h6>
      </div>
    </div>
  );
};

export default Timesheet;
