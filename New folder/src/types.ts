/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Organization {
  id: string;
  name: string;
  address: string;
  addDate: string;
  adminId: string;
  adminPassword: string;
}

export interface Staff {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  designation: string;
  joiningDate: string;
  branchId?: string;          // কর্মরত ব্রাঞ্চ আইডি
  branchJoiningDate?: string; // ব্রাঞ্চে যোগদানের তারিখ
  staffId?: string;           // ইউনিক আইডি (auto-generated)
  password?: string;          // সিক্রেট পাসওয়ার্ড (auto-generated)
}

export interface Member {
  id: string;
  orgId: string;
  name: string;
  phone: string;
  address: string;
  loanAmount: number;
  payableAmount: number;
  paidAmount: number;
  savingsBalance: number;
  addDate: string;
  
  // Extra properties for transaction ledgers and loan workflows
  memberId?: string;
  groupId?: string;
  status?: 'active' | 'inactive';
  inactiveReason?: string;
  plOutstanding?: number;
  plInstallment?: number;
  gsBalance?: number;
  cbsBalance?: number;
  ltsBalance?: number;
  fatherHusbandName?: string;
  village?: string;
}

export interface Transaction {
  id: string;
  orgId: string;
  memberId: string;
  memberName: string;
  type: 'loan_repayment' | 'savings_deposit' | 'savings_withdrawal';
  amount: number;
  date: string;
}

export interface Branch {
  id: string;
  orgId: string;
  name: string;
  code: string;
  manager?: string;
  phone: string;
  address: string;
  addDate: string;
  status?: 'active' | 'closed';
}

export interface Holiday {
  id: string;
  orgId: string;
  type: 'direct' | 'general'; // direct = সরাসরি, general = সাধারণ
  name: string;               // ছুটির কারণ (যেমন- ঈদ-উল-ফিতর, সাপ্তাহিক ছুটি)
  date?: string;              // সরাসরি ছুটির জন্য তারিখ (যেমন- 2026-06-18)
  dayOfWeek?: string;         // সাধারণ ছুটির জন্য সাপ্তাহিক বার (যেমন- Friday / শুক্রবার)
  addDate: string;
}

export interface Group {
  id: string;
  orgId: string;
  branchId: string;
  name: string;               // গ্রুপের নাম (যেমন- গোলাপ, জবা, শাপলা)
  code: string;               // গ্রুপের কোড (যেমন- GRP-001)
  assignedStaffId: string;    // দায়িত্বরত কর্মকর্তার/কর্মীর আইডি (যেমন- ILO)
  addDate: string;
  meetingDay?: string;        // মিটিং বার
  village?: string;           // গ্রাম
  isActive?: boolean;         // সচল কি না
}

export interface LoanProductConfig {
  id: string;
  name: string;
  durationMonths: number;
  installmentsCount: number;
  serviceChargeRate: number; // e.g. 0.15 for 15%
  type: 'সাপ্তাহিক' | 'মাসিক' | 'মেয়াদি';
  collectServiceChargeMonthly?: boolean; // মেয়াদি ঋণের ক্ষেত্রে মাসিক সার্ভিস চার্জ আদায় যোগ্য কি না
}



