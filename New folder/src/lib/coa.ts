export interface Account {
  id: string;
  code: string;
  name: string;
  enName: string;
  badge?: string;
  isSummary?: boolean;
}

export interface AccountGroup {
  id: string;
  name: string;
  enName: string;
  domain: string;
  colorTheme: {
    bg: string;
    border: string;
    text: string;
    accent: string;
  };
  accounts: Account[];
}

export const COA_TREE: AccountGroup[] = [
  {
    id: "asset",
    name: "সম্পদ হিসাবসমূহ",
    enName: "Asset Accounts",
    domain: "1xxx",
    colorTheme: {
      bg: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-800",
      accent: "bg-emerald-100 text-emerald-800"
    },
    accounts: [
      { id: "cash_bank_group", code: "1100", name: "নগদ ও ব্যাংক উদ্বৃত্ত", enName: "Cash & Bank Balance", badge: "ব্যাংক হিসাব", isSummary: true },
      { id: "cash", code: "1101", name: "হাতে নগদ টাকা", enName: "Cash in Hand" },
      { id: "current_ac", code: "1102", name: "ব্যাংক চলতি হিসাব (Current Account)", enName: "Current Account", badge: "ব্যাংক হিসাব" },
      { id: "savings_ac", code: "1103", name: "ব্যাংক সঞ্চয়ী হিসাব", enName: "Savings Account", badge: "ব্যাংক হিসাব" },
      { id: "fdr", code: "1104", name: "স্থায়ী আমানত (FDR)", enName: "Fixed Deposit Receipts (FDR)", badge: "ব্যাংক হিসাব" },
      { id: "loan_portfolio", code: "1200", name: "ঋণ পোর্টফোলিও", enName: "Loan Portfolio", isSummary: true },
      { id: "general_loan", code: "1201", name: "সাধারণ ঋণ", enName: "General Loan" },
      { id: "micro_loan", code: "1202", name: "ক্ষুদ্র উদ্যোগ ঋণ", enName: "Micro-enterprise Loan" },
      { id: "agri_loan", code: "1203", name: "কৃষি/ঋতুভিত্তিক ঋণ", enName: "Seasonal/Agriculture Loan" },
      { id: "special_loan", code: "1204", name: "অন্যান্য বিশেষ ঋণ", enName: "Emergency Loan" },
      { id: "fixed_assets_group", code: "1300", name: "স্থায়ী সম্পদ", enName: "Fixed Assets", isSummary: true },
      { id: "land_building", code: "1301", name: "জমি ও ভবন", enName: "Land & Building" },
      { id: "furniture", code: "1302", name: "অফিস আসবাবপত্র ও ফিক্সচার", enName: "Furniture & Fixture" },
      { id: "computer_it", code: "1303", name: "কম্পিউটার ও আইটি সরঞ্জাম", enName: "Computer & IT Equipment" },
      { id: "vehicles", code: "1304", name: "যানবাহন/মোটরসাইকেল", enName: "Vehicles" },
      { id: "advances_group", code: "1400", name: "অগ্রিম ও জামানত", enName: "Advances & Deposits", isSummary: true },
      { id: "rent_advance", code: "1401", name: "অগ্রিম office ভাড়া", enName: "Advance Office Rent" },
      { id: "staff_advance", code: "1402", name: "কর্মকর্তা/কর্মচারী অগ্রিম", enName: "Staff Advance" }
    ]
  },
  {
    id: "liability",
    name: "হিসাব দায়সমূহ",
    enName: "Liability Accounts",
    domain: "2xxx",
    colorTheme: {
      bg: "bg-blue-50/80",
      border: "border-blue-200",
      text: "text-blue-800",
      accent: "bg-blue-100 text-blue-800"
    },
    accounts: [
      { id: "liability_group", code: "2000", name: "দায় গ্রুপ", enName: "Liabilities Group", isSummary: true },
      { id: "member_savings_group", code: "2100", name: "সদস্যদের সঞ্চয় আমানত", enName: "Members' Savings", isSummary: true },
      { id: "general_savings", code: "2101", name: "বাধ্যতামূলক সঞ্চয়", enName: "Compulsory Savings" },
      { id: "cbs_savings", code: "2102", name: "ঐচ্ছিক সঞ্চয়", enName: "Voluntary Savings" },
      { id: "lts_savings", code: "2103", name: "মেয়াদী সঞ্চয় স্কিম (DPS)", enName: "Term Savings Scheme (DPS)" },
      { id: "external_borrowings", code: "2200", name: "বহিঃস্থ ঋণ/তহবিল", enName: "External Borrowings", isSummary: true },
      { id: "pksf_loan", code: "2201", name: "পিকেএসএফ (PKSF) তহবিল", enName: "PKSF Fund Loan" },
      { id: "commercial_loan", code: "2202", name: "বাণিজ্যিক ব্যাংক ঋণ", enName: "Commercial Bank Loan" },
      { id: "provisions_reserves", code: "2300", name: "সঞ্চিতি তহবিল", enName: "Provisions & Reserves", isSummary: true },
      { id: "llpf", code: "2301", name: "খেলাপি ঋণের সঞ্চিতি (LLPF)", enName: "Provision for Bad Loans (LLPR)" },
      { id: "risk_fund", code: "2302", name: "ঋণ ঝুঁকি/বীমা তহবিল", enName: "Loan Insurance/Risk Fund" },
      { id: "current_liabilities", code: "2400", name: "চলতি দায়", enName: "Current Liabilities", isSummary: true },
      { id: "salary_payable", code: "2401", name: "বকেয়া স্টাফ বেতন", enName: "Salary Payable" },
      { id: "rent_payable", code: "2402", name: "বকেয়া অফিস ভাড়া", enName: "Rent Payable" },
      { id: "staff_gratuity", code: "2403", name: "স্টاف প্রভিডেন্ট ফান্ড ও গ্র্যাচুইটি", enName: "Staff Provident Fund & Gratuity" }
    ]
  },
  {
    id: "equity",
    name: "মূলধন ও রিজার্ভ তহবিল",
    enName: "Equity & Reserves",
    domain: "3xxx",
    colorTheme: {
      bg: "bg-indigo-50/80",
      border: "border-indigo-200",
      text: "text-indigo-800",
      accent: "bg-indigo-100 text-indigo-800"
    },
    accounts: [
      { id: "equity_group_header", code: "3000", name: "ইকুইটি / পুঁজি গ্রুপ", enName: "Equity Group", isSummary: true },
      { id: "capital_fund", code: "3001", name: "পুঁজি তহবিল (Cumulative Surplus)", enName: "Capital Fund" },
      { id: "retained_earnings", code: "3002", name: "বিধিবদ্ধ সংরক্ষিত তহবিল", enName: "Statutory Reserve Fund" },
      { id: "donor_grant", code: "3003", name: "অনুদন তহবিল (Donor Grant)", enName: "Donor Grant Fund" }
    ]
  },
  {
    id: "income",
    name: "পরিচালন ও অন্যান্য আয় খাত",
    enName: "Operating & Other Revenues",
    domain: "4xxx",
    colorTheme: {
      bg: "bg-amber-50/65",
      border: "border-amber-200",
      text: "text-amber-800",
      accent: "bg-amber-100 text-amber-800"
    },
    accounts: [
      { id: "income_group", code: "4000", name: "আয় গ্রুপ", enName: "Income Group", isSummary: true },
      { id: "operating_income_sum", code: "4100", name: "পরিচালন আয়", enName: "Operating Income", isSummary: true },
      { id: "service_charge", code: "4101", name: "ঋণের সার্ভিস চার্জ", enName: "Service Charge Income" },
      { id: "admission_fee", code: "4102", name: "সদস্য ভর্তি ফি", enName: "Admission Fee" },
      { id: "passbook_fee", code: "4103", name: "পাসবই ও ফর্ম বিক্রি", enName: "Passbook & Form Sale" },
      { id: "non_operating_income_sum", code: "4200", name: "অ-পরিচালন আয়", enName: "Non-Operating Income", isSummary: true },
      { id: "bank_interest", code: "4201", name: "ব্যাংক জমার উপর প্রাপ্ত সুদ", enName: "Interest on Bank Deposits" },
      { id: "misc_income", code: "4202", name: "বিবিধ আয়", enName: "Miscellaneous Income" }
    ]
  },
  {
    id: "expense",
    name: "পরিচালন ও প্রশাসনিক ব্যয় খাত",
    enName: "Operational Costs & Expenses",
    domain: "5xxx",
    colorTheme: {
      bg: "bg-rose-50/70",
      border: "border-rose-200",
      text: "text-rose-800",
      accent: "bg-rose-100 text-rose-800"
    },
    accounts: [
      { id: "expense_group", code: "5000", name: "ব্যয় গ্রুপ", enName: "Expenses Group", isSummary: true },
      { id: "financial_expenses_sum", code: "5100", name: "আর্থিক ব্যয়", enName: "Financial Expenses", isSummary: true },
      { id: "savings_interest", code: "5101", name: "সদস্য সঞ্চয়ের ওপর প্রদত্ত সুদ", enName: "Interest Paid on Savings" },
      { id: "loan_interest_exp", code: "5102", name: "ব্যাংক/PKSF ঋণের সুদ", enName: "Interest Paid on Bank/PKSF Loan" },
      { id: "admin_expenses_sum", code: "5200", name: "পরিচালন ও প্রশাসনিক ব্যয়", enName: "Operating & Admin Expenses", isSummary: true },
      { id: "staff_salaries", code: "5201", name: "কর্মকর্তা-কর্মচারীদের বেতন ও ভাতা", enName: "Salary & Allowances" },
      { id: "office_rent", code: "5202", name: "অফিস ভাড়া", enName: "Office Rent" },
      { id: "utilities_expense", code: "5203", name: "ইউটিলিটি বিল (বিদ্যুৎ, ইন্টারনেট)", enName: "Utilities" },
      { id: "travel_allowance", code: "5204", name: "যাতায়াত ও ভ্রমণ খরচ", enName: "Conveyance & Travel" },
      { id: "printing_stationery", code: "5205", name: "প্রিন্টিং ও স্টেশনারি", enName: "Printing & Stationery" },
      { id: "audit_fees", code: "5206", name: "অডিট ও আইনি ফি", enName: "Audit & Legal Fees" },
      { id: "other_expenses_sum", code: "5300", name: "অন্যান্য অ-পরিচালন ব্যয়", enName: "Other Expenses", isSummary: true },
      { id: "depreciation_expense", code: "5301", name: "স্থায়ী সম্পদের অবচয় খরচ", enName: "Depreciation Expense" },
      { id: "bad_debt", code: "5302", name: "কুঋণ অবলোপন", enName: "Bad Debt Written-off" }
    ]
  }
];
