export function convertBanglaToEnglishNumber(str: string | number | undefined | null): string {
  if (str === null || str === undefined) return '';
  const banglaDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  const englishDigits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  let numStr = String(str);
  for (let i = 0; i < 10; i++) {
    const regex = new RegExp(banglaDigits[i], 'g');
    numStr = numStr.replace(regex, englishDigits[i]);
  }
  return numStr;
}

export function parseBanglaFloat(str: string | number | undefined | null, defaultValue = 0): number {
  if (str === null || str === undefined) return defaultValue;
  const cleaned = convertBanglaToEnglishNumber(str);
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? defaultValue : parsed;
}

export function parseBanglaInt(str: string | number | undefined | null, defaultValue = 0): number {
  if (str === null || str === undefined) return defaultValue;
  const cleaned = convertBanglaToEnglishNumber(str);
  const parsed = parseInt(cleaned, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}
