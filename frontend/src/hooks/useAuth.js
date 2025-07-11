import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { 
  hasRole, 
  hasAnyRole, 
  hasAllRoles, 
  hasPermission, 
  hasAnyPermission, 
  hasAllPermissions,
  getUserPermissions,
  isFeatureEnabled,
  checkBusinessRule
} from '../auth/permissions';

/**
 * useAuthRedirect Hook - Auto redirect dựa trên role
 */
export const useAuthRedirect = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthRedirect must be used within an AuthProvider');
  }
  const { user, isAuthenticated, loading } = context;
  
  const getDefaultRoute = () => {
    if (!user) return '/login';
    
    switch (user.role) {
      case 'admin':
        return '/admin/dashboard';
      case 'manager':
        return '/admin/dashboard';
      case 'cashier':
        return '/cashier/pos';
      case 'staff':
        return '/staff/dashboard';
      default:
        return '/dashboard';
    }
  };
  
  return {
    getDefaultRoute,
    shouldRedirect: isAuthenticated && !loading
  };
};

/**
 * useAuthStorage Hook - Quản lý auth trong localStorage
 */
export const useAuthStorage = () => {
  const [token, setTokenState] = useState(() => {
    try {
      return localStorage.getItem('khochuan_token');
    } catch {
      return null;
    }
  });

  const [refreshTokenValue, setRefreshTokenState] = useState(() => {
    try {
      return localStorage.getItem('khochuan_refresh_token');
    } catch {
      return null;
    }
  });

  const setToken = (newToken) => {
    try {
      if (newToken) {
        localStorage.setItem('khochuan_token', newToken);
      } else {
        localStorage.removeItem('khochuan_token');
      }
      setTokenState(newToken);
    } catch (error) {
      console.error('Error setting auth token:', error);
    }
  };

  const setRefreshToken = (newRefreshToken) => {
    try {
      if (newRefreshToken) {
        localStorage.setItem('khochuan_refresh_token', newRefreshToken);
      } else {
        localStorage.removeItem('khochuan_refresh_token');
      }
      setRefreshTokenState(newRefreshToken);
    } catch (error) {
      console.error('Error setting refresh token:', error);
    }
  };

  const clearTokens = () => {
    try {
      localStorage.removeItem('khochuan_token');
      localStorage.removeItem('khochuan_refresh_token');
      localStorage.removeItem('khochuan_user');
      setTokenState(null);
      setRefreshTokenState(null);
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  };

  const saveUser = (userData) => {
    try {
      localStorage.setItem('khochuan_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const getStoredUser = () => {
    try {
      const storedUser = localStorage.getItem('khochuan_user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  };

  return {
    token,
    refreshToken: refreshTokenValue,
    setToken,
    setRefreshToken,
    clearTokens,
    saveUser,
    getStoredUser
  };
};

/**
 * useRoleBasedNavigation Hook - Navigation dựa trên role
 */
export const useRoleBasedNavigation = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useRoleBasedNavigation must be used within an AuthProvider');
  }
  const { user } = context;
  
  const getAvailableRoutes = () => {
    if (!user) return [];
    
    const routes = [];
    
    // Admin routes
    if (hasAnyRole(user, ['admin', 'manager'])) {
      routes.push(
        { path: '/admin/dashboard', name: 'Admin Dashboard', icon: 'HomeIcon' },
        { path: '/admin/products', name: 'Quản lý sản phẩm', icon: 'CubeIcon' },
        { path: '/admin/orders', name: 'Quản lý đơn hàng', icon: 'ShoppingCartIcon' },
        { path: '/admin/customers', name: 'Quản lý khách hàng', icon: 'UsersIcon' },
        { path: '/admin/analytics', name: 'Báo cáo phân tích', icon: 'ChartBarIcon' }
      );
    }
    
    // Staff management (Admin only)
    if (hasRole(user, 'admin')) {
      routes.push(
        { path: '/admin/staff', name: 'Quản lý nhân viên', icon: 'UserGroupIcon' },
        { path: '/admin/settings', name: 'Cài đặt hệ thống', icon: 'CogIcon' }
      );
    }
    
    // Cashier routes
    if (hasAnyRole(['admin', 'manager', 'cashier'])) {
      routes.push(
        { path: '/cashier/pos', name: 'POS Terminal', icon: 'ComputerDesktopIcon' },
        { path: '/cashier/orders', name: 'Lịch sử đơn hàng', icon: 'DocumentTextIcon' },
        { path: '/cashier/session', name: 'Quản lý ca', icon: 'ClockIcon' }
      );
    }
    
    // Staff routes
    if (hasAnyRole(['admin', 'manager', 'cashier', 'staff'])) {
      routes.push(
        { path: '/staff/dashboard', name: 'Dashboard cá nhân', icon: 'HomeIcon' },
        { path: '/staff/leaderboard', name: 'Bảng xếp hạng', icon: 'TrophyIcon' },
        { path: '/staff/achievements', name: 'Thành tích', icon: 'StarIcon' },
        { path: '/staff/training', name: 'Đào tạo', icon: 'AcademicCapIcon' }
      );
    }
    
    return routes;
  };
  
  const canAccessRoute = (routePath) => {
    if (!user) return false;
    
    // Route patterns và permissions
    const routePermissions = {
      '/admin': ['admin', 'manager'],
      '/admin/staff': ['admin'],
      '/admin/settings': ['admin'],
      '/cashier': ['admin', 'manager', 'cashier'],
      '/staff': ['admin', 'manager', 'cashier', 'staff']
    };
    
    for (const [pattern, roles] of Object.entries(routePermissions)) {
      if (routePath.startsWith(pattern)) {
        return hasAnyRole(user, roles);
      }
    }
    
    return true; // Default allow
  };
  
  return {
    getAvailableRoutes,
    canAccessRoute
  };
};

/**
 * useSessionTimeout Hook - Quản lý timeout session
 */
export const useSessionTimeout = (timeoutMinutes = 30) => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useSessionTimeout must be used within an AuthProvider');
  }
  const { logout, user } = context;
  const isAuthenticated = !!user;
  const [isIdle, setIsIdle] = useState(false);
  const [timeLeft, setTimeLeft] = useState(timeoutMinutes * 60);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let idleTimer;
    let countdownTimer;
    
    const resetIdleTimer = () => {
      setIsIdle(false);
      setTimeLeft(timeoutMinutes * 60);
      
      if (idleTimer) clearTimeout(idleTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      
      idleTimer = setTimeout(() => {
        setIsIdle(true);
        
        // Start countdown
        countdownTimer = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 1) {
              logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
        
      }, timeoutMinutes * 60 * 1000);
    };
    
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    events.forEach(event => {
      document.addEventListener(event, resetIdleTimer, true);
    });
    
    resetIdleTimer(); // Initialize
    
    return () => {
      if (idleTimer) clearTimeout(idleTimer);
      if (countdownTimer) clearInterval(countdownTimer);
      events.forEach(event => {
        document.removeEventListener(event, resetIdleTimer, true);
      });
    };
  }, [isAuthenticated, logout, timeoutMinutes]);
  
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return {
    isIdle,
    timeLeft,
    formatTimeLeft,
    extendSession: () => setIsIdle(false)
  };
};

/**
 * useAuthGuard Hook - Bảo vệ component/route
 */
export const useAuthGuard = (requiredRole = null, requiredPermissions = []) => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthGuard must be used within an AuthProvider');
  }
  const { user, isAuthenticated, loading } = context;

  // Use permission functions
  const userHasRole = (role) => hasRole(user, role);
  const userHasAllPermissions = (permissions) => hasAllPermissions(user, permissions);
  
  const canAccess = () => {
    if (!isAuthenticated) return false;

    if (requiredRole && !userHasRole(requiredRole)) return false;

    if (requiredPermissions.length > 0 && !userHasAllPermissions(requiredPermissions)) {
      return false;
    }

    return true;
  };

  const getAccessDeniedReason = () => {
    if (!isAuthenticated) return 'Chưa đăng nhập';
    if (requiredRole && !userHasRole(requiredRole)) return `Cần quyền ${requiredRole}`;
    if (requiredPermissions.length > 0) return 'Không đủ quyền truy cập';
    return null;
  };
  
  return {
    canAccess: canAccess(),
    loading,
    reason: getAccessDeniedReason()
  };
};

