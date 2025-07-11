import React, { createContext, useState, useContext, useEffect } from 'react';

/**
 * CartContext - Context provider for shopping cart functionality
 */
const CartContext = createContext();

/**
 * CartProvider component to wrap around components that need cart functionality
 * @param {object} props - Component props
 * @returns {JSX.Element} Provider component
 */
export const CartProvider = ({ children }) => {
  // Cart state
  const [items, setItems] = useState([]);
  const [discount, setDiscount] = useState({ type: 'percent', value: 0 });
  
  // Calculate totals
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const totalAmount = items.reduce((total, item) => total + item.price * item.quantity, 0);
  
  // Calculate discount amount
  const totalDiscount = discount.type === 'percent'
    ? totalAmount * (discount.value / 100)
    : discount.value;
  
  // Net amount after discount
  const netAmount = Math.max(0, totalAmount - totalDiscount);
  
  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      const savedDiscount = localStorage.getItem('cartDiscount');
      
      if (savedCart) {
        setItems(JSON.parse(savedCart));
      }
      
      if (savedDiscount) {
        setDiscount(JSON.parse(savedDiscount));
      }
    } catch (error) {
      console.error('Failed to load cart from localStorage:', error);
    }
  }, []);
  
  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
      localStorage.setItem('cartDiscount', JSON.stringify(discount));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [items, discount]);
  
  /**
   * Add an item to the cart
   * @param {object} item - The item to add
   */
  const addItem = (item) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id);
      
      if (existingItem) {
        // Update quantity if item already exists
        return prevItems.map(i => 
          i.id === item.id 
            ? { ...i, quantity: Math.min(i.quantity + item.quantity, i.maxQuantity || 9999) }
            : i
        );
      } else {
        // Add new item
        return [...prevItems, { ...item }];
      }
    });
  };
  
  /**
   * Remove an item from the cart
   * @param {string} id - ID of the item to remove
   */
  const removeItem = (id) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };
  
  /**
   * Update quantity of an item
   * @param {string} id - ID of the item to update
   * @param {number} quantity - New quantity
   */
  const updateQuantity = (id, quantity) => {
    setItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  /**
   * Apply discount to the cart
   * @param {object} discountInfo - Discount information
   * @param {string} discountInfo.type - Discount type ('percent' or 'amount')
   * @param {number} discountInfo.value - Discount value
   */
  const applyDiscount = (discountInfo) => {
    setDiscount(discountInfo);
  };
  
  /**
   * Clear all items from the cart
   */
  const clearCart = () => {
    setItems([]);
    setDiscount({ type: 'percent', value: 0 });
  };
  
  // Context value
  const value = {
    items,
    totalItems,
    totalAmount,
    totalDiscount,
    netAmount,
    discount,
    addItem,
    removeItem,
    updateQuantity,
    applyDiscount,
    clearCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

/**
 * Custom hook to use the cart context
 * @returns {object} Cart context value
 */
export const useCartContext = () => {
  const context = useContext(CartContext);
  
  if (context === undefined) {
    throw new Error('useCartContext must be used within a CartProvider');
  }
  
  return context;
}; 