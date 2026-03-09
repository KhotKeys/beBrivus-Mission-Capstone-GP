// Re-export all API modules
export * from './auth';
export * from './opportunities';
export * from './mentors';
export * from './applications';
export * from './resources';
export * from './forum';
export * from './gamification';
export * from './messaging';
export * from './notifications';
export * from './institution';

// Export the main API client as 'api' for backward compatibility
export { default as api } from './client';
