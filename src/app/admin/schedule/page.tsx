'use client';

import { Bus, Calendar, Clock } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const routeOptions = [
  'Southbound - East Coast Line',
  'Southbound - West Coast Line',
  'Northbound - Eastern Line',
  'Northbound - Western Line',
];

const emptyNewBus = {
  busNumber: '',
  plateNumber: '',
  route: routeOptions[0],
  departureTime: '',
  arrivalTime: '',
  driver: '',
  status: 'On Standby' as 'Travelling' | 'On Standby',
};

// Mock data for buses
type BusSchedule = {
  id: string;
  busNumber: string;
  plateNumber: string;
  route: string;
  departureTime: string;
  arrivalTime: string;
  status: 'Travelling' | 'On Standby';
  driver: string;
};

const mockBuses: BusSchedule[] = [
  { id: 'BUS-001', busNumber: 'BUS-701', plateNumber: 'ABC-123', route: 'Southbound - East Coast Line', departureTime: '06:00 AM', arrivalTime: '09:30 AM', status: 'Travelling', driver: 'Juan Dela Cruz' },
  { id: 'BUS-002', busNumber: 'BUS-702', plateNumber: 'XYZ-789', route: 'Southbound - East Coast Line', departureTime: '07:00 AM', arrivalTime: '10:30 AM', status: 'Travelling', driver: 'Maria Santos' },
  { id: 'BUS-003', busNumber: 'BUS-703', plateNumber: 'DEF-456', route: 'Southbound - West Coast Line', departureTime: '08:00 AM', arrivalTime: '12:00 PM', status: 'Travelling', driver: 'Pedro Reyes' },
  { id: 'BUS-004', busNumber: 'BUS-704', plateNumber: 'GHI-321', route: 'Northbound - Eastern Line', departureTime: '09:00 AM', arrivalTime: '11:45 AM', status: 'On Standby', driver: 'Ana Lopez' },
  { id: 'BUS-005', busNumber: 'BUS-705', plateNumber: 'JKL-654', route: 'Northbound - Western Line', departureTime: '10:00 AM', arrivalTime: '02:00 PM', status: 'On Standby', driver: 'Carlos Mendez' },
  { id: 'BUS-006', busNumber: 'BUS-706', plateNumber: 'MNO-987', route: 'Southbound - East Coast Line', departureTime: '11:00 AM', arrivalTime: '02:30 PM', status: 'On Standby', driver: 'Luzviminda Cruz' },
  { id: 'BUS-007', busNumber: 'BUS-707', plateNumber: 'PQR-147', route: 'Northbound - Eastern Line', departureTime: '12:00 PM', arrivalTime: '03:00 PM', status: 'Travelling', driver: 'Roberto Garcia' },
  { id: 'BUS-008', busNumber: 'BUS-708', plateNumber: 'STU-258', route: 'Southbound - West Coast Line', departureTime: '01:00 PM', arrivalTime: '05:00 PM', status: 'On Standby', driver: 'Carmen Flores' },
];

