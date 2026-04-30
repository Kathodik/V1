import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Cookie, Shield } from 'lucide-react';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CookieConsent = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    if (!consent) {
      // Small delay before showing
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie_consent', 'accepted');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    const visitorId = getVisitorId();
    axios.post(`${API}/analytics/cookie-consent?accepted=true&visitor_id=${visitorId}`).catch(() => {});
    setVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie_consent', 'declined');
    localStorage.setItem('cookie_consent_date', new Date().toISOString());
    const visitorId = getVisitorId();
    axios.post(`${API}/analytics/cookie-consent?accepted=false&visitor_id=${visitorId}`).catch(() => {});
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9998] p-4 animate-in slide-in-from-bottom duration-500" data-testid="cookie-banner">
      <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-900/10 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-start space-x-3 flex-1">
            <div className="w-10 h-10 bg-[#2c7a7b]/10 rounded-xl flex items-center justify-center flex-shrink-0">
              <Cookie className="h-5 w-5 text-[#2c7a7b]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800 mb-1">Cookie-Einstellungen</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Wir verwenden Cookies, um Ihren Besuch zu analysieren und unsere Website zu verbessern. 
                Mit "Akzeptieren" stimmen Sie der Verwendung von Analyse-Cookies zu.{' '}
                <a href="/imprint" className="text-[#2c7a7b] hover:underline">Mehr erfahren</a>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-auto">
            <Button
              onClick={handleDecline}
              variant="outline"
              className="flex-1 sm:flex-none border-slate-200 text-slate-600 hover:bg-slate-50 rounded-full text-sm px-5"
              data-testid="cookie-decline-btn"
            >
              Ablehnen
            </Button>
            <Button
              onClick={handleAccept}
              className="flex-1 sm:flex-none bg-[#2c7a7b] hover:bg-[#285e61] text-white rounded-full text-sm px-5"
              data-testid="cookie-accept-btn"
            >
              <Shield className="h-4 w-4 mr-1" />
              Akzeptieren
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper to get/create a visitor ID
export const getVisitorId = () => {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = 'v_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('visitor_id', id);
  }
  return id;
};

export default CookieConsent;
