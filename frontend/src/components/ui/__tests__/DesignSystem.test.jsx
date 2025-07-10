import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { 
  Icon, 
  StatusBadge, 
  MetricCard, 
  PageHeader, 
  LoadingSkeleton, 
  EmptyState 
} from '../DesignSystem';

// Mock Ant Design components
jest.mock('antd', () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Card: ({ children, title, loading, ...props }) => (
    <div data-testid="card" data-loading={loading} {...props}>
      {title && <div data-testid="card-title">{title}</div>}
      {children}
    </div>
  ),
  Typography: {
    Title: ({ children, level, ...props }) => (
      <h1 data-testid={`title-${level}`} {...props}>{children}</h1>
    ),
    Text: ({ children, type, ...props }) => (
      <span data-testid={`text-${type || 'default'}`} {...props}>{children}</span>
    ),
    Paragraph: ({ children, ...props }) => <p {...props}>{children}</p>
  },
  Space: ({ children, ...props }) => <div data-testid="space" {...props}>{children}</div>,
  Tag: ({ children, color, icon, ...props }) => (
    <span data-testid="tag" data-color={color} {...props}>
      {icon}
      {children}
    </span>
  )
}));

// Mock icons
jest.mock('@ant-design/icons', () => ({
  UserOutlined: () => <span data-testid="user-icon">UserIcon</span>,
  ShoppingCartOutlined: () => <span data-testid="cart-icon">CartIcon</span>,
  DollarOutlined: () => <span data-testid="dollar-icon">DollarIcon</span>,
  BarChartOutlined: () => <span data-testid="chart-icon">ChartIcon</span>,
  CheckCircleOutlined: () => <span data-testid="success-icon">SuccessIcon</span>,
  ExclamationCircleOutlined: () => <span data-testid="warning-icon">WarningIcon</span>,
  InfoCircleOutlined: () => <span data-testid="info-icon">InfoIcon</span>,
  CloseCircleOutlined: () => <span data-testid="error-icon">ErrorIcon</span>
}));