export default function AdminSchedulePage() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<'all' | 'Travelling' | 'On Standby'>('all');
  const [buses, setBuses] = useState<BusSchedule[]>(mockBuses);

  const [newBusOpen, setNewBusOpen] = useState(false);
  const [newBus, setNewBus] = useState(emptyNewBus);

  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleBusId, setScheduleBusId] = useState('');
  const [scheduleRoute, setScheduleRoute] = useState(routeOptions[0]);
  const [scheduleDeparture, setScheduleDeparture] = useState('');
  const [scheduleArrival, setScheduleArrival] = useState('');

  const filteredBuses = statusFilter === 'all'
    ? buses
    : buses.filter((b) => b.status === statusFilter);

  const handleAddBus = () => {
    if (!newBus.busNumber || !newBus.plateNumber || !newBus.driver) {
      toast({
        title: 'Missing details',
        description: 'Bus number, plate number, and driver are required.',
        variant: 'destructive',
      });
      return;
    }
    const id = `BUS-${String(buses.length + 1).padStart(3, '0')}`;
    setBuses((prev) => [{ id, ...newBus }, ...prev]);
    toast({ title: 'Bus added', description: `${newBus.busNumber} has been added to the fleet.` });
    setNewBus(emptyNewBus);
    setNewBusOpen(false);
  };

  const handleCreateSchedule = () => {
    if (!scheduleBusId || !scheduleDeparture || !scheduleArrival) {
      toast({
        title: 'Missing details',
        description: 'Please select a bus and set departure and arrival times.',
        variant: 'destructive',
      });
      return;
    }
    setBuses((prev) =>
      prev.map((b) =>
        b.id === scheduleBusId
          ? { ...b, route: scheduleRoute, departureTime: scheduleDeparture, arrivalTime: scheduleArrival }
          : b,
      ),
    );
    const scheduledBus = buses.find((b) => b.id === scheduleBusId);
    toast({
      title: 'Schedule created',
      description: `${scheduledBus?.busNumber ?? 'Bus'} scheduled on ${scheduleRoute}.`,
    });
    setScheduleBusId('');
    setScheduleDeparture('');
    setScheduleArrival('');
    setScheduleRoute(routeOptions[0]);
    setScheduleOpen(false);
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-[#1d348a]">
          Schedule
        </h1>

        <div className="flex gap-2">
          <button
            onClick={() => setNewBusOpen(true)}
            className="border-2 border-[#1d348a] bg-white text-[#1d348a] px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-zinc-100 transition-colors"
          >
            + New Bus
          </button>
          <button
            onClick={() => setScheduleOpen(true)}
            className="border-2 border-[#ff6802] bg-[#ff6802] text-white px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-opacity-90 transition-opacity"
          >
            Create Schedule
          </button>
        </div>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="border-2 border-[#1d348a] bg-white p-5">
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-[#1d348a]" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">Total Buses</p>
              <p className="text-2xl font-black text-[#1d348a]">{buses.length}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-emerald-600 bg-white p-5">
          <div className="flex items-center gap-3">
            <Bus className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">Travelling</p>
              <p className="text-2xl font-black text-emerald-600">{buses.filter(b => b.status === 'Travelling').length}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-amber-600 bg-white p-5">
          <div className="flex items-center gap-3">
            <Clock className="h-6 w-6 text-amber-600" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">On Standby</p>
              <p className="text-2xl font-black text-amber-600">{buses.filter(b => b.status === 'On Standby').length}</p>
            </div>
          </div>
        </div>

        <div className="border-2 border-zinc-600 bg-white p-5">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-zinc-600" />
            <div>
              <p className="text-xs font-bold uppercase text-zinc-600">Routes Active</p>
              <p className="text-2xl font-black text-zinc-600">4</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buses Table */}
      <div className="border-2 border-[#1d348a] bg-white overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr className="border-b-2 border-[#1d348a] bg-zinc-50">
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Bus Number</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Plate Number</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Route</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Departure</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Arrival</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Driver</th>
              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-tight text-zinc-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBuses.map((bus) => (
              <tr key={bus.id} className="border-b-2 border-[#1d348a]/10 last:border-0">
                <td className="px-4 py-3 text-sm font-medium text-[#1d348a]">{bus.busNumber}</td>
                <td className="px-4 py-3 text-sm font-mono text-zinc-700">{bus.plateNumber}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.route}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.departureTime}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.arrivalTime}</td>
                <td className="px-4 py-3 text-sm font-medium text-zinc-700">{bus.driver}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-tight rounded-full border-2 ${
                      bus.status === 'Travelling'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-600'
                        : 'bg-amber-50 text-amber-700 border-amber-600'
                    }`}
                  >
                    {bus.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Bus Modal */}
      <Dialog open={newBusOpen} onOpenChange={setNewBusOpen}>
        <DialogContent className="rounded-none sm:rounded-none border-2 border-[#1d348a] bg-white text-[#1d348a]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-[#1d348a]">
              New Bus
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="new-bus-number" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Bus Number</label>
              <input
                id="new-bus-number"
                value={newBus.busNumber}
                onChange={(e) => setNewBus({ ...newBus, busNumber: e.target.value })}
                placeholder="BUS-709"
                className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="new-bus-plate" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Plate Number</label>
              <input
                id="new-bus-plate"
                value={newBus.plateNumber}
                onChange={(e) => setNewBus({ ...newBus, plateNumber: e.target.value.toUpperCase() })}
                placeholder="ABC-123"
                className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="new-bus-route" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Route</label>
              <select
                id="new-bus-route"
                value={newBus.route}
                onChange={(e) => setNewBus({ ...newBus, route: e.target.value })}
                className="w-full appearance-none border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              >
                {routeOptions.map((route) => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="new-bus-departure" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Departure</label>
              <input
                id="new-bus-departure"
                value={newBus.departureTime}
                onChange={(e) => setNewBus({ ...newBus, departureTime: e.target.value })}
                placeholder="06:00 AM"
                className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="new-bus-arrival" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Arrival</label>
              <input
                id="new-bus-arrival"
                value={newBus.arrivalTime}
                onChange={(e) => setNewBus({ ...newBus, arrivalTime: e.target.value })}
                placeholder="09:30 AM"
                className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="new-bus-driver" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Driver</label>
              <input
                id="new-bus-driver"
                value={newBus.driver}
                onChange={(e) => setNewBus({ ...newBus, driver: e.target.value })}
                placeholder="Juan Dela Cruz"
                className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              />
            </div>
            <div>
              <label htmlFor="new-bus-status" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Status</label>
              <select
                id="new-bus-status"
                value={newBus.status}
                onChange={(e) => setNewBus({ ...newBus, status: e.target.value as 'Travelling' | 'On Standby' })}
                className="w-full appearance-none border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              >
                <option value="On Standby">On Standby</option>
                <option value="Travelling">Travelling</option>
              </select>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setNewBusOpen(false)}
              className="border-2 border-[#1d348a] bg-white text-[#1d348a] px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddBus}
              className="border-2 border-[#ff6802] bg-[#ff6802] text-white px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-opacity-90 transition-opacity"
            >
              Add Bus
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Schedule Modal */}
      <Dialog open={scheduleOpen} onOpenChange={setScheduleOpen}>
        <DialogContent className="rounded-none sm:rounded-none border-2 border-[#1d348a] bg-white text-[#1d348a]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-[#1d348a]">
              Create Schedule
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label htmlFor="schedule-bus" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Bus</label>
              <select
                id="schedule-bus"
                value={scheduleBusId}
                onChange={(e) => setScheduleBusId(e.target.value)}
                className="w-full appearance-none border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              >
                <option value="">Select a bus</option>
                {buses.map((bus) => (
                  <option key={bus.id} value={bus.id}>{bus.busNumber} • {bus.plateNumber}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="schedule-route" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Route</label>
              <select
                id="schedule-route"
                value={scheduleRoute}
                onChange={(e) => setScheduleRoute(e.target.value)}
                className="w-full appearance-none border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
              >
                {routeOptions.map((route) => (
                  <option key={route} value={route}>{route}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="schedule-departure" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Departure</label>
                <input
                  id="schedule-departure"
                  value={scheduleDeparture}
                  onChange={(e) => setScheduleDeparture(e.target.value)}
                  placeholder="06:00 AM"
                  className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
                />
              </div>
              <div>
                <label htmlFor="schedule-arrival" className="mb-2 block text-xs font-bold uppercase tracking-tight text-zinc-600">Arrival</label>
                <input
                  id="schedule-arrival"
                  value={scheduleArrival}
                  onChange={(e) => setScheduleArrival(e.target.value)}
                  placeholder="09:30 AM"
                  className="w-full border-2 border-[#1d348a] bg-white px-4 py-2 text-sm text-[#1d348a] focus:outline-none focus:bg-zinc-100"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button
              onClick={() => setScheduleOpen(false)}
              className="border-2 border-[#1d348a] bg-white text-[#1d348a] px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-zinc-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSchedule}
              className="border-2 border-[#ff6802] bg-[#ff6802] text-white px-4 py-2 font-bold uppercase tracking-tight text-xs hover:bg-opacity-90 transition-opacity"
            >
              Create Schedule
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}