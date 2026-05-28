import React, { useState } from 'react';
import { CorporateBooking } from '../types';
import { formatMoney } from '../utils';
import { Printer, Save, ArrowLeft, Shield, Check, Plus, Trash2, Info, DollarSign } from 'lucide-react';

interface AcuaticoBanquetEventOrderProps {
  booking?: CorporateBooking | null;
  onSave: (data: CorporateBooking) => void;
  onClose: () => void;
}

export const AcuaticoBanquetEventOrder: React.FC<AcuaticoBanquetEventOrderProps> = ({
  booking,
  onSave,
  onClose,
}) => {
  // Setup initial state from booking or defaults matching the Abbott laboratories BEO photograph
  const [id] = useState(booking?.id || `corp-${Date.now()}`);
  const [companyName, setCompanyName] = useState(booking?.companyName || '');
  const [eventTitle, setEventTitle] = useState(booking?.eventTitle || '');
  const [venue, setVenue] = useState(booking?.venue || '');
  const [date, setDate] = useState(booking?.date || '');
  const [pax, setPax] = useState(booking?.pax || 0);
  const [contactPerson, setContactPerson] = useState(booking?.contactPerson || '');
  const [contactMobile, setContactMobile] = useState(booking?.contactMobile || '');
  const [email, setEmail] = useState(booking?.email || '');
  const [contractPrice, setContractPrice] = useState(booking?.contractPrice || 0);

  // Acuatico specific header metadata
  const [beoNo, setBeoNo] = useState(booking?.beoNo || '');
  const [preparedBy, setPreparedBy] = useState(booking?.preparedBy || '');
  const [datePrepared, setDatePrepared] = useState(booking?.datePrepared || '');

  const [checkInDate, setCheckInDate] = useState(booking?.checkInDate || '');
  const [checkOutDate, setCheckOutDate] = useState(booking?.checkOutDate || '');
  const [eta, setEta] = useState(booking?.eta || '');
  const [etd, setEtd] = useState(booking?.etd || '');
  const [adultsCount, setAdultsCount] = useState(booking?.adultsCount || 0);
  const [kidsCount, setKidsCount] = useState(booking?.kidsCount || 0);

  const [guestProfile, setGuestProfile] = useState(
    booking?.guestProfile || ''
  );

  const [frontOfficeInstructions, setFrontOfficeInstructions] = useState(
    booking?.frontOfficeInstructions || ''
  );

  const [importantNotesVIP, setImportantNotesVIP] = useState(
    booking?.importantNotesVIP || ''
  );

  const [signagesText, setSignagesText] = useState(
    booking?.signagesText || ''
  );

  // Financial details rows matching Acuatico sheet
  const [financialParticulars, setFinancialParticulars] = useState<any[]>(
    booking?.financialParticulars || []
  );

  const [totalPaidAmount, setTotalPaidAmount] = useState(booking?.totalPaidAmount || 0);
  const [billingArrangementCorp, setBillingArrangementCorp] = useState(
    booking?.billingArrangementCorp || ''
  );

  // IT, Housekeeping, Security mini panels
  const [itEngineeringInstructions, setItEngineeringInstructions] = useState(booking?.itEngineeringInstructions || '');
  const [housekeepingSpecialInstructions, setHousekeepingSpecialInstructions] = useState(booking?.housekeepingSpecialInstructions || '');
  const [securityInstructions, setSecurityInstructions] = useState(booking?.securityInstructions || '');

  // Food and Beverage schedule matching photograph
  const [mealProgram, setMealProgram] = useState<any[]>(
    booking?.mealProgram || []
  );

  const [menuChefDiscretionText, setMenuChefDiscretionText] = useState(booking?.menuChefDiscretionText || '');
  const [fbArrangementInstructions, setFbArrangementInstructions] = useState(
    booking?.fbArrangementInstructions || ''
  );

  const [suppliersText, setSuppliersText] = useState(booking?.suppliersText || '');
  const [functionRoomText, setFunctionRoomText] = useState(
    booking?.functionRoomText || ''
  );
  const [programText, setProgramText] = useState(
    booking?.programText || ''
  );

  // Signatory states matching Acuatico BEO bottom
  const [sigManager, setSigManager] = useState(booking?.signatories?.manager || '');
  const [sigChef, setSigChef] = useState(booking?.signatories?.chef || '');
  const [sigClient, setSigClient] = useState(booking?.signatories?.client || '');

  // Dynamic calculations helpers
  const totalParticularsSum = financialParticulars.reduce((sum, item) => sum + Number(item.phpAmount || 0), 0);
  const remainingPriceBalance = totalParticularsSum - totalPaidAmount;

  const handleFinancialRowChange = (index: number, field: string, val: any) => {
    const updated = [...financialParticulars];
    updated[index][field] = field === 'phpAmount' ? Number(val) : val;
    setFinancialParticulars(updated);
  };

  const addFinancialRow = () => {
    setFinancialParticulars([...financialParticulars, { particular: 'New line item', phpAmount: 0, remarks: '' }]);
  };

  const removeFinancialRow = (index: number) => {
    setFinancialParticulars(financialParticulars.filter((_, i) => i !== index));
  };

  const handleMealRowChange = (index: number, field: string, val: any) => {
    const updated = [...mealProgram];
    updated[index][field] = (field === 'ratePerHead' || field === 'paxCount') ? Number(val) : val;
    setMealProgram(updated);
  };

  const addMealRow = () => {
    setMealProgram([
      ...mealProgram,
      { date: date, mealPeriod: 'AM Snack', typeOfService: 'Plated', venue: 'Banquet Hall', ratePerHead: 400, paxCount: 35, time: '10:00 AM' },
    ]);
  };

  const removeMealRow = (index: number) => {
    setMealProgram(mealProgram.filter((_, i) => i !== index));
  };

  const handleSaveClick = () => {
    const payload: CorporateBooking = {
      id,
      companyName,
      eventTitle,
      venue,
      date,
      pax,
      contactPerson,
      contactMobile,
      email,
      contractPrice: totalParticularsSum, // Use calculated contract price
      mealProgram,
      signatories: {
        manager: sigManager,
        chef: sigChef,
        client: sigClient,
      },
      beoNo,
      preparedBy,
      datePrepared,
      checkInDate,
      checkOutDate,
      eta,
      etd,
      adultsCount,
      kidsCount,
      guestProfile,
      frontOfficeInstructions,
      importantNotesVIP,
      signagesText,
      financialParticulars,
      totalPaidAmount,
      billingArrangementCorp,
      itEngineeringInstructions,
      housekeepingSpecialInstructions,
      securityInstructions,
      menuChefDiscretionText,
      fbArrangementInstructions,
      suppliersText,
      functionRoomText,
      programText,
    };
    onSave(payload);
  };

  return (
    <div className="bg-gray-100 text-[11px] font-sans text-gray-800 p-2 space-y-4 max-w-full overflow-x-auto print:bg-white print:p-0">
      
      {/* Action Toolbar */}
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
          <span className="font-extrabold text-blue-900 flex items-center gap-1.5 uppercase tracking-wide">
            <Shield size={14} className="text-blue-900" /> ACUATICO BANQUET EVENT ORDER (BEO Layout)
          </span>
        </div>
        <div className="flex gap-1.5">
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1 bg-sky-700 hover:bg-sky-800 text-white px-3 py-1.5 rounded text-xs font-bold transition shadow-sm"
          >
            <Printer size={13} /> Print BEO Order
          </button>
          <button
            type="button"
            onClick={handleSaveClick}
            className="flex items-center gap-1 bg-blue-800 hover:bg-blue-955 text-white px-3.5 py-1.5 rounded text-xs font-bold transition shadow-sm"
          >
            <Save size={13} /> Save BEO Order
          </button>
        </div>
      </div>

      {/* Main BEO Worksheet mimicking Acuatico layout */}
      <div className="mx-auto w-full max-w-[1020px] bg-white border border-gray-400 p-6 shadow-lg print:border-0 print:shadow-none print:p-0">
        
        {/* Document Title header */}
        <div className="flex justify-between items-center border-b border-gray-800 pb-2">
          <div className="space-y-0.5">
            <h2 className="text-[17px] font-black uppercase text-gray-900 tracking-tight">ACUATICO</h2>
            <p className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest leading-none">RESORT & SEASIDE BANQUET INC.</p>
          </div>
          <div className="text-right">
            <h1 className="text-[15px] font-serif font-black tracking-widest text-[#0e2f56] uppercase leading-none">
              BANQUET EVENT ORDER
            </h1>
            <p className="text-[9px] font-semibold text-gray-400 uppercase mt-0.5 tracking-wider font-mono">BEO DOCUMENT SYSTEM</p>
          </div>
        </div>

        {/* Prepared Metadata grid */}
        <div className="grid grid-cols-10 border border-gray-400 border-t-0 text-[10px]">
          <div className="col-span-3 border-r border-gray-400 p-1.5">
            <span className="text-gray-400 font-extrabold text-[8px] block uppercase">BEO REFERENCE IDENTIFIER:</span>
            <input 
              type="text" 
              value={beoNo} 
              onChange={(e) => setBeoNo(e.target.value)} 
              className="w-full font-black border-0 p-0 text-red-700 focus:ring-0 bg-transparent"
              placeholder="BEO # 042/24"
            />
          </div>
          <div className="col-span-4 border-r border-gray-400 p-1.5">
            <span className="text-gray-400 font-extrabold text-[8px] block uppercase">PREPARED BY EVENT PLANNER:</span>
            <input 
              type="text" 
              value={preparedBy} 
              onChange={(e) => setPreparedBy(e.target.value)} 
              className="w-full font-bold border-0 p-0 text-gray-800 focus:ring-0 bg-transparent"
            />
          </div>
          <div className="col-span-3 p-1.5">
            <span className="text-gray-400 font-extrabold text-[8px] block uppercase">DATE DOCUMENT PREPARED:</span>
            <input 
              type="date" 
              value={datePrepared} 
              onChange={(e) => setDatePrepared(e.target.value)} 
              className="w-full font-bold border-0 p-0 text-gray-800 focus:ring-0 bg-transparent"
            />
          </div>
        </div>

        {/* High contrast thick gray banner (Abbott Outing Headline) */}
        <div className="bg-gray-200 border border-t-0 border-gray-400 p-2 text-center">
          <input 
            type="text" 
            value={companyName} 
            onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
            className="w-full text-center bg-transparent border-0 p-0 font-black tracking-widest text-[#0e2f56] text-xs uppercase"
            placeholder="COMPANY CLIENT REGISTER"
          />
        </div>

        {/* Key logistics details multi-grid layout */}
        <div className="grid grid-cols-10 border border-t-0 border-gray-400 text-[10px]">
          
          <div className="col-span-5 grid grid-cols-2 border-r border-gray-450 divide-y divide-x divide-gray-200">
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">Check-In Date</div>
            <div className="p-1 font-semibold text-gray-800">
              <input type="text" value={checkInDate} onChange={(e) => setCheckInDate(e.target.value)} className="w-full bg-transparent p-0 border-0" />
            </div>
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">Check-Out Date</div>
            <div className="p-1 font-semibold text-gray-800">
              <input type="text" value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} className="w-full bg-transparent p-0 border-0" />
            </div>
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">Adults Count</div>
            <div className="p-1 font-semibold text-gray-800">
              <input type="number" value={adultsCount} onChange={(e) => setAdultsCount(Number(e.target.value))} className="w-full bg-transparent p-0 border-0 text-right font-mono font-bold" />
            </div>
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">Kids Count</div>
            <div className="p-1 font-semibold text-gray-800">
              <input type="number" value={kidsCount} onChange={(e) => setKidsCount(Number(e.target.value))} className="w-full bg-transparent p-0 border-0 text-right font-mono font-bold" />
            </div>
          </div>

          <div className="col-span-5 grid grid-cols-2 divide-y divide-x divide-gray-200">
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">ETA Arrival</div>
            <div className="p-1 font-semibold text-gray-800">
              <input type="text" value={eta} onChange={(e) => setEta(e.target.value)} className="w-full bg-transparent p-0 border-0" />
            </div>
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">ETD Departure</div>
            <div className="p-1 font-semibold text-gray-800">
              <input type="text" value={etd} onChange={(e) => setEtd(e.target.value)} className="w-full bg-transparent p-0 border-0" />
            </div>
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">Venue Destination</div>
            <div className="p-1 font-bold text-[#0e2f56]">
              <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} className="w-full bg-transparent p-0 border-0" />
            </div>
            <div className="p-1.5 bg-gray-50 font-bold text-gray-600">Type Of Event</div>
            <div className="p-1 font-bold text-[#0e2f56]">
              <input type="text" value={eventTitle} onChange={(e) => setEventTitle(e.target.value)} className="w-full bg-transparent p-0 border-0" />
            </div>
          </div>

        </div>

        {/* Lead Contacts block */}
        <div className="grid grid-cols-10 border border-t-0 border-gray-400 text-[10px]">
          <div className="col-span-3 border-r border-gray-400 p-1.5">
            <span className="font-extrabold text-gray-400 block text-[8px] uppercase">LEAD CONTACT (ON SITE):</span>
            <input type="text" value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} className="w-full bg-transparent border-0 p-0 font-bold text-gray-800" />
          </div>
          <div className="col-span-3 border-r border-gray-400 p-1.5">
            <span className="font-extrabold text-gray-400 block text-[8px] uppercase">MOBILE NUMBER:</span>
            <input type="text" value={contactMobile} onChange={(e) => setContactMobile(e.target.value)} className="w-full bg-transparent border-0 p-0 font-bold text-gray-800 font-mono" />
          </div>
          <div className="col-span-4 p-1.5">
            <span className="font-extrabold text-gray-400 block text-[8px] uppercase">EMAIL ADDDRESS:</span>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-0 p-0 font-semibold text-gray-800" />
          </div>
        </div>

        {/* Narrative Guest profile comment block */}
        <div className="border border-t-0 border-gray-400 p-2 text-[10px]">
          <span className="font-extrabold text-gray-400 text-[8px] block uppercase mb-0.5">GUEST CORPORATE PROFILE NARRATIVE:</span>
          <textarea 
            rows={2} 
            value={guestProfile} 
            onChange={(e) => setGuestProfile(e.target.value)}
            className="w-full bg-[#fcfcfc] p-1.5 border border-gray-200 text-[10px] font-sans text-gray-700 leading-relaxed rounded focus:outline-none focus:border-gray-450"
          />
        </div>

        {/* Row of columns (Front Office vs Important Notes VIP with signages) */}
        <div className="grid grid-cols-2 border border-t-0 border-gray-400 text-[10px] divide-x divide-gray-400">
          
          <div className="p-3 space-y-2">
            <div className="bg-gray-800 text-white font-extrabold px-2 py-0.5 rounded text-[8px] uppercase tracking-wide inline-block">
              FRONT OFFICE INSTRUCTIONS
            </div>
            <textarea 
              rows={4}
              value={frontOfficeInstructions}
              onChange={(e) => setFrontOfficeInstructions(e.target.value)}
              className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-200 text-xs text-gray-700 leading-relaxed"
            />
          </div>

          <div className="p-3 space-y-2">
            <div className="bg-amber-600 text-white font-extrabold px-2 py-0.5 rounded text-[8px] uppercase tracking-wide inline-block">
              ⚠️ CRITICAL NOTES / HOST DELEGATION
            </div>
            
            {/* VINTAGE BRIGHT YELLOW STRIP FOR VIP ALERTS (Just like Photo) */}
            <div className="bg-yellow-250 border border-yellow-400 p-2 rounded text-gray-800 font-black text-xs shadow-xs animate-pulse">
              <span className="text-[10px] block font-extrabold text-amber-900 border-b border-yellow-300 pb-0.5 mb-1">
                ★ ATTENTION: ON-SITE VIP DELEGATES STATUS
              </span>
              <textarea 
                rows={2}
                value={importantNotesVIP}
                onChange={(e) => setImportantNotesVIP(e.target.value)}
                className="w-full bg-transparent p-0 border-0 text-gray-900 font-bold text-xs focus:ring-0 leading-relaxed font-sans placeholder-gray-500"
                placeholder="Alert details here..."
              />
            </div>

            <div className="pt-1.5">
              <span className="font-extrabold text-[8px] text-gray-400 uppercase tracking-widest block mb-0.5">SIGNAGES TO PREPARE:</span>
              <textarea 
                rows={2}
                value={signagesText}
                onChange={(e) => setSignagesText(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded p-1 leading-relaxed text-[10px]"
              />
            </div>
          </div>

        </div>

        {/* FINANCE TABLE SECTION IN PHOTO */}
        <div className="mt-3">
          <div className="bg-gray-800 text-white p-1.5 text-[9px] font-black uppercase tracking-wider flex justify-between items-center">
            <span>FINANCIAL CONTRACT CHARGES & PARTICULARS SPREADSHEEET</span>
            <button 
              type="button" 
              onClick={addFinancialRow}
              className="bg-white hover:bg-gray-100 text-[8px] text-gray-800 px-2.5 py-0.5 rounded font-black print:hidden"
            >
              + ADD PARTICULAR LINE
            </button>
          </div>
          <table className="w-full border-collapse border border-gray-400 text-[10px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 font-bold">
                <th className="border border-gray-400 p-1 text-left w-1/3">PARTICULAR DETAILS</th>
                <th className="border border-gray-400 p-1 text-right w-1/4">AMOUNT (PHP)</th>
                <th className="border border-gray-400 p-1 text-left">ESTABLISHED REMARKS & RATES CALCULATIONS</th>
                <th className="border border-gray-400 p-1 w-8 text-center print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {financialParticulars.map((row, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="border border-gray-400 p-0.5">
                    <input 
                      type="text" 
                      value={row.particular} 
                      onChange={(e) => handleFinancialRowChange(idx, 'particular', e.target.value)} 
                      className="w-full bg-transparent p-1 focus:bg-white text-gray-800 font-bold"
                    />
                  </td>
                  <td className="border border-gray-400 p-0.5">
                    <input 
                      type="number" 
                      value={row.phpAmount} 
                      onChange={(e) => handleFinancialRowChange(idx, 'phpAmount', e.target.value)} 
                      className="w-full bg-transparent p-1 focus:bg-white text-right font-mono font-bold text-gray-800"
                    />
                  </td>
                  <td className="border border-gray-400 p-0.5">
                    <input 
                      type="text" 
                      value={row.remarks} 
                      onChange={(e) => handleFinancialRowChange(idx, 'remarks', e.target.value)} 
                      className="w-full bg-transparent p-1 focus:bg-white text-gray-500 font-medium"
                    />
                  </td>
                  <td className="border border-gray-400 p-1 text-center print:hidden">
                    <button 
                      type="button" 
                      onClick={() => removeFinancialRow(idx)}
                      className="text-red-500 hover:text-red-700 font-extrabold text-sm"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              
              {/* Financial calculations summaries rows */}
              <tr className="bg-gray-100 font-extrabold text-gray-900 border-t-2 border-gray-800">
                <td className="border border-gray-400 p-1.5 uppercase text-right">TOTAL CONTRACT PRICE:</td>
                <td className="border border-gray-400 p-1.5 text-right font-mono text-xs text-red-700">
                  PHP {formatMoney(totalParticularsSum)}
                </td>
                <td className="border border-gray-400 p-1.5 text-gray-500 italic text-[9px] font-medium font-sans">
                  Sum of all contract room rate, catering programs and setup fees.
                </td>
                <td className="border border-gray-400 print:hidden"></td>
              </tr>

              <tr className="bg-gray-50 font-bold text-emerald-800">
                <td className="border border-[#c1cbd6] p-1.5 uppercase text-right text-[9px]">TOTAL PAID DEPOSIT / AMOUNT:</td>
                <td className="border border-[#c1cbd6] p-0.5">
                  <input 
                    type="number" 
                    value={totalPaidAmount} 
                    onChange={(e) => setTotalPaidAmount(Number(e.target.value))}
                    className="w-full p-1 border-0 focus:ring-0 text-right font-mono font-bold text-emerald-800"
                  />
                </td>
                <td className="border border-[#c1cbd6] p-1.5 italic text-[9px] font-medium text-emerald-700">
                  Bank deposit routing settled in advance.
                </td>
                <td className="border border-[#c1cbd6] print:hidden"></td>
              </tr>

              <tr className="bg-amber-50 font-black text-amber-900 border-b-2 border-gray-800">
                <td className="border border-[#eace9a] p-1.5 uppercase text-right">REMAINING CONTRACT BALANCE:</td>
                <td className="border border-[#eace9a] p-1.5 text-right font-mono text-amber-900 text-xs">
                  PHP {formatMoney(remainingPriceBalance)}
                </td>
                <td className="border border-[#eace9a] p-1.5 text-amber-800 text-[9px] font-semibold font-sans">
                  Billing Arrangement: {billingArrangementCorp}
                </td>
                <td className="border border-[#eace9a] print:hidden"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 4 SMALL SQUARES IN PHOTO: IT, BILLING ARRANGEMENT, HOUSEKEEPING, SECURITY */}
        <div className="grid grid-cols-4 border border-gray-400 border-t-0 text-[9px] divide-x divide-gray-400">
          
          <div className="p-2 space-y-1">
            <p className="font-extrabold text-blue-900 border-b pb-0.5 uppercase tracking-wide">IT / ENGINEERING</p>
            <textarea 
              rows={3} 
              value={itEngineeringInstructions} 
              onChange={(e) => setItEngineeringInstructions(e.target.value)}
              className="w-full bg-transparent p-0 border-0 focus:ring-0 text-[10px] text-gray-600 leading-normal"
            />
          </div>

          <div className="p-2 space-y-1">
            <p className="font-extrabold text-blue-900 border-b pb-0.5 uppercase tracking-wide">BILLING ARRANGEMENT</p>
            <textarea 
              rows={3} 
              value={billingArrangementCorp} 
              onChange={(e) => setBillingArrangementCorp(e.target.value)}
              className="w-full bg-transparent p-0 border-0 focus:ring-0 text-[10px] text-gray-600 leading-normal"
            />
          </div>

          <div className="p-2 space-y-1">
            <p className="font-extrabold text-blue-900 border-b pb-0.5 uppercase tracking-wide">HOUSEKEEPING DEPT</p>
            <textarea 
              rows={3} 
              value={housekeepingSpecialInstructions} 
              onChange={(e) => setHousekeepingSpecialInstructions(e.target.value)}
              className="w-full bg-transparent p-0 border-0 focus:ring-0 text-[10px] text-gray-600 leading-normal"
            />
          </div>

          <div className="p-2 space-y-1">
            <p className="font-extrabold text-blue-900 border-b pb-0.5 uppercase tracking-wide">SECURITY DIVISION</p>
            <textarea 
              rows={3} 
              value={securityInstructions} 
              onChange={(e) => setSecurityInstructions(e.target.value)}
              className="w-full bg-transparent p-0 border-0 focus:ring-0 text-[10px] text-gray-600 leading-normal"
            />
          </div>

        </div>

        {/* F&B SERVICE / KITCHEN LARGE SCHEDULE GRAPH IN PHOTO */}
        <div className="mt-3">
          <div className="bg-gray-800 text-white p-1.5 text-[9px] font-black uppercase tracking-wider flex justify-between items-center">
            <span>F & B SERVICE / KITCHEN MASTER SEGMENTS PROGRAM</span>
            <button 
              type="button" 
              onClick={addMealRow}
              className="bg-white hover:bg-gray-100 text-[8px] text-gray-800 px-2.5 py-0.5 rounded font-black print:hidden"
            >
              + ADD MEAL SEGMENT
            </button>
          </div>
          <table className="w-full border-collapse border border-gray-400 text-[10px]">
            <thead>
              <tr className="bg-gray-100 text-gray-600 font-bold border-b border-gray-400">
                <th className="border border-gray-400 p-1 text-left w-20">DATE</th>
                <th className="border border-gray-400 p-1 text-left w-28">MEAL PERIOD</th>
                <th className="border border-gray-400 p-1 text-left w-28">TYPE OF SERVICE</th>
                <th className="border border-gray-400 p-1 text-left">VENUE DEST.</th>
                <th className="border border-gray-400 p-1 text-right w-16">RATE</th>
                <th className="border border-gray-400 p-1 text-right w-16">GTD PAX</th>
                <th className="border border-gray-400 p-1 text-left w-24">SERVE TIME</th>
                <th className="border border-gray-400 p-1 w-8 text-center print:hidden"></th>
              </tr>
            </thead>
            <tbody>
              {mealProgram.map((item, idx) => (
                <tr key={idx} className="hover:bg-gray-50 text-xs">
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="text" 
                      value={item.date} 
                      onChange={(e) => handleMealRowChange(idx, 'date', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105"
                    />
                  </td>
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="text" 
                      value={item.mealPeriod} 
                      onChange={(e) => handleMealRowChange(idx, 'mealPeriod', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105 font-bold text-gray-800"
                    />
                  </td>
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="text" 
                      value={item.typeOfService} 
                      onChange={(e) => handleMealRowChange(idx, 'typeOfService', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105"
                    />
                  </td>
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="text" 
                      value={item.venue} 
                      onChange={(e) => handleMealRowChange(idx, 'venue', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105"
                    />
                  </td>
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="number" 
                      value={item.ratePerHead} 
                      onChange={(e) => handleMealRowChange(idx, 'ratePerHead', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105 text-right font-mono"
                    />
                  </td>
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="number" 
                      value={item.paxCount} 
                      onChange={(e) => handleMealRowChange(idx, 'paxCount', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105 text-right font-mono font-bold"
                    />
                  </td>
                  <td className="border border-gray-450 p-0.5">
                    <input 
                      type="text" 
                      value={item.time} 
                      onChange={(e) => handleMealRowChange(idx, 'time', e.target.value)} 
                      className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-105 text-left font-mono"
                    />
                  </td>
                  <td className="border border-gray-450 p-1 text-center print:hidden">
                    <button 
                      type="button" 
                      onClick={() => removeMealRow(idx)}
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

        {/* BOTTOM DOUBLE GRID IN PHOTO: MENU DETAILS & F&B ARRANGEMENTS */}
        <div className="grid grid-cols-2 border border-gray-400 mt-2 text-[10px] divide-x divide-gray-400">
          
          <div className="p-3.5 space-y-2">
            <p className="font-extrabold text-xs text-[#0e2f56] uppercase tracking-wide border-b pb-0.5">★ MAIN CULINARY MENU MATRIX</p>
            <textarea 
              rows={6}
              value={menuChefDiscretionText}
              onChange={(e) => setMenuChefDiscretionText(e.target.value)}
              className="w-full bg-[#f9fafb] p-2 border border-gray-200 rounded text-xs leading-relaxed font-semibold italic text-emerald-800"
            />
          </div>

          <div className="p-3.5 space-y-2">
            <p className="font-extrabold text-xs text-[#0e2f56] uppercase tracking-wide border-b pb-0.5">★ F & B DEELEGATED ARRANGEMENTS</p>
            <textarea 
              rows={6}
              value={fbArrangementInstructions}
              onChange={(e) => setFbArrangementInstructions(e.target.value)}
              className="w-full bg-transparent p-1 border-0 focus:ring-1 focus:ring-blue-200 text-xs leading-relaxed"
            />
          </div>

        </div>

        {/* LOWER BLOCKS: SUPPLIERS, FUNCTION ROOM, PROGRAM */}
        <div className="border border-t-0 border-gray-400 p-3.5 text-[10px] space-y-3">
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded">
              <p className="font-extrabold text-gray-500 uppercase text-[8px] tracking-wider mb-1 block">OUTSIDE SUPPLIERS LIST:</p>
              <textarea 
                rows={2} 
                value={suppliersText} 
                onChange={(e) => setSuppliersText(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-gray-700 text-xs font-semibold focus:ring-0"
              />
            </div>
            <div className="bg-gray-50 border border-gray-200 p-2.5 rounded">
              <p className="font-extrabold text-gray-500 uppercase text-[8px] tracking-wider mb-1 block">FUNCTION ROOM RESERVATIONS:</p>
              <textarea 
                rows={2} 
                value={functionRoomText} 
                onChange={(e) => setFunctionRoomText(e.target.value)}
                className="w-full bg-transparent border-0 p-0 text-gray-700 text-xs font-semibold focus:ring-0"
              />
            </div>
          </div>

          <div className="bg-blue-50/20 border border-blue-102 p-3 rounded">
            <p className="font-extrabold text-blue-900 uppercase text-[9px] tracking-widest mb-1.5 block">CORPORATE EVENT DETAILED PROGRAM TIMELINE:</p>
            <textarea 
              rows={8} 
              value={programText} 
              onChange={(e) => setProgramText(e.target.value)}
              className="w-full bg-transparent border-0 p-0 text-gray-750 text-xs font-medium font-sans focus:ring-0 leading-relaxed"
            />
          </div>

        </div>

        {/* BOTTOM ACUATICO SIGNATURES */}
        <div className="border border-t-0 border-gray-400 p-4 bg-gray-50">
          <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center mb-4">
            OFFICIAL SECURITY DEPOSIT & EXECUTED CONTRACT SIGNATORY SYSTEM
          </p>
          <div className="grid grid-cols-3 gap-6 text-center">
            
            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-2">
                <input 
                  type="text" 
                  value={sigManager} 
                  onChange={(e) => setSigManager(e.target.value)} 
                  className="w-full text-center font-bold text-gray-805 bg-transparent text-xs"
                />
              </div>
              <p className="text-[8px] font-black text-gray-400 uppercase leading-none mt-1">APPROVED: RESORT BANQUET MANAGER</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-2">
                <input 
                  type="text" 
                  value={sigChef} 
                  onChange={(e) => setSigChef(e.target.value)} 
                  className="w-full text-center font-bold text-emerald-850 bg-transparent text-xs"
                />
              </div>
              <p className="text-[8px] font-black text-emerald-700 uppercase leading-none mt-1">CONFIRMED: EXECUTIVE CHEF / KITCHEN</p>
            </div>

            <div className="space-y-4">
              <div className="border-b border-gray-400 pb-1 px-2">
                <input 
                  type="text" 
                  value={sigClient} 
                  onChange={(e) => setSigClient(e.target.value)} 
                  className="w-full text-center font-extrabold text-blue-900 bg-transparent text-xs"
                />
              </div>
              <p className="text-[8px] font-black text-[#0e2f56] uppercase leading-none mt-1">ACCEPTED BY: CLIENT CONTRACT SIGNATORY</p>
            </div>

          </div>
        </div>

        {/* END OF EVENT ORDER BAND IN PHOTO */}
        <div className="bg-gray-800 text-white text-center text-[9px] font-black uppercase tracking-widest p-2 py-1.5 select-none mt-3.5 flex justify-center items-center gap-2">
          <span>★★★ END OF BANQUET EVENT ORDER ★★★</span>
        </div>

      </div>

    </div>
  );
};
