// Mock data for Kathodik Galvanik website

export const metals = [
  { 
    symbol: 'Zn', 
    name: 'Zink', 
    atomicNumber: 30, 
    color: '#c0c0d0', 
    group: 12,
    period: 4,
    description: 'Korrosionsschutz, dekorative Beschichtung', 
    applications: 'Automobilindustrie, Bauwesen, Maschinenbau',
    finishes: [
      { id: 'zn-standard', name: 'Standard', description: 'Klassische Verzinkung' },
      { id: 'zn-yellow', name: 'Gelbchromatiert', description: 'Gelbe Passivierung' },
      { id: 'zn-blue', name: 'Blauchromatiert', description: 'Blaue Passivierung' }
    ]
  },
  { 
    symbol: 'Sn', 
    name: 'Zinn', 
    atomicNumber: 50, 
    color: '#d4d4d4',
    group: 14,
    period: 5,
    description: 'Korrosionsschutz, Lötbarkeit', 
    applications: 'Lebensmittelindustrie, Elektronikindustrie',
    finishes: [
      { id: 'sn-standard', name: 'Standard', description: 'Klassische Verzinnung' }
    ]
  },
  { 
    symbol: 'Ni', 
    name: 'Nickel', 
    atomicNumber: 28, 
    color: '#d4d4d4',
    group: 10,
    period: 4,
    description: 'Verschleißschutz, Korrosionsschutz', 
    applications: 'Elektronikindustrie, Maschinenbau, Werkzeugbau',
    finishes: [
      { id: 'ni-standard', name: 'Standard', description: 'Klassische Vernicklung' },
      { id: 'ni-black', name: 'Schwarz', description: 'Schwarze Vernicklung' },
      { id: 'ni-satin', name: 'Seidenmatt', description: 'Matte Oberfläche' }
    ]
  },
  { 
    symbol: 'Cu', 
    name: 'Kupfer', 
    atomicNumber: 29, 
    color: '#d4886c',
    group: 11,
    period: 4,
    description: 'Elektrische Leitfähigkeit, Korrosionsschutz', 
    applications: 'Elektronikindustrie, Leiterplatten, dekorative Zwecke',
    finishes: [
      { id: 'cu-standard', name: 'Standard', description: 'Klassische Verkupferung' },
      { id: 'cu-red', name: 'Rot', description: 'Rote Verkupferung' },
      { id: 'cu-antique', name: 'Antik', description: 'Antike Kupferoptik' }
    ]
  },
  { 
    symbol: 'Ag', 
    name: 'Silber', 
    atomicNumber: 47, 
    color: '#c9c9c9',
    group: 11,
    period: 5,
    description: 'Beste elektrische Leitfähigkeit, antibakteriell', 
    applications: 'Elektronikindustrie, Schmuck, Medizintechnik',
    finishes: [
      { id: 'ag-standard', name: 'Standard', description: 'Klassische Versilberung' }
    ]
  },
  { 
    symbol: 'Cr', 
    name: 'Chrom', 
    atomicNumber: 24, 
    color: '#e8e8e8',
    group: 6,
    period: 4,
    description: 'Härte, Glanz, Korrosionsschutz', 
    applications: 'Automobilindustrie, Sanitär, dekorative Anwendungen',
    finishes: [
      { id: 'cr-standard', name: 'Standard', description: 'Glanzchrom' },
      { id: 'cr-black', name: 'Schwarzchrom', description: 'Schwarze Chromschicht' }
    ]
  },
  { 
    symbol: 'Au', 
    name: 'Gold', 
    atomicNumber: 79, 
    color: '#ffd700',
    group: 11,
    period: 6,
    description: 'Korrosionsbeständig, hohe Leitfähigkeit', 
    applications: 'Elektronikindustrie, Schmuck, Kontakttechnik',
    finishes: [
      { id: 'au-standard', name: 'Standard', description: 'Klassische Vergoldung' }
    ]
  },
  { 
    symbol: 'Ru', 
    name: 'Ruthenium', 
    atomicNumber: 44, 
    color: '#8090a0',
    group: 8,
    period: 5,
    description: 'Härte, Verschleißschutz, edle Optik', 
    applications: 'Schmuck, Elektronikindustrie, dekorative Anwendungen',
    finishes: [
      { id: 'ru-standard', name: 'Standard', description: 'Ruthenium-Beschichtung' }
    ]
  }
];

export const references = [
  {
    id: 1,
    title: 'Automobilteile - Verzinkung',
    metal: 'Zink',
    finish: 'Blauchromatiert',
    before: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    after: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    description: 'Präzisionsteile für Automobilindustrie'
  },
  {
    id: 2,
    title: 'Werkzeugbau - Hartverchromung',
    metal: 'Chrom',
    finish: 'Standard',
    before: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    after: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    description: 'Hochpräzise Werkzeugbeschichtung'
  },
  {
    id: 3,
    title: 'Elektronikindustrie - Verkupferung',
    metal: 'Kupfer',
    finish: 'Standard',
    before: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    after: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400',
    description: 'Leiterplatten und Kontakte'
  },
  {
    id: 4,
    title: 'Schmuckveredelung - Vergoldung',
    metal: 'Gold',
    finish: 'Standard',
    before: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=400',
    after: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400',
    description: 'Hochwertige Schmuckstücke'
  }
];

export const services = [
  {
    title: 'Lohngalvanisierung',
    description: 'Professionelle Beschichtung Ihrer Kundenprodukte mit höchster Präzision',
    icon: 'Layers'
  },
  {
    title: 'Metallauswahl',
    description: 'Breites Spektrum an galvanischen Beschichtungen für jeden Einsatzzweck',
    icon: 'Atom'
  },
  {
    title: 'Qualitätskontrolle',
    description: 'Strenge Qualitätsprüfung und Dokumentation jedes Auftrags',
    icon: 'CheckCircle2'
  },
  {
    title: 'Schnelle Bearbeitung',
    description: 'Effiziente Abwicklung und zuverlässige Lieferzeiten',
    icon: 'Zap'
  }
];

export const companyInfo = {
  name: 'Kathodik',
  legalForm: 'Einzelunternehmen (nicht im Handelsregister eingetragen)',
  owner: 'Hannes Barfuß',
  address: 'Gartenstraße 70',
  city: '53547 Kasbach-Ohlenberg',
  phone: '01626431168',
  email: 'Service@Kathodik.com',
  maxSize: '40 x 60 x 160 cm',
  shippingNote: 'Das Porto wird beim Versandetikett von uns bezahlt'
};
