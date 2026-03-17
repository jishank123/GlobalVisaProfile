import React from 'react';
import { designSystem, componentStyles } from '../../../../styles/designSystem';

const ServiceModal = ({ 
  show, 
  onHide, 
  type, 
  data, 
  formData, 
  formErrors, 
  onInputChange, 
  onAddService, 
  onEditService, 
  onDeleteService,
  formatPrice 
}) => {
  if (!show) return null;

  const getModalConfig = () => {
    switch (type) {
      case 'view':
        return {
          title: 'Service Details',
          icon: 'fas fa-eye',
          color: designSystem.colors.primary,
          content: (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: designSystem.spacing.md }}>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Service Name</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data?.name}</div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Category</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data?.category || 'Other'}</div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Pricing Type</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {(data?.pricing_type || data?.pricing?.type || 'fixed').charAt(0).toUpperCase() + (data?.pricing_type || data?.pricing?.type || 'fixed').slice(1)}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Price Range</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {formatPrice(data?.min_price || data?.pricing?.minPrice, data?.max_price || data?.pricing?.maxPrice, data?.pricing_type || data?.pricing?.type)}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Duration</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>{data?.duration || 'Not specified'}</div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Status</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  <span style={{
                    background: data?.isActive !== false ? '#28a745' : '#ffc107',
                    color: data?.isActive !== false ? 'white' : '#000',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {data?.isActive !== false ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Description</label>
                <div style={{ 
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  background: designSystem.colors.gray[50],
                  padding: designSystem.spacing.sm,
                  borderRadius: '4px',
                  minHeight: '60px'
                }}>
                  {data?.description || 'No description available'}
                </div>
              </div>
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Features</label>
                <div style={{ 
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  background: designSystem.colors.gray[50],
                  padding: designSystem.spacing.sm,
                  borderRadius: '4px',
                  minHeight: '60px'
                }}>
                  {Array.isArray(data?.features) ? (
                    <ul style={{ margin: 0, paddingLeft: '20px' }}>
                      {data.features.map((feature, index) => (
                        <li key={index}>{feature}</li>
                      ))}
                    </ul>
                  ) : (
                    data?.features || 'No features listed'
                  )}
                </div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Service ID</label>
                <div style={{ 
                  fontWeight: designSystem.typography.fontWeight.semibold,
                  fontFamily: 'monospace',
                  fontSize: designSystem.typography.fontSize.sm
                }}>{data?._id}</div>
              </div>
              <div>
                <label style={{ 
                  display: 'block',
                  fontSize: designSystem.typography.fontSize.sm,
                  color: designSystem.colors.gray[500],
                  marginBottom: designSystem.spacing.xs
                }}>Created</label>
                <div style={{ fontWeight: designSystem.typography.fontWeight.semibold }}>
                  {data?.createdAt ? new Date(data.createdAt).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          )
        };
      case 'add':
      case 'edit':
        return {
          title: type === 'add' ? 'Add New Service' : 'Edit Service',
          icon: type === 'add' ? 'fas fa-plus' : 'fas fa-edit',
          color: type === 'add' ? designSystem.colors.primary : designSystem.colors.warning,
          content: (
            <div style={{ padding: designSystem.spacing.md }}>
              <div style={{ marginBottom: designSystem.spacing.lg }}>
                <h6 style={{ 
                  color: designSystem.colors.primary, 
                  marginBottom: designSystem.spacing.sm,
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: designSystem.typography.fontSize.lg,
                  fontWeight: designSystem.typography.fontWeight.bold
                }}>
                  <i className="fas fa-info-circle me-2"></i>Service Information
                </h6>
                <p style={{ 
                  fontSize: designSystem.typography.fontSize.sm, 
                  color: designSystem.colors.gray[600],
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {type === 'add' ? 'Create a new service with pricing and details.' : 'Update service information and settings.'}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: designSystem.spacing.lg, marginBottom: designSystem.spacing.lg }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[700],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold
                  }}>
                    Service Name <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="text" 
                    name="name"
                    value={formData.name}
                    onChange={onInputChange}
                    placeholder="Enter service name"
                    style={{
                      ...componentStyles.formInput,
                      borderColor: formErrors.name ? '#dc3545' : componentStyles.formInput.borderColor,
                      width: '100%'
                    }}
                    required 
                  />
                  {formErrors.name && (
                    <small style={{ 
                      color: '#dc3545', 
                      fontSize: designSystem.typography.fontSize.xs,
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      {formErrors.name}
                    </small>
                  )}
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[700],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold
                  }}>
                    Category <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <select 
                    name="category"
                    value={formData.category}
                    onChange={onInputChange}
                    style={{
                      ...componentStyles.formInput,
                      borderColor: formErrors.category ? '#dc3545' : componentStyles.formInput.borderColor,
                      width: '100%'
                    }}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="Research">Research</option>
                    <option value="Writing">Writing</option>
                    <option value="Editing">Editing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Other">Other</option>
                  </select>
                  {formErrors.category && (
                    <small style={{ 
                      color: '#dc3545', 
                      fontSize: designSystem.typography.fontSize.xs,
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      {formErrors.category}
                    </small>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: designSystem.spacing.lg }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: designSystem.spacing.xs,
                  color: designSystem.colors.gray[700],
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.semibold
                }}>
                  Description <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={onInputChange}
                  placeholder="Enter service description"
                  rows="3"
                  style={{
                    ...componentStyles.formInput,
                    borderColor: formErrors.description ? '#dc3545' : componentStyles.formInput.borderColor,
                    resize: 'vertical',
                    width: '100%'
                  }}
                  required
                />
                {formErrors.description && (
                  <small style={{ 
                    color: '#dc3545', 
                    fontSize: designSystem.typography.fontSize.xs,
                    display: 'block',
                    marginTop: '4px'
                  }}>
                    {formErrors.description}
                  </small>
                )}
              </div>

              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: formData.pricing_type === 'fixed' ? '1fr 1fr' : '1fr 1fr 1fr', 
                gap: designSystem.spacing.lg, 
                marginBottom: designSystem.spacing.lg,
                padding: designSystem.spacing.md,
                background: designSystem.colors.gray[50],
                borderRadius: designSystem.borderRadius.button,
                border: `1px solid ${designSystem.colors.gray[200]}`
              }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[700],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold
                  }}>
                    Pricing Type <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <select 
                    name="pricing_type"
                    value={formData.pricing_type}
                    onChange={onInputChange}
                    style={{
                      ...componentStyles.formInput,
                      borderColor: formErrors.pricing_type ? '#dc3545' : componentStyles.formInput.borderColor,
                      width: '100%'
                    }}
                    required
                  >
                    <option value="fixed">Fixed Price</option>
                    <option value="range">Price Range</option>
                  </select>
                  {formErrors.pricing_type && (
                    <small style={{ 
                      color: '#dc3545', 
                      fontSize: designSystem.typography.fontSize.xs,
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      {formErrors.pricing_type}
                    </small>
                  )}
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[700],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold
                  }}>
                    {formData.pricing_type === 'fixed' ? 'Price ($)' : 'Min Price ($)'} <span style={{ color: '#dc3545' }}>*</span>
                  </label>
                  <input 
                    type="number" 
                    name="min_price"
                    value={formData.min_price}
                    onChange={onInputChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    style={{
                      ...componentStyles.formInput,
                      borderColor: formErrors.min_price ? '#dc3545' : componentStyles.formInput.borderColor,
                      width: '100%'
                    }}
                    required 
                  />
                  {formErrors.min_price && (
                    <small style={{ 
                      color: '#dc3545', 
                      fontSize: designSystem.typography.fontSize.xs,
                      display: 'block',
                      marginTop: '4px'
                    }}>
                      {formErrors.min_price}
                    </small>
                  )}
                </div>
                {formData.pricing_type === 'range' && (
                  <div>
                    <label style={{ 
                      display: 'block', 
                      marginBottom: designSystem.spacing.xs,
                      color: designSystem.colors.gray[700],
                      fontSize: designSystem.typography.fontSize.sm,
                      fontWeight: designSystem.typography.fontWeight.semibold
                    }}>
                      Max Price ($) <span style={{ color: '#dc3545' }}>*</span>
                    </label>
                    <input 
                      type="number" 
                      name="max_price"
                      value={formData.max_price}
                      onChange={onInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      style={{
                        ...componentStyles.formInput,
                        borderColor: formErrors.max_price ? '#dc3545' : componentStyles.formInput.borderColor,
                        width: '100%'
                      }}
                      required 
                    />
                    {formErrors.max_price && (
                      <small style={{ 
                        color: '#dc3545', 
                        fontSize: designSystem.typography.fontSize.xs,
                        display: 'block',
                        marginTop: '4px'
                      }}>
                        {formErrors.max_price}
                      </small>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: designSystem.spacing.lg, marginBottom: designSystem.spacing.lg }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[700],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold
                  }}>
                    Duration
                  </label>
                  <input 
                    type="text" 
                    name="duration"
                    value={formData.duration}
                    onChange={onInputChange}
                    placeholder="e.g., 2-4 weeks"
                    style={{
                      ...componentStyles.formInput,
                      width: '100%'
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: designSystem.spacing.xs,
                    color: designSystem.colors.gray[700],
                    fontSize: designSystem.typography.fontSize.sm,
                    fontWeight: designSystem.typography.fontWeight.semibold
                  }}>
                    Status
                  </label>
                  <select 
                    name="isActive"
                    value={formData.isActive}
                    onChange={onInputChange}
                    style={{
                      ...componentStyles.formInput,
                      width: '100%'
                    }}
                  >
                    <option value={true}>Active</option>
                    <option value={false}>Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: designSystem.spacing.xs,
                  color: designSystem.colors.gray[700],
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.semibold
                }}>
                  Features
                </label>
                <textarea 
                  name="features"
                  value={formData.features}
                  onChange={onInputChange}
                  placeholder="Enter each feature on a new line"
                  rows="4"
                  style={{
                    ...componentStyles.formInput,
                    resize: 'vertical',
                    width: '100%'
                  }}
                />
                <small style={{ 
                  color: designSystem.colors.gray[500], 
                  fontSize: designSystem.typography.fontSize.xs,
                  display: 'block',
                  marginTop: '4px'
                }}>
                  Each line will be treated as a separate feature
                </small>
              </div>
            </div>
          )
        };
      case 'delete':
        return {
          title: 'Delete Service',
          icon: 'fas fa-trash',
          color: designSystem.colors.danger,
          content: (
            <div>
              <div style={{ marginBottom: designSystem.spacing.md }}>
                <h6 className="text-danger">Confirm Service Deletion</h6>
                <p className="small text-muted">
                  This will move the service to the deleted records section where it can be managed separately.
                </p>
              </div>

              <div style={{ marginBottom: designSystem.spacing.md }}>
                <label style={{ 
                  display: 'block', 
                  marginBottom: designSystem.spacing.xs,
                  color: designSystem.colors.gray[600],
                  fontSize: designSystem.typography.fontSize.sm,
                  fontWeight: designSystem.typography.fontWeight.bold
                }}>Service to Delete:</label>
                <div style={{
                  padding: designSystem.spacing.md,
                  background: designSystem.colors.gray[50],
                  borderRadius: designSystem.borderRadius.button,
                  border: `1px solid ${designSystem.colors.gray[200]}`
                }}>
                  <strong>{data?.name}</strong><br/>
                  <small className="text-muted">{data?.category} • {formatPrice(data?.min_price || data?.pricing?.minPrice, data?.max_price || data?.pricing?.maxPrice, data?.pricing_type || data?.pricing?.type)}</small>
                </div>
              </div>

              <div className="alert alert-warning">
                <i className="fas fa-info-circle me-2"></i>
                <strong>Note:</strong> The service will be moved to the deleted records section and can be managed from there.
              </div>
            </div>
          )
        };
      default:
        return { title: '', icon: '', color: '', content: null };
    }
  };

  const config = getModalConfig();

  return (
    <div 
      className="modal fade show" 
      style={{ 
        display: 'block', 
        backgroundColor: 'rgba(0,0,0,0.5)',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 1050
      }}
      onClick={onHide}
    >
      <div 
        className="modal-dialog modal-xl"
        style={{ 
          position: 'relative',
          width: 'auto',
          margin: '1.75rem auto',
          maxWidth: '900px'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)', color: 'white' }}>
            <h5 className="modal-title">
              <i className={`${config.icon} me-2`}></i>
              {config.title}
            </h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={onHide}
            ></button>
          </div>
          <div className="modal-body">
            {config.content}
          </div>
          <div className="modal-footer">
            {type === 'add' ? (
              <>
                
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={onAddService}
                >
                  <i className="fas fa-save me-1"></i>
                  Create Service
                </button>
              </>
            ) : type === 'edit' ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onHide}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={onEditService}
                >
                  <i className="fas fa-save me-1"></i>
                  Update Service
                </button>
              </>
            ) : type === 'delete' ? (
              <>
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={onHide}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger" 
                  onClick={onDeleteService}
                >
                  <i className="fas fa-trash me-1"></i>
                  Delete Service
                </button>
              </>
            ) : (
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={onHide}
              >
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ServiceModal);