/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { parseBanglaFloat } from '../utils/numberHelper';
import { 
  PiggyBank, 
  ArrowLeft, 
  User, 
  Layers, 
  Coins, 
  AlertTriangle, 
  ShieldCheck 
} from 'lucide-react';

interface AddCbsAccountFormProps {
  onBack: () => void;
  branchGroups: any[];
  groupMembers: any[];
  cbsAccounts: any[];
  defaultGroupId?: string;
  onSuccess: (newAccount: any, updatedMembers: any[]) => void;
  org: any;
  workingDay?: string;
}

export const AddCbsAccountForm: React.FC<AddCbsAccountFormProps> = ({
  onBack,
  branchGroups,
  groupMembers,
  cbsAccounts,
  defaultGroupId = '',
  onSuccess,
  org,
  workingDay
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState(defaultGroupId);
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [frequency, setFrequency] = useState<'weekly' | 'monthly'>('weekly');
  const [cbsInstallment, setCbsInstallment] = useState('10');
  const [monthlyDeposit, setMonthlyDeposit] = useState('40');
  const [initialDeposit, setInitialDeposit] = useState('10');
  const [nomineeName, setNomineeName] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Read admission fee and profit rate from active organization configurations
  const admissionFeeStr = org ? localStorage.getItem(`tanzil_sav_admission_fee_${org.id}`) || '৫০' : '৫০';
  const cbsProfitRateStr = org ? localStorage.getItem(`tanzil_sav_profit_cbs_${org.id}`) || '৮.৫' : '৮.৫';

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

  // Sync default installment & initial deposit based on frequency
  useEffect(() => {
    if (frequency === 'weekly') {
      setCbsInstallment('10');
      setInitialDeposit('10');
      setMonthlyDeposit('40');
    } else {
      setCbsInstallment('50');
      setInitialDeposit('50');
      setMonthlyDeposit('50');
    }
  }, [frequency]);

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

    // CBS Limit Validation: strictly maximum 1 active CBS account per member
    const hasExistingCBS = cbsAccounts.some(
      (acc) => acc.memberId === selectedMemberId && acc.status === 'active'
    );
    if (hasExistingCBS) {
      setErrorMsg('এই সদস্যের ইতিমধ্যে একটি ক্যাপিটাল বিল্ড-আপ সঞ্চয় (CBS) হিসাব খোলা রয়েছে! সদস্য প্রতি শুধুমাত্র ১টি CBS হিসাব সচল থাকতে পারে।');
      return;
    }

    // Generate CBS Account Details
    const accountNo = `CBS-${Date.now().toString().slice(-6)}`;
    const newAccount = {
      id: `acc-cbs-${Date.now()}`,
      accountNo,
      memberId: selectedMemberId,
      memberName: selectedMember.name,
      memberCode: selectedMember.memberId,
      groupId: selectedGroupId,
      groupName: branchGroups.find((g) => g.id === selectedGroupId)?.name || '',
      frequency: frequency,
      cbsInstallment: parseBanglaFloat(cbsInstallment) || (frequency === 'weekly' ? 10 : 50),
      monthlyDeposit: parseBanglaFloat(monthlyDeposit) || 0,
      initialDeposit: depositAmount,
      balance: depositAmount,
      nomineeName: nomineeName.trim() || selectedMember.nomineeName || 'অনির্ধারিত',
      admissionFee: parseBanglaFloat(admissionFeeStr) || 0,
      interestRate: parseBanglaFloat(cbsProfitRateStr) || 0,
      date: workingDay || new Date().toISOString().split('T')[0],
      status: 'active'
    };

    // Update member's running dynamic balance properties in state
    const updatedMembers = groupMembers.map((m) => {
      if (m.id === selectedMemberId) {
        const currentCBS = m.cbsBalance || 0;
        return {
          ...m,
          cbsBalance: currentCBS + depositAmount,
          cbsInstallment: Number(cbsInstallment) || (frequency === 'weekly' ? 10 : 50)
        };
      }
      return m;
    });

    onSuccess(newAccount, updatedMembers);
  };

  return (
    <div className="bg-[#f4f6f9] text-slate-800 animate-in fade-in duration-300 rounded-3xl overflow-hidden border border-slate-300 max-w-lg mx-auto shadow-2xl">
      {/* HEADER SECTION */}
      <div className="bg-[#2f6ce5] text-white px-5 py-4 flex items-center justify-between font-sans">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <h2 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5 justify-center">
            <PiggyBank className="w-4 h-4" />
            সিবিএস হিসাব খুলুন (Open CBS Account)
          </h2>
          <p className="text-[10px] text-sky-100/90 font-medium mt-0.5">ক্যাপিটাল বিল্ড-আপ সঞ্চয় (Capital Build-up Savings)</p>
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
        <div className="p-3 bg-indigo-50 border border-indigo-150 rounded-xl flex items-start gap-2.5">
          <ShieldCheck className="w-4.5 h-4.5 text-[#2f6ce5] shrink-0 mt-0.5" />
          <div>
            <h4 className="font-extrabold text-[#2f6ce5] text-[11px] mb-0.5">অর্গানাইজেশন পলিসি সেটিংস (Active Config Rules):</h4>
            <ul className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[10px] text-slate-600 font-bold">
              <li>• ভর্তি ফি: <span className="text-indigo-800 font-mono">৳{admissionFeeStr}</span></li>
              <li>• সঞ্চয়ের বার্ষিক লাভ হার: <span className="text-indigo-800 font-mono">{cbsProfitRateStr}%</span></li>
            </ul>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <h3 className="text-[#2f6ce5] font-extrabold flex items-center gap-1.5 border-b border-indigo-50 pb-2 mb-2 text-xs">
            <User className="w-4 h-4" />
            গ্রাহক ও সমিতি নির্বাচন করুন
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
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              disabled={!selectedGroupId}
              required
            >
              <option value="">-- সদস্য নির্বাচন করুন --</option>
              {activeMembersInGroup.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.memberId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CBS Details Section */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3.5">
          <h3 className="text-blue-700 font-extrabold flex items-center gap-1.5 border-b border-slate-100 pb-2 mb-2 text-xs">
            <Coins className="w-4 h-4 text-blue-500" />
            হিসাবের স্কিম বিবরণী (CBS Settings)
          </h3>

          <div className="grid grid-cols-2 gap-3.5">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-500 font-black mb-1">জমার ফ্রিকোয়েন্সি (Frequency) *</label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'weekly' | 'monthly')}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="weekly">সাপ্তাহিক (Weekly)</option>
                <option value="monthly">মাসিক (Monthly)</option>
              </select>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-500 font-black mb-1">জমার কিস্তি পরিমাণ (৳) *</label>
              <input
                type="number"
                value={cbsInstallment}
                onChange={(e) => {
                  setCbsInstallment(e.target.value);
                  setInitialDeposit(e.target.value);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-850 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-500 font-black mb-1">প্রারম্ভিক জমার পরিমাণ (৳) *</label>
              <input
                type="number"
                value={initialDeposit}
                onChange={(e) => setInitialDeposit(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-500 font-black mb-1">মনোনীত ব্যক্তির নাম (Nominee Name)</label>
              <input
                type="text"
                placeholder="যেমন: মরিয়ম খাতুন (স্ত্রী)"
                value={nomineeName}
                onChange={(e) => setNomineeName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-[#2f6ce5] hover:bg-blue-800 text-white font-black py-2.5 rounded-xl cursor-pointer shadow-lg active:scale-98 transition text-xs sm:text-sm"
        >
          সদস্যের ক্যাপিটাল বিল্ড-আপ (CBS) অ্যাকাউন্ট সক্রিয় করুন
        </button>
      </form>
    </div>
  );
};
