import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const PAYPAL_CLIENT_ID = 'AbdPQrxvAmGLxLSYkCdcAmLJRKhU46EVr-aj2eGQYVZe6HuTUu0wwoMoKYzuo77f_NslZcd0KY2dQbGh';

// Loads PayPal SDK once (singleton)
let sdkLoaderPromise = null;
const loadPayPalSdk = () => {
  if (window.paypal) return Promise.resolve(window.paypal);
  if (sdkLoaderPromise) return sdkLoaderPromise;
  sdkLoaderPromise = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=EUR&components=buttons&disable-funding=card,credit`;
    s.async = true;
    s.onload = () => resolve(window.paypal);
    s.onerror = () => reject(new Error('PayPal SDK konnte nicht geladen werden'));
    document.head.appendChild(s);
  });
  return sdkLoaderPromise;
};

const PayPalButton = ({ disabled, onBeforeCreate, onSuccess, amount = 49.0 }) => {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [renderError, setRenderError] = useState('');
  const disabledRef = useRef(disabled);
  const onBeforeCreateRef = useRef(onBeforeCreate);
  const onSuccessRef = useRef(onSuccess);

  // Keep refs up to date so the PayPal closure always sees latest values
  useEffect(() => { disabledRef.current = disabled; }, [disabled]);
  useEffect(() => { onBeforeCreateRef.current = onBeforeCreate; }, [onBeforeCreate]);
  useEffect(() => { onSuccessRef.current = onSuccess; }, [onSuccess]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const paypal = await loadPayPalSdk();
        if (cancelled || !containerRef.current) return;
        containerRef.current.innerHTML = '';
        await paypal.Buttons({
          style: { shape: 'pill', layout: 'horizontal', color: 'gold', label: 'paypal', height: 48, tagline: false },
          onClick: (data, actions) => {
            if (disabledRef.current) {
              toast.error('Bitte zuerst alle Pflichtfelder ausfüllen');
              return actions.reject();
            }
            return actions.resolve();
          },
          createOrder: async () => {
            try {
              const internalOrder = await onBeforeCreateRef.current?.();
              if (!internalOrder?.id) throw new Error('Auftrag konnte nicht erstellt werden');
              const res = await axios.post(`${API}/paypal/orders`, {
                internal_order_id: internalOrder.id,
                amount_eur: amount,
              });
              return res.data.id;
            } catch (e) {
              console.error('PayPal createOrder failed:', e);
              toast.error('Zahlungsvorgang konnte nicht gestartet werden');
              throw e;
            }
          },
          onApprove: async (data) => {
            try {
              const res = await axios.post(`${API}/paypal/orders/${data.orderID}/capture`);
              if (res.data?.status === 'COMPLETED' || res.data?.purchase_units) {
                toast.success('Zahlung erfolgreich – Versandlabel folgt per E-Mail');
                onSuccessRef.current?.(res.data);
              } else {
                toast.error('Zahlung nicht abgeschlossen');
              }
            } catch (e) {
              console.error('PayPal capture failed:', e);
              toast.error('Zahlung konnte nicht erfasst werden');
            }
          },
          onError: (err) => {
            console.error('PayPal error:', err);
            toast.error('PayPal-Fehler – bitte erneut versuchen');
          },
          onCancel: () => toast.info('Zahlung abgebrochen'),
        }).render(containerRef.current);
        if (!cancelled) setLoading(false);
      } catch (e) {
        console.error(e);
        if (!cancelled) setRenderError(e.message || 'PayPal konnte nicht geladen werden');
      }
    })();
    return () => { cancelled = true; };
  }, [amount]);

  return (
    <div className="relative">
      {loading && !renderError && (
        <div className="flex items-center justify-center py-4 text-slate-400 text-sm gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> PayPal wird geladen…
        </div>
      )}
      {renderError && <p className="text-sm text-red-500">{renderError}</p>}
      <div
        ref={containerRef}
        data-testid="paypal-button"
        className={`transition-opacity ${disabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}
      />
    </div>
  );
};

export default PayPalButton;
