import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleBasedAccess from './auth/RoleBasedAccess';
import { lazyLoadWithRetry, PageLoader } from './utils/performance';
import {
  RouteGuard,
  AdminRouteGuard,
  CashierRouteGuard,
  StaffRouteGuard,
  PublicRouteGuard,
  RoleBasedRedirect,
  PermissionRouteGuard
} from './components/auth/RouteGuard';
import { PERMISSIONS } from './auth/permissions';

// Layouts - Critical, load with retry
const AdminLayout = lazyLoadWithRetry(() => import('./components/common/Layout/AdminLayout'));
const CashierLayout = lazyLoadWithRetry(() => import('./components/common/Layout/CashierLayout'));
const StaffLayout = lazyLoadWithRetry(() => import('./components/common/Layout/StaffLayout'));
const CustomerLayout = lazyLoadWithRetry(() => import('./components/common/Layout/CustomerLayout'));

// Auth Pages - Critical, load with retry
const Login = lazyLoadWithRetry(() => import('./pages/Login'));
const HomePage = lazyLoadWithRetry(() => import('./pages/HomePage'));
const Dashboard = lazyLoadWithRetry(() => import('./pages/Dashboard'));

// Customer Pages
const CustomerProductLookup = lazy(() => import('./pages/customer/CustomerLookup'));
const Terms = lazy(() => import('./pages/customer/Terms'));
const QrLookup = lazy(() => import('./pages/customer/QrLookup'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const RevenueOverview = lazy(() => import('./pages/admin/Dashboard/RevenueOverview'));
const PerformanceMetrics = lazy(() => import('./pages/admin/Dashboard/PerformanceMetrics'));

// Main Pages - High priority
const POS = lazyLoadWithRetry(() => import('./pages/POS'));
const Customers = lazyLoadWithRetry(() => import('./pages/Customers'));
const Inventory = lazyLoadWithRetry(() => import('./pages/Inventory'));
const Analytics = lazyLoadWithRetry(() => import('./pages/Analytics'));

// Secondary Pages - Standard lazy loading
const Gamification = lazy(() => import('./pages/Gamification'));
const AIFeatures = lazy(() => import('./pages/AIFeatures'));

// Products
const ProductManagement = lazy(() => import('./pages/admin/Products/ProductManagement'));
const ProductForm = lazy(() => import('./pages/admin/Products/ProductForm'));
const BulkOperations = lazy(() => import('./pages/admin/Products/BulkOperations'));
const PriceOptimization = lazy(() => import('./pages/admin/Products/PriceOptimization'));

// Inventory
const InventoryDashboard = lazy(() => import('./pages/admin/Inventory/InventoryDashboard'));
const StockMovements = lazy(() => import('./pages/admin/Inventory/StockMovements'));
const DemandForecasting = lazy(() => import('./pages/admin/Inventory/DemandForecasting'));
const WarehouseManagement = lazy(() => import('./pages/admin/Inventory/WarehouseManagement'));

// Orders
const OrderManagement = lazy(() => import('./pages/admin/Orders/OrderManagement'));
const OrderAnalytics = lazy(() => import('./pages/admin/Orders/OrderAnalytics'));
const ReturnProcessing = lazy(() => import('./pages/admin/Orders/ReturnProcessing'));

// Reports
const ReportCenter = lazy(() => import('./pages/admin/Reports/ReportCenter'));
const CustomReports = lazy(() => import('./pages/admin/Reports/CustomReports'));
const OmnichannelAnalytics = lazy(() => import('./pages/admin/Reports/OmnichannelAnalytics'));
const BusinessIntelligence = lazy(() => import('./pages/admin/Reports/BusinessIntelligence'));

// Staff Management
const StaffManagement = lazy(() => import('./pages/admin/Staff/StaffManagement'));
const PerformanceTracking = lazy(() => import('./pages/admin/Staff/PerformanceTracking'));
const GamificationConfig = lazy(() => import('./pages/admin/Staff/GamificationConfig'));
const CommissionSettings = lazy(() => import('./pages/admin/Staff/CommissionSettings'));

// Customer Management
const CustomerManagement = lazy(() => import('./pages/admin/Customers/CustomerManagement'));
const LoyaltyPrograms = lazy(() => import('./pages/admin/Customers/LoyaltyPrograms'));
const CustomerSegmentation = lazy(() => import('./pages/admin/Customers/CustomerSegmentation'));
const PersonalizationEngine = lazy(() => import('./pages/admin/Customers/PersonalizationEngine'));

// Integrations
const MarketplaceManager = lazy(() => import('./pages/admin/Integrations/MarketplaceManager'));

// Hardware
const HardwareManager = lazy(() => import('./pages/admin/Hardware/HardwareManager'));
const PaymentGateways = lazy(() => import('./pages/admin/Integrations/PaymentGateways'));
const ThirdPartyApps = lazy(() => import('./pages/admin/Integrations/ThirdPartyApps'));
const APIManagement = lazy(() => import('./pages/admin/Integrations/APIManagement'));

// Settings
const SystemSettings = lazy(() => import('./pages/admin/Settings/SystemSettings'));
const UserRoles = lazy(() => import('./pages/admin/Settings/UserRoles'));
const SecuritySettings = lazy(() => import('./pages/admin/Settings/SecuritySettings'));
const CompanyProfile = lazy(() => import('./pages/admin/Settings/CompanyProfile'));

// Cashier Pages
const POSTerminal = lazy(() => import('./pages/cashier/POS/POSTerminal'));
const ProductSelector = lazy(() => import('./pages/cashier/POS/ProductSelector'));
const CartManager = lazy(() => import('./pages/cashier/POS/CartManager'));
const PaymentProcessor = lazy(() => import('./pages/cashier/POS/PaymentProcessor'));
const ReceiptPrinter = lazy(() => import('./pages/cashier/POS/ReceiptPrinter'));
const SmartSuggestions = lazy(() => import('./pages/cashier/POS/SmartSuggestions'));

const OrderHistory = lazy(() => import('./pages/cashier/Orders/OrderHistory'));
const Returns = lazy(() => import('./pages/cashier/Orders/Returns'));
const OrderTracking = lazy(() => import('./pages/cashier/Orders/OrderTracking'));

const CustomerLookup = lazy(() => import('./pages/cashier/Customers/CustomerLookup'));
const LoyaltyPoints = lazy(() => import('./pages/cashier/Customers/LoyaltyPoints'));
const MembershipCheck = lazy(() => import('./pages/cashier/Customers/MembershipCheck'));

const ShiftStart = lazy(() => import('./pages/cashier/Session/ShiftStart'));
const ShiftEnd = lazy(() => import('./pages/cashier/Session/ShiftEnd'));
const CashCount = lazy(() => import('./pages/cashier/Session/CashCount'));
const SessionReports = lazy(() => import('./pages/cashier/Session/SessionReports'));

// Staff Pages
const PersonalDashboard = lazy(() => import('./pages/staff/Dashboard/PersonalDashboard'));
const PerformanceOverview = lazy(() => import('./pages/staff/Dashboard/PerformanceOverview'));
const CommissionTracker = lazy(() => import('./pages/staff/Dashboard/CommissionTracker'));
const GoalProgress = lazy(() => import('./pages/staff/Dashboard/GoalProgress'));

const Leaderboard = lazy(() => import('./pages/staff/Gamification/Leaderboard'));
const AchievementCenter = lazy(() => import('./pages/staff/Gamification/AchievementCenter'));
const BadgeCollection = lazy(() => import('./pages/staff/Gamification/BadgeCollection'));
const ChallengeHub = lazy(() => import('./pages/staff/Gamification/ChallengeHub'));
const RewardStore = lazy(() => import('./pages/staff/Gamification/RewardStore'));
const TeamCompetitions = lazy(() => import('./pages/staff/Gamification/TeamCompetitions'));

const MySales = lazy(() => import('./pages/staff/Sales/MySales'));
const SalesTargets = lazy(() => import('./pages/staff/Sales/SalesTargets'));
const ProductRecommendations = lazy(() => import('./pages/staff/Sales/ProductRecommendations'));
const CustomerInsights = lazy(() => import('./pages/staff/Sales/CustomerInsights'));

const TrainingCenter = lazy(() => import('./pages/staff/Training/TrainingCenter'));
const ProductKnowledge = lazy(() => import('./pages/staff/Training/ProductKnowledge'));
const SalesSkills = lazy(() => import('./pages/staff/Training/SalesSkills'));
const Certifications = lazy(() => import('./pages/staff/Training/Certifications'));

const PersonalProfile = lazy(() => import('./pages/staff/Profile/PersonalProfile'));
const PerformanceHistory = lazy(() => import('./pages/staff/Profile/PerformanceHistory'));
const CommissionHistory = lazy(() => import('./pages/staff/Profile/CommissionHistory'));
const Preferences = lazy(() => import('./pages/staff/Profile/Preferences'));

// Loading Component
const LoadingSpinner = () => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh' 
  }}>
    <Spin size="large" />
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<HomePage />} />
        
        {/* Customer Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route path="customer-lookup" element={<CustomerProductLookup />} />
          <Route path="terms" element={<Terms />} />
          <Route path="qr/:id" element={<QrLookup />} />
        </Route>
        
        {/* Admin Routes */}
        <Route path="/admin" element={
          <AdminRouteGuard>
            <AdminLayout />
          </AdminRouteGuard>
        }>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          {/* Dashboard */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="dashboard/revenue" element={<RevenueOverview />} />
          <Route path="dashboard/performance" element={<PerformanceMetrics />} />

          {/* New KhoChuan Features */}
          <Route path="pos" element={<POS />} />
          <Route path="gamification" element={<Gamification />} />
          <Route path="customers" element={<Customers />} />
          <Route path="inventory-management" element={<Inventory />} />
          <Route path="analytics" element={
            <PermissionRouteGuard permission={PERMISSIONS.ANALYTICS_VIEW}>
              <Analytics />
            </PermissionRouteGuard>
          } />
          <Route path="ai-features" element={<AIFeatures />} />
          
          {/* Products */}
          <Route path="products" element={<ProductManagement />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/edit/:id" element={<ProductForm />} />
          <Route path="products/bulk" element={<BulkOperations />} />
          <Route path="products/price-optimization" element={<PriceOptimization />} />
          
          {/* Inventory */}
          <Route path="inventory" element={<InventoryDashboard />} />
          <Route path="inventory/movements" element={<StockMovements />} />
          <Route path="inventory/forecasting" element={<DemandForecasting />} />
          <Route path="inventory/warehouse" element={<WarehouseManagement />} />
          
          {/* Orders */}
          <Route path="orders" element={<OrderManagement />} />
          <Route path="orders/analytics" element={<OrderAnalytics />} />
          <Route path="orders/returns" element={<ReturnProcessing />} />
          
          {/* Reports */}
          <Route path="reports" element={
            <PermissionRouteGuard permission={PERMISSIONS.REPORTS_VIEW}>
              <ReportCenter />
            </PermissionRouteGuard>
          } />
          <Route path="reports/custom" element={
            <PermissionRouteGuard permission={PERMISSIONS.REPORTS_CREATE}>
              <CustomReports />
            </PermissionRouteGuard>
          } />
          <Route path="reports/omnichannel" element={
            <PermissionRouteGuard permission={PERMISSIONS.ANALYTICS_VIEW}>
              <OmnichannelAnalytics />
            </PermissionRouteGuard>
          } />
          <Route path="reports/business-intelligence" element={
            <PermissionRouteGuard permission={PERMISSIONS.FINANCIAL_REPORTS}>
              <BusinessIntelligence />
            </PermissionRouteGuard>
          } />
          
          {/* Staff */}
          <Route path="staff" element={<StaffManagement />} />
          <Route path="staff/performance" element={<PerformanceTracking />} />
          <Route path="staff/gamification" element={<GamificationConfig />} />
          <Route path="staff/commissions" element={<CommissionSettings />} />
          
          {/* Customers */}
          <Route path="customers" element={<CustomerManagement />} />
          <Route path="customers/loyalty" element={<LoyaltyPrograms />} />
          <Route path="customers/segmentation" element={<CustomerSegmentation />} />
          <Route path="customers/personalization" element={<PersonalizationEngine />} />
          
          {/* Integrations */}
          <Route path="integrations" element={<MarketplaceManager />} />

          {/* Hardware */}
          <Route path="hardware" element={<HardwareManager />} />
          <Route path="integrations/payments" element={<PaymentGateways />} />
          <Route path="integrations/apps" element={<ThirdPartyApps />} />
          <Route path="integrations/api" element={<APIManagement />} />
          
          {/* Settings */}
          <Route path="settings" element={<SystemSettings />} />
          <Route path="settings/roles" element={<UserRoles />} />
          <Route path="settings/security" element={<SecuritySettings />} />
          <Route path="settings/company" element={<CompanyProfile />} />
        </Route>

        {/* Cashier Routes */}
        <Route path="/cashier" element={
          <CashierRouteGuard>
            <CashierLayout />
          </CashierRouteGuard>
        }>
          <Route index element={<Navigate to="/cashier/pos" replace />} />
          {/* POS */}
          <Route path="pos" element={<POSTerminal />} />
          <Route path="pos/products" element={<ProductSelector />} />
          <Route path="pos/cart" element={<CartManager />} />
          <Route path="pos/payment" element={<PaymentProcessor />} />
          <Route path="pos/receipt" element={<ReceiptPrinter />} />
          <Route path="pos/suggestions" element={<SmartSuggestions />} />
          
          {/* Orders */}
          <Route path="orders" element={<OrderHistory />} />
          <Route path="orders/returns" element={<Returns />} />
          <Route path="orders/tracking" element={<OrderTracking />} />
          
          {/* Customers */}
          <Route path="customers" element={<CustomerLookup />} />
          <Route path="customers/loyalty" element={<LoyaltyPoints />} />
          <Route path="customers/membership" element={<MembershipCheck />} />
          
          {/* Session */}
          <Route path="session/start" element={<ShiftStart />} />
          <Route path="session/end" element={<ShiftEnd />} />
          <Route path="session/cash" element={<CashCount />} />
          <Route path="session/reports" element={<SessionReports />} />
        </Route>

        {/* Staff Routes */}
        <Route path="/staff" element={
          <StaffRouteGuard>
            <StaffLayout />
          </StaffRouteGuard>
        }>
          <Route index element={<Navigate to="/staff/dashboard" replace />} />
          {/* Dashboard */}
          <Route path="dashboard" element={<PersonalDashboard />} />
          <Route path="dashboard/performance" element={<PerformanceOverview />} />
          <Route path="dashboard/commission" element={<CommissionTracker />} />
          <Route path="dashboard/goals" element={<GoalProgress />} />
          
          {/* Gamification */}
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="achievements" element={<AchievementCenter />} />
          <Route path="badges" element={<BadgeCollection />} />
          <Route path="challenges" element={<ChallengeHub />} />
          <Route path="rewards" element={<RewardStore />} />
          <Route path="competitions" element={<TeamCompetitions />} />
          
          {/* Sales */}
          <Route path="sales" element={<MySales />} />
          <Route path="sales/targets" element={<SalesTargets />} />
          <Route path="sales/recommendations" element={<ProductRecommendations />} />
          <Route path="sales/customers" element={<CustomerInsights />} />
          
          {/* Training */}
          <Route path="training" element={<TrainingCenter />} />
          <Route path="training/products" element={<ProductKnowledge />} />
          <Route path="training/skills" element={<SalesSkills />} />
          <Route path="training/certifications" element={<Certifications />} />
          
          {/* Profile */}
          <Route path="profile" element={<PersonalProfile />} />
          <Route path="profile/performance" element={<PerformanceHistory />} />
          <Route path="profile/commission" element={<CommissionHistory />} />
          <Route path="profile/preferences" element={<Preferences />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes; 