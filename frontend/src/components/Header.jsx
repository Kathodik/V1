import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Dienstleistungen', href: '/services' },
    { name: '3D Konfigurator', href: '/3d-configurator' },
    { name: 'Referenzen', href: '/references' },
    { name: 'Kontakt', href: '/contact' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200/50'
          : 'bg-transparent'
      }`}
      data-testid="site-header"
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <img
              src="https://customer-assets.emergentagent.com/job_metal-coating/artifacts/u8siitr8_Unbenannt.png"
              alt="Kathodik Logo"
              className="h-11 w-11 transition-transform duration-300 group-hover:scale-110"
            />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-800 tracking-tight leading-none">Kathodik</span>
              <span className="text-[10px] text-[#2c7a7b] tracking-[0.2em] font-semibold uppercase">Galvanotechnik</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-[#2c7a7b] text-white shadow-md shadow-[#2c7a7b]/20'
                    : 'text-slate-600 hover:text-[#2c7a7b] hover:bg-slate-100/80'
                }`}
                data-testid={`nav-${item.href.replace('/', '') || 'home'}`}
              >
                {item.name}
              </Link>
            ))}
            <Link to={user ? '/portal' : '/portal/login'}>
              <Button
                size="sm"
                className="ml-3 bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full shadow-md shadow-[#2c7a7b]/20 px-5"
                data-testid="nav-login-btn"
              >
                {user ? (
                  <span>{user.name}</span>
                ) : (
                  <>
                    <LogIn className="h-4 w-4 mr-1.5" />
                    Portal
                  </>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-slate-700 hover:bg-slate-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            data-testid="mobile-menu-btn"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-1 border-t border-slate-100 bg-white/95 backdrop-blur-md rounded-b-2xl">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-[#2c7a7b] text-white'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-[#2c7a7b]'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <Link
              to={user ? '/portal' : '/portal/login'}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full bg-[#2c7a7b] hover:bg-[#285e61] text-white mt-2 rounded-xl">
                {user ? `Portal: ${user.name}` : (
                  <>
                    <LogIn className="h-4 w-4 mr-2" />
                    Anmelden
                  </>
                )}
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Header;
