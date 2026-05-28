import React, { useState } from 'react';
import { SaleTransaction, TaxInfo } from '../types';
import { formatMoney, formatJustDate, getMonthName } from '../utils';

interface BIRFormsProps {
  sales: SaleTransaction[];
  taxInfo: TaxInfo;
  onSaveTaxInfo: (info: TaxInfo) => void;
}

export const BIRFormsComponent: React.FC<BIRFormsProps> = ({ sales, taxInfo, onSaveTaxInfo }) => {
  const [activeTab, setActiveTab] = useState<'info' | '2550m' | '2550q' | 'monthly' | 'annual' | 'journal'>('journal');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Input states for Tax Info edit
  const [businessName, setBusinessName] = useState(taxInfo.businessName || 'JCC Ocean Bites Foodgroup Inc.');
  const [tin, setTin] = useState(taxInfo.tin || '192-552-321-000');
  const [rdoCode, setRdoCode] = useState(taxInfo.rdoCode || '043');
  const [address, setAddress] = useState(taxInfo.address || 'GF JCC Plaza, Brgy Socorro, Cubao');
  const [lineOfBusiness, setLineOfBusiness] = useState(taxInfo.lineOfBusiness || 'Fast Casual Restaurant Operations');
  const [taxType, setTaxType] = useState<'VAT' | 'Non-VAT'>(taxInfo.taxType || 'VAT');
  const [vatRate, setVatRate] = useState(taxInfo.vatRate || 0.12);

  // Selector state for return filings
  const [selectedMM, setSelectedMM] = useState<number>(5); // Default May
  const [selectedQtr, setSelectedQtr] = useState<number>(2); // Q2

  // Selector states for reports
  const [selectedReportMonth, setSelectedReportMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedReportYear, setSelectedReportYear] = useState<number>(2026);

  // Journal date filters
  const [journalFilterMonth, setJournalFilterMonth] = useState<string>('all');

  // Synchronize local states if global system-wide configs are modified
  React.useEffect(() => {
    if (taxInfo) {
      setBusinessName(taxInfo.businessName || 'JCC Ocean Bites Foodgroup Inc.');
      setTin(taxInfo.tin || '192-552-321-000');
      setRdoCode(taxInfo.rdoCode || '043');
      setAddress(taxInfo.address || 'GF JCC Plaza, Brgy Socorro, Cubao');
      setLineOfBusiness(taxInfo.lineOfBusiness || 'Fast Casual Restaurant Operations');
      setTaxType(taxInfo.taxType || 'VAT');
      setVatRate(taxInfo.vatRate || 0.12);
    }
  }, [
    taxInfo.businessName,
    taxInfo.tin,
    taxInfo.rdoCode,
    taxInfo.address,
    taxInfo.lineOfBusiness,
    taxInfo.taxType,
    taxInfo.vatRate
  ]);

  const handleSaveTax = () => {
    onSaveTaxInfo({
      businessName,
      tin,
      rdoCode,
      address,
      lineOfBusiness,
      taxType,
      vatRate,
      fiscalYearStart: taxInfo.fiscalYearStart || '2026-01-01',
      filingFrequency: taxInfo.filingFrequency || 'Monthly',
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
    }, 4000);
  };

  // Filter non-voided sales
  const activeSales = sales.filter((s) => s.status !== 'Voided');

  // Month filters for 2550M
  const getMonthlyTotals = (monthNum: number) => {
    const monthlySales = activeSales.filter((s) => {
      const d = new Date(s.dateTime);
      return d.getMonth() + 1 === monthNum;
    });

    let sGross = 0;
    let sDiscount = 0;
    let sTax = 0;
    let sNet = 0;

    monthlySales.forEach((s) => {
      sGross += s.subtotal;
      sDiscount += s.discount;
      sTax += s.tax;
      sNet += s.netTotal;
    });

    // Zero-rated sales (e.g. export/special zero rating if any, standard is vatable)
    const zeroRated = 0;
    const vatExempt = sDiscount; // Senior citizen / PWD discounts are VAT exempt under PH rules
    const vatableSales = sGross - sDiscount - sTax;

    return {
      grossSales: sGross,
      vatExempt,
      zeroRated,
      vatableSales: Math.max(0, vatableSales),
      outputTax: sTax,
      netTotal: sNet,
      txnCount: monthlySales.length,
      rawSalesList: monthlySales,
    };
  };

  // Quarterly filters logic for 2550Q
  const getQuarterlyTotals = (qtrNum: number) => {
    // Q1: Jan, Feb, Mar (1,2,3). Q2: Apr, May, Jun (4,5,6). Q3: Jul, Aug, Sep (7,8,9). Q4: Oct, Nov, Dec (10,11,12)
    const monthsInQtr = {
      1: [1, 2, 3],
      2: [4, 5, 6],
      3: [7, 8, 9],
      4: [10, 11, 12],
    }[qtrNum as 1 | 2 | 3 | 4] || [4, 5, 6];

    let qGross = 0;
    let qDiscount = 0;
    let qTax = 0;
    let qNet = 0;
    let count = 0;

    activeSales.forEach((s) => {
      const m = new Date(s.dateTime).getMonth() + 1;
      if (monthsInQtr.includes(m)) {
        qGross += s.subtotal;
        qDiscount += s.discount;
        qTax += s.tax;
        qNet += s.netTotal;
        count++;
      }
    });

    const vatable = qGross - qDiscount - qTax;

    return {
      grossSales: qGross,
      discount: qDiscount,
      vatExempt: qDiscount,
      zeroRated: 0,
      vatableSales: Math.max(0, vatable),
      outputTax: qTax,
      netTotal: qNet,
      txnCount: count,
    };
  };

  const mTotals = getMonthlyTotals(selectedMM);
  const qTotals = getQuarterlyTotals(selectedQtr);

  // Annual VAT / Sales Summary compiler
  const getAnnualTotals = (yearNum: number) => {
    const yearlySales = activeSales.filter((s) => {
      const d = new Date(s.dateTime);
      return d.getFullYear() === yearNum;
    });

    let yGross = 0;
    let yDiscount = 0;
    let yTax = 0;
    let yNet = 0;

    yearlySales.forEach((s) => {
      yGross += s.subtotal;
      yDiscount += s.discount;
      yTax += s.tax;
      yNet += s.netTotal;
    });

    const vatableSales = yGross - yDiscount - yTax;

    // Compile quarters
    const quarters = [1, 2, 3, 4].map((q) => {
      const months = { 1: [1, 2, 3], 2: [4, 5, 6], 3: [7, 8, 9], 4: [10, 11, 12] }[q as 1 | 2 | 3 | 4];
      const qSales = yearlySales.filter((s) => months.includes(new Date(s.dateTime).getMonth() + 1));
      let g = 0, d = 0, t = 0, n = 0;
      qSales.forEach((s) => {
        g += s.subtotal;
        d += s.discount;
        t += s.tax;
        n += s.netTotal;
      });
      return {
        q,
        gross: g,
        discount: d,
        tax: t,
        vatable: Math.max(0, g - d - t),
        net: n,
        count: qSales.length,
      };
    });

    return {
      grossSales: yGross,
      vatExempt: yDiscount,
      zeroRated: 0,
      vatableSales: Math.max(0, vatableSales),
      outputTax: yTax,
      netTotal: yNet,
      txnCount: yearlySales.length,
      quarters,
    };
  };

  const aTotals = getAnnualTotals(selectedReportYear);

  // Journal entries format generator
  const getJournalData = () => {
    let list = activeSales;
    if (journalFilterMonth !== 'all') {
      const monthInt = Number(journalFilterMonth);
      list = activeSales.filter((s) => new Date(s.dateTime).getMonth() + 1 === monthInt);
    }

    return list.map((s, idx) => {
      const vatExempt = s.discount || 0;
      const zeroRated = 0;
      const vatableSales = s.subtotal - vatExempt - s.tax;

      return {
        num: idx + 1,
        date: formatJustDate(s.dateTime),
        orNo: s.id,
        customerName: s.customerName || 'Walk-in Customer',
        branch: s.branchId,
        grossSales: s.subtotal,
        vatExempt,
        zeroRated,
        vatableSales: Math.max(0, vatableSales),
        outputTax: s.tax,
        totalSales: s.netTotal,
      };
    });
  };

  const journalEntries = getJournalData();

  // Export eBIRForms official Sales Journal CSV format
  const exportJournalCSV = () => {
    const headers = [
      'Date',
      'OR No.',
      'Customer Name',
      'Branch',
      'Gross Sales',
      'VAT Exempt',
      'Zero Rated',
      'Vatable Sales',
      'Output VAT 12%',
      'Total Sales'
    ];

    const rows = journalEntries.map((j) => [
      `"${j.date}"`,
      `"${j.orNo}"`,
      `"${j.customerName}"`,
      `"${j.branch}"`,
      j.grossSales.toFixed(2),
      j.vatExempt.toFixed(2),
      j.zeroRated.toFixed(2),
      j.vatableSales.toFixed(2),
      j.outputTax.toFixed(2),
      j.totalSales.toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bir_official_sales_journal_month_${journalFilterMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Tightly aligned BIR Operations Navigation Header */}
      <div className="bg-gray-800 text-white rounded-lg p-2.5 flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center space-x-2">
          <span className="text-yellow-400 font-extrabold text-sm font-display tracking-tight">BIR Filer</span>
          <span className="text-[10px] uppercase font-bold text-gray-400">eBIRForms Compliant Engine</span>
        </div>
        <div className="flex space-x-1 text-xs">
          <button
            onClick={() => setActiveTab('info')}
            className={`px-3 py-1.5 rounded font-bold uppercase transition ${
              activeTab === 'info' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('journal')}
            className={`px-3 py-1.5 rounded font-bold uppercase transition ${
              activeTab === 'journal' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Sales Journal (eBIR)
          </button>
          <button
            onClick={() => setActiveTab('monthly')}
            className={`px-3 py-1.5 rounded font-bold uppercase transition ${
              activeTab === 'monthly' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Monthly Reports
          </button>
          <button
            onClick={() => setActiveTab('annual')}
            className={`px-3 py-1.5 rounded font-bold uppercase transition ${
              activeTab === 'annual' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Annual Summary
          </button>
          <button
            onClick={() => setActiveTab('2550m')}
            className={`px-3 py-1.5 rounded font-bold uppercase transition ${
              activeTab === '2550m' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Form 2550M
          </button>
          <button
            onClick={() => setActiveTab('2550q')}
            className={`px-3 py-1.5 rounded font-bold uppercase transition ${
              activeTab === '2550q' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            Form 2550Q
          </button>
        </div>
      </div>

      {/* RENDER VIEWPORTS */}
      {activeTab === 'info' && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-4">
          {saveSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-800 p-3 rounded-md text-xs font-bold flex items-center justify-between animate-fade-in">
              <span>✅ BIR Taxpayer Information Saved successfully! Changes are applied across all forms.</span>
              <button onClick={() => setSaveSuccess(false)} className="text-green-650 hover:text-green-850 font-black text-sm">×</button>
            </div>
          )}
          <div className="border-b pb-2 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase text-gray-700">BIR Taxpayer Identification & Configuration</h3>
            <button
              onClick={handleSaveTax}
              className="rounded bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              Update Registration
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Registered Business Name</label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1 w-full rounded border p-2 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Taxpayer Identification Number (TIN)</label>
              <input
                type="text"
                value={tin}
                onChange={(e) => setTin(e.target.value)}
                className="mt-1 w-full rounded border p-2 font-bold font-mono text-blue-700"
                placeholder="000-000-000-000"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Revenue District Office (RDO) Code</label>
              <input
                type="text"
                value={rdoCode}
                onChange={(e) => setRdoCode(e.target.value)}
                className="mt-1 w-full rounded border p-2 font-bold font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium text-gray-700">
            <div className="md:col-span-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase">Registered Line Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded border p-2 font-bold"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Registered Line of Business</label>
              <input
                type="text"
                value={lineOfBusiness}
                onChange={(e) => setLineOfBusiness(e.target.value)}
                className="mt-1 w-full rounded border p-2 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Standard VAT Configuration</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value as 'VAT' | 'Non-VAT')}
                className="mt-1 w-full rounded border p-2 font-bold"
              >
                <option value="VAT">VAT REGISTERED (12%)</option>
                <option value="Non-VAT">NON-VAT</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Value Added Tax Rate</label>
              <input
                type="number"
                step="0.01"
                value={vatRate}
                onChange={(e) => setVatRate(Number(e.target.value))}
                className="mt-1 w-full rounded border p-2 font-bold font-mono text-gray-700"
              />
            </div>
          </div>

          <div className="bg-yellow-50 p-2.5 rounded border border-yellow-250 text-[10px] text-yellow-800 leading-relaxed font-bold">
            ⚠️ NOTICE: Under section 113 of the Tax Reform code (TRAIN), Official receipts generated at standard POS terminals must print corresponding customer names and TIN identifiers for corporate expense deductions.
          </div>
        </div>
      )}

      {/* Monthly declaration form mock 2550M */}
      {activeTab === '2550m' && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-700">BIR Form 2550M — Monthly VAT Declaration</h3>
              <p className="text-[8px] text-gray-400 font-extrabold uppercase mt-0.5">Republic of the Philippines Bureau of Internal Revenue</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-gray-500">Form Month:</span>
              <select
                value={selectedMM}
                onChange={(e) => setSelectedMM(Number(e.target.value))}
                className="border rounded p-1 text-xs font-bold"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="border rounded p-3 bg-gray-50 font-mono text-[11px] leading-6 space-y-2">
            <div className="grid grid-cols-2 border-b pb-1 font-bold">
              <span>Item No. / Description</span>
              <span className="text-right">Value (PHP)</span>
            </div>
            <div className="flex justify-between">
              <span>Taxpayer Name:</span>
              <span className="font-bold uppercase text-blue-800">{businessName}</span>
            </div>
            <div className="flex justify-between">
              <span>Taxpayer TIN:</span>
              <span className="font-bold">{tin}</span>
            </div>
            <div className="flex justify-between">
              <span>RDO Code:</span>
              <span className="font-bold">{rdoCode}</span>
            </div>
            <div className="border-t my-1"></div>
            <div className="flex justify-between">
              <span>Item 12A: Vatable Sales / Private Receipts</span>
              <span className="font-bold">{formatMoney(mTotals.vatableSales)}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Item 13A: Sales to Government</span>
              <span>₱0.00</span>
            </div>
            <div className="flex justify-between">
              <span>Item 14: Zero-Rated Sales</span>
              <span className="font-bold">{formatMoney(mTotals.zeroRated)}</span>
            </div>
            <div className="flex justify-between">
              <span>Item 15: VAT-Exempt Sales / Seniors and PWD Receipts</span>
              <span className="font-bold">{formatMoney(mTotals.vatExempt)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-1 font-bold">
              <span>Item 16A: Total Gross Sales</span>
              <span className="text-blue-800">{formatMoney(mTotals.grossSales)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Item 16B: Output Tax Due (12% of Vatable Sales)</span>
              <span className="text-green-700">{formatMoney(mTotals.outputTax)}</span>
            </div>
            <div className="flex justify-between font-bold bg-gray-250 p-1 rounded">
              <span>Item 26: TOTAL AMOUNT VAT PAYABLE</span>
              <span className="text-red-650 text-xs">{formatMoney(mTotals.outputTax)}</span>
            </div>
          </div>
          <p className="text-[10px] text-gray-400 italic text-center">Form reflects raw calculations based on real transaction outputs within chosen month.</p>
        </div>
      )}

      {/* Quarterly Return Form 2550Q */}
      {activeTab === '2550q' && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between border-b pb-2">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-700">BIR Form 2550Q — Quarterly VAT Return</h3>
              <p className="text-[8px] text-gray-400 font-extrabold uppercase mt-0.5">National Internal Revenue Code Trax Tracker</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] uppercase font-bold text-gray-500">Quarter:</span>
              <select
                value={selectedQtr}
                onChange={(e) => setSelectedQtr(Number(e.target.value))}
                className="border rounded p-1 text-xs font-bold"
              >
                <option value={1}>1st Quarter (Jan - Mar)</option>
                <option value={2}>2nd Quarter (Apr - Jun)</option>
                <option value={3}>3rd Quarter (Jul - Sep)</option>
                <option value={4}>4th Quarter (Oct - Dec)</option>
              </select>
            </div>
          </div>

          <div className="border rounded p-3 bg-gray-50 font-mono text-[11px] leading-6 space-y-2">
            <div className="grid grid-cols-2 border-b pb-1 font-bold">
              <span>Form Item Fields / Details</span>
              <span className="text-right">Quarter Accumulation (PHP)</span>
            </div>
            <div className="flex justify-between">
              <span>Item 31A: Vatable Sales (Private)</span>
              <span className="font-bold">{formatMoney(qTotals.vatableSales)}</span>
            </div>
            <div className="flex justify-between">
              <span>Item 32: Zero-Rated Sales</span>
              <span className="font-bold">{formatMoney(qTotals.zeroRated)}</span>
            </div>
            <div className="flex justify-between">
              <span>Item 33: Exempt Sales / Receipts</span>
              <span className="font-bold">{formatMoney(qTotals.vatExempt)}</span>
            </div>
            <div className="flex justify-between border-t border-dashed pt-1 font-bold">
              <span>Item 34A: Total Sales in Quarter</span>
              <span className="text-blue-800">{formatMoney(qTotals.grossSales)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Item 34B: Total Output Tax Due</span>
              <span className="text-green-700">{formatMoney(qTotals.outputTax)}</span>
            </div>
            <div className="flex justify-between font-bold border-t pt-1">
              <span>Item 50B: Total Current Input Tax <em>(Less: purchases)</em></span>
              <span className="text-gray-550">₱0.00</span>
            </div>
            <div className="flex justify-between font-bold bg-gray-250 p-1 rounded">
              <span>Item 61: NET VAT PAYABLE FOR THE QUARTER</span>
              <span className="text-red-650 text-xs">{formatMoney(qTotals.outputTax)}</span>
            </div>
          </div>
        </div>
      )}

      {/* VIEWPORT: MONTHLY REPORT BY BUTTONS OF MONTH */}
      {activeTab === 'monthly' && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-700">Monthly Transaction & Sales Analysis Reports</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Click any month button to load details</p>
            </div>
            <div className="flex space-x-1 flex-wrap gap-y-1">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                const isActive = selectedReportMonth === m;
                return (
                  <button
                    key={m}
                    onClick={() => setSelectedReportMonth(m)}
                    className={`px-3 py-1 font-mono text-[10px] uppercase font-bold rounded border transition ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {getMonthName(m).substring(0, 3)}
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const selectedMonthlyTotals = getMonthlyTotals(selectedReportMonth);
            return (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="border rounded p-3 bg-blue-50/50">
                    <span className="text-[10px] font-black uppercase text-blue-800">Selected Month</span>
                    <p className="text-lg font-black font-display text-blue-900 tracking-tight uppercase">
                      {getMonthName(selectedReportMonth)} {selectedReportYear}
                    </p>
                  </div>
                  <div className="border rounded p-3 bg-gray-50">
                    <span className="text-[10px] font-black uppercase text-gray-500">Transaction Count</span>
                    <p className="text-lg font-mono font-bold text-gray-900">
                      {selectedMonthlyTotals.txnCount.toLocaleString()}
                    </p>
                  </div>
                  <div className="border rounded p-3 bg-green-50/50">
                    <span className="text-[10px] font-black uppercase text-green-800">Output VAT (12%)</span>
                    <p className="text-lg font-mono font-bold text-green-900">
                      {formatMoney(selectedMonthlyTotals.outputTax)}
                    </p>
                  </div>
                  <div className="border rounded p-3 bg-slate-900 text-white">
                    <span className="text-[9px] font-bold uppercase text-yellow-500">Total Sales</span>
                    <p className="text-lg font-mono font-black text-yellow-400">
                      {formatMoney(selectedMonthlyTotals.netTotal)}
                    </p>
                  </div>
                </div>

                <div className="border rounded overflow-hidden">
                  <div className="bg-gray-100 p-2 text-xs font-black uppercase text-gray-700 border-b">
                    {getMonthName(selectedReportMonth)} BIR Declaration Metrics Form
                  </div>
                  <div className="p-3 bg-white space-y-2 font-mono text-[11px] leading-relaxed">
                    <div className="flex justify-between border-b pb-1">
                      <span>Gross Sales (Exclusive of VAT):</span>
                      <span className="font-semibold">{formatMoney(selectedMonthlyTotals.vatableSales + selectedMonthlyTotals.vatExempt)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>VAT Exempt Sales (e.g., Seniors/PWD):</span>
                      <span className="font-semibold text-gray-500">{formatMoney(selectedMonthlyTotals.vatExempt)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Zero-Rated Sales:</span>
                      <span className="font-semibold text-gray-500">{formatMoney(selectedMonthlyTotals.zeroRated)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Vatable Sales:</span>
                      <span className="font-semibold text-blue-800">{formatMoney(selectedMonthlyTotals.vatableSales)}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1">
                      <span>Output VAT 12%:</span>
                      <span className="font-semibold text-green-700">{formatMoney(selectedMonthlyTotals.outputTax)}</span>
                    </div>
                    <div className="flex justify-between pt-1 font-black text-xs text-slate-900">
                      <span>TOTAL SALES DECLARATION:</span>
                      <span className="text-blue-900">{formatMoney(selectedMonthlyTotals.netTotal)}</span>
                    </div>
                  </div>
                </div>

                {/* Consolidated 12 Months comparison table */}
                <div>
                  <h4 className="text-[10px] font-black uppercase text-gray-600 mb-2">12-Month Consolidated Sales & Transactions Overview</h4>
                  <div className="border rounded overflow-hidden">
                    <table className="w-full text-left text-xs bg-white">
                      <thead className="bg-gray-100 border-b text-[9px] uppercase font-black text-gray-500">
                        <tr>
                          <th className="py-2.5 px-3">Month</th>
                          <th className="py-2.5 px-3 text-right">Transactions</th>
                          <th className="py-2.5 px-3 text-right">Vatable Sales</th>
                          <th className="py-2.5 px-3 text-right">VAT Exempt</th>
                          <th className="py-2.5 px-3 text-right">Output VAT (12%)</th>
                          <th className="py-2.5 px-3 text-right font-black text-gray-800">Total Sales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-150">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => {
                          const stats = getMonthlyTotals(m);
                          const isSelected = selectedReportMonth === m;
                          return (
                            <tr
                              key={m}
                              onClick={() => setSelectedReportMonth(m)}
                              className={`cursor-pointer transition hover:bg-gray-50 ${
                                isSelected ? 'bg-blue-50/70 font-bold' : ''
                              }`}
                            >
                              <td className="py-2 px-3 font-semibold text-blue-900">
                                {getMonthName(m)}
                              </td>
                              <td className="py-2 px-3 text-right font-mono">{stats.txnCount.toLocaleString()}</td>
                              <td className="py-2 px-3 text-right font-mono text-gray-600">{formatMoney(stats.vatableSales)}</td>
                              <td className="py-2 px-3 text-right font-mono text-gray-500">{formatMoney(stats.vatExempt)}</td>
                              <td className="py-2 px-3 text-right font-mono text-green-750">{formatMoney(stats.outputTax)}</td>
                              <td className="py-2 px-3 text-right font-mono text-blue-900 font-bold">{formatMoney(stats.netTotal)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* VIEWPORT: ANNUAL BIR SUMMARY REPORT BY YEARS */}
      {activeTab === 'annual' && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b pb-3 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-700">Annual BIR Sales Consolidation</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Consolidated annual sales declarations and quarterly indexes</p>
            </div>
            <div className="flex space-x-1">
              {[2026, 2025, 2024].map((y) => {
                const isActive = selectedReportYear === y;
                return (
                  <button
                    key={y}
                    onClick={() => setSelectedReportYear(y)}
                    className={`px-3 py-1.5 rounded font-mono text-xs font-bold border transition ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    CY {y} Report
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div className="border rounded p-3 bg-indigo-50/50">
              <span className="text-[10px] font-black uppercase text-indigo-800">Selected Year</span>
              <p className="text-lg font-black font-display text-indigo-900 tracking-tight">
                CY {selectedReportYear}
              </p>
            </div>
            <div className="border rounded p-3 bg-gray-50">
              <span className="text-[10px] font-black uppercase text-gray-500">CY Consolidated Count</span>
              <p className="text-lg font-mono font-bold text-gray-900">
                {aTotals.txnCount.toLocaleString()}
              </p>
            </div>
            <div className="border rounded p-3 bg-green-50/50">
              <span className="text-[10px] font-black uppercase text-green-800">CY Output VAT</span>
              <p className="text-lg font-mono font-bold text-green-900">
                {formatMoney(aTotals.outputTax)}
              </p>
            </div>
            <div className="border rounded p-3 bg-slate-900 text-white">
              <span className="text-[9px] font-bold uppercase text-yellow-500">CY Total Sales</span>
              <p className="text-lg font-mono font-black text-yellow-400">
                {formatMoney(aTotals.netTotal)}
              </p>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <div className="bg-gray-100 p-2 text-xs font-black uppercase text-gray-700 border-b">
              Calendar Year {selectedReportYear} Annual BIR Summary Parameters
            </div>
            <div className="p-3 bg-white space-y-2 font-mono text-[11px] leading-relaxed">
              <div className="flex justify-between border-b pb-1">
                <span>Annual Gross Sales (Exclusive of VAT):</span>
                <span className="font-semibold font-mono">{formatMoney(aTotals.vatableSales + aTotals.vatExempt)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Annual VAT Exempt Sales (Seniors/PWD):</span>
                <span className="font-semibold font-mono text-gray-500">{formatMoney(aTotals.vatExempt)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Annual Zero-Rated Sales:</span>
                <span className="font-semibold font-mono text-gray-500">{formatMoney(aTotals.zeroRated)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Annual Vatable Sales:</span>
                <span className="font-semibold font-mono text-blue-800">{formatMoney(aTotals.vatableSales)}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span>Annual Output VAT 12%:</span>
                <span className="font-semibold font-mono text-green-700">{formatMoney(aTotals.outputTax)}</span>
              </div>
              <div className="flex justify-between pt-1 font-black text-xs text-slate-900">
                <span>CONSOLIDATED ANNUAL SALES:</span>
                <span className="text-blue-900 font-mono">{formatMoney(aTotals.netTotal)}</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-black uppercase text-gray-600 mb-2">Quarterly VAT Consolidation List for CY {selectedReportYear}</h4>
            <div className="border rounded overflow-hidden text-xs">
              <table className="w-full text-left bg-white">
                <thead className="bg-gray-100 border-b text-[9px] uppercase font-black text-gray-500">
                  <tr>
                    <th className="py-2.5 px-3">Quarter</th>
                    <th className="py-2.5 px-3 text-right">Transactions</th>
                    <th className="py-2.5 px-3 text-right">Vatable Sales</th>
                    <th className="py-2.5 px-3 text-right">VAT Exempt</th>
                    <th className="py-2.5 px-3 text-right">Output VAT Due</th>
                    <th className="py-2.5 px-3 text-right font-black text-gray-800">Net Sales</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-150">
                  {aTotals.quarters.map((q) => (
                    <tr key={q.q} className="hover:bg-gray-50">
                      <td className="py-2.5 px-3 font-semibold text-blue-900">
                        {q.q}{q.q === 1 ? 'st' : q.q === 2 ? 'nd' : q.q === 3 ? 'rd' : 'th'} Quarter Summary
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">{q.count.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-600">{formatMoney(q.vatable)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-gray-500">{formatMoney(q.discount)}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-green-750">{formatMoney(q.tax)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-gray-900">{formatMoney(q.net)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Official Sales Journal and csv file exporter */}
      {activeTab === 'journal' && (
        <div className="bg-white rounded-lg border border-gray-300 p-4 shadow-sm space-y-3">
          <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-700">Official Sales Journal Table</h3>
              <p className="text-[10px] text-gray-500 font-semibold uppercase">eBIRForms Compatible file listing</p>
            </div>
            <div className="flex space-x-2">
              <select
                value={journalFilterMonth}
                onChange={(e) => setJournalFilterMonth(e.target.value)}
                className="border p-1 text-xs font-semibold rounded bg-white"
              >
                <option value="all">All Months (Consolidated)</option>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                  <option key={m} value={m}>
                    {getMonthName(m)}
                  </option>
                ))}
              </select>
              <button
                onClick={exportJournalCSV}
                className="rounded bg-green-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-green-800 flex items-center space-x-1"
              >
                <span>💾 Download CSV Journal</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto text-[11px] font-sans">
            <table className="w-full text-left bg-white">
              <thead>
                <tr className="border-b bg-gray-100 uppercase font-black text-[9px] text-gray-500">
                  <th className="py-2 px-1.5 font-bold">Line</th>
                  <th className="py-2 px-1.5">Date</th>
                  <th className="py-2 px-1.5">OR No.</th>
                  <th className="py-2 px-1.5">Customer Name</th>
                  <th className="py-2 px-1.5">Branch</th>
                  <th className="py-2 px-1.5 text-right">Gross Sales</th>
                  <th className="py-2 px-1.5 text-right">VAT Exempt</th>
                  <th className="py-2 px-1.5 text-right">Zero Rated</th>
                  <th className="py-2 px-1.5 text-right">Vatable Sales</th>
                  <th className="py-2 px-1.5 text-right">Output VAT 12%</th>
                  <th className="py-2 px-1.5 text-right">Total Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250">
                {journalEntries.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4 text-gray-400 italic">No corresponding journal output matching month parameters.</td>
                  </tr>
                ) : (
                  journalEntries.map((j) => (
                    <tr key={j.num} className="hover:bg-gray-50 text-[10px] font-medium text-gray-700">
                      <td className="py-1 px-1.5 font-bold text-gray-500">{j.num}</td>
                      <td className="py-1 px-1.5">{j.date}</td>
                      <td className="py-1 px-1.5 font-mono">{j.orNo}</td>
                      <td className="py-1 px-1.5 font-semibold text-gray-800">{j.customerName}</td>
                      <td className="py-1 px-1.5">{j.branch}</td>
                      <td className="py-1 px-1.5 text-right font-mono">{formatMoney(j.grossSales)}</td>
                      <td className="py-1 px-1.5 text-right font-mono text-gray-500">{formatMoney(j.vatExempt)}</td>
                      <td className="py-1 px-1.5 text-right font-mono text-gray-500">{formatMoney(j.zeroRated)}</td>
                      <td className="py-1 px-1.5 text-right font-mono text-blue-750">{formatMoney(j.vatableSales)}</td>
                      <td className="py-1 px-1.5 text-right font-mono text-green-700">{formatMoney(j.outputTax)}</td>
                      <td className="py-1 px-1.5 text-right font-mono font-bold text-gray-900">{formatMoney(j.totalSales)}</td>
                    </tr>
                  ))
                )}
              </tbody>
              {journalEntries.length > 0 && (
                <tfoot className="bg-gray-50 font-semibold border-t-2 border-gray-350 text-[10px]">
                  <tr>
                    <td colSpan={5} className="py-2 px-1.5 uppercase font-black text-gray-800 text-center">Totals</td>
                    <td className="py-2 px-1.5 text-right font-mono text-gray-900 font-bold">
                      {formatMoney(journalEntries.reduce((sum, item) => sum + item.grossSales, 0))}
                    </td>
                    <td className="py-2 px-1.5 text-right font-mono text-gray-500">
                      {formatMoney(journalEntries.reduce((sum, item) => sum + item.vatExempt, 0))}
                    </td>
                    <td className="py-2 px-1.5 text-right font-mono text-gray-500">
                      {formatMoney(journalEntries.reduce((sum, item) => sum + item.zeroRated, 0))}
                    </td>
                    <td className="py-2 px-1.5 text-right font-mono text-blue-750 font-bold">
                      {formatMoney(journalEntries.reduce((sum, item) => sum + item.vatableSales, 0))}
                    </td>
                    <td className="py-2 px-1.5 text-right font-mono text-green-700 font-bold">
                      {formatMoney(journalEntries.reduce((sum, item) => sum + item.outputTax, 0))}
                    </td>
                    <td className="py-2 px-1.5 text-right font-mono text-blue-900 font-black">
                      {formatMoney(journalEntries.reduce((sum, item) => sum + item.totalSales, 0))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
