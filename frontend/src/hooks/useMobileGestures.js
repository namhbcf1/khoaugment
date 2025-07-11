import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { announceToScreenReader } from '../utils/accessibility';

/**
 * Custom hook for handling mobile gestures
 * Provides swipe navigation, pull-to-refresh, and other touch interactions
 */
export const useMobileGestures = ({
  onSwipeLeft,
  onSwipeRight,
  onSwipeUp,
  onSwipeDown,
  onPullToRefresh,
  enableBackSwipe = true,
  enablePullToRefresh = false,
  swipeThreshold = 50,
  velocityThreshold = 0.3
} = {}) => {
  const navigate = useNavigate();
  const touchStartRef = useRef(null);
  const touchEndRef = useRef(null);
  const isSwipingRef = useRef(false);
  const pullDistanceRef = useRef(0);

  // Handle touch start
  const handleTouchStart = useCallback((e) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
      time: Date.now()
    };
    touchEndRef.current = null;
    isSwipingRef.current = false;
    pullDistanceRef.current = 0;
  }, []);

  // Handle touch move
  const handleTouchMove = useCallback((e) => {
    if (!touchStartRef.current) return;

    const currentTouch = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };

    const deltaX = currentTouch.x - touchStartRef.current.x;
    const deltaY = currentTouch.y - touchStartRef.current.y;

    // Check if this is a swipe gesture
    if (Math.abs(deltaX) > 10 || Math.abs(deltaY) > 10) {
      isSwipingRef.current = true;
    }

    // Handle pull to refresh
    if (enablePullToRefresh && deltaY > 0 && window.scrollY === 0) {
      pullDistanceRef.current = deltaY;
      
      // Prevent default scrolling when pulling down at top
      if (deltaY > 20) {
        e.preventDefault();
      }

      // Visual feedback for pull to refresh
      if (deltaY > 80) {
        document.body.style.setProperty('--pull-distance', `${Math.min(deltaY, 120)}px`);
      }
    }
  }, [enablePullToRefresh]);

  // Handle touch end
  const handleTouchEnd = useCallback((e) => {
    if (!touchStartRef.current) return;

    touchEndRef.current = {
      x: e.changedTouches[0].clientX,
      y: e.changedTouches[0].clientY,
      time: Date.now()
    };

    const deltaX = touchEndRef.current.x - touchStartRef.current.x;
    const deltaY = touchEndRef.current.y - touchStartRef.current.y;
    const deltaTime = touchEndRef.current.time - touchStartRef.current.time;
    
    const velocityX = Math.abs(deltaX) / deltaTime;
    const velocityY = Math.abs(deltaY) / deltaTime;

    // Reset pull to refresh visual feedback
    document.body.style.removeProperty('--pull-distance');

    // Handle pull to refresh
    if (enablePullToRefresh && pullDistanceRef.current > 80 && deltaY > 0) {
      if (onPullToRefresh) {
        onPullToRefresh();
        announceToScreenReader('Đang làm mới dữ liệu', 'polite');
      }
      return;
    }

    // Check if this qualifies as a swipe
    if (!isSwipingRef.current || 
        (Math.abs(deltaX) < swipeThreshold && Math.abs(deltaY) < swipeThreshold) ||
        (velocityX < velocityThreshold && velocityY < velocityThreshold)) {
      return;
    }

    // Determine swipe direction
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) {
        // Swipe right
        if (onSwipeRight) {
          onSwipeRight();
        } else if (enableBackSwipe && deltaX > swipeThreshold * 2) {
          // Default back navigation on right swipe
          navigate(-1);
          announceToScreenReader('Đã quay lại trang trước', 'polite');
        }
      } else {
        // Swipe left
        if (onSwipeLeft) {
          onSwipeLeft();
        }
      }
    } else {
      // Vertical swipe
      if (deltaY > 0) {
        // Swipe down
        if (onSwipeDown) {
          onSwipeDown();
        }
      } else {
        // Swipe up
        if (onSwipeUp) {
          onSwipeUp();
        }
      }
    }

    // Reset refs
    touchStartRef.current = null;
    touchEndRef.current = null;
    isSwipingRef.current = false;
    pullDistanceRef.current = 0;
  }, [
    navigate,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPullToRefresh,
    enableBackSwipe,
    enablePullToRefresh,
    swipeThreshold,
    velocityThreshold
  ]);

  // Attach event listeners
  useEffect(() => {
    const element = document.body;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    isSwipingRef,
    pullDistanceRef
  };
};

/**
 * Hook for handling mobile navigation gestures specifically
 */
export const useMobileNavigation = () => {
  const navigate = useNavigate();

  const handleSwipeRight = useCallback(() => {
    // Go back on right swipe
    navigate(-1);
    announceToScreenReader('Đã quay lại trang trước', 'polite');
  }, [navigate]);

  const handleSwipeLeft = useCallback(() => {
    // Could implement forward navigation or close modals
    // For now, just announce the gesture
    announceToScreenReader('Vuốt trái được phát hiện', 'polite');
  }, []);

  useMobileGestures({
    onSwipeRight: handleSwipeRight,
    onSwipeLeft: handleSwipeLeft,
    enableBackSwipe: true,
    swipeThreshold: 100, // Require longer swipe for navigation
    velocityThreshold: 0.5
  });
};

/**
 * Hook for handling pull-to-refresh gesture
 */
export const usePullToRefresh = (onRefresh) => {
  const handlePullToRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  useMobileGestures({
    enablePullToRefresh: true,
    onPullToRefresh: handlePullToRefresh
  });
};

/**
 * Hook for handling swipe-to-delete or swipe actions on list items
 */
export const useSwipeActions = (onSwipeLeft, onSwipeRight) => {
  return useMobileGestures({
    onSwipeLeft,
    onSwipeRight,
    enableBackSwipe: false,
    swipeThreshold: 80,
    velocityThreshold: 0.4
  });
};

/**
 * Hook for detecting mobile device and touch capabilities
 */
export const useMobileDetection = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  return {
    isMobile,
    isTouchDevice,
    isIOS,
    isAndroid,
    supportsTouch: isTouchDevice
  };
};

/**
 * Hook for handling mobile keyboard events
 */
export const useMobileKeyboard = () => {
  const isKeyboardOpen = useRef(false);

  useEffect(() => {
    const handleResize = () => {
      const heightDifference = window.screen.height - window.innerHeight;
      const wasKeyboardOpen = isKeyboardOpen.current;
      
      // Keyboard is likely open if height difference is significant
      isKeyboardOpen.current = heightDifference > 150;

      if (wasKeyboardOpen !== isKeyboardOpen.current) {
        // Keyboard state changed
        const event = new CustomEvent('keyboardToggle', {
          detail: { isOpen: isKeyboardOpen.current }
        });
        window.dispatchEvent(event);

        // Announce to screen readers
        announceToScreenReader(
          isKeyboardOpen.current ? 'Bàn phím đã mở' : 'Bàn phím đã đóng',
          'polite'
        );
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    isKeyboardOpen: isKeyboardOpen.current
  };
};

export default {
  useMobileGestures,
  useMobileNavigation,
  usePullToRefresh,
  useSwipeActions,
  useMobileDetection,
  useMobileKeyboard
};
