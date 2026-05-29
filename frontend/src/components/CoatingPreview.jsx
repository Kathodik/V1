import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Upload, Loader2, CheckCircle2, X, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

// Final layer color per metal symbol — used for the color overlay
const FINAL_LOOK = {
  Cr: { color: '#C0C5CB', brightness: 1.3, contrast: 1.4, label: 'Hochglanz-Chrom' },
  Co: { color: '#8088a0', brightness: 1.1, contrast: 1.25, label: 'Stahlblau-Cobalt' },
  Ni: { color: '#d4d2c8', brightness: 1.25, contrast: 1.3, label: 'Seidenmatt-Nickel' },
  Cu: { color: '#B87333', brightness: 1.15, contrast: 1.25, label: 'Kupfer-Glanz' },
  Zn: { color: '#c5c8d5', brightness: 1.15, contrast: 1.2, label: 'Kristallin-Zink' },
  Ru: { color: '#7a8898', brightness: 1.05, contrast: 1.3, label: 'Gunmetal-Ruthenium' },
  Rh: { color: '#f4f5fa', brightness: 1.45, contrast: 1.4, label: 'Spiegelglanz-Rhodium' },
  Pd: { color: '#d8dae5', brightness: 1.25, contrast: 1.25, label: 'Palladium-Silber' },
  Ag: { color: '#e8e8e6', brightness: 1.35, contrast: 1.3, label: 'Silber-Hochglanz' },
  Sn: { color: '#d0cec6', brightness: 1.1, contrast: 1.15, label: 'Matt-Zinn' },
  Pt: { color: '#e6e8ec', brightness: 1.3, contrast: 1.3, label: 'Platin-Glanz' },
  Au: { color: '#FFD700', brightness: 1.2, contrast: 1.3, label: 'Gold-Finish' },
  WB: { color: '#e8e2d8', brightness: 1.25, contrast: 1.25, label: 'Weiß-Bronze' },
};

const STEPS = [
  { id: 1, name: 'Kupfer-Haftgrund', desc: 'Aktivieren & Verkupfern' },
  { id: 2, name: 'Glanz-Nickel', desc: 'Korrosionsschutz & Einebnung' },
  { id: 3, name: 'Endmetall', desc: 'Finale Beschichtung' },
];

