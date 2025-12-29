import { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Hook to listen to real-time market data from Firestore
 * @param {number} limitCount - Number of recent ticks to fetch
 * @returns {object} Market data and loading state
 */
export function useMarketData(limitCount = 50) {
  const [marketTicks, setMarketTicks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'market_ticks'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const ticks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMarketTicks(ticks);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching market data:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { marketTicks, loading, error };
}

/**
 * Hook to listen to real-time arbitrage opportunities
 * @param {string} status - Filter by status (optional)
 * @returns {object} Opportunities and loading state
 */
export function useOpportunities(status = null) {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let q = query(
      collection(db, 'opportunities'),
      orderBy('timestamp', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        let opps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Filter by status if provided
        if (status) {
          opps = opps.filter(opp => opp.status === status);
        }

        setOpportunities(opps);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching opportunities:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [status]);

  return { opportunities, loading, error };
}

/**
 * Hook to listen to audit logs
 * @param {number} limitCount - Number of recent logs to fetch
 * @returns {object} Audit logs and loading state
 */
export function useAuditLogs(limitCount = 50) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(
      collection(db, 'audit_logs'),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const logEntries = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLogs(logEntries);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error fetching audit logs:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [limitCount]);

  return { logs, loading, error };
}

