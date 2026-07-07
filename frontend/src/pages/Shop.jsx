import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Dialog, DialogContent, DialogTitle } from '../components/ui/dialog';
import { ShoppingCart, Gem, Truck, Sparkles, Minus, Plus, Clock } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useCart } from '../contexts/CartContext';
import { toast } from 'sonner';

const eur = (v) => `${Number(v).toFixed(2).replace('.', ',')} €`;

const Shop = () => {
  const { shopProducts, shippingFee, addItem, setIsOpen } = useCart();
  const [selected, setSelected] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [engraving, setEngraving] = useState('');
  const [choices, setChoices] = useState({});
  const [qty, setQty] = useState(1);

  const openProduct = (p) => {
    setSelected(p);
    setActiveImage(0);
    setEngraving('');
    setQty(1);
    // Standard: jeweils erste Auswahl pro Optionsgruppe
    const defaults = {};
    (p.options || []).forEach((g) => { defaults[g.name] = g.choices?.[0]?.label; });
    setChoices(defaults);
  };

  const unitPrice = () => {
    if (!selected) return 0;
    let price = selected.price_eur;
    (selected.options || []).forEach((g) => {
      const c = (g.choices || []).find((ch) => ch.label === choices[g.name]) || g.choices?.[0];
      price += Number(c?.surcharge_eur || 0);
    });
    if (engraving.trim() && selected.engraving_available) price += Number(selected.engraving_price_eur || 0);
    return Math.round(price * 100) / 100;
  };

  const handleAddToCart = () => {
    if (!selected || selected.sold) return;
    addItem({
      item_type: 'shop',
      product_id: selected.id,
      selected_options: { ...choices },
      engraving_text: selected.engraving_available ? engraving.trim() || undefined : undefined,
      quantity: qty,
    });
    toast.success('Zum Warenkorb hinzugefügt');
    setSelected(null);
    setIsOpen(true);
  };

  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <section className="relative pt-28 pb-14 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Handgefertigt auf Bestellung
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4" data-testid="shop-heading">
                Unikate aus Kupfer
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Jedes Stück wird nach Ihrer Bestellung von Hand gefertigt – Beschichtung, Färbung,
                Sockel und Beleuchtung wählen Sie selbst. Die Bilder zeigen Referenzstücke.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Produkte */}
      <section className="pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {shopProducts.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <Gem className="h-14 w-14 mx-auto mb-4 text-slate-200" />
              <p className="text-lg">Aktuell entstehen neue Stücke in der Werkstatt.</p>
              <p className="text-sm mt-1">Schauen Sie bald wieder vorbei!</p>
            </div>
          ) : (
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {shopProducts.map((p, idx) => (
                <AnimateOnScroll key={p.id} variant="fadeUp" duration="normal" delay={(idx % 3) * 100}>
                  <Card
                    className={`overflow-hidden border border-slate-200 hover:shadow-xl transition-all duration-300 group cursor-pointer h-full ${p.sold ? 'opacity-75' : ''}`}
                    onClick={() => openProduct(p)}
                    data-testid={`shop-product-${p.id}`}
                  >
                    <div className="relative aspect-square bg-slate-100 overflow-hidden">
                      {p.images?.[0] ? (
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><Gem className="h-12 w-12" /></div>
                      )}
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/90 backdrop-blur text-[#2c7a7b] text-[11px] font-bold tracking-wide uppercase shadow-sm">
                        <Sparkles className="w-3 h-3" /> Handarbeit
                      </span>
                      {p.sold && (
                        <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                          <span className="px-4 py-1.5 rounded-full bg-white text-slate-800 text-sm font-bold">Derzeit nicht bestellbar</span>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-bold text-slate-800 mb-1">{p.name}</h3>
                      {p.description && <p className="text-sm text-slate-500 line-clamp-2 mb-3">{p.description}</p>}
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-slate-800">ab {eur(p.price_eur)}</span>
                        {(p.options?.length > 0 || p.engraving_available) && !p.sold && (
                          <span className="text-[11px] text-[#2c7a7b] font-semibold">Individualisierbar</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </AnimateOnScroll>
              ))}
            </div>
          )}

          <p className="text-center text-xs text-slate-400 mt-10 flex items-center justify-center gap-1.5">
            <Truck className="w-3.5 h-3.5" /> Versand: {eur(shippingFee)} pro Bestellung · sicher verpackt
          </p>
        </div>
      </section>

      {/* Konfigurations-Dialog */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" data-testid="shop-detail">
          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="aspect-square rounded-xl overflow-hidden bg-slate-100 mb-3">
                  {selected.images?.[activeImage] ? (
                    <img src={selected.images[activeImage]} alt={selected.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300"><Gem className="h-14 w-14" /></div>
                  )}
                </div>
                {selected.images?.length > 1 && (
                  <div className="flex gap-2 flex-wrap">
                    {selected.images.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveImage(i)}
                        className={`w-14 h-14 rounded-lg overflow-hidden border-2 ${activeImage === i ? 'border-[#2c7a7b]' : 'border-transparent opacity-70'}`}
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                )}
                <p className="text-[11px] text-slate-400 mt-2">Referenzbilder – Ihr Stück wird nach Ihren Wünschen gefertigt.</p>
              </div>
              <div className="flex flex-col">
                <DialogTitle className="text-2xl font-bold text-slate-800 mb-1">{selected.name}</DialogTitle>
                <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#2c7a7b] mb-3">
                  Handgefertigt auf Bestellung
                </p>
                {selected.description && (
                  <p className="text-sm text-slate-600 leading-relaxed mb-4 whitespace-pre-line">{selected.description}</p>
                )}

                {(selected.options || []).map((group) => (
                  <div key={group.name} className="mb-4">
                    <Label className="text-slate-800 mb-1.5 block text-sm font-semibold">{group.name}</Label>
                    <div className="flex flex-wrap gap-2">
                      {(group.choices || []).map((c) => (
                        <button
                          key={c.label}
                          type="button"
                          onClick={() => setChoices((prev) => ({ ...prev, [group.name]: c.label }))}
                          className={`px-3.5 py-1.5 rounded-full text-sm border-2 transition-colors ${
                            choices[group.name] === c.label
                              ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 text-[#2c7a7b] font-semibold'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'
                          }`}
                          data-testid={`opt-${group.name}-${c.label}`}
                        >
                          {c.label}{Number(c.surcharge_eur) > 0 ? ` +${eur(c.surcharge_eur)}` : ''}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {selected.engraving_available && !selected.sold && (
                  <div className="mb-4">
                    <Label htmlFor="engraving" className="text-slate-800 mb-1.5 block text-sm font-semibold">
                      Gravur (optional{selected.engraving_price_eur > 0 ? ` · +${eur(selected.engraving_price_eur)}` : ''})
                    </Label>
                    <Input
                      id="engraving"
                      value={engraving}
                      onChange={(e) => setEngraving(e.target.value.slice(0, 60))}
                      placeholder="z. B. Für Anna – 14.02.2027"
                      className="bg-white border-slate-200"
                      data-testid="engraving-input"
                    />
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <Label className="text-slate-800 text-sm font-semibold">Stückzahl</Label>
                  <div className="flex items-center gap-2">
                    <button type="button" className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#2c7a7b] text-slate-600" onClick={() => setQty(Math.max(1, qty - 1))}>
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-bold text-slate-800" data-testid="shop-qty">{qty}</span>
                    <button type="button" className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#2c7a7b] text-slate-600" onClick={() => setQty(Math.min(20, qty + 1))}>
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="mt-auto space-y-3">
                  {selected.lead_time && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#2c7a7b]" /> Anfertigung: {selected.lead_time}
                    </p>
                  )}
                  <div className="flex items-center justify-between p-4 rounded-xl border border-[#2c7a7b]/20 bg-gradient-to-r from-[#2c7a7b]/[0.05] to-white">
                    <span className="text-sm font-semibold text-slate-600">Ihr Preis</span>
                    <span className="text-2xl font-bold text-slate-800" data-testid="shop-detail-price">{eur(unitPrice() * qty)}</span>
                  </div>
                  <Button
                    onClick={handleAddToCart}
                    disabled={selected.sold}
                    className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 rounded-full disabled:opacity-50"
                    data-testid="shop-add-btn"
                  >
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    {selected.sold ? 'Derzeit nicht bestellbar' : 'In den Warenkorb'}
                  </Button>
                  <p className="text-[11px] text-slate-400 text-center">
                    zzgl. {eur(shippingFee)} Versand · Zahlung per Karte, Klarna, Apple Pay oder PayPal
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Shop;
