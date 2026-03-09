export type RegistrationRecord = {
  id: string;
  country: string;
  userType: "student" | "graduate";
  createdAt: string;
};

export const AFRICAN_COUNTRIES = [
  "Algeria",
  "Angola",
  "Benin",
  "Botswana",
  "Burkina Faso",
  "Burundi",
  "Cabo Verde",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo",
  "DRC",
  "Djibouti",
  "Egypt",
  "Equatorial Guinea",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gabon",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Cote d'Ivoire",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Libya",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mauritius",
  "Morocco",
  "Mozambique",
  "Namibia",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Seychelles",
  "Sierra Leone",
  "Somalia",
  "South Africa",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Tunisia",
  "Uganda",
  "Zambia",
  "Zimbabwe",
];

const STORAGE_KEY = "bebrivus.registrationRecords";
const EVENT_NAME = "registration-records-updated";

export const getRegistrationRecords = (): RegistrationRecord[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as RegistrationRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveRegistrationRecord = (record: RegistrationRecord) => {
  if (typeof window === "undefined") return;
  const existing = getRegistrationRecords();
  const updated = [record, ...existing];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const getRegistrationCountsByCountry = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  for (const country of AFRICAN_COUNTRIES) {
    counts[country] = 0;
  }

  const records = getRegistrationRecords();
  records.forEach((record) => {
    if (record.userType !== "student" && record.userType !== "graduate") return;
    const current = counts[record.country] ?? 0;
    counts[record.country] = current + 1;
  });

  return counts;
};

export const subscribeToRegistrationCounts = (callback: () => void) => {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleCustom = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(EVENT_NAME, handleCustom);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(EVENT_NAME, handleCustom);
  };
};
