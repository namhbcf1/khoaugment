import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@testing-library/jest-dom';

// Import components to test
import App from '../../App';
import { AuthProvider } from '../../auth/AuthContext';

// Mock API calls
jest.mock('../../services/api', () => ({
  api: {
    auth: {
      login: jest.fn(),
      logout: jest.fn(),
      getCurrentUser: jest.fn()
    },
    products: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn()
    },
    orders: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    customers: {
      getAll: jest.fn(),
      create: jest.fn(),
      update: jest.fn()
    },
    analytics: {
      getDashboard: jest.fn(),
      getReports: jest.fn()
    }
  }
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Test wrapper component
const TestWrapper = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('User Flow Integration Tests', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
  });

  describe('Authentication Flow', () => {
    test('user can login successfully', async () => {
      const mockLoginResponse = {
        success: true,
        data: {
          user: {
            id: 1,
            name: 'Test Admin',
            email: 'admin@test.com',
            role: 'admin'
          },
          token: 'mock-jwt-token'
        }
      };

      const { api } = require('../../services/api');
      api.auth.login.mockResolvedValue(mockLoginResponse);

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show login form initially
      await waitFor(() => {
        expect(screen.getByText(/đăng nhập/i)).toBeInTheDocument();
      });

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mật khẩu/i);
      const loginButton = screen.getByRole('button', { name: /đăng nhập/i });

      await user.type(emailInput, 'admin@test.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // Should redirect to dashboard after successful login
      await waitFor(() => {
        expect(api.auth.login).toHaveBeenCalledWith({
          email: 'admin@test.com',
          password: 'password123'
        });
      });
    });

    test('shows error message on failed login', async () => {
      const { api } = require('../../services/api');
      api.auth.login.mockRejectedValue(new Error('Invalid credentials'));

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/đăng nhập/i)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/mật khẩu/i);
      const loginButton = screen.getByRole('button', { name: /đăng nhập/i });

      await user.type(emailInput, 'wrong@email.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
      });
    });
  });

  describe('POS Transaction Flow', () => {
    beforeEach(() => {
      // Mock authenticated user
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          id: 1,
          name: 'Test Cashier',
          role: 'cashier'
        });
        return null;
      });
    });

    test('cashier can complete a sale transaction', async () => {
      const mockProducts = [
        { id: 1, name: 'Coca Cola', price: 12000, stock: 100 },
        { id: 2, name: 'Bánh mì', price: 25000, stock: 50 }
      ];

      const { api } = require('../../services/api');
      api.products.getAll.mockResolvedValue({ data: mockProducts });
      api.orders.create.mockResolvedValue({
        success: true,
        data: { id: 1, total: 37000 }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to POS
      await waitFor(() => {
        const posLink = screen.getByText(/pos terminal/i);
        fireEvent.click(posLink);
      });

      // Wait for products to load
      await waitFor(() => {
        expect(screen.getByText('Coca Cola')).toBeInTheDocument();
      });

      // Add products to cart
      const colaButton = screen.getByText('Coca Cola').closest('button');
      const banhMiButton = screen.getByText('Bánh mì').closest('button');

      await user.click(colaButton);
      await user.click(banhMiButton);

      // Verify cart total
      await waitFor(() => {
        expect(screen.getByText(/37,000/)).toBeInTheDocument();
      });

      // Complete payment
      const paymentButton = screen.getByText(/thanh toán/i);
      await user.click(paymentButton);

      await waitFor(() => {
        expect(api.orders.create).toHaveBeenCalled();
      });
    });
  });

  describe('Inventory Management Flow', () => {
    beforeEach(() => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          id: 1,
          name: 'Test Admin',
          role: 'admin'
        });
        return null;
      });
    });

    test('admin can add new product', async () => {
      const { api } = require('../../services/api');
      api.products.getAll.mockResolvedValue({ data: [] });
      api.products.create.mockResolvedValue({
        success: true,
        data: { id: 1, name: 'New Product' }
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to inventory
      await waitFor(() => {
        const inventoryLink = screen.getByText(/quản lý kho/i);
        fireEvent.click(inventoryLink);
      });

      // Click add product button
      const addButton = screen.getByText(/thêm sản phẩm/i);
      await user.click(addButton);

      // Fill product form
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/tên sản phẩm/i);
        const priceInput = screen.getByLabelText(/giá bán/i);
        
        user.type(nameInput, 'Test Product');
        user.type(priceInput, '50000');
      });

      // Submit form
      const submitButton = screen.getByText(/lưu/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.products.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Product',
            price: 50000
          })
        );
      });
    });
  });

  describe('Customer Management Flow', () => {
    test('staff can create new customer', async () => {
      const { api } = require('../../services/api');
      api.customers.getAll.mockResolvedValue({ data: [] });
      api.customers.create.mockResolvedValue({
        success: true,
        data: { id: 1, name: 'New Customer' }
      });

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          id: 1,
          name: 'Test Staff',
          role: 'staff'
        });
        return null;
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to customers
      await waitFor(() => {
        const customersLink = screen.getByText(/khách hàng/i);
        fireEvent.click(customersLink);
      });

      // Click add customer button
      const addButton = screen.getByText(/thêm khách hàng/i);
      await user.click(addButton);

      // Fill customer form
      await waitFor(() => {
        const nameInput = screen.getByLabelText(/họ tên/i);
        const phoneInput = screen.getByLabelText(/số điện thoại/i);
        
        user.type(nameInput, 'Test Customer');
        user.type(phoneInput, '0123456789');
      });

      // Submit form
      const submitButton = screen.getByText(/lưu/i);
      await user.click(submitButton);

      await waitFor(() => {
        expect(api.customers.create).toHaveBeenCalledWith(
          expect.objectContaining({
            name: 'Test Customer',
            phone: '0123456789'
          })
        );
      });
    });
  });

  describe('Analytics Dashboard Flow', () => {
    test('admin can view analytics dashboard', async () => {
      const mockAnalytics = {
        totalRevenue: 1000000,
        totalOrders: 150,
        avgOrderValue: 6667,
        conversionRate: 3.2
      };

      const { api } = require('../../services/api');
      api.analytics.getDashboard.mockResolvedValue({ data: mockAnalytics });

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          id: 1,
          name: 'Test Admin',
          role: 'admin'
        });
        return null;
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Navigate to analytics
      await waitFor(() => {
        const analyticsLink = screen.getByText(/analytics/i);
        fireEvent.click(analyticsLink);
      });

      // Verify analytics data is displayed
      await waitFor(() => {
        expect(screen.getByText(/1,000,000/)).toBeInTheDocument();
        expect(screen.getByText(/150/)).toBeInTheDocument();
        expect(screen.getByText(/3.2%/)).toBeInTheDocument();
      });
    });
  });

  describe('Mobile Responsiveness', () => {
    test('navigation works on mobile devices', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375,
      });

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'mock-token';
        if (key === 'user') return JSON.stringify({
          id: 1,
          name: 'Test User',
          role: 'admin'
        });
        return null;
      });

      render(
        <TestWrapper>
          <App />
        </TestWrapper>
      );

      // Should show mobile menu button
      await waitFor(() => {
        const menuButton = screen.getByLabelText(/menu/i) || 
                          screen.getByRole('button', { name: /menu/i });
        expect(menuButton).toBeInTheDocument();
      });
    });
  });
});