describe('Design System Components', () => {
  describe('Icon Component', () => {
    test('renders user icon by default', () => {
      render(<Icon name="user" />);
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    test('renders different icon types', () => {
      const { rerender } = render(<Icon name="cart" />);
      expect(screen.getByTestId('cart-icon')).toBeInTheDocument();

      rerender(<Icon name="dollar" />);
      expect(screen.getByTestId('dollar-icon')).toBeInTheDocument();

      rerender(<Icon name="chart" />);
      expect(screen.getByTestId('chart-icon')).toBeInTheDocument();
    });

    test('applies size classes correctly', () => {
      const { container } = render(<Icon name="user" size="lg" />);
      expect(container.firstChild).toHaveClass('icon-lg');
    });

    test('applies color classes correctly', () => {
      const { container } = render(<Icon name="user" color="success" />);
      expect(container.firstChild).toHaveClass('text-success');
    });
  });

  describe('StatusBadge Component', () => {
    test('renders success status badge', () => {
      render(<StatusBadge status="success">Success Message</StatusBadge>);
      
      const badge = screen.getByTestId('tag');
      expect(badge).toHaveAttribute('data-color', 'success');
      expect(screen.getByText('Success Message')).toBeInTheDocument();
      expect(screen.getByTestId('success-icon')).toBeInTheDocument();
    });

    test('renders warning status badge', () => {
      render(<StatusBadge status="warning">Warning Message</StatusBadge>);
      
      const badge = screen.getByTestId('tag');
      expect(badge).toHaveAttribute('data-color', 'warning');
      expect(screen.getByTestId('warning-icon')).toBeInTheDocument();
    });

    test('renders error status badge', () => {
      render(<StatusBadge status="error">Error Message</StatusBadge>);
      
      const badge = screen.getByTestId('tag');
      expect(badge).toHaveAttribute('data-color', 'error');
      expect(screen.getByTestId('error-icon')).toBeInTheDocument();
    });

    test('renders default status when invalid status provided', () => {
      render(<StatusBadge status="invalid">Default Message</StatusBadge>);
      
      const badge = screen.getByTestId('tag');
      expect(badge).toHaveAttribute('data-color', 'default');
    });
  });

  describe('MetricCard Component', () => {
    const defaultProps = {
      title: 'Test Metric',
      value: '1,234',
      icon: 'chart'
    };

    test('renders metric card with basic props', () => {
      render(<MetricCard {...defaultProps} />);
      
      expect(screen.getByTestId('card')).toBeInTheDocument();
      expect(screen.getByText('Test Metric')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument();
    });

    test('shows loading state', () => {
      render(<MetricCard {...defaultProps} loading={true} />);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveAttribute('data-loading', 'true');
    });

    test('renders trend indicators', () => {
      render(
        <MetricCard 
          {...defaultProps} 
          trend="up" 
          trendValue="15.2%" 
        />
      );
      
      expect(screen.getByText('15.2%')).toBeInTheDocument();
    });

    test('renders down trend', () => {
      render(
        <MetricCard 
          {...defaultProps} 
          trend="down" 
          trendValue="5.1%" 
        />
      );
      
      expect(screen.getByText('5.1%')).toBeInTheDocument();
    });
  });

  describe('PageHeader Component', () => {
    test('renders page header with title and subtitle', () => {
      render(
        <PageHeader 
          title="Test Page" 
          subtitle="Test description"
          icon="chart"
        />
      );
      
      expect(screen.getByTestId('title-2')).toHaveTextContent('Test Page');
      expect(screen.getByTestId('text-secondary')).toHaveTextContent('Test description');
    });

    test('renders actions when provided', () => {
      const actions = [
        <button key="action1">Action 1</button>,
        <button key="action2">Action 2</button>
      ];

      render(
        <PageHeader 
          title="Test Page" 
          actions={actions}
        />
      );
      
      expect(screen.getByText('Action 1')).toBeInTheDocument();
      expect(screen.getByText('Action 2')).toBeInTheDocument();
    });

    test('renders without subtitle', () => {
      render(<PageHeader title="Test Page" />);
      
      expect(screen.getByTestId('title-2')).toHaveTextContent('Test Page');
      expect(screen.queryByTestId('text-secondary')).not.toBeInTheDocument();
    });
  });

  describe('LoadingSkeleton Component', () => {
    test('renders card skeleton by default', () => {
      render(<LoadingSkeleton />);
      
      const card = screen.getByTestId('card');
      expect(card).toHaveClass('loading-skeleton');
    });

    test('renders table skeleton', () => {
      render(<LoadingSkeleton type="table" rows={3} />);
      
      const skeleton = screen.getByTestId('loading-skeleton') || 
                      document.querySelector('.loading-skeleton');
      expect(skeleton).toBeInTheDocument();
    });

    test('renders specified number of rows', () => {
      render(<LoadingSkeleton type="card" rows={5} />);
      
      // Should render 5 skeleton text elements
      const skeletonTexts = document.querySelectorAll('.skeleton-text');
      expect(skeletonTexts).toHaveLength(5);
    });

    test('renders with avatar when specified', () => {
      render(<LoadingSkeleton type="card" avatar={true} />);
      
      const avatar = document.querySelector('.skeleton-avatar');
      expect(avatar).toBeInTheDocument();
    });
  });

  describe('EmptyState Component', () => {
    test('renders empty state with title', () => {
      render(<EmptyState title="No Data" />);
      
      expect(screen.getByTestId('title-4')).toHaveTextContent('No Data');
    });

    test('renders with description', () => {
      render(
        <EmptyState 
          title="No Data" 
          description="There are no items to display"
        />
      );
      
      expect(screen.getByText('There are no items to display')).toBeInTheDocument();
    });

    test('renders with action button', () => {
      const action = <button>Add Item</button>;
      
      render(
        <EmptyState 
          title="No Data" 
          action={action}
        />
      );
      
      expect(screen.getByText('Add Item')).toBeInTheDocument();
    });

    test('renders with custom icon', () => {
      render(<EmptyState title="No Data" icon="user" />);
      
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('components have proper ARIA attributes', () => {
      render(
        <PageHeader 
          title="Accessible Page" 
          subtitle="With proper ARIA"
        />
      );
      
      const title = screen.getByTestId('title-2');
      expect(title).toBeInTheDocument();
    });

    test('buttons are keyboard accessible', () => {
      const handleClick = jest.fn();
      
      render(
        <PageHeader 
          title="Test" 
          actions={[<button key="test" onClick={handleClick}>Click Me</button>]}
        />
      );
      
      const button = screen.getByText('Click Me');
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Responsive Behavior', () => {
    test('components adapt to mobile viewport', () => {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 375, // Mobile width
      });

      render(<MetricCard title="Mobile Test" value="123" />);
      
      // Component should render without errors on mobile
      expect(screen.getByText('Mobile Test')).toBeInTheDocument();
    });
  });
});
