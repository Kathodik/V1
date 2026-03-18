import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Upload, Package, Ruler, Info } from 'lucide-react';
import { AnimateOnScroll } from '../components/AnimateOnScroll';
import { useParallax } from '../hooks/useScrollAnimation';
import { metals, companyInfo } from '../data/mockData';
import { toast } from 'sonner';

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
  const scrollY = useParallax();
  const detailRef = useRef(null);

  const handleMetalSelect = (metal) => {
    setSelectedMetal(metal);
    setSelectedFinish(metal.finishes[0].id);
    setQuantity('');
    setDescription('');
    setImages([]);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) { toast.error('Maximal 5 Bilder erlaubt'); return; }
    const newImages = files.map(file => URL.createObjectURL(file));
    setImages([...images, ...newImages]);
    toast.success(`${files.length} Bild(er) hinzugefügt`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedMetal || !selectedFinish || !quantity || images.length === 0) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }
    const finish = selectedMetal.finishes.find(f => f.id === selectedFinish);
    toast.success(`Anfrage erfolgreich! ${selectedMetal.name} - ${finish.name}`);
    setSelectedMetal(null);
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
                Periodensystem der Galvanisierung
              </p>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-800 mb-4"
                data-testid="services-heading"
              >
                Wählen Sie Ihr Metall
              </h1>
              <p className="text-lg text-slate-500 max-w-xl mx-auto">
                12 Metalle in echter metallischer Optik – bewegen Sie die Maus über die Elemente
              </p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Periodic Table */}
      <section className="pb-12 relative">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
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
                {/* empty slots to position Pt and Au correctly */}
                <div className="col-start-3">
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
              </div>
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
                  </CardContent>
                </Card>
              </AnimateOnScroll>

              {/* Order Form */}
              <AnimateOnScroll variant="fadeLeft" duration="normal" delay={150}>
                <Card className="bg-white border border-slate-200 shadow-lg">
                  <CardContent className="p-8">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">Anfrage stellen</h3>
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

                      <Button type="submit" className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg rounded-full transition-all duration-300" data-testid="submit-order-btn">
                        Anfrage absenden
                      </Button>
                    </form>
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
