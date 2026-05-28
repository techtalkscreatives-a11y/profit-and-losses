import React, { useState } from 'react';
import { Reservation } from '../types';

interface ReservationSystemProps {
  reservations: Reservation[];
  onAddReservation: (res: Reservation) => Promise<boolean>;
  onDeleteReservation: (id: string) => Promise<boolean>;
  currentUser: any;
}

const AVAILABLE_AREAS = [
  'Main Dining Hall',
  'Garden Oasis',
  'Seaside Patio',
  'Sunset Veranda',
  'VIP Lounge Saloon',
];

export function ReservationSystemComponent({
  reservations,
  onAddReservation,
  onDeleteReservation,
  currentUser,
}: ReservationSystemProps) {
  // Calendar states
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(4); // 0-indexed, meaning May is Index 4
  const [selectedDate, setSelectedDate] = useState('2026-05-28'); // Initial default

  // Booking details modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDate, setNewDate] = useState('2026-05-28');
  const [newTime, setNewTime] = useState('18:00');
  const [newTable, setNewTable] = useState('Table 5');
  const [newArea, setNewArea] = useState('Main Dining Hall');
  const [newCount, setNewCount] = useState(4);
  const [newStatus, setNewStatus] = useState<'Pending' | 'Confirmed' | 'Cancelled'>('Confirmed');
  const [newNotes, setNewNotes] = useState('');
  const [newAdvanceOrders, setNewAdvanceOrders] = useState('');
  const [newAdvanceOrderType, setNewAdvanceOrderType] = useState<'Dine In' | 'Take Out'>('Dine In');
  const [newPwdAlert, setNewPwdAlert] = useState(false);
  const [newSeniorAlert, setNewSeniorAlert] = useState(false);
  const [newAllergens, setNewAllergens] = useState('');

  // Filtering list state
  const [listFilterStatus, setListFilterStatus] = useState<'All' | 'Pending' | 'Confirmed' | 'Cancelled'>('All');
  const [listFilterArea, setListFilterArea] = useState<string>('All');
  const [searchLedger, setSearchLedger] = useState('');

  const MONTH_NAMES = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Logic to build month calendars
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay(); // 0 is Sunday, 6 is Saturday
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const startDayOfWeek = getFirstDayOfMonth(currentYear, currentMonth);

  // Generate calendar cells (blanks then days)
  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarCells.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarCells.push(day);
  }

  // Helper to format Date string
  const formatCellDate = (dayNum: number) => {
    const mm = String(currentMonth + 1).padStart(2, '0');
    const dd = String(dayNum).padStart(2, '0');
    return `${currentYear}-${mm}-${dd}`;
  };

  // Submit new booking
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newDate || !newTable.trim()) {
      alert("Please enter a valid guest name, table, and reservation date.");
      return;
    }

    const payload: Reservation = {
      id: `res-${Date.now()}`,
      date: newDate,
      time: newTime,
      customerName: newName,
      phone: newPhone || 'N/A',
      guestCount: Number(newCount) || 1,
      pwdAlert: newPwdAlert,
      seniorAlert: newSeniorAlert,
      allergens: newAllergens || '',
      tableNo: newTable,
      area: newArea,
      status: newStatus,
      notes: newNotes,
      advanceOrderType: newAdvanceOrderType,
      advanceOrderNotes: newAdvanceOrders,
      email: newEmail || ''
    } as any; // Cast in case types.ts hasn't added email yet

    const ok = await onAddReservation(payload);
    if (ok) {
      setShowAddModal(false);
      // Reset form controls
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewNotes('');
      setNewAdvanceOrders('');
      setNewAllergens('');
      setNewPwdAlert(false);
      setNewSeniorAlert(false);
      setNewCount(4);
    }
  };

  // Update status changes
  const handleUpdateStatus = async (item: Reservation, status: 'Pending' | 'Confirmed' | 'Cancelled') => {
    const updated = {
      ...item,
      status,
    };
    await onAddReservation(updated);
  };

  // Filtered reservations ledger based on selectedDate and filters
  const filteredBookingsList = reservations.filter((res) => {
    // Search match
    const matchesSearch = 
      res.customerName.toLowerCase().includes(searchLedger.toLowerCase()) ||
      res.tableNo.toLowerCase().includes(searchLedger.toLowerCase()) ||
      res.phone.includes(searchLedger) ||
      (res.notes && res.notes.toLowerCase().includes(searchLedger.toLowerCase()));

    // Status filter
    const matchesStatus = listFilterStatus === 'All' || res.status === listFilterStatus;

    // Area filter
    const matchesArea = listFilterArea === 'All' || res.area === listFilterArea;

    return matchesSearch && matchesStatus && matchesArea;
  });

  return (
    <div className="space-y-4">
      {/* HEADER SECTION */}
      <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
            📅 Reservation Calendar & Interactive Ledger
          </h2>
          <p className="text-[10px] text-gray-400">Manage fine-dining dining room placement, food pre-orders, and allergens safeguards</p>
        </div>
        <button
          onClick={() => {
            setNewDate(selectedDate);
            setShowAddModal(true);
          }}
          className="rounded bg-blue-700 px-4 py-2 text-xs font-black text-white uppercase hover:bg-blue-800 tracking-wider shadow-sm"
        >
          ➕ Create New Booking
        </button>
      </div>

      {/* TOP LAYER: INTERACTIVE CALENDAR GRID VS ACTIVE LEDGER CONTAINER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
        
        {/* CALENDAR VIEW (8 COLS) */}
        <div className="xl:col-span-8 bg-white border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col text-left">
          
          <div className="flex items-center justify-between border-b pb-3 mb-3">
            <h3 className="text-xs font-black uppercase text-gray-700 tracking-wider">
              📅 Month-at-a-Glance Planner Grid
            </h3>
            <div className="flex items-center space-x-2 select-none">
              <button 
                onClick={prevMonth}
                className="h-7 w-7 rounded bg-gray-100 hover:bg-gray-200 border flex items-center justify-center font-bold text-xs"
              >
                ◀
              </button>
              <span className="text-xs font-black uppercase text-blue-900 px-3 py-1 font-mono bg-blue-50/50 rounded border">
                {MONTH_NAMES[currentMonth]} {currentYear}
              </span>
              <button 
                onClick={nextMonth}
                className="h-7 w-7 rounded bg-gray-100 hover:bg-gray-200 border flex items-center justify-center font-bold text-xs"
              >
                ▶
              </button>
            </div>
          </div>

          {/* Sizing grid titles */}
          <div className="grid grid-cols-7 gap-1.5 text-center text-[9px] font-black uppercase text-gray-400 border-b pb-1">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Grid Cells */}
          <div className="grid grid-cols-7 gap-1.5 mt-2 min-h-[360px]">
            {calendarCells.map((dayNum, index) => {
              if (dayNum === null) {
                return <div key={`empty-${index}`} className="bg-gray-50/50 rounded-lg border border-dashed border-gray-200"></div>;
              }

              const cellDateStr = formatCellDate(dayNum);
              const dayBookings = reservations.filter(r => r.date === cellDateStr);
              const isSelected = selectedDate === cellDateStr;

              return (
                <div
                  key={`day-${dayNum}`}
                  onClick={() => setSelectedDate(cellDateStr)}
                  className={`rounded-lg border p-1.5 flex flex-col justify-between cursor-pointer transition min-h-[64px] hover:shadow-xs group ${
                    isSelected 
                      ? 'bg-blue-50/70 border-blue-600 ring-1 ring-blue-500' 
                      : 'bg-white border-gray-250 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className={`h-5 w-5 rounded-full flex items-center justify-center ${
                      isSelected ? 'bg-blue-600 text-white shadow' : 'text-gray-900 group-hover:bg-gray-100'
                    }`}>
                      {dayNum}
                    </span>
                    {dayBookings.length > 0 && (
                      <span className="rounded-full bg-blue-100 text-blue-800 text-[8px] font-mono font-black px-1 py-0.5" title={`${dayBookings.length} Bookings Scheduled`}>
                        {dayBookings.length}
                      </span>
                    )}
                  </div>

                  {/* List bookings summary elements */}
                  <div className="space-y-0.5 mt-1 overflow-y-hidden max-h-[38px] select-none text-[8px] leading-tight">
                    {dayBookings.slice(0, 2).map((booking) => {
                      let colorClass = 'bg-yellow-50 text-yellow-800 border-yellow-200';
                      if (booking.status === 'Confirmed') colorClass = 'bg-green-50 text-green-800 border-green-200';
                      if (booking.status === 'Cancelled') colorClass = 'bg-red-50 text-red-700 border-red-200';

                      return (
                        <div 
                          key={booking.id} 
                          className={`px-1 py-0.5 rounded truncate border font-bold ${colorClass}`}
                          title={`${booking.customerName} @ ${booking.time} [${booking.tableNo}]`}
                        >
                          {booking.tableNo}: {booking.customerName}
                        </div>
                      );
                    })}
                    {dayBookings.length > 2 && (
                      <p className="text-[7px] text-gray-400 font-extrabold uppercase text-right leading-none">
                        + {dayBookings.length - 2} more...
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LEDGER DETAILS PANEL (4 COLS) */}
        <div className="xl:col-span-4 bg-white border border-gray-300 rounded-xl p-4 shadow-sm flex flex-col text-left justify-between">
          <div className="space-y-3">
            <div className="border-b pb-2">
              <span className="text-[9px] font-black uppercase text-gray-400">Date-Specific Schedule Inspector</span>
              <h3 className="text-xs font-black uppercase text-blue-950 font-mono flex items-center gap-1.5 mt-0.5">
                📅 Bookings on: {selectedDate}
              </h3>
            </div>

            {/* List entries scheduled on this selected date */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {reservations.filter(r => r.date === selectedDate).length === 0 ? (
                <div className="py-12 text-center text-gray-450 italic">
                  <p className="text-[10px] font-extrabold uppercase">No table reservations scheduled</p>
                  <p className="text-[9px] text-gray-400 mt-1">Tap "+ Create New Booking" above to schedule a client for {selectedDate}.</p>
                </div>
              ) : (
                reservations.filter(r => r.date === selectedDate).map((booking) => {
                  let alertBadge = 'border-gray-200 bg-gray-50 text-gray-700';
                  if (booking.status === 'Confirmed') alertBadge = 'border-green-300 bg-green-50 text-green-800';
                  if (booking.status === 'Cancelled') alertBadge = 'border-red-300 bg-red-50 text-red-700';

                  return (
                    <div key={booking.id} className="rounded-lg border border-gray-200 p-3 text-xs leading-normal font-semibold text-gray-700 bg-gray-50/50 space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-extrabold text-blue-950 text-xs">{booking.customerName}</p>
                          <p className="text-[9px] font-mono text-gray-500">{booking.time} • {booking.guestCount} Guests</p>
                        </div>
                        <span className={`px-1.5 py-0.5 rounded text-[8px] border font-black uppercase tracking-wider ${alertBadge}`}>
                          {booking.status}
                        </span>
                      </div>

                      <div className="text-[10px] space-y-1 bg-white border border-gray-150 p-2 rounded">
                        <p><span className="text-gray-400 font-bold uppercase">Table:</span> {booking.tableNo} ({booking.area})</p>
                        {booking.phone && <p><span className="text-gray-400 font-bold">Phone:</span> <span className="font-mono text-blue-900">{booking.phone}</span></p>}
                        {(booking as any).email && <p><span className="text-gray-400 font-bold">Email:</span> <span className="font-mono text-gray-600">{(booking as any).email}</span></p>}
                        
                        {/* Allergens flagged status */}
                        {booking.allergens ? (
                          <p className="text-orange-655 font-bold bg-orange-50 px-1 border border-orange-100 rounded inline-block mt-1">
                            ⚠ Allergens alert: {booking.allergens}
                          </p>
                        ) : (
                          <p className="text-[9px] text-gray-400 font-medium">No allergies noted</p>
                        )}

                        {booking.pwdAlert && (
                          <p className="text-[9px] text-red-655 font-bold uppercase">♿ PWD Guest Accommodation Needed</p>
                        )}
                        {booking.seniorAlert && (
                          <p className="text-[9px] text-indigo-700 font-bold uppercase">⭐ Senior Citizen Benefits claim</p>
                        )}

                        {booking.advanceOrderNotes && (
                          <div className="mt-1 border-t pt-1 border-dashed text-gray-800">
                            <span className="text-[9px] text-gray-400 font-bold uppercase block">{booking.advanceOrderType || 'Dine In'} Pre-Cook Order:</span>
                            <p className="bg-slate-50 border p-1 rounded italic text-gray-600">"{booking.advanceOrderNotes}"</p>
                          </div>
                        )}

                        {booking.notes && (
                          <p className="mt-1 text-gray-600 block"><span className="text-gray-400 font-bold">Special Notes:</span> "{booking.notes}"</p>
                        )}
                      </div>

                      {/* Status modifiers buttons */}
                      <div className="flex justify-between items-center gap-1.5 pt-1">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleUpdateStatus(booking, 'Confirmed')}
                            className="bg-green-100 text-green-800 border hover:bg-green-200 rounded px-1.5 py-0.5 text-[9px] font-black"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking, 'Cancelled')}
                            className="bg-red-105 text-red-700 border hover:bg-red-200 rounded px-1.5 py-0.5 text-[9px] font-black"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(booking, 'Pending')}
                            className="bg-yellow-100 text-yellow-800 border hover:bg-yellow-200 rounded px-1.5 py-0.5 text-[9px] font-black"
                          >
                            Pending
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            if (confirm(`Remove reservation ledger entry for ${booking.customerName}?`)) {
                              onDeleteReservation(booking.id);
                            }
                          }}
                          className="text-red-500 hover:underline uppercase text-[9px] font-extrabold"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>

      {/* FILTERABLE LEDGER DIRECTORY SEARCH */}
      <div className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm text-left">
        <div className="border-b pb-3 mb-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 className="text-xs font-black uppercase text-gray-800">
              📋 Complete Reservations Directory & Guest Ledger
            </h3>
            <p className="text-[9px] text-gray-400">Search and audit all guests reservations database with confirmation details and location</p>
          </div>

          <div className="flex flex-wrap gap-2 text-xs font-bold font-mono">
            {/* Filter by Status */}
            <select
              value={listFilterStatus}
              onChange={(e) => setListFilterStatus(e.target.value as any)}
              className="rounded border border-gray-300 p-1 bg-white font-sans text-xs"
            >
              <option value="All">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            {/* Filter by Area */}
            <select
              value={listFilterArea}
              onChange={(e) => setListFilterArea(e.target.value)}
              className="rounded border border-gray-300 p-1 bg-white font-sans text-xs"
            >
              <option value="All">All Locations</option>
              {AVAILABLE_AREAS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>

            {/* Search Input term */}
            <input
              type="text"
              placeholder="🔍 Search ledger name/phone/notes..."
              value={searchLedger}
              onChange={(e) => setSearchLedger(e.target.value)}
              className="rounded border border-gray-350 p-1 px-2 focus:ring-1 focus:ring-blue-500 outline-none w-56 font-sans text-xs font-medium"
            />
          </div>
        </div>

        {/* Directory Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-medium">
            <thead className="bg-gray-100 border-b text-gray-500 uppercase tracking-widest text-[9px] font-black">
              <tr>
                <th className="py-2.5 px-3">Date & Time</th>
                <th className="py-2.5 px-3">Client Customer Details</th>
                <th className="py-2.5 px-3">Table assigned</th>
                <th className="py-2.5 px-3">Guests Count</th>
                <th className="py-2.5 px-3">Alerts / Allergies</th>
                <th className="py-2.5 px-3">Pre-Cook order</th>
                <th className="py-2.5 px-3">Booking Status</th>
                <th className="py-2.5 px-3 text-center">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150 text-gray-700">
              {filteredBookingsList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 italic">
                    No reservations matching current directory filters found.
                  </td>
                </tr>
              ) : (
                filteredBookingsList.map((res) => {
                  let alertBadge = 'bg-yellow-100 text-yellow-800';
                  if (res.status === 'Confirmed') alertBadge = 'bg-green-150 text-green-800';
                  if (res.status === 'Cancelled') alertBadge = 'bg-red-400 text-red-950 font-semibold';

                  return (
                    <tr key={res.id} className="hover:bg-gray-50/50">
                      <td className="py-2.5 px-3 font-bold text-gray-950 font-mono whitespace-nowrap">
                        {res.date} <span className="text-gray-400 font-normal">@</span> {res.time}
                      </td>
                      <td className="py-2.5 px-3">
                        <p className="font-extrabold text-blue-900">{res.customerName}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{res.phone}</p>
                        {(res as any).email && <p className="text-[9px] text-gray-400 truncate max-w-[140px]">{(res as any).email}</p>}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        {res.tableNo} <span className="text-[10px] text-gray-500 font-normal block">{res.area}</span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-gray-900 text-center">
                        {res.guestCount} Pax
                      </td>
                      <td className="py-2.5 px-3">
                        {res.allergens && <p className="text-[10px] text-orange-600 font-bold">🧬 {res.allergens}</p>}
                        {res.pwdAlert && <p className="text-[9px] text-indigo-700 font-bold uppercase mt-0.5">♿ PWD Included</p>}
                        {res.seniorAlert && <p className="text-[9px] text-green-700 font-bold uppercase">👵 Senior Discount</p>}
                        {!res.allergens && !res.pwdAlert && !res.seniorAlert && <span className="text-gray-400 text-[10px]">None</span>}
                      </td>
                      <td className="py-2.5 px-3">
                        {res.advanceOrderNotes ? (
                          <div>
                            <span className="text-[9px] font-black uppercase text-blue-800 block leading-none">{res.advanceOrderType}</span>
                            <p className="text-[10px] text-gray-600 block line-clamp-1 italic">"{res.advanceOrderNotes}"</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-[10px]">No advance orders</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 font-bold">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border border-gray-150 shadow-xs ${alertBadge}`}>
                          {res.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <select
                          value={res.status}
                          onChange={(e) => handleUpdateStatus(res, e.target.value as any)}
                          className="rounded border border-gray-300 p-1 text-[10px] font-bold font-sans bg-white outline-none"
                        >
                          <option value="Confirmed">Confirmed</option>
                          <option value="Pending">Pending</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MANUAL BOOKING INPUT DIALOG MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 animate-fade-in backdrop-blur-xs">
          <form onSubmit={handleAddSubmit} className="w-full max-w-lg rounded-xl border border-gray-200 bg-white p-5 shadow-2xl relative text-left">
            <button 
              type="button"
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 text-lg font-bold"
            >
              ✕
            </button>

            <h3 className="text-sm font-black uppercase tracking-wider text-blue-905 border-b pb-2 mb-3.5 flex items-center gap-1.5">
              📅 Manual Table Reservation Form
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs leading-normal font-semibold text-gray-700">
              
              {/* Guest Details Group */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2 bg-blue-50/50 p-2.5 rounded-lg border border-blue-150">
                <span className="md:col-span-3 text-[10px] font-black uppercase tracking-wider text-blue-800">
                  👤 Guest Contact Details
                </span>
                
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500">FullName *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    placeholder="e.g. Juan De La Cruz"
                    className="w-full rounded border border-gray-300 p-1.5 mt-1 outline-none font-medium text-xs font-sans bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500">Email Address</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="e.g. juan@sample.com"
                    className="w-full rounded border border-gray-300 p-1.5 mt-1 outline-none font-medium text-xs font-sans bg-white focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-500">Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g. 09151234455"
                    className="w-full rounded border border-gray-300 p-1.5 mt-1 outline-none font-medium text-mono text-xs focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </div>
              </div>

              {/* Schedule Details Group */}
              <div>
                <label className="text-[10px] font-black uppercase text-gray-500">Date (YYYY-MM-DD)</label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  required
                  className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-medium"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500">Arrival Time</label>
                <input
                  type="text"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  placeholder="e.g. 18:30"
                  required
                  className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500">Table Placement *</label>
                <input
                  type="text"
                  value={newTable}
                  onChange={(e) => setNewTable(e.target.value)}
                  required
                  placeholder="e.g. Table 10 / B Banquet"
                  className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500">Area / Location Placement</label>
                <select
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  className="w-full rounded border border-gray-300 p-2 mt-1 bg-white outline-none focus:ring-1 focus:ring-blue-500 text-xs text-slate-800"
                >
                  {AVAILABLE_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500">Header Pax Count (Guests)</label>
                <input
                  type="number"
                  value={newCount}
                  onChange={(e) => setNewCount(Math.max(1, Number(e.target.value)))}
                  min="1"
                  className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-gray-500">Initial Approval status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as any)}
                  className="w-full rounded border border-gray-300 p-2 mt-1 bg-white outline-none focus:ring-1 focus:ring-blue-500 text-xs"
                >
                  <option value="Confirmed">Confirmed Bookings</option>
                  <option value="Pending">Pending Audit</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* Special Pre-Cook Advance orders & notes */}
              <div className="md:col-span-2 border-t pt-2 border-dashed grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="md:col-span-1">
                  <label className="text-[9px] font-black uppercase text-amber-700">Dine-In/Takeout Option</label>
                  <select
                    value={newAdvanceOrderType}
                    onChange={(e) => setNewAdvanceOrderType(e.target.value as any)}
                    className="w-full rounded border border-gray-300 p-1.5 mt-1 bg-white outline-none text-xs"
                  >
                    <option value="Dine In">Dine-In Area</option>
                    <option value="Take Out">Take-Out Pre-cook</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-[9px] font-black uppercase text-amber-700">Advance Pre-Selected Orders / Menu</label>
                  <input
                    type="text"
                    value={newAdvanceOrders}
                    onChange={(e) => setNewAdvanceOrders(e.target.value)}
                    placeholder="e.g. 1x Roasted Pork Tray, 2x Regular Fresh Salads"
                    className="w-full rounded border border-gray-300 p-1.5 mt-1 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="md:col-span-2 bg-gray-50 p-2.5 rounded border border-gray-200">
                <span className="text-[10px] font-black uppercase text-gray-500">🧬 Allergen & PWD Safeguards Alerts</span>
                
                <div className="grid grid-cols-1 md:grid-cols-1 gap-2 mt-1.5">
                  <div>
                    <label className="text-[9px] font-bold text-gray-400 uppercase">Specific Allergens Notes</label>
                    <input
                      type="text"
                      value={newAllergens}
                      onChange={(e) => setNewAllergens(e.target.value)}
                      placeholder="e.g. Shellfish allergy, peanut avoidances"
                      className="w-full rounded border border-gray-300 p-1.5 mt-0.5 outline-none font-medium text-xs bg-white focus:ring-1 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center space-x-6 pt-1">
                    <label className="inline-flex items-center space-x-2 text-[10px] font-black uppercase text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newPwdAlert} 
                        onChange={(e) => setNewPwdAlert(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>PWD Guest Accommodation</span>
                    </label>

                    <label className="inline-flex items-center space-x-2 text-[10px] font-black uppercase text-gray-600 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={newSeniorAlert} 
                        onChange={(e) => setNewSeniorAlert(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span>Senior Citizen Benefits</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-[10px] font-black uppercase text-gray-500">Special Notes / Room Requests description</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Near glass window, birthday celebration setup, etc."
                  rows={2}
                  className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none text-xs font-semibold"
                />
              </div>

            </div>

            <div className="flex justify-end space-x-2 border-t pt-3.5 mt-4">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="rounded border border-gray-300 bg-white px-4 py-2 text-xs font-bold text-gray-700 uppercase hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-blue-700 px-5 py-2 text-xs font-bold text-white uppercase hover:bg-blue-800 shadow-sm"
              >
                Save Reservation Ledger
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
