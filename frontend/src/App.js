import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import { AuthProvider } from './contexts/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingChatButton from './components/FloatingChatButton';
import CookieConsent from './components/CookieConsent';
import Home from './pages/Home';
import Services from './pages/Services';
import AIThreeDConfigurator from './pages/AIThreeDConfigurator';
import References from './pages/References';
import Contact from './pages/Contact';
import Imprint from './pages/Imprint';
import PortalLogin from './pages/PortalLogin';
import CustomerPortal from './pages/CustomerPortal';
import AdminPortal from './pages/AdminPortal';
import AGB from './pages/AGB';
import useAnalytics from './hooks/useAnalytics';
import './App.css';

function AppContent() {
  useAnalytics();
  return (
    <div className="App min-h-screen bg-white">
      <Header />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/services" element={<Services />} />
          <Route path="/3d-configurator" element={<AIThreeDConfigurator />} />
          <Route path="/references" element={<References />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/imprint" element={<Imprint />} />
          <Route path="/portal/login" element={<PortalLogin />} />
          <Route path="/portal" element={<CustomerPortal />} />
          <Route path="/admin" element={<AdminPortal />} />
          <Route path="/agb" element={<AGB />} />
        </Routes>
      </main>
      <Footer />
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
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
