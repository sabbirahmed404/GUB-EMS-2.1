import { createContext, useContext, useCallback, useState, useEffect } from 'react';

interface CacheData {
  [key: string]: {
    data: any;
    timestamp: number;
  };
}

interface CacheContextType {
  getData: (key: string) => any;
  setData: (key: string, data: any) => void;
  clearCache: () => void;
  invalidateCache: (key: string) => void;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

// Cache expiration time (30 minutes)
const CACHE_EXPIRATION = 30 * 60 * 1000;

// Memory cache storage
let memoryCache: CacheData = {};
const cacheInitTime = Date.now();

export function CacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<CacheData>(memoryCache);

  // Check for cache expiration every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      if (now - cacheInitTime > CACHE_EXPIRATION) {
        window.location.reload();
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  const getData = useCallback((key: string) => {
    return cache[key]?.data || null;
  }, [cache]);

  const setData = useCallback((key: string, data: any) => {
    setCache(prevCache => {
      const newCache = {
        ...prevCache,
        [key]: {
          data,
          timestamp: Date.now()
        }
      };
      memoryCache = newCache; // Update memory cache
      return newCache;
    });
  }, []);

  const clearCache = useCallback(() => {
    setCache({});
    memoryCache = {};
  }, []);

  const invalidateCache = useCallback((key: string) => {
    setCache(prevCache => {
      const { [key]: _, ...rest } = prevCache;
      memoryCache = rest; // Update memory cache
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