import { createContext, useContext, useCallback, useState, useEffect } from 'react';

interface CacheData {
  [key: string]: {
    data: any;
    timestamp: number;
    expiresIn?: number; // Optional expiration time in milliseconds
  };
}

interface CacheContextType {
  getData: (key: string) => any;
  setData: (key: string, data: any, expiresIn?: number) => void;
  clearCache: () => void;
  invalidateCache: (key: string) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Default cache expiration time (30 minutes)
const DEFAULT_CACHE_EXPIRATION = 30 * 60 * 1000;

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<CacheData>({});

  // Clean expired cache entries every minute
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setCache(prevCache => {
        const now = Date.now();
        const newCache = { ...prevCache };
        let hasChanges = false;

        Object.entries(newCache).forEach(([key, entry]) => {
          const expirationTime = entry.timestamp + (entry.expiresIn || DEFAULT_CACHE_EXPIRATION);
          if (now >= expirationTime) {
            delete newCache[key];
            hasChanges = true;
          }
        });

        return hasChanges ? newCache : prevCache;
      });
    }, 60000);

    return () => clearInterval(cleanupInterval);
  }, []);

  const getData = useCallback((key: string) => {
    const entry = cache[key];
    if (!entry) return null;

    const now = Date.now();
    const expirationTime = entry.timestamp + (entry.expiresIn || DEFAULT_CACHE_EXPIRATION);

    if (now >= expirationTime) {
      // Remove expired entry
      setCache(prevCache => {
        const { [key]: _, ...rest } = prevCache;
        return rest;
      });
      return null;
    }

    return entry.data;
  }, [cache]);

  const setData = useCallback((key: string, data: any, expiresIn?: number) => {
    setCache(prevCache => ({
      ...prevCache,
      [key]: {
        data,
        timestamp: Date.now(),
        expiresIn
      }
    }));
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  const invalidateCache = useCallback((key: string) => {
    setCache(prevCache => {
      const { [key]: _, ...rest } = prevCache;
      return rest;
    });
  }, []);

  return (
    <CacheContext.Provider value={{ getData, setData, clearCache, invalidateCache }}>
      {children}
    </CacheContext.Provider>
  );
}

export function useCache() {
  const context = useContext(CacheContext);
  if (context === undefined) {
    throw new Error('useCache must be used within a CacheProvider');
  }
  return context;
} 