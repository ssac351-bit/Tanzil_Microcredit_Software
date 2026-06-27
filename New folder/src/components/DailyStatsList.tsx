
import React from 'react';

interface DailyStatsListProps {
  dailyTxs: any[];
  syncedCount: number;
  unsyncedCount: number;
}

export const DailyStatsList: React.FC<DailyStatsListProps> = ({ dailyTxs, syncedCount, unsyncedCount }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">আজকের পরিসংখ্যান</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-600">মোট লেনদেন</p>
          <p className="text-2xl font-bold text-blue-900">{dailyTxs.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-600">Synced</p>
          <p className="text-2xl font-bold text-green-900">{syncedCount}</p>
        </div>
        <div className="p-4 bg-amber-50 rounded-lg">
          <p className="text-sm text-amber-600">Unsynced</p>
          <p className="text-2xl font-bold text-amber-900">{unsyncedCount}</p>
        </div>
      </div>
    </div>
  );
};
