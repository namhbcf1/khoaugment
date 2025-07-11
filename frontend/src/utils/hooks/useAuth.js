import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { message } from 'antd';

import { AuthContext } from '../../auth/AuthContext';
import { PERMISSIONS, ROLES } from '../constants/permissions';

/**
 * Hook sử dụng AuthContext để quản lý xác thực
 * @returns {Object} Auth context và các tiện ích xác thực
 */
const useAuth = () => {
  const navigate = useNavigate();
  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  /**
   * Kiểm tra xem người dùng có đúng role không
   * @param {string|Array<string>} role - Role cần kiểm tra
   * @returns {boolean} Người dùng có role này không
   */
  const hasRole = (role) => {
    if (!auth.user || !auth.isAuthenticated) return false;

    if (Array.isArray(role)) {
      return role.includes(auth.user.role);
    }
    
    return auth.user.role === role;
  };

  /**
   * Kiểm tra xem người dùng có bất kỳ role nào trong danh sách không
   * @param {Array<string>} roles - Danh sách roles
   * @returns {boolean} Người dùng có bất kỳ role nào không
   */
  const hasAnyRole = (roles) => {
    if (!auth.user || !auth.isAuthenticated || !Array.isArray(roles)) return false;
    
    return roles.some(role => auth.user.role === role);
  };

  /**
   * Kiểm tra xem người dùng có tất cả roles không
   * @param {Array<string>} roles - Danh sách roles
   * @returns {boolean} Người dùng có tất cả role không
   */
  const hasAllRoles = (roles) => {
    if (!auth.user || !auth.isAuthenticated || !Array.isArray(roles)) return false;
    
    return roles.every(role => auth.user.role === role);
  };

  /**
   * Lấy level của role hiện tại
   * @returns {number} Level của role (3=admin, 2=staff, 1=cashier, 0=guest)
   */
  const getRoleLevel = () => {
    if (!auth.user || !auth.isAuthenticated) return 0;

    const roleLevels = {
      admin: 3,
      manager: 3,
      staff: 2,
      cashier: 1,
      customer: 0
    };

    return roleLevels[auth.user.role] || 0;
  };

  /**
   * Kiểm tra xem role hiện tại có đủ level không
   * @param {number} requiredLevel - Level tối thiểu cần kiểm tra
   * @returns {boolean} Người dùng có đủ level không
   */
  const hasMinimumRoleLevel = (requiredLevel) => {
    return getRoleLevel() >= requiredLevel;
  };

  /**
   * Đăng nhập người dùng
   * @param {Object} credentials - Thông tin đăng nhập
   * @param {string} redirectTo - Đường dẫn chuyển hướng sau đăng nhập
   */
  const login = async (credentials, redirectTo) => {
    const result = await auth.login(credentials);
    
    if (result.success) {
      const destination = redirectTo || getDefaultRoute();
      navigate(destination);
    }
    
    return result;
  };

  /**
   * Đăng xuất người dùng
   * @param {string} redirectTo - Đường dẫn chuyển hướng sau đăng xuất
   */
  const logout = async (redirectTo = '/login') => {
    await auth.logout();
    navigate(redirectTo);
  };

  /**
   * Tự động chuyển hướng dựa trên role
   */
  const getDefaultRoute = () => {
    if (!auth.user) return '/login';
    
    switch (auth.user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'manager':
        return '/admin/dashboard';
      case 'staff':
        return '/staff/dashboard';
      case 'cashier':
        return '/cashier/pos';
      default:
        return '/dashboard';
    }
  };

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Thông tin cập nhật
   */
  const updateProfile = async (userData) => {
    return await auth.updateUser(userData);
  };

  /**
   * Đổi mật khẩu
   * @param {Object} passwordData - Thông tin mật khẩu cũ và mới
   */
  const changePassword = async (passwordData) => {
    return await auth.changePassword(passwordData);
  };

  /**
   * Bảo vệ route yêu cầu xác thực
   * @param {Object} options - Tùy chọn bảo vệ
   * @param {string|Array<string>} options.requiredRole - Role bắt buộc
   * @param {Array<string>} options.requiredPermissions - Danh sách quyền bắt buộc
   * @param {number} options.requiredLevel - Level tối thiểu
   * @param {string} options.redirectTo - Đường dẫn chuyển hướng nếu không đủ quyền
   */
  const requireAuth = (options = {}) => {
    const {
      requiredRole,
      requiredPermissions = [],
      requiredLevel,
      redirectTo = '/login'
    } = options;

    if (!auth.isAuthenticated) {
      message.error('Bạn cần đăng nhập để truy cập trang này.');
      navigate(redirectTo);
      return false;
    }

    if (requiredRole && !hasRole(requiredRole)) {
      message.error('Bạn không có quyền truy cập trang này.');
      navigate(getDefaultRoute());
      return false;
    }

    if (requiredLevel && !hasMinimumRoleLevel(requiredLevel)) {
      message.error('Bạn không đủ quyền hạn để truy cập trang này.');
      navigate(getDefaultRoute());
      return false;
    }

    if (
      requiredPermissions.length > 0 &&
      !requiredPermissions.every(permission => auth.hasPermission(permission))
    ) {
      message.error('Bạn không có quyền thực hiện thao tác này.');
      navigate(getDefaultRoute());
      return false;
    }

    return true;
  };

  /**
   * Lấy danh sách menu có thể truy cập dựa trên role
   * @returns {Array} Danh sách menu có quyền truy cập
   */
  const getAccessibleMenus = () => {
    if (!auth.isAuthenticated) return [];
    
    const allMenus = [
      // Admin menus
      {
        key: 'admin-dashboard',
        label: 'Dashboard',
        path: '/admin/dashboard',
        icon: 'DashboardOutlined',
        requiredRole: ['admin', 'manager'],
      },
      {
        key: 'admin-products',
        label: 'Sản phẩm',
        path: '/admin/products',
        icon: 'ShoppingOutlined',
        requiredRole: ['admin', 'manager', 'staff'],
      },
      {
        key: 'admin-orders',
        label: 'Đơn hàng',
        path: '/admin/orders',
        icon: 'ShoppingCartOutlined',
        requiredRole: ['admin', 'manager', 'staff'],
      },
      {
        key: 'admin-customers',
        label: 'Khách hàng',
        path: '/admin/customers',
        icon: 'UserOutlined',
        requiredRole: ['admin', 'manager', 'staff'],
      },
      {
        key: 'admin-inventory',
        label: 'Kho hàng',
        path: '/admin/inventory',
        icon: 'InboxOutlined',
        requiredRole: ['admin', 'manager', 'staff'],
      },
      {
        key: 'admin-staff',
        label: 'Nhân viên',
        path: '/admin/staff',
        icon: 'TeamOutlined',
        requiredRole: ['admin', 'manager'],
      },
      {
        key: 'admin-analytics',
        label: 'Báo cáo & Thống kê',
        path: '/admin/analytics',
        icon: 'BarChartOutlined',
        requiredRole: ['admin', 'manager'],
      },
      {
        key: 'admin-settings',
        label: 'Cài đặt',
        path: '/admin/settings',
        icon: 'SettingOutlined',
        requiredRole: ['admin'],
      },

      // Cashier menus
      {
        key: 'cashier-pos',
        label: 'POS Terminal',
        path: '/cashier/pos',
        icon: 'ShopOutlined',
        requiredRole: ['admin', 'manager', 'cashier'],
      },
      {
        key: 'cashier-orders',
        label: 'Đơn hàng',
        path: '/cashier/orders',
        icon: 'ShoppingCartOutlined',
        requiredRole: ['admin', 'manager', 'cashier'],
      },
      {
        key: 'cashier-customers',
        label: 'Khách hàng',
        path: '/cashier/customers',
        icon: 'UserOutlined',
        requiredRole: ['admin', 'manager', 'cashier'],
      },
      {
        key: 'cashier-session',
        label: 'Ca làm việc',
        path: '/cashier/session',
        icon: 'ClockCircleOutlined',
        requiredRole: ['admin', 'manager', 'cashier'],
      },

      // Staff menus
      {
        key: 'staff-dashboard',
        label: 'Dashboard',
        path: '/staff/dashboard',
        icon: 'DashboardOutlined',
        requiredRole: ['admin', 'manager', 'staff'],
      },
      {
        key: 'staff-sales',
        label: 'Bán hàng',
        path: '/staff/sales',
        icon: 'DollarOutlined',
        requiredRole: ['admin', 'manager', 'staff'],
      },
      {
        key: 'staff-gamification',
        label: 'Thành tích',
        path: '/staff/gamification',
        icon: 'TrophyOutlined',
        requiredRole: ['admin', 'manager', 'staff', 'cashier'],
      },
      {
        key: 'staff-training',
        label: 'Đào tạo',
        path: '/staff/training',
        icon: 'ReadOutlined',
        requiredRole: ['admin', 'manager', 'staff', 'cashier'],
      },
      {
        key: 'staff-profile',
        label: 'Hồ sơ cá nhân',
        path: '/staff/profile',
        icon: 'UserOutlined',
        requiredRole: ['admin', 'manager', 'staff', 'cashier'],
      },
    ];

    return allMenus.filter(menu => {
      if (!menu.requiredRole) return true;
      
      return hasAnyRole(menu.requiredRole);
    });
  };

  return {
    // Expose whatever auth properties and methods are needed
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,
    // Add other properties and methods as needed
    hasRole,
    hasAnyRole,
    hasAllRoles,
    hasMinimumRoleLevel,
    updateProfile,
    changePassword,
    requireAuth,
    getDefaultRoute
  };
};

export default useAuth; 