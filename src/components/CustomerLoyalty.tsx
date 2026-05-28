import React, { useState } from 'react';
import { CustomerCard, SaleTransaction } from '../types';
import { stampAuditLog } from '../firebaseService';

interface CustomerLoyaltyProps {
  customers: CustomerCard[];
  sales: SaleTransaction[];
  onAddOrUpdateCustomer: (customer: CustomerCard) => Promise<boolean>;
  formatMoney: (amount: number) => string;
}

export function CustomerLoyaltyComponent({
  customers,
  sales,
  onAddOrUpdateCustomer,
  formatMoney,
}: CustomerLoyaltyProps) {
  const [showLedgerOnly, setShowLedgerOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create / Register state
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCode, setNewCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to determine customer loyalty tiers
  const getLoyaltyTier = (visits: number) => {
    if (visits >= 10) return { name: 'Platinum Sovereign VIP 👑', discount: 15, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
    if (visits >= 6) return { name: 'Gold Club Elite 🥇', discount: 10, color: 'bg-amber-100 text-amber-800 border-amber-200' };
    if (visits >= 3) return { name: 'Silver Member 🥈', discount: 5, color: 'bg-slate-100 text-slate-800 border-slate-200' };
    return { name: 'Bronze Member 🥉', discount: 0, color: 'bg-orange-50 text-orange-700 border-orange-100 font-medium' };
  };

  // Filter & Rank customers
  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.loyaltyCode.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Rank by visits descending for the "visit rankings" ledger view
  const rankedCustomers = [...filteredCustomers].sort((a, b) => (b.visits || 0) - (a.visits || 0));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      alert("Please provide the Customer's Full Name.");
      return;
    }
    setIsSubmitting(true);
    try {
      const generatedCode = newCode.trim() || `L-${1000 + customers.length + 1}`;
      const newCust: CustomerCard = {
        id: `cust-${Date.now()}`,
        fullName: newName,
        phone: newPhone || 'N/A',
        visits: 0,
        spend: 0,
        loyaltyCode: generatedCode,
        email: newEmail || ''
      } as any; // Cast for optional email

      const ok = await onAddOrUpdateCustomer(newCust);
      if (ok) {
        setNewName('');
        setNewPhone('');
        setNewEmail('');
        setNewCode('');
        alert(`Successfully registered ${newName} as a Loyalty Member! CODE: ${generatedCode}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Quick Visit Adjusters
  const handleAdjustVisits = async (cust: CustomerCard, diff: number) => {
    const updated: CustomerCard = {
      ...cust,
      visits: Math.max(0, (cust.visits || 0) + diff),
    };
    await onAddOrUpdateCustomer(updated);
  };

  // Compute stats
  const totalVisits = customers.reduce((sum, c) => sum + (c.visits || 0), 0);
  const totalSpend = customers.reduce((sum, c) => sum + (c.spend || 0), 0);

  return (
    <div className="space-y-4">
      {/* Header and Controls */}
      <div className="border-b pb-2 flex flex-col sm:flex-row sm:items-center sm:justify-between whitespace-nowrap gap-3">
        <div>
          <h2 className="text-sm font-black uppercase tracking-wider text-gray-800 flex items-center gap-1.5">
            🌟 VIP Customer Loyalty & Visit History Monitor
          </h2>
          <p className="text-[10px] text-gray-400">Track visit counts, accumulate sales spend, and unlock tier-based discounts</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowLedgerOnly(!showLedgerOnly)}
            className={`rounded px-3.5 py-1.5 text-xs font-bold uppercase transition flex items-center gap-1 shadow-sm ${
              showLedgerOnly 
                ? 'bg-amber-600 text-white hover:bg-amber-700' 
                : 'bg-blue-700 text-white hover:bg-blue-800'
            }`}
          >
            📊 {showLedgerOnly ? 'Show All Loyalty Options' : 'View Loyalty Lead Ledger & Visit Rankings'}
          </button>
        </div>
      </div>

      {/* Bento Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-extrabold uppercase text-gray-500">Registered Loyalty Members</span>
          <p className="text-xl font-black text-blue-900 mt-1">{customers.length} Guests</p>
          <span className="text-[8px] text-gray-400 uppercase mt-1">Exclusive VIP guest list database</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-extrabold uppercase text-gray-500">Total Loyalty Visits Logged</span>
          <p className="text-xl font-black text-amber-700 mt-1">{totalVisits} Total Visits</p>
          <span className="text-[8px] text-gray-400 uppercase mt-1">Average visits: {customers.length ? (totalVisits / customers.length).toFixed(1) : 0} per guest</span>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[9px] font-extrabold uppercase text-gray-500">Total Loyalty Sales Spend</span>
          <p className="text-xl font-black text-green-700 mt-1">{formatMoney(totalSpend)}</p>
          <span className="text-[8px] text-gray-400 uppercase mt-1">Cumulative sales recorded via loyalty codes</span>
        </div>
      </div>

      {/* Main split dashboard view */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Registration Panel (Hidden if showing ranked ledger) */}
        {!showLedgerOnly && (
          <div className="lg:col-span-1">
            <form onSubmit={handleRegister} className="bg-white rounded-xl border border-gray-350 p-4 shadow-sm space-y-3 text-left">
              <h3 className="text-xs font-black uppercase tracking-wider text-blue-950 border-b pb-2 flex items-center gap-1">
                ➕ Register New Member
              </h3>
              <div className="space-y-3 text-xs leading-normal font-semibold text-gray-700">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500">Customer Full Name *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                    className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Maria Clara Castaneda"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500">Email Address (Optional)</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none"
                    placeholder="e.g. maria@sample.com"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                    placeholder="e.g. 09151234455"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-500">Loyalty Code (Optional)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full rounded border border-gray-300 p-2 mt-1 focus:ring-1 focus:ring-blue-500 outline-none font-mono uppercase"
                    placeholder="Leave blank to auto-generate (L-100X)"
                  />
                </div>

                <div className="bg-blue-50/50 p-2.5 rounded-lg border border-blue-100 text-[10px] text-gray-600 leading-normal">
                  💡 Loyalty members unlock cash discounts dynamically at checkout once their visit counts reach tier limits:
                  <ul className="list-disc pl-4 mt-1.5 space-y-0.5">
                    <li><strong className="text-gray-900">Silver (3+ visits)</strong>: 5% Off</li>
                    <li><strong className="text-gray-900">Gold (6+ visits)</strong>: 10% Off</li>
                    <li><strong className="text-gray-900">Platinum (10+ visits)</strong>: 15% Off</li>
                  </ul>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded bg-blue-700 hover:bg-blue-800 text-white font-extrabold uppercase p-2.5 transition text-xs shadow-sm"
                >
                  {isSubmitting ? 'Registering...' : 'Register VIP Loyalty Card'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Member list section */}
        <div className={showLedgerOnly ? "lg:col-span-3 bg-white rounded-xl border border-gray-300 p-4 shadow-sm" : "lg:col-span-2 bg-white rounded-xl border border-gray-300 p-4 shadow-sm"}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-3 mb-3 gap-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-800">
              {showLedgerOnly ? '📊 Dedicated Loyalty Leaderboard & Rankings (By Visit Count)' : '📋 Loyalty Database Search'}
            </h3>
            <input
              type="text"
              placeholder="🔍 Search name, phone number or loyalty code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="rounded border border-gray-300 px-2.5 py-1 text-xs font-medium focus:ring-1 focus:ring-blue-500 outline-none w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-medium">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wider text-[9px] font-black">
                <tr>
                  <th className="py-2 px-3">Code / ID</th>
                  <th className="py-2 px-3">Full Name / Contact</th>
                  <th className="py-2 px-3 text-center">Visits Count</th>
                  <th className="py-2 px-3">Loyalty Tier Benefits</th>
                  <th className="py-2 px-3 text-right">Cumulative Spend</th>
                  <th className="py-2 px-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-gray-700">
                {(showLedgerOnly ? rankedCustomers : filteredCustomers).length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 italic">
                      No matching loyalty records found. Register them on the left pane!
                    </td>
                  </tr>
                ) : (
                  (showLedgerOnly ? rankedCustomers : filteredCustomers).map((cust) => {
                    const tier = getLoyaltyTier(cust.visits || 0);
                    return (
                      <tr key={cust.id} className="hover:bg-gray-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-gray-900 bg-gray-50/30">
                          {cust.loyaltyCode}
                        </td>
                        <td className="py-2.5 px-3">
                          <p className="font-extrabold text-blue-950">{cust.fullName}</p>
                          <p className="text-[10px] text-gray-500 font-medium font-mono">{cust.phone}</p>
                          {cust.email && <p className="text-[9px] text-gray-400 truncate max-w-[150px]">{cust.email}</p>}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="text-sm font-black font-mono text-gray-950">
                            {cust.visits || 0}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded border text-[9px] font-extrabold tracking-wide uppercase ${tier.color}`}>
                            {tier.name}
                          </span>
                          {tier.discount > 0 && (
                            <p className="text-[9px] text-green-700 font-bold mt-0.5">⭐ {tier.discount}% Off Net POS Bills</p>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-black text-gray-900">
                          {formatMoney(cust.spend || 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <div className="flex items-center justify-center gap-1 font-bold">
                            <button
                              onClick={() => handleAdjustVisits(cust, 1)}
                              className="px-1.5 py-0.5 rounded bg-green-100 text-green-800 hover:bg-green-200 text-[10px]"
                              title="Simulate / Record a Visit"
                            >
                              + Visit
                            </button>
                            <button
                              disabled={(cust.visits ?? 0) <= 0}
                              onClick={() => handleAdjustVisits(cust, -1)}
                              className="px-1.5 py-0.5 rounded bg-red-105 text-red-700 hover:bg-red-200 text-[10px] disabled:opacity-50"
                              title="Decrease Visit Count"
                            >
                              -
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
