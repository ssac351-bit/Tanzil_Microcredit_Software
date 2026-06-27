/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { parseBanglaFloat } from '../utils/numberHelper';
import { 
  Coins, 
  ArrowLeft, 
  User, 
  Layers, 
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

interface AddLtsAccountFormProps {
  onBack: () => void;
  branchGroups: any[];
  groupMembers: any[];
  defaultGroupId?: string;
  onSuccess: (newAccount: any, updatedMembers: any[]) => void;
  org: any;
  workingDay?: string;
}

export const AddLtsAccountForm: React.FC<AddLtsAccountFormProps> = ({
  onBack,
  branchGroups,
  groupMembers,
  defaultGroupId = '',
  onSuccess,
  org,
  workingDay
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [ltsTerm, setLtsTerm] = useState('৬০'); // Term in months, default 5 years
  const [ltsInstallment, setLtsInstallment] = useState('১০০০'); // Monthly installment
  const [initialDeposit, setInitialDeposit] = useState('১০০০');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read admission fee and profit rate from active organization configurations
  const admissionFeeStr = org ? localStorage.getItem(`tanzil_sav_admission_fee_${org.id}`) || '৫০' : '৫০';
  const ltsProfitRateStr = org ? localStorage.getItem(`tanzil_sav_profit_lts_${org.id}`) || '৯.০' : '৯.০';

  // Filter active members in group
  const activeMembersInGroup = groupMembers.filter(
    (m) => m.groupId === selectedGroupId && (m.status === 'active' || !m.status)
  );

  const selectedMember = activeMembersInGroup.find((m) => m.id === selectedMemberId);

  // Sync selected group from default prop
  useEffect(() => {
    if (defaultGroupId) {
      setSelectedGroupId(defaultGroupId);
    }
  }, [defaultGroupId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!selectedGroupId) {
      setErrorMsg('দয়া করে প্রথমে একটি সমিতি / গ্রুপ নির্বাচন করুন!');
      return;
    }
    if (!selectedMemberId || !selectedMember) {
      setErrorMsg('দয়া করে হিসাব খোলার জন্য একজন সচল সদস্য নির্বাচন করুন!');
      return;
    }

    const depositAmount = Number(initialDeposit) || 0;
    if (depositAmount < 0) {
      setErrorMsg('প্রারম্ভিক জমার পরিমাণ শূন্য বা তার বেশি হতে হবে!');
      return;
    }

    // Generate LTS Account Details
    const accountNo = `LTS-${Date.now().toString().slice(-6)}`;
    const newAccount = {
      id: `acc-lts-${Date.now()}`,
      accountNo,
      memberId: selectedMemberId,
      memberName: selectedMember.name,
      memberCode: selectedMember.memberId,
      groupId: selectedGroupId,
      groupName: branchGroups.find((g) => g.id === selectedGroupId)?.name || '',
      monthlyInstallment: parseBanglaFloat(ltsInstallment) || 0,
      initialDeposit: depositAmount,
      balance: depositAmount,
      termMonths: parseBanglaFloat(ltsTerm),
      admissionFee: parseBanglaFloat(admissionFeeStr) || 0,
      interestRate: parseBanglaFloat(ltsProfitRateStr) || 0,
      date: workingDay || new Date().toISOString().split('T')[0],
      status: 'active'
    };

    // Update member's running balance properties in state
    const updatedMembers = groupMembers.map((m) => {
      if (m.id === selectedMemberId) {
        const currentLTS = m.ltsBalance || 0;
        return {
          ...m,
          ltsBalance: currentLTS + depositAmount
        };
      }
      return m;
    });

    onSuccess(newAccount, updatedMembers);
  };

  return (
    <div className="bg-[#f4f6f9] text-slate-800 animate-in fade-in duration-305 rounded-3xl overflow-hidden border border-slate-300 max-w-lg mx-auto shadow-2xl">
      {/* HEADER SECTION */}
      <div className="bg-[#15803d] text-white px-5 py-4 flex items-center justify-between font-sans">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <h2 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5 justify-center">
            <Coins className="w-4 h-4 text-amber-300" />
            এলটিএস হিসাব খুলুন (Add LTS Account)
          </h2>
          <p className="text-[10px] text-sky-100/90 font-medium mt-0.5">দীর্ঘমেয়াদী সঞ্চয় স্কিম (LTS) হিসাব খুলুন</p>
        </div>
        <div className="w-7"></div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 font-sans leading-relaxed text-xs">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold flex items-start gap-2 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* SYSTEM CONFIGURATION INSIGHTS MATCHING THE CENTRAL SETTINGS */}
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-emerald-700 text-[11px] mb-0.5">অর্গানাইজেশন পলিসি সেটিংস (Active Config Rules):</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-600 font-bold">
              <li>• ভর্তি ফি: <span className="text-emerald-850 font-mono">৳{admissionFeeStr}</span></li>
              <li>• এলটিএস বার্ষিক লাভ হার: <span className="text-emerald-850 font-mono">{ltsProfitRateStr}%</span></li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <h3 className="text-emerald-700 font-extrabold flex items-center gap-1.5 border-b border-emerald-50 pb-2 mb-2 text-xs">
            <User className="w-4 h-4" />
            সদস্য ও সমিতি নির্বাচন করুন
          </h3>

          {/* Group Selector */}
          <div>
            <label className="block text-slate-500 font-black mb-1">সমিতি / গ্রুপ নির্বাচন করুন *</label>
            <select
              value={selectedGroupId}
              onChange={(e) => {
                setSelectedGroupId(e.target.value);
                setSelectedMemberId('');
              }}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            >
              <option value="">-- সমিতি নির্বাচন করুন --</option>
              {branchGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.code})
                </option>
              ))}
            </select>
          </div>

          {/* Member Selector */}
          <div>
            <label className="block text-slate-500 font-black mb-1">সদস্য নির্বাচন করুন *</label>
            <select
              value={selectedMemberId}
              onChange={(e) => setSelectedMemberId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              disabled={!selectedGroupId}
              required
            >
              <option value="">-- सदस्य নির্বাচন করুন --</option>
              {activeMembersInGroup.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Configurations */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <h3 className="text-emerald-700 font-extrabold flex items-center gap-1.5 border-b border-zinc-100 pb-2 mb-2 text-xs">
            <Coins className="w-4 h-4" />
            স্কিম ও কিস্তির বিবরণ
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-slate-500 font-black mb-1">এলটিএস মেয়াদ (LTS Period) *</label>
              <select
                value={ltsTerm}
                onChange={(e) => setLtsTerm(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="৩৬">৩৬ মাস (3 Years)</option>
                <option value="৬০">৬০ মাস (5 Years)</option>
                <option value="১২০">১২о মাস (10 Years)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-500 font-black mb-1">মাসিক কিস্তির পরিমাণ (৳) *</label>
              <select
                value={ltsInstallment}
                onChange={(e) => {
                  setLtsInstallment(e.target.value);
                  setInitialDeposit(e.target.value);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="১০০">১০০</option>
                <option value="২০০">২০০</option>
                <option value="৩০০">৩০০</option>
                <option value="৫০০">৫০০</option>
                <option value="১০০০">১০০০</option>
                <option value="২০০০">২০০০</option>
                <option value="৫০০০">৫০০০</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-500 font-black mb-1">প্রারম্ভিক জমার পরিমাণ (৳) *</label>
            <input
              type="number"
              value={initialDeposit}
              onChange={(e) => setInitialDeposit(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-850 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#15803d] hover:bg-[#166534] text-white font-black py-2.5 rounded-xl cursor-pointer shadow-lg active:scale-98 transition text-xs sm:text-sm"
        >
          সদস্যের নতুন এলটিএস (LTS) হিসাব অ্যাক্টিভ করুন
        </button>
      </form>
    </div>
  );
};
