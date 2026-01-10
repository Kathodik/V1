import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Alert, AlertDescription } from '../components/ui/alert';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Upload, Package, Ruler, Info } from 'lucide-react';
import { metals, companyInfo } from '../data/mockData';
import { toast } from 'sonner';

const Services = () => {
  const [selectedMetal, setSelectedMetal] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMetalSelect = (metal) => {
    setSelectedMetal(metal);
    setSelectedFinish(metal.finishes[0].id);
    setQuantity('');
    setDescription('');
    setImages([]);
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) {
      toast.error('Maximal 5 Bilder erlaubt');
      return;
    }
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
    toast.success(`Anfrage erfolgreich übermittelt! ${selectedMetal.name} - ${finish.name}`);
    setSelectedMetal(null);
    setSelectedFinish(null);
    setQuantity('');
    setDescription('');
    setImages([]);
  };

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setMousePosition({ x, y });
  };

  // Get metal grid position
  const getMetalPosition = (metal) => {
    const positions = {
      'Cr': { row: 1, col: 1 },
      'Ni': { row: 1, col: 2 },
      'Cu': { row: 1, col: 3 },
      'Zn': { row: 1, col: 4 },
      'Ru': { row: 2, col: 1 },
      'Ag': { row: 2, col: 3 },
      'Sn': { row: 2, col: 4 },
      'Au': { row: 3, col: 3 }
    };
    return positions[metal.symbol] || { row: 1, col: 1 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4">
            Wählen Sie Ihr <span className="text-[#2c7a7b]">Metall</span>
          </h1>
          <p className="text-xl text-slate-600">
            Bewegen Sie die Maus über das Periodensystem
          </p>
        </div>

        {/* Periodic Table with 3D Background */}
        <div className="mb-12 relative">
          <div 
            className="max-w-5xl mx-auto relative"
            onMouseMove={handleMouseMove}
            style={{ perspective: '1000px' }}
          >
            {/* 3D Background Metal Object */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div 
                className="w-96 h-96 transition-all duration-700 ease-out"
                style={{
                  transform: `
                    perspective(1000px) 
                    rotateX(${(mousePosition.y - 0.5) * -20}deg) 
                    rotateY(${(mousePosition.x - 0.5) * 20}deg)
                    scale(${selectedMetal ? 1.2 : 0.8})
                  `,
                  opacity: selectedMetal ? 1 : 0.3,
                  transformStyle: 'preserve-3d'
                }}
              >
                <div 
                  className="w-full h-full rounded-3xl shadow-2xl"
                  style={{
                    background: selectedMetal 
                      ? `linear-gradient(135deg, ${selectedMetal.color} 0%, ${selectedMetal.color}cc 100%)`
                      : 'linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%)',
                    boxShadow: selectedMetal 
                      ? `0 30px 90px ${selectedMetal.color}88, inset 0 0 60px ${selectedMetal.color}44`
                      : '0 30px 90px rgba(0,0,0,0.2)'
                  }}
                >
                  <div className="w-full h-full rounded-3xl bg-gradient-to-br from-white/40 to-transparent"></div>
                </div>
              </div>
            </div>

            {/* Periodic Table Grid */}
            <div className="relative z-10 grid grid-cols-4 gap-4" style={{ gridTemplateRows: 'repeat(3, 1fr)' }}>
              {metals.map((metal) => {
                const pos = getMetalPosition(metal);
                const isSelected = selectedMetal?.symbol === metal.symbol;
                const distance = Math.sqrt(
                  Math.pow((pos.col - 2.5) / 2.5, 2) + 
                  Math.pow((pos.row - 2) / 2, 2)
                );
                const parallaxX = (mousePosition.x - 0.5) * 30 * (1 - distance);
                const parallaxY = (mousePosition.y - 0.5) * 30 * (1 - distance);

                return (
                  <div
                    key={metal.symbol}
                    style={{ 
                      gridColumn: pos.col, 
                      gridRow: pos.row,
                      transform: `translate(${parallaxX}px, ${parallaxY}px)`,
                      transition: 'transform 0.3s ease-out'
                    }}
                  >
                    <Card
                      className={`cursor-pointer transition-all duration-500 backdrop-blur-sm ${
                        isSelected
                          ? 'bg-[#2c7a7b]/90 border-[#2c7a7b] scale-110 shadow-2xl shadow-[#2c7a7b]/50'
                          : 'bg-white/60 border-slate-300/50 hover:bg-white/80 hover:border-[#2c7a7b]/50 hover:scale-105 hover:shadow-xl'
                      }`}
                      onClick={() => handleMetalSelect(metal)}
                      style={{
                        transform: `
                          ${isSelected ? 'translateZ(20px)' : 'translateZ(0px)'}
                          rotateX(${(mousePosition.y - 0.5) * -5}deg)
                          rotateY(${(mousePosition.x - 0.5) * 5}deg)
                        `,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <CardContent className="p-6 text-center">
                        <div className={`text-xs mb-1 font-medium ${isSelected ? 'text-white/80' : 'text-slate-500'}`}>
                          {metal.atomicNumber}
                        </div>
                        <div className={`text-4xl font-bold mb-1 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                          {metal.symbol}
                        </div>
                        <div className={`text-sm ${isSelected ? 'text-white/90' : 'text-slate-600'}`}>
                          {metal.name}
                        </div>
                        <div 
                          className="w-full h-2 rounded-full mt-3" 
                          style={{ 
                            backgroundColor: isSelected ? 'rgba(255,255,255,0.4)' : metal.color,
                            boxShadow: isSelected ? `0 0 10px ${metal.color}` : 'none'
                          }}
                        ></div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                * Vereinfachtes Periodensystem - nur galvanisierfähige Metalle
              </p>
            </div>
          </div>
        </div>

        {/* Selected Metal Details & Form */}
        {selectedMetal && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto animate-fadeIn">
            {/* Metal Info */}
            <div>
              <Card className="bg-white border-slate-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                    {selectedMetal.name}-Beschichtung
                  </h3>
                  <div 
                    className="relative w-full aspect-square bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-200 mb-6"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
                      const y = ((e.clientX - rect.left) / rect.width - 0.5) * -40;
                      setRotation({ x, y });
                    }}
                    onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                  >
                    <div 
                      className="w-56 h-56 transition-transform duration-300 ease-out"
                      style={{
                        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                        transformStyle: 'preserve-3d'
                      }}
                    >
                      <div 
                        className="w-full h-full rounded-2xl shadow-2xl"
                        style={{
                          background: `linear-gradient(135deg, ${selectedMetal.color} 0%, ${selectedMetal.color}dd 100%)`,
                          boxShadow: `0 20px 60px ${selectedMetal.color}66, inset 0 0 40px ${selectedMetal.color}44`
                        }}
                      >
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-[#2c7a7b] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Eigenschaften:</p>
                        <p className="text-sm text-slate-600">{selectedMetal.description}</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <Package className="h-5 w-5 text-[#2c7a7b] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">Anwendungen:</p>
                        <p className="text-sm text-slate-600">{selectedMetal.applications}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Form */}
            <div>
              <Card className="bg-white border-slate-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">Anfrage stellen</h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Finish Selection */}
                    {selectedMetal.finishes.length > 1 && (
                      <div>
                        <Label className="text-slate-800 mb-3 block font-semibold">
                          Bearbeitung / Färbung *
                        </Label>
                        <RadioGroup value={selectedFinish} onValueChange={setSelectedFinish}>
                          <div className="space-y-2">
                            {selectedMetal.finishes.map((finish) => (
                              <div key={finish.id} className="flex items-start space-x-3 p-3 rounded-lg border-2 border-slate-200 hover:border-[#2c7a7b] transition-colors">
                                <RadioGroupItem value={finish.id} id={finish.id} className="mt-0.5" />
                                <Label htmlFor={finish.id} className="cursor-pointer flex-1">
                                  <span className="font-semibold text-slate-800 block">{finish.name}</span>
                                  <span className="text-sm text-slate-600">{finish.description}</span>
                                </Label>
                              </div>
                            ))}
                          </div>
                        </RadioGroup>
                      </div>
                    )}

                    {/* Size Warning */}
                    <Alert className="bg-amber-50 border-amber-300">
                      <Ruler className="h-5 w-5 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        <strong>Maximale Teilegröße:</strong> {companyInfo.maxSize}
                      </AlertDescription>
                    </Alert>

                    {/* Quantity */}
                    <div>
                      <Label htmlFor="quantity" className="text-slate-800 mb-2 block font-semibold">
                        Stückzahl *
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Anzahl der Teile"
                        className="bg-white border-slate-300 text-slate-800"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <Label htmlFor="description" className="text-slate-800 mb-2 block font-semibold">
                        Beschreibung (optional)
                      </Label>
                      <Textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Besondere Anforderungen oder Details..."
                        className="bg-white border-slate-300 text-slate-800 min-h-24"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <Label className="text-slate-800 mb-2 block font-semibold">
                        Produktbilder * (max. 5 Bilder)
                      </Label>
                      <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#2c7a7b] transition-colors bg-slate-50">
                        <Upload className="h-10 w-10 text-slate-400 mx-auto mb-2" />
                        <label htmlFor="file-upload" className="cursor-pointer">
                          <span className="text-[#2c7a7b] hover:text-[#285e61] font-semibold">Bilder auswählen</span>
                          <input
                            id="file-upload"
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                        </label>
                        <p className="text-xs text-slate-500 mt-1">PNG, JPG bis zu 10MB</p>
                      </div>
                      {images.length > 0 && (
                        <div className="grid grid-cols-5 gap-2 mt-3">
                          {images.map((img, index) => (
                            <div key={index} className="aspect-square bg-slate-100 rounded border-2 border-slate-300 overflow-hidden">
                              <img src={img} alt={`Upload ${index + 1}`} className="w-full h-full object-cover" />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Shipping Info */}
                    <Alert className="bg-[#2c7a7b]/10 border-[#2c7a7b]/30">
                      <Info className="h-5 w-5 text-[#2c7a7b]" />
                      <AlertDescription className="text-slate-700">
                        {companyInfo.shippingNote}
                      </AlertDescription>
                    </Alert>

                    <Button 
                      type="submit" 
                      className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white py-6 text-lg transition-all duration-300 hover:scale-105"
                    >
                      Anfrage absenden
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;
