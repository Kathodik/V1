import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { Upload, Package, Ruler, Info, PauseCircle, Bell, Save, Layers, MapPin, Boxes, ArrowRight, ShoppingCart, Minus, Plus } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { metals, companyInfo } from '../data/mockData';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import CoatingPreview from '../components/CoatingPreview';
import LegalConsent from '../components/LegalConsent';
import { useCart } from '../contexts/CartContext';
import PayPalButton from '../components/PayPalButton';
import axios from 'axios';

/* ── Per-element realistic texture config ── */
const metalTextures = {
  Cr: {
    // Chrome: mirror-polished, extremely reflective
    bg: `
      linear-gradient(135deg, #eef0f2 0%, #c4c6c8 18%, #f6f8fa 32%, #a8aaac 50%, #e8eaec 68%, #d0d2d4 82%, #f0f2f4 100%)
    `,
    overlay: `
      radial-gradient(ellipse 70% 50% at 30% 25%, rgba(255,255,255,0.65) 0%, transparent 60%),
      linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 49%, transparent 49.5%, rgba(255,255,255,0.08) 50%, transparent 100%)
    `,
    edge: '#b0b2b4',
    textColor: 'rgba(50,50,55,0.7)',
    textShadow: '1px 1px 0 rgba(255,255,255,0.8)',
    glow: 'rgba(200,205,210,0.4)',
    label: 'Hochglanz',
  },
  Co: {
    // Cobalt: dark bluish steel, slight magnetic shimmer
    bg: `
      linear-gradient(150deg, #8088a0 0%, #606878 18%, #98a0b8 34%, #505868 50%, #7880a0 68%, #687090 82%, #8890a8 100%)
    `,
    overlay: `
      radial-gradient(ellipse 60% 45% at 35% 28%, rgba(160,180,220,0.4) 0%, transparent 60%),
      repeating-linear-gradient(135deg, transparent 0px, transparent 3px, rgba(255,255,255,0.03) 3px, rgba(255,255,255,0.03) 4px)
    `,
    edge: '#4a5268',
    textColor: 'rgba(220,225,240,0.85)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    glow: 'rgba(100,110,150,0.4)',
    label: 'Stahlblau',
  },
  Ni: {
    // Nickel: warm silver-white, satin-brushed
    bg: `
      linear-gradient(140deg, #dddad0 0%, #c5c2b8 20%, #ece9e0 38%, #b5b2a8 55%, #d8d5cc 72%, #cac7be 88%, #e0ddd4 100%)
    `,
    overlay: `
      radial-gradient(ellipse 65% 50% at 32% 30%, rgba(255,255,245,0.45) 0%, transparent 55%),
      repeating-linear-gradient(180deg, transparent 0px, transparent 1px, rgba(255,255,250,0.06) 1px, rgba(255,255,250,0.06) 2px)
    `,
    edge: '#a8a59c',
    textColor: 'rgba(60,55,45,0.65)',
    textShadow: '1px 1px 0 rgba(255,255,250,0.6)',
    glow: 'rgba(180,175,165,0.35)',
    label: 'Seidenmatt',
  },
  Cu: {
    // Copper: rich warm reddish-brown, hammered patina
    bg: `
      linear-gradient(140deg, #d4855a 0%, #a85830 15%, #e8a878 30%, #924820 45%, #c87850 58%, #b06838 72%, #d89068 85%, #c07848 100%)
    `,
    overlay: `
      radial-gradient(ellipse 55% 45% at 28% 25%, rgba(255,200,150,0.45) 0%, transparent 55%),
      radial-gradient(circle at 70% 65%, rgba(120,50,20,0.15) 0%, transparent 40%),
      repeating-conic-gradient(rgba(255,255,255,0.02) 0deg, transparent 3deg, rgba(255,255,255,0.02) 6deg)
    `,
    edge: '#884020',
    textColor: 'rgba(60,20,5,0.75)',
    textShadow: '1px 1px 0 rgba(255,180,120,0.5)',
    glow: 'rgba(200,120,80,0.4)',
    label: 'Kupferton',
  },
  Zn: {
    // Zinc: blue-grey, crystalline/spangle texture
    bg: `
      linear-gradient(145deg, #c5c8d5 0%, #a5a8b8 18%, #d8dbe8 35%, #959ab0 52%, #c0c5d5 70%, #b0b5c5 85%, #ccd0dd 100%)
    `,
    overlay: `
      radial-gradient(ellipse 60% 50% at 30% 28%, rgba(220,225,240,0.45) 0%, transparent 55%),
      conic-gradient(from 45deg at 60% 50%, transparent 0deg, rgba(255,255,255,0.04) 30deg, transparent 60deg, rgba(255,255,255,0.03) 90deg, transparent 120deg, rgba(255,255,255,0.04) 180deg, transparent 210deg, rgba(255,255,255,0.03) 270deg, transparent 300deg, rgba(255,255,255,0.04) 360deg)
    `,
    edge: '#8a8d9d',
    textColor: 'rgba(40,45,60,0.7)',
    textShadow: '1px 1px 0 rgba(220,225,240,0.6)',
    glow: 'rgba(160,165,185,0.35)',
    label: 'Kristallin',
  },
  Ru: {
    // Ruthenium: dark gunmetal, dense, cold
    bg: `
      linear-gradient(135deg, #7a8898 0%, #586878 18%, #8a98a8 34%, #485868 50%, #6a7888 68%, #5a6878 82%, #7a8898 100%)
    `,
    overlay: `
      radial-gradient(ellipse 55% 45% at 35% 25%, rgba(150,170,195,0.35) 0%, transparent 55%),
      repeating-linear-gradient(160deg, transparent 0px, transparent 2px, rgba(255,255,255,0.025) 2px, rgba(255,255,255,0.025) 3px)
    `,
    edge: '#3a4858',
    textColor: 'rgba(200,215,230,0.85)',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
    glow: 'rgba(90,105,125,0.4)',
    label: 'Gunmetal',
  },
  Rh: {
    // Rhodium: brilliant white-silver, most reflective metal
    bg: `
      linear-gradient(130deg, #f4f5fa 0%, #d5d8e5 15%, #ffffff 30%, #c8cce0 48%, #f0f2f8 65%, #dddfe8 80%, #f8f9fc 100%)
    `,
    overlay: `
      radial-gradient(ellipse 70% 55% at 28% 22%, rgba(255,255,255,0.7) 0%, transparent 55%),
      linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.15) 50%, transparent 60%)
    `,
    edge: '#b8bcc8',
    textColor: 'rgba(50,55,70,0.6)',
    textShadow: '1px 1px 0 rgba(255,255,255,0.9)',
    glow: 'rgba(210,215,230,0.5)',
    label: 'Spiegelglanz',
  },
  Pd: {
    // Palladium: soft cool silver-white, subtle warmth
    bg: `
      linear-gradient(140deg, #d8dae5 0%, #b5b8c8 18%, #eaecf2 35%, #a5a8b8 52%, #d0d2dd 70%, #c0c2cd 85%, #e0e2ea 100%)
    `,
    overlay: `
      radial-gradient(ellipse 65% 48% at 30% 27%, rgba(240,242,255,0.5) 0%, transparent 58%),
      repeating-linear-gradient(90deg, transparent 0px, transparent 4px, rgba(255,255,255,0.03) 4px, rgba(255,255,255,0.03) 5px)
    `,
    edge: '#95989a',
    textColor: 'rgba(45,48,60,0.65)',
    textShadow: '1px 1px 0 rgba(240,242,255,0.7)',
    glow: 'rgba(175,180,200,0.4)',
    label: 'Sanft-Silber',
  },
  Ag: {
    // Silver: classic bright silver, polished with slight tarnish edge
    bg: `
      linear-gradient(135deg, #f2f2f0 0%, #c0c0be 12%, #fafaf8 28%, #a8a8a6 45%, #e8e8e6 62%, #d0d0ce 78%, #f5f5f3 100%)
    `,
    overlay: `
      radial-gradient(ellipse 75% 55% at 25% 20%, rgba(255,255,252,0.65) 0%, transparent 55%),
      radial-gradient(circle at 75% 80%, rgba(180,178,170,0.12) 0%, transparent 35%),
      linear-gradient(45deg, transparent 45%, rgba(255,255,255,0.12) 50%, transparent 55%)
    `,
    edge: '#a0a09e',
    textColor: 'rgba(50,50,48,0.65)',
    textShadow: '1px 1px 0 rgba(255,255,252,0.8)',
    glow: 'rgba(200,200,198,0.45)',
    label: 'Hochglanz',
  },
  Sn: {
    // Tin: dull grey-silver, matte, almost waxy
    bg: `
      linear-gradient(145deg, #d0cec6 0%, #b0aea6 20%, #e0ded6 38%, #a8a69e 55%, #cccac2 72%, #bab8b0 88%, #d8d6ce 100%)
    `,
    overlay: `
      radial-gradient(ellipse 60% 50% at 32% 30%, rgba(240,238,230,0.35) 0%, transparent 55%),
      repeating-linear-gradient(170deg, transparent 0px, transparent 2px, rgba(200,198,190,0.08) 2px, rgba(200,198,190,0.08) 3px)
    `,
    edge: '#908e86',
    textColor: 'rgba(55,55,48,0.65)',
    textShadow: '1px 1px 0 rgba(240,238,230,0.5)',
    glow: 'rgba(175,173,165,0.3)',
    label: 'Matt-Satin',
  },
  Pt: {
    // Platinum: dense cool grey-white, heavy, prestigious
    bg: `
      linear-gradient(138deg, #e2e4ec 0%, #c0c4d2 15%, #f0f2f8 30%, #b0b4c2 48%, #dde0ea 65%, #c8ccd8 80%, #e8eaf0 100%)
    `,
    overlay: `
      radial-gradient(ellipse 68% 50% at 28% 24%, rgba(245,248,255,0.55) 0%, transparent 55%),
      linear-gradient(120deg, transparent 42%, rgba(255,255,255,0.1) 50%, transparent 58%),
      repeating-linear-gradient(0deg, transparent 0px, transparent 3px, rgba(255,255,255,0.02) 3px, rgba(255,255,255,0.02) 4px)
    `,
    edge: '#9a9eb0',
    textColor: 'rgba(40,44,60,0.6)',
    textShadow: '1px 1px 0 rgba(245,248,255,0.75)',
    glow: 'rgba(190,195,215,0.45)',
    label: 'Platin-Glanz',
  },
  Au: {
    // Gold: warm, rich, unmistakable yellow-gold
    bg: `
      linear-gradient(140deg, #ffd700 0%, #c49800 12%, #ffe55c 26%, #a88200 40%, #ffd200 54%, #d4a800 68%, #ffdf30 82%, #c8a000 100%)
    `,
    overlay: `
      radial-gradient(ellipse 60% 50% at 25% 22%, rgba(255,250,180,0.55) 0%, transparent 50%),
      radial-gradient(circle at 70% 70%, rgba(150,100,0,0.1) 0%, transparent 35%),
      linear-gradient(135deg, transparent 40%, rgba(255,255,200,0.18) 50%, transparent 60%)
    `,
    edge: '#8a6800',
    textColor: 'rgba(90,60,0,0.8)',
    textShadow: '1px 1px 0 rgba(255,240,130,0.6)',
    glow: 'rgba(255,200,0,0.4)',
    label: 'Gold-Glanz',
  },
  WB: {
    // White Bronze: warm silvery-white alloy, slightly cream tinted
    bg: `
      linear-gradient(142deg, #e8e2d8 0%, #d4cec4 16%, #f2ece2 30%, #c8c2b8 46%, #e4ded4 62%, #d0cac0 78%, #ece6dc 100%)
    `,
    overlay: `
      radial-gradient(ellipse 65% 48% at 30% 26%, rgba(255,252,245,0.5) 0%, transparent 55%),
      linear-gradient(120deg, transparent 40%, rgba(255,252,240,0.12) 50%, transparent 60%),
      repeating-linear-gradient(165deg, transparent 0px, transparent 2px, rgba(210,200,180,0.06) 2px, rgba(210,200,180,0.06) 3px)
    `,
    edge: '#a89e90',
    textColor: 'rgba(70,60,45,0.7)',
    textShadow: '1px 1px 0 rgba(255,250,240,0.7)',
    glow: 'rgba(210,200,180,0.35)',
    label: 'Warm-Weiß',
  },
};

