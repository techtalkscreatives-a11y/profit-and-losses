import React, { useState } from 'react';
import { User, InventoryItem, DirectPurchase, Branch, InterBranchTransfer, WastageLog } from '../types';
import { 
  Package, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRightLeft, 
  TrendingDown, 
  Clipboard, 
  PlusCircle, 
  DollarSign, 
  Truck, 
  ShieldCheck, 
  Eye, 
  Calendar, 
  FileText, 
  ChevronRight, 
  CheckSquare, 
  XSquare,
  Hash,
  Activity,
  Layers
} from 'lucide-react';

interface InventoryManagerProps {
  currentUser: User;
  activeBranch: string;
  inventory: InventoryItem[];
  directPurchases: DirectPurchase[];
  branches: Branch[];
  transfers: InterBranchTransfer[];
  onAddOrUpdateInventory: (item: InventoryItem) => Promise<boolean>;
  onAddOrUpdatePurchase: (item: DirectPurchase) => Promise<boolean>;
  onAddOrUpdateTransfer: (item: InterBranchTransfer) => Promise<boolean>;
  onAddWastageLog: (log: WastageLog) => Promise<boolean>;
  formatMoney: (val: number) => string;
}

export const InventoryManagerComponent: React.FC<InventoryManagerProps> = ({
  currentUser,
  activeBranch,
  inventory,
  directPurchases,
  branches,
  transfers,
  onAddOrUpdateInventory,
  onAddOrUpdatePurchase,
  onAddOrUpdateTransfer,
  onAddWastageLog,
  formatMoney,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'ledger' | 'receiving' | 'transfer' | 'counting'>('ledger');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. LEDGER FILTER STATES
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDept, setFilterDept] = useState('All');

  // 2. RECEIVING STOCKS VARIABLES
  const [manualReceiveName, setManualReceiveName] = useState('');
  const [manualReceivePrice, setManualReceivePrice] = useState(0);
  const [manualReceiveQty, setManualReceiveQty] = useState(0);
  const [manualReceiveUnit, setManualReceiveUnit] = useState('pcs');
  const [manualReceiveDept, setManualReceiveDept] = useState('Kitchen');
  const [manualReceiveDesc, setManualReceiveDesc] = useState('');

  // 3. TRANSFER STATES
  const [transferIngId, setTransferIngId] = useState('');
  const [transferQty, setTransferQty] = useState(0);
  const [transferDestBranch, setTransferDestBranch] = useState('Manila');
  const [transferDestDept, setTransferDestDept] = useState('Kitchen');

  // 4. DAILY UPDATE/MANUAL COUNTING STATES
  const [manualCounts, setManualCounts] = useState<Record<string, number>>({});
  const [countingFilterPeriod, setCountingFilterPeriod] = useState<'Day' | 'Week' | 'Month'>('Day');

  // Access Security Constraint Check: Manager / Team Leader can only access or see their own branch database
  const isBranchRestricted = currentUser.role !== 'Admin';
  
  // Filter inventory based on security constraints
  const scopedInventory = inventory.filter(item => {
    // If branch restricted, can only see their exact login branch items
    if (isBranchRestricted && item.branchId !== activeBranch) {
      return false;
    }
    // General searches
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = filterDept === 'All' || item.department === filterDept;
    return matchesSearch && matchesDept;
  });

  // Calculate total inventory asset value overseen
  const totalOverseenValue = scopedInventory.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0);

  // Filter direct purchases pending receiving
  const pendingApprovalsReceiving = directPurchases.filter(p => {
    if (isBranchRestricted && p.branchId !== activeBranch) return false;
    // Approved and Pending can be received
    return p.status === 'Approved';
  });

  // Approved and Received log history
  const receivedHistory = directPurchases.filter(p => {
    if (isBranchRestricted && p.branchId !== activeBranch) return false;
    return p.status === 'Received';
  });

  // Handle Receiving from approved PO Request
  const handleConfirmReceivedPO = async (po: DirectPurchase) => {
    try {
      setSuccessMsg('');
      setErrorMsg('');

      // Update PO status to Received
      const updatedPO: DirectPurchase = {
        ...po,
        status: 'Received'
      };

      const pS = await onAddOrUpdatePurchase(updatedPO);
      if (!pS) {
        setErrorMsg('Failed to update Direct Purchase order status.');
        return;
      }

      // Automatically add product line counts to corresponding inventory
      for (const line of po.items) {
        // Find existing SKU in branch
        const existing = inventory.find(
          inv => inv.name.toLowerCase() === line.name.toLowerCase() && inv.branchId === po.branchId
        );

        if (existing) {
          const updatedInv: InventoryItem = {
            ...existing,
            quantity: Number(existing.quantity) + Number(line.qty),
            unitCost: Number(line.unitPrice), // update latest cost
            department: po.department // ensure correct dept charging
          };
          await onAddOrUpdateInventory(updatedInv);
        } else {
          // Record as brand new SKU
          const newSku: InventoryItem = {
            id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            name: line.name,
            unit: line.unit || 'kg',
            quantity: line.qty,
            reorderLevel: 5,
            parLevel: 50,
            unitCost: line.unitPrice,
            department: po.department,
            branchId: po.branchId
          };
          await onAddOrUpdateInventory(newSku);
        }
      }

      setSuccessMsg(`Perfect! PO and SI:${po.orSiNo} marked as RECEIVED. Added all ${po.items.length} items to branch inventory.`);
    } catch (e) {
      setErrorMsg('Error executing automatic stock adjustment.');
    }
  };

  // Handle Manual Non-Food / Other Expenses Received Item Inputting
  const handleManualReceiveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!manualReceiveName.trim() || manualReceiveQty <= 0 || manualReceivePrice <= 0) {
      setErrorMsg('Please specify valid Name, Qty, and Purchase Cost.');
      return;
    }

    try {
      // 1. Add directly as non-food / other items to Inventory
      const existing = inventory.find(
        inv => inv.name.toLowerCase() === manualReceiveName.toLowerCase() && inv.branchId === activeBranch
      );

      if (existing) {
        const updated: InventoryItem = {
          ...existing,
          quantity: existing.quantity + manualReceiveQty,
          unitCost: manualReceivePrice,
          department: manualReceiveDept
        };
        await onAddOrUpdateInventory(updated);
      } else {
        const newSku: InventoryItem = {
          id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: manualReceiveName.trim(),
          unit: manualReceiveUnit,
          quantity: manualReceiveQty,
          reorderLevel: 2,
          parLevel: 20,
          unitCost: manualReceivePrice,
          department: manualReceiveDept,
          branchId: activeBranch
        };
        await onAddOrUpdateInventory(newSku);
      }

      // 2. Log also into Direct Purchases history for financial records
      const customPO: DirectPurchase = {
        id: `dp-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        dateTime: new Date().toISOString(),
        supplierName: 'Direct Walk-in / Miscellaneous Outlay',
        supplierBrand: 'MISC Cash Buy',
        contactInfo: 'N/A',
        address: 'N/A',
        tin: 'None',
        orSiNo: `MAN-REC-${Date.now().toString().slice(-4)}`,
        pcvNo: `PCV-MAN-${Date.now().toString().slice(-4)}`,
        department: manualReceiveDept,
        branchId: activeBranch,
        items: [{
          name: manualReceiveName,
          qty: manualReceiveQty,
          unit: manualReceiveUnit,
          unitPrice: manualReceivePrice,
          total: manualReceiveQty * manualReceivePrice
        }],
        totalAmount: manualReceiveQty * manualReceivePrice,
        status: 'Received'
      };

      await onAddOrUpdatePurchase(customPO);

      setSuccessMsg(`Successfully received ${manualReceiveQty} ${manualReceiveUnit} of miscellaneous item: "${manualReceiveName}"!`);
      
      // Reset
      setManualReceiveName('');
      setManualReceiveQty(0);
      setManualReceivePrice(0);
      setManualReceiveUnit('pcs');
      setManualReceiveDesc('');
    } catch (err) {
      setErrorMsg('Operational error storing manual stock entry.');
    }
  };

  // Handle Inter-Branch Transfer Execution
  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!transferIngId) {
      setErrorMsg('Please select a valid item SKU to transfer.');
      return;
    }

    const sourceItem = inventory.find(inv => inv.id === transferIngId);
    if (!sourceItem) {
      setErrorMsg('Matching item not found.');
      return;
    }

    if (transferQty <= 0 || transferQty > sourceItem.quantity) {
      setErrorMsg(`Insufficient stock! Present balance is only ${sourceItem.quantity} ${sourceItem.unit}.`);
      return;
    }

    if (transferDestBranch === sourceItem.branchId) {
      setErrorMsg('Origin branch and destination branch must be distinct.');
      return;
    }

    try {
      // 1. Deduct from sender catalog
      const updatedSender: InventoryItem = {
        ...sourceItem,
        quantity: sourceItem.quantity - transferQty
      };
      await onAddOrUpdateInventory(updatedSender);

      // 2. Increase or create on target receiver catalog
      const targetExisting = inventory.find(
        inv => inv.name.toLowerCase() === sourceItem.name.toLowerCase() && inv.branchId === transferDestBranch
      );

      if (targetExisting) {
        const updatedReceiver: InventoryItem = {
          ...targetExisting,
          quantity: Number(targetExisting.quantity) + Number(transferQty),
          unitCost: sourceItem.unitCost // keep cost sync
        };
        await onAddOrUpdateInventory(updatedReceiver);
      } else {
        const newReceiverSku: InventoryItem = {
          id: `i-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          name: sourceItem.name,
          unit: sourceItem.unit,
          quantity: transferQty,
          reorderLevel: sourceItem.reorderLevel,
          parLevel: sourceItem.parLevel,
          unitCost: sourceItem.unitCost,
          department: transferDestDept,
          branchId: transferDestBranch
        };
        await onAddOrUpdateInventory(newReceiverSku);
      }

      // 3. Log Transfer parameters
      const transferLog: InterBranchTransfer = {
        id: `t-${Date.now()}`,
        date: new Date().toISOString().slice(0, 10),
        senderBranchId: sourceItem.branchId,
        receiverBranchId: transferDestBranch,
        department: transferDestDept,
        ingredientId: sourceItem.id,
        quantity: transferQty,
        value: transferQty * sourceItem.unitCost,
        status: 'Approved'
      };

      await onAddOrUpdateTransfer(transferLog);

      setSuccessMsg(`Inter-transfer executed successfully! Transferred ${transferQty} ${sourceItem.unit} of "${sourceItem.name}" from ${sourceItem.branchId} to ${transferDestBranch}.`);
      setTransferQty(0);
      setTransferIngId('');
    } catch (err) {
      setErrorMsg('Error storing transfer record.');
    }
  };

  // Handle physical update count submissions (discrepancy variance flow)
  const submitPhysicalCounts = async () => {
    try {
      setSuccessMsg('');
      setErrorMsg('');

      let discrepancyLogged = 0;

      for (const [id, typedVal] of Object.entries(manualCounts)) {
        const matchingItem = inventory.find(inv => inv.id === id);
        if (!matchingItem || typedVal === undefined) continue;

        const delta = Number(matchingItem.quantity) - Number(typedVal); // positive means shrinkage/wastage loss
        if (delta === 0) continue;

        // Deduct/Reflect latest actual in inventory directly
        const updatedItem: InventoryItem = {
          ...matchingItem,
          quantity: typedVal
        };
        await onAddOrUpdateInventory(updatedItem);

        // If there's a negative stock variance (we have less on hand physically), log automatically to wastage
        if (delta > 0) {
          const wLog: WastageLog = {
            id: `w-auto-${Date.now()}-${matchingItem.id}`,
            date: new Date().toISOString().slice(0, 10),
            branchId: matchingItem.branchId,
            department: matchingItem.department,
            ingredientId: matchingItem.id,
            qtyWasted: delta,
            unit: matchingItem.unit,
            cost: matchingItem.unitCost,
            wasteType: 'Wastage',
            reason: `Physical count auto-variance correction (${countingFilterPeriod})`
          };
          await onAddWastageLog(wLog);
          discrepancyLogged++;
        }
      }

      setSuccessMsg(`Successfully saved updated physical counts. Logged ${discrepancyLogged} instances of stock variances to wastage logs.`);
      setManualCounts({});
    } catch (err) {
      setErrorMsg('Error committing count updates.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Tab select menu */}
      <div className="flex border-b border-gray-300">
        <button
          onClick={() => { setActiveSubTab('ledger'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider transition ${
            activeSubTab === 'ledger' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          🗃️ General Inventory Ledger
        </button>
        <button
          onClick={() => { setActiveSubTab('receiving'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            activeSubTab === 'receiving' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Truck size={14} /> Receiving Deliveries & Stocks
          {pendingApprovalsReceiving.length > 0 && (
            <span className="bg-orange-550 bg-orange-600 text-white rounded-full px-1.5 py-0.5 text-[8px] tracking-normal font-black animate-pulse">
              {pendingApprovalsReceiving.length}
            </span>
          )}
        </button>
        <button
          onClick={() => { setActiveSubTab('transfer'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            activeSubTab === 'transfer' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <ArrowRightLeft size={14} /> Inter-branch Stock Transfer
        </button>
        <button
          onClick={() => { setActiveSubTab('counting'); setSuccessMsg(''); setErrorMsg(''); }}
          className={`py-3.5 px-5 text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 ${
            activeSubTab === 'counting' ? 'border-b-2 border-blue-700 text-blue-900 bg-blue-50/40' : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          <Clipboard size={14} /> Daily Stock Count & Variance
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-300 p-3 rounded-lg text-green-800 flex items-center gap-2 font-black uppercase text-[10px]">
          <CheckCircle size={15} className="text-green-600" /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-350 p-3 rounded-lg text-red-800 flex items-center gap-2 font-black uppercase text-[10px]">
          <AlertTriangle size={15} className="text-red-600" /> {errorMsg}
        </div>
      )}

      {/* SUBTAB 1: GENERAL INVENTORY LEDGER */}
      {activeSubTab === 'ledger' && (
        <div className="space-y-4 text-xs">
          
          {/* Filters Line */}
          <div className="bg-gray-50 border border-gray-300 p-3.5 rounded-lg flex flex-col sm:flex-row justify-between items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[10px] font-extrabold uppercase text-gray-400 font-mono">SEARCING_INDEX:</span>
              <input 
                type="text"
                placeholder="Filer ingredient, pack sizes, containers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 rounded border border-gray-300 p-1.5 font-bold text-gray-800 focus:ring-1 focus:ring-blue-700 outline-none"
              />
            </div>

            <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase text-gray-400 font-mono">CHARGED_DEPT:</span>
                <select 
                  value={filterDept}
                  onChange={(e) => setFilterDept(e.target.value)}
                  className="rounded border border-gray-300 p-1 py-1.5 font-bold bg-white"
                >
                  <option value="All">All Departments</option>
                  <option value="Kitchen">Kitchen</option>
                  <option value="Resto Branches">Resto Branches</option>
                  <option value="Commissary">Commissary</option>
                  <option value="Housekeeping">Housekeeping</option>
                  <option value="Engineering">Engineering</option>
                  <option value="Human Resources">Human Resources</option>
                </select>
              </div>

              <div className="bg-blue-900 text-white rounded p-1.5 font-bold text-[10px] uppercase leading-none tracking-wider text-right shadow-xs">
                Active Value: <b className="font-mono text-xs">{formatMoney(totalOverseenValue)}</b>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white border border-gray-300 rounded-lg overflow-hidden shadow-sm">
            <table className="w-full text-left font-medium">
              <thead className="bg-gray-100 border-b border-gray-250 text-[10px] font-black uppercase text-gray-500 tracking-wider">
                <tr>
                  <th className="py-2.5 px-3.5">SKU Description</th>
                  <th className="py-2.5 px-3.5">Branch Base</th>
                  <th className="py-2.5 px-3.5">Department</th>
                  <th className="py-2.5 px-3.5 text-right">Physical Balance</th>
                  <th className="py-2.5 px-3.5">Unit</th>
                  <th className="py-2.5 px-3.5 text-right">Buying Price</th>
                  <th className="py-2.5 px-3.5 text-right font-black">Net Ledger Cost</th>
                  <th className="py-2.5 px-3.5">Threshold par</th>
                  <th className="py-2.5 px-3.5 text-center">Status Index</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-150 text-[11px] font-bold text-gray-700">
                {scopedInventory.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-gray-400 uppercase font-black tracking-widest text-[10px]">
                      No corresponding item registry was catalogued
                    </td>
                  </tr>
                ) : (
                  scopedInventory.map((item) => {
                    const valueOnStock = item.quantity * item.unitCost;
                    const isLow = item.quantity <= item.reorderLevel;
                    return (
                      <tr key={item.id} className="hover:bg-gray-50 transition">
                        <td className="py-2 px-3.5 font-black text-gray-900">{item.name}</td>
                        <td className="py-2 px-3.5 text-blue-800">{item.branchId}</td>
                        <td className="py-2 px-3.5 text-gray-600 font-extrabold uppercase">{item.department}</td>
                        <td className="py-2 px-3.5 text-right font-mono font-bold text-gray-950">{item.quantity}</td>
                        <td className="py-2 px-3.5 text-gray-400 font-extrabold uppercase">{item.unit}</td>
                        <td className="py-2 px-3.5 text-right font-mono text-gray-500">{formatMoney(item.unitCost)}</td>
                        <td className="py-2 px-3.5 text-right font-mono font-black text-blue-900">{formatMoney(valueOnStock)}</td>
                        <td className="py-2 px-3.5 text-gray-400 font-normal">Min: {item.reorderLevel} | Max: {item.parLevel}</td>
                        <td className="py-2 px-2 text-center">
                          {isLow ? (
                            <span className="rounded bg-red-100 text-red-700 px-2 py-0.5 text-[8px] font-black uppercase inline-block border border-red-200">
                              Low Level
                            </span>
                          ) : (
                            <span className="rounded bg-green-100 text-green-700 px-2 py-0.5 text-[8px] font-black uppercase inline-block border border-green-200">
                              Normal
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: RECEIVING DELIVERIES */}
      {activeSubTab === 'receiving' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs font-semibold text-gray-700">
          
          {/* Left Portion: Approved Direct Purchase Requests Delivery Reconciler */}
          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-xs space-y-3">
            <div className="border-b pb-1.5 flex justify-between items-center">
              <h3 className="text-xs font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
                <Truck size={14} /> APPROVED PURCHASES WAITING FOR DELIVERY RECONCILIATORY RECEIPT
              </h3>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {pendingApprovalsReceiving.length === 0 ? (
                <div className="border border-dashed p-8 rounded text-center text-gray-400 uppercase tracking-wider font-extrabold text-[10px]">
                  No approved purchase requirements awaiting physical delivery.
                </div>
              ) : (
                pendingApprovalsReceiving.map(po => (
                  <div key={po.id} className="border border-gray-250 p-3.5 rounded bg-gray-50 space-y-2 relative">
                    <span className="absolute top-3 right-3 text-[9px] bg-sky-100 text-sky-800 border border-sky-305 px-2 py-0.5 rounded font-black uppercase">
                      Approved PO
                    </span>

                    <div className="space-y-0.5">
                      <p className="text-xs font-black text-gray-950 uppercase">{po.supplierName}</p>
                      <p className="text-[10px] text-gray-400 font-extrabold uppercase">
                        Invoice NO: {po.orSiNo} | PV Code: {po.pcvNo} | Department: <b className="text-blue-900 font-bold">{po.department}</b>
                      </p>
                    </div>

                    <div className="border-t border-dashed border-gray-300 pt-2">
                      <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-wider pb-1">Items Included:</p>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                        {po.items.map((line, idx) => (
                          <div key={idx} className="bg-white p-1.5 rounded border border-gray-150 text-[10px] font-bold">
                            <p className="text-gray-900 truncate leading-none pb-0.5">{line.name}</p>
                            <span className="text-blue-800 font-mono font-black">{line.qty} {line.unit || 'kg'}</span> @ <span className="font-mono text-gray-400">{formatMoney(line.unitPrice)}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                      <span className="font-mono font-black text-blue-900 text-xs">Total PO Sum: {formatMoney(po.totalAmount)}</span>
                      <button
                        onClick={() => handleConfirmReceivedPO(po)}
                        className="bg-green-700 hover:bg-green-800 text-white font-black uppercase text-[10px] py-1.5 px-3 rounded flex items-center gap-1 transition"
                      >
                        <ShieldCheck size={11} /> Confirm Received & Update Stocks
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Historical Received Logs list */}
            {receivedHistory.length > 0 && (
              <div className="pt-3 border-t">
                <p className="text-[10px] font-black uppercase text-gray-400 mb-2">LATEST EXECUTED SI/OR RECORDINGS ({receivedHistory.length})</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {receivedHistory.slice(0, 10).map((rh) => (
                    <div key={rh.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-[10px]">
                      <div>
                        <span className="font-bold text-gray-800 uppercase">{rh.supplierName}</span>
                        <span className="text-gray-400 ml-1">({rh.orSiNo})</span>
                      </div>
                      <span className="font-mono block text-gray-400">Total: {formatMoney(rh.totalAmount)}</span>
                      <span className="text-emerald-700 font-black uppercase text-[9px] flex items-center gap-0.5"><CheckCircle size={10} /> RECVD</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Portion: Manual Other Non-Food & Asset Receipts Entrance Form */}
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-xs h-fit space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-1.5 flex items-center gap-1 tracking-wider">
              <PlusCircle size={14} className="text-blue-700" /> DIRECT OTHER EXPENSES & MISCELLANEOUS RAW STOCK RECEIPT
            </h3>

            <form onSubmit={handleManualReceiveSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Item SKU Name / Miscellaneous Outlay</label>
                <input 
                  type="text"
                  value={manualReceiveName}
                  onChange={(e) => setManualReceiveName(e.target.value)}
                  placeholder="e.g. Heavy Duty Detergent Liquid (Other Expenses)"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Incoming Quantity</label>
                  <input 
                    type="number"
                    value={manualReceiveQty || ''}
                    onChange={(e) => setManualReceiveQty(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold font-mono text-xs"
                    placeholder="10"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Physical Packaging Unit</label>
                  <input 
                    type="text"
                    value={manualReceiveUnit}
                    onChange={(e) => setManualReceiveUnit(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-xs"
                    placeholder="Gallons, pcs, kg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Unit Cost Basis (PHP)</label>
                  <input 
                    type="number"
                    value={manualReceivePrice || ''}
                    onChange={(e) => setManualReceivePrice(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold font-mono text-xs"
                    placeholder="150"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Assigned Department</label>
                  <select 
                    value={manualReceiveDept}
                    onChange={(e) => setManualReceiveDept(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-xs bg-white"
                  >
                    <option value="FnB Restaurant">FnB Restaurant</option>
                    <option value="Kitchen">Kitchen</option>
                    <option value="Commissary">Commissary</option>
                    <option value="Housekeeping">Housekeeping</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Human Resources">Human Resources</option>
                    <option value="Top Management">Top Management Office</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs py-2 rounded shadow transition flex items-center justify-center gap-1"
              >
                📥 Save & Receive stock item
              </button>
            </form>
          </div>

        </div>
      )}

      {/* SUBTAB 3: INTER BRANCH TRANSFERS */}
      {activeSubTab === 'transfer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs">
          
          {/* Transfer Creator Form */}
          <div className="lg:col-span-5 bg-white p-4 border border-gray-300 rounded-lg shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-1.5 tracking-wider flex items-center gap-1">
              <ArrowRightLeft size={14} className="text-blue-700" /> INITIATE SINGLE INTER-BRANCH STOCK TRANSFER OUT
            </h3>

            <form onSubmit={handleExecuteTransfer} className="space-y-3.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Select Ingredient SKU (Origin: {activeBranch})</label>
                <select 
                  value={transferIngId}
                  onChange={(e) => setTransferIngId(e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold bg-white text-xs"
                >
                  <option value="">-- Choose local stock item --</option>
                  {scopedInventory.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.name} (OnHand: {inv.quantity} {inv.unit} @ {formatMoney(inv.unitCost)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Transfer Qty</label>
                  <input 
                    type="number"
                    value={transferQty || ''}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold font-mono text-xs"
                    placeholder="e.g. 5"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Target Receiver Branch</label>
                  <select 
                    value={transferDestBranch}
                    onChange={(e) => setTransferDestBranch(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold bg-white text-xs"
                  >
                    <option value="Manila">Manila Branch</option>
                    <option value="Cubao">Cubao Main Branch</option>
                    <option value="QC">QC Branch</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Target Charge Department (Receiver)</label>
                <select 
                  value={transferDestDept}
                  onChange={(e) => setTransferDestDept(e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold bg-white text-xs"
                >
                  <option value="Kitchen">Kitchen Department</option>
                  <option value="Resto Branches">Resto Branches</option>
                  <option value="Commissary">Commissary Unit</option>
                  <option value="Housekeeping">Housekeeping Office</option>
                  <option value="Engineering">Engineering Maintenance</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-black uppercase text-xs py-2 rounded shadow transition flex items-center justify-center gap-1"
              >
                ⚡ Execute Mutual Inter-transfer
              </button>
            </form>
          </div>

          {/* Transfers History Ledger Column */}
          <div className="lg:col-span-7 bg-white p-4 border border-gray-300 rounded-lg shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider">
              REAL-TIME BRANCH LOGISTICS & STOCK TRANSFER LEDGERS
            </h3>

            <div className="bg-white border rounded overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-gray-100 border-b text-[10px] font-black uppercase text-gray-400">
                  <tr>
                    <th className="p-2">Log Date</th>
                    <th className="p-2">From Base</th>
                    <th className="p-2">Target Base</th>
                    <th className="p-2">Line Qty</th>
                    <th className="p-2 text-right">Value charged</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-[11px] font-semibold text-gray-600 uppercase">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-gray-400 italic font-bold">
                        No historic branch transfer requests logged.
                      </td>
                    </tr>
                  ) : (
                    transfers.map(tr => (
                      <tr key={tr.id} className="hover:bg-gray-50 font-medium">
                        <td className="p-2 font-mono text-[10px]">{tr.date}</td>
                        <td className="p-2 text-red-700 font-extrabold">{tr.senderBranchId}</td>
                        <td className="p-2 text-green-700 font-extrabold">{tr.receiverBranchId}</td>
                        <td className="p-2 font-mono">{tr.quantity} units</td>
                        <td className="p-2 text-right font-mono font-bold text-gray-900">{formatMoney(tr.value)}</td>
                        <td className="p-2 text-center">
                          <span className="bg-green-100 text-green-800 border border-green-200 px-1.5 py-0.5 rounded text-[8px] font-black tracking-wider uppercase">
                            EXEC-OK
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

          </div>

        </div>
      )}

      {/* SUBTAB 4: DAILY UPDATE / MANUAL COUNTING & VARIANCE COMPARISON */}
      {activeSubTab === 'counting' && (
        <div className="space-y-4 text-xs font-semibold text-gray-700">
          
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="space-y-1">
              <h3 className="text-xs font-black uppercase text-blue-950 flex items-center gap-1 tracking-wider leading-none">
                <FileText size={15} className="text-blue-700" /> DAILY/WEEKLY/MONTHLY STOCK BALANCE COUNTING & SPOILAGE EXCLUSION
              </h3>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest leading-none">
                Compare physical stock records against ledger math. Negative variances auto-log to Spoilage logs.
              </p>
            </div>

            <div className="flex gap-2">
              {['Day', 'Week', 'Month'].map(period => (
                <button
                  key={period}
                  onClick={() => setCountingFilterPeriod(period as any)}
                  className={`px-3 py-1.5 rounded font-black uppercase text-[10px] tracking-wider transition ${
                    countingFilterPeriod === period 
                      ? 'bg-blue-750 bg-blue-700 text-white shadow-xs' 
                      : 'bg-white border text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {period} Comparison
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white border text-gray-500 uppercase font-bold border-gray-300 rounded-lg overflow-hidden p-4 space-y-4 shadow-sm">
            
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-[10px] font-black uppercase text-gray-400">INPUTTING ON-HAND BALANCE INVENTORY VALUES BY CLERK:</span>
              <button
                onClick={submitPhysicalCounts}
                className="bg-purple-700 hover:bg-purple-800 text-white font-black uppercase tracking-wider text-[10px] py-2 px-4 rounded shadow-xs"
              >
                💾 Commit Counts & Reconcile Spoilages
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[480px] overflow-y-auto pr-1">
              {scopedInventory.map(item => {
                const theoretical = Number(item.quantity);
                const draftVal = manualCounts[item.id];
                const variance = draftVal !== undefined ? Number(draftVal) - theoretical : 0;
                const rawCostValue = variance * Number(item.unitCost);

                return (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50 flex flex-col justify-between hover:border-gray-350 transition">
                    <div>
                      <div className="flex justify-between items-start">
                        <p className="text-xs font-black text-gray-950 uppercase truncate w-3/4">{item.name}</p>
                        <span className="text-[8px] bg-gray-200 text-gray-500 px-1.5 rounded uppercase font-black tracking-widest">{item.department}</span>
                      </div>
                      <p className="text-[10px] text-gray-400 uppercase font-black mt-1">THEORETICAL: <b className="text-gray-900 font-mono text-xs">{theoretical} {item.unit}</b></p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-3.5 pt-2 border-t border-dashed border-gray-250">
                      <div>
                        <label className="block text-[8px] font-black uppercase text-gray-400 mb-0.5">Physical count</label>
                        <input 
                          type="number"
                          value={draftVal !== undefined ? draftVal : ''}
                          onChange={(e) => setManualCounts({
                            ...manualCounts,
                            [item.id]: e.target.value === '' ? undefined as any : Number(e.target.value)
                          })}
                          placeholder={String(theoretical)}
                          className="w-full rounded border border-gray-300 p-1 font-mono text-center font-bold text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-700"
                        />
                      </div>

                      <div className="flex flex-col justify-end items-end text-right">
                        {variance !== 0 ? (
                          <div className="space-y-0.5">
                            <span className={`text-[9px] font-black uppercase px-1.5 rounded ${variance < 0 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                              {variance < 0 ? 'Shortage Loss' : 'Overage Gain'}
                            </span>
                            <p className="text-[10px] font-mono font-bold leading-none mt-1">
                              Var: <b className="font-extrabold">{variance > 0 ? `+${variance}` : variance}</b>
                            </p>
                            <p className="text-[8px] font-mono text-gray-400">
                              Val: {variance > 0 ? `+${formatMoney(rawCostValue)}` : formatMoney(rawCostValue)}
                            </p>
                          </div>
                        ) : (
                          <span className="text-[9px] text-gray-400 uppercase italic font-bold">In Sync (0 Var)</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
