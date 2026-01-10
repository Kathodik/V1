// Mock data for Kathodik Galvanik website

export const metals = [
  { symbol: 'Zn', name: 'Zink', atomicNumber: 30, color: '#c0c0d0', description: 'Korrosionsschutz, dekorative Beschichtung', applications: 'Automobilindustrie, Bauwesen, Maschinenbau' },
  { symbol: 'Ni', name: 'Nickel', atomicNumber: 28, color: '#d4d4d4', description: 'Verschleißschutz, Korrosionsschutz', applications: 'Elektronikindustrie, Maschinenbau, Werkzeugbau' },
  { symbol: 'Cr', name: 'Chrom', atomicNumber: 24, color: '#e8e8e8', description: 'Härte, Glanz, Korrosionsschutz', applications: 'Automobilindustrie, Sanitär, dekorative Anwendungen' },
  { symbol: 'Cu', name: 'Kupfer', atomicNumber: 29, color: '#d4886c', description: 'Elektrische Leitfähigkeit, Korrosionsschutz', applications: 'Elektronikindustrie, Leiterplatten, dekorative Zwecke' },
  { symbol: 'Ag', name: 'Silber', atomicNumber: 47, color: '#c9c9c9', description: 'Beste elektrische Leitfähigkeit, antibakteriell', applications: 'Elektronikindustrie, Schmuck, Medizintechnik' },
  { symbol: 'Au', name: 'Gold', atomicNumber: 79, color: '#ffd700', description: 'Korrosionsbeständig, hohe Leitfähigkeit', applications: 'Elektronikindustrie, Schmuck, Kontakttechnik' },
  { symbol: 'Sn', name: 'Zinn', atomicNumber: 50, color: '#d4d4d4', description: 'Korrosionsschutz, Lötbarkeit', applications: 'Lebensmittelindustrie, Elektronikindustrie' },
  { symbol: 'Cd', name: 'Cadmium', atomicNumber: 48, color: '#c0c0c0', description: 'Korrosionsschutz (Spezialanwendungen)', applications: 'Luft- und Raumfahrt, militärische Anwendungen' },
  { symbol: 'Pb', name: 'Blei', atomicNumber: 82, color: '#8c8c8c', description: 'Korrosionsschutz, Lötbarkeit', applications: 'Batterietechnik, Spezialanwendungen' },
  { symbol: 'Co', name: 'Kobalt', atomicNumber: 27, color: '#b0b0c0', description: 'Verschleißschutz, Magnetismus', applications: 'Werkzeugbau, Magnettechnik' },
  { symbol: 'Fe', name: 'Eisen', atomicNumber: 26, color: '#a0a0a0', description: 'Grundwerkstoff, Verstärkung', applications: 'Allgemeiner Maschinenbau' },
  { symbol: 'Rh', name: 'Rhodium', atomicNumber: 45, color: '#e0e0e0', description: 'Härte, Korrosionsschutz, Glanz', applications: 'Schmuck, Spiegelindustrie, Katalysatoren' }
];

export const references = [
  {
    id: 1,
    title: 'Automobilteile - Verzinkung',
    metal: 'Zink',
    before: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    after: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=400',
    description: 'Präzisionsteile für Automobilindustrie'
  },
  {
    id: 2,
    title: 'Werkzeugbau - Hartverchromung',
    metal: 'Chrom',
    before: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400',
    after: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400',
    description: 'Hochpräzise Werkzeugbeschichtung'
  },
  {
    id: 3,
    title: 'Elektronikindustrie - Verkupferung',
    metal: 'Kupfer',
    before: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    after: 'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=400',
    description: 'Leiterplatten und Kontakte'
  },
  {
    id: 4,
    title: 'Schmuckveredelung - Vergoldung',
    metal: 'Gold',
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
