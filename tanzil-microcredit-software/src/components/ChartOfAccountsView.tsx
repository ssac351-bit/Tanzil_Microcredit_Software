import React, { useState } from 'react';
import { ChevronDown, ChevronUp, RefreshCw, HelpCircle, FileText, Landmark, Info } from 'lucide-react';
import { COA_TREE, AccountGroup, Account } from '../lib/coa';

interface ChartOfAccountsViewProps {
  onReset: () => void;
  balances?: Record<string, number>;
}

const ChartOfAccountsView = ({ onReset, balances = {} }: ChartOfAccountsViewProps) => {
  // We can track which groups are expanded (default empty list so they are collapsed by default)
  const [expandedGroups, setExpandedGroups] = useState<string[]>([]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  // Helper helper to calculate child balances and parent summary balances dynamically
  const getBalanceVal = (id: string): number => {
    const bal = balances;
    if (id === 'cash_bank_group') {
      return (bal['cash'] ?? 0) + (bal['current_ac'] ?? 0) + (bal['savings_ac'] ?? 0) + (bal['fdr'] ?? 0);
    }
    if (id === 'loan_portfolio') {
      return (bal['general_loan'] ?? 0) + (bal['micro_loan'] ?? 0) + (bal['agri_loan'] ?? 0) + (bal['special_loan'] ?? 0);
    }
    if (id === 'fixed_assets_group') {
      return (bal['land_building'] ?? 0) + (bal['furniture'] ?? 0) + (bal['computer_it'] ?? 0) + (bal['vehicles'] ?? 0);
    }
    if (id === 'advances_group') {
      return (bal['rent_advance'] ?? 0) + (bal['staff_advance'] ?? 0);
    }
    if (id === 'member_savings_group') {
      return (bal['general_savings'] ?? 0) + (bal['cbs_savings'] ?? 0) + (bal['lts_savings'] ?? 0);
    }
    if (id === 'external_borrowings') {
      return (bal['pksf_loan'] ?? 0) + (bal['commercial_loan'] ?? 0);
    }
    if (id === 'provisions_reserves') {
      return (bal['llpf'] ?? 0) + (bal['risk_fund'] ?? 0);
    }
    if (id === 'current_liabilities') {
      return (bal['salary_payable'] ?? 0) + (bal['rent_payable'] ?? 0) + (bal['staff_gratuity'] ?? 0);
    }
    if (id === 'liability_group') {
      const mem = (bal['general_savings'] ?? 0) + (bal['cbs_savings'] ?? 0) + (bal['lts_savings'] ?? 0);
      const ext = (bal['pksf_loan'] ?? 0) + (bal['commercial_loan'] ?? 0);
      const prov = (bal['llpf'] ?? 0) + (bal['risk_fund'] ?? 0);
      const curr = (bal['salary_payable'] ?? 0) + (bal['rent_payable'] ?? 0) + (bal['staff_gratuity'] ?? 0);
      return mem + ext + prov + curr;
    }
    if (id === 'equity_group_header') {
      return (bal['capital_fund'] ?? 0) + (bal['retained_earnings'] ?? 0) + (bal['donor_grant'] ?? 0);
    }
    if (id === 'operating_income_sum') {
      return (bal['service_charge'] ?? 0) + (bal['admission_fee'] ?? 0) + (bal['passbook_fee'] ?? 0);
    }
    if (id === 'non_operating_income_sum') {
      return (bal['bank_interest'] ?? 0) + (bal['misc_income'] ?? 0);
    }
    if (id === 'income_group') {
      return (bal['service_charge'] ?? 0) + (bal['admission_fee'] ?? 0) + (bal['passbook_fee'] ?? 0) + (bal['bank_interest'] ?? 0) + (bal['misc_income'] ?? 0);
    }
    if (id === 'financial_expenses_sum') {
      return (bal['savings_interest'] ?? 0) + (bal['loan_interest_exp'] ?? 0);
    }
    if (id === 'admin_expenses_sum') {
      return (bal['staff_salaries'] ?? 0) + (bal['office_rent'] ?? 0) + (bal['utilities_expense'] ?? 0) + (bal['travel_allowance'] ?? 0) + (bal['printing_stationery'] ?? 0) + (bal['audit_fees'] ?? 0);
    }
    if (id === 'other_expenses_sum') {
      return (bal['depreciation_expense'] ?? 0) + (bal['bad_debt'] ?? 0);
    }
    if (id === 'expense_group') {
      const fin = (bal['savings_interest'] ?? 0) + (bal['loan_interest_exp'] ?? 0);
      const adm = (bal['staff_salaries'] ?? 0) + (bal['office_rent'] ?? 0) + (bal['utilities_expense'] ?? 0) + (bal['travel_allowance'] ?? 0) + (bal['printing_stationery'] ?? 0) + (bal['audit_fees'] ?? 0);
      const oth = (bal['depreciation_expense'] ?? 0) + (bal['bad_debt'] ?? 0);
      return fin + adm + oth;
    }
    return bal[id] ?? 0;
  };

  // Group grand total calculations
  const getGroupTotal = (groupId: string): number => {
    if (groupId === 'asset') {
      return getBalanceVal('cash_bank_group') + getBalanceVal('loan_portfolio') + getBalanceVal('fixed_assets_group') + getBalanceVal('advances_group');
    }
    if (groupId === 'liability') {
      return getBalanceVal('liability_group');
    }
    if (groupId === 'equity') {
      return getBalanceVal('equity_group_header');
    }
    if (groupId === 'income') {
      return getBalanceVal('income_group');
    }
    if (groupId === 'expense') {
      return getBalanceVal('expense_group');
    }
    return 0;
  };

  return (
    <div className="bg-[#f8fafc] p-4 sm:p-6 rounded-2xl border border-[#cbd5e1] space-y-6 select-none font-sans">
      
      {/* 1. Header Portion */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-black text-slate-800 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 block shrink-0"></span>
            চার্ট অফ একাউন্টস ও খতিয়ান বিন্যাস (Chart of Accounts Model)
          </h2>
          <p className="text-xs text-slate-500 font-bold mt-0.5 font-sans">
            এমআরএ ও পিকেএসএফ হিসাব নীতি অনুযায়ী ডিজাইনকৃত আদর্শ খতিয়ান বিন্যাস
          </p>
        </div>
      </div>

      {/* 2. Group Cards List */}
      <div className="space-y-5">
        {COA_TREE.map((group: AccountGroup) => {
          const isExpanded = expandedGroups.includes(group.id);
          const totalBal = getGroupTotal(group.id);
          
          return (
            <div 
              key={group.id} 
              className={`bg-white rounded-xl border ${group.colorTheme.border} overflow-hidden shadow-sm transition-all`}
            >
              
              {/* Group Trigger Bar (Style matched with exact screenshot patterns) */}
              <button
                onClick={() => toggleGroup(group.id)}
                className={`w-full text-left p-4 ${group.colorTheme.bg} flex items-start gap-3 justify-between transition-colors cursor-pointer`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown size={18} className={`${group.colorTheme.text} shrink-0 stroke-[3.5]`} />
                    ) : (
                      <ChevronUp size={18} className={`${group.colorTheme.text} shrink-0 stroke-[3.5]`} />
                    )}
                    <span className={`text-sm tracking-normal font-black ${group.colorTheme.text}`}>
                      {group.name} ({group.enName})
                    </span>
                  </div>
                  
                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 mt-1.5 pl-6 text-[10.5px] font-bold text-slate-500 font-sans">
                    <span>কোড ডোমেন: {group.domain}</span>
                    <span>•</span>
                    <span>মোট অ্যাকাউন্ট: {group.accounts.length} টি</span>
                  </div>
                </div>

                {/* Total Balance Badge (Dynamic matching exactly) */}
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-500 font-black">মোট উদ্বৃত্ত:</span>
                    <span className="bg-emerald-100/90 border border-emerald-300 text-emerald-800 font-mono text-xs font-black px-2 py-0.5 rounded-lg shadow-3xs">
                      ৳ {totalBal.toLocaleString('bn-BD')}
                    </span>
                  </div>
                </div>
              </button>

              {/* Accounts Table Content (When Expanded) */}
              {isExpanded && (
                <div className="overflow-x-auto border-t border-slate-100">
                  <table className="w-full text-left border-collapse font-sans min-w-[650px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] sm:text-[11px] font-extrabold uppercase">
                        <th className="py-2.5 px-4 w-20">কোড</th>
                        <th className="py-2.5 px-4">হিসাব বিবরণী (বাংলা)</th>
                        <th className="py-2.5 px-4">ACCOUNT DESCRIPTION (EN)</th>
                        <th className="py-2.5 px-4 text-center">প্রারম্ভিক (INITIAL)</th>
                        <th className="py-2.5 px-4 text-right">বর্তমান (CURRENT)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80">
                      {group.accounts.map((acc: Account) => {
                        const val = getBalanceVal(acc.id);
                        const isSumRow = acc.isSummary;
                        
                        return (
                          <tr 
                            key={acc.id} 
                            className={`hover:bg-slate-50/40 transition-colors text-[11.5px] sm:text-[12px] font-bold ${
                              isSumRow 
                                ? 'bg-[#f7f9fc]/80 text-slate-900 border-y border-slate-100/90' 
                                : 'text-slate-700'
                            }`}
                          >
                            
                            {/* Code Badge Cell */}
                            <td className="py-2.5 px-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] sm:text-[10.5px] font-mono font-black ${
                                isSumRow 
                                  ? 'bg-[#e2e8f0] text-slate-800' 
                                  : 'bg-[#f1f5f9] text-slate-600'
                              }`}>
                                {acc.code}
                              </span>
                            </td>

                            {/* Bangla Name Cell with Badge check */}
                            <td className="py-2.5 px-4">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className={isSumRow ? 'font-black text-slate-900 text-xs' : 'font-semibold text-slate-800'}>
                                  {acc.name}
                                </span>
                                {acc.badge && (
                                  <span className="inline-flex items-center gap-0.5 bg-blue-50 text-blue-700 border border-blue-200 text-[8.5px] font-black px-1.5 py-0.2 rounded shadow-4xs shrink-0 select-none">
                                    <Landmark className="w-2.5 h-2.5 text-blue-500" />
                                    {acc.badge}
                                  </span>
                                )}
                              </div>
                            </td>

                            {/* English Name Cell */}
                            <td className="py-2.5 px-4 text-[#475569] font-medium font-sans">
                              {acc.enName}
                            </td>

                            {/* Initial Balance (Constant 0 as shown in mock) */}
                            <td className="py-2.5 px-4 text-center font-mono text-slate-400 font-bold text-[11px]">
                              ৳ ০
                            </td>

                            {/* Current Dynamic Balance Cell */}
                            <td className="py-2.5 px-4 text-right">
                              <span className={`font-mono font-black text-xs ${
                                val > 0 
                                  ? 'text-emerald-700 font-black' 
                                  : isSumRow 
                                    ? 'text-slate-850 font-black' 
                                    : 'text-slate-500'
                              }`}>
                                ৳ {val.toLocaleString('bn-BD')}
                              </span>
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* 3. Helpful Footer Notes */}
      <div className="p-4 bg-blue-50/50 border border-blue-200/50 rounded-xl text-[11.5px] font-semibold leading-relaxed text-slate-600 shadow-3xs flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 text-blue-600 mt-0.5" />
        <div>
          <span className="font-black text-blue-800 block mb-1">💡 চার্ট অফ অ্যাকাউন্টস সহায়ক তথ্যঃ</span>
          বুক-কিপিং বা দৈনিক আদায় স্ক্রিনে যে কোনো সদস্য আদায় (GS, CBS, PL, LTS) বা কেল্যাকটর ক্যাশ এন্ট্রি হওয়া মাত্রই চার্ট অফ অ্যাকাউন্টসে তার সংশ্লিষ্ট সাধারণ লেজার (GL Accounts) খতিয়ান রিয়েল-টাইম ব্যালেন্স হিসাব অনুযায়ী স্বয়ংক্রিয়ভাবে আপডেট হয়।
        </div>
      </div>

    </div>
  );
};

export default ChartOfAccountsView;
