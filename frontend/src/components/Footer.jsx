import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { companyInfo } from '../data/mockData';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-white" data-testid="site-footer">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-5">
              <img
                src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/u8siitr8_Unbenannt.png"
                alt="Kathodik"
                className="h-10 w-10 brightness-200"
              />
              <div>
                <span className="text-lg font-bold tracking-tight block leading-none">Kathodik</span>
                <span className="text-[10px] text-[#4fd1c5] tracking-[0.2em] font-semibold uppercase">Galvanotechnik</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Professionelle Lohngalvanisierung. Wir schauen, was sich machen lässt – und liefern, was sich sehen lässt.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold tracking-[0.15em] uppercase text-slate-400 mb-5">Navigation</h3>
            <ul className="space-y-3">
              {[
                { name: 'Dienstleistungen', href: '/services' },
                { name: '3D Konfigurator', href: '/3d-configurator' },
                { name: 'Referenzen', href: '/references' },
                { name: 'Kontakt', href: '/contact' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal */}
          <div>
            <h3 className="text-sm font-semibold tracking-[0.15em] uppercase text-slate-400 mb-5">Kundenbereich</h3>
            <ul className="space-y-3">
              {[
                { name: 'Kundenportal', href: '/portal/login' },
                { name: 'Impressum', href: '/imprint' },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.href} className="text-sm text-slate-400 hover:text-white transition-colors duration-300">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-sm font-semibold tracking-[0.15em] uppercase text-slate-400 mb-5">Kontakt</h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <Phone className="h-4 w-4 text-[#4fd1c5] mt-0.5 flex-shrink-0" />
                <a href={`tel:${companyInfo.phone}`} className="text-sm text-slate-400 hover:text-white transition-colors">{companyInfo.phone}</a>
              </li>
              <li className="flex items-start space-x-3">
                <Mail className="h-4 w-4 text-[#4fd1c5] mt-0.5 flex-shrink-0" />
                <a href={`mailto:${companyInfo.email}`} className="text-sm text-slate-400 hover:text-white transition-colors">{companyInfo.email}</a>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-[#4fd1c5] mt-0.5 flex-shrink-0" />
                <span className="text-sm text-slate-400">{companyInfo.address}, {companyInfo.city}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {new Date().getFullYear()} Kathodik. Alle Rechte vorbehalten.
          </p>
          <p className="text-xs text-slate-600">
            Inhaber: {companyInfo.owner} &middot; {companyInfo.legalForm}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
