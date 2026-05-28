import React, { useState } from 'react';
import { WeddingBooking } from '../types';
import { Printer, Save, ArrowLeft, Heart, Check, Plus, Trash2 } from 'lucide-react';

interface WeddingEventSpecSheetProps {
  booking?: WeddingBooking | null;
  onSave: (data: WeddingBooking) => void;
  onClose: () => void;
}

export const WeddingEventSpecSheet: React.FC<WeddingEventSpecSheetProps> = ({
  booking,
  onSave,
  onClose,
}) => {
  // Setup default state based on provided booking or initialized empty values matching the form photo
  const [id] = useState(booking?.id || `wed-${Date.now()}`);
  const [coupleNames, setCoupleNames] = useState(booking?.coupleNames || '');
  const [date, setDate] = useState(booking?.date || '');
  const [pax, setPax] = useState(booking?.pax || 0);
  const [status, setStatus] = useState(booking?.status || 'CONFIRMED');
  const [dateDetailing, setDateDetailing] = useState(booking?.dateDetailing || new Date().toISOString().split('T')[0]);
  const [phoneNo, setPhoneNo] = useState(booking?.phoneNo || '');
  const [emailAddress, setEmailAddress] = useState(booking?.emailAddress || '');
  const [representative, setRepresentative] = useState(booking?.representative || '');
  const [venue, setVenue] = useState(booking?.venue || '');

  // Interactive timeline grid template
  const [timeline, setTimeline] = useState<any[]>(
    booking?.timeline || []
  );

  // Left Column Menu Items
  const [appetizer, setAppetizer] = useState(booking?.appetizer || '');
  const [soup, setSoup] = useState(booking?.soup || '');
  const [saladBar, setSaladBar] = useState(booking?.saladBar || '');
  const [breadStation, setBreadStation] = useState(booking?.breadStation || '');
  const [pastaOrNoodles, setPastaOrNoodles] = useState(booking?.pastaOrNoodles || '');
  const [riceStation, setRiceStation] = useState(booking?.riceStation || '');
  const [vegetable, setVegetable] = useState(booking?.vegetable || '');
  const [fishAndSeafood, setFishAndSeafood] = useState(booking?.fishAndSeafood || '');
  const [chickenStation, setChickenStation] = useState(booking?.chickenStation || '');
  const [porkStation, setPorkStation] = useState(booking?.porkStation || '');
  const [beefStation, setBeefStation] = useState(booking?.beefStation || '');
  const [dessert, setDessert] = useState(booking?.dessert || '');
  const [additionalKakanin, setAdditionalKakanin] = useState(booking?.additionalKakanin || '');
  const [beverages, setBeverages] = useState(booking?.beverages || '');
  const [choiceOfGrazingTable, setChoiceOfGrazingTable] = useState(booking?.choiceOfGrazingTable || '');

  // Crew & packed meals grid
  const [crewPackedMeal, setCrewPackedMeal] = useState<any[]>(
    booking?.crewPackedMeal || []
  );

  // Long specifications lists
  const [weddingPackageSpecs, setWeddingPackageSpecs] = useState(
    booking?.weddingPackageSpecs || ''
  );
  
  const [floralServicesSpecs, setFloralServicesSpecs] = useState(
    booking?.floralServicesSpecs || ''
  );

  // Right Column Setup & Other Amenities
  const [setupTheme, setSetupTheme] = useState(booking?.setupTheme || '');
  const [setupMotif, setSetupMotif] = useState(booking?.setupMotif || '');
  const [setupGuestTableFlower, setSetupGuestTableFlower] = useState(booking?.setupGuestTableFlower || '');
  const [setupGuestTableEquipment, setSetupGuestTableEquipment] = useState(booking?.setupGuestTableEquipment || '');
  const [setupGuestTableLinen, setSetupGuestTableLinen] = useState(booking?.setupGuestTableLinen || '');
  const [setupVIPTableFlowers, setSetupVIPTableFlowers] = useState(booking?.setupVIPTableFlowers || '');
  const [setupVIPTableEquipment, setSetupVIPTableEquipment] = useState(booking?.setupVIPTableEquipment || '');
  const [setupVIPTableLinen, setSetupVIPTableLinen] = useState(booking?.setupVIPTableLinen || '');
  const [setupVIPTableNotes, setSetupVIPTableNotes] = useState(booking?.setupVIPTableNotes || '');
  const [setupBuffetTableLinen, setSetupBuffetTableLinen] = useState(booking?.setupBuffetTableLinen || '');
  const [setupBuffetTableCount, setSetupBuffetTableCount] = useState(booking?.setupBuffetTableCount || '');
  const [setupBackdropBackground, setSetupBackdropBackground] = useState(booking?.setupBackdropBackground || '');
  const [setupBackdropStage, setSetupBackdropStage] = useState(booking?.setupBackdropStage || '');
  const [setupChairs, setSetupChairs] = useState(booking?.setupChairs || '');
  const [setupTunnelEntrance, setSetupTunnelEntrance] = useState(booking?.setupTunnelEntrance || '');
  const [setupDanceFloorDesign, setSetupDanceFloorDesign] = useState(booking?.setupDanceFloorDesign || '');

  const [ceremonySetupList, setCeremonySetupList] = useState<string[]>(
    booking?.ceremonySetupList || []
  );
  
  const [specialInstructions, setSpecialInstructions] = useState(booking?.specialInstructions || '');

  // Bottom Authenticated Signatories
  const [sigFrontOffice, setSigFrontOffice] = useState(booking?.signatoryAsstFDManager || '');
  const [sigPurchasing, setSigPurchasing] = useState(booking?.signatoryPurchasingManager || '');
  const [sigShop, setSigShop] = useState(booking?.signatoryShop || '');
  const [sigChef, setSigChef] = useState(booking?.signatories?.chef || '');
  const [sigHousekeeping, setSigHousekeeping] = useState(booking?.signatoryHousekeeping || '');
  const [sigGSD, setSigGSD] = useState(booking?.signatoryGSDDept || '');
  const [sigBanquet, setSigBanquet] = useState(booking?.signatoryBanquetDept || '');
  const [sigClient, setSigClient] = useState(booking?.signatories?.client || '');

  const addTimelineRow = () => {
    setTimeline([...timeline, { date, time: '04:00 PM', venue: '', event: '', going: String(pax), remarks: '' }]);
  };

  const updateTimelineRow = (index: number, field: string, value: string) => {
    const updated = [...timeline];
    updated[index][field] = value;
    setTimeline(updated);
  };

  const removeTimelineRow = (index: number) => {
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  const addCeremonyItem = () => {
    setCeremonySetupList([...ceremonySetupList, '']);
  };

  const updateCeremonyItem = (index: number, val: string) => {
    const updated = [...ceremonySetupList];
    updated[index] = val;
    setCeremonySetupList(updated);
  };

  const removeCeremonyItem = (index: number) => {
    setCeremonySetupList(ceremonySetupList.filter((_, i) => i !== index));
  };

  const handleSaveClick = () => {
    const payload: WeddingBooking = {
      id,
      coupleNames,
      date,
      pax,
      motif: setupMotif,
      floralArrangements: setupGuestTableFlower,
      cakeDetails: '3-Tier customized wedding cake specs',
      ceremonySetup: venue,
      appetizer,
      soup,
      saladBar,
      breadStation,
      mainCourses: [fishAndSeafood, chickenStation, porkStation, beefStation].filter(Boolean),
      dessert,
      beverages,
      remarks: specialInstructions,
      signatories: {
        eventPlanner: representative,
        chef: sigChef,
        client: sigClient,
      },
      status,
      dateDetailing,
      phoneNo,
      emailAddress,
      representative,
      venue,
      timeline,
      pastaOrNoodles,
      riceStation,
      vegetable,
      fishAndSeafood,
      chickenStation,
      porkStation,
      beefStation,
      additionalKakanin,
      choiceOfGrazingTable,
      crewPackedMeal,
      weddingPackageSpecs,
      floralServicesSpecs,
      setupTheme,
      setupMotif,
      setupGuestTableFlower,
      setupGuestTableEquipment,
      setupGuestTableLinen,
      setupVIPTableFlowers,
      setupVIPTableEquipment,
      setupVIPTableLinen,
      setupVIPTableNotes,
      setupBuffetTableLinen,
      setupBuffetTableCount,
      setupBackdropBackground,
      setupBackdropStage,
      setupChairs,
      setupTunnelEntrance,
      setupDanceFloorDesign,
      ceremonySetupList,
      specialInstructions,
      signatoryAsstFDManager: sigFrontOffice,
      signatoryHousekeeping: sigHousekeeping,
      signatoryGSDDept: sigGSD,
      signatoryBanquetDept: sigBanquet,
      signatoryPurchasingManager: sigPurchasing,
      signatoryShop: sigShop,
    };
    onSave(payload);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-[#f0f4f1] text-[11px] font-sans text-gray-800 p-2 space-y-4 max-w-full overflow-x-auto print:bg-white print:p-0">
      
      {/* Action Buttons Toolbar */}
      <div className="flex items-center justify-between bg-white border border-gray-300 p-2.5 rounded shadow-sm print:hidden">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1.2 rounded text-xs font-bold transition"
          >
            <ArrowLeft size={13} /> Back to List
          </button>
          <span className="text-gray-400">|</span>
          <span className="font-extrabold text-[#2d6a4f] flex items-center gap-1">
            <Heart size={14} className="fill-[#2d6a4f]" /> Interactive Wedding Spec Sheet (Villa Escudero Layout)
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1 bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
          >
            <Printer size={13} /> Print Spec Sheet
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="flex items-center gap-1 bg-[#2d6a4f] hover:bg-[#1b4332] text-white px-3.5 py-1.5 rounded text-xs font-bold transition shadow-sm"
          >
            <Save size={13} /> Save Sheet
          </button>
        </div>
      </div>

      {/* Main Form Sheet styled mimicking Villa Escudero excel layout perfectly */}
      <div className="mx-auto w-full max-w-[1000px] bg-white border-2 border-[#8db68a] p-5 shadow-lg print:border-0 print:shadow-none print:p-0">
        
        {/* UPPER BANNER INFO SECTION */}
        <div className="grid grid-cols-10 border-b border-[#2d6a4f] pb-3 gap-2">
          
          <div className="col-span-3 flex flex-col justify-center border-r border-gray-200 pr-2">
            <h1 className="text-xs font-extrabold text-[#2d6a4f] tracking-widest uppercase">SPECIFICATION SHEET</h1>
            <p className="text-[14px] font-black tracking-tight text-gray-900 border-t border-[#8db68a] pt-1 mt-1 font-serif">
              WEDDING BANQUET PACKAGE
            </p>
            <p className="text-[9px] text-[#2d6a4f] font-mono font-bold mt-1 uppercase">VILLA ESCUDERO DESIGNATION</p>
          </div>

          <div className="col-span-7 grid grid-cols-3 gap-y-1.5 gap-x-3 text-[10px]">
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">TYPE OF EVENT:</span>
              <input 
                type="text" 
                value="WEDDING" 
                disabled 
                className="w-full bg-[#f4fbf7] text-[#2d6a4f] font-black border border-[#c6e0b4] px-1 py-0.5"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">STATUS:</span>
              <select 
                value={status} 
                onChange={(e) => setStatus(e.target.value)} 
                className="w-full font-bold border border-[#c6e0b4] px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-[#2d6a4f]"
              >
                <option value="CONFIRMED">✦ CONFIRMED</option>
                <option value="PENDING">✦ PENDING</option>
                <option value="BLOCKED">✦ BLOCKED</option>
              </select>
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">DATE OF DETAILING:</span>
              <input 
                type="date" 
                value={dateDetailing} 
                onChange={(e) => setDateDetailing(e.target.value)} 
                className="w-full text-gray-700 font-bold border border-[#c6e0b4] px-1 py-0.5"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">CLIENT NAME (COUPLE):</span>
              <input 
                type="text" 
                value={coupleNames} 
                onChange={(e) => setCoupleNames(e.target.value)} 
                className="w-full text-[#1b4332] font-extrabold border border-[#c6e0b4] bg-[#f4fbf7] px-1 py-0.5"
                placeholder="Couple Names"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">DATE OF EVENT:</span>
              <input 
                type="date" 
                value={date} 
                onChange={(e) => setDate(e.target.value)} 
                className="w-full text-red-700 font-bold border border-[#c6e0b4] px-1 py-0.5"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">PHONE NO:</span>
              <input 
                type="text" 
                value={phoneNo} 
                onChange={(e) => setPhoneNo(e.target.value)} 
                className="w-full font-semibold border border-[#c6e0b4] px-1 py-0.5"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">REPRESENTATIVE:</span>
              <input 
                type="text" 
                value={representative} 
                onChange={(e) => setRepresentative(e.target.value)} 
                className="w-full font-semibold border border-[#c6e0b4] px-1 py-0.5"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">RECEPTION VENUE:</span>
              <input 
                type="text" 
                value={venue} 
                onChange={(e) => setVenue(e.target.value)} 
                className="w-full font-bold border border-[#c6e0b4] px-1 py-0.5"
              />
            </div>
            <div>
              <span className="font-black text-gray-400 block text-[8px] uppercase">TOTAL NO. OF GUEST / PAX:</span>
              <input 
                type="number" 
                value={pax} 
                onChange={(e) => setPax(Number(e.target.value))} 
                className="w-full text-[#1b4332] font-black border border-[#c6e0b4] bg-[#f4fbf7] px-1 py-0.5 text-right font-mono"
              />
            </div>
          </div>
        </div>

        {/* LOGISTICAL WEDDING DIRECT PLANNER SCHEDULE TIMELINE */}
        <div className="mt-3">
          <div className="bg-[#e2efda] border border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-[#385623] flex justify-between items-center">
            <span>WEDDING DAY DETAILED LOGISTICAL PROGRAM & VENUE SCHEDULE</span>
            <button 
              type="button" 
              onClick={addTimelineRow}
              className="bg-white hover:bg-gray-50 text-[9px] text-[#385623] px-2 py-0.5 rounded border border-[#a9d18e] font-bold print:hidden"
            >
              + Add Timeline Path
            </button>
          </div>
          <table className="w-full border-collapse border border-[#c6e0b4] text-[10px] text-left mt-1">
            <thead>
              <tr className="bg-[#f2f2f2] font-bold text-[#385623]">
                <th className="border border-[#c6e0b4] p-1.5 w-1/6">DATE</th>
                <th className="border border-[#c6e0b4] p-1.5 w-1/6">TIME</th>
                <th className="border border-[#c6e0b4] p-1.5 w-1/4">VENUE</th>
                <th className="border border-[#c6e0b4] p-1.5 w-1/4">EVENT EVENT</th>
                <th className="border border-[#c6e0b4] p-1.5 w-[10%] text-center">EXPECTED</th>
                <th className="border border-[#c6e0b4] p-1.5">REMARKS</th>
                <th className="border border-[#c6e0b4] p-1.5 w-8 text-center print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {timeline.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#fcfdfc]">
                  <td className="border border-[#c6e0b4] p-0.5">
                    <input 
                      type="date" 
                      value={item.date} 
                      onChange={(e) => updateTimelineRow(idx, 'date', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-white"
                    />
                  </td>
                  <td className="border border-[#c6e0b4] p-0.5">
                    <input 
                      type="text" 
                      value={item.time} 
                      onChange={(e) => updateTimelineRow(idx, 'time', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-white font-mono"
                    />
                  </td>
                  <td className="border border-[#c6e0b4] p-0.5">
                    <input 
                      type="text" 
                      value={item.venue} 
                      onChange={(e) => updateTimelineRow(idx, 'venue', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-white font-semibold"
                    />
                  </td>
                  <td className="border border-[#c6e0b4] p-0.5">
                    <input 
                      type="text" 
                      value={item.event} 
                      onChange={(e) => updateTimelineRow(idx, 'event', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-white font-semibold text-[#1b4332]"
                    />
                  </td>
                  <td className="border border-[#c6e0b4] p-0.5">
                    <input 
                      type="text" 
                      value={item.going} 
                      onChange={(e) => updateTimelineRow(idx, 'going', e.target.value)}
                      className="w-full bg-transparent p-1 text-center font-mono focus:bg-white"
                    />
                  </td>
                  <td className="border border-[#c6e0b4] p-0.5">
                    <input 
                      type="text" 
                      value={item.remarks} 
                      onChange={(e) => updateTimelineRow(idx, 'remarks', e.target.value)}
                      className="w-full bg-transparent p-1 focus:bg-white text-gray-500"
                    />
                  </td>
                  <td className="border border-[#c6e0b4] p-1 text-center print:hidden">
                    <button 
                      type="button" 
                      onClick={() => removeTimelineRow(idx)}
                      className="text-red-500 hover:text-red-700 font-extrabold text-sm"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* TWO COLLAPSIBLE/SPLIT COLS SYSTEM FROM VILLA SPEC SHEET OUTLINE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
          
          {/* LEFT SIDE COLUMN: PREMIUM MENU SPECIFICATIONS & CREW MEALS */}
          <div className="space-y-3">
            
            {/* LARGE MENU TABLE FOR THE WEDDING PACKAGE */}
            <div className="border border-[#a9d18e] rounded overflow-hidden shadow-sm">
              <div className="bg-[#e2efda] border-b border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-[#385623]">
                WEDDING BANQUET GRAND MENU SPECIFICATIONS
              </div>
              <div className="bg-white">
                <table className="w-full border-collapse">
                  <tbody>
                    {[
                      { key: 'APPETIZER', label: 'APPETIZER', value: appetizer, setter: setAppetizer },
                      { key: 'SOUP', label: 'SOUP OF CHOICE', value: soup, setter: setSoup },
                      { key: 'SALAD_BAR', label: 'SALAD BAR SPREAD', value: saladBar, setter: setSaladBar },
                      { key: 'BREAD_STATION', label: 'BREAD STATION OVEN', value: breadStation, setter: setBreadStation },
                      { key: 'PASTA_STATION', label: 'PASTA & NOODLES', value: pastaOrNoodles, setter: setPastaOrNoodles },
                      { key: 'RICE_STATION', label: 'RICE STATION SELECT', value: riceStation, setter: setRiceStation },
                      { key: 'VEGETABLE', label: 'VEGETABLE SELECTION', value: vegetable, setter: setVegetable },
                      { key: 'FISH_SEAFOOD', label: 'FISH AND SEAFOOD CO.', value: fishAndSeafood, setter: setFishAndSeafood },
                      { key: 'CHICKEN_STATION', label: 'CHICKEN HOT STATION', value: chickenStation, setter: setChickenStation },
                      { key: 'PORK_STATION', label: 'PORK STATION DELIGHTS', value: porkStation, setter: setPorkStation },
                      { key: 'BEEF_STATION', label: 'BEEF ENTRÉE SELECTIONS', value: beefStation, setter: setBeefStation },
                      { key: 'DESSERT', label: 'DESSERT CONFECTIONARY', value: dessert, setter: setDessert },
                      { key: 'KAKANIN', label: 'ADDITIONAL KAKANIN', value: additionalKakanin, setter: setAdditionalKakanin },
                      { key: 'BEVERAGES', label: 'BEVERAGE CART PROGRAMS', value: beverages, setter: setBeverages },
                      { key: 'GRAZING', label: 'CHOICE OF GRAZING TABLE', value: choiceOfGrazingTable, setter: setChoiceOfGrazingTable }
                    ].map((row) => (
                      <tr key={row.key} className="border-b border-gray-100 hover:bg-[#f9fbf9]">
                        <td className="w-1/3 bg-[#f3f9f3] text-[9px] font-black uppercase text-[#2d6a4f] p-1.5 border-r border-[#c6e0b4]">
                          {row.label}:
                        </td>
                        <td className="p-1">
                          <input 
                            type="text" 
                            value={row.value} 
                            onChange={(e) => row.setter(e.target.value)}
                            className="w-full bg-transparent p-1 focus:bg-white text-gray-800 font-medium"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* CREW MEALS / PACKED MEAL SPEC SECTION (Exact Grid from Photo) */}
            <div className="border border-[#a9d18e] rounded overflow-hidden shadow-sm">
              <div className="bg-[#dcdfd9] border-b border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-gray-700 flex justify-between items-center bg-[#f2f2f2]">
                <span className="font-extrabold uppercase select-text">CREW MEAL / PACKED MEALS (CHEF'S DISCRETION)</span>
                <span className="bg-[#385623] text-white text-[8px] font-bold px-1 rounded">SECURED LEDGER</span>
              </div>
              <div className="bg-white p-1">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#f2f4f3] text-[8px] text-gray-500 font-bold uppercase border-b border-[#c6e0b4]">
                      <th className="p-1">CATEGORY PERIOD</th>
                      <th className="p-1">PACKED MEAL INFO</th>
                      <th className="p-1 text-center w-12">PAX</th>
                      <th className="p-1 w-20">SERVE TIME</th>
                      <th className="p-1 w-24">SERVE VENUE</th>
                    </tr>
                  </thead>
                  <tbody>
                    {crewPackedMeal.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="p-1 font-bold text-[#2d6a4f] text-[9px]">{item.period}</td>
                        <td className="p-0.5">
                          <input 
                            type="text" 
                            value={item.packedMeal} 
                            onChange={(e) => {
                              const updated = [...crewPackedMeal];
                              updated[idx].packedMeal = e.target.value;
                              setCrewPackedMeal(updated);
                            }}
                            className="w-full p-1 border-0 focus:ring-1 focus:ring-[#8db68a]"
                          />
                        </td>
                        <td className="p-0.5 w-12 text-center">
                          <input 
                            type="number" 
                            value={item.pax} 
                            onChange={(e) => {
                              const updated = [...crewPackedMeal];
                              updated[idx].pax = Number(e.target.value);
                              setCrewPackedMeal(updated);
                            }}
                            className="w-full p-1 text-center border-0 focus:ring-1 focus:ring-[#8db68a] font-mono"
                          />
                        </td>
                        <td className="p-0.5 w-20">
                          <input 
                            type="text" 
                            value={item.time} 
                            onChange={(e) => {
                              const updated = [...crewPackedMeal];
                              updated[idx].time = e.target.value;
                              setCrewPackedMeal(updated);
                            }}
                            className="w-full p-1 border-0 focus:ring-1 focus:ring-[#8db68a] font-mono"
                          />
                        </td>
                        <td className="p-0.5 w-24">
                          <input 
                            type="text" 
                            value={item.venue} 
                            onChange={(e) => {
                              const updated = [...crewPackedMeal];
                              updated[idx].venue = e.target.value;
                              setCrewPackedMeal(updated);
                            }}
                            className="w-full p-1 border-0 focus:ring-1 focus:ring-[#8db68a]"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* WEDDING PACKAGE SPECS NARRATIVE */}
            <div className="border border-[#a9d18e] rounded overflow-hidden shadow-sm">
              <div className="bg-[#e2efda] border-b border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-[#385623]">
                ESTABLISHED WEDDING CONTRACTED INCLUSIONS
              </div>
              <textarea 
                rows={5}
                value={weddingPackageSpecs}
                onChange={(e) => setWeddingPackageSpecs(e.target.value)}
                className="w-full bg-[#fcfdfc] p-2 font-sans font-medium text-gray-700 focus:outline-none border-0 text-[10px]"
              />
            </div>

            {/* FLORAL SERVICES SPEC LIST */}
            <div className="border border-[#a9d18e] rounded overflow-hidden shadow-sm">
              <div className="bg-[#e2efda] border-b border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-[#385623]">
                FLORAL SERVICES DESIGN MANUAL
              </div>
              <textarea 
                rows={5}
                value={floralServicesSpecs}
                onChange={(e) => setFloralServicesSpecs(e.target.value)}
                className="w-full bg-[#fcfdfc] p-2 font-sans font-medium text-gray-700 focus:outline-none border-0 text-[10px]"
              />
            </div>

          </div>

          {/* RIGHT SIDE COLUMN: GRAND VENUE SET UP & OTHER AMENITIES TABLE */}
          <div className="space-y-3">
            
            <div className="border border-[#a9d18e] rounded overflow-hidden shadow-sm">
              <div className="bg-[#e2efda] border-b border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-[#385623]">
                VENUE SET UP & MASTER AMENITIES MATRIX
              </div>
              <div className="bg-white p-2 text-[10px] space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-extrabold text-gray-500 uppercase block text-[8px]">1. GRAND THEME:</span>
                    <input 
                      type="text" 
                      value={setupTheme}
                      onChange={(e) => setSetupTheme(e.target.value)}
                      className="w-full border border-gray-300 p-1 font-bold"
                    />
                  </div>
                  <div>
                    <span className="font-extrabold text-gray-500 uppercase block text-[8px]">COLOR MOTIF:</span>
                    <input 
                      type="text" 
                      value={setupMotif}
                      onChange={(e) => setSetupMotif(e.target.value)}
                      className="w-full border border-gray-300 p-1 font-bold"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 p-1.5 rounded border border-gray-200 space-y-1">
                  <p className="font-black text-[#2d6a4f] text-[9px] uppercase border-b pb-0.5">a) Standard Guest Table Setup</p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-500 uppercase font-bold text-[8px]">FLOWER ARRG:</span>
                    <input type="text" value={setupGuestTableFlower} onChange={(e) => setSetupGuestTableFlower(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">EQUIPMENT:</span>
                    <input type="text" value={setupGuestTableEquipment} onChange={(e) => setSetupGuestTableEquipment(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">LINEN COLOUR:</span>
                    <input type="text" value={setupGuestTableLinen} onChange={(e) => setSetupGuestTableLinen(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                </div>

                <div className="bg-[#fbfdfb] p-1.5 rounded border border-[#c6e0b4] space-y-1">
                  <p className="font-black text-[#1b4332] text-[9px] uppercase border-b border-[#c6e0b4] pb-0.5">b) VIP Table Presentation Setup</p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-emerald-700 uppercase font-bold text-[8px]">GOLDEN FLOWERS:</span>
                    <input type="text" value={setupVIPTableFlowers} onChange={(e) => setSetupVIPTableFlowers(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">EQUIPMENT SPEC:</span>
                    <input type="text" value={setupVIPTableEquipment} onChange={(e) => setSetupVIPTableEquipment(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">SILK LINENS:</span>
                    <input type="text" value={setupVIPTableLinen} onChange={(e) => setSetupVIPTableLinen(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-start text-[10px]">
                    <span className="text-amber-800 uppercase font-bold text-[8px] mt-1">SPECIAL NOTES:</span>
                    <textarea value={setupVIPTableNotes} onChange={(e) => setSetupVIPTableNotes(e.target.value)} rows={1} className="w-[70%] border border-gray-200 p-0.5 bg-white text-[9px]" />
                  </p>
                </div>

                <div className="bg-gray-50 p-1.5 rounded border border-gray-200 space-y-1">
                  <p className="font-black text-[#2d6a4f] text-[9px] uppercase border-b pb-0.5">c) Buffet Station Table</p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">PLEATED LINENS:</span>
                    <input type="text" value={setupBuffetTableLinen} onChange={(e) => setSetupBuffetTableLinen(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">STATION COUNT:</span>
                    <input type="text" value={setupBuffetTableCount} onChange={(e) => setSetupBuffetTableCount(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                </div>

                <div className="bg-gray-50 p-1.5 rounded border border-gray-200 space-y-1">
                  <p className="font-black text-[#2d6a4f] text-[9px] uppercase border-b pb-0.5">d) Backdrop Presentation & Lounge</p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">BACKGROUND WALL:</span>
                    <input type="text" value={setupBackdropBackground} onChange={(e) => setSetupBackdropBackground(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                  <p className="flex justify-between items-center text-[10px]">
                    <span className="text-gray-400 uppercase font-bold text-[8px]">STAGE ELEVATION:</span>
                    <input type="text" value={setupBackdropStage} onChange={(e) => setSetupBackdropStage(e.target.value)} className="w-[70%] border border-gray-200 p-0.5 bg-white" />
                  </p>
                </div>

                <div className="space-y-1 border-t pt-1.5 mt-1.5 text-[10px]">
                  <p className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-500 uppercase text-[8px]">e) CHAIRS SPECS:</span>
                    <input type="text" value={setupChairs} onChange={(e) => setSetupChairs(e.target.value)} className="w-[70%] border border-gray-200 p-0.5" />
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-500 uppercase text-[8px]">f) TUNNEL ENTRANCE:</span>
                    <input type="text" value={setupTunnelEntrance} onChange={(e) => setSetupTunnelEntrance(e.target.value)} className="w-[70%] border border-gray-200 p-0.5" />
                  </p>
                  <p className="flex justify-between items-center">
                    <span className="font-extrabold text-gray-500 uppercase text-[8px]">g) DANCE FLOOR:</span>
                    <input type="text" value={setupDanceFloorDesign} onChange={(e) => setSetupDanceFloorDesign(e.target.value)} className="w-[70%] border border-gray-200 p-0.5" />
                  </p>
                </div>
              </div>
            </div>

            {/* CEREMONY SET UP SYSTEM CHECKLIST IN PHOTO */}
            <div className="border border-[#a9d18e] rounded overflow-hidden shadow-sm">
              <div className="bg-[#e2efda] border-b border-[#a9d18e] px-2 py-1 text-[9px] font-black uppercase text-[#385623] flex justify-between items-center">
                <span>CEREMONY SET UP CHECKLIST</span>
                <button 
                  type="button" 
                  onClick={addCeremonyItem}
                  className="bg-white hover:bg-gray-50 text-[9px] text-[#385623] px-1.5 rounded border border-[#a9d18e] font-black print:hidden"
                >
                  + Add Line
                </button>
              </div>
              <div className="bg-white p-2 space-y-1.5">
                {ceremonySetupList.map((item, idx) => (
                  <div key={idx} className="flex gap-1.5 items-start">
                    <span className="text-[#2d6a4f] font-black mt-0.5">✦</span>
                    <textarea 
                      value={item} 
                      onChange={(e) => updateCeremonyItem(idx, e.target.value)}
                      rows={1}
                      className="w-full border-b border-gray-150 py-0 text-[10px] font-sans font-medium text-gray-700 focus:outline-none focus:border-[#a9d18e] resize-y bg-transparent"
                    />
                    <button 
                      type="button" 
                      onClick={() => removeCeremonyItem(idx)}
                      className="text-red-400 hover:text-red-600 font-extrabold text-xs print:hidden px-0.5"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* SPECIAL INSTRUCTIONS SECTION */}
            <div className="border border-red-200 rounded overflow-hidden shadow-sm bg-red-50/20">
              <div className="bg-red-500/90 border-b border-red-200 px-2 py-1 text-[9px] font-black uppercase text-white tracking-wider">
                CRITICAL HOSPITALITY SPECIAL INSTRUCTIONS
              </div>
              <textarea 
                rows={4}
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className="w-full bg-red-50/10 p-2 font-sans font-semibold text-red-900 border-0 focus:outline-none text-[10px]"
                placeholder="Critical items such as specific timing alerts..."
              />
            </div>

          </div>

        </div>

        {/* BOTTOM AUTHENTICATED SIGNATORY BLOCKS FROM PHOTOGRAPH SECTION */}
        <div className="border-t-2 border-[#2d6a4f] mt-4 pt-4">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">
            OFFICIAL RESORT & KITCHEN METRIC SIGNATORIES RECORD
          </p>
          <div className="grid grid-cols-4 gap-4 text-center">
            
            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigFrontOffice} 
                  onChange={(e) => setSigFrontOffice(e.target.value)} 
                  className="w-full text-center font-bold text-gray-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase">ASST. FRONT DESK MANAGER / FRONT OFFICE</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigPurchasing} 
                  onChange={(e) => setSigPurchasing(e.target.value)} 
                  className="w-full text-center font-bold text-gray-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase">PURCHASING MANAGER</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigShop} 
                  onChange={(e) => setSigShop(e.target.value)} 
                  className="w-full text-center font-bold text-gray-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase">PANDA SHOP OPERATIONS</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigChef} 
                  onChange={(e) => setSigChef(e.target.value)} 
                  className="w-full text-center font-bold text-emerald-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-emerald-700 uppercase">EXECUTIVE CHEF / KITCHEN DIVISION</p>
            </div>

          </div>

          <div className="grid grid-cols-4 gap-4 text-center mt-4">
            
            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigHousekeeping} 
                  onChange={(e) => setSigHousekeeping(e.target.value)} 
                  className="w-full text-center font-bold text-gray-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase">HOUSEKEEPING MANAGER</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigGSD} 
                  onChange={(e) => setSigGSD(e.target.value)} 
                  className="w-full text-center font-bold text-gray-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase">G.S.D. DEPARTMENT REPRESENTATIVE</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-1">
                <input 
                  type="text" 
                  value={sigBanquet} 
                  onChange={(e) => setSigBanquet(e.target.value)} 
                  className="w-full text-center font-bold text-gray-800 bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase">BANQUET DEPARTMENT HEAD</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-[#2d6a4f] pb-1 px-1">
                <input 
                  type="text" 
                  value={sigClient} 
                  onChange={(e) => setSigClient(e.target.value)} 
                  className="w-full text-center font-extrabold text-[#1b4332] bg-transparent"
                />
              </div>
              <p className="text-[8px] font-black text-[#2d6a4f] uppercase">CLIENT CONFIRMATION SIGNATURE</p>
            </div>

          </div>
        </div>

        {/* Outer Footer boundary indicator */}
        <div className="mt-6 border-t border-dashed border-gray-300 pt-2 text-center text-[8px] text-gray-400 uppercase font-bold tracking-widest select-none">
          ✦ VILLA ESCUDERO SPECIAL SPEC SHEET FORM COMPLETED ✦
        </div>

      </div>

    </div>
  );
};
