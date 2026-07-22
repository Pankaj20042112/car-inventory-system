import React, { createContext, useState, useEffect } from 'react';
import { checkoutCart } from '../services/vehicalService';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cart');
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (e) {
      console.error(e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (vehicle) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === vehicle.id);
      if (existingItem) {
        // Enforce stock warning
        if (existingItem.cartQuantity >= vehicle.quantity) {
          return prevCart; // Can't add more than available in-stock quantity
        }
        return prevCart.map((item) =>
          item.id === vehicle.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      }
      return [...prevCart, { ...vehicle, cartQuantity: 1 }];
    });
  };

  const removeFromCart = (vehicleId) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === vehicleId);
      if (existingItem) {
        if (existingItem.cartQuantity > 1) {
          return prevCart.map((item) =>
            item.id === vehicleId
              ? { ...item, cartQuantity: item.cartQuantity - 1 }
              : item
          );
        }
        return prevCart.filter((item) => item.id !== vehicleId);
      }
      return prevCart;
    });
  };

  const removeFullyFromCart = (vehicleId) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== vehicleId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const executeCheckout = async () => {
    // Build list of vehicle IDs based on their quantities in the cart
    const ids = [];
    cart.forEach((item) => {
      for (let i = 0; i < item.cartQuantity; i++) {
        ids.push(item.id);
      }
    });

    if (ids.length === 0) return null;

    const data = await checkoutCart(ids);
    clearCart();
    return data.purchases;
  };

  const cartCount = cart.reduce((sum, item) => sum + item.cartQuantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.cartQuantity * item.price, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        removeFullyFromCart,
        clearCart,
        executeCheckout,
        cartCount,
        cartTotal
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