/**
 * Default export
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { 
    user, 
    loading, 
    login, 
    logout, 
    refreshToken, 
    updateProfile,
    error,
    clearError 
  } = context;

  // Helper functions với user hiện tại
  const authHelpers = {
    // Role checking
    hasRole: (role) => hasRole(user, role),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
    hasAllRoles: (roles) => hasAllRoles(user, roles),
    
    // Permission checking  
    hasPermission: (permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(user, permissions),
    
    // Get user permissions
    getUserPermissions: () => getUserPermissions(user),
    
    // Feature flags
    isFeatureEnabled: (feature) => isFeatureEnabled(user, feature),
    
    // Business rules
    checkBusinessRule: (rule, value) => checkBusinessRule(user, rule, value),
    
    // Computed properties
    isAdmin: hasRole(user, 'admin'),
    isManager: hasAnyRole(user, ['admin', 'manager']),
    isCashier: hasAnyRole(user, ['admin', 'manager', 'cashier']),
    isStaff: hasAnyRole(user, ['admin', 'manager', 'cashier', 'staff']),
    
    // Auth state
    isAuthenticated: !!user,
    isLoading: loading
  };

  return {
    // User data
    user,
    loading,
    error,
    
    // Auth actions
    login,
    logout,
    refreshToken,
    updateProfile,
    clearError,
    
    // Helper functions
    ...authHelpers
  };
};

/**
 * usePermissions Hook - Chỉ cho permissions
 */
export const usePermissions = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('usePermissions must be used within an AuthProvider');
  }
  const { user } = context;
  
  return {
    hasRole: (role) => hasRole(user, role),
    hasAnyRole: (roles) => hasAnyRole(user, roles),
    hasAllRoles: (roles) => hasAllRoles(user, roles),
    hasPermission: (permission) => hasPermission(user, permission),
    hasAnyPermission: (permissions) => hasAnyPermission(user, permissions),
    hasAllPermissions: (permissions) => hasAllPermissions(user, permissions),
    getUserPermissions: () => getUserPermissions(user),
    checkBusinessRule: (rule, value) => checkBusinessRule(user, rule, value)
  };
};