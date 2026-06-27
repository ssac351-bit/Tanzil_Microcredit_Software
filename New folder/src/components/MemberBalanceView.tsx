/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Users, 
  User, 
  Search, 
  ChevronDown, 
  Check, 
  DollarSign, 
  Plus, 
  Scale, 
  ShieldAlert, 
  BookOpen, 
  HelpCircle,
  MoreVertical
} from 'lucide-react';
import { Group, Member } from '../types';

interface MemberBalanceViewProps {
  onBack: () => void;
  branchGroups: Group[];
  groupMembers: Member[];
  savingsAccounts?: any[];
  cbsAccounts?: any[];
  ltsAccounts?: any[];
  staff: { name: string; staffId?: string };
  workingDay: string;
}

export const MemberBalanceView: React.FC<MemberBalanceViewProps> = ({
  onBack,
  branchGroups,
  groupMembers,
  savingsAccounts = [],
  cbsAccounts = [],
  ltsAccounts = [],
  staff,
  workingDay
}) => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Find currently selected group
  const selectedGroup = branchGroups.find(g => g.id === selectedGroupId);

  // Helper: Format date into native screenshot header style (e.g., 16/06/2026 Tue)
  const formatHeaderDate = (dateStr: string): string => {
    if (!dateStr) return '';
    try {
      const parts = dateStr.split('-');
      if (parts.length !== 3) return dateStr;
      const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
      const dd = String(dateObj.getDate()).padStart(2, '0');
      const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
      const yyyy = dateObj.getFullYear();
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const ddd = days[dateObj.getDay()];
      return `${dd}/${mm}/${yyyy} ${ddd}`;
    } catch {
      return dateStr;
    }
  };

  // Helper: Convert day names to short English representation for group label
  const getDayAbbr = (dayName?: string): string => {
    if (!dayName) return 'SAT';
    const dayLower = dayName.toLowerCase();
    if (dayLower.includes('রবি') || dayLower.includes('sun')) return 'SUN';
    if (dayLower.includes('সোম') || dayLower.includes('mon')) return 'MON';
    if (dayLower.includes('মঙ্গ') || dayLower.includes('tue')) return 'TUE';
    if (dayLower.includes('বুধ') || dayLower.includes('wed')) return 'WED';
    if (dayLower.includes('বৃহ') || dayLower.includes('thu')) return 'THU';
    if (dayLower.includes('শুক্র') || dayLower.includes('fri')) return 'FRI';
    if (dayLower.includes('শনি') || dayLower.includes('sat')) return 'SAT';
    return 'SAT';
  };

  // Format group option label to closely match user screenshot
  const formatGroupLabel = (g: Group) => {
    const countVal = groupMembers.filter(m => m.groupId === g.id && m.status !== 'inactive').length;
    
    let label = g.name;
    
    // Clean any trailing parenthesis of count (e.g. " (35)" or " (29)") to avoid doubling
    label = label.replace(/\s*\(\d+\)\s*$/, '');
    
    // Check if label contains day abbreviation or meeting day already, if not, we can append it
    const hasDay = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].some(day => label.toUpperCase().includes(day));
    if (!hasDay && g.meetingDay) {
      const dayAbbr = getDayAbbr(g.meetingDay);
      label = `${label} - ${dayAbbr}`;
    }
    
    return `${label} (${countVal})`;
  };

  // Filter members of selected group
  const activeMembersInGroup = groupMembers.filter(m => {
    if (m.groupId !== selectedGroupId) return false;
    if (m.status === 'inactive') return false; // display active members in balance sheet
    
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        m.name.toLowerCase().includes(q) ||
        (m.memberId && m.memberId.toLowerCase().includes(q))
      );
    }
    return true;
  });

  // Calculate totals
  const totalGs = activeMembersInGroup.reduce((sum, m) => {
    // GS balance is savingsBalance or gsBalance preference
    return sum + (m.gsBalance ?? m.savingsBalance ?? 0);
  }, 0);

  const totalCbs = activeMembersInGroup.reduce((sum, m) => {
    return sum + (m.cbsBalance ?? 0);
  }, 0);

  const totalLts = activeMembersInGroup.reduce((sum, m) => {
    return sum + (m.ltsBalance ?? 0);
  }, 0);

  const totalOutstanding = activeMembersInGroup.reduce((sum, m) => {
    return sum + (m.plOutstanding ?? 0);
  }, 0);

  const totalNet = (totalGs + totalCbs + totalLts) - totalOutstanding;

  // Parse staff first name for ID Badge style
  const staffNameToShow = staff.name ? staff.name.split(' ')[0].toUpperCase() : 'ZAKARIA';

  return (
    <div className="flex flex-col bg-[#eff3f6] min-h-[500px] font-sans text-slate-800 rounded-b-2xl border-x border-b border-slate-200 overflow-hidden shadow-xs">
      {/* 1. BLUE HEADER BAR */}
      <div className="bg-[#2f6ce5] text-white px-4 py-3 flex items-center justify-between shadow-md">
        <button 
          onClick={onBack}
          type="button"
          className="hover:bg-white/12 p-1.5 rounded-full transition active:scale-95 cursor-pointer text-white flex items-center justify-center shrink-0"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>
        
        <div className="text-center flex-1 mx-3 select-none">
          <p className="font-extrabold text-[12.5px] sm:text-[14px] leading-tight tracking-wide">
            {formatHeaderDate(workingDay)}
          </p>
          <p className="font-black text-[13.5px] sm:text-[15px] leading-tight mt-0.5">
            Mohishbathan
          </p>
        </div>

        <div className="flex items-center gap-2 select-none shrink-0 font-bold text-xs text-blue-100">
          <span>v: 4.0.43</span>
          <MoreVertical size={16} className="text-white cursor-pointer hover:text-blue-100" />
        </div>
      </div>

      {/* 2. SUB HEADER (STAFF & GROUP STATUS ROW) */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 flex justify-between items-center shadow-2xs select-none">
        {/* Left: Zakaria staff segment */}
        <div className="flex items-center gap-2">
          <div className="bg-[#2f6ce5] text-white p-1 rounded-sm flex items-center justify-center">
            {/* Custom person icon using User svg */}
            <User size={16} className="stroke-[2.5]" />
          </div>
          <span className="text-slate-700 tracking-wider font-extrabold text-[12.5px] uppercase">
            {staffNameToShow}
          </span>
        </div>

        {/* Vertical divider */}
        <div className="w-[1px] h-5 bg-slate-300"></div>

        {/* Right: Group status badge */}
        <div className="flex items-center gap-2">
          <span className="text-slate-600 font-extrabold text-[12.5px]">
            {selectedGroup ? selectedGroup.name : 'No Group'}
          </span>
          <div className="bg-transparent text-[#2f6ce5] p-1 flex items-center justify-center">
            <Users size={19} className="stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. DROPDOWN GROUP SELECT BAR */}
      <div className="p-4 bg-[#eff3f6] relative">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full bg-white border border-slate-200 hover:border-slate-350 px-4 py-3 rounded-md flex justify-between items-center shadow-2xs hover:bg-slate-50 transition cursor-pointer select-none"
          >
            <span className="text-slate-800 font-extrabold text-xs sm:text-sm">
              {selectedGroup ? formatGroupLabel(selectedGroup) : 'Select Group'}
            </span>
            <span className={`text-slate-400 text-[10px] sm:text-xs transition-transform duration-250 shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {/* Group Options Dropdown List */}
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-lg shadow-xl z-50 max-h-80 overflow-y-auto divide-y divide-slate-100 font-semibold text-xs sm:text-sm animate-in fade-in slide-in-from-top-1 duration-150">
              <button
                type="button"
                onClick={() => {
                  setSelectedGroupId('');
                  setIsDropdownOpen(false);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition font-bold flex justify-between items-center ${!selectedGroupId ? 'text-blue-600 bg-blue-50/50' : 'text-slate-600'}`}
              >
                <span>Select Group</span>
                {!selectedGroupId && <Check size={14} className="stroke-[2.5]" />}
              </button>

              {branchGroups.map((g) => {
                const isCurrent = g.id === selectedGroupId;
                return (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setSelectedGroupId(g.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-slate-50 transition flex justify-between items-center ${isCurrent ? 'text-blue-600 bg-blue-50/30 font-bold' : 'text-slate-800'}`}
                  >
                    <span>{formatGroupLabel(g)}</span>
                    {isCurrent && <Check size={14} className="stroke-[2.5]" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. MAIN WORKSPACE / MAIN VIEW AREA */}
      <div className="flex-1 bg-white px-4 pb-6 min-h-[300px] flex flex-col">
        {!selectedGroupId ? (
          /* NO GROUP SELECTED VIEW (Matches screenshot 2) */
          <div className="flex-1 flex flex-col items-center justify-center py-20 min-h-[250px] select-none">
            <p className="text-[#3b82f6] font-bold text-[19px] sm:text-[22px] tracking-wide text-center">
              No Group Selected
            </p>
          </div>
        ) : (
          /* GROUP REPORT BALANCES SHEET */
          <div className="flex-1 flex flex-col space-y-4 animate-in fade-in duration-200">
            {/* Filter Search Bar */}
            <div className="flex items-center gap-2 bg-[#f4f7fa] border border-slate-200 rounded-xl px-3 py-2">
              <Search size={15} className="text-slate-400 shrink-0" />
              <input
                type="text"
                placeholder="সদস্য খুঁজুন (নাম বা কোড)..."
                className="w-full bg-transparent text-xs sm:text-sm placeholder-slate-400 outline-none font-medium text-slate-800 focus:ring-0 focus:outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Header info stats */}
            <div className="flex items-center justify-between text-slate-500 text-[11px] sm:text-xs font-bold leading-tight select-none">
              <p>গ্রুপের কোড: <span className="text-slate-800">{selectedGroup?.code}</span></p>
              <p>সদস্য সংখ্যা: <span className="text-slate-800 font-extrabold">{activeMembersInGroup.length} জন</span></p>
            </div>

            {/* Member Balances Table */}
            {activeMembersInGroup.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-bold text-xs">
                কোনো সচল সদস্য পাওয়া যায়নি।
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs text-slate-700 min-w-[650px] border-collapse">
                  <thead>
                    <tr className="bg-[#f8fafc] border-b border-slate-200 text-slate-600 font-extrabold select-none">
                      <th className="py-2.5 px-3 text-center w-10">ক্রমিক</th>
                      <th className="py-2.5 px-3 text-left">সদস্যের নাম ও কোড</th>
                      <th className="py-2.5 px-3 text-right">ঋণ বকেয়া (PL)</th>
                      <th className="py-2.5 px-3 text-right">সাধারণ সঞ্চয় (GS)</th>
                      <th className="py-2.5 px-3 text-right">সিবিএস (CBS)</th>
                      <th className="py-2.5 px-3 text-right">এলটিএস (LTS)</th>
                      <th className="py-2.5 px-3 text-right">নীট ব্যালেন্স</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold">
                    {activeMembersInGroup.map((m, index) => {
                      const gsVal = m.gsBalance ?? m.savingsBalance ?? 0;
                      const cbsVal = m.cbsBalance ?? 0;
                      const ltsVal = m.ltsBalance ?? 0;
                      const plVal = m.plOutstanding ?? 0;
                      const netVal = (gsVal + cbsVal + ltsVal) - plVal;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/50">
                          <td className="py-2 px-3 text-center text-slate-400 font-mono">
                            {(index + 1).toLocaleString('bn-BD')}
                          </td>
                          <td className="py-2 px-3">
                            <p className="text-slate-900 font-bold text-[12.5px]">{m.name}</p>
                            <p className="text-slate-400 font-mono text-[10.5px] mt-0.5">{m.memberId || 'N/A'}</p>
                          </td>
                          <td className={`py-2 px-3 text-right font-mono text-[12.5px] ${plVal > 0 ? 'text-rose-750 text-rose-600 font-bold' : 'text-slate-400'}`}>
                            ৳{plVal.toLocaleString('bn-BD')}
                          </td>
                          <td className={`py-2 px-3 text-right font-mono text-[12.5px] ${gsVal > 0 ? 'text-indigo-900' : 'text-slate-400'}`}>
                            ৳{gsVal.toLocaleString('bn-BD')}
                          </td>
                          <td className={`py-2 px-3 text-right font-mono text-[12.5px] ${cbsVal > 0 ? 'text-emerald-900' : 'text-slate-400'}`}>
                            ৳{cbsVal.toLocaleString('bn-BD')}
                          </td>
                          <td className={`py-2 px-3 text-right font-mono text-[12.5px] ${ltsVal > 0 ? 'text-teal-900' : 'text-slate-400'}`}>
                            ৳{ltsVal.toLocaleString('bn-BD')}
                          </td>
                          <td className={`py-2 px-3 text-right font-mono text-[12.5px] ${netVal !== 0 ? (netVal > 0 ? 'text-blue-900' : 'text-rose-600') : 'text-slate-400'}`}>
                            ৳{netVal.toLocaleString('bn-BD')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  {/* Totals Row */}
                  <tfoot>
                    <tr className="bg-slate-50/80 border-t border-slate-200 text-slate-900 font-extrabold select-none">
                      <td colSpan={2} className="py-2.5 px-3 text-right text-xs">সর্বমোট স্থিতি:</td>
                      <td className="py-2.5 px-3 text-right font-mono text-[13px] text-rose-700 border-l border-slate-100">
                        ৳{totalOutstanding.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[13px] text-indigo-900 border-l border-slate-100">
                        ৳{totalGs.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[13px] text-emerald-950 text-emerald-900 border-l border-slate-100">
                        ৳{totalCbs.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[13px] text-teal-950 text-teal-900 border-l border-slate-100">
                        ৳{totalLts.toLocaleString('bn-BD')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono text-[13px] text-blue-900 border-l border-slate-100">
                        ৳{totalNet.toLocaleString('bn-BD')}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
