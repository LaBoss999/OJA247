import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    try {
      const raw = localStorage.getItem("oja_cart");
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("oja_cart", JSON.stringify(cart));
    } catch {}
  }, [cart]);

  const addToCart = (product, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.productId === product._id);
      if (existing) {
        return prev.map((p) =>
          p.productId === product._id ? { ...p, qty: p.qty + qty } : p
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          qty,
          businessId: product.businessId || null,
        },
      ];
    });
  };

  const updateQty = (productId, qty) =>
    setCart((prev) => prev.map(p => p.productId === productId ? { ...p, qty } : p));

  const removeFromCart = (productId) =>
    setCart((prev) => prev.filter((p) => p.productId !== productId));

  const clearCart = () => {
    setCart([]);
    try { localStorage.removeItem("oja_cart"); } catch {}
  };

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, updateQty, removeFromCart, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
};
