'use client';

import { useEffect, useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';

type AdminSettings = {
  companyName: string;
  contactPerson: string;
  companyEmail: string;
  baseFare: string;
  perKmRate: string;
  allowOnlineBooking: boolean;
  requireSeatSelection: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
};

const defaultSettings: AdminSettings = {
  companyName: '',
  contactPerson: '',
  companyEmail: '',
  baseFare: '15.00',
  perKmRate: '2.50',
  allowOnlineBooking: true,
  requireSeatSelection: true,
  emailNotifications: true,
  smsNotifications: false,
};

const STORAGE_KEY = 'busqAdminSettings';

const inputClass =
  'w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100';
const labelClass = 'mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600';

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<AdminSettings>(defaultSettings);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      } catch (e) {
        console.error('Failed to parse admin settings', e);
      }
    }
  }, []);

  const update = <K extends keyof AdminSettings>(key: K, value: AdminSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    toast({ title: 'Settings saved', description: 'Your changes have been saved.' });
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a]">
          Settings
        </h1>
        <button
          onClick={handleSave}
          className="border-2 border-[#1d348a] bg-[#1d348a] text-white px-6 py-2 font-bold uppercase tracking-tight text-xs hover:bg-opacity-90 transition-opacity"
        >
          Save Changes
        </button>
      </div>

      {/* Company Profile */}
      <div className="border-2 border-[#1d348a] bg-white">
        <div className="border-b-2 border-[#1d348a] px-5 py-3">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Company Profile</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="company-name" className={labelClass}>Company Name</label>
            <input
              id="company-name"
              value={settings.companyName}
              onChange={(e) => update('companyName', e.target.value)}
              placeholder="BusQ Transit Co."
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="contact-person" className={labelClass}>Contact Person</label>
            <input
              id="contact-person"
              value={settings.contactPerson}
              onChange={(e) => update('contactPerson', e.target.value)}
              placeholder="Juan Dela Cruz"
              className={inputClass}
            />
          </div>
          <div className="md:col-span-2">
            <label htmlFor="company-email" className={labelClass}>Company Email</label>
            <input
              id="company-email"
              type="email"
              value={settings.companyEmail}
              onChange={(e) => update('companyEmail', e.target.value)}
              placeholder="ops@busq.com"
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Fare Rules */}
      <div className="border-2 border-[#1d348a] bg-white">
        <div className="border-b-2 border-[#1d348a] px-5 py-3">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Fare Rules</h2>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="base-fare" className={labelClass}>Base Fare ($)</label>
            <input
              id="base-fare"
              inputMode="decimal"
              value={settings.baseFare}
              onChange={(e) => update('baseFare', e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="per-km" className={labelClass}>Per-Km Rate ($)</label>
            <input
              id="per-km"
              inputMode="decimal"
              value={settings.perKmRate}
              onChange={(e) => update('perKmRate', e.target.value)}
              className={inputClass}
            />
          </div>
        </div>
      </div>

      {/* Booking Controls */}
      <div className="border-2 border-[#1d348a] bg-white">
        <div className="border-b-2 border-[#1d348a] px-5 py-3">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Booking Controls</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-[#1d348a]">Allow Online Booking</p>
              <p className="text-xs font-medium text-zinc-600">Let passengers reserve seats from the app.</p>
            </div>
            <Switch
              checked={settings.allowOnlineBooking}
              onCheckedChange={(v) => update('allowOnlineBooking', v)}
              className="data-[state=checked]:bg-[#1d348a]"
            />
          </div>
          <div className="border-t-2 border-[#1d348a]/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-[#1d348a]">Require Seat Selection</p>
              <p className="text-xs font-medium text-zinc-600">Passengers must pick a specific seat to book.</p>
            </div>
            <Switch
              checked={settings.requireSeatSelection}
              onCheckedChange={(v) => update('requireSeatSelection', v)}
              className="data-[state=checked]:bg-[#1d348a]"
            />
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="border-2 border-[#1d348a] bg-white">
        <div className="border-b-2 border-[#1d348a] px-5 py-3">
          <h2 className="text-lg font-black uppercase tracking-tighter text-[#1d348a]">Notification Preferences</h2>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-[#1d348a]">Email Notifications</p>
              <p className="text-xs font-medium text-zinc-600">Receive booking and dispatch alerts by email.</p>
            </div>
            <Switch
              checked={settings.emailNotifications}
              onCheckedChange={(v) => update('emailNotifications', v)}
              className="data-[state=checked]:bg-[#1d348a]"
            />
          </div>
          <div className="border-t-2 border-[#1d348a]/10" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-tight text-[#1d348a]">SMS Notifications</p>
              <p className="text-xs font-medium text-zinc-600">Receive text alerts for critical events.</p>
            </div>
            <Switch
              checked={settings.smsNotifications}
              onCheckedChange={(v) => update('smsNotifications', v)}
              className="data-[state=checked]:bg-[#1d348a]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
