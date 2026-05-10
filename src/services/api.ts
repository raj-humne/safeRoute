import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface Report {
  id: string;
  userId: string;
  type: 'danger' | 'safety';
  category: string;
  severity: number;
  description: string;
  latitude: number;
  longitude: number;
  timestamp: string;
}

export const submitReport = async (userId: string, reportData: any) => {
  const path = "reports";
  try {
    const report = {
      ...reportData,
      userId,
      reportId: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
    };
    return await addDoc(collection(db, path), report);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};

export const getReports = (callback: (reports: Report[]) => void) => {
  const path = "reports";
  const q = query(collection(db, path), orderBy("timestamp", "desc"));
  return onSnapshot(q, (snapshot) => {
    const reports = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Report));
    callback(reports);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, path);
  });
};

export const fetchSafestRoute = async (start: { lat: number; lng: number }, end: { lat: number; lng: number }, reports: Report[]) => {
  try {
    const response = await fetch("/api/route/safest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ start, end, safetyReports: reports })
    });
    return await response.json();
  } catch (error) {
    console.error("Routing error:", error);
    return null;
  }
};

export const triggerSOS = async (userId: string, lat: number, lng: number) => {
  const path = "sos_events";
  try {
    return await addDoc(collection(db, path), {
      userId,
      latitude: lat,
      longitude: lng,
      timestamp: new Date().toISOString(),
      status: 'active'
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
};
