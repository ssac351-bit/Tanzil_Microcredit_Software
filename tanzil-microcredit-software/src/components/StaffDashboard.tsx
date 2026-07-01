import React, { useState, useEffect } from 'react';
import { Organization, Staff, Group, Member } from '../types';
import { LayoutDashboard, Users, CreditCard, LogOut, Loader, BarChart3, Database, FileText, ArrowLeftRight } from 'lucide-react';
import { DailyStatsList } from './DailyStatsList';
import { UnifiedReportsPanel } from './UnifiedReportsPanel';
import { RealizedInformationView } from './RealizedInformationView';

interface StaffDashboardProps {
  org: Organization;
  staff: Staff;
  onLogout: () => void;
}

export default function StaffDashboard({ org, staff, onLogout }: StaffDashboardProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [dailyTxs, setDailyTxs] = useState<any[]>([]);
  const [syncedCount, setSyncedCount] = useState(0);
  const [unsyncedCount, setUnsyncedCount] = useState(0);
  const [activeView, setActiveView] = useState<'dashboard' | 'stats' | 'reports' | 'realized_info'>('dashboard');

  const branchId = staff.branchId || 'default';
  const workingDayKey = `tanzil_working_day_${org.id}_branch_${branchId}`;
  const workingDay = localStorage.getItem(workingDayKey) || new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Load groups and members from storage (Tanzil pattern)
    const allGroups: Group[] = JSON.parse(localStorage.getItem(`tanzil_groups_${org.id}`) || '[]');
    const allMembers: Member[] = JSON.parse(localStorage.getItem(`tanzil_group_members_${org.id}`) || '[]');

    // Filter by assigned staff ID
    const myGroups = allGroups.filter(g => g.assignedStaffId === staff.id);
    const myGroupIds = myGroups.map(g => g.id);
    const myMembers = allMembers.filter(m => m.groupId && myGroupIds.includes(m.groupId));

    // Stats data (from SyncStatusHub logic)
    const wDay = workingDay;
    const activeBranchKey = `tanzil_bm_tx_${org.id}_${staff.branchId || 'default-branch'}`;
    const branchTxs = JSON.parse(localStorage.getItem(activeBranchKey) || '[]');
    const todayCollections = branchTxs.filter((tx: any) => tx.date === wDay && tx.type === 'collection');
    
    setDailyTxs(todayCollections);
    setSyncedCount(todayCollections.filter((tx: any) => tx.synced === true).length);
    setUnsyncedCount(todayCollections.filter((tx: any) => tx.synced !== true).length);

    setGroups(myGroups);
    setMembers(myMembers);
    setLoading(false);
  }, [org.id, staff.id]);

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader className="animate-spin text-blue-600" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
          <p className="text-gray-600">{staff.name} ({staff.designation})</p>
        </div>
        <div className="flex gap-2">
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 ${activeView === 'dashboard' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-700'} rounded-lg hover:opacity-90 transition-colors cursor-pointer text-xs`}
            >
              <LayoutDashboard size={16}/>
              <span>ড্যাশবোর্ড</span>
            </button>
            <button 
              onClick={() => setActiveView('stats')}
              className={`flex items-center gap-2 px-4 py-2 ${activeView === 'stats' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-700'} rounded-lg hover:opacity-90 transition-colors cursor-pointer text-xs`}
            >
              <BarChart3 size={16} />
              <span>পরিসংখ্যান</span>
            </button>
            <button 
              onClick={() => setActiveView('reports')}
              className={`flex items-center gap-2 px-4 py-2 ${activeView === 'reports' ? 'bg-blue-600 text-white font-bold' : 'bg-gray-100 text-gray-700'} rounded-lg hover:opacity-90 transition-colors cursor-pointer text-xs`}
            >
              <FileText size={16} />
              <span>রিপোর্টস</span>
            </button>
            <button 
              onClick={() => setActiveView('realized_info')}
              className={`flex items-center gap-2 px-4 py-2 ${activeView === 'realized_info' ? 'bg-amber-600 text-white font-bold' : 'bg-gray-100 text-gray-700'} rounded-lg hover:opacity-90 transition-colors cursor-pointer text-xs`}
            >
              <ArrowLeftRight size={16} />
              <span>সঞ্চয় ফেরত ও সমন্বয়</span>
            </button>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors cursor-pointer text-xs font-bold"
            >
              <LogOut size={16} />
              <span>লগআউট</span>
            </button>
        </div>
      </header>
      
      {activeView === 'dashboard' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users size={20} className="text-blue-600" /> আপনার গ্রুপসমূহ ({groups.length})
            </h2>
            {groups.length === 0 ? <p className="text-gray-500">কোন গ্রুপ বরাদ্দ নেই।</p> : (
                <ul className="space-y-2">
                {groups.map(g => (
                    <li key={g.id} className="p-3 bg-gray-50 rounded border border-gray-100">{g.name} (কোড: {g.code})</li>
                ))}
                </ul>
            )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <CreditCard size={20} className="text-green-600" /> আপনার মেম্বার সংখ্যা ({members.length})
            </h2>
            {members.length === 0 ? <p className="text-gray-500">কোন সদস্য নেই।</p> : (
                <p className="text-3xl font-bold text-gray-800">{members.length} জন</p>
            )}
            </div>
        </div>
      )}

      {activeView === 'stats' && (
        <div className="w-full max-w-lg mx-auto">
            <DailyStatsList dailyTxs={dailyTxs} syncedCount={syncedCount} unsyncedCount={unsyncedCount} />
        </div>
      )}

      {activeView === 'reports' && (
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs">
          <UnifiedReportsPanel
            org={org}
            currentStaff={staff}
            branchId={staff.branchId}
            workingDay={workingDay}
          />
        </div>
      )}

      {activeView === 'realized_info' && (
        <div className="bg-white p-0 rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <RealizedInformationView
            org={org}
            staff={staff}
            branchId={staff.branchId}
            workingDay={workingDay}
            mode="refund"
          />
        </div>
      )}
    </div>
  );
}
