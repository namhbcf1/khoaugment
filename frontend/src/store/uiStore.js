/**
 * UI Store
 * Zustand store for managing UI state and preferences
 * 
 * @author Trường Phát Computer
 * @version 1.0.0
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

/**
 * UI Store
 * Manages UI state, theme, layout, notifications, and user preferences
 */
const useUIStore = create(
  persist(
    (set, get) => ({
      // Theme and Layout
      theme: 'light',
      sidebarCollapsed: false,
      sidebarWidth: 256,
      headerHeight: 64,
      language: 'vi',
      
      // Loading States
      globalLoading: false,
      pageLoading: false,
      componentLoading: {},
      
      // Notifications
      notifications: [],
      notificationCount: 0,
      
      // Modals and Drawers
      modals: {},
      drawers: {},
      
      // Page States
      currentPage: 'dashboard',
      breadcrumbs: [],
      pageTitle: 'Dashboard',
      
      // Data Tables
      tableStates: {},
      
      // Forms
      formStates: {},
      
      // Search
      globalSearch: '',
      searchHistory: [],
      
      // Actions
      
      /**
       * Set theme
       * @param {string} theme - Theme name (light, dark)
       */
      setTheme: (theme) => {
        set({ theme });
        document.documentElement.setAttribute('data-theme', theme);
      },

      /**
       * Toggle theme
       */
      toggleTheme: () => {
        const { theme } = get();
        const newTheme = theme === 'light' ? 'dark' : 'light';
        get().setTheme(newTheme);
      },

      /**
       * Set sidebar collapsed state
       * @param {boolean} collapsed - Collapsed state
       */
      setSidebarCollapsed: (collapsed) => {
        set({ sidebarCollapsed: collapsed });
      },

      /**
       * Toggle sidebar
       */
      toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      },

      /**
       * Set language
       * @param {string} language - Language code (vi, en)
       */
      setLanguage: (language) => {
        set({ language });
        document.documentElement.setAttribute('lang', language);
      },

      /**
       * Set global loading state
       * @param {boolean} loading - Loading state
       */
      setGlobalLoading: (loading) => {
        set({ globalLoading: loading });
      },

      /**
       * Set page loading state
       * @param {boolean} loading - Loading state
       */
      setPageLoading: (loading) => {
        set({ pageLoading: loading });
      },

      /**
       * Set component loading state
       * @param {string} componentId - Component identifier
       * @param {boolean} loading - Loading state
       */
      setComponentLoading: (componentId, loading) => {
        set((state) => ({
          componentLoading: {
            ...state.componentLoading,
            [componentId]: loading
          }
        }));
      },

      /**
       * Add notification
       * @param {Object} notification - Notification object
       * @param {string} notification.type - Type (success, error, warning, info)
       * @param {string} notification.title - Notification title
       * @param {string} notification.message - Notification message
       * @param {number} notification.duration - Auto-close duration in ms
       */
      addNotification: (notification) => {
        const id = Date.now().toString();
        const newNotification = {
          id,
          type: 'info',
          duration: 4500,
          timestamp: Date.now(),
          ...notification
        };

        set((state) => ({
          notifications: [...state.notifications, newNotification],
          notificationCount: state.notificationCount + 1
        }));

        // Auto-remove notification
        if (newNotification.duration > 0) {
          setTimeout(() => {
            get().removeNotification(id);
          }, newNotification.duration);
        }

        return id;
      },

      /**
       * Remove notification
       * @param {string} id - Notification ID
       */
      removeNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter(n => n.id !== id)
        }));
      },

      /**
       * Clear all notifications
       */
      clearNotifications: () => {
        set({ notifications: [], notificationCount: 0 });
      },

      /**
       * Show success notification
       * @param {string} message - Success message
       * @param {string} title - Optional title
       */
      showSuccess: (message, title = 'Thành công') => {
        return get().addNotification({
          type: 'success',
          title,
          message
        });
      },

      /**
       * Show error notification
       * @param {string} message - Error message
       * @param {string} title - Optional title
       */
      showError: (message, title = 'Lỗi') => {
        return get().addNotification({
          type: 'error',
          title,
          message,
          duration: 6000
        });
      },

      /**
       * Show warning notification
       * @param {string} message - Warning message
       * @param {string} title - Optional title
       */
      showWarning: (message, title = 'Cảnh báo') => {
        return get().addNotification({
          type: 'warning',
          title,
          message
        });
      },

      /**
       * Show info notification
       * @param {string} message - Info message
       * @param {string} title - Optional title
       */
      showInfo: (message, title = 'Thông tin') => {
        return get().addNotification({
          type: 'info',
          title,
          message
        });
      },

      /**
       * Open modal
       * @param {string} modalId - Modal identifier
       * @param {Object} props - Modal props
       */
      openModal: (modalId, props = {}) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { open: true, props }
          }
        }));
      },

      /**
       * Close modal
       * @param {string} modalId - Modal identifier
       */
      closeModal: (modalId) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalId]: { open: false, props: {} }
          }
        }));
      },

      /**
       * Open drawer
       * @param {string} drawerId - Drawer identifier
       * @param {Object} props - Drawer props
       */
      openDrawer: (drawerId, props = {}) => {
        set((state) => ({
          drawers: {
            ...state.drawers,
            [drawerId]: { open: true, props }
          }
        }));
      },

      /**
       * Close drawer
       * @param {string} drawerId - Drawer identifier
       */
      closeDrawer: (drawerId) => {
        set((state) => ({
          drawers: {
            ...state.drawers,
            [drawerId]: { open: false, props: {} }
          }
        }));
      },

      /**
       * Set current page
       * @param {string} page - Page name
       * @param {string} title - Page title
       * @param {Array} breadcrumbs - Breadcrumb items
       */
      setCurrentPage: (page, title, breadcrumbs = []) => {
        set({
          currentPage: page,
          pageTitle: title,
          breadcrumbs
        });
        document.title = `${title} - Trường Phát Computer`;
      },

      /**
       * Set table state
       * @param {string} tableId - Table identifier
       * @param {Object} state - Table state
       */
      setTableState: (tableId, state) => {
        set((prevState) => ({
          tableStates: {
            ...prevState.tableStates,
            [tableId]: {
              ...prevState.tableStates[tableId],
              ...state
            }
          }
        }));
      },

      /**
       * Get table state
       * @param {string} tableId - Table identifier
       * @returns {Object} Table state
       */
      getTableState: (tableId) => {
        const { tableStates } = get();
        return tableStates[tableId] || {};
      },

      /**
       * Set form state
       * @param {string} formId - Form identifier
       * @param {Object} state - Form state
       */
      setFormState: (formId, state) => {
        set((prevState) => ({
          formStates: {
            ...prevState.formStates,
            [formId]: {
              ...prevState.formStates[formId],
              ...state
            }
          }
        }));
      },

      /**
       * Get form state
       * @param {string} formId - Form identifier
       * @returns {Object} Form state
       */
      getFormState: (formId) => {
        const { formStates } = get();
        return formStates[formId] || {};
      },

      /**
       * Set global search query
       * @param {string} query - Search query
       */
      setGlobalSearch: (query) => {
        set({ globalSearch: query });
        
        // Add to search history if not empty
        if (query.trim()) {
          const { searchHistory } = get();
          const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
          set({ searchHistory: newHistory });
        }
      },

      /**
       * Clear search history
       */
      clearSearchHistory: () => {
        set({ searchHistory: [] });
      },

      /**
       * Reset UI state
       */
      resetUIState: () => {
        set({
          globalLoading: false,
          pageLoading: false,
          componentLoading: {},
          notifications: [],
          notificationCount: 0,
          modals: {},
          drawers: {},
          globalSearch: '',
          tableStates: {},
          formStates: {}
        });
      }
    }),
    {
      name: 'ui-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
        language: state.language,
        searchHistory: state.searchHistory
      })
    }
  )
);

export default useUIStore;
