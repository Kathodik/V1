import React, { useState } from 'react';
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
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  const handleMetalSelect = (metal) => {
    setSelectedMetal(metal);
    setSelectedFinish(metal.finishes[0].id);
    // Reset form
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
    // Reset form
    setSelectedMetal(null);
    setSelectedFinish(null);
    setQuantity('');
    setDescription('');
    setImages([]);
  };

  // Create periodic table layout
  const getMetalPosition = (metal) => {
    // Simple grid positioning based on group and period
    const positions = {
      'Cr': { row: 1, col: 1 },
      'Fe': { row: 1, col: 2 },
      'Ni': { row: 1, col: 3 },
      'Cu': { row: 1, col: 4 },
      'Zn': { row: 1, col: 5 },
      'Ru': { row: 2, col: 1 },
      'Ag': { row: 2, col: 4 },
      'Sn': { row: 2, col: 5 },
      'Au': { row: 3, col: 4 }
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
            Klicken Sie auf ein Element im Periodensystem
          </p>
        </div>

        {/* Periodic Table */}
        <div className="mb-12">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-5 gap-3">
              {metals.map((metal) => {
                const pos = getMetalPosition(metal);
                return (
                  <Card
                    key={metal.symbol}
                    className={`cursor-pointer transition-all duration-300 ${
                      selectedMetal?.symbol === metal.symbol
                        ? 'bg-[#2c7a7b] border-[#2c7a7b] scale-105 shadow-xl'
                        : 'bg-white border-slate-300 hover:border-[#2c7a7b] hover:scale-105 hover:shadow-lg'
                    }`}
                    onClick={() => handleMetalSelect(metal)}
                    style={{ gridColumn: pos.col, gridRow: pos.row }}
                  >
                    <CardContent className="p-4 text-center">
                      <div className={`text-xs mb-1 ${selectedMetal?.symbol === metal.symbol ? 'text-white/70' : 'text-slate-500'}`}>
                        {metal.atomicNumber}
                      </div>
                      <div className={`text-3xl font-bold mb-1 ${selectedMetal?.symbol === metal.symbol ? 'text-white' : 'text-slate-800'}`}>
                        {metal.symbol}
                      </div>
                      <div className={`text-xs ${selectedMetal?.symbol === metal.symbol ? 'text-white/80' : 'text-slate-600'}`}>
                        {metal.name}
                      </div>
                      <div 
                        className="w-full h-2 rounded-full mt-2" 
                        style={{ 
                          backgroundColor: selectedMetal?.symbol === metal.symbol ? 'rgba(255,255,255,0.3)' : metal.color 
                        }}
                      ></div>
                    </CardContent>
                  </Card>
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* 3D Preview */}
            <div>
              <Card className="bg-white border-slate-300">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-4 text-center">
                    {selectedMetal.name}-Beschichtung
                  </h3>
                  <div 
                    className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden flex items-center justify-center border-2 border-slate-200"
                    onMouseMove={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = ((e.clientY - rect.top) / rect.height - 0.5) * 40;
                      const y = ((e.clientX - rect.left) / rect.width - 0.5) * -40;
                      setRotation({ x, y });
                    }}
                    onMouseLeave={() => setRotation({ x: 0, y: 0 })}
                  >
                    {/* 3D Object */}
                    <div 
                      className="w-48 h-48 transition-transform duration-300 ease-out"
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
                        {/* Shine effect */}
                        <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/30 to-transparent"></div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 space-y-3">
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
