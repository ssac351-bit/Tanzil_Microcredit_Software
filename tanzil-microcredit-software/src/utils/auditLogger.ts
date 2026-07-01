/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface AuditLog {
  id: string;
  timestamp: string; // ISO String
  userId: string;
  userName: string;
  role: 'org_admin' | 'branch_manager' | 'staff' | 'super_admin' | string;
  branchCode?: string;
  action: string; // Action description in Bengali
  details: string; // Detailed description in Bengali
  category: 'branch' | 'staff' | 'member' | 'samity' | 'loan' | 'savings' | 'dps' | 'fdr' | 'config' | 'system';
}

export interface SystemNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  branchCode?: string;
}

export const logAuditEvent = (
  orgId: string,
  userId: string,
  userName: string,
  role: string,
  action: string,
  details: string,
  category: 'branch' | 'staff' | 'member' | 'samity' | 'loan' | 'savings' | 'dps' | 'fdr' | 'config' | 'system',
  branchCode?: string
) => {
  if (!orgId) return;

  try {
    const timestamp = new Date().toISOString();
    const newLog: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp,
      userId: userId || 'N/A',
      userName: userName || 'অজ্ঞাত ব্যবহারকারী',
      role,
      branchCode,
      action,
      details,
      category
    };

    // 1. Read existing audit logs
    const logsKey = `tanzil_audit_logs_${orgId}`;
    const existingLogs: AuditLog[] = JSON.parse(localStorage.getItem(logsKey) || '[]');
    
    // Prepend new log and keep maximum of 1000 logs locally
    const updatedLogs = [newLog, ...existingLogs].slice(0, 1000);
    localStorage.setItem(logsKey, JSON.stringify(updatedLogs));

    // 2. If it's a major event, also create a system alert notification
    const isCritical = ['system', 'branch', 'config'].includes(category) || 
                       action.includes('ক্লোজিং') || 
                       action.includes('ডিলিট') || 
                       action.includes('অনুমোদন') || 
                       action.includes('উত্তোলন') ||
                       action.includes('বিতরণ');

    if (isCritical) {
      const notifKey = `tanzil_notifications_${orgId}`;
      const existingNotifs: SystemNotification[] = JSON.parse(localStorage.getItem(notifKey) || '[]');
      
      const newNotif: SystemNotification = {
        id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        timestamp,
        title: action,
        message: details,
        type: action.includes('ডিলিট') || action.includes('বাতিল') || action.includes('ক্লোজিং') ? 'warning' : 'success',
        isRead: false,
        branchCode
      };

      const updatedNotifs = [newNotif, ...existingNotifs].slice(0, 500);
      localStorage.setItem(notifKey, JSON.stringify(updatedNotifs));
    }

    // Trigger local updates across active component panels
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('tanzil_audit_log_added', { detail: newLog }));
  } catch (err) {
    console.error('Failed to log audit event:', err);
  }
};
