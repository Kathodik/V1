import React from 'react';
import { Link } from 'react-router-dom';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';

/**
 * Combined legal acknowledgement checkbox for ALL order submissions.
 * The customer confirms AGB + Haftungsausschluss + Widerrufsrecht + Datenschutz at once.
 */
const LegalConsent = ({ checked, onCheckedChange, id = 'legal-consent', size = 'sm' }) => (
  <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-xl border border-slate-200" data-testid="legal-consent-area">
    <Checkbox
      id={id}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className="mt-0.5"
      data-testid="legal-consent-checkbox"
    />
    <Label htmlFor={id} className={`${size === 'xs' ? 'text-xs' : 'text-sm'} text-slate-700 cursor-pointer leading-relaxed`}>
      Ich habe die{' '}
      <Link to="/agb" target="_blank" className="text-[#2c7a7b] font-semibold underline hover:text-[#285e61]">AGB</Link>,{' '}
      den{' '}
      <Link to="/agb" target="_blank" className="text-[#2c7a7b] font-semibold underline hover:text-[#285e61]">Haftungsausschluss</Link>,{' '}
      die{' '}
      <Link to="/widerruf" target="_blank" className="text-[#2c7a7b] font-semibold underline hover:text-[#285e61]">Widerrufsbelehrung</Link>{' '}
      und die{' '}
      <Link to="/datenschutz" target="_blank" className="text-[#2c7a7b] font-semibold underline hover:text-[#285e61]">Datenschutzerklärung</Link>{' '}
      zur Kenntnis genommen und akzeptiere diese. *
    </Label>
  </div>
);

export default LegalConsent;
