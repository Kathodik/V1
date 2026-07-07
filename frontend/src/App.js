import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './components/CartDrawer';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingChatButton from './components/FloatingChatButton';
import CookieConsent from './components/CookieConsent';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Services from './pages/Services';
import Shop from './pages/Shop';
import AIThreeDConfigurator from './pages/AIThreeDConfigurator';
import References from './pages/References';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import PortalLogin from './pages/PortalLogin';
import CustomerPortal from './pages/CustomerPortal';
import AdminPortal from './pages/AdminPortal';
import AGB from './pages/AGB';
import Datenschutz from './pages/Datenschutz';
import Widerruf from './pages/Widerruf';
import BestaetigungAuftrag from './pages/BestaetigungAuftrag';
import useAnalytics from './hooks/useAnalytics';
import './App.css';

const PAGE_TITLES = {
  '/': 'Kathodik – Galvanotechnik & Lohngalvanisierung',
  '/services': 'Leistungen: Lohngalvanik, Vor-Ort-Galvanik & 3D-Konfigurator | Kathodik',
  '/shop': 'Shop – Handgefertigte Kupfer-Unikate | Kathodik',
  '/3d-configurator': '3D-Konfigurator – Wunschteil beschreiben, KI modelliert | Kathodik',
  '/references': 'Referenzen & Arbeiten | Kathodik Galvanotechnik',
  '/contact': 'Kontakt | Kathodik Galvanotechnik',
  '/imprint': 'Impressum | Kathodik',
  '/agb': 'AGB | Kathodik',
  '/datenschutz': 'Datenschutz | Kathodik',
  '/widerruf': 'Widerruf | Kathodik',
  '/portal': 'Kundenportal | Kathodik',
  '/portal/login': 'Anmelden | Kathodik',
  '/admin': 'Verwaltung | Kathodik',
};

function PageTitleManager() {
  const location = useLocation();
  useEffect(() => {
    document.title = PAGE_TITLES[location.pathname] || 'Kathodik – Galvanotechnik & Lohngalvanisierung';
  }, [location.pathname]);
  return null;
}

function AppContent() {
  useAnalytics();
  return (
    <div className="App min-h-screen bg-white">
      <ScrollToTop />
      <PageTitleManager />
      <Header />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/3d-configurator" element={<AIThreeDConfigurator />} />
          <Route path="/references" element={<References />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal" element={<CustomerPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/agb" element={<AGB />} />
          <Route path="/datenschutz" element={<Datenschutz />} />
          <Route path="/widerruf" element={<Widerruf />} />
          <Route path="/bestaetigung/:token" element={<BestaetigungAuftrag />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
      <FloatingChatButton />
      <CookieConsent />
      <Toaster position="top-right" richColors />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
