import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { companyInfo } from '../data/mockData';

const Footer = () => {
  return (
    <footer className="bg-slate-950 border-t border-teal-500/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/u8siitr8_Unbenannt.png" 
                alt="Kathodik Logo" 
                className="h-10 w-10"
              />
              <div>
                <h3 className="text-xl font-bold text-white">Kathodik</h3>
                <p className="text-xs text-teal-400 tracking-widest">GALVANOTECHNIK</p>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ihr Partner für professionelle Lohngalvanisierung. Präzision und Qualität seit Jahren.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Schnellzugriff</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  Dienstleistungen
                </Link>
              </li>
              <li>
                <Link to="/references" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  Referenzen
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link to="/imprint" className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  Impressum
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Kontakt</h4>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-teal-400 flex-shrink-0 mt-0.5" />
                <span className="text-slate-400 text-sm">
                  {companyInfo.address}<br />
                  {companyInfo.city}
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <a href={`tel:${companyInfo.phone}`} className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  {companyInfo.phone}
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-teal-400 flex-shrink-0" />
                <a href={`mailto:${companyInfo.email}`} className="text-slate-400 hover:text-teal-400 text-sm transition-colors duration-300">
                  {companyInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Kathodik - Inhaber: {companyInfo.owner}. Alle Rechte vorbehalten.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
