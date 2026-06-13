import React, { useState, useRef, useCallback } from "react";
import { RefreshCw } from "lucide-react";

export default function PullToRefresh({ onRefresh, children }) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const isPulling = useRef(false);
  const threshold = 80;

  const getScrollParent = (node) => {
    if (!node) return null;
    let parent = node.parentElement;
    while (parent) {
      const { overflow, overflowY } = window.getComputedStyle(parent);
      if (/(auto|scroll)/.test(overflow + overflowY)) return parent;
      parent = parent.parentElement;
    }
    return document.documentElement;
  };

  const containerRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    const scrollParent = getScrollParent(containerRef.current);
    const scrollTop = scrollParent ? scrollParent.scrollTop : 0;
    if (scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
      isPulling.current = true;
    }
  }, []);

  const handleTouchMove = useCallback(
    (e) => {
      if (!isPulling.current || refreshing) return;
      const currentY = e.touches[0].clientY;
      const diff = Math.max(0, currentY - startY.current);
      if (diff > 10) {
        e.preventDefault();
      }
      setPullDistance(Math.min(diff * 0.4, 120));
    },
    [refreshing]
  );

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      setPullDistance(threshold);
      try {
        await onRefresh();
      } finally {
        setRefreshing(false);
      }
    }
    isPulling.current = false;
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative"
      style={{ overscrollBehaviorY: "none" }}
    >
      <div
        className="flex items-center justify-center overflow-hidden transition-all duration-200 pointer-events-none"
        style={{ height: pullDistance > 0 ? pullDistance : 0 }}
      >
        <RefreshCw
          className={`w-6 h-6 text-blue-500 dark:text-blue-400 transition-transform select-none ${
            refreshing ? "animate-spin" : ""
          }`}
          style={{
            transform: `rotate(${(pullDistance / threshold) * 360}deg)`,
            opacity: Math.min(pullDistance / threshold, 1),
          }}
        />
      </div>
      {children}
    </div>
  );
}