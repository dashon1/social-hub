import React, { createContext, useContext, useRef, useCallback } from "react";

const TabStateContext = createContext(null);

// Stores per-tab scroll positions so they survive tab switches
export function TabStateProvider({ children }) {
  const scrollPositions = useRef({});

  const saveScrollPosition = useCallback((pageName, position) => {
    scrollPositions.current[pageName] = position;
  }, []);

  const getScrollPosition = useCallback((pageName) => {
    return scrollPositions.current[pageName] || 0;
  }, []);

  return (
    <TabStateContext.Provider value={{ saveScrollPosition, getScrollPosition }}>
      {children}
    </TabStateContext.Provider>
  );
}

export function useTabState() {
  return useContext(TabStateContext);
}