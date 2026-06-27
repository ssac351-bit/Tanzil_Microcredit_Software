/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Search, 
  User, 
  Phone, 
  CreditCard, 
  Layers, 
  MapPin, 
  Smile, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface MemberInformationViewProps {
  onBack: () => void;
  groupMembers: any[];
  branchGroups: any[];
  selectedGroupId: string;
  onUpdateStatus: (memberId: string, newStatus: 'active' | 'inactive', reason?: string) => void;
  savingsAccounts?: any[];
  cbsAccounts?: any[];
  ltsAccounts?: any[];
  transactions?: any[];
}

export const MemberInformationView: React.FC<MemberInformationViewProps> = ({
  onBack,
  groupMembers,
  branchGroups,
  selectedGroupId,
  onUpdateStatus,
  savingsAccounts = [],
  cbsAccounts = [],
  ltsAccounts = [],
  transactions = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  
  // Statement modal/layer state
  const [selectedStatement, setSelectedStatement] = useState<{
    member: any;
    accountType: 'PL' | 'GS' | 'CBS' | 'LTS';
    accountName: string;
    accountNo?: string;
    balance: number;
  } | null>(null);

  // Status editing sub-state
  const [editingStatusId, setEditingStatusId] = useState<string | null>(null);
  const [tempStatus, setTempStatus] = useState<'active' | 'inactive'>('active');
  const [tempReason, setTempReason] = useState('ভর্তি বাতিল');
  const [statusError, setStatusError] = useState<string | null>(null);

  // Filter members based on selected Group, Search query, and Status
  const filtered = groupMembers.filter((m) => {
    // Group filter: if selectedGroupId is set, match. Otherwise show all of this branch
    if (selectedGroupId && m.groupId !== selectedGroupId) return false;
    
    // Status filter
    if (statusFilter !== 'all' && m.status !== statusFilter) return false;

    // Search text constraint
    const query = searchTerm.toLowerCase();
    if (!query) return true;

    return (
      m.name.toLowerCase().includes(query) ||
      m.memberId.toLowerCase().includes(query) ||
      m.phone.includes(query) ||
      (m.nid && m.nid.includes(query))
    );
  });

  const getGroupName = (gId: string) => {
    const group = branchGroups.find((g) => g.id === gId);
    return group ? `${group.name} (${group.code})` : 'সাধারন গ্রাহক';
  };

  const getAccountStatement = (memberObj: any, type: 'PL' | 'GS' | 'CBS' | 'LTS') => {
    const mTxList = (transactions || []).filter(
      (t) => t.memberId === memberObj.memberId || t.memberId === memberObj.id
    );

    const sortedTx = [...mTxList].sort((a, b) => (a.date || a.addDate || '').localeCompare(b.date || b.addDate || ''));

    let runningBal = 0;
    const items: any[] = [];

    if (type === 'PL') {
      sortedTx.forEach((t) => {
        let isTxRelated = false;
        let title = '';
        let debit = 0;
        let credit = 0;

        if (t.type === 'disbursement') {
          isTxRelated = true;
          title = 'ঋণ বিতরণ (Loan Disbursed)';
          debit = t.proposalDetail?.totalPayable || (t.amount * 1.15) || 0;
          runningBal += debit;
        } else if (t.type === 'collection' && t.collections?.pl > 0) {
          isTxRelated = true;
          title = 'ঋণ কিস্তি আদায় (Installment Paid)';
          credit = t.collections.pl;
          runningBal -= credit;
        }

        if (isTxRelated) {
          items.push({
            date: t.date || t.addDate,
            title,
            debit,
            credit,
            balance: runningBal,
          });
        }
      });
    } else if (type === 'GS') {
      const finalBal = memberObj.savingsBalance || memberObj.gsBalance || 0;
      let netChange = 0;
      
      sortedTx.forEach((t) => {
        if (t.type === 'collection') {
          if (t.collections?.gs > 0) netChange += t.collections.gs;
          if (t.withdrawals?.gs > 0) netChange -= t.withdrawals.gs;
        }
      });

      let currentTempBal = finalBal - netChange;
      items.push({
        date: memberObj.admissionDate || memberObj.addDate || 'প্রারম্ভিক',
        title: 'প্রারম্ভিক স্থিতি (Opening Balance)',
        debit: currentTempBal,
        credit: 0,
        balance: currentTempBal,
      });

      sortedTx.forEach((t) => {
        if (t.type === 'collection') {
          const deposit = t.collections?.gs || 0;
          const withdraw = t.withdrawals?.gs || 0;

          if (deposit > 0 || withdraw > 0) {
            currentTempBal = currentTempBal + deposit - withdraw;
            items.push({
              date: t.date || t.addDate,
              title: deposit > 0 ? 'সঞ্চয় জমা (Deposit)' : 'সঞ্চয় উত্তোলন (Withdrawal)',
              debit: deposit,
              credit: withdraw,
              balance: currentTempBal,
            });
          }
        }
      });
    } else if (type === 'CBS') {
      const finalBal = memberObj.cbsBalance || 0;
      let netChange = 0;

      sortedTx.forEach((t) => {
        if (t.type === 'collection') {
          if (t.collections?.cbs > 0) netChange += t.collections.cbs;
          if (t.withdrawals?.cbs > 0) netChange -= t.withdrawals.cbs;
        }
      });

      let currentTempBal = finalBal - netChange;
      items.push({
        date: memberObj.admissionDate || memberObj.addDate || 'প্রারম্ভিক',
        title: 'প্রারম্ভিক স্থিতি (Opening Balance)',
        debit: currentTempBal,
        credit: 0,
        balance: currentTempBal,
      });

      sortedTx.forEach((t) => {
        if (t.type === 'collection') {
          const deposit = t.collections?.cbs || 0;
          const withdraw = t.withdrawals?.cbs || 0;

          if (deposit > 0 || withdraw > 0) {
            currentTempBal = currentTempBal + deposit - withdraw;
            items.push({
              date: t.date || t.addDate,
              title: deposit > 0 ? 'CBS জমা (Deposit)' : 'CBS উত্তোলন (Withdrawal)',
              debit: deposit,
              credit: withdraw,
              balance: currentTempBal,
            });
          }
        }
      });
    } else if (type === 'LTS') {
      const finalBal = memberObj.ltsBalance || 0;
      let netChange = 0;

      sortedTx.forEach((t) => {
        if (t.type === 'collection' && t.collections?.lts > 0) {
          netChange += t.collections.lts;
        }
      });

      let currentTempBal = finalBal - netChange;
      items.push({
        date: memberObj.admissionDate || memberObj.addDate || 'প্রারম্ভিক',
        title: 'প্রারম্ভিক স্থিতি (Opening Balance)',
        debit: currentTempBal,
        credit: 0,
        balance: currentTempBal,
      });

      sortedTx.forEach((t) => {
        if (t.type === 'collection') {
          const deposit = t.collections?.lts || 0;

          if (deposit > 0) {
            currentTempBal = currentTempBal + deposit;
            items.push({
              date: t.date || t.addDate,
              title: 'LTS সঞ্চয় জমা (Deposit)',
              debit: deposit,
              credit: 0,
              balance: currentTempBal,
            });
          }
        }
      });
    }

    return items.reverse();
  };

  const handleToggleDetails = (id: string) => {
    setExpandedMemberId(expandedMemberId === id ? null : id);
  };

  const startEditStatus = (member: any) => {
    setEditingStatusId(member.id);
    setTempStatus(member.status || 'active');
    setTempReason(member.inactiveReason || 'ভর্তি বাতিল');
    setStatusError(null);
  };

  const saveStatusChange = (id: string) => {
    const targetMember = groupMembers.find(m => m.id === id);
    if (tempStatus === 'inactive' && targetMember) {
      const plOut = targetMember.plOutstanding || 0;
      const cbsBal = targetMember.cbsBalance || 0;
      const ltsBal = targetMember.ltsBalance || 0;
      const gsBal = targetMember.gsBalance || targetMember.savingsBalance || 0;

      if (plOut > 0 || cbsBal > 0 || ltsBal > 0 || gsBal > 0) {
        setStatusError("সদস্যের সক্রিয় অ্যাকাউন্ট (PL, CBS, LTS, GS) ও ব্যালেন্স থাকায় নিষ্ক্রিয় করা যাবে না!");
        return;
      }
    }

    onUpdateStatus(id, tempStatus, tempStatus === 'inactive' ? tempReason : '');
    setEditingStatusId(null);
    setStatusError(null);
  };

  return (
    <div className="bg-[#f4f6f9] text-slate-800 animate-in fade-in duration-300 rounded-3xl relative overflow-hidden border border-slate-300 max-w-md mx-auto shadow-2xl">
      {/* HEADER */}
      <div className="bg-[#2f6ce5] text-white px-5 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="p-1 -ml-1 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div className="text-center">
          <h2 className="font-black text-sm sm:text-base tracking-wide flex items-center gap-1.5 justify-center">
            <User className="w-4 h-4 text-emerald-400" />
            সদস্য তথ্য ও KYC বিবরণী
          </h2>
          <p className="text-[10px] text-sky-100/95 font-bold mt-0.5">মোট সদস্য সংখ্যা: {filtered.length} জন</p>
        </div>
        <div className="w-7"></div>
      </div>

      {/* FILTER SEARCH BARS */}
      <div className="bg-white border-b border-slate-200 p-4 space-y-3 font-sans">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="নাম, মোবাইল বা মেম্বার আইডি খুঁজুন..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-slate-850 outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex gap-1.5 justify-between">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition-colors ${
              statusFilter === 'all' 
                ? 'bg-[#2f6ce5] text-white' 
                : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            সবাই ({groupMembers.filter(m => !selectedGroupId || m.groupId === selectedGroupId).length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('active')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition-colors flex items-center justify-center gap-1 ${
              statusFilter === 'active' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100'
            }`}
          >
            সচল ({groupMembers.filter(m => (!selectedGroupId || m.groupId === selectedGroupId) && m.status === 'active').length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('inactive')}
            className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-black transition-colors flex items-center justify-center gap-1 ${
              statusFilter === 'inactive' 
                ? 'bg-rose-600 text-white' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100'
            }`}
          >
            নিষ্ক্রিয় ({groupMembers.filter(m => (!selectedGroupId || m.groupId === selectedGroupId) && m.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* MEMBER CARDS LIST AREA */}
      <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
            <Smile className="w-10 h-10 text-amber-400 mx-auto animate-bounce" />
            <p className="text-slate-500 font-extrabold text-xs sm:text-sm">কোনো সদস্য তথ্য পাওয়া যায়নি</p>
            <p className="text-[10px] text-slate-400">এই সমিতি বা ফিল্টারে ভর্তি হওয়া কোনো গ্রাহক নেই। নতুন সদস্য ভর্তি করতে &apos;Member Admission&apos; ফর্মটি ব্যবহার করুন।</p>
          </div>
        ) : (
          filtered.map((member) => {
            const isExpanded = expandedMemberId === member.id;
            const isCurrentEditingStatus = editingStatusId === member.id;

            return (
              <div 
                key={member.id} 
                className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded ? 'border-indigo-400 shadow-md ring-1 ring-indigo-200' : 'border-slate-200 shadow-sm hover:border-slate-350'
                }`}
              >
                {/* SIMPLE DETAILS PANEL (Always visible) */}
                <div 
                  className="p-4 flex items-center justify-between cursor-pointer select-none"
                  onClick={() => handleToggleDetails(member.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 border border-slate-200">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-slate-800 text-xs sm:text-sm">{member.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>{member.memberId || 'MEM-N/A'}</span>
                        <span>•</span>
                        <span>{member.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {member.status === 'inactive' ? (
                      <span className="bg-rose-50 border border-rose-100 text-rose-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                        নিষ্ক্রিয়
                      </span>
                    ) : (
                      <span className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                        সচল
                      </span>
                    )}
                    {isExpanded ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  </div>
                </div>

                {/* EXPANDED KYC PROFILE DETAILS */}
                {isExpanded && (
                  <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-4 text-[11px] animate-in slide-in-from-top-2 duration-150">
                    
                    {/* Samity Reference */}
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200/80 flex justify-between items-center font-bold">
                      <span className="text-slate-400">সমিতি নাম:</span>
                      <span className="text-indigo-600 text-xs md:text-[11px] font-black">{getGroupName(member.groupId)}</span>
                    </div>

                    {/* Detailed Info Grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-slate-650">
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">পিতা / স্বামীর নাম:</div>
                        <div className="text-slate-800 font-black">{member.fatherHusbandName || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">মাতার নাম:</div>
                        <div className="text-slate-800 font-black">{member.motherName || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">জাতীয় পরিচয় নম্বর:</div>
                        <div className="text-slate-800 font-mono font-black">{member.nid || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">জন্ম তারিখ:</div>
                        <div className="text-slate-800 font-mono font-black">{member.dob || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">ধর্ম / লিঙ্গ:</div>
                        <div className="text-slate-800 font-black">{member.religion || 'ইসলাম'} / {member.gender || 'মহিলা'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">শিক্ষাগত যোগ্যতা:</div>
                        <div className="text-slate-800 font-black">{member.education || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">পেশা / অভিভাবকের পেশা:</div>
                        <div className="text-slate-800 font-black">{member.profession || 'গৃহিণী'} / {member.guardianProfession || 'কৃষি'}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold mb-0.5">ভর্তির তারিখ:</div>
                        <div className="text-slate-800 font-mono font-black">{member.admissionDate || member.addDate || 'N/A'}</div>
                      </div>
                    </div>

                    {/* Addresses */}
                    <div className="border-t border-slate-200/60 pt-2.5 space-y-1.5 col-span-2">
                      <div className="flex items-start gap-1">
                        <MapPin size={12} className="text-[#2f6ce5] shrink-0 mt-0.5" />
                        <div>
                          <span className="text-slate-400 font-bold">বর্তমান ঠিকানা: </span>
                          <span className="text-slate-800 font-extrabold">{member.address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Nominee details info */}
                    <div className="border-t border-slate-200/60 pt-2.5 space-y-1 bg-white p-2.5 rounded-xl border border-slate-150">
                      <div className="text-[10px] text-teal-600 font-black uppercase tracking-wide flex items-center gap-1">
                        <Smile className="w-3.5 h-3.5" />
                        নমিনী বিবরণী (Nominee Information)
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-1.5 text-slate-600">
                        <div>
                          <span className="text-slate-400">নমিনির নাম:</span>
                          <div className="font-black text-slate-800">{member.nomineeName || 'N/A'}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">সম্পর্ক:</span>
                          <div className="font-black text-slate-800">{member.nomineeRelation || 'N/A'}</div>
                        </div>
                        {member.nomineeNid && (
                          <div className="col-span-2">
                            <span className="text-slate-400">নমিনির NID/জন্ম নিবন্ধন নং:</span>
                            <div className="font-mono font-black text-slate-800">{member.nomineeNid}</div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Savings Deposit */}
                    {(() => {
                      const mSavings = savingsAccounts.filter((acc: any) => acc.memberId === member.id && acc.status === 'active');
                      const mCbs = cbsAccounts.filter((acc: any) => acc.memberId === member.id && acc.status === 'active');
                      const mLts = ltsAccounts.filter((acc: any) => acc.memberId === member.id && acc.status === 'active');
                      const hasAnyAccounts = mSavings.length > 0 || mCbs.length > 0 || mLts.length > 0;

                      if (hasAnyAccounts) return null;

                      return (
                        <div className="bg-indigo-50 border border-indigo-100 p-2.5 rounded-xl flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-indigo-700 font-bold">
                            <TrendingUp size={13} />
                            <span>প্রারম্ভিক সঞ্চয় ব্যালেন্স:</span>
                          </div>
                          <span className="text-indigo-800 font-extrabold">৳{(member.savingsBalance || 0).toLocaleString('bn-BD')}</span>
                        </div>
                      );
                    })()}

                    {/* Active Accounts List */}
                    {(() => {
                      const mSavings = savingsAccounts.filter((acc: any) => acc.memberId === member.id && acc.status === 'active');
                      const mCbs = cbsAccounts.filter((acc: any) => acc.memberId === member.id && acc.status === 'active');
                      const mLts = ltsAccounts.filter((acc: any) => acc.memberId === member.id && acc.status === 'active');
                      const hasPl = (member.plOutstanding ?? 0) > 0;
                      const hasAnyAccounts = hasPl || mSavings.length > 0 || mCbs.length > 0 || mLts.length > 0;

                      if (!hasAnyAccounts) return null;

                      return (
                        <div className="bg-white p-3 rounded-xl border border-slate-200/80 space-y-2 font-sans text-xs">
                          <div className="flex justify-between items-center border-b border-slate-100 pb-1">
                            <div className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wide">
                              সদস্যের সক্রিয় হিসাবসমূহ (Active Accounts - PL, GS, CBS, LTS)
                            </div>
                            <span className="text-[8px] font-bold text-[#2f6ce5] bg-blue-50 px-1.5 py-0.5 rounded animate-pulse">
                              স্টেটমেন্ট দেখতে ক্লিক করুন
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {hasPl && (
                              <div
                                onClick={() => setSelectedStatement({
                                  member,
                                  accountType: 'PL',
                                  accountName: 'প্রাথমিক ঋণ হিসাব (PL)',
                                  balance: member.plOutstanding
                                })}
                                className="flex justify-between items-center text-[10px] bg-rose-50/50 hover:bg-rose-100/50 px-2 py-1.5 rounded border border-rose-100 cursor-pointer transition-colors active:scale-[0.99]"
                                title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                              >
                                <div>
                                  <span className="font-extrabold text-rose-800">প্রাথমিক ঋণ হিসাব (PL)</span>
                                  <div className="text-[9px] text-rose-500 block font-bold">নির্ধারিত কিস্তি: ৳{(member.plInstallment ?? 600).toLocaleString('bn-BD')}</div>
                                </div>
                                <span className="font-black text-rose-900">৳{member.plOutstanding.toLocaleString('bn-BD')}</span>
                              </div>
                            )}
                            {mSavings.map((acc: any) => (
                              <div
                                key={acc.id}
                                onClick={() => setSelectedStatement({
                                  member,
                                  accountType: 'GS',
                                  accountName: acc.type === 'GS' ? 'সাধারণ সঞ্চয় (GS)' : 'স্থায়ী আমানত (FDR)',
                                  accountNo: acc.accountNo,
                                  balance: acc.balance
                                })}
                                className="flex justify-between items-center text-[10px] bg-slate-50 hover:bg-slate-100 px-2 py-1.5 rounded border border-slate-100 cursor-pointer transition-colors active:scale-[0.99]"
                                title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                              >
                                <div>
                                  <span className="font-extrabold text-slate-700">
                                    {acc.type === 'GS' ? 'সাধারণ সঞ্চয় (GS)' : 'স্থায়ী আমানত (FDR)'}
                                  </span>
                                  <div className="text-[9px] text-slate-400 font-mono">{acc.accountNo} {acc.type === 'FDR' && `(${acc.termMonths} মাস, ${acc.interestRate}%)`}</div>
                                </div>
                                <span className="font-black text-slate-800">৳{acc.balance.toLocaleString('bn-BD')}</span>
                              </div>
                            ))}
                            {mCbs.map((acc: any) => (
                              <div
                                key={acc.id}
                                onClick={() => setSelectedStatement({
                                  member,
                                  accountType: 'CBS',
                                  accountName: 'ক্যাপিটাল বিল্ড-আপ সঞ্চয় (CBS)',
                                  accountNo: acc.accountNo,
                                  balance: acc.balance
                                })}
                                className="flex justify-between items-center text-[10px] bg-blue-50/50 hover:bg-blue-100/40 px-2 py-1.5 rounded border border-blue-105 cursor-pointer transition-colors active:scale-[0.99]"
                                title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                              >
                                <div>
                                  <span className="font-extrabold text-blue-800">ক্যাপিটাল বিল্ড-আপ সঞ্চয় (CBS)</span>
                                  <div className="text-[9px] text-blue-550 block font-bold">মনোনীত: {acc.nomineeName || 'অনির্ধারিত'} | {acc.frequency === 'weekly' ? 'সাপ্তাহিক কিস্তি' : 'মাসিক কিস্তি'}: ৳{(acc.cbsInstallment || (acc.frequency === 'weekly' ? 10 : 50)).toLocaleString('bn-BD')} | {acc.accountNo}</div>
                                </div>
                                <span className="font-black text-blue-900">৳{acc.balance.toLocaleString('bn-BD')}</span>
                              </div>
                            ))}
                            {mLts.map((acc: any) => (
                              <div
                                key={acc.id}
                                onClick={() => setSelectedStatement({
                                  member,
                                  accountType: 'LTS',
                                  accountName: 'দীর্ঘমেয়াদী সঞ্চয় (LTS)',
                                  accountNo: acc.accountNo,
                                  balance: acc.balance
                                })}
                                className="flex justify-between items-center text-[10px] bg-emerald-50/50 hover:bg-emerald-100/40 px-2 py-1.5 rounded border border-emerald-105 cursor-pointer transition-colors active:scale-[0.99]"
                                title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                              >
                                <div>
                                  <span className="font-extrabold text-emerald-800">দীর্ঘমেয়াদী সঞ্চয় (LTS)</span>
                                  <div className="text-[9px] text-emerald-600 block font-bold">মেয়াদ: {acc.termMonths} মাস | কিস্তি: ৳{acc.monthlyInstallment.toLocaleString('bn-BD')} | {acc.accountNo}</div>
                                </div>
                                <span className="font-black text-emerald-950">৳{acc.balance.toLocaleString('bn-BD')}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    {/* STATUS EDITING PANEL (ASA NGO CONTROL) */}
                    <div className="border-t border-slate-200/60 pt-2.5">
                      {!isCurrentEditingStatus ? (
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-1 text-[10px] text-slate-400">
                            <AlertCircle size={12} />
                            <span>সদস্য স্ট্যাটাস পরিবর্তন</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => startEditStatus(member)}
                            className="text-[10px] font-black bg-slate-800 text-amber-500 hover:bg-slate-900 border border-slate-200 rounded-md py-1 px-2.5 transition active:scale-95"
                          >
                            স্ট্যাটাস পরিবর্তন (Change Status)
                          </button>
                        </div>
                      ) : (
                        <div className="bg-slate-200/70 p-3 rounded-xl border border-slate-250 space-y-3">
                          <div className="text-[10px] font-black text-slate-700 flex justify-between">
                            <span>স্ট্যাটাস পরিবর্তন করুন:</span>
                            <span className="font-mono">{member.memberId}</span>
                          </div>
                          
                          <div className="flex gap-4">
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                              <input
                                type="radio"
                                name={`status-${member.id}`}
                                checked={tempStatus === 'active'}
                                onChange={() => setTempStatus('active')}
                                className="w-3.5 h-3.5 text-emerald-600 focus:ring-emerald-500"
                              />
                              <span className="text-emerald-700 font-extrabold bg-emerald-50 px-2 py-0.5 rounded">সচল (Active)</span>
                            </label>
                            
                            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold">
                              <input
                                type="radio"
                                name={`status-${member.id}`}
                                checked={tempStatus === 'inactive'}
                                onChange={() => setTempStatus('inactive')}
                                className="w-3.5 h-3.5 text-rose-600 focus:ring-rose-500"
                              />
                              <span className="text-rose-700 font-extrabold bg-rose-50 px-2 py-0.5 rounded">নিষ্ক্রিয় (Inactive)</span>
                            </label>
                          </div>

                          {tempStatus === 'inactive' && (
                            <div className="space-y-1 animate-in slide-in-from-top-1">
                              <span className="text-[10px] text-slate-500 font-bold block">নিষ্ক্রিয়করনের কারণ:</span>
                              <select
                                value={tempReason}
                                onChange={(e) => setTempReason(e.target.value)}
                                className="w-full text-[10px] font-bold py-1 px-2 border border-slate-350 rounded-md bg-white text-rose-800"
                              >
                                <option value="ভর্তি বাতিল">ভর্তি বাতিল (Admission Cancelled)</option>
                                <option value="ঋণ পরিশোধ পরবর্তী নিষ্ক্রিয়">ঋণ পরিশোধ পরবর্তী নিষ্ক্রিয় (Inactive after Loan Paid)</option>
                                <option value="স্বেচ্ছায় পদত্যাগ">স্বেচ্ছায় পদত্যাগ (Voluntary Resignation)</option>
                                <option value="স্থানান্তরিত">স্থানান্তরিত (Transferred)</option>
                                <option value="অন্যান্য সাময়িক অসচলতা">অন্যান্য সাময়িক অসচলতা</option>
                              </select>
                            </div>
                          )}

                          {statusError && (
                            <div className="bg-rose-50 text-rose-700 p-2 border border-rose-100 rounded-lg text-[10px] font-extrabold leading-tight">
                              {statusError}
                            </div>
                          )}

                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingStatusId(null)}
                              className="flex-1 py-1 bg-slate-300 rounded text-slate-700 font-bold text-[10px]"
                            >
                              বাতিল
                            </button>
                            <button
                              type="button"
                              onClick={() => saveStatusChange(member.id)}
                              className="flex-1 py-1 bg-indigo-600 text-white rounded font-bold text-[10px]"
                            >
                              হালনাগাদ (Update)
                            </button>
                          </div>
                        </div>
                      )}

                      {member.status === 'inactive' && member.inactiveReason && (
                        <div className="bg-rose-50/50 text-rose-800 p-2 border border-rose-100 rounded-lg mt-2 text-[10px] font-extrabold flex items-center gap-1 shrink-0">
                          <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          <span>নিষ্ক্রিয় কারণ: {member.inactiveReason}</span>
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {selectedStatement && (
        <div className="absolute inset-0 bg-[#f4f6f9] z-50 flex flex-col animate-in slide-in-from-right duration-200">
          {/* Statement Header */}
          <div className="bg-[#1e40af] text-white px-5 py-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedStatement(null)}
              className="p-1 -ml-1 rounded-full hover:bg-white/10 active:scale-90 transition-all cursor-pointer flex items-center justify-center"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <div className="text-center">
              <h2 className="font-black text-xs sm:text-sm tracking-wide flex items-center gap-1.5 justify-center">
                হিসাব বিবরণী (Statement)
              </h2>
              <p className="text-[10px] text-blue-100 font-bold mt-0.5">{selectedStatement.accountName}</p>
            </div>
            <div className="w-7"></div>
          </div>

          {/* Member & Account Identity Summary Bar */}
          <div className="bg-white border-b border-slate-200 p-4 space-y-1.5 font-sans">
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>গ্রাহকের নাম:</span>
              <span className="text-slate-900 font-extrabold">{selectedStatement.member.name}</span>
            </div>
            <div className="flex justify-between text-[11px] font-bold text-slate-700">
              <span>সদস্য আইডি:</span>
              <span className="text-slate-900 font-mono font-extrabold">{selectedStatement.member.memberId}</span>
            </div>
            {selectedStatement.accountNo && (
              <div className="flex justify-between text-[11px] font-bold text-slate-700">
                <span>হিসাব নাম্বার:</span>
                <span className="text-slate-900 font-mono font-extrabold">{selectedStatement.accountNo}</span>
              </div>
            )}
            <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-100 flex justify-between items-center mt-2 shrink-0">
              <span className="text-[11px] font-bold text-blue-800">মোট বর্তমান স্থিতি:</span>
              <span className="text-xs sm:text-sm font-black text-blue-900 font-mono">৳{selectedStatement.balance.toLocaleString('bn-BD')}</span>
            </div>
          </div>

          {/* Statement Table / List */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 font-sans">
            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest block pb-1 border-b border-slate-200 shrink-0">
              লেনদেন ডায়েরি (Transaction Logs)
            </div>
            
            {(() => {
              const txs = getAccountStatement(selectedStatement.member, selectedStatement.accountType);
              
              if (txs.length === 0) {
                return (
                  <div className="text-center py-8 text-xs text-slate-400 font-semibold italic">
                    কোনো লেনদেন রেকর্ড পাওয়া যায়নি।
                  </div>
                );
              }
              
              return (
                <div className="space-y-2">
                  {txs.map((tx, idx) => (
                    <div key={idx} className="bg-white rounded-xl border border-slate-150 p-2.5 shadow-2xs hover:border-slate-300 transition-colors">
                      <div className="flex justify-between items-center text-[9px] font-bold text-slate-400 mb-1">
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded-sm">{tx.date}</span>
                        <span className={tx.title.includes('উত্তোলন') || tx.title.includes('বিতরণ') ? 'text-rose-600' : 'text-emerald-700'}>
                          {tx.title}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-[10px] pt-0.5">
                        <div className="text-slate-500 font-semibold">
                          {tx.debit > 0 && (
                            <p>জমা/প্রদান: <strong className="font-mono text-emerald-700">৳{tx.debit.toLocaleString('bn-BD')}</strong></p>
                          )}
                          {tx.credit > 0 && (
                            <p>উত্তোলন/আদায়: <strong className="font-mono text-rose-600">৳{tx.credit.toLocaleString('bn-BD')}</strong></p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 text-[8px] block font-bold leading-tight">স্থিতি (Balance)</span>
                          <span className="font-mono font-black text-slate-800">৳{tx.balance.toLocaleString('bn-BD')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
          
          {/* Close button in footer */}
          <div className="p-3 bg-white border-t border-slate-200">
            <button
              type="button"
              onClick={() => setSelectedStatement(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-900 active:scale-95 text-white font-extrabold text-[11px] rounded-xl transition duration-150 cursor-pointer text-center uppercase tracking-wide"
            >
              বন্ধ করুন (Close)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
