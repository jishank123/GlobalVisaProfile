import { designSystem, componentStyles } from '../../../../styles/designSystem';

const MyProjects = () => {
  return (
    <div style={componentStyles.managementCard}>
      <div style={componentStyles.header}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={componentStyles.headerIcon}>
            <i className="fas fa-project-diagram fa-lg"></i>
          </div>
          <div>
            <h4 style={componentStyles.headerTitle}>My Projects</h4>
            <p style={componentStyles.headerSubtitle}>View projects you are working on</p>
          </div>
        </div>
      </div>
      <div style={componentStyles.emptyState}>
        <i className="fas fa-project-diagram fa-4x" style={{ color: designSystem.colors.gray[400], marginBottom: designSystem.spacing.lg }}></i>
        <h6 style={{ color: designSystem.colors.gray[500] }}>My Projects Coming Soon</h6>
      </div>
    </div>
  );
};

export default MyProjects;
