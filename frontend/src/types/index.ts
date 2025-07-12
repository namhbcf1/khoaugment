/**
 * Types barrel file
 * Export all types from the types directory for easy importing
 */

// Re-export all types from individual files
export * from "./api";

// User related types
export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  avatar_url?: string;
  phone?: string;
  last_login?: string;
  created_at: string;
}

// Authentication types
export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

// UI related types
export interface ThemeConfig {
  mode: "light" | "dark";
  primaryColor: string;
  borderRadius: number;
  compact: boolean;
}

export interface LayoutConfig {
  sidebarCollapsed: boolean;
  headerFixed: boolean;
  contentWidth: "full" | "fixed";
  showBreadcrumbs: boolean;
}

// Common application types
export interface AppSettings {
  language: "vi" | "en";
  theme: ThemeConfig;
  layout: LayoutConfig;
  notifications: boolean;
  sound: boolean;
  offlineMode: boolean;
}

// Route types
export interface AppRoute {
  path: string;
  element: React.ReactNode;
  requireAuth?: boolean;
  requiredRole?: string | string[];
  children?: AppRoute[];
}