const CoatingPreview = ({ selectedMetal }) => {
  const [originalImage, setOriginalImage] = useState(null);
  const [cutoutImage, setCutoutImage] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(0); // 0=ready, 1=copper, 2=nickel, 3=final, 4=done
  const [animating, setAnimating] = useState(false);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Bitte ein Bild hochladen');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('Bild zu groß (max. 10 MB)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => setOriginalImage(ev.target.result);
    reader.readAsDataURL(file);

    setProcessing(true);
    setCutoutImage(null);
    setStep(0);
    toast.info('Bauteil wird freigestellt – das dauert einen Moment…');

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await axios.post(`${API}/coating/remove-background`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000,
      });
      const dataUrl = `data:image/png;base64,${res.data.image_base64}`;
      setCutoutImage(dataUrl);
      toast.success('Bauteil erfolgreich freigestellt');
    } catch (err) {
      console.error('Background removal failed:', err);
      const fallbackReader = new FileReader();
      fallbackReader.onload = (ev) => setCutoutImage(ev.target.result);
      fallbackReader.readAsDataURL(file);
      toast.warning('Automatisches Freistellen nicht möglich – Originalbild wird verwendet');
    } finally {
      setProcessing(false);
    }
  };

  const startAnimation = () => {
    if (!cutoutImage || !selectedMetal) return;
    clearTimers();
    setStep(1);
    setAnimating(true);
    timersRef.current.push(setTimeout(() => setStep(2), 1500));
    timersRef.current.push(setTimeout(() => setStep(3), 3000));
    timersRef.current.push(setTimeout(() => { setStep(4); setAnimating(false); }, 5000));
  };

  // Auto-start animation when a metal gets selected and image is ready
  useEffect(() => {
    if (cutoutImage && selectedMetal) {
      clearTimers();
      setStep(0);
      const t = setTimeout(startAnimation, 250);
      timersRef.current.push(t);
    }
    return () => clearTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMetal?.symbol, cutoutImage]);

  const resetAll = () => {
    clearTimers();
    setOriginalImage(null);
    setCutoutImage(null);
    setStep(0);
    setAnimating(false);
  };

  const replay = () => {
    if (!cutoutImage || !selectedMetal) return;
    setStep(0);
    setTimeout(startAnimation, 100);
  };

  const finalLook = FINAL_LOOK[selectedMetal?.symbol] || FINAL_LOOK.Au;

  // Overlay opacity per step
  const copperOpacity = step === 1 ? 0.75 : 0;
  const nickelActive = step >= 2;
  const finalActive = step >= 3;

  return (
    <div className="space-y-5" data-testid="coating-preview">
      {/* Upload box */}
      {!cutoutImage && !processing && (
        <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center hover:border-[#2c7a7b] transition-colors bg-slate-50/50">
          <input type="file" accept="image/*" onChange={handleUpload} className="hidden" id="coating-upload" data-testid="coating-upload-input" />
          <label htmlFor="coating-upload" className="cursor-pointer block">
            <div className="w-14 h-14 rounded-2xl bg-[#2c7a7b]/10 flex items-center justify-center mx-auto mb-4">
              <Upload className="h-7 w-7 text-[#2c7a7b]" />
            </div>
            <p className="text-slate-800 font-semibold mb-1">Foto Ihres Bauteils hochladen</p>
            <p className="text-sm text-slate-500">Wir stellen es automatisch frei und simulieren die Beschichtung</p>
            <p className="text-xs text-slate-400 mt-3">JPG, PNG, WEBP · max. 10 MB</p>
          </label>
        </div>
      )}

      {/* Processing */}
      {processing && (
        <div className="border-2 border-slate-200 rounded-2xl p-12 text-center bg-slate-50">
          <Loader2 className="h-10 w-10 text-[#2c7a7b] animate-spin mx-auto mb-4" />
          <p className="text-slate-800 font-semibold">Bauteil wird freigestellt…</p>
          <p className="text-sm text-slate-500 mt-1">Bitte einen Moment Geduld (10-20 Sekunden beim ersten Mal)</p>
        </div>
      )}

      {/* Preview with animated layers */}
      {cutoutImage && !processing && (
        <div className="space-y-4">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-100 border border-slate-200 shadow-xl" data-testid="coating-canvas">
            {/* Backdrop pattern */}
            <div className="absolute inset-0 opacity-[0.04]" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, #2c7a7b 1.5px, transparent 0)',
              backgroundSize: '24px 24px',
            }} />

            {/* The cutout image - base layer */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="relative w-full h-full">
                <img
                  src={cutoutImage}
                  alt="Bauteil"
                  className="w-full h-full object-contain transition-all duration-700"
                  style={{
                    filter: nickelActive
                      ? `brightness(${finalActive ? finalLook.brightness : 1.4}) contrast(${finalActive ? finalLook.contrast : 1.35})`
                      : 'none',
                  }}
                />

                {/* Copper layer overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
                  style={{
                    backgroundColor: '#B87333',
                    mixBlendMode: 'color',
                    opacity: copperOpacity,
                    WebkitMaskImage: `url(${cutoutImage})`,
                    maskImage: `url(${cutoutImage})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />

                {/* Nickel layer - bright silver, fades in when step >= 2 */}
                <div
                  className="absolute inset-0 transition-opacity duration-1000 pointer-events-none"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(220,220,220,0.2) 50%, rgba(255,255,255,0.3) 100%)',
                    mixBlendMode: 'screen',
                    opacity: nickelActive && !finalActive ? 0.7 : (nickelActive ? 0.3 : 0),
                    WebkitMaskImage: `url(${cutoutImage})`,
                    maskImage: `url(${cutoutImage})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />

                {/* Final metal color overlay */}
                <div
                  className="absolute inset-0 transition-opacity duration-1500 pointer-events-none"
                  style={{
                    backgroundColor: finalLook.color,
                    mixBlendMode: 'color',
                    opacity: finalActive ? 0.7 : 0,
                    WebkitMaskImage: `url(${cutoutImage})`,
                    maskImage: `url(${cutoutImage})`,
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />

                {/* Light sweep reflex */}
                {finalActive && (
                  <div
                    className="absolute inset-0 pointer-events-none coating-sweep"
                    style={{
                      WebkitMaskImage: `url(${cutoutImage})`,
                      maskImage: `url(${cutoutImage})`,
                      WebkitMaskSize: 'contain',
                      maskSize: 'contain',
                      WebkitMaskRepeat: 'no-repeat',
                      maskRepeat: 'no-repeat',
                      WebkitMaskPosition: 'center',
                      maskPosition: 'center',
                    }}
                  />
                )}
              </div>
            </div>

            {/* Status badge (top-left) */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between gap-3 pointer-events-none">
              {animating && step > 0 && step < 4 && (
                <div className="bg-white/95 backdrop-blur rounded-full px-4 py-2 shadow-md flex items-center gap-2 text-xs sm:text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-[#2c7a7b] flex-shrink-0" />
                  <span className="text-slate-700 font-medium">
                    Schritt {step}: {STEPS[step - 1]?.name}…
                  </span>
                </div>
              )}
              {step === 4 && (
                <div className="bg-green-500/95 backdrop-blur rounded-full px-4 py-2 shadow-md flex items-center gap-2 text-xs sm:text-sm" data-testid="coating-complete-badge">
                  <CheckCircle2 className="h-4 w-4 text-white flex-shrink-0" />
                  <span className="text-white font-semibold">{finalLook.label} aufgetragen</span>
                </div>
              )}
              <button
                onClick={resetAll}
                className="ml-auto w-8 h-8 rounded-full bg-white/90 backdrop-blur shadow-md flex items-center justify-center hover:bg-white transition-colors pointer-events-auto"
                data-testid="coating-reset"
                title="Neues Bild"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>

            {/* Replay button (bottom-right) - visible when done */}
            {step === 4 && (
              <button
                onClick={replay}
                className="absolute bottom-4 right-4 px-3 py-2 rounded-full bg-white/95 backdrop-blur shadow-md flex items-center gap-2 text-xs font-medium text-slate-700 hover:bg-white transition-colors"
                data-testid="coating-replay"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Erneut abspielen
              </button>
            )}
          </div>

          {/* Layer timeline / checklist */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3" data-testid="coating-timeline">
            {STEPS.map((s, i) => {
              const isLast = i === 2;
              const labelOverride = isLast && selectedMetal ? selectedMetal.name : s.name;
              const active = step >= s.id;
              const current = step === s.id && animating;
              return (
                <div
                  key={s.id}
                  className={`rounded-xl border-2 p-3 transition-all duration-500 ${
                    active
                      ? 'border-[#2c7a7b] bg-[#2c7a7b]/5 shadow-sm'
                      : 'border-slate-200 bg-white opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                      active ? 'bg-[#2c7a7b] text-white' : 'bg-slate-200 text-slate-400'
                    }`}>
                      {active ? (
                        current ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <span className="text-[10px] font-bold">{s.id}</span>
                      )}
                    </div>
                    <p className={`text-xs sm:text-sm font-bold ${active ? 'text-slate-800' : 'text-slate-400'}`}>
                      {labelOverride}
                    </p>
                  </div>
                  <p className={`text-[10px] sm:text-xs leading-tight ${active ? 'text-slate-500' : 'text-slate-400'}`}>
                    {s.desc}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-slate-400 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="h-3 w-3" />
            Simulation – das tatsächliche Ergebnis kann je nach Grundmaterial leicht abweichen
          </p>
        </div>
      )}
    </div>
  );
};

export default CoatingPreview;
