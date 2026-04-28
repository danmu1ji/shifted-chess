import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

function normalizeDatabaseUrl(rawUrl, projectId) {
  const value = (rawUrl || '').trim();

  if (!value && projectId) {
    return `https://${projectId}-default-rtdb.firebaseio.com`;
  }

  let url = value;
  if (url && !/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('.firebasedatabase.app')) {
      parsed.hostname = parsed.hostname.replace(
        '.firebasedatabase.app',
        '.firebaseio.com',
      );
    }
    return parsed.toString().replace(/\/$/, '');
  } catch {
    if (projectId) {
      return `https://${projectId}-default-rtdb.firebaseio.com`;
    }
    throw new Error(
      'Invalid Firebase Database URL. Set VITE_FIREBASE_DATABASE_URL to a valid RTDB URL.',
    );
  }
}

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: normalizeDatabaseUrl(
    import.meta.env.VITE_FIREBASE_DATABASE_URL,
    projectId,
  ),
  projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
