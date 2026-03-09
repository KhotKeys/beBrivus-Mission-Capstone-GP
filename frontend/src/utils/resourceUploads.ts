export type UploadedResource = {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "video" | "document" | "image" | "other";
  category: string;
  tags: string[];
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
};

const STORAGE_KEY = "bebrivus.uploadedResources";
const EVENT_NAME = "resource-uploads-updated";

export const getUploadedResources = (): UploadedResource[] => {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw) as UploadedResource[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveUploadedResource = (resource: UploadedResource) => {
  if (typeof window === "undefined") return;
  const existing = getUploadedResources();
  const updated = [resource, ...existing];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(EVENT_NAME));
};

export const subscribeToUploadedResources = (callback: () => void) => {
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