/* ── Period labels ── */
const periodLabels = { 4: 'Periode 4', 5: 'Periode 5', 6: 'Periode 6' };

/* ── 3D Element Cube Component ── */
const ElementCube = ({ metal, isSelected, onClick, index }) => {
  const [hover, setHover] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const cubeRef = useRef(null);
  const tex = metalTextures[metal.symbol] || metalTextures.Cr;

  const handleMouseMove = (e) => {
    if (!cubeRef.current) return;
    const rect = cubeRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: y * -18, y: x * 18 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setHover(false);
  };

  return (
    <div
      ref={cubeRef}
      className="cursor-pointer group"
      style={{ perspective: '800px' }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={handleMouseLeave}
      onClick={() => onClick(metal)}
      data-testid={`metal-${metal.symbol}`}
    >
      {/* Transparent glass box */}
      <div
        className={`relative rounded-xl transition-all duration-500 ${
          isSelected
            ? 'shadow-[0_0_40px_rgba(44,122,123,0.5)] ring-2 ring-[#2c7a7b]'
            : hover
            ? 'shadow-[0_20px_60px_rgba(0,0,0,0.18)]'
            : 'shadow-[0_8px_30px_rgba(0,0,0,0.08)]'
        }`}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${isSelected ? 'scale(1.08)' : hover ? 'scale(1.05)' : 'scale(1)'}`,
          transformStyle: 'preserve-3d',
          transition: 'transform 0.4s cubic-bezier(0.22,1,0.36,1), box-shadow 0.4s ease',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(245,245,248,0.85) 100%)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.9)',
        }}
      >
        {/* Glass reflection */}
        <div className="absolute inset-0 rounded-xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)', zIndex: 3 }} />

        <div className="p-3.5 relative z-[1]">
          {/* Atomic number */}
          <div className="text-[10px] font-bold text-slate-400 mb-1 tracking-wider">{metal.atomicNumber}</div>

          {/* Metal cube – the centrepiece */}
          <div className="flex justify-center mb-2.5" style={{ perspective: '500px' }}>
            <div
              className="relative w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] rounded-lg transition-transform duration-500"
              style={{
                transform: `rotateX(${tilt.x * 0.4}deg) rotateY(${tilt.y * 0.4}deg)`,
                transformStyle: 'preserve-3d',
              }}
            >
              {/* Main face – unique metallic texture */}
              <div className="absolute inset-0 rounded-lg overflow-hidden" style={{
                background: tex.bg,
                boxShadow: `inset 0 1px 3px ${tex.glow}, inset 0 -2px 5px rgba(0,0,0,0.18), 0 6px 16px rgba(0,0,0,0.14)`,
              }}>
                {/* Texture overlay (brushed lines, grain, specular) */}
                <div className="absolute inset-0 rounded-lg" style={{ background: tex.overlay }} />
                {/* Symbol */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[26px] sm:text-[32px] font-black tracking-tight" style={{ color: tex.textColor, textShadow: tex.textShadow }}>
                    {metal.symbol}
                  </span>
                </div>
              </div>

              {/* Right 3D edge */}
              <div className="absolute top-[3px] rounded-r-lg" style={{ right: '-6px', width: '6px', height: 'calc(100% - 3px)', background: `linear-gradient(to right, ${tex.edge}dd, ${tex.edge}88)`, transform: 'skewY(-3deg)', borderRadius: '0 4px 4px 0' }} />
              {/* Bottom 3D edge */}
              <div className="absolute left-[3px] rounded-b-lg" style={{ bottom: '-6px', height: '6px', width: 'calc(100% - 3px)', background: `linear-gradient(to bottom, ${tex.edge}dd, ${tex.edge}88)`, transform: 'skewX(-3deg)', borderRadius: '0 0 4px 4px' }} />
            </div>
          </div>

          {/* Metal name + texture label */}
          <div className="text-center">
            <div className="text-sm font-bold text-slate-700 leading-tight">{metal.name}</div>
            <div className="text-[9px] font-medium text-slate-400 tracking-wider uppercase mt-0.5">{tex.label}</div>
          </div>

          {/* Finishes indicator dots */}
          <div className="flex justify-center gap-1 mt-1.5">
            {metal.finishes.map((_, i) => (
              <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isSelected ? '#2c7a7b' : '#cbd5e1' }} />
            ))}
          </div>
        </div>

        {isSelected && (
          <div className="absolute -inset-[2px] rounded-xl pointer-events-none" style={{ background: 'linear-gradient(135deg, rgba(44,122,123,0.15), transparent, rgba(44,122,123,0.1))' }} />
        )}
      </div>
    </div>
  );
};

/* ── Main Services Page ── */
const Services = () => {
  const [selectedMetal, setSelectedMetal] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [acceptingOrders, setAcceptingOrders] = useState(true);
  const [pauseMessage, setPauseMessage] = useState('');
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [saveFormData, setSaveFormData] = useState({ name: '', email: '', phone: '', notify: true });
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [mobileStep, setMobileStep] = useState(1);
  const [mobileDescription, setMobileDescription] = useState('');
  const [mobileImage, setMobileImage] = useState(null);
  const [mobileContact, setMobileContact] = useState({ name: '', email: '', phone: '' });
  const [mobileAgbAccepted, setMobileAgbAccepted] = useState(false);
  const [orderAgbAccepted, setOrderAgbAccepted] = useState(false);
  const [saveAgbAccepted, setSaveAgbAccepted] = useState(false);
  const [baseMaterial, setBaseMaterial] = useState('');
  const [condition, setCondition] = useState('');
  const [orderContact, setOrderContact] = useState({ name: '', email: '', phone: '' });
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cartQty, setCartQty] = useState(1);
  const [cartMaterial, setCartMaterial] = useState(null);
  const [showClassicForm, setShowClassicForm] = useState(false);
  const { cartEnabled, products: cartProducts, materials: cartMaterials, unitPrice, addItem, clearCart, setIsOpen: setCartOpen } = useCart();
  const cartPriceOpts = { condition, base_material: cartMaterial, finish: selectedFinish };
  const scrollY = useParallax();
  const detailRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/settings/accepting-orders`)
      .then(res => {
        setAcceptingOrders(res.data.accepting_orders);
        setPauseMessage(res.data.pause_message || '');
      })
      .catch(() => {});
  }, []);

  // Rueckkehr von der Stripe-Zahlung: Session verifizieren, Warenkorb leeren
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stripeSession = params.get('stripe_session');
    if (stripeSession) {
      axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/verify/${stripeSession}`)
        .then((res) => {
          if (res.data.paid) {
            toast.success('Zahlung erfolgreich – vielen Dank für Ihre Bestellung! Sie erhalten Ihr Versandlabel per E-Mail.');
            clearCart();
          } else {
            toast.info('Die Zahlung ist noch nicht abgeschlossen.');
          }
        })
        .catch(() => toast.error('Zahlung konnte nicht überprüft werden – bitte kontaktieren Sie uns.'))
        .finally(() => window.history.replaceState({}, '', '/services'));
    } else if (params.get('zahlung') === 'abgebrochen') {
      toast.info('Zahlung abgebrochen – Ihr Warenkorb ist noch da.');
      window.history.replaceState({}, '', '/services');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMetalSelect = (metal) => {
    setSelectedMetal(metal);
    setSelectedFinish(metal.finishes[0].id);
    setQuantity('');
    setDescription('');
    setImages([]);
    setBaseMaterial('');
    setCondition('');
    setSelectedProduct(null);
    setCartQty(1);
    setCartMaterial(null);
    setShowClassicForm(false);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleAddToCart = () => {
    if (!selectedProduct) { toast.error('Bitte wählen Sie ein Produkt'); return; }
    if (!condition) { toast.error('Bitte wählen Sie den Zustand des Bauteils'); return; }
    if (!cartMaterial) { toast.error('Bitte wählen Sie das Grundmaterial'); return; }
    const finish = selectedMetal.finishes.find(f => f.id === selectedFinish);
    addItem({
      product_id: selectedProduct,
      metal: selectedMetal.symbol,
      metal_name: selectedMetal.name,
      finish: selectedFinish,
      finish_name: finish?.name,
      condition,
      base_material: cartMaterial,
      quantity: cartQty,
    });
    toast.success('Zum Warenkorb hinzugefügt');
    setCartOpen(true);
  };

  // Verkleinert ein Bild clientseitig und liefert eine data-URL, damit echte
  // Bilddaten (statt flüchtiger blob:-Verweise) an das Backend gehen.
  const downscaleImage = (file, maxDim = 1600, quality = 0.82) => new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Bild konnte nicht gelesen werden')); };
    img.src = url;
  });

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    e.target.value = '';
    if (files.length + images.length > 5) { toast.error('Maximal 5 Bilder erlaubt'); return; }
    try {
      const newImages = await Promise.all(files.map((file) => downscaleImage(file)));
      setImages((prev) => [...prev, ...newImages]);
      toast.success(`${files.length} Bild(er) hinzugefügt`);
    } catch (err) {
      console.error('Image processing failed:', err);
      toast.error('Bild konnte nicht verarbeitet werden');
    }
  };

  // Validates form and creates the backend order. Returns the created order data or null on failure.
  const createBackendOrder = async () => {
    if (!selectedMetal || !selectedFinish || !quantity || images.length === 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus und laden Sie mindestens ein Bild hoch');
      return null;
    }
    if (!condition) {
      toast.error('Bitte wählen Sie den Zustand des Bauteils');
      return null;
    }
    if (!orderContact.name || !orderContact.email) {
      toast.error('Bitte Name und E-Mail angeben');
      return null;
    }
    if (!orderAgbAccepted) {
      toast.error('Bitte stimmen Sie den rechtlichen Hinweisen zu');
      return null;
    }
    const finish = selectedMetal.finishes.find(f => f.id === selectedFinish);
    try {
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/configurator/order`, {
        order_type: 'metal_order',
        name: orderContact.name,
        email: orderContact.email,
        phone: orderContact.phone,
        description,
        metal: selectedMetal.name,
        finish: finish.name,
        quantity: String(quantity),
        base_material: baseMaterial,
        condition,
        images,
      });
      return res.data;
    } catch (err) {
      console.error('Order creation failed:', err);
      toast.error('Fehler beim Speichern des Auftrags');
      return null;
    }
  };

  const resetOrderForm = () => {
    setSelectedMetal(null);
    setOrderAgbAccepted(false);
    setBaseMaterial('');
    setCondition('');
    setOrderContact({ name: '', email: '', phone: '' });
    setQuantity('');
    setDescription('');
    setImages([]);
  };

  // Karte / Klarna / Apple Pay über Stripe Checkout (ersetzt Shopify).
  const handleStripeCheckout = async () => {
    if (!acceptingOrders) { setShowSaveForm(true); return; }
    setOrderSubmitting(true);
    try {
      const order = await createBackendOrder();
      if (!order) return;
      toast.info('Sie werden zur sicheren Zahlung weitergeleitet…');
      const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/stripe/checkout-session`, {
        internal_order_id: order.id,
      });
      window.location.href = res.data.url;
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Kartenzahlung konnte nicht gestartet werden');
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Kept for the save-form variant (when orders are paused)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptingOrders) {
      // Trigger the existing save-form path with all our validations
      if (!selectedMetal || !selectedFinish || !quantity || images.length === 0) {
        toast.error('Bitte füllen Sie alle Pflichtfelder aus');
        return;
      }
      setShowSaveForm(true);
      return;
    }
    // Active path: prefer PayPal (renders own button); user clicks Stripe CTA directly.
    await handleStripeCheckout();
  };

  const handleSaveRequest = async (e) => {
    e.preventDefault();
    if (!saveFormData.name || !saveFormData.email) {
      toast.error('Bitte Name und E-Mail angeben');
      return;
    }
    if (!saveAgbAccepted) {
      toast.error('Bitte stimmen Sie den AGB und dem Haftungsausschluss zu');
      return;
    }
    try {
      const finish = selectedMetal.finishes.find(f => f.id === selectedFinish);
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/saved-requests`, {
        name: saveFormData.name,
        email: saveFormData.email,
        phone: saveFormData.phone,
        metal: selectedMetal.name,
        finish: finish?.name || '',
        quantity: parseInt(quantity) || 1,
        message: description,
        notify_when_open: saveFormData.notify
      });
      toast.success('Anfrage gespeichert! Sie werden benachrichtigt.');
      setShowSaveForm(false);
      setSelectedMetal(null);
      setSaveFormData({ name: '', email: '', phone: '', notify: true });
      setSaveAgbAccepted(false);
    } catch (error) {
      toast.error('Fehler beim Speichern');
    }
  };

  // Group metals by period
  const period4 = metals.filter(m => m.period === 4);
  const period5 = metals.filter(m => m.period === 5);
  const period6 = metals.filter(m => m.period === 6);

  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative pt-28 pb-16 overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-4">
                Kathodik Galvanotechnik
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4"
                data-testid="services-heading"
              >
                Unsere Leistungen
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl mx-auto">
                Lohngalvanisierung, Vor-Ort-Galvanik und der KI-gestützte 3D-Konfigurator –
                drei Wege zu Ihrer perfekten Oberfläche.
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Leistungs-Übersicht */}
      <section className="pb-16" data-testid="services-overview">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: 'lohngalvanik',
                icon: Layers,
                title: 'Lohngalvanisierung',
                desc: 'Einsenden, veredeln, zurückerhalten: 12 Metalle vom Zink bis zum Rhodium – konfigurieren Sie Ihre Beschichtung direkt online.',
                cta: 'Metall wählen',
                testid: 'overview-lohngalvanik',
              },
              {
                id: 'vor-ort-galvanik',
                icon: MapPin,
                title: 'Vor-Ort-Galvanik',
                desc: 'Selektive Galvanisierung bei Ihnen vor Ort: Reparatur und Veredelung an Ort und Stelle – ohne Einsenden, ohne Demontage.',
                cta: 'Mehr erfahren',
                testid: 'overview-vor-ort',
              },
              {
                to: '/3d-configurator',
                icon: Boxes,
                title: '3D-Konfigurator',
                desc: 'Beschreiben Sie Ihr Wunschteil – unsere KI erstellt das 3D-Modell, wir kümmern uns um Fertigung und Veredelung.',
                cta: 'Konfigurator öffnen',
                testid: 'overview-3d',
              },
            ].map((s, i) => {
              const Icon = s.icon;
              const inner = (
                <Card className="h-full border border-slate-200 hover:border-[#2c7a7b]/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                  <CardContent className="p-7 flex flex-col h-full">
                    <div className="w-12 h-12 rounded-xl bg-[#2c7a7b]/10 flex items-center justify-center mb-5 group-hover:bg-[#2c7a7b]/15 transition-colors">
                      <Icon className="w-6 h-6 text-[#2c7a7b]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">{s.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed flex-1">{s.desc}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#2c7a7b] mt-5 group-hover:gap-2.5 transition-all">
                      {s.cta} <ArrowRight className="w-4 h-4" />
                    </span>
                  </CardContent>
                </Card>
              );
              return (
                <AnimateOnScroll key={s.title} variant="fadeUp" duration="slow" delay={i * 100}>
                  {s.to ? (
                    <Link to={s.to} className="block h-full" data-testid={s.testid}>{inner}</Link>
                  ) : (
                    <div
                      className="h-full"
                      data-testid={s.testid}
                      onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                    >
                      {inner}
                    </div>
                  )}
                </AnimateOnScroll>
              );
            })}
          </div>
        </div>
      </section>

      {/* Periodic Table */}
      <section id="lohngalvanik" className="pb-12 relative scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp" duration="slow">
            <div className="text-center mb-10">
              <p className="text-sm font-semibold tracking-[0.2em] uppercase text-[#2c7a7b] mb-3">
                Lohngalvanisierung · Periodensystem der Galvanisierung
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-3">
                Wählen Sie Ihr Metall
              </h2>
              <p className="text-slate-500 max-w-xl mx-auto">
                12 Metalle in echter metallischer Optik – bewegen Sie die Maus über die Elemente
              </p>
            </div>
          </AnimateOnScroll>
          <div className="max-w-5xl mx-auto" data-testid="periodic-table">
            {/* Period 4 */}
            <AnimateOnScroll variant="fadeUp" duration="slow">
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase ml-1">{periodLabels[4]}</span>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {period4.map((metal, i) => (
                  <ElementCube
                    key={metal.symbol}
                    metal={metal}
                    isSelected={selectedMetal?.symbol === metal.symbol}
                    onClick={handleMetalSelect}
                    index={i}
                  />
                ))}
              </div>
            </AnimateOnScroll>

            {/* Period 5 */}
            <AnimateOnScroll variant="fadeUp" duration="slow" delay={100}>
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase ml-1">{periodLabels[5]}</span>
              </div>
              <div className="grid grid-cols-5 gap-4 mb-8">
                {period5.map((metal, i) => (
                  <ElementCube
                    key={metal.symbol}
                    metal={metal}
                    isSelected={selectedMetal?.symbol === metal.symbol}
                    onClick={handleMetalSelect}
                    index={i + 5}
                  />
                ))}
              </div>
            </AnimateOnScroll>

            {/* Period 6 */}
            <AnimateOnScroll variant="fadeUp" duration="slow" delay={200}>
              <div className="mb-2">
                <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase ml-1">{periodLabels[6]}</span>
              </div>
              <div className="grid grid-cols-5 gap-4">
                {/* Position metals in period 6 */}
                <div className="col-start-2">
                  <ElementCube
                    metal={period6[0]}
                    isSelected={selectedMetal?.symbol === period6[0]?.symbol}
                    onClick={handleMetalSelect}
                    index={10}
                  />
                </div>
                <div>
                  <ElementCube
                    metal={period6[1]}
                    isSelected={selectedMetal?.symbol === period6[1]?.symbol}
                    onClick={handleMetalSelect}
                    index={11}
                  />
                </div>
                {period6[2] && (
                  <div>
                    <ElementCube
                      metal={period6[2]}
                      isSelected={selectedMetal?.symbol === period6[2]?.symbol}
                      onClick={handleMetalSelect}
                      index={12}
                    />
                  </div>
                )}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Schichtaufbau Info Banner */}
      <section className="pb-8 -mt-4">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <AnimateOnScroll variant="fadeUp">
            <div className="max-w-4xl mx-auto rounded-2xl border border-[#2c7a7b]/20 bg-gradient-to-r from-[#2c7a7b]/[0.04] to-white p-6 sm:p-7 shadow-sm" data-testid="schichtaufbau-info">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[#2c7a7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#2c7a7b] mb-1.5">
                    Professioneller Schichtaufbau – inklusive
                  </p>
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 leading-snug">
                    Damit deine Wunschbeschichtung ewig hält und perfekt glänzt
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Nach Erhalt deines Bauteils ermitteln wir das Grundmaterial. Je nach Bedarf tragen wir
                    vorab die optimalen <span className="font-semibold text-slate-800">Haft- und Glanzschichten</span> (z. B. Kupfer/Nickel) auf –
                    für dich <span className="font-semibold text-[#2c7a7b]">komplett ohne Aufpreis</span>.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#B87333]/15 text-[#8a4f1c]">1. Kupfer</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-slate-200 text-slate-700">2. Nickel</span>
                    <span className="text-slate-300">→</span>
                    <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-[#2c7a7b]/15 text-[#1f5658]">3. Endmetall</span>
                  </div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Mobile Dienstleistung Section */}
      <section id="vor-ort-galvanik" className="pb-20 scroll-mt-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <AnimateOnScroll variant="fadeUp" duration="slow">
              <Card className="border-2 border-[#2c7a7b]/20 bg-gradient-to-br from-[#2c7a7b]/[0.03] to-white shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="grid grid-cols-1 lg:grid-cols-2">
                    <div className="p-8 lg:p-10">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#2c7a7b]/10 text-[#2c7a7b] text-xs font-semibold tracking-wider uppercase mb-4">
                        Neu: Vor-Ort-Service
                      </div>
                      <h3 className="text-2xl font-bold text-slate-800 mb-4">
                        Vor-Ort-Galvanik
                      </h3>
                      <p className="text-slate-600 mb-6 leading-relaxed">
                        Selektive Galvanisierung direkt bei Ihnen vor Ort: Wir reparieren und
                        veredeln Oberflächen an Ort und Stelle – ganz ohne Einsenden und ohne
                        Demontage. Ideal für festverbaute, große oder empfindliche Teile.
                      </p>
                      <div className="space-y-3 mb-6">
                        {[
                          'Selektive Beschichtung – Metallauftrag exakt dort, wo er gebraucht wird',
                          'Reparatur von Verschleiß- und Korrosionsstellen an Anlagen & Maschinen',
                          'Veredelung ohne Demontage – kein Produktionsstillstand, kein Versandrisiko',
                          'Flexible Terminplanung nach Ihren Bedürfnissen'
                        ].map((item, i) => (
                          <div key={i} className="flex items-start space-x-3">
                            <div className="w-5 h-5 rounded-full bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg className="w-3 h-3 text-[#2c7a7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                              </svg>
                            </div>
                            <span className="text-sm text-slate-700">{item}</span>
                          </div>
                        ))}
                      </div>
                      {!showMobileForm ? (
                        <Button
                          onClick={() => setShowMobileForm(true)}
                          className="bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full px-6"
                          data-testid="mobile-service-cta"
                        >
                          Vor-Ort-Termin anfragen
                        </Button>
                      ) : (
                        <div className="mt-2 p-1">
                          <div className="flex items-center space-x-2 mb-4">
                            <div className="w-6 h-6 rounded-full bg-[#2c7a7b] text-white flex items-center justify-center text-xs font-bold">
                              {mobileStep}
                            </div>
                            <span className="text-sm font-semibold text-slate-600">
                              {mobileStep === 1 ? 'Einsatz beschreiben' : mobileStep === 2 ? 'Kontaktdaten' : 'Fertig'}
                            </span>
                          </div>

                          {mobileStep === 1 && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-slate-800 font-semibold mb-2 block text-sm">Was soll vor Ort erledigt werden? *</Label>
                                <Textarea
                                  value={mobileDescription}
                                  onChange={(e) => setMobileDescription(e.target.value)}
                                  placeholder="z.B. Oberflächenreparatur an einer Industrieanlage, Kamin-Beschichtung, Größe der Fläche, Zugänglichkeit..."
                                  className="bg-white border-slate-200 min-h-24 text-sm"
                                  data-testid="mobile-description"
                                />
                              </div>
                              <div>
                                <Label className="text-slate-800 font-semibold mb-2 block text-sm">Referenzbild (optional)</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:border-[#2c7a7b] transition-colors">
                                  <input type="file" accept="image/*" onChange={(e) => {
                                    const file = e.target.files[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => setMobileImage(ev.target.result);
                                      reader.readAsDataURL(file);
                                    }
                                  }} className="hidden" id="mobile-ref-upload" />
                                  <label htmlFor="mobile-ref-upload" className="cursor-pointer">
                                    {mobileImage ? (
                                      <img src={mobileImage} alt="Referenz" className="max-h-24 mx-auto rounded-lg" />
                                    ) : (
                                      <p className="text-slate-500 text-xs">Bild hochladen</p>
                                    )}
                                  </label>
                                </div>
                              </div>
                              <Button
                                onClick={() => { if (mobileDescription.trim()) setMobileStep(2); else toast.error('Bitte beschreiben Sie den Einsatz'); }}
                                className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full"
                                data-testid="mobile-next"
                              >
                                Weiter
                              </Button>
                            </div>
                          )}

                          {mobileStep === 2 && (
                            <div className="space-y-4">
                              <div>
                                <Label className="text-slate-800 font-semibold mb-2 block text-sm">Name *</Label>
                                <Input value={mobileContact.name} onChange={(e) => setMobileContact({...mobileContact, name: e.target.value})} placeholder="Ihr Name" className="bg-white border-slate-200 text-sm" data-testid="mobile-name" />
                              </div>
                              <div>
                                <Label className="text-slate-800 font-semibold mb-2 block text-sm">E-Mail *</Label>
                                <Input type="email" value={mobileContact.email} onChange={(e) => setMobileContact({...mobileContact, email: e.target.value})} placeholder="ihre@email.de" className="bg-white border-slate-200 text-sm" data-testid="mobile-email" />
                              </div>
                              <div>
                                <Label className="text-slate-800 font-semibold mb-2 block text-sm">Telefon</Label>
                                <Input type="tel" value={mobileContact.phone} onChange={(e) => setMobileContact({...mobileContact, phone: e.target.value})} placeholder="Optional" className="bg-white border-slate-200 text-sm" data-testid="mobile-phone" />
                              </div>
                              <LegalConsent checked={mobileAgbAccepted} onCheckedChange={setMobileAgbAccepted} id="agb-mobile" size="xs" />
                              <div className="flex gap-2">
                                <Button variant="outline" onClick={() => setMobileStep(1)} className="flex-1 rounded-full text-sm">Zurück</Button>
                                <Button
                                  onClick={async () => {
                                    if (!mobileContact.name || !mobileContact.email) { toast.error('Bitte Name und E-Mail angeben'); return; }
                                    if (!mobileAgbAccepted) { toast.error('Bitte stimmen Sie den AGB zu'); return; }
                                    try {
                                      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/configurator/order`, {
                                        order_type: 'mobile_service',
                                        name: mobileContact.name,
                                        email: mobileContact.email,
                                        phone: mobileContact.phone,
                                        description: mobileDescription,
                                        reference_image: mobileImage || null
                                      });
                                      setMobileStep(3);
                                      toast.success('Anfrage erfolgreich gesendet!');
                                    } catch { toast.error('Fehler beim Senden'); }
                                  }}
                                  className="flex-1 bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full text-sm"
                                  data-testid="mobile-submit"
                                >
                                  Anfrage absenden
                                </Button>
                              </div>
                            </div>
                          )}

                          {mobileStep === 3 && (
                            <div className="text-center py-4">
                              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <p className="font-semibold text-slate-800 text-sm">Anfrage gesendet!</p>
                              <p className="text-xs text-slate-500 mt-1">Wir melden uns zeitnah bei Ihnen.</p>
                              <Button variant="outline" onClick={() => { setShowMobileForm(false); setMobileStep(1); setMobileDescription(''); setMobileImage(null); setMobileContact({name:'',email:'',phone:''}); setMobileAgbAccepted(false); }} className="mt-4 rounded-full text-xs">
                                Neue Anfrage
                              </Button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="hidden lg:flex items-center justify-center p-10 bg-gradient-to-br from-slate-50 to-slate-100">
                      <div className="text-center">
                        <div className="w-32 h-32 mx-auto rounded-2xl bg-[#2c7a7b]/10 flex items-center justify-center mb-4">
                          <svg className="w-16 h-16 text-[#2c7a7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                          </svg>
                        </div>
                        <p className="text-sm font-semibold text-slate-500">Wir kommen zu Ihnen</p>
                        <p className="text-xs text-slate-400 mt-1">Bundesweit verfügbar</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Selected Metal Details & Form */}
      {selectedMetal && (
        <section className="pb-20 pt-8" ref={detailRef}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Metal Info */}
              <AnimateOnScroll variant="fadeRight" duration="normal">
                <Card className="bg-white border border-slate-200 shadow-lg h-full">
                  <CardContent className="p-8">
                    <p className="text-sm font-semibold tracking-[0.15em] uppercase text-[#2c7a7b] mb-2">
                      Ausgewählt
                    </p>
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">
                      {selectedMetal.name}-Beschichtung
                    </h3>

                    {/* Large 3D metallic preview */}
                    <div
                      className="relative w-full aspect-square rounded-xl overflow-hidden flex items-center justify-center border border-slate-100 mb-6"
                      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)' }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setRotation({
                          x: ((e.clientY - rect.top) / rect.height - 0.5) * 30,
                          y: ((e.clientX - rect.left) / rect.width - 0.5) * -30,
                        });
                      }}
                      onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                    >
                      {(() => {
                        const tex = metalTextures[selectedMetal.symbol] || metalTextures.Cr;
                        return (
                          <div
                            className="w-48 h-48 rounded-2xl transition-transform duration-300 ease-out relative"
                            style={{
                              transform: `perspective(800px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                              transformStyle: 'preserve-3d',
                              background: tex.bg,
                              boxShadow: `0 30px 80px ${tex.glow}, inset 0 2px 4px ${tex.glow}, inset 0 -3px 6px rgba(0,0,0,0.18)`,
                            }}
                          >
                            {/* Texture overlay */}
                            <div className="absolute inset-0 rounded-2xl" style={{ background: tex.overlay }} />
                            {/* Symbol */}
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-6xl font-black" style={{ color: tex.textColor, textShadow: tex.textShadow }}>
                                {selectedMetal.symbol}
                              </span>
                            </div>
                            {/* Bottom 3D edge */}
                            <div className="absolute left-1 rounded-b-2xl" style={{ bottom: '-8px', height: '8px', width: 'calc(100% - 4px)', background: `linear-gradient(to bottom, ${tex.edge}dd, ${tex.edge}88)`, transform: 'skewX(-2deg)' }} />
                            {/* Right 3D edge */}
                            <div className="absolute top-1 rounded-r-2xl" style={{ right: '-8px', width: '8px', height: 'calc(100% - 4px)', background: `linear-gradient(to right, ${tex.edge}dd, ${tex.edge}88)`, transform: 'skewY(-2deg)' }} />
                          </div>
                        );
                      })()}
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-start space-x-3">
                        <Info className="h-5 w-5 text-[#2c7a7b] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Eigenschaften</p>
                          <p className="text-sm text-slate-500">{selectedMetal.description}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3">
                        <Package className="h-5 w-5 text-[#2c7a7b] flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">Anwendungen</p>
                          <p className="text-sm text-slate-500">{selectedMetal.applications}</p>
                        </div>
                      </div>
                    </div>

                    {/* Coating Preview */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                      <p className="text-xs font-semibold tracking-[0.15em] uppercase text-[#2c7a7b] mb-1">Live-Vorschau</p>
                      <h4 className="text-base font-bold text-slate-800 mb-1">Bauteil-Simulation</h4>
                      <p className="text-xs text-slate-500 mb-4">Lade ein Foto hoch und sieh den Schichtaufbau in Aktion.</p>
                      <CoatingPreview selectedMetal={selectedMetal} />
                    </div>
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              {/* Order Form */}
              <AnimateOnScroll variant="fadeLeft" duration="normal" delay={150}>
                <Card className="bg-white border border-slate-200 shadow-lg">
                  <CardContent className="p-8">
                    {/* Paused Banner */}
                    {!acceptingOrders && (
                      <Alert className="mb-6 bg-amber-50 border-amber-300" data-testid="services-paused-banner">
                        <PauseCircle className="h-5 w-5 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <strong>Auftragsannahme pausiert</strong>
                          <p className="mt-1 text-sm">{pauseMessage || 'Wir nehmen derzeit keine neuen Aufträge an. Sie können Ihre Anfrage speichern.'}</p>
                        </AlertDescription>
                      </Alert>
                    )}

                    <h3 className="text-2xl font-bold text-slate-800 mb-6">
                      {!acceptingOrders ? 'Anfrage speichern' : (cartEnabled && !showClassicForm ? 'Preis kalkulieren' : 'Anfrage stellen')}
                    </h3>

                    {/* Save Form (when paused and user submits) */}
                    {showSaveForm ? (
                      <form onSubmit={handleSaveRequest} className="space-y-5">
                        <p className="text-sm text-slate-600 mb-4">
                          Geben Sie Ihre Kontaktdaten an, um die Anfrage zu speichern:
                        </p>
                        <div>
                          <Label className="text-slate-800 mb-2 block font-semibold">Name *</Label>
                          <Input value={saveFormData.name} onChange={(e) => setSaveFormData({...saveFormData, name: e.target.value})} placeholder="Ihr Name" className="bg-white border-slate-200" required data-testid="save-name" />
                        </div>
                        <div>
                          <Label className="text-slate-800 mb-2 block font-semibold">E-Mail *</Label>
                          <Input type="email" value={saveFormData.email} onChange={(e) => setSaveFormData({...saveFormData, email: e.target.value})} placeholder="ihre@email.de" className="bg-white border-slate-200" required data-testid="save-email" />
                        </div>
                        <div>
                          <Label className="text-slate-800 mb-2 block font-semibold">Telefon</Label>
                          <Input type="tel" value={saveFormData.phone} onChange={(e) => setSaveFormData({...saveFormData, phone: e.target.value})} placeholder="Optional" className="bg-white border-slate-200" data-testid="save-phone" />
                        </div>
                        <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <Checkbox id="notify-service" checked={saveFormData.notify} onCheckedChange={(v) => setSaveFormData({...saveFormData, notify: v})} data-testid="save-notify" />
                          <Label htmlFor="notify-service" className="text-sm text-blue-800 cursor-pointer">
                            <Bell className="h-4 w-4 inline mr-1" />
                            Benachrichtigen, sobald wieder Aufträge angenommen werden
                          </Label>
                        </div>
                        <LegalConsent checked={saveAgbAccepted} onCheckedChange={setSaveAgbAccepted} id="agb-save" />
                        <Button type="submit" className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg rounded-full" data-testid="save-request-btn">
                          <Save className="h-5 w-5 mr-2" /> Anfrage speichern
                        </Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => setShowSaveForm(false)}>
                          Zurück
                        </Button>
                      </form>
                    ) : cartEnabled && acceptingOrders && !showClassicForm ? (
                    <div className="space-y-6" data-testid="cart-order-panel">
                      {selectedMetal.finishes.length > 1 && (
                        <div>
                          <Label className="text-slate-800 mb-2 block font-semibold">Ausführung</Label>
                          <div className="flex flex-wrap gap-2">
                            {selectedMetal.finishes.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setSelectedFinish(f.id)}
                                className={`px-4 py-2 rounded-full text-sm border-2 transition-colors ${
                                  selectedFinish === f.id
                                    ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 text-[#2c7a7b] font-semibold'
                                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                                data-testid={`cart-finish-${f.id}`}
                              >
                                {f.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <Label className="text-slate-800 mb-2 block font-semibold">Zustand des Bauteils *</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'neu', label: 'Neu / Neuwertig', dot: 'bg-green-500' },
                            { id: 'leicht', label: 'Leicht oxidiert', dot: 'bg-yellow-500' },
                            { id: 'stark', label: 'Starker Rost', dot: 'bg-red-500' },
                          ].map((opt) => (
                            <button
                              key={opt.id}
                              type="button"
                              onClick={() => setCondition(opt.id)}
                              className={`p-3 rounded-xl border-2 text-left transition-all ${
                                condition === opt.id
                                  ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 shadow-sm'
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                              data-testid={`cart-condition-${opt.id}`}
                            >
                              <span className={`inline-block w-2.5 h-2.5 rounded-full ${opt.dot} mb-1`} />
                              <p className="text-xs font-semibold text-slate-700 leading-tight">{opt.label}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-800 mb-2 block font-semibold">Grundmaterial *</Label>
                        <div className="flex flex-wrap gap-2">
                          {cartMaterials.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => setCartMaterial(m.id)}
                              className={`px-3.5 py-2 rounded-full text-sm border-2 transition-colors ${
                                cartMaterial === m.id
                                  ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 text-[#2c7a7b] font-semibold'
                                  : 'border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                              data-testid={`cart-material-${m.id}`}
                            >
                              {m.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label className="text-slate-800 mb-2 block font-semibold">Produkt wählen *</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {cartProducts.map((p) => {
                            const price = unitPrice(p.id, selectedMetal.symbol, cartPriceOpts);
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setSelectedProduct(p.id)}
                                className={`text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                                  selectedProduct === p.id
                                    ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300'
                                }`}
                                data-testid={`cart-product-${p.id}`}
                              >
                                <p className="text-sm font-semibold text-slate-800 mb-1">{p.name}</p>
                                <p className="text-xs text-slate-500">
                                  {price != null ? `${price.toFixed(2).replace('.', ',')} € / Stück` : '–'}
                                </p>
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Pauschalpreis je Produktkategorie · Metall, Ausführung, Zustand und Grundmaterial bereits eingerechnet
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <Label className="text-slate-800 font-semibold">Stückzahl</Label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#2c7a7b] text-slate-600"
                            onClick={() => setCartQty(Math.max(1, cartQty - 1))}
                            data-testid="cart-qty-minus"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-10 text-center text-lg font-bold text-slate-800" data-testid="cart-qty">{cartQty}</span>
                          <button
                            type="button"
                            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center hover:border-[#2c7a7b] text-slate-600"
                            onClick={() => setCartQty(Math.min(500, cartQty + 1))}
                            data-testid="cart-qty-plus"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-5 rounded-2xl border border-[#2c7a7b]/20 bg-gradient-to-r from-[#2c7a7b]/[0.05] to-white">
                        <span className="text-sm font-semibold text-slate-600">Ihr Preis</span>
                        <span className="text-2xl font-bold text-slate-800" data-testid="cart-live-price">
                          {selectedProduct && unitPrice(selectedProduct, selectedMetal.symbol, cartPriceOpts) != null
                            ? `${(unitPrice(selectedProduct, selectedMetal.symbol, cartPriceOpts) * cartQty).toFixed(2).replace('.', ',')} €`
                            : '– €'}
                        </span>
                      </div>

                      <Button
                        type="button"
                        onClick={handleAddToCart}
                        disabled={!selectedProduct}
                        className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-base rounded-full disabled:opacity-50"
                        data-testid="cart-add-btn"
                      >
                        <ShoppingCart className="h-5 w-5 mr-2" /> In den Warenkorb
                      </Button>

                      <p className="text-xs text-slate-500 text-center">
                        Ihr Objekt ist nicht dabei?{' '}
                        <button
                          type="button"
                          className="text-[#2c7a7b] font-semibold underline underline-offset-2"
                          onClick={() => setShowClassicForm(true)}
                          data-testid="classic-form-link"
                        >
                          Individuelle Anfrage mit Foto stellen
                        </button>
                      </p>
                    </div>
                    ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {selectedMetal.finishes.length > 1 && (
                        <div>
                          <Label className="text-slate-800 mb-3 block font-semibold">Bearbeitung *</Label>
                          <RadioGroup value={selectedFinish} onValueChange={setSelectedFinish}>
                            <div className="space-y-2">
                              {selectedMetal.finishes.map((finish) => (
                                <div key={finish.id} className="flex items-start space-x-3 p-3 rounded-lg border border-slate-200 hover:border-[#2c7a7b] transition-colors">
                                  <RadioGroupItem value={finish.id} id={finish.id} className="mt-0.5" />
                                  <Label htmlFor={finish.id} className="cursor-pointer flex-1">
                                    <span className="font-semibold text-slate-800 block">{finish.name}</span>
                                    <span className="text-sm text-slate-500">{finish.description}</span>
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </RadioGroup>
                        </div>
                      )}

                      <Alert className="bg-amber-50 border-amber-200">
                        <Ruler className="h-5 w-5 text-amber-600" />
                        <AlertDescription className="text-amber-800">
                          <strong>Max. Teilegröße:</strong> {companyInfo.maxSize}
                        </AlertDescription>
                      </Alert>

                      <div>
                        <Label htmlFor="quantity" className="text-slate-800 mb-2 block font-semibold">Stückzahl *</Label>
                        <Input id="quantity" type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Anzahl der Teile" className="bg-white border-slate-200" required data-testid="quantity-input" />
                      </div>

                      <div>
                        <Label htmlFor="base-material" className="text-slate-800 mb-2 block font-semibold">
                          Grundmaterial <span className="text-slate-400 font-normal text-sm">(falls bekannt)</span>
                        </Label>
                        <Input
                          id="base-material"
                          value={baseMaterial}
                          onChange={(e) => setBaseMaterial(e.target.value)}
                          placeholder="z.B. Messing, Edelstahl 1.4301, Aluminium, Zink-Druckguss..."
                          className="bg-white border-slate-200"
                          data-testid="base-material-input"
                        />
                      </div>

                      <div>
                        <Label className="text-slate-800 mb-3 block font-semibold">Zustand des Bauteils *</Label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5" data-testid="condition-options">
                          {[
                            { id: 'neu', dot: 'bg-green-500', ring: 'ring-green-400', selectedBg: 'border-green-400 bg-green-50', label: 'Neu / Neuwertig', desc: 'Direkt bereit fürs Bad' },
                            { id: 'leicht', dot: 'bg-amber-500', ring: 'ring-amber-400', selectedBg: 'border-amber-400 bg-amber-50', label: 'Leicht oxidiert / Kratzer', desc: 'Polieren & entfetten nötig' },
                            { id: 'stark', dot: 'bg-red-500', ring: 'ring-red-400', selectedBg: 'border-red-400 bg-red-50', label: 'Starker Rost / Tiefenkratzer', desc: 'Entrostung & Schleifen' },
                          ].map((opt, idx) => (
                            <button
                              type="button"
                              key={opt.id}
                              onClick={() => setCondition(opt.id)}
                              className={`text-left p-3 rounded-xl border-2 transition-all duration-200 ${
                                condition === opt.id
                                  ? `${opt.selectedBg} shadow-sm`
                                  : 'border-slate-200 bg-white hover:border-slate-300'
                              }`}
                              data-testid={`condition-${opt.id}`}
                            >
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className={`inline-block w-3 h-3 rounded-full ${opt.dot} ${condition === opt.id ? `ring-2 ring-offset-1 ${opt.ring}` : ''}`} />
                                <span className="text-[10px] font-bold tracking-wider uppercase text-slate-500">Stufe {idx + 1}</span>
                              </div>
                              <p className="text-sm font-semibold text-slate-800 leading-tight mb-1">{opt.label}</p>
                              <p className="text-xs text-slate-500 leading-tight">{opt.desc}</p>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="description" className="text-slate-800 mb-2 block font-semibold">Beschreibung</Label>
                        <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Besondere Anforderungen..." className="bg-white border-slate-200 min-h-24" data-testid="description-input" />
                      </div>

                      <div>
                        <Label className="text-slate-800 mb-2 block font-semibold">Produktbilder * (max. 5)</Label>
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:border-[#2c7a7b] transition-colors bg-slate-50">
                          <Upload className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <span className="text-[#2c7a7b] hover:text-[#285e61] font-semibold">Bilder auswählen</span>
                            <input id="file-upload" type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                          </label>
                          <p className="text-xs text-slate-400 mt-1">PNG, JPG bis zu 10MB</p>
                        </div>
                        {images.length > 0 && (
                          <div className="grid grid-cols-5 gap-2 mt-3">
                            {images.map((img, index) => (
                              <div key={index} className="aspect-square bg-slate-100 rounded border border-slate-200 overflow-hidden">
                                <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <Alert className="bg-[#2c7a7b]/5 border-[#2c7a7b]/20">
                        <Info className="h-5 w-5 text-[#2c7a7b]" />
                        <AlertDescription className="text-slate-600">{companyInfo.shippingNote}</AlertDescription>
                      </Alert>

                      <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm font-bold text-slate-800">Ihre Kontaktdaten</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="order-name" className="text-slate-700 mb-1.5 block text-sm font-medium">Name *</Label>
                            <Input id="order-name" value={orderContact.name} onChange={(e) => setOrderContact({...orderContact, name: e.target.value})} placeholder="Vor- und Nachname" className="bg-white border-slate-200" required data-testid="order-name-input" />
                          </div>
                          <div>
                            <Label htmlFor="order-email" className="text-slate-700 mb-1.5 block text-sm font-medium">E-Mail *</Label>
                            <Input id="order-email" type="email" value={orderContact.email} onChange={(e) => setOrderContact({...orderContact, email: e.target.value})} placeholder="ihre@email.de" className="bg-white border-slate-200" required data-testid="order-email-input" />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="order-phone" className="text-slate-700 mb-1.5 block text-sm font-medium">Telefon <span className="text-slate-400 font-normal">(optional)</span></Label>
                          <Input id="order-phone" type="tel" value={orderContact.phone} onChange={(e) => setOrderContact({...orderContact, phone: e.target.value})} placeholder="+49 ..." className="bg-white border-slate-200" data-testid="order-phone-input" />
                        </div>
                      </div>

                      <LegalConsent checked={orderAgbAccepted} onCheckedChange={setOrderAgbAccepted} id="agb-order" />

                      {/* Einsende-Pauschale Info */}
                      <div className="rounded-2xl border border-[#2c7a7b]/20 bg-gradient-to-br from-[#2c7a7b]/[0.04] to-white p-5 sm:p-6" data-testid="einsende-pauschale-info">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-9 h-9 rounded-lg bg-[#2c7a7b]/10 flex items-center justify-center flex-shrink-0">
                            <svg className="w-5 h-5 text-[#2c7a7b]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </div>
                          <div>
                            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-[#2c7a7b] mb-1">Letzter Schritt – Einsende-Pauschale</p>
                            <h4 className="text-base font-bold text-slate-800 mb-1.5 leading-snug">49&nbsp;€ Anzahlung &amp; Versand-Label inkl.</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                              Mit der Bezahlung erhalten Sie automatisch ein <span className="font-semibold">vorfrankiertes Sendcloud-Versandlabel</span> per E-Mail.
                              Die 49&nbsp;€ werden in der finalen Rechnung verrechnet (Anzahlung).
                              Nach Erhalt entscheiden wir final über die Auftragsannahme.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Payment method picker (Save-form variant when paused) */}
                      {!acceptingOrders ? (
                        <Button
                          type="submit"
                          disabled={orderSubmitting}
                          className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-base rounded-full transition-all duration-300 disabled:opacity-50"
                          data-testid="submit-order-btn"
                        >
                          {orderSubmitting ? 'Wird gesendet…' : 'Anfrage speichern'}
                        </Button>
                      ) : (
                        <div className="space-y-4" data-testid="payment-block">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold tracking-[0.15em] uppercase text-slate-500">Bezahlmethode wählen</span>
                            <div className="flex-1 h-px bg-slate-200" />
                          </div>

                          {/* PayPal */}
                          <div className="rounded-xl border border-slate-200 p-4 bg-white">
                            <PayPalButton
                              disabled={!orderAgbAccepted || images.length === 0 || !quantity || !condition || !orderContact.name || !orderContact.email}
                              amount={49.0}
                              onBeforeCreate={createBackendOrder}
                              onSuccess={() => { toast.success('Vielen Dank für Ihre Bestellung!'); resetOrderForm(); }}
                            />
                            <p className="text-[11px] text-slate-400 text-center mt-2">Schnell, sicher & ohne Konto bezahlen</p>
                          </div>

                          {/* Divider */}
                          <div className="flex items-center gap-3 py-1">
                            <div className="flex-1 h-px bg-slate-200" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-400">oder</span>
                            <div className="flex-1 h-px bg-slate-200" />
                          </div>

                          {/* Stripe (Karte / Klarna / Apple Pay) */}
                          <Button
                            type="button"
                            onClick={handleStripeCheckout}
                            disabled={orderSubmitting || !orderAgbAccepted || images.length === 0 || !quantity || !condition || !orderContact.name || !orderContact.email}
                            variant="outline"
                            className="w-full border-2 border-slate-300 hover:border-[#2c7a7b] text-slate-700 py-5 text-sm rounded-full disabled:opacity-50"
                            data-testid="stripe-checkout-btn"
                          >
                            {orderSubmitting ? 'Wird vorbereitet…' : 'Mit Karte / Klarna / Apple Pay bezahlen'}
                          </Button>

                          {(!orderAgbAccepted || images.length === 0 || !quantity || !condition || !orderContact.name || !orderContact.email) && (
                            <p className="text-xs text-slate-400 text-center">
                              Bitte alle Pflichtfelder ausfüllen und mindestens 1 Bild hochladen, um zu bezahlen.
                            </p>
                          )}
                        </div>
                      )}
                    </form>
                    )}
                  </CardContent>
                </Card>
              </AnimateOnScroll>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Services;
