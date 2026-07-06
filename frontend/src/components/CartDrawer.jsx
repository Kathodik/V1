import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import LegalConsent from './LegalConsent';
import PayPalButton from './PayPalButton';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const eur = (v) => (v == null ? '–' : `${v.toFixed(2).replace('.', ',')} €`);

const CartDrawer = () => {
  const { items, total, updateQuantity, removeItem, clearCart, isOpen, setIsOpen } = useCart();
  const [contact, setContact] = useState({ name: '', email: '', phone: '' });
  const [agb, setAgb] = useState(false);

  const contactComplete = contact.name.trim() && contact.email.trim();
  const readyToPay = items.length > 0 && contactComplete && agb;

  const createCartOrder = async () => {
    try {
      const res = await axios.post(`${API}/cart/order`, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone || null,
        items: items.map((i) => ({
          product_id: i.product_id,
          metal: i.metal,
          finish: i.finish || null,
          finish_name: i.finish_name || null,
          condition: i.condition || null,
          base_material: i.base_material || null,
          quantity: i.quantity,
        })),
      });
      return res.data;
    } catch (err) {
      console.error('Cart order failed:', err);
      toast.error(err.response?.data?.detail || 'Auftrag konnte nicht erstellt werden');
      return null;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto" data-testid="cart-drawer">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-slate-800">
            <ShoppingCart className="w-5 h-5 text-[#2c7a7b]" /> Warenkorb
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <p className="text-sm text-slate-500 mt-8 text-center" data-testid="cart-empty">
            Ihr Warenkorb ist leer.<br />Wählen Sie auf der Leistungsseite Metall und Produkt.
          </p>
        ) : (
          <div className="mt-6 space-y-5">
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.key} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-white" data-testid="cart-item">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{item.product_name}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {item.metal_name || item.metal}
                      {item.finish_name ? ` · ${item.finish_name}` : ''}
                      {item.material_name ? ` · ${item.material_name}` : ''}
                      {item.condition ? ` · ${{ neu: 'Neuwertig', leicht: 'Leicht oxidiert', stark: 'Starker Rost' }[item.condition] || item.condition}` : ''}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">{eur(item.unit_price_eur)} / Stück</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#2c7a7b] text-slate-600"
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      aria-label="Menge verringern"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-7 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
                    <button
                      className="w-7 h-7 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#2c7a7b] text-slate-600"
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      aria-label="Menge erhöhen"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{eur(item.line_total_eur)}</p>
                    <button
                      className="text-slate-300 hover:text-red-500 mt-1"
                      onClick={() => removeItem(item.key)}
                      aria-label="Position entfernen"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-sm font-semibold text-slate-600">Gesamtsumme</span>
              <span className="text-xl font-bold text-slate-800" data-testid="cart-total">{eur(total)}</span>
            </div>
            <p className="text-[11px] text-slate-400 -mt-3">
              inkl. vorfrankiertem Versandlabel · finale Annahme nach Wareneingang
            </p>

            <div className="space-y-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <p className="text-sm font-bold text-slate-800">Ihre Kontaktdaten</p>
              <div>
                <Label htmlFor="cart-name" className="text-slate-700 mb-1 block text-xs font-medium">Name *</Label>
                <Input id="cart-name" value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} placeholder="Vor- und Nachname" className="bg-white border-slate-200" data-testid="cart-name-input" />
              </div>
              <div>
                <Label htmlFor="cart-email" className="text-slate-700 mb-1 block text-xs font-medium">E-Mail *</Label>
                <Input id="cart-email" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} placeholder="ihre@email.de" className="bg-white border-slate-200" data-testid="cart-email-input" />
              </div>
              <div>
                <Label htmlFor="cart-phone" className="text-slate-700 mb-1 block text-xs font-medium">Telefon (optional)</Label>
                <Input id="cart-phone" type="tel" value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} placeholder="+49 ..." className="bg-white border-slate-200" data-testid="cart-phone-input" />
              </div>
            </div>

            <LegalConsent checked={agb} onCheckedChange={setAgb} id="agb-cart" />

            <div className="rounded-xl border border-slate-200 p-4 bg-white">
              <PayPalButton
                disabled={!readyToPay}
                amount={total}
                onBeforeCreate={createCartOrder}
                onSuccess={() => {
                  toast.success('Vielen Dank für Ihre Bestellung! Sie erhalten Ihr Versandlabel per E-Mail.');
                  clearCart();
                  setIsOpen(false);
                }}
              />
              {!readyToPay && (
                <p className="text-xs text-slate-400 text-center mt-2">
                  Bitte Kontaktdaten ausfüllen und den rechtlichen Hinweisen zustimmen.
                </p>
              )}
            </div>

            <Button
              variant="ghost"
              className="w-full text-slate-400 hover:text-red-500 text-xs"
              onClick={clearCart}
              data-testid="cart-clear-btn"
            >
              Warenkorb leeren
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;
