import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const STORAGE_KEY = 'kathodik_cart';

const CartContext = createContext(null);

export const useCart = () => useContext(CartContext);

// Eine Position ist eindeutig über Typ + Produkt + Metall + Finish + Zustand + Material + Gravur
const itemKey = (i) => `${i.item_type || 'coating'}|${i.product_id}|${i.metal || ''}|${i.finish || ''}|${i.condition || ''}|${i.base_material || ''}|${i.engraving_text || ''}`;

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

  const [shopProducts, setShopProducts] = useState([]);
  const [shippingFee, setShippingFee] = useState(0);

  useEffect(() => {
    axios.get(`${API}/pricing`)
      .then((res) => setPricing(res.data))
      .catch(() => setPricing(null));
    axios.get(`${API}/shop/products`)
      .then((res) => setShopProducts(res.data || []))
      .catch(() => setShopProducts([]));
    axios.get(`${API}/shop/settings`)
      .then((res) => setShippingFee(res.data?.shipping_fee_eur || 0))
      .catch(() => setShippingFee(0));
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
  const conditionFactors = pricing?.condition_factors || {};
  const materials = pricing?.materials || [];
  const finishFactors = pricing?.finish_factors || {};

  const unitPrice = (productId, metalSymbol, opts = {}) => {
    const product = products.find((p) => p.id === productId);
    const factor = metalFactors[metalSymbol];
    if (!product || !factor) return null;
    const condFactor = opts.condition ? (conditionFactors[opts.condition] || 1.0) : 1.0;
    const material = materials.find((m) => m.id === opts.base_material);
    const matFactor = material ? material.factor : 1.0;
    const finFactor = opts.finish ? (finishFactors[opts.finish] || 1.0) : 1.0;
    return Math.round(product.base_price_eur * factor * condFactor * matFactor * finFactor * 100) / 100;
  };

  const addItem = ({ item_type = 'coating', product_id, metal, metal_name, finish, finish_name, condition, base_material, engraving_text, quantity }) => {
    setItems((prev) => {
      const entry = { item_type, product_id, metal, metal_name, finish, finish_name, condition, base_material, engraving_text, quantity };
      const key = itemKey(entry);
      const existing = prev.find((i) => itemKey(i) === key);
      if (existing) {
        if (item_type === 'shop') return prev; // Unikat: bleibt bei 1
        return prev.map((i) =>
          itemKey(i) === key ? { ...i, quantity: Math.min(500, i.quantity + quantity) } : i
        );
      }
      return [...prev, item_type === 'shop' ? { ...entry, quantity: 1 } : entry];
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
    if (i.item_type === 'shop') {
      const sp = shopProducts.find((p) => p.id === i.product_id);
      const unit = sp
        ? Math.round((sp.price_eur + (i.engraving_text ? (sp.engraving_price_eur || 0) : 0)) * 100) / 100
        : null;
      return {
        ...i,
        key: itemKey(i),
        product_name: sp?.name || 'Shop-Produkt',
        image: sp?.images?.[0],
        sold: sp ? !!sp.sold : false,
        unit_price_eur: unit,
        line_total_eur: unit,
      };
    }
    const product = products.find((p) => p.id === i.product_id);
    const unit = unitPrice(i.product_id, i.metal, { condition: i.condition, base_material: i.base_material, finish: i.finish });
    const material = materials.find((m) => m.id === i.base_material);
    return {
      ...i,
      key: itemKey(i),
      product_name: product?.name || i.product_id,
      material_name: material?.name,
      unit_price_eur: unit,
      line_total_eur: unit != null ? Math.round(unit * i.quantity * 100) / 100 : null,
    };
  });
  const hasShopItems = enriched.some((i) => i.item_type === 'shop');
  const itemsTotal = Math.round(enriched.reduce((sum, i) => sum + (i.line_total_eur || 0), 0) * 100) / 100;
  const total = Math.round((itemsTotal + (hasShopItems ? shippingFee : 0)) * 100) / 100;
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cartEnabled,
        products,
        metalFactors,
        conditionFactors,
        materials,
        finishFactors,
        unitPrice,
        items: enriched,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        total,
        itemsTotal,
        shippingFee,
        hasShopItems,
        shopProducts,
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
