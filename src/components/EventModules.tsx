import React, { useState } from 'react';
import { WeddingBooking, CorporateBooking } from '../types';
import { formatMoney } from '../utils';
import { WeddingEventSpecSheet } from './WeddingEventSpecSheet';
import { AcuaticoBanquetEventOrder } from './AcuaticoBanquetEventOrder';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { 
  Heart, 
  Briefcase, 
  Plus, 
  Layers, 
  Trash2, 
  Calendar, 
  Users, 
  MapPin, 
  DollarSign, 
  FileText, 
  Sparkles,
  Search,
  UserCheck
} from 'lucide-react';

interface EventModulesProps {
  weddings: WeddingBooking[];
  corporates: CorporateBooking[];
  onAddWedding: (booking: WeddingBooking) => void;
  onAddCorporate: (booking: CorporateBooking) => void;
  onDeleteWedding?: (id: string) => void;
  onDeleteCorporate?: (id: string) => void;
}

export const EventModulesComponent: React.FC<EventModulesProps> = ({
  weddings,
  corporates,
  onAddWedding,
  onAddCorporate,
  onDeleteWedding,
  onDeleteCorporate,
}) => {
  const [activeTab, setActiveTab] = useState<'wedding' | 'corporate'>('wedding');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Workspace focusing states
  const [selectedWedding, setSelectedWedding] = useState<WeddingBooking | null | 'new'>(null);
  const [selectedCorporate, setSelectedCorporate] = useState<CorporateBooking | null | 'new'>(null);

  // Wedding Search & Filter
  const filteredWeddings = weddings.filter(w => 
    w.coupleNames.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.motif.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (w.venue && w.venue.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Corporate Search & Filter
  const filteredCorporates = corporates.filter(c => 
    c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.eventTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.venue.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Fallback programmatic deletions if parent callback not mapped
  const handleDeleteWed = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this Wedding Spec Sheet?')) return;
    if (onDeleteWedding) {
      onDeleteWedding(id);
    } else {
      try {
        await deleteDoc(doc(db, 'weddings', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteCorp = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this Corporate Banquet Order?')) return;
    if (onDeleteCorporate) {
      onDeleteCorporate(id);
    } else {
      try {
        await deleteDoc(doc(db, 'corporates', id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  // If a specific wedding spec sheet is open in full focus
  if (selectedWedding === 'new') {
    return (
      <WeddingEventSpecSheet 
        booking={null} 
        onSave={(data) => {
          onAddWedding(data);
          setSelectedWedding(null);
        }}
        onClose={() => setSelectedWedding(null)}
      />
    );
  }

  if (selectedWedding) {
    return (
      <WeddingEventSpecSheet 
        booking={selectedWedding} 
        onSave={(data) => {
          onAddWedding(data);
          setSelectedWedding(null);
        }}
        onClose={() => setSelectedWedding(null)}
      />
    );
  }

  // If a specific corporate banquet order is open in full focus
  if (selectedCorporate === 'new') {
    return (
      <AcuaticoBanquetEventOrder 
        booking={null} 
        onSave={(data) => {
          onAddCorporate(data);
          setSelectedCorporate(null);
        }}
        onClose={() => setSelectedCorporate(null)}
      />
    );
  }

  if (selectedCorporate) {
    return (
      <AcuaticoBanquetEventOrder 
        booking={selectedCorporate} 
        onSave={(data) => {
          onAddCorporate(data);
          setSelectedCorporate(null);
        }}
        onClose={() => setSelectedCorporate(null)}
      />
    );
  }

  return (
    <div className="space-y-4 text-xs font-medium text-gray-700">
      
      {/* 1. Header & Navigation Tab Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white border border-gray-300 p-4 rounded-lg shadow-sm gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-black uppercase text-gray-950 tracking-wider flex items-center gap-1.5">
            <Layers className="text-blue-700" size={17} /> BANQUET EVENT & SPECIFICATION WORKSPACE
          </h2>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
            Fidelity layouts matching Acuatico & Villa Escudero excel standards
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex gap-1.5 bg-gray-100 p-1 rounded-lg border border-gray-200 w-full sm:w-auto">
          <button
            onClick={() => { setActiveTab('wedding'); setSearchQuery(''); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition uppercase tracking-wider ${
              activeTab === 'wedding'
                ? 'bg-gradient-to-r from-emerald-700 to-[#1b4332] text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Heart size={14} className={activeTab === 'wedding' ? 'fill-white' : ''} /> Wedding Specs
          </button>
          <button
            onClick={() => { setActiveTab('corporate'); setSearchQuery(''); }}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-md text-xs font-bold transition uppercase tracking-wider ${
              activeTab === 'corporate'
                ? 'bg-[#0e2f56] text-white shadow-sm font-black'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
            }`}
          >
            <Briefcase size={14} /> Corporate BEO
          </button>
        </div>
      </div>

      {/* 2. Controls bar: Search & Add Button */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white border border-gray-300 p-3 rounded-lg shadow-xs gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-2.5 top-2.5 text-gray-400" size={14} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search by guest names, motifs or venues...`}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded font-bold text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-700 text-xs"
          />
        </div>

        {activeTab === 'wedding' ? (
          <button
            type="button"
            onClick={() => setSelectedWedding('new')}
            className="w-full sm:w-auto flex items-center justify-center gap-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-4 py-2 rounded font-black uppercase text-xs tracking-wider transition shadow-xs"
          >
            <Plus size={14} /> Create Wedding Spec Sheet
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setSelectedCorporate('new')}
            className="w-full sm:w-auto flex items-center justify-center gap-1 bg-blue-800 hover:bg-blue-955 text-white px-4 py-2 rounded font-black uppercase text-xs tracking-wider transition shadow-xs"
          >
            <Plus size={14} /> Create Corporate BEO Contract
          </button>
        )}
      </div>

      {/* 3. Main Data Lists Display */}
      {activeTab === 'wedding' ? (
        <div className="space-y-4">
          <div className="border border-[#c6e0b4] rounded-lg bg-emerald-50/10 p-4">
            <h3 className="text-xs font-black uppercase text-[#2d6a4f] mb-3 pb-1 border-b border-[#a9d18e] tracking-widest flex items-center gap-1">
              <Sparkles size={14} /> ACTIVE WEDDINGS LEDGER SPECIFICATION CARDS ({filteredWeddings.length})
            </h3>

            {filteredWeddings.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
                <Heart size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-xs font-extrabold uppercase tracking-wider">No Wedding bookings catalogued matches search</p>
                <p className="text-[10px] text-gray-400 mt-1">Click the top-right button to create your first exquisite wedding sheet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWeddings.map((w) => {
                  return (
                    <div 
                      key={w.id}
                      onClick={() => setSelectedWedding(w)}
                      className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-[#8db68a] hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      {/* Motif Header Strip */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 to-[#1b4332] rounded-t-lg" />
                      
                      <div className="space-y-2.5 pt-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black text-emerald-800 bg-[#e2efda] px-1.5 py-0.5 rounded uppercase tracking-wider font-mono">
                              {w.status || 'CONFIRMED'}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteWed(w.id, e)}
                            className="text-red-300 hover:text-red-650 p-1 rounded hover:bg-red-50 transition print:hidden"
                            title="Delete Spec Sheet"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-[#1b4332] tracking-tight group-hover:text-emerald-800 transition">
                            {w.coupleNames}
                          </h4>
                          <p className="text-[9px] text-[#2d6a4f] uppercase tracking-widest font-black flex items-center gap-1 mt-0.5">
                            Motif: {w.motif}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-semibold border-t border-gray-100 pt-2 bg-gray-50/50 p-1.5 rounded">
                          <span className="flex items-center gap-1">
                            <Calendar size={11} className="text-[#2d6a4f]" /> {w.date}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Users size={11} className="text-[#2d6a4f]" /> {w.pax} PAX
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-500 border-t border-gray-100 pt-2 space-y-1">
                          <p className="line-clamp-1"><strong>Appetizer:</strong> <span className="text-gray-700">{w.appetizer}</span></p>
                          <p className="line-clamp-1"><strong>Mains:</strong> <span className="text-gray-700">{w.mainCourses?.join(', ') || 'Chef discretion'}</span></p>
                          <p className="line-clamp-1"><strong>Venue:</strong> <span className="text-gray-700 font-bold">{w.venue || w.ceremonySetup}</span></p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-dashed border-gray-200 text-center text-[10px] text-emerald-700 font-black uppercase tracking-wider group-hover:text-[#1b4332] transition flex items-center justify-center gap-1 select-none">
                        <FileText size={11} /> Open spreadsheet specification sheet →
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Corporate BEO Workspace Display */
        <div className="space-y-4">
          <div className="border border-blue-200 rounded-lg bg-blue-50/5 p-4">
            <h3 className="text-xs font-black uppercase text-blue-900 mb-3 pb-1 border-b border-blue-200 tracking-widest flex items-center gap-1">
              <Sparkles size={14} /> ACTIVE CORPORATE BANQUET EVENT ORDERS ({filteredCorporates.length})
            </h3>

            {filteredCorporates.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center text-gray-400">
                <Briefcase size={28} className="mx-auto text-gray-200 mb-2" />
                <p className="text-xs font-extrabold uppercase tracking-wider">No Corporate BEO listings matches search</p>
                <p className="text-[10px] text-gray-400 mt-1">Click the top-right button to book a full Corporate BEO outline sheet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCorporates.map((c) => {
                  return (
                    <div 
                      key={c.id}
                      onClick={() => setSelectedCorporate(c)}
                      className="group relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:border-blue-400 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
                    >
                      {/* Corporate color Header Strip */}
                      <div className="absolute top-0 left-0 right-0 h-1.5 bg-[#0e2f56] rounded-t-lg" />
                      
                      <div className="space-y-2.5 pt-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[8px] font-black text-blue-800 bg-blue-105 px-2 py-0.5 rounded uppercase tracking-wider font-mono">
                              {c.beoNo || 'BEO ACTIVE'}
                            </span>
                          </div>
                          <button 
                            type="button"
                            onClick={(e) => handleDeleteCorp(c.id, e)}
                            className="text-red-300 hover:text-red-650 p-1 rounded hover:bg-red-50 transition print:hidden"
                            title="Delete Banquet Order"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-[#0e2f56] tracking-tight group-hover:text-blue-900 transition leading-tight">
                            {c.companyName}
                          </h4>
                          <p className="text-[10px] text-gray-600 font-bold mt-1">
                            {c.eventTitle}
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 font-semibold border-t border-gray-100 pt-2 bg-gray-50/50 p-1.5 rounded">
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar size={11} className="text-blue-905" /> {c.date}
                          </span>
                          <span className="flex items-center gap-1 font-mono">
                            <Users size={11} className="text-blue-905" /> {c.pax} PAX
                          </span>
                        </div>

                        <div className="text-[10px] text-gray-500 border-t border-gray-100 pt-2 space-y-1">
                          <p className="line-clamp-1"><strong>Venue:</strong> <span className="text-gray-700 font-bold">{c.venue}</span></p>
                          <p className="line-clamp-1"><strong>Total Cost:</strong> <span className="text-red-700 font-black text-[11px] font-mono">PHP {formatMoney(c.contractPrice)}</span></p>
                          <p className="line-clamp-1"><strong>Onsite Lead:</strong> <span className="text-gray-700">{c.contactPerson}</span></p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-dashed border-gray-200 text-center text-[10px] text-blue-700 font-black uppercase tracking-wider group-hover:text-blue-900 transition flex items-center justify-center gap-1 select-none">
                        <FileText size={11} /> Open formal Acuatico BEO sheet →
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
