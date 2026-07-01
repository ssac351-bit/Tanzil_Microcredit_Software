import { Holiday } from '../types';

export function getDefaultHolidays(orgId: string): Holiday[] {
  const currentDate = new Date().toISOString().split('T')[0];
  const list: Holiday[] = [
    {
      id: `${orgId}-H-general-1`,
      orgId: orgId,
      type: 'general',
      name: 'সাপ্তাহিক কর্মবিরতি (সাপ্তাহিক ছুটি)',
      dayOfWeek: 'শুক্রবার',
      addDate: currentDate
    },
    // --- 2026 Holidays ---
    {
      id: `${orgId}-H-2026-1`,
      orgId: orgId,
      type: 'direct',
      name: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস',
      date: '2026-02-21',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-2`,
      orgId: orgId,
      type: 'direct',
      name: 'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জন্মবার্ষিকী ও জাতীয় শিশু দিবস',
      date: '2026-03-17',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-3`,
      orgId: orgId,
      type: 'direct',
      name: 'স্বাধীনতা ও জাতীয় দিবস',
      date: '2026-03-26',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-4`,
      orgId: orgId,
      type: 'direct',
      name: 'বাংলা নববর্ষ (পহেলা বৈশাখ)',
      date: '2026-04-14',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-5`,
      orgId: orgId,
      type: 'direct',
      name: 'মে দিবস (শ্রমিক দিবস)',
      date: '2026-05-01',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-6`,
      orgId: orgId,
      type: 'direct',
      name: 'জাতীয় শোক দিবস',
      date: '2026-08-15',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-7`,
      orgId: orgId,
      type: 'direct',
      name: 'বিজয় দিবস (সরকারি ছুটি)',
      date: '2026-12-16',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-8`,
      orgId: orgId,
      type: 'direct',
      name: 'যীশু খ্রীষ্টের জন্মদিন (বড় দিন)',
      date: '2026-12-25',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-9`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (সম্ভাব্য)',
      date: '2026-03-20',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-10`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (২য় দিন)',
      date: '2026-03-21',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-11`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (৩য় দিন)',
      date: '2026-03-22',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-12`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (সম্ভাব্য)',
      date: '2026-05-27',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-13`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (২য় দিন)',
      date: '2026-05-28',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-14`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (৩য় দিন)',
      date: '2026-05-29',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-15`,
      orgId: orgId,
      type: 'direct',
      name: 'শ্রী শ্রী দুর্গাপূজা (বিজয়াদশমী)',
      date: '2026-10-20',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2026-16`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদে মিলাদুন্নবী (সা.)',
      date: '2026-08-25',
      addDate: currentDate
    },
    // --- 2027 Holidays ---
    {
      id: `${orgId}-H-2027-1`,
      orgId: orgId,
      type: 'direct',
      name: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস',
      date: '2027-02-21',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-2`,
      orgId: orgId,
      type: 'direct',
      name: 'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জন্মবার্ষিকী ও জাতীয় শিশু দিবস',
      date: '2027-03-17',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-3`,
      orgId: orgId,
      type: 'direct',
      name: 'স্বাধীনতা ও জাতীয় দিবস',
      date: '2027-03-26',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-4`,
      orgId: orgId,
      type: 'direct',
      name: 'বাংলা নববর্ষ (পহেলা বৈশাখ)',
      date: '2027-04-14',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-5`,
      orgId: orgId,
      type: 'direct',
      name: 'মে দিবস (শ্রমিক দিবস)',
      date: '2027-05-01',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-6`,
      orgId: orgId,
      type: 'direct',
      name: 'জাতীয় শোক দিবস',
      date: '2027-08-15',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-7`,
      orgId: orgId,
      type: 'direct',
      name: 'বিজয় দিবস (সরকারি ছুটি)',
      date: '2027-12-16',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-8`,
      orgId: orgId,
      type: 'direct',
      name: 'যীশু খ্রীষ্টের জন্মদিন (বড় দিন)',
      date: '2027-12-25',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-9`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (সম্ভাব্য)',
      date: '2027-03-09',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-10`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (২য় দিন)',
      date: '2027-03-10',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-11`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (৩য় দিন)',
      date: '2027-03-11',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-12`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (সম্ভাব্য)',
      date: '2027-05-16',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-13`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (২য় দিন)',
      date: '2027-05-17',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-14`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (৩য় দিন)',
      date: '2027-05-18',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-15`,
      orgId: orgId,
      type: 'direct',
      name: 'শ্রী শ্রী দুর্গাপূজা (বিজয়াদশমী)',
      date: '2027-10-09',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2027-16`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদে মিলাদুন্নবী (সা.)',
      date: '2027-08-14',
      addDate: currentDate
    },
    // --- 2028 Holidays ---
    {
      id: `${orgId}-H-2028-1`,
      orgId: orgId,
      type: 'direct',
      name: 'শহীদ দিবস ও আন্তর্জাতিক মাতৃভাষা দিবস',
      date: '2028-02-21',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-2`,
      orgId: orgId,
      type: 'direct',
      name: 'জাতির পিতা বঙ্গবন্ধু শেখ মুজিবুর রহমানের জন্মবার্ষিকী ও জাতীয় শিশু দিবস',
      date: '2028-03-17',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-3`,
      orgId: orgId,
      type: 'direct',
      name: 'স্বাধীনতা ও জাতীয় দিবস',
      date: '2028-03-26',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-4`,
      orgId: orgId,
      type: 'direct',
      name: 'বাংলা নববর্ষ (পহেলা বৈশাখ)',
      date: '2028-04-14',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-5`,
      orgId: orgId,
      type: 'direct',
      name: 'মে দিবস (শ্রমিক দিবস)',
      date: '2028-05-01',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-6`,
      orgId: orgId,
      type: 'direct',
      name: 'জাতীয় শোক দিবস',
      date: '2028-08-15',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-7`,
      orgId: orgId,
      type: 'direct',
      name: 'বিজয় দিবস (সরকারি ছুটি)',
      date: '2028-12-16',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-8`,
      orgId: orgId,
      type: 'direct',
      name: 'যীশু খ্রীষ্টের জন্মদিন (বড় দিন)',
      date: '2028-12-25',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-9`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (সম্ভাব্য)',
      date: '2028-02-27',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-10`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (২য় দিন)',
      date: '2028-02-28',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-11`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল ফিতর (৩য় দিন)',
      date: '2028-02-29',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-12`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (সম্ভাব্য)',
      date: '2028-05-04',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-13`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (২য় দিন)',
      date: '2028-05-05',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-14`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদুল আজহা (৩য় দিন)',
      date: '2028-05-06',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-15`,
      orgId: orgId,
      type: 'direct',
      name: 'শ্রী শ্রী দুর্গাপূজা (বিজয়াদশমী)',
      date: '2028-09-28',
      addDate: currentDate
    },
    {
      id: `${orgId}-H-2028-16`,
      orgId: orgId,
      type: 'direct',
      name: 'পবিত্র ঈদে মিলাদুন্নবী (সা.)',
      date: '2028-08-03',
      addDate: currentDate
    }
  ];
  return list;
}
