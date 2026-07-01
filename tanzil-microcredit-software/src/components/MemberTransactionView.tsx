/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  Check, 
  Info, 
  Save, 
  X,
  User,
  Users,
  Briefcase
} from 'lucide-react';
import { MemberPassbook } from './MemberPassbook';

interface Member {
  id: string;
  memberId: string;
  orgId: string;
  branchId: string;
  groupId: string;
  name: string;
  phone: string;
  status: 'active' | 'inactive';
  inactiveReason?: string;
  
  // Ledger accounts & Installment configurations
  plOutstanding?: number;
  plInstallment?: number;
  cbsBalance?: number;
  cbsInstallment?: number;
  ltsBalance?: number;
  ltsInstallment?: number;
  gsBalance?: number;
  gsInstallment?: number;
  [key: string]: any;
}

interface MemberTransactionViewProps {
  onBack: () => void;
  groupId: string;
  branchGroups: any[];
  groupMembers: Member[];
  savingsAccounts?: any[];
  cbsAccounts?: any[];
  ltsAccounts?: any[];
  onSaveTransactions: (updatedMembers: Member[], txDetails: any) => void;
  staff: any;
  transactions?: any[];
  workingDay?: string;
}

const parseDateString = (dateStr: string) => {
  if (!dateStr) return new Date();
  const parts = dateStr.split('-');
  const y = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10) - 1;
  const d = parseInt(parts[2], 10);
  return new Date(y, m, d);
};

const getISOWeek = (dateStr: string) => {
  if (!dateStr) return '';
  const d = parseDateString(dateStr);
  const tempDate = new Date(d.valueOf());
  tempDate.setDate(tempDate.getDate() + 4 - (tempDate.getDay() || 7));
  const yearStart = new Date(tempDate.getFullYear(), 0, 1);
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return `${tempDate.getFullYear()}-W${weekNo}`;
};

const getMonthAndYear = (dateStr: string) => {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length < 2) return '';
  return `${parts[0]}-${parseInt(parts[1], 10)}`;
};

