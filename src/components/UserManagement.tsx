import React, { useState } from 'react';
import { User, UserRole, Branch, TaxInfo } from '../types';
import { 
  Users, 
  UserPlus, 
  Key, 
  CheckSquare, 
  Square, 
  MapPin, 
  Shield, 
  Search, 
  Trash2, 
  Edit3, 
  RefreshCw, 
  Unlock, 
  Lock,
  Compass,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface UserManagementProps {
  currentUser: User;
  users: User[];
  branches: Branch[];
  onAddOrUpdateUser: (user: User) => Promise<boolean>;
  onDeleteUser: (id: string) => Promise<boolean>;
  taxInfo: TaxInfo;
  onSaveTaxInfo: (info: TaxInfo) => Promise<void>;
  onAddOrUpdateBranch?: (branch: Branch) => Promise<boolean>;
  onDeleteBranch?: (id: string) => Promise<boolean>;
}

const AVAILABLE_MODULES = [
  { key: 'pos', label: 'Point of Sale (POS)', desc: 'Register sales, select menus, print thermal slips' },
  { key: 'kds', label: 'Kitchen Display System (KDS)', desc: 'Order status flow screen for kitchen cooks' },
  { key: 'shifts', label: 'Shift Sessions', desc: 'Open/close registers, enter drawer cash floats' },
  { key: 'inventory', label: 'Inventory Control', desc: 'Reconcile stock, transfer logs between branches' },
  { key: 'procurement', label: 'Procurement Management', desc: 'Register supplier purchasing orders & direct buying' },
  { key: 'wastage', label: 'Wastage Ledger', desc: 'Log spoiled ingredients or expired stocks' },
  { key: 'production', label: 'Chef Production Hub', desc: 'Log bulk recipe costing batching inputs & products' },
  { key: 'attendance', label: 'Staff Attendance / Payroll', desc: 'Check in, log OT hours, manage loans & advances' },
  { key: 'reservations', label: 'Reservations Directory', desc: 'Reserve dining tables & events schedules' },
  { key: 'bir', label: 'BIR Compliance Hub', desc: 'X-Reading, Z-Reading, Tax invoice rules setup' },
  { key: 'event-weddings', label: 'Event & Weddings Banquets', desc: 'Abbott BEO & Villa Escudero format spec sheets' },
];

export const UserManagementComponent: React.FC<UserManagementProps> = ({
  currentUser,
  users,
  branches,
  onAddOrUpdateUser,
  onDeleteUser,
  taxInfo,
  onSaveTaxInfo,
  onAddOrUpdateBranch,
  onDeleteBranch,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'users' | 'business' | 'branches'>('users');

  // Branch management form states
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchAddress, setBranchAddress] = useState('');
  const [branchContact, setBranchContact] = useState('');
  const [branchManager, setBranchManager] = useState('');
  const [assignedEmployeeIds, setAssignedEmployeeIds] = useState<string[]>([]);

  // Business configuration states
  const [bizName, setBizName] = useState(taxInfo.businessName || 'JCC Ocean Bites Foodgroup Inc.');
  const [bizTin, setBizTin] = useState(taxInfo.tin || '192-552-321-000');
  const [bizRdo, setBizRdo] = useState(taxInfo.rdoCode || '043');
  const [bizAddress, setBizAddress] = useState(taxInfo.address || 'GF JCC Plaza, Brgy Socorro, Cubao');
  const [bizLine, setBizLine] = useState(taxInfo.lineOfBusiness || 'Fast Casual Restaurant Operations');
  const [bizTaxType, setBizTaxType] = useState<'VAT' | 'Non-VAT'>(taxInfo.taxType || 'VAT');
  const [bizVatRate, setBizVatRate] = useState(taxInfo.vatRate || 0.12);
  const [bizFiscal, setBizFiscal] = useState(taxInfo.fiscalYearStart || '2026-01-01');
  const [bizFreq, setBizFreq] = useState<'Monthly' | 'Quarterly'>(taxInfo.filingFrequency || 'Monthly');

  // Sync state if taxInfo updates
  React.useEffect(() => {
    if (taxInfo) {
      setBizName(taxInfo.businessName || 'JCC Ocean Bites Foodgroup Inc.');
      setBizTin(taxInfo.tin || '192-552-321-000');
      setBizRdo(taxInfo.rdoCode || '043');
      setBizAddress(taxInfo.address || 'GF JCC Plaza, Brgy Socorro, Cubao');
      setBizLine(taxInfo.lineOfBusiness || 'Fast Casual Restaurant Operations');
      setBizTaxType(taxInfo.taxType || 'VAT');
      setBizVatRate(taxInfo.vatRate || 0.12);
      setBizFiscal(taxInfo.fiscalYearStart || '2026-01-01');
      setBizFreq(taxInfo.filingFrequency || 'Monthly');
    }
  }, [
    taxInfo.businessName,
    taxInfo.tin,
    taxInfo.rdoCode,
    taxInfo.address,
    taxInfo.lineOfBusiness,
    taxInfo.taxType,
    taxInfo.vatRate,
    taxInfo.fiscalYearStart,
    taxInfo.filingFrequency
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Form states
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('Cashier');
  const [branch, setBranch] = useState('Cubao');
  const [department, setDepartment] = useState('FnB Restaurant');
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Default module presets per role to make creation fast
  const applyPresetForRole = (selectedRole: UserRole) => {
    if (selectedRole === 'Admin') {
      setSelectedModules(AVAILABLE_MODULES.map(m => m.key));
    } else if (selectedRole === 'Cashier') {
      setSelectedModules(['pos', 'reservations', 'shifts']);
    } else if (selectedRole === 'Manager' || selectedRole === 'Supervisor') {
      setSelectedModules(['pos', 'reservations', 'shifts', 'inventory', 'procurement', 'wastage', 'bir', 'event-weddings']);
    } else if (selectedRole === 'Head Chef') {
      setSelectedModules(['production', 'inventory', 'wastage', 'procurement']);
    } else if (selectedRole === 'HR Admin') {
      setSelectedModules(['attendance']);
    }
  };

  const handleRoleChange = (selectedRole: UserRole) => {
    setRole(selectedRole);
    applyPresetForRole(selectedRole);
  };

  const handleToggleModule = (modKey: string) => {
    if (selectedModules.includes(modKey)) {
      setSelectedModules(selectedModules.filter(k => k !== modKey));
    } else {
      setSelectedModules([...selectedModules, modKey]);
    }
  };

  const handleSelectAllModules = () => {
    setSelectedModules(AVAILABLE_MODULES.map(m => m.key));
  };

  const handleClearModules = () => {
    setSelectedModules([]);
  };

  const handleEditInit = (u: User) => {
    setEditingUserId(u.id);
    setFullName(u.fullName);
    setUsername(u.username);
    setRole(u.role);
    setBranch(u.branch);
    setDepartment(u.department || '');
    setPin(u.pin);
    setStatus(u.status);
    setSelectedModules(u.modules || []);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleCancelEdit = () => {
    setEditingUserId(null);
    setFullName('');
    setUsername('');
    setRole('Cashier');
    setBranch('Cubao');
    setDepartment('FnB Restaurant');
    setPin('');
    setStatus('Active');
    setSelectedModules([]);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!fullName.trim() || !username.trim() || !pin.trim()) {
      setErrorMsg('Full Name, Username, and Employee PIN are mandatory.');
      return;
    }

    if (!/^\d{4}$/.test(pin)) {
      setErrorMsg('PIN must be exactly 4 digits long.');
      return;
    }

    // Check duplicate username if physical create
    const isNew = !editingUserId;
    if (isNew) {
      const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase().trim());
      if (exists) {
        setErrorMsg(`Username "${username}" is already assigned to another catalogued account.`);
        return;
      }
    }

    const payload: User = {
      id: editingUserId || `u-${Date.now()}`,
      username: username.trim().toLowerCase(),
      fullName: fullName.trim(),
      pin: pin.trim(),
      role,
      branch,
      department: department.trim() || 'Operations',
      status,
      modules: selectedModules
    };

    const success = await onAddOrUpdateUser(payload);
    if (success) {
      setSuccessMsg(isNew ? `Successfully registered user account: ${payload.fullName}` : `Updated credentials for ${payload.fullName}`);
      handleCancelEdit();
    } else {
      setErrorMsg('Error communicating update with structural database backend.');
    }
  };

  const handleBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!branchName.trim()) {
      setErrorMsg('Branch Name is mandatory.');
      return;
    }

    const payload: Branch = {
      id: editingBranchId || `b-${Date.now()}`,
      name: branchName.trim(),
      address: branchAddress.trim(),
      contact: branchContact.trim(),
      manager: branchManager
    };

    if (onAddOrUpdateBranch) {
      const ok = await onAddOrUpdateBranch(payload);
      if (ok) {
        // Update employee branch assignments for selected users
        for (const u of users) {
          const isAssigned = assignedEmployeeIds.includes(u.id);
          const wasAssigned = u.branch === payload.name;
          if (isAssigned && u.branch !== payload.name) {
            await onAddOrUpdateUser({ ...u, branch: payload.name });
          } else if (!isAssigned && wasAssigned) {
            await onAddOrUpdateUser({ ...u, branch: 'All' });
          }
        }

        setSuccessMsg(editingBranchId ? `Successfully updated branch: ${payload.name}` : `Successfully created branch: ${payload.name}`);
        // Reset form
        setEditingBranchId(null);
        setBranchName('');
        setBranchAddress('');
        setBranchContact('');
        setBranchManager('');
        setAssignedEmployeeIds([]);
      } else {
        setErrorMsg('Failed to save branch to data store.');
      }
    } else {
      setErrorMsg('Branch management handler is not available.');
    }
  };

  const handleEditBranchInit = (b: Branch) => {
    setEditingBranchId(b.id);
    setBranchName(b.name);
    setBranchAddress(b.address);
    setBranchContact(b.contact);
    setBranchManager(b.manager);
    // Find all users who are currently assigned to this branch
    const assignedIds = users.filter(u => u.branch === b.name).map(u => u.id);
    setAssignedEmployeeIds(assignedIds);
    setErrorMsg('');
    setSuccessMsg('');
  };

  const handleDelete = async (u: User) => {
    if (u.username === 'admin') {
      alert('Security violation: Cannot delete master root admin.');
      return;
    }
    if (u.id === currentUser.id) {
      alert('Security alert: You cannot delete your currently active session user.');
      return;
    }

    if (!confirm(`Are you absolutely sure you want to completely deallocate and delete the account of ${u.fullName}?`)) {
      return;
    }

    const success = await onDeleteUser(u.id);
    if (success) {
      setSuccessMsg(`Deallocated user: ${u.fullName}`);
    } else {
      setErrorMsg('Could not delete user from system.');
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.username.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q) ||
      u.branch.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4 text-xs font-semibold text-gray-700">
      
      {/* Page Title Header */}
      <div className="bg-white border border-gray-300 p-4 rounded-lg shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-black uppercase text-gray-950 tracking-wider flex items-center gap-1.5">
            <Users className="text-blue-700" size={17} /> SYSTEM ACCESS & BUSINESS SETUP PORTAL
          </h2>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
            Manage functional staff roles, login security PINs, and apply global business profiles
          </p>
        </div>
      </div>

      {/* HORIZONTAL SYSTEM SUB-TABS */}
      <div className="flex border-b border-gray-300 bg-white/50 rounded-lg p-1.5 gap-2 border">
        <button
          onClick={() => {
            setActiveSubTab('users');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-black uppercase rounded transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'users'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-250'
          }`}
        >
          👤 Staff Accounts Directory
        </button>
        <button
          onClick={() => {
            setActiveSubTab('branches');
            setErrorMsg('');
            setSuccessMsg('');
            // Reset branch form
            setEditingBranchId(null);
            setBranchName('');
            setBranchAddress('');
            setBranchContact('');
            setBranchManager('');
            setAssignedEmployeeIds([]);
          }}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-black uppercase rounded transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'branches'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-250'
          }`}
        >
          🏢 Branch & Staff Assignments
        </button>
        <button
          onClick={() => {
            setActiveSubTab('business');
            setErrorMsg('');
            setSuccessMsg('');
          }}
          className={`flex-1 sm:flex-initial px-4 py-2 text-xs font-black uppercase rounded transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'business'
              ? 'bg-blue-600 text-white shadow'
              : 'bg-transparent text-gray-600 hover:bg-gray-250'
          }`}
        >
          ⚙️ Business & System Configurations
        </button>
      </div>

      {successMsg && (
        <div className="bg-green-50 border border-green-350 p-3 rounded-lg text-green-800 flex items-center gap-2 font-bold uppercase text-[10px]">
          <CheckCircle size={15} /> {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-300 p-3 rounded-lg text-red-700 flex items-center gap-2 font-bold uppercase text-[10px]">
          <AlertCircle size={15} /> {errorMsg}
        </div>
      )}

      {activeSubTab === 'business' ? (
        <div className="bg-white border border-gray-300 rounded-lg p-5 shadow-sm space-y-6">
          <div className="border-b pb-3 flex justify-between items-center bg-gray-50/50 p-2.5 rounded">
            <div>
              <h3 className="text-xs font-black uppercase text-gray-800 flex items-center gap-1">💼 Business Profile Setting configurations</h3>
              <p className="text-[10px] text-gray-500 font-bold uppercase">Provide true specifications used in VAT declarations, invoices, and procurement forms</p>
            </div>
            <span className="text-[9px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200 uppercase">System Active Root: Admin</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-gray-700">
            {/* Column 1 */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Company Registered Name *</label>
                <input
                  type="text"
                  required
                  value={bizName}
                  onChange={(e) => setBizName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 font-black text-gray-900 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  placeholder="e.g. JCC Ocean Bites Foodgroup Inc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Taxpayer Identification Number (TIN)</label>
                  <input
                    type="text"
                    required
                    value={bizTin}
                    onChange={(e) => setBizTin(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                    placeholder="e.g. 192-552-321-000"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Revenue District Office Code (RDO)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={bizRdo}
                    onChange={(e) => setBizRdo(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                    placeholder="e.g. 043"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Registered Business Address *</label>
                <input
                  type="text"
                  required
                  value={bizAddress}
                  onChange={(e) => setBizAddress(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  placeholder="e.g. GF JCC Plaza, Brgy Socorro, Cubao"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Default Line of Business Class</label>
                <input
                  type="text"
                  required
                  value={bizLine}
                  onChange={(e) => setBizLine(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  placeholder="e.g. Fast Casual Restaurant Operations"
                />
              </div>
            </div>

            {/* Column 2 */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Standard Tax type</label>
                  <select
                    value={bizTaxType}
                    onChange={(e) => setBizTaxType(e.target.value as 'VAT' | 'Non-VAT')}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-xs font-bold bg-white text-gray-800 focus:ring-1 focus:ring-blue-700 focus:outline-none animate-none"
                  >
                    <option value="VAT">VAT REGISTERED (12%)</option>
                    <option value="Non-VAT">NON-VAT COMPLIANT</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Default Input VAT Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={bizVatRate * 100}
                    onChange={(e) => setBizVatRate(Number(e.target.value) / 100)}
                    className="w-full rounded border border-gray-300 px-3 py-2 font-mono text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                    placeholder="12.0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Tax Filing Frequency</label>
                  <select
                    value={bizFreq}
                    onChange={(e) => setBizFreq(e.target.value as 'Monthly' | 'Quarterly')}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-xs font-bold bg-white text-gray-800 focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  >
                    <option value="Monthly">Monthly 2550M</option>
                    <option value="Quarterly">Quarterly 2550Q</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-1">Fiscal Year Alignment Start</label>
                  <input
                    type="date"
                    required
                    value={bizFiscal}
                    onChange={(e) => setBizFiscal(e.target.value)}
                    className="w-full rounded border border-gray-300 px-3 py-2 text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 border border-blue-150 rounded-lg space-y-2 mt-2 leading-relaxed text-[11px]">
                <h4 className="font-black text-blue-900 uppercase">💻 SYSTEM SYNC ACTION SPECIFICATIONS</h4>
                <p className="text-gray-500 text-[10px]">
                  Saving these attributes updates the global parameters live on both client-side elements of the point of sale (POS) receipt generation modules, and backend automated quarterly internal revenue forms, worksheets, and transaction journal footers.
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4 flex justify-end">
            <button
              type="button"
              onClick={async () => {
                setErrorMsg('');
                setSuccessMsg('');
                if (!bizName.trim() || !bizTin.trim() || !bizAddress.trim()) {
                  setErrorMsg('Registered Business Name, TIN, and Address are mandatory configurations.');
                  return;
                }
                try {
                  await onSaveTaxInfo({
                    businessName: bizName.trim(),
                    tin: bizTin.trim(),
                    rdoCode: bizRdo.trim(),
                    address: bizAddress.trim(),
                    lineOfBusiness: bizLine.trim(),
                    taxType: bizTaxType,
                    vatRate: bizVatRate,
                    fiscalYearStart: bizFiscal,
                    filingFrequency: bizFreq
                  });
                  setSuccessMsg('System Configurations for Business Details updated & applied live successfully across all modules!');
                } catch (e) {
                  setErrorMsg('An error occurred while saving terminal parameters.');
                }
              }}
              className="px-6 py-2.5 rounded bg-blue-700 hover:bg-blue-800 text-white font-black text-xs uppercase tracking-wider shadow transition"
            >
              💾 Secure and Apply System Configurations
            </button>
          </div>
        </div>
      ) : activeSubTab === 'branches' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Side Column: Form for Adding / Editing Branch */}
          <div className="lg:col-span-5 bg-white border border-gray-300 rounded-lg p-4 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-1.5 mb-3 flex items-center gap-1.5 tracking-wider font-display">
              {editingBranchId ? <Edit3 size={14} className="text-orange-500" /> : <MapPin size={14} className="text-blue-700" />}
              {editingBranchId ? `MODIFY BRANCH: ${branchName.toUpperCase()}` : 'ADD NEW BRANCH OUTLET'}
            </h3>

            <form onSubmit={handleBranchSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Branch Name *</label>
                <input
                  type="text"
                  required
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  placeholder="e.g. Laiya Resort"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Branch Location Address</label>
                <input
                  type="text"
                  value={branchAddress}
                  onChange={(e) => setBranchAddress(e.target.value)}
                  placeholder="e.g. San Juan, Batangas, Philippines"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Contact Details</label>
                  <input
                    type="text"
                    value={branchContact}
                    onChange={(e) => setBranchContact(e.target.value)}
                    placeholder="e.g. 0917-XXX-XXXX"
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Branch Manager</label>
                  <select
                    value={branchManager}
                    onChange={(e) => setBranchManager(e.target.value)}
                    className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs bg-white focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  >
                    <option value="">-- Assign Manager --</option>
                    {users.map(u => (
                      <option key={u.id} value={u.fullName}>{u.fullName}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Assign employees checklist */}
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1 tracking-wider">
                  👥 Assign Employees & Users to this Branch
                </label>
                <p className="text-[9px] text-gray-400 mb-2">Check the boxes of staff who are deployed to this location node:</p>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2.5 space-y-2 bg-gray-50/50">
                  {users.map(u => {
                    const isChecked = assignedEmployeeIds.includes(u.id);
                    return (
                      <label key={u.id} className="flex items-center gap-2 text-[10px] font-bold text-gray-700 cursor-pointer p-1 rounded hover:bg-white transition">
                        <input
                          type="checkbox"
                          className="rounded text-blue-700 focus:ring-blue-500"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setAssignedEmployeeIds([...assignedEmployeeIds, u.id]);
                            } else {
                              setAssignedEmployeeIds(assignedEmployeeIds.filter(id => id !== u.id));
                            }
                          }}
                        />
                        <div className="flex-1">
                          <p className="text-gray-900 font-extrabold text-[11px]">{u.fullName} <span className="font-mono text-gray-400">({u.username})</span></p>
                          <p className="text-[8px] text-gray-400 font-black uppercase tracking-wider">{u.role} | Current Branch: <b className="text-gray-650">{u.branch}</b></p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-dashed">
                <button
                  type="submit"
                  className="flex-1 py-1.5 rounded bg-blue-700 text-white font-black text-xs uppercase hover:bg-blue-800 shadow transition"
                >
                  {editingBranchId ? 'Save Branch Details' : 'Register Branch Outlet'}
                </button>
                {editingBranchId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingBranchId(null);
                      setBranchName('');
                      setBranchAddress('');
                      setBranchContact('');
                      setBranchManager('');
                      setAssignedEmployeeIds([]);
                    }}
                    className="py-1.5 px-3 rounded border border-gray-300 text-gray-650 font-black text-xs uppercase hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Right Side Column: Branch Directory List */}
          <div className="lg:col-span-7 bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
            <h3 className="text-xs font-black uppercase text-gray-950 border-b pb-1.5 mb-3 tracking-wider flex items-center justify-between font-display">
              <span>🏢 ACTIVE BRANCH OUTLETS IN CENTRAL LEDGER ({branches.length})</span>
              <span className="text-[8px] bg-blue-50 text-blue-800 border-blue-200 px-2 py-0.5 rounded uppercase font-sans">Master Ledger</span>
            </h3>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {branches.length === 0 ? (
                <p className="text-xs text-gray-400 italic text-center p-6">No branches are registered in the centralized database yet.</p>
              ) : (
                branches.map(b => {
                  const assignedStaff = users.filter(u => u.branch === b.name);
                  return (
                    <div key={b.id} className="border border-gray-200 p-3.5 rounded-lg space-y-3 hover:shadow-sm transition bg-white text-left">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-sm font-black text-blue-900 uppercase tracking-tight flex items-center gap-1">
                            🏢 {b.name}
                          </h4>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">{b.address || 'No Address Listed'}</p>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEditBranchInit(b)}
                            className="text-[10px] text-blue-850 bg-blue-50 hover:bg-blue-100 font-black uppercase px-2 py-1 rounded transition flex items-center gap-1 select-none"
                          >
                            <Edit3 size={11} /> Modify
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (b.name === 'Cubao') {
                                alert('Cubao is marked as the default operation node. Cannot delete.');
                                return;
                              }
                              if (confirm(`Are you sure you want to delete branch outlet: ${b.name}?`)) {
                                if (onDeleteBranch) {
                                  const ok = await onDeleteBranch(b.id);
                                  if (ok) {
                                    setSuccessMsg(`Branch deleted: ${b.name}`);
                                    // Reset users whose branch was this to 'All'
                                    for (const u of users) {
                                      if (u.branch === b.name) {
                                        await onAddOrUpdateUser({ ...u, branch: 'All' });
                                      }
                                    }
                                  } else {
                                    setErrorMsg(`Failed to delete branch outlet`);
                                  }
                                }
                              }
                            }}
                            className="text-[10px] text-red-700 bg-red-50 hover:bg-red-100 font-black uppercase px-2 py-1 rounded transition flex items-center gap-1 select-none animate-none"
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-[10px] font-bold bg-gray-50/60 p-2 rounded border">
                        <div>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black">Branch Contact Info</p>
                          <span className="text-gray-900 font-sans">{b.contact || 'No Contact Number'}</span>
                        </div>
                        <div>
                          <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black">Assigned Manager</p>
                          <span className="text-gray-900 font-extrabold text-blue-800 font-sans">{b.manager || 'No Manager Assigned'}</span>
                        </div>
                      </div>

                      <div>
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black mb-1">Assigned Employees / Operators ({assignedStaff.length})</p>
                        <div className="flex flex-wrap gap-1.5">
                          {assignedStaff.length === 0 ? (
                            <span className="text-[9px] bg-gray-50 border px-2 py-0.5 rounded text-gray-400 italic">No employees assigned at this location</span>
                          ) : (
                            assignedStaff.map(u => (
                              <span key={u.id} className="text-[9px] bg-blue-50 text-blue-800 font-extrabold px-1.5 py-0.5 rounded border border-blue-105 flex items-center gap-0.5 select-none font-sans">
                                👤 {u.fullName} <b className="text-[8px] text-blue-500 font-bold">({u.role})</b>
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left Side Column: Form for Adding / Editing */}
          <div className="lg:col-span-5 bg-white border border-gray-300 rounded-lg p-4 shadow-sm h-fit">
            <h3 className="text-xs font-black uppercase text-blue-900 border-b pb-1.5 mb-3 flex items-center gap-1.5 tracking-wider">
              {editingUserId ? <Edit3 size={14} className="text-orange-500" /> : <UserPlus size={14} className="text-blue-700" />}
              {editingUserId ? `MODIFYING USER: ${fullName.toUpperCase()}` : 'REGISTER NEW STAFF ACCOUNT'}
            </h3>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Full Employee Name *</label>
                <input 
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Maria Clara Santos"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Username / System Login *</label>
                <input 
                  type="text"
                  required
                  disabled={!!editingUserId}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. mariasatos1"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none disabled:bg-gray-100 disabled:text-gray-400"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Functional Group Role</label>
                <select 
                  value={role}
                  onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs bg-white focus:ring-1 focus:ring-blue-700 focus:outline-none"
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Supervisor">Supervisor</option>
                  <option value="Cashier">Cashier</option>
                  <option value="Head Chef">Head Chef</option>
                  <option value="HR Admin">HR Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Security Login PIN *</label>
                <div className="relative">
                  <Key className="absolute right-2 top-2 text-gray-400" size={14} />
                  <input 
                    type="text"
                    required
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                    placeholder="4-Digit PIN Code"
                    className="w-full rounded border border-gray-300 pl-2 pr-7 py-1.5 font-mono text-center font-bold text-gray-800 text-xs tracking-widest focus:ring-1 focus:ring-blue-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Assigned Branch Outlet</label>
                <select 
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs bg-white focus:ring-1 focus:ring-blue-700 focus:outline-none"
                >
                  <option value="All">All Branches</option>
                  {branches.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Cost Center Department</label>
                <input 
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. FnB Kitchen"
                  className="w-full rounded border border-gray-300 px-2 py-1.5 font-bold text-gray-800 text-xs focus:ring-1 focus:ring-blue-700 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-1">
              <div>
                <label className="block text-[10px] font-bold uppercase text-gray-500 mb-1">Employment Status</label>
                <div className="flex gap-4 p-1">
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="userStatus" 
                      checked={status === 'Active'} 
                      onChange={() => setStatus('Active')}
                      className="text-blue-700"
                    />
                    <span className="text-green-700 bg-green-50 px-2 py-0.5 rounded tracking-wide text-[10px] font-black uppercase flex items-center gap-1">
                      <Unlock size={11} /> Active Account
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer font-bold">
                    <input 
                      type="radio" 
                      name="userStatus" 
                      checked={status === 'Inactive'} 
                      onChange={() => setStatus('Inactive')}
                      className="text-blue-700"
                    />
                    <span className="text-red-700 bg-red-50 px-2 py-0.5 rounded tracking-wide text-[10px] font-black uppercase flex items-center gap-1">
                      <Lock size={11} /> Suspended / Inactive
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Custom Module Checkbox Matrix */}
            <div className="border border-gray-200 rounded-lg p-3 bg-gray-50 space-y-2">
              <div className="flex justify-between items-center pb-1.5 border-b border-gray-250">
                <span className="text-[10px] font-black uppercase text-blue-900 tracking-wider flex items-center gap-1">
                  <Compass size={13} /> SELECT PERMITTED MODULES ({selectedModules.length})
                </span>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={handleSelectAllModules} 
                    className="text-[8px] bg-white border px-1.5 py-0.5 rounded text-gray-600 hover:text-gray-900 uppercase font-bold"
                  >
                    Select All
                  </button>
                  <button 
                    type="button" 
                    onClick={handleClearModules} 
                    className="text-[8px] bg-white border px-1.5 py-0.5 rounded text-red-550 hover:text-red-700 uppercase font-bold"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                {AVAILABLE_MODULES.map((mod) => {
                  const isChecked = selectedModules.includes(mod.key);
                  return (
                    <div 
                      key={mod.key}
                      onClick={() => handleToggleModule(mod.key)}
                      className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition ${
                        isChecked 
                          ? 'bg-blue-50/70 border-blue-200 text-blue-950 font-bold shadow-xs' 
                          : 'bg-white border-gray-200 hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="mt-0.5 text-blue-800">
                        {isChecked ? <CheckSquare size={13} className="fill-blue-50" /> : <Square size={13} />}
                      </span>
                      <div className="space-y-0.5">
                        <p className="text-[11px] font-black uppercase leading-none">{mod.label}</p>
                        <p className="text-[9px] text-gray-400 font-semibold uppercase leading-tight tracking-wider">{mod.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-blue-700 hover:bg-blue-800 text-white p-2.5 rounded font-black uppercase text-xs tracking-wider transition flex items-center justify-center gap-1.5"
              >
                Save Employee Account
              </button>
              
              {editingUserId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2.5 rounded font-black uppercase text-xs tracking-wider transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>


        {/* Right Side Column: User Directory Ledger Grid */}
        <div className="lg:col-span-7 bg-white border border-gray-300 rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-1.5">
              <h3 className="text-xs font-black uppercase text-gray-800 tracking-wider flex items-center gap-1">
                <Shield size={14} className="text-emerald-700" /> ACTIVE REGISTERED USERS SYSTEM REGISTRY ({filteredUsers.length})
              </h3>

              {/* Quick Search */}
              <div className="relative w-full sm:w-56">
                <Search className="absolute left-2.5 top-2 text-gray-400" size={13} />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter users..."
                  className="w-full pl-7 pr-2 py-1.5 border border-gray-300 rounded font-bold text-gray-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-700"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredUsers.map((u) => {
                const isSystemUser = u.username === 'admin';
                return (
                  <div 
                    key={u.id}
                    className="relative bg-white border border-gray-200 rounded-lg p-3.5 shadow-xs hover:shadow-sm hover:border-gray-350 transition flex flex-col justify-between"
                  >
                    {/* Top border decor depending on status */}
                    <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-lg ${u.status === 'Active' ? 'bg-emerald-600' : 'bg-red-500'}`} />

                    <div className="space-y-2.5 pt-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-xs font-black text-gray-950 uppercase tracking-tight leading-none">{u.fullName}</p>
                          <p className="text-[10px] text-blue-700 font-extrabold uppercase mt-1 tracking-wider">@{u.username}</p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded tracking-wider ${
                            u.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                          }`}>
                            {u.status}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-1 px-2 py-1.5 rounded bg-gray-50 text-[10px] font-bold text-gray-500 uppercase">
                        <div>
                          <p className="text-[8px] text-gray-400 font-extrabold pb-0.5 uppercase tracking-widest">Role Security</p>
                          <span className="text-gray-900 font-extrabold">{u.role}</span>
                        </div>
                        <div>
                          <p className="text-[8px] text-gray-400 font-extrabold pb-0.5 uppercase tracking-widest">Branch Access</p>
                          <span className="text-gray-900 flex items-center gap-0.5">
                            <MapPin size={9} className="text-gray-400" /> {u.branch}
                          </span>
                        </div>
                      </div>

                      <div className="text-[10px] font-bold text-gray-600 uppercase">
                        <p className="text-[8px] text-gray-400 uppercase tracking-widest font-black mb-1">MODULE ACCESS PERMISSIONS ({u.modules?.length || 0})</p>
                        <div className="flex flex-wrap gap-1">
                          {(!u.modules || u.modules.length === 0) ? (
                            <span className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 italic lowercase">Inherited default {u.role} presets</span>
                          ) : (
                            u.modules.map(m => (
                              <span key={m} className="text-[8px] bg-blue-50 text-blue-800 font-black px-1 rounded border border-blue-105">
                                {m}
                              </span>
                            ))
                          )}
                        </div>
                      </div>

                      <div className="text-[9px] font-mono text-gray-400 uppercase border-t pt-2 flex justify-between items-center">
                        <span>Dept: <b className="text-gray-600 font-sans">{u.department || 'Operations'}</b></span>
                        <span className="flex items-center gap-0.5">PIN: <b className="text-gray-700 font-sans tracking-wide bg-gray-100 px-1 py-0.5 rounded">{u.pin}</b></span>
                      </div>
                    </div>

                    <div className="flex justify-end gap-1.5 mt-3.5 pt-2 border-t border-dashed border-gray-100">
                      <button 
                        type="button"
                        onClick={() => handleEditInit(u)}
                        className="text-[10px] text-blue-850 bg-blue-50 hover:bg-blue-100 font-black uppercase px-2.5 py-1 rounded transition flex items-center gap-1 select-none"
                      >
                        <Edit3 size={11} /> Modify
                      </button>
                      <button 
                        disabled={isSystemUser || u.id === currentUser.id}
                        type="button"
                        onClick={() => handleDelete(u)}
                        className="text-[10px] text-red-700 bg-red-50 hover:bg-red-100 font-black uppercase px-2.5 py-1 rounded transition flex items-center gap-1 disabled:opacity-30 disabled:hover:bg-red-50 select-none"
                      >
                        <Trash2 size={11} /> Deallocate
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
      )}

    </div>
  );
};
