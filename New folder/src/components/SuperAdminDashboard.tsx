/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Building, 
  Plus, 
  MapPin, 
  Calendar, 
  User, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Search, 
  Trash2, 
  X,
  LogOut,
  LayoutDashboard
} from 'lucide-react';
import { Organization } from '../types';

interface SuperAdminDashboardProps {
  organizations: Organization[];
  setOrganizations: React.Dispatch<React.SetStateAction<Organization[]>>;
  onLogout: () => void;
}

export default function SuperAdminDashboard({ 
  organizations, 
  setOrganizations, 
  onLogout 
}: SuperAdminDashboardProps) {

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New org form states
  const [newOrgName, setNewOrgName] = useState('');
  const [newOrgAddress, setNewOrgAddress] = useState('');
  const [newOrgDate, setNewOrgDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [newOrgAdminId, setNewOrgAdminId] = useState('');
  const [newOrgPassword, setNewOrgPassword] = useState('');

  // UI interaction states
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showPasswordMap, setShowPasswordMap] = useState<Record<string, boolean>>({});

  // Handle password generation helper
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$';
    let generated = '';
    for (let i = 0; i < 10; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewOrgPassword(generated);
  };

  // Handle Admin ID suggestion helper
  const suggestAdminId = () => {
    if (newOrgName) {
      const cleanName = newOrgName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const randomNum = Math.floor(100 + Math.random() * 900);
      setNewOrgAdminId(`admin_${cleanName || 'user'}_${randomNum}`);
    } else {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setNewOrgAdminId(`admin_${randomNum}`);
    }
  };

  const handleAddOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newOrgName || !newOrgAddress || !newOrgDate || !newOrgAdminId || !newOrgPassword) {
      alert('অনুগ্রহ করে সবগুলো তথ্য পূরণ করুন।');
      return;
    }

    // Check if adminId already exists
    const duplicate = organizations.some(o => o.adminId.toLowerCase() === newOrgAdminId.toLowerCase());
    if (duplicate) {
      alert('এই এডমিন আইডিটি ইতিমধ্যে অন্য প্রতিষ্ঠান ব্যবহার করছে। অনুগ্রহ করে অন্য আইডি ব্যবহার করুন।');
      return;
    }

    const newOrg: Organization = {
      id: Date.now().toString(),
      name: newOrgName,
      address: newOrgAddress,
      addDate: newOrgDate,
      adminId: newOrgAdminId,
      adminPassword: newOrgPassword
    };

    setOrganizations([newOrg, ...organizations]);
    
    // Reset form & close modal
    setNewOrgName('');
    setNewOrgAddress('');
    setNewOrgDate(new Date().toISOString().split('T')[0]);
    setNewOrgAdminId('');
    setNewOrgPassword('');
    setIsAddModalOpen(false);
  };

  const handleDeleteOrganization = (id: string, name: string) => {
    if (confirm(`আপনি কি নিশ্চিত যে "${name}" প্রতিষ্ঠানটি মুছে ফেলতে চান?`)) {
      setOrganizations(organizations.filter(org => org.id !== id));
      
      // Dynamic robust cleanup: select and remove all localStorage keys referencing this organization ID
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('tanzil_') && key.includes(`_${id}`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    }
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePasswordVisibility = (orgId: string) => {
    setShowPasswordMap(prev => ({
      ...prev,
      [orgId]: !prev[orgId]
    }));
  };

  // Filter organizations based on query
  const filteredOrgs = organizations.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    org.adminId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Topbar / টপবার */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-sm px-3 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center gap-2">
          {/* Left: App title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-blue-600 rounded-lg text-white shrink-0">
              <Building size={20} className="sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-xl font-bold text-slate-900 tracking-tight leading-none truncate">
                তানজিল মাইক্রোক্রেডিট সফটওয়্যার (Tanzil Microcredit Software)
              </h1>
              <span className="text-[10px] sm:text-xs text-slate-500 font-normal block truncate mt-0.5">
                সুপার এডমিন কন্ট্রোল প্যানেল
              </span>
            </div>
          </div>

           {/* Right: Actions / মেনু বার */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* প্রতিষ্ঠান এড আইকন */}
            <button 
              id="btn-add-org"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs sm:text-sm transition-all shadow-sm hover:shadow active:scale-95"
              title="প্রতিষ্ঠান এড করুন"
            >
              <Plus size={16} className="sm:w-[18px] sm:h-[18px]" />
              <span className="hidden sm:inline">প্রতিষ্ঠান এড</span>
            </button>

            {/* Logout */}
            <button 
              id="btn-logout"
              onClick={onLogout} 
              className="flex items-center justify-center gap-1.5 text-slate-600 hover:text-rose-600 font-medium text-xs sm:text-sm px-2.5 sm:px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors"
              title="লগআউট"
            >
              <LogOut size={16} /> 
              <span className="hidden sm:inline">লগআউট</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Space */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
              <LayoutDashboard size={24} className="text-blue-600" />
              নিবন্ধিত প্রতিষ্ঠান ডিরেক্টরি
            </h2>
            <p className="text-sm text-slate-500">সমস্ত নিবন্ধিত প্রতিষ্ঠান ও তাদের এক্সেস প্রসেস ক্রেডেনশিয়াল পরিচালনা করুন।</p>
          </div>

          {/* Live Search bar */}
          {organizations.length > 0 && (
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="প্রতিষ্ঠান খুজুন..."
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Empty state or organizations list */}
        {organizations.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-xl mx-auto my-12 shadow-xs">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Building size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">কোনো প্রতিষ্ঠান এখনো যুক্ত করা হয়নি</h3>
            <p className="text-slate-500 text-sm mb-6">
              তানজিল মাইক্রোক্রেডিট সফটওয়্যারে কাজ শুরু করতে সর্বপ্রথম আপনার প্রতিষ্ঠান যোগ করুন। প্রতিষ্ঠান যুক্ত করতে উপরের ডান কোণে "প্রতিষ্ঠান এড" বাটনে ক্লিক করুন।
            </p>
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span>প্রথম প্রতিষ্ঠান যুক্ত করুন</span>
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrgs.map((org) => {
              const isPasswordShown = showPasswordMap[org.id] || false;
              return (
                <div key={org.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
                  
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-800 hover:text-blue-600 transition-colors line-clamp-1">
                        {org.name}
                      </h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5 flex items-center gap-1">
                        <Calendar size={12} />
                        যুক্ত করার তারিখ: {org.addDate}
                      </p>
                    </div>
                    
                    <button 
                      onClick={() => handleDeleteOrganization(org.id, org.name)}
                      className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                      title="মুছে ফেলুন"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="space-y-2.5 text-sm text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="text-slate-400 mt-0.5 shrink-0" size={16} />
                      <span className="line-clamp-2 text-xs leading-relaxed">{org.address}</span>
                    </div>

                    <div className="mt-4 pt-3 bg-slate-50 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <User size={12} />
                          ID:
                        </span>
                        <div className="flex items-center gap-1.5 font-bold text-slate-800">
                          <span>{org.adminId}</span>
                          <button 
                            onClick={() => handleCopyText(org.adminId, `${org.id}-id`)}
                            className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors"
                            title="কপি করুন"
                          >
                            {copiedId === `${org.id}-id` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Key size={12} />
                          পাসওয়ার্ড:
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-800">
                            {isPasswordShown ? org.adminPassword : '••••••••'}
                          </span>
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={() => togglePasswordVisibility(org.id)}
                              className="text-slate-400 hover:text-slate-600 p-0.5 transition-colors"
                              title={isPasswordShown ? "লুকিয়ে রাখুন" : "দেখুন"}
                            >
                              {isPasswordShown ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button 
                              onClick={() => handleCopyText(org.adminPassword, `${org.id}-pass`)}
                              className="text-slate-400 hover:text-blue-600 p-0.5 transition-colors"
                              title="কপি করুন"
                            >
                              {copiedId === `${org.id}-pass` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal Window to Add Organization (প্রতিষ্ঠান এড) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 transition-opacity animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-slate-100 transform scale-100 transition-transform">
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-md">
                  <Building size={18} />
                </div>
                <h3 className="text-base font-bold text-slate-800">নতুন প্রতিষ্ঠান যুক্ত করুন</h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleAddOrganization} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  প্রতিষ্ঠানের নাম
                </label>
                <input 
                  type="text" 
                  placeholder="উদাঃ জনসেবা সমবায় সমিতি" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  ঠিকানা
                </label>
                <textarea 
                  placeholder="প্রতিষ্ঠানের সম্পূর্ণ ঠিকানা এখানে লিখুন..." 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  value={newOrgAddress}
                  onChange={(e) => setNewOrgAddress(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                    যোগ করার তারিখ
                  </label>
                  <input 
                    type="date" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newOrgDate}
                    onChange={(e) => setNewOrgDate(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                    <span>এডমিন আইডি</span>
                    <button 
                      type="button" 
                      onClick={suggestAdminId}
                      className="text-[10px] text-blue-600 hover:underline font-normal"
                      title="নাম থেকে আইডি জেনارهট করুন"
                    >
                      তৈরি করুন
                    </button>
                  </label>
                  <input 
                    type="text" 
                    placeholder="উদাঃ admin123" 
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newOrgAdminId}
                    onChange={(e) => setNewOrgAdminId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-between">
                  <span>পাসওয়ার্ড</span>
                  <button 
                    type="button" 
                    onClick={generatePassword} 
                    className="text-[10px] text-blue-600 hover:underline font-normal"
                  >
                    অটো জেনারেট
                  </button>
                </label>
                <input 
                  type="text" 
                  placeholder="পাসওয়ার্ড লিখুন বা অটো জেনারেট করুন" 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  value={newOrgPassword}
                  onChange={(e) => setNewOrgPassword(e.target.value)}
                  required
                />
              </div>

              {/* Submit buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button 
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 text-sm font-medium text-slate-600 bg-slate-50 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  বাতিল
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors shadow-sm"
                >
                  তথ্য সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
