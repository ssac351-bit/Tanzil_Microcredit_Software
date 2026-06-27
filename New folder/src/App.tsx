/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Organization, Staff } from './types';
import LoginScreen from './components/LoginScreen';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import OrgAdminDashboard from './components/OrgAdminDashboard';
import BranchManagerDashboard from './components/BranchManagerDashboard';
import StaffDashboard from './components/StaffDashboard';
import { db } from './lib/firebase';
import { collection, getDocs, doc, setDoc, deleteDoc, getDocFromServer } from 'firebase/firestore';

export default function App() {
  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return localStorage.getItem('tanzil_session_loggedIn') === 'true';
  });
  const [userRole, setUserRole] = useState<'super_admin' | 'org_admin' | 'bm' | 'staff' | null>(() => {
    return (localStorage.getItem('tanzil_session_role') as any) || null;
  });
  const [activeOrg, setActiveOrg] = useState<Organization | null>(() => {
    const saved = localStorage.getItem('tanzil_session_activeOrg');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeStaff, setActiveStaff] = useState<Staff | null>(() => {
    const saved = localStorage.getItem('tanzil_session_activeStaff');
    return saved ? JSON.parse(saved) : null;
  });

  // Organizations registry
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  // Ref to track previous organization list for syncing with Firestore
  const prevOrgsRef = useRef<Organization[]>([]);

  // Fetch organizations from Firestore and merge with localStorage to prevent data loss
  useEffect(() => {
    async function fetchOrganizations() {
      setLoadingOrgs(true);
      console.log("Fetching organizations from Firestore...");
      try {
        const querySnapshot = await getDocs(collection(db, 'Organizations'));
        const orgs = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Organization));
        console.log("Fetched organizations:", orgs);
        
        // Merge with existing local storage organizations so the user keeps current NGOs
        const localSaved = localStorage.getItem('tanzil_orgs');
        const localOrgs: Organization[] = localSaved ? JSON.parse(localSaved) : [];
        
        const mergedMap = new Map<string, Organization>();
        localOrgs.forEach(o => mergedMap.set(o.id, o));
        orgs.forEach(o => mergedMap.set(o.id, o));
        
        const finalOrgs = Array.from(mergedMap.values());
        setOrganizations(finalOrgs);
        prevOrgsRef.current = finalOrgs;
        localStorage.setItem('tanzil_orgs', JSON.stringify(finalOrgs));

        // Dynamically refresh the logged-in session of activeOrg with freshest Firestore/Local merged data
        const sessionActiveOrg = localStorage.getItem('tanzil_session_activeOrg');
        if (sessionActiveOrg) {
          const parsedSessionOrg = JSON.parse(sessionActiveOrg);
          const freshOrg = finalOrgs.find(o => o.id === parsedSessionOrg.id);
          if (freshOrg) {
            setActiveOrg(freshOrg);
            localStorage.setItem('tanzil_session_activeOrg', JSON.stringify(freshOrg));
          }
        }
      } catch (error) {
        console.error("Error fetching organizations from Firestore: ", error);
        // Fallback to local storage
        const localSaved = localStorage.getItem('tanzil_orgs');
        if (localSaved) {
          const parsed = JSON.parse(localSaved);
          setOrganizations(parsed);
          prevOrgsRef.current = parsed;

          const sessionActiveOrg = localStorage.getItem('tanzil_session_activeOrg');
          if (sessionActiveOrg) {
            const parsedSessionOrg = JSON.parse(sessionActiveOrg);
            const freshOrg = parsed.find((o: any) => o.id === parsedSessionOrg.id);
            if (freshOrg) {
              setActiveOrg(freshOrg);
              localStorage.setItem('tanzil_session_activeOrg', JSON.stringify(freshOrg));
            }
          }
        }
      } finally {
        setLoadingOrgs(false);
        console.log("Loading organizations finished.");
      }
    }
    fetchOrganizations();
  }, []);

  // Sync organizations with Firestore and localStorage on any changes
  useEffect(() => {
    if (organizations.length === 0 && prevOrgsRef.current.length === 0) return;

    localStorage.setItem('tanzil_orgs', JSON.stringify(organizations));

    const prev = prevOrgsRef.current;
    
    // Deleted organizations: present in prev, but not in current
    const deleted = prev.filter(p => !organizations.some(c => c.id === p.id));
    // Added or updated organizations: present in current, and (either not in prev or modified)
    const savedOrUpd = organizations.filter(c => {
      const pMatch = prev.find(p => p.id === c.id);
      if (!pMatch) return true; // new
      return JSON.stringify(pMatch) !== JSON.stringify(c); // updated
    });

    async function syncChanges() {
      try {
        for (const org of deleted) {
          await deleteDoc(doc(db, 'Organizations', org.id));
        }
        for (const org of savedOrUpd) {
          await setDoc(doc(db, 'Organizations', org.id), org);
        }
      } catch (err) {
        console.error("Error syncing organizations to Firestore:", err);
      }
    }

    if (deleted.length > 0 || savedOrUpd.length > 0) {
      syncChanges();
    }
    
    prevOrgsRef.current = organizations;
  }, [organizations]);

  // Handle successful login
  const handleLoginSuccess = (role: 'super_admin' | 'org_admin' | 'bm' | 'staff', activeOrganization?: Organization, matchedStaff?: Staff) => {
    setUserRole(role);
    localStorage.setItem('tanzil_session_role', role);
    if (role === 'org_admin' && activeOrganization) {
      setActiveOrg(activeOrganization);
      localStorage.setItem('tanzil_session_activeOrg', JSON.stringify(activeOrganization));
      setActiveStaff(null);
      localStorage.removeItem('tanzil_session_activeStaff');
    } else if ((role === 'bm' || role === 'staff') && activeOrganization && matchedStaff) {
      setActiveOrg(activeOrganization);
      localStorage.setItem('tanzil_session_activeOrg', JSON.stringify(activeOrganization));
      setActiveStaff(matchedStaff);
      localStorage.setItem('tanzil_session_activeStaff', JSON.stringify(matchedStaff));
    } else {
      setActiveOrg(null);
      localStorage.removeItem('tanzil_session_activeOrg');
      setActiveStaff(null);
      localStorage.removeItem('tanzil_session_activeStaff');
    }
    setIsLoggedIn(true);
    localStorage.setItem('tanzil_session_loggedIn', 'true');
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveOrg(null);
    setActiveStaff(null);
    localStorage.removeItem('tanzil_session_loggedIn');
    localStorage.removeItem('tanzil_session_role');
    localStorage.removeItem('tanzil_session_activeOrg');
    localStorage.removeItem('tanzil_session_activeStaff');
  };

  const handleUpdateOrg = (updatedOrg: Organization) => {
    setActiveOrg(updatedOrg);
    localStorage.setItem('tanzil_session_activeOrg', JSON.stringify(updatedOrg));
    setOrganizations(prev => prev.map(o => o.id === updatedOrg.id ? updatedOrg : o));
  };

  // ROUTER CONTROLS
  if (isLoggedIn) {
    if (userRole === 'super_admin') {
      return (
        <SuperAdminDashboard 
          organizations={organizations}
          setOrganizations={setOrganizations}
          onLogout={handleLogout}
        />
      );
    } else if (userRole === 'org_admin' && activeOrg) {
      return (
        <OrgAdminDashboard 
          org={activeOrg}
          onLogout={handleLogout}
          onUpdateOrg={handleUpdateOrg}
        />
      );
    } else if (userRole === 'bm' && activeOrg && activeStaff) {
      return (
        <BranchManagerDashboard
          org={activeOrg}
          staff={activeStaff}
          onLogout={handleLogout}
        />
      );
    } else if (userRole === 'staff' && activeOrg && activeStaff) {
      return (
        <BranchManagerDashboard
          org={activeOrg}
          staff={activeStaff}
          onLogout={handleLogout}
        />
      );
    }
  }

  // Fallback to beautiful dual Login Screen
  if (loadingOrgs) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold">সিস্টেম লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  return (
    <LoginScreen 
      organizations={organizations}
      onLoginSuccess={handleLoginSuccess}
    />
  );
}
