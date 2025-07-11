import { useContext } from 'react';
import { AuthContext } from '../../auth/AuthContext';

/**
 * Hook quản lý và kiểm tra phân quyền người dùng
 * @returns {Object} Các phương thức kiểm tra quyền hạn
 */
const usePermissions = () => {
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('usePermissions must be used within an AuthProvider');
  }

  /**
   * Kiểm tra quyền đơn lẻ
   * @param {string} permission - Quyền cần kiểm tra
   * @returns {boolean} Người dùng có quyền không
   */
  const hasPermission = (permission) => {
    if (!auth.isAuthenticated || !auth.permissions) return false;
    return auth.permissions.includes(permission);
  };

  /**
   * Kiểm tra người dùng có bất kỳ quyền nào trong danh sách
   * @param {Array<string>} permissions - Danh sách quyền
   * @returns {boolean} Người dùng có bất kỳ quyền nào không
   */
  const hasAnyPermission = (permissions) => {
    if (!auth.isAuthenticated || !auth.permissions || !Array.isArray(permissions)) {
      return false;
    }
    return permissions.some(permission => auth.permissions.includes(permission));
  };

  /**
   * Kiểm tra người dùng có tất cả quyền trong danh sách
   * @param {Array<string>} permissions - Danh sách quyền
   * @returns {boolean} Người dùng có tất cả quyền không
   */
  const hasAllPermissions = (permissions) => {
    if (!auth.isAuthenticated || !auth.permissions || !Array.isArray(permissions)) {
      return false;
    }
    return permissions.every(permission => auth.permissions.includes(permission));
  };

  /**
   * Lấy danh sách quyền của người dùng hiện tại
   * @returns {Array<string>} Danh sách quyền
   */
  const getUserPermissions = () => {
    return auth.isAuthenticated ? auth.permissions || [] : [];
  };

  /**
   * Kiểm tra một tính năng có được bật không
   * @param {string} featureName - Tên tính năng cần kiểm tra
   * @returns {boolean} Tính năng có được bật không
   */
  const isFeatureEnabled = (featureName) => {
    // Các tính năng theo role
    const ROLE_FEATURES = {
      admin: ['ai_insights', 'business_analytics', 'user_management', 'system_settings', 
              'advanced_reporting', 'all_integrations', 'roles_permissions'],
      manager: ['ai_insights', 'business_analytics', 'staff_management',
                'inventory_management', 'advanced_reporting'],
      staff: ['inventory_management', 'order_processing', 'customer_management',
              'basic_reporting'],
      cashier: ['pos_terminal', 'customer_lookup', 'basic_reporting', 'order_history'],
    };

    if (!auth.user || !auth.isAuthenticated) return false;

    // Kiểm tra trong features của role
    const userRole = auth.user.role;
    const roleFeatures = ROLE_FEATURES[userRole] || [];

    // Kiểm tra trong features cụ thể của user (nếu có)
    const userFeatures = auth.user.features || [];

    return roleFeatures.includes(featureName) || userFeatures.includes(featureName);
  };

  /**
   * Kiểm tra quy tắc kinh doanh
   * @param {string} ruleName - Tên quy tắc cần kiểm tra
   * @param {Object} context - Dữ liệu ngữ cảnh để kiểm tra
   * @returns {boolean} Quy tắc có được thỏa mãn không
   */
  const checkBusinessRule = (ruleName, context = {}) => {
    // Các quy tắc kinh doanh theo role
    const BUSINESS_RULES = {
      // Quy tắc cho việc chiết khấu
      'can_apply_discount': (ctx) => {
        const { discount = 0, userRole } = ctx;
        
        switch(userRole) {
          case 'admin':
          case 'manager':
            return true; // Không giới hạn
          case 'staff':
            return discount <= 15; // Tối đa 15%
          case 'cashier':
            return discount <= 5; // Tối đa 5%
          default:
            return false;
        }
      },
      
      // Quy tắc cho việc hoàn trả
      'can_process_refund': (ctx) => {
        const { refundAmount = 0, userRole } = ctx;
        
        switch(userRole) {
          case 'admin':
          case 'manager':
            return true; // Không giới hạn
          case 'staff':
            return refundAmount <= 2000000; // Tối đa 2 triệu VND
          case 'cashier':
            return refundAmount <= 500000; // Tối đa 500 nghìn VND
          default:
            return false;
        }
      },
      
      // Quy tắc cho việc xem báo cáo
      'can_view_reports': (ctx) => {
        const { reportType, userRole } = ctx;
        
        if (!reportType) return false;
        
        const roleReports = {
          'admin': ['all', 'financial', 'inventory', 'sales', 'staff', 'customer'],
          'manager': ['inventory', 'sales', 'staff', 'customer'],
          'staff': ['sales', 'inventory'],
          'cashier': ['sales']
        };
        
        const allowedReports = roleReports[userRole] || [];
        return allowedReports.includes('all') || allowedReports.includes(reportType);
      }
    };

    if (!auth.user || !auth.isAuthenticated) return false;

    const userRole = auth.user.role;
    const rule = BUSINESS_RULES[ruleName];
    
    if (typeof rule !== 'function') return false;
    
    return rule({ ...context, userRole });
  };

  /**
   * Kiểm tra phân quyền cho module cụ thể
   * @param {string} module - Tên module
   * @param {string} action - Hành động (view, create, edit, delete)
   * @returns {boolean} Người dùng có quyền thực hiện hành động trên module không
   */
  const canPerformAction = (module, action) => {
    if (!auth.isAuthenticated) return false;

    // Module-specific permissions
    const modulePermission = `${module}:${action}`;
    if (hasPermission(modulePermission)) return true;

    // General module permissions
    if (action !== 'manage' && hasPermission(`${module}:manage`)) return true;

    // Check for admin permissions
    if (hasPermission('all:manage')) return true;

    // Default deny
    return false;
  };

  /**
   * Kiểm tra quyền hạn theo vai trò và phân quyền chi tiết
   * @param {Object} options - Tùy chọn kiểm tra
   * @returns {boolean} Người dùng có quyền không
   */
  const checkAccess = (options) => {
    const {
      requiredRole,
      requiredPermissions = [],
      requiredFeatures = [],
      module,
      action,
      businessRule,
      businessRuleContext = {}
    } = options;

    // Kiểm tra role
    if (requiredRole) {
      let roleCheck;
      if (Array.isArray(requiredRole)) {
        roleCheck = auth.user && requiredRole.includes(auth.user.role);
      } else {
        roleCheck = auth.user && auth.user.role === requiredRole;
      }
      
      if (!roleCheck) return false;
    }

    // Kiểm tra quyền
    if (requiredPermissions.length > 0) {
      if (!hasAllPermissions(requiredPermissions)) return false;
    }

    // Kiểm tra module action
    if (module && action) {
      if (!canPerformAction(module, action)) return false;
    }

    // Kiểm tra tính năng
    if (requiredFeatures.length > 0) {
      const featuresEnabled = requiredFeatures.every(feature => isFeatureEnabled(feature));
      if (!featuresEnabled) return false;
    }

    // Kiểm tra quy tắc kinh doanh
    if (businessRule) {
      if (!checkBusinessRule(businessRule, businessRuleContext)) return false;
    }

    // Tất cả các kiểm tra đã pass
    return true;
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    getUserPermissions,
    isFeatureEnabled,
    checkBusinessRule,
    canPerformAction,
    checkAccess
  };
};

export default usePermissions; 