export const MemberTransactionView: React.FC<MemberTransactionViewProps> = ({
  onBack,
  groupId,
  branchGroups,
  groupMembers,
  savingsAccounts = [],
  cbsAccounts = [],
  ltsAccounts = [],
  onSaveTransactions,
  staff,
  transactions = [],
  workingDay = ''
}) => {
  // 1. Filter members of this specific group
  const membersInGroup = groupMembers.filter((m) => m.groupId === groupId && m.status === 'active');
  const selectedGroup = branchGroups.find((g) => g.id === groupId);

  const [selectedMemberIndex, setSelectedMemberIndex] = useState(0);
  const currentMember: Member | undefined = membersInGroup[selectedMemberIndex];

  // Initialize inputs
  const [plCollection, setPlCollection] = useState('600');
  const [gsCollection, setGsCollection] = useState('40');
  const [cbsCollection, setCbsCollection] = useState('10');
  const [ltsCollection, setLtsCollection] = useState('0');

  const [gsWithdrawal, setGsWithdrawal] = useState('0');
  const [cbsWithdrawal, setCbsWithdrawal] = useState('0');

  const [isPlExempted, setIsPlExempted] = useState(false);
  const [plExemptionAmount, setPlExemptionAmount] = useState('970');
  const [exemptionReason, setExemptionReason] = useState<'member_death' | 'guardian_death' | 'special_waiver' | 'other'>('member_death');

  const [isAccountDetailsVisible, setIsAccountDetailsVisible] = useState(false);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  const [selectedStatement, setSelectedStatement] = useState<{
    member: any;
    accountType: 'PL' | 'GS' | 'CBS' | 'LTS';
    accountName: string;
    accountNo?: string;
    balance: number;
  } | null>(null);

  const txDate = workingDay || new Date().toISOString().split('T')[0];

  // Find if there is an existing transaction on the same day for this member of type 'collection'
  const existingTx = transactions.find((t) => 
    t.type === 'collection' && 
    t.memberId === currentMember?.memberId && 
    t.date === txDate
  );

  const activeCbsAccount = currentMember ? cbsAccounts.find(
    (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
  ) : null;
  const isCbsWeekly = activeCbsAccount?.frequency === 'weekly';
  const isCbsMonthly = activeCbsAccount?.frequency === 'monthly';

  // Check if CBS is already deposited in same week/month (excluding today's existing transaction so editing today is allowed)
  const cbsAlreadyDeposited = (transactions || []).some(t => {
    if (t.memberId !== currentMember?.memberId || Number(t.collections?.cbs || 0) <= 0) return false;
    if (t.date === txDate) return false;
    
    if (isCbsWeekly) {
      return getISOWeek(t.date) === getISOWeek(txDate);
    }
    if (isCbsMonthly) {
      return getMonthAndYear(t.date) === getMonthAndYear(txDate);
    }
    return false;
  });

  // Sync inputs when switching members
  useEffect(() => {
    setSuccessBanner(null);
    if (currentMember) {
      if (existingTx) {
        // Pre-populate with existing same-day saved transaction values
        setPlCollection(String(existingTx.collections?.pl ?? 0));
        setGsCollection(String(existingTx.collections?.gs ?? 0));
        setCbsCollection(String(existingTx.collections?.cbs ?? 0));
        setLtsCollection(String(existingTx.collections?.lts ?? 0));
        setGsWithdrawal(String(existingTx.withdrawals?.gs ?? 0));
        setCbsWithdrawal(String(existingTx.withdrawals?.cbs ?? 0));
        setIsPlExempted(existingTx.exemption > 0);
        setPlExemptionAmount(String(existingTx.exemption || (currentMember.plOutstanding ?? 0)));
        setExemptionReason(existingTx.exemptionReason || 'member_death');
      } else {
        // Initialize missing ledger fields conditionally without mock defaults
        const uActiveGs = currentMember ? savingsAccounts.find(
          (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.type === 'GS' && acc.status === 'active'
        ) : null;
        const uActiveCbs = currentMember ? cbsAccounts.find(
          (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
        ) : null;
        const uActiveLts = currentMember ? ltsAccounts.find(
          (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
        ) : null;

        const hasPlBal = (currentMember.plOutstanding ?? 0) > 0;
        const hasCbsBal = uActiveCbs ? Number(uActiveCbs.balance ?? 0) > 0 : (currentMember.cbsBalance ?? 0) > 0;
        const hasLtsBal = uActiveLts ? Number(uActiveLts.balance ?? 0) > 0 : (currentMember.ltsBalance ?? 0) > 0;
        const hasGsBal = uActiveGs ? Number(uActiveGs.balance ?? 0) >= 0 : (currentMember.gsBalance ?? currentMember.savingsBalance ?? 0) > 0;

        const defaultPL_Inst = hasPlBal ? (currentMember.plInstallment ?? 600) : 0;
        const defaultGS_Inst = hasGsBal ? (currentMember.gsInstallment ?? 40) : 0;

        const isCbsWeekly_local = uActiveCbs?.frequency === 'weekly';
        const isCbsMonthly_local = uActiveCbs?.frequency === 'monthly';
        const cbsAlreadyDeposited_local = (transactions || []).some(t => {
          if (t.memberId !== currentMember?.memberId || Number(t.collections?.cbs || 0) <= 0) return false;
          if (t.date === txDate) return false;
          if (isCbsWeekly_local) {
            return getISOWeek(t.date) === getISOWeek(txDate);
          }
          if (isCbsMonthly_local) {
            return getMonthAndYear(t.date) === getMonthAndYear(txDate);
          }
          return false;
        });

        const defaultCBS_Inst = (hasCbsBal && !cbsAlreadyDeposited_local) 
          ? (uActiveCbs?.cbsInstallment ?? currentMember.cbsInstallment ?? (uActiveCbs?.frequency === 'weekly' ? 10 : uActiveCbs?.frequency === 'monthly' ? 50 : 10)) 
          : 0;

        const defaultLTS_Inst = hasLtsBal ? (uActiveLts?.monthlyInstallment ?? currentMember.ltsInstallment ?? 100) : 0;
        
        setPlCollection(String(defaultPL_Inst));
        setGsCollection(String(defaultGS_Inst));
        setCbsCollection(String(defaultCBS_Inst));
        setLtsCollection('0'); // Default Collection for LTS is usually 0 unless paid

        setGsWithdrawal('0');
        setCbsWithdrawal('0');
        setIsPlExempted(false);
        setPlExemptionAmount(String(currentMember.plOutstanding ?? 0));
        setExemptionReason('member_death');
      }
    }
  }, [selectedMemberIndex, currentMember, existingTx, savingsAccounts, cbsAccounts, ltsAccounts, transactions, txDate]);

  if (!groupId) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-300 max-w-md mx-auto text-center space-y-4 shadow-xl">
        <Info className="w-12 h-12 text-red-500 mx-auto" />
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">সমিতি নির্বাচন করা হয়নি</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          দয়া করে প্রথমে একটি সমিতি / গ্রুপ সিলেক্ট করুন এবং এরপর &quot;Member Transaction&quot; মডিউলে প্রবেশ করুন।
        </p>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl text-xs transition"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  if (membersInGroup.length === 0) {
    return (
      <div className="bg-white p-6 rounded-3xl border border-slate-300 max-w-md mx-auto text-center space-y-4 shadow-xl">
        <Users className="w-12 h-12 text-amber-500 mx-auto animate-bounce" />
        <h3 className="font-extrabold text-slate-800 text-sm sm:text-base">এই সমিতিতে কোনো সচল সদস্য নেই!</h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          নির্বাচিত সমিতি <strong>&quot;{selectedGroup?.name || 'অজানা সমিতি'}&quot;</strong> এ কোনো সচল বা ভর্তি হওয়া সদস্য খুঁজে পাওয়া যায়নি। দয়া করে প্রথমে সদস্য ভর্তি সম্পন্ন করুন।
        </p>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-2.5 bg-[#2f6ce5] hover:bg-[#1d59d1] text-white font-bold rounded-xl text-xs transition"
        >
          ফিরে যান
        </button>
      </div>
    );
  }

  // Load live balance from active savings account if available, otherwise fallback to member fields
  const activeGsAccount = currentMember ? savingsAccounts.find(
    (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.type === 'GS' && acc.status === 'active'
  ) : null;
  const activeLtsAccount = currentMember ? ltsAccounts.find(
    (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
  ) : null;

  const rawGsBalance = activeGsAccount ? Number(activeGsAccount.balance ?? 0) : (currentMember?.gsBalance ?? currentMember?.savingsBalance ?? 0);
  const rawCbsBalance = activeCbsAccount ? Number(activeCbsAccount.balance ?? 0) : (currentMember?.cbsBalance ?? 0);
  const rawLtsBalance = activeLtsAccount ? Number(activeLtsAccount.balance ?? 0) : (currentMember?.ltsBalance ?? 0);

  // Restore pre-transaction balances if an existing same-day transaction is found
  const basePlOutstanding = currentMember ? (currentMember.plOutstanding ?? 0) + (existingTx ? (existingTx.collections?.pl ?? 0) : 0) : 0;
  const basePlInstallment = currentMember?.plInstallment ?? (basePlOutstanding > 0 ? 600 : 0);
  
  const baseCbsBalance = currentMember ? Math.max(0, rawCbsBalance - (existingTx ? (existingTx.collections?.cbs ?? 0) : 0) + (existingTx ? (existingTx.withdrawals?.cbs ?? 0) : 0)) : 0;
  const baseCbsInstallment = currentMember?.cbsInstallment ?? (activeCbsAccount?.cbsInstallment ?? (activeCbsAccount?.frequency === 'weekly' ? 10 : activeCbsAccount?.frequency === 'monthly' ? 50 : (baseCbsBalance > 0 ? 10 : 0)));
  
  const baseLtsBalance = currentMember ? Math.max(0, rawLtsBalance - (existingTx ? (existingTx.collections?.lts ?? 0) : 0)) : 0;
  const baseLtsInstallment = activeLtsAccount?.monthlyInstallment ?? currentMember?.ltsInstallment ?? (baseLtsBalance > 0 ? 100 : 0);
  
  const baseGsBalance = currentMember ? Math.max(0, rawGsBalance - (existingTx ? (existingTx.collections?.gs ?? 0) : 0) + (existingTx ? (existingTx.withdrawals?.gs ?? 0) : 0)) : 0;
  const baseGsInstallment = currentMember?.gsInstallment ?? (baseGsBalance > 0 ? 40 : 0);

  const plOutstanding = basePlOutstanding;
  const plInstallment = basePlInstallment;
  const cbsBalance = baseCbsBalance;
  const cbsInstallment = baseCbsInstallment;
  const ltsBalance = baseLtsBalance;
  const ltsInstallment = baseLtsInstallment;
  const gsBalance = baseGsBalance;
  const gsInstallment = baseGsInstallment;

  const hasPl = plOutstanding > 0;
  const hasCbs = cbsBalance > 0 || !!activeCbsAccount;
  const hasLts = ltsBalance > 0 || !!activeLtsAccount;
  const hasGs = gsBalance > 0 || !!activeGsAccount || true;

  // Real-time Net Amount calculations: Daily Collections - Daily Withdrawals
  const colPL = Number(plCollection) || 0;
  const colGS = Number(gsCollection) || 0;
  const colCBS = Number(cbsCollection) || 0;
  const colLTS = Number(ltsCollection) || 0;

  const wthGS = Number(gsWithdrawal) || 0;
  const wthCBS = Number(cbsWithdrawal) || 0;

  const colCBS_effective = cbsAlreadyDeposited ? 0 : colCBS;
  const netAmount = (colPL + colGS + colCBS_effective + colLTS) - (wthGS + wthCBS);

  const mSavings = currentMember ? savingsAccounts.filter(
    (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
  ) : [];
  const mCbs = currentMember ? cbsAccounts.filter(
    (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
  ) : [];
  const mLts = currentMember ? ltsAccounts.filter(
    (acc) => (acc.memberId === currentMember.id || acc.memberCode === currentMember.memberId) && acc.status === 'active'
  ) : [];

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
        } else if (t.type === 'savings_deposit' || t.category === 'savings_interest' || t.category === 'fdr_interest') {
          netChange += t.amount || 0;
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
        } else if (t.type === 'savings_deposit' || t.category === 'savings_interest' || t.category === 'fdr_interest') {
          const deposit = t.amount || 0;
          currentTempBal = currentTempBal + deposit;
          items.push({
            date: t.date || t.addDate,
            title: t.description || (t.category === 'fdr_interest' ? 'এফডিআর লভ্যাংশ (FDR Interest)' : 'সঞ্চয় লভ্যাংশ (Savings Interest)'),
            debit: deposit,
            credit: 0,
            balance: currentTempBal,
            category: t.category, // Pass category to identify it in Passbook
          });
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

  const handleNext = () => {
    setSelectedMemberIndex((prev) => (prev + 1) % membersInGroup.length);
  };

  const handlePrev = () => {
    setSelectedMemberIndex((prev) => (prev - 1 + membersInGroup.length) % membersInGroup.length);
  };

  const handleMemberDropdownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number(e.target.value);
    setSelectedMemberIndex(idx);
  };

  const handleSave = () => {
    if (!currentMember) return;

    if (txDate < workingDay) {
      alert("পূর্বের দিনের লেনদেন আপডেট করা সম্ভব নয়!");
      return;
    }

    if (!!activeCbsAccount && Number(cbsCollection) > 0 && Number(cbsCollection) !== baseCbsInstallment) {
      alert(`CBS জমা শুধুমাত্র নির্ধারিত কিস্তির (${baseCbsInstallment}৳) সমান অথবা ০ হতে হবে!`);
      return;
    }
    
    if (!!activeLtsAccount && Number(ltsCollection) > 0 && Number(ltsCollection) !== baseLtsInstallment) {
      alert(`LTS জমা শুধুমাত্র নির্ধারিত কিস্তির (${baseLtsInstallment}৳) সমান অথবা ০ হতে হবে!`);
      return;
    }

    const exemptionVal = isPlExempted ? (Number(plExemptionAmount) || 0) : 0;

    // Build the updated member with new outstanding balances based on restored base values (Exemption is held pending BM approval)
    const updatedMember: Member = {
      ...currentMember,
      plOutstanding: Math.max(0, basePlOutstanding - colPL),
      gsBalance: Math.max(0, baseGsBalance + colGS - wthGS),
      savingsBalance: Math.max(0, baseGsBalance + colGS - wthGS), // Keep in sync for other components
      cbsBalance: Math.max(0, baseCbsBalance + colCBS_effective - wthCBS),
      ltsBalance: baseLtsBalance + colLTS,
      
      // Status and inactive reason remain unchanged, to be processed upon BM Approval
      status: currentMember.status,
      inactiveReason: currentMember.inactiveReason,

      // Cache values so they default nicely next time
      plInstallment: basePlInstallment,
      cbsInstallment: baseCbsInstallment,
      ltsInstallment: baseLtsInstallment,
      gsInstallment: baseGsInstallment
    };

    const updatedMembersList = groupMembers.map((m) => 
      m.id === currentMember.id ? updatedMember : m
    );

    // Save transaction summary log
    const txDetails = {
      memberId: currentMember.memberId,
      memberName: currentMember.name,
      groupName: selectedGroup?.name || '',
      date: txDate,
      netAmount,
      collections: {
        pl: colPL,
        gs: colGS,
        cbs: colCBS_effective,
        lts: colLTS,
      },
      withdrawals: {
        gs: wthGS,
        cbs: wthCBS,
      },
      exemption: exemptionVal,
      exemptionReason: isPlExempted ? exemptionReason : undefined
    };

    onSaveTransactions(updatedMembersList, txDetails);
    
    // Show a beautiful local success alert
    setSuccessBanner(`${currentMember.name} এর লেজার লেনদেন সফলভাবে সংরক্ষণ ও আপডেট করা হয়েছে!`);
    
    // Smoothly clear after 3.5 seconds
    const timer = setTimeout(() => {
      setSuccessBanner(null);
    }, 3500);
  };

  return (
    <div id="tx-view-container" className="bg-[#e9edf5] text-slate-800 rounded-3xl relative overflow-hidden border border-slate-300 max-w-md mx-auto shadow-2xl font-sans leading-snug">
      
      {/* 1. COMPACT LEGEND INFO HEADER */}
      <div className="bg-[#2f6ce5] text-white overflow-hidden text-[11px] font-semibold border-b border-indigo-400">
        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-3 bg-indigo-700/80 px-3 py-2 border-r border-white/10 font-black">Group</div>
          <div className="col-span-9 px-3 py-2 flex items-center justify-between text-white/95 font-black">
            <span>{selectedGroup?.name || 'অজানা সমিতি'} - {selectedGroup?.meetingDay || 'শনিবার'} ({selectedGroup?.code || 'GRP'})</span>
            <span className="text-[9px] bg-amber-500 text-slate-900 rounded-sm px-1.5 font-bold uppercase">Active</span>
          </div>
        </div>

        <div className="grid grid-cols-12 border-b border-white/10">
          <div className="col-span-3 bg-indigo-700/80 px-3 py-2 border-r border-white/10 font-black">Officer</div>
          <div className="col-span-9 px-3 py-2 text-white/90 font-bold flex items-center gap-1.5">
            <Briefcase className="w-3 h-3 text-sky-200" />
            <span>{staff?.name || 'মাঠ কর্মী'} ({staff?.designation || 'মাঠ সংগঠক'})</span>
          </div>
        </div>

        <div className="grid grid-cols-12">
          <div className="col-span-3 bg-indigo-700/80 px-3 py-2 border-r border-white/10 font-black">Member</div>
          <div className="col-span-9 px-3 py-2 text-yellow-250 font-black flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-yellow-300" />
            <span>{currentMember?.name} ({selectedMemberIndex + 1})</span>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION CONTROL PANEL */}
      <div className="p-3 bg-white border-b border-slate-200 flex items-center gap-2">
        <button
          type="button"
          onClick={handlePrev}
          className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-90 rounded-lg text-slate-600 border border-slate-300 cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5 text-indigo-600" />
        </button>

        {/* Member Select Dropdown Selector */}
        <div className="flex-1 relative">
          <select
            value={selectedMemberIndex}
            onChange={handleMemberDropdownChange}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm py-2 px-3 pr-8 rounded-lg appearance-none cursor-pointer focus:outline-none border-0 shadow-sm"
          >
            {membersInGroup.map((m, idx) => (
              <option key={m.id} value={idx} className="bg-white text-slate-800 font-bold">
                {m.name} ({idx + 1})
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-white/90">
            <ChevronRight className="w-4 h-4 rotate-90" />
          </div>
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-2 sm:p-2.5 bg-slate-100 hover:bg-slate-200 active:scale-90 rounded-lg text-slate-600 border border-slate-300 cursor-pointer"
        >
          <ChevronRight className="w-5 h-5 text-indigo-600" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[58vh] overflow-y-auto">

        {successBanner && (
          <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl font-bold text-center text-xs shadow-xs animate-in fade-in slide-in-from-top-1 duration-200">
            {successBanner}
          </div>
        )}

        {/* 3. NET AMOUNT PANEL */}
        <div className="bg-white p-3 rounded-2xl border border-amber-300/80 shadow-md">
          <div className="text-center font-bold text-slate-600 text-xs uppercase tracking-wide">Net Amount</div>
          <div className="mt-1 grid grid-cols-12 gap-3.5 items-center">
            
            {/* Amount Box */}
            <div className="col-span-7 bg-[#f6fbf8] border-2 border-emerald-500 rounded-xl py-2 px-3 flex items-center justify-center font-black text-emerald-700 text-2xl md:text-3xl font-mono tracking-wider shadow-inner">
              {netAmount}
            </div>

            {/* Account Details btn */}
            <button
              type="button"
              onClick={() => setIsAccountDetailsVisible(!isAccountDetailsVisible)}
              className="col-span-5 py-3.5 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-300 rounded-xl font-bold text-[11px] sm:text-xs text-slate-700 select-none cursor-pointer active:scale-95 transition-all text-center"
            >
              Account Details
            </button>
          </div>
        </div>

        {/* 4. ACCOUNT DETAIL POP PANEL (IF EXPANDED) */}
        {isAccountDetailsVisible && (
          <div className="bg-slate-800 text-slate-100 p-3.5 rounded-2xl space-y-3 text-[11px] animate-in slide-in-from-top duration-200 shadow-lg border border-slate-750 font-sans">
            <h4 className="font-extrabold text-amber-400 border-b border-slate-700 pb-1.5 flex items-center justify-between col-span-2">
              <span>সদস্য অ্যাকাউন্ট বিস্তারিত (Full Profile):</span>
              <X className="w-3.5 h-3.5 cursor-pointer hover:text-white" onClick={() => setIsAccountDetailsVisible(false)} />
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-300">
              <div>সদস্য আইডি: <strong className="text-white font-mono">{currentMember?.memberId}</strong></div>
              <div>মোবাইল: <strong className="text-white font-mono">{currentMember?.phone}</strong></div>
              <div>পিতা/স্বামী: <strong className="text-white">{currentMember?.fatherHusbandName || 'N/A'}</strong></div>
              <div>জাতীয় পরিচয় (NID): <strong className="text-white font-mono">{currentMember?.nid || 'N/A'}</strong></div>
              <div className="col-span-2 border-t border-slate-700/60 pt-1.5 mt-0.5">
                বর্তমান ঠিকানা: <strong className="text-white">{currentMember?.address || 'N/A'}</strong>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-2 space-y-2 text-left">
              <div className="flex justify-between items-center pb-1">
                <span className="text-[10px] uppercase font-black text-amber-300 tracking-wider">সক্রিয় হিসাবসমূহ (Active Accounts):</span>
                <span className="text-[8px] font-black text-[#60a5fa] animate-pulse bg-blue-950 px-1.5 py-0.5 rounded">
                  স্টেটমেন্ট দেখতে ক্লিক করুন
                </span>
              </div>
              
              <div className="space-y-1.5 text-slate-200">
                {hasPl && (
                  <div
                    onClick={() => setSelectedStatement({
                      member: currentMember,
                      accountType: 'PL',
                      accountName: 'প্রাথমিক ঋণ হিসাব (PL)',
                      balance: plOutstanding
                    })}
                    className="flex justify-between items-center bg-slate-750 hover:bg-slate-700/60 p-2 rounded border border-slate-700 cursor-pointer transition-all active:scale-98"
                    title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                  >
                    <div>
                      <span className="font-extrabold text-rose-300">প্রাথমিক ঋণ হিসাব (PL)</span>
                      <span className="text-[9px] text-slate-450 block font-bold">নির্ধারিত কিস্তি: ৳{plInstallment}</span>
                    </div>
                    <span className="font-mono font-black text-rose-400">৳{plOutstanding}</span>
                  </div>
                )}

                {mSavings.map((acc: any) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedStatement({
                      member: currentMember,
                      accountType: 'GS',
                      accountName: acc.type === 'GS' ? 'সাধারণ সঞ্চয় (GS)' : 'স্থায়ী আমানত (FDR)',
                      accountNo: acc.accountNo,
                      balance: acc.balance
                    })}
                    className="flex justify-between items-center bg-slate-750 hover:bg-slate-700/60 p-2 rounded border border-slate-700 cursor-pointer transition-all active:scale-98"
                    title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                  >
                    <div>
                      <span className="font-extrabold text-slate-300">{acc.type === 'GS' ? 'সাধারণ সঞ্চয় (GS)' : 'স্থায়ী আমানত (FDR)'}</span>
                      <span className="text-[9px] text-slate-450 block font-bold">হিসাব নম্বর: {acc.accountNo}</span>
                    </div>
                    <span className="font-mono font-black text-emerald-400">৳{acc.balance}</span>
                  </div>
                ))}

                {mCbs.map((acc: any) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedStatement({
                      member: currentMember,
                      accountType: 'CBS',
                      accountName: 'ক্যাপিটাল বিল্ড-আপ সঞ্চয় (CBS)',
                      accountNo: acc.accountNo,
                      balance: acc.balance
                    })}
                    className="flex justify-between items-center bg-slate-750 hover:bg-slate-700/60 p-2 rounded border border-slate-700 cursor-pointer transition-all active:scale-98"
                    title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                  >
                    <div>
                      <span className="font-extrabold text-blue-300">ক্যাপিটাল বিল্ড-আপ সঞ্চয় (CBS)</span>
                      <span className="text-[9px] text-slate-450 block font-bold">হিসাব নম্বর: {acc.accountNo}</span>
                    </div>
                    <span className="font-mono font-black text-blue-400">৳{acc.balance}</span>
                  </div>
                ))}

                {mLts.map((acc: any) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedStatement({
                      member: currentMember,
                      accountType: 'LTS',
                      accountName: 'দীর্ঘমেয়াদী সঞ্চয় (LTS)',
                      accountNo: acc.accountNo,
                      balance: acc.balance
                    })}
                    className="flex justify-between items-center bg-slate-750 hover:bg-slate-700/60 p-2 rounded border border-slate-700 cursor-pointer transition-all active:scale-98"
                    title="স্টেটমেন্ট দেখতে ক্লিক করুন"
                  >
                    <div>
                      <span className="font-extrabold text-emerald-300">দীর্ঘমেয়াদী সঞ্চয় (LTS)</span>
                      <span className="text-[9px] text-slate-450 block font-bold">হিসাব নম্বর: {acc.accountNo}</span>
                    </div>
                    <span className="font-mono font-black text-emerald-400">৳{acc.balance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 5. ACCOUNT STATUS SECTION */}
        <div className="bg-[#fbfcff] rounded-xl border border-[#cbd5e1] overflow-hidden">
          <div className="bg-[#edf2f9] border-b border-[#cbd5e1] px-3.5 py-2">
            <h3 className="font-bold text-slate-700 text-xs">Account Status (হিসাব আপডেট স্থিতি)</h3>
          </div>
          <div className="p-1 px-3.5 text-xs text-slate-800 font-bold">
            {hasPl && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">PL (ঋণ বকেয়া) - {Math.ceil(Math.max(0, plOutstanding - colPL) / (plInstallment || 1))} কিস্তি বাকি {colPL > 0 && colPL !== plInstallment ? (colPL < plInstallment ? ' (বকেয়া)' : ' (অগ্রিম)') : ''}</span>
                <span className="font-mono text-rose-700 font-extrabold text-[13px]">
                  ৳ {Math.max(0, plOutstanding - colPL)} <span className="text-slate-400 text-[10.5px] font-medium">/ {plInstallment}</span>
                </span>
              </div>
            )}
            {hasGs && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600 font-extrabold">GS (সাধারণ সঞ্চয়)</span>
                <span className="font-mono text-[#15803d] font-black text-sm">
                  ৳ {gsBalance + colGS - wthGS} <span className="text-slate-400 text-[10.5px] font-medium">({gsInstallment})</span>
                </span>
              </div>
            )}
            {hasCbs && (
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">CBS (ডাবল সঞ্চয়)</span>
                <span className="font-mono text-emerald-700 font-extrabold text-[13px]">
                  ৳ {cbsBalance + colCBS_effective - wthCBS} <span className="text-slate-400 text-[10.5px] font-medium">({cbsInstallment})</span>
                </span>
              </div>
            )}
            {hasLts && (
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-500 font-medium">LTS {currentMember?.ltsIndex || '1'} (দীর্ঘমেয়াদী)</span>
                <span className="font-mono text-emerald-700 font-extrabold text-[13px]">
                  ৳ {ltsBalance + colLTS} <span className="text-slate-400 text-[10.5px] font-medium">({ltsInstallment})</span>
                </span>
              </div>
            )}
            {!hasPl && !hasCbs && !hasLts && !hasGs && (
              <div className="text-center text-slate-400 py-3 text-xs font-normal">
                কোন সক্রিয় অ্যাকাউন্ট বা ব্যালেন্স নেই
              </div>
            )}
          </div>
        </div>

        {/* 6. DAILY COLLECTION SECTION */}
        {(hasPl || hasGs || hasCbs || hasLts) && (
          <div className="bg-[#fbfcff] rounded-xl border border-[#cbd5e1] overflow-hidden">
            <div className="bg-[#edf2f9] border-b border-[#cbd5e1] px-3.5 py-2">
              <h3 className="font-bold text-slate-700 text-xs font-sans">Daily Collection (আজকের আদায় - PL, GS, CBS, LTS)</h3>
            </div>
            <div className="p-3 space-y-3">
              {/* PL Input */}
              {hasPl && (
                <div className="bg-[#dbeafe]/70 p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col text-slate-700 select-none">
                    <span className="font-extrabold text-indigo-900 text-xs font-sans">PL (ঋণ কিস্তি)</span>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5">বকেয়া: ৳{plOutstanding}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <input
                      type="text"
                      value={plCollection}
                      onChange={(e) => setPlCollection(e.target.value.replace(/\D/g, ''))}
                      className="w-24 bg-white border-b-2 border-indigo-400 font-black text-right text-sm px-1.5 py-0.5 outline-none font-mono focus:border-indigo-600 text-slate-850"
                    />
                    <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* GS Input */}
              {hasGs && (
                <div className="bg-[#dbeafe]/70 p-2.5 rounded-lg border border-indigo-100 flex items-center justify-between gap-3">
                  <div className="flex flex-col text-slate-700 select-none">
                    <span className="font-extrabold text-indigo-900 text-xs font-sans">GS (সাধারণ সঞ্চয়)</span>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5">স্থিতি: ৳{gsBalance}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <input
                      type="text"
                      value={gsCollection}
                      onChange={(e) => setGsCollection(e.target.value.replace(/\D/g, ''))}
                      className="w-24 bg-white border-b-2 border-indigo-400 font-black text-right text-sm px-1.5 py-0.5 outline-none font-mono focus:border-indigo-600 text-slate-850"
                    />
                    <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                </div>
              )}

              {/* CBS Input (With frequency check limit) */}
              {hasCbs && (
                <div className={`p-2.5 rounded-lg border ${cbsAlreadyDeposited ? 'bg-amber-50/50 border-amber-200' : 'bg-[#dbeafe]/70 border-indigo-100'} flex items-center justify-between gap-3`}>
                  <div className="flex flex-col text-slate-700 select-none">
                    <div className="flex items-center gap-1">
                      <span className="font-extrabold text-indigo-900 text-xs font-sans">CBS (সিবিএস)</span>
                      {cbsAlreadyDeposited && (
                        <span className="bg-amber-100 text-amber-850 text-[8.5px] font-black px-1 py-0.5 rounded uppercase font-sans">
                          {isCbsWeekly ? 'সাপ্তাহিক ১ বার জমা সম্পূর্ণ' : 'মাসিক ১ বার জমা সম্পূর্ণ'}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-bold mt-0.5 font-sans">স্থিতি: ৳{cbsBalance} {isCbsWeekly ? '| সাপ্তাহিক' : isCbsMonthly ? '| মাসিক' : ''}</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    {cbsAlreadyDeposited ? (
                      <span className="text-amber-800 text-[11px] font-bold bg-amber-50 border border-amber-200 px-2 py-1 rounded font-sans">৳০ (অলরেডি জমাকৃত)</span>
                    ) : (
                      <>
                        <input
                          type="text"
                          value={cbsCollection}
                          onChange={(e) => setCbsCollection(e.target.value.replace(/\D/g, ''))}
                          className="w-24 bg-white border-b-2 border-indigo-400 font-black text-right text-sm px-1.5 py-0.5 outline-none font-mono focus:border-indigo-600 text-slate-850"
                        />
                        <div className="w-5 h-5 bg-emerald-600 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* LTS Input */}
              {hasLts && (
                <div className="bg-[#dbeafe]/70 p-2.5 rounded-lg border border-indigo-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex flex-col text-slate-700 select-none">
                      <span className="font-extrabold text-indigo-900 text-xs font-sans">LTS (দীর্ঘমেয়াদী)</span>
                      <span className="text-[10px] text-slate-500 font-bold mt-0.5">স্থিতি: ৳{ltsBalance} | মাসিক কিস্তি: ৳{ltsInstallment}</span>
                    </div>
                    <div className="flex items-center gap-1 text-slate-800 font-bold font-mono text-sm border-b-2 border-indigo-400 px-1 bg-white">
                      ৳ <span className="font-black text-slate-900">{ltsCollection}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 w-full mt-1">
                    <button
                      type="button"
                      onClick={() => setLtsCollection('0')}
                      className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center font-sans ${
                        ltsCollection === '0'
                          ? 'bg-slate-700 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      জমা নেই (৳০)
                    </button>
                    <button
                      type="button"
                      onClick={() => setLtsCollection(String(ltsInstallment))}
                      className={`py-1.5 text-xs font-black rounded-lg transition-all cursor-pointer text-center font-sans ${
                        ltsCollection === String(ltsInstallment)
                          ? 'bg-emerald-700 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      পূর্ণ জমা (৳{ltsInstallment})
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 8. DAILY WITHDRAWAL SECTION */}
        {(hasGs || hasCbs) && (
          <div className="bg-[#fbfcff] rounded-xl border border-[#cbd5e1] overflow-hidden animate-in fade-in">
            <div className="bg-[#edf2f9] border-b border-[#cbd5e1] px-3.5 py-2">
              <h3 className="font-bold text-slate-700 text-xs">Daily Withdrawal (সঞ্চয় উত্তোলন)</h3>
            </div>
            <div className="p-3 space-y-3">
              {/* GS Withdrawal */}
              {hasGs && (
                <div className="bg-[#eaeef6] p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                  <span className="font-extrabold text-slate-700 text-xs min-w-[2.5rem]">GS</span>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <input
                      type="text"
                      value={gsWithdrawal}
                      onChange={(e) => setGsWithdrawal(e.target.value.replace(/\D/g, ''))}
                      className="w-24 bg-white border-b border-rose-400 font-black text-right text-sm px-1.5 py-0.5 outline-none font-mono focus:border-rose-600 text-slate-850"
                    />
                  </div>
                </div>
              )}

              {/* CBS Withdrawal */}
              {hasCbs && (
                <div className="bg-[#eaeef6] p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-3">
                  <span className="font-extrabold text-slate-700 text-xs min-w-[2.5rem]">CBS</span>
                  <div className="flex items-center gap-1.5 flex-1 justify-end">
                    <input
                      type="text"
                      value={cbsWithdrawal}
                      onChange={(e) => setCbsWithdrawal(e.target.value.replace(/\D/g, ''))}
                      className="w-24 bg-white border-b border-rose-400 font-black text-right text-sm px-1.5 py-0.5 outline-none font-mono focus:border-rose-600 text-slate-850"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 9. EXEMPTION SECTION */}
        {hasPl && (
          <div className="bg-[#fbfcff] rounded-xl border border-[#cbd5e1] overflow-hidden">
            <div className="bg-[#edf2f9] border-b border-[#cbd5e1] px-3.5 py-2 flex justify-between items-center">
              <h3 className="font-bold text-slate-700 text-xs">Exemption & LSRF (ঋণ মওকুফ / জীবন বীমা নিষ্পত্তি)</h3>
              <span className="text-[9px] font-black bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">LSRF</span>
            </div>
            
            <div className="p-3 space-y-3">
              <div className="bg-white p-2.5 rounded-lg border border-slate-200 flex items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isPlExempted"
                    checked={isPlExempted}
                    onChange={(e) => {
                      setIsPlExempted(e.target.checked);
                      if (e.target.checked) {
                        setPlExemptionAmount(String(plOutstanding));
                      }
                    }}
                    className="w-4 h-4 text-emerald-600 border-slate-300 focus:ring-emerald-500 rounded cursor-pointer"
                  />
                  <label htmlFor="isPlExempted" className="font-extrabold text-slate-700 text-xs cursor-pointer select-none">
                    ঋণ মওকুফ করুন (Apply Waiver)
                  </label>
                </div>
                
                {isPlExempted && (
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] font-extrabold text-[#2f6ce5]">৳</span>
                    <input
                      type="text"
                      value={plExemptionAmount}
                      onChange={(e) => setPlExemptionAmount(e.target.value.replace(/\D/g, ''))}
                      className="w-20 bg-slate-50 border-b border-[#2f6ce5] font-black text-right text-xs px-1.5 py-0.5 outline-none font-mono focus:bg-white focus:border-blue-600 text-slate-850"
                      placeholder="Amount"
                    />
                  </div>
                )}
              </div>

              {isPlExempted && (
                <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
                  <label className="block text-[10px] font-bold text-slate-500 text-left">
                    মওকুফের কারণ / সোর্স (Exemption Reason / Fund Source)
                  </label>
                  <select
                    value={exemptionReason}
                    onChange={(e: any) => setExemptionReason(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-semibold outline-none focus:border-[#2f6ce5] text-slate-800"
                  >
                    <option value="member_death">গ্রাহকের মৃত্যু (Member Death — LSRF Claims)</option>
                    <option value="guardian_death">অভিভাবকের মৃত্যু (Guardian Death — LSRF Claims)</option>
                    <option value="special_waiver">বিশেষ মওকুফ (Special Exemption / Manager Grace)</option>
                    <option value="other">অন্যান্য (Others / Manual Waiver)</option>
                  </select>

                  <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-200/60 text-[10px] text-amber-800 font-medium leading-normal text-left">
                    {exemptionReason === 'member_death' && (
                      <p>💡 <strong>Note:</strong> গ্রাহকের মৃত্যু নির্বাচন করলে, সেভিং সফল হওয়ার পর গ্রাহকের স্ট্যাটাস স্বয়ংক্রিয়ভাবে <strong>নিষ্ক্রিয় (Deceased)</strong> হয়ে যাবে এবং অবশিষ্ট ঋণ মওকুফ হয়ে যাবে।</p>
                    )}
                    {exemptionReason === 'guardian_death' && (
                      <p>💡 <strong>Note:</strong> অভিভাবকের মৃত্যুর দরুন জীবন বীমা তহবিল (LSRF) থেকে ঋণ মওকুফ বলবৎ করা হবে। গ্রাহকের ঋণ পরিশোধিত হিসেবে গণ্য হবে।</p>
                    )}
                    {exemptionReason === 'special_waiver' && (
                      <p>💡 <strong>Note:</strong> প্রাকৃতিক দুর্যোগ বা সংগতিহীন গ্রাহকদের জন্য শাখা ব্যবস্থাপকের বিশেষ বিবেচনা বা তহবিল হতে এই মওকুফ প্রযোজ্য হবে।</p>
                    )}
                    {exemptionReason === 'other' && (
                      <p>💡 <strong>Note:</strong> ম্যানুয়াল মওকুফ বা অন্য কোনো নির্দিষ্ট পলিসি অনুযায়ী ছাড় রেকর্ড করা হচ্ছে।</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* 10. ACTION FOOTER BUTTONS */}
      <div className="p-4 bg-white border-t border-slate-200 flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 bg-white text-[#2f6ce5] hover:bg-slate-50 border border-slate-300 rounded-xl font-bold text-xs select-none cursor-pointer active:scale-95 text-center transition"
        >
          Close
        </button>

        <button
          type="button"
          onClick={handleSave}
          className="flex-1 py-3 bg-[#2f6ce5] hover:bg-[#1d59d1] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg select-none cursor-pointer active:scale-95 transition"
        >
          <Save className="w-4 h-4" />
          Save
        </button>
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
          <div className="bg-white border-b border-slate-200 p-4 space-y-1.5 font-sans text-left">
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
          <div className="flex-1 overflow-y-auto p-0 font-sans text-left">
            {(() => {
              const txs = getAccountStatement(selectedStatement.member, selectedStatement.accountType);
              return <MemberPassbook txs={txs} />;
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
