import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = 'kathodik_cart';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

// Eine Position ist eindeutig über Produkt + Metall + Finish
const itemKey = (i) => `${i.product_id}|${i.metal}|${i.finish || ''}`;

export const CartProvider = ({ children }) => {
  const [pricing, setPricing] = useState(null);
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    axios.get(`${API}/pricing`)
      .then((res) => setPricing(res.data))
      .catch(() => setPricing(null));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage voll o. ä. – Warenkorb lebt dann nur im Speicher */
    }
  }, [items]);

  const cartEnabled = !!pricing?.cart_enabled;
  const products = useMemo(
    () => (pricing?.products || []).filter((p) => p.active !== false),
    [pricing]
  );
  const metalFactors = pricing?.metal_factors || {};

  const unitPrice = (productId, metalSymbol) => {
    const product = products.find((p) => p.id === productId);
    const factor = metalFactors[metalSymbol];
    if (!product || !factor) return null;
    return Math.round(product.base_price_eur * factor * 100) / 100;
  };

  const addItem = ({ product_id, metal, metal_name, finish, finish_name, quantity }) => {
    setItems((prev) => {
      const key = itemKey({ product_id, metal, finish });
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        return prev.map((i) =>
          itemKey(i) === key ? { ...i, quantity: Math.min(500, i.quantity + quantity) } : i
        );
      }
      return [...prev, { product_id, metal, metal_name, finish, finish_name, quantity }];
    });
  };

  const updateQuantity = (key, quantity) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => itemKey(i) !== key)
        : prev.map((i) => (itemKey(i) === key ? { ...i, quantity: Math.min(500, quantity) } : i))
    );
  };

  const removeItem = (key) => setItems((prev) => prev.filter((i) => itemKey(i) !== key));
  const clearCart = () => setItems([]);

  const enriched = items.map((i) => {
    const product = products.find((p) => p.id === i.product_id);
    const unit = unitPrice(i.product_id, i.metal);
    return {
      ...i,
      key: itemKey(i),
      product_name: product?.name || i.product_id,
      unit_price_eur: unit,
      line_total_eur: unit != null ? Math.round(unit * i.quantity * 100) / 100 : null,
    };
  });
  const total = Math.round(enriched.reduce((sum, i) => sum + (i.line_total_eur || 0), 0) * 100) / 100;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartEnabled,
        products,
        metalFactors,
        unitPrice,
        items: enriched,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        total,
        count,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;
