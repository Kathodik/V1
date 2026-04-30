import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { getVisitorId } from '../components/CookieConsent';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const useAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const consent = localStorage.getItem('cookie_consent');
    // Track page views regardless (basic analytics), but only detailed data with consent
    const visitorId = consent === 'accepted' ? getVisitorId() : 'anonymous';

    axios.post(`${API}/analytics/pageview`, {
      page: location.pathname,
      referrer: document.referrer || null,
      user_agent: navigator.userAgent,
      visitor_id: visitorId
    }).catch(() => {});
  }, [location.pathname]);
};

export default useAnalytics;
