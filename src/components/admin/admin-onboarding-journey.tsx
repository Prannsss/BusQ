'use client';

import { useState, type ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  ChevronRight,
  ChevronLeft,
  Bus,
  Eye,
  EyeOff,
  Upload,
  Plus,
  Building2,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import Link from 'next/link';
import { Input } from '@/components/ui/input';

type FloatingInputProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: LucideIcon;
  type?: 'text' | 'email' | 'password';
  className?: string;
  rightSlot?: ReactNode;
};

function FloatingInput({
  id,
  label,
  value,
  onChange,
  icon: Icon,
  type = 'text',
  className,
  rightSlot,
}: FloatingInputProps) {
  return (
    <div className={`relative group ${className ?? ''}`}>
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400 group-focus-within:text-[#1d348a] transition-colors z-10" />
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder=" "
        className="peer w-full border-2 border-zinc-300 bg-transparent py-7 pl-12 pr-4 focus:border-[#1d348a] focus:ring-0 rounded-none text-black transition-colors text-lg"
      />
      <label
        htmlFor={id}
        className="absolute left-10 transition-all font-medium bg-white px-2 text-zinc-400 peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-lg peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:text-sm peer-focus:text-[#1d348a] peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:text-sm peer-[:not(:placeholder-shown)]:text-[#1d348a] cursor-text pointer-events-none"
      >
        {label}
      </label>
      {rightSlot}
    </div>
  );
}

export function AdminOnboardingJourney() {
  const [step, setStep] = useState(1);
  const totalSteps = 4;
  const progressPercent = (step / totalSteps) * 100;

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [companyName, setCompanyName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [fleetSize, setFleetSize] = useState('1 - 10 Buses');
  const [plateNumber, setPlateNumber] = useState('');
  const [vehicleClass, setVehicleClass] = useState('Aircon (Standard)');
  const [companyEmail, setCompanyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [columns, setColumns] = useState<{type: 'seats' | 'aisle', count?: number}[]>([]);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState<number | null>(null);
  const [rearSeats, setRearSeats] = useState(0);
  const progressWidthClass = step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full';
  const totalColumnSeats = columns.reduce((total, column) => {
    if (column.type !== 'seats') return total;
    return total + (column.count ?? 0);
  }, 0);
  const totalBusSeats = totalColumnSeats + rearSeats;
  const canAddAisle = columns.length > 0 && columns[columns.length - 1].type !== 'aisle';
  const shouldCenterColumns = columns.length <= 4;

  const handleNext = () => {
     if (step < totalSteps) setStep(step + 1);
  };

  const handleBack = () => {
     if (step > 1) setStep(step - 1);
  };

  const handleAddSeatsColumn = (count: number) => {
    setColumns((previous) => {
      if (selectedColumnIndex === null || selectedColumnIndex >= previous.length) {
        const nextColumns = [...previous, { type: 'seats' as const, count }];
        setSelectedColumnIndex(nextColumns.length - 1);
        return nextColumns;
      }

      const nextColumns = [...previous];
      const selected = nextColumns[selectedColumnIndex];
      if (selected.type === 'seats') {
        nextColumns[selectedColumnIndex] = {
          ...selected,
          count: (selected.count ?? 0) + count,
        };
      } else {
        nextColumns[selectedColumnIndex] = { type: 'seats' as const, count };
      }
      return nextColumns;
    });
  };

  const handleAddAisle = () => {
    if (!canAddAisle) return;
    setColumns((previous) => {
      const nextColumns = [...previous, { type: 'aisle' as const }];
      setSelectedColumnIndex(nextColumns.length - 1);
      return nextColumns;
    });
  };

  const handleAddBlankColumn = () => {
    setColumns((previous) => {
      const nextColumns = [...previous, { type: 'seats' as const, count: 0 }];
      setSelectedColumnIndex(nextColumns.length - 1);
      return nextColumns;
    });
  };

  const handleRemoveLastColumn = () => {
    setColumns((previous) => {
      if (previous.length === 0) return previous;
      const nextColumns = previous.slice(0, -1);
      setSelectedColumnIndex((previousSelectedIndex) => {
        if (previousSelectedIndex === null) return null;
        if (previousSelectedIndex >= nextColumns.length) {
          return nextColumns.length - 1;
        }
        return previousSelectedIndex;
      });
      return nextColumns;
    });
  };

  return (
    <div className="min-h-screen bg-white text-[#1d348a] font-sans selection:bg-[#ff6802] selection:text-white p-4 md:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <div className="mb-8 md:mb-10 text-center">
          <div className="inline-flex items-center justify-center mb-6 hover:scale-105 transition-transform">
            <Bus className="h-14 w-14 text-[#ff6802]" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a]">
            Setup <span className="text-[#ff6802]">Journey</span>
          </h1>
          <p className="mt-3 text-base md:text-lg text-zinc-600 font-medium uppercase tracking-wide">
            Configure your operator workspace in a few guided steps.
          </p>
        </div>

        <div className="w-full relative z-10 bg-transparent">
          <div className="mb-10">
            <div className="flex justify-between items-end mb-3">
              <span className="text-sm font-bold text-zinc-700 tracking-tight uppercase">Step {step} of {totalSteps}</span>
              <span className="text-xs font-semibold text-zinc-500 tracking-tight uppercase">{Math.round(progressPercent)}% Complete</span>
            </div>
            <div className="h-1.5 w-full bg-zinc-200 overflow-hidden">
              <div className={`h-full bg-[#1d348a] transition-all duration-500 ease-out ${progressWidthClass}`} />
            </div>
          </div>

          <div className="space-y-8 pb-8">
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1d348a] mb-2">
                  Company <span className="text-[#ff6802]">Details</span>
                </h2>
                <p className="text-zinc-600 font-medium mb-8 uppercase tracking-wide">
                  Add your operator profile information.
                </p>

                <div className="space-y-6">
                  <FloatingInput
                    id="operator-company-name"
                    label="Operator / Company Name"
                    value={companyName}
                    onChange={setCompanyName}
                    icon={Building2}
                  />

                  <FloatingInput
                    id="operator-contact-person"
                    label="Primary Contact Person"
                    value={contactPerson}
                    onChange={setContactPerson}
                    icon={User}
                  />

                  <div>
                    <label htmlFor="fleet-size" className="mb-2 block text-sm font-bold uppercase tracking-wide text-zinc-600">
                      Fleet Size Estimate
                    </label>
                    <select
                      id="fleet-size"
                      value={fleetSize}
                      onChange={(event) => setFleetSize(event.target.value)}
                      className="w-full border-2 border-zinc-300 bg-transparent py-4 px-4 focus:border-[#1d348a] focus:outline-none rounded-none text-base text-black transition-colors"
                    >
                      <option>1 - 10 Buses</option>
                      <option>11 - 50 Buses</option>
                      <option>50+ Buses</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="business-license" className="text-sm font-bold uppercase tracking-wide text-zinc-600">Upload Business License</label>
                    <div className="border-2 border-dashed border-zinc-300 p-8 flex flex-col items-center justify-center text-center hover:bg-zinc-50 transition-colors cursor-pointer relative">
                      <input id="business-license" title="Upload business license" type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept=".pdf,image/*" />
                      <Upload className="w-8 h-8 text-zinc-400 mb-2" />
                      <p className="text-sm font-medium text-zinc-700 uppercase tracking-wide">Click or drag file to upload</p>
                      <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wide">PDF, JPG, or PNG up to 10MB</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1d348a] mb-2">
                  First <span className="text-[#ff6802]">Bus</span>
                </h2>
                <p className="text-zinc-600 font-medium mb-8 uppercase tracking-wide">
                  Register one vehicle to initialize tracking.
                </p>

                <div className="space-y-6">
                  <FloatingInput
                    id="plate-number"
                    label="Plate Number"
                    value={plateNumber}
                    onChange={(value) => setPlateNumber(value.toUpperCase())}
                    icon={Bus}
                  />

                  <div>
                    <label htmlFor="vehicle-class" className="mb-2 block text-sm font-bold uppercase tracking-wide text-zinc-600">
                      Vehicle Type / Class
                    </label>
                    <select
                      id="vehicle-class"
                      value={vehicleClass}
                      onChange={(event) => setVehicleClass(event.target.value)}
                      className="w-full border-2 border-zinc-300 bg-transparent py-4 px-4 focus:border-[#1d348a] focus:outline-none rounded-none text-base text-black transition-colors"
                    >
                      <option>Aircon (Standard)</option>
                      <option>Aircon (Deluxe)</option>
                      <option>Non-Aircon</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1d348a] mb-2">
                  Seat <span className="text-[#ff6802]">Layout</span>
                </h2>
                <p className="text-zinc-600 font-medium mb-6 uppercase tracking-wide">
                  Design the arrangement column by column.
                </p>

                <div className="space-y-6">
                  <div className="border-2 border-zinc-200 p-4 md:p-5 bg-zinc-50 space-y-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="text-sm font-bold uppercase tracking-wide text-zinc-700">Build Layout Columns</p>
                      <p className="text-xs font-bold uppercase tracking-wide text-zinc-500">Total Seats: {totalBusSeats}</p>
                    </div>
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      Click a column below, then use add seats to grow the selected column.
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {[1, 2, 3, 4].map((seatCount) => (
                        <button
                          key={seatCount}
                          type="button"
                          onClick={() => handleAddSeatsColumn(seatCount)}
                          className="min-w-20 border-2 border-zinc-300 bg-white hover:border-[#1d348a] hover:text-[#1d348a] text-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                        >
                          Add {seatCount} Seat{seatCount > 1 ? 's' : ''}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={handleAddAisle}
                        disabled={!canAddAisle}
                        className="min-w-20 border-2 border-zinc-300 bg-white hover:border-[#1d348a] hover:text-[#1d348a] disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                      >
                        Add Aisle
                      </button>

                      <button
                        type="button"
                        onClick={handleAddBlankColumn}
                        className="min-w-20 border-2 border-zinc-300 bg-white hover:border-[#1d348a] hover:text-[#1d348a] text-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                      >
                        New Column
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveLastColumn}
                        disabled={columns.length === 0}
                        className="min-w-20 border-2 border-zinc-300 bg-white hover:border-[#1d348a] hover:text-[#1d348a] disabled:opacity-50 disabled:cursor-not-allowed text-zinc-700 px-3 py-2 text-xs font-bold uppercase tracking-wide transition-colors"
                      >
                        Undo Last
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-zinc-500">
                      <span>Front of the bus</span>
                      <div className="h-px flex-1 bg-zinc-200" />
                    </div>

                    <div className="overflow-x-auto pb-4">
                      <div className={`flex gap-2 items-stretch min-w-full ${shouldCenterColumns ? 'justify-center' : 'justify-start'}`}>
                        {columns.map((col, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedColumnIndex(idx)}
                            className={`flex-none flex flex-col items-center bg-zinc-50 border p-2 rounded-none min-w-[60px] transition-colors ${
                              selectedColumnIndex === idx
                                ? 'border-[#1d348a] ring-2 ring-[#1d348a]/20'
                                : 'border-zinc-200 hover:border-[#1d348a]'
                            }`}
                          >
                            <span className="text-xs font-bold text-zinc-500 mb-2 uppercase">{col.type}</span>
                            {col.type === 'seats' ? (
                              <div className="flex flex-col gap-1">
                                {col.count === 0 ? (
                                  <div className="w-8 h-8 rounded border-2 border-dashed border-zinc-300" />
                                ) : (
                                  Array.from({length: col.count || 0}).map((_, i) => (
                                    <div key={i} className="w-8 h-8 rounded bg-sky-200 border border-sky-400" />
                                  ))
                                )}
                              </div>
                            ) : (
                              <div className="w-8 h-full min-h-[100px] border-x-2 border-dashed border-zinc-300" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-zinc-200 pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wide">Rear Seats</h4>
                        <p className="text-xs text-zinc-500 uppercase tracking-wide">Back row seats spanning all columns</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setRearSeats(Math.max(0, rearSeats - 1))}
                          className="w-8 h-8 flex items-center justify-center bg-zinc-100 rounded-full font-bold hover:bg-zinc-200"
                        >
                          -
                        </button>
                        <span className="font-bold w-4 text-center text-zinc-700">{rearSeats}</span>
                        <button
                          type="button"
                          onClick={() => setRearSeats(rearSeats + 1)}
                          title="Increase rear seats"
                          aria-label="Increase rear seats"
                          className="w-8 h-8 flex items-center justify-center bg-[#1d348a] text-white rounded-full font-bold hover:bg-[#112368]"
                        >
                          <Plus className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                    {rearSeats > 0 && (
                      <div className="flex justify-center gap-1 bg-zinc-50 p-2 rounded-none border border-zinc-200">
                        {Array.from({length: rearSeats}).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded bg-sky-200 border border-sky-400 flex items-center justify-center" />
                        ))}
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => { setColumns([]); setRearSeats(0); setSelectedColumnIndex(null); }}
                    className="text-xs font-bold text-red-500 hover:text-red-600 underline uppercase"
                  >
                    Reset Layout
                  </button>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-[#1d348a] mb-2">
                  Account <span className="text-[#ff6802]">Setup</span>
                </h2>
                <p className="text-zinc-600 font-medium mb-8 uppercase tracking-wide">
                  Create your operator login credentials.
                </p>

                <div className="space-y-6">
                  <FloatingInput
                    id="company-email"
                    label="Company Email"
                    type="email"
                    value={companyEmail}
                    onChange={setCompanyEmail}
                    icon={Mail}
                  />

                  <FloatingInput
                    id="company-password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={setPassword}
                    icon={Lock}
                    rightSlot={
                      <button
                        type="button"
                        title={showPassword ? 'Hide password' : 'Show password'}
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#1d348a] transition-colors z-10"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />

                  <FloatingInput
                    id="company-confirm-password"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={setConfirmPassword}
                    icon={Lock}
                    rightSlot={
                      <button
                        type="button"
                        title={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-[#1d348a] transition-colors z-10"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <div className="pt-4 border-t-2 border-zinc-200 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 max-w-[160px] bg-white border-2 border-zinc-300 hover:border-[#1d348a] text-[#1d348a] py-4 font-bold uppercase tracking-wide transition-all flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </button>
            )}

            {step < totalSteps ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 bg-[#1d348a] hover:bg-[#112368] text-white py-4 font-bold uppercase tracking-wide transition-all flex items-center justify-center border-2 border-[#1d348a]"
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </button>
            ) : (
              <Link
                href="/auth/login"
                className="flex-1 bg-[#1d348a] hover:bg-[#112368] text-white py-4 font-bold uppercase tracking-wide transition-all flex items-center justify-center border-2 border-[#1d348a] text-sm"
              >
                Verify Email and Login <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
