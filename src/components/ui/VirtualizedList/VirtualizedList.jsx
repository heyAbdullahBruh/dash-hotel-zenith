import React, { useRef, useEffect, useState } from "react";
import styles from "./VirtualizedList.module.css";

const VirtualizedList = ({
  data = [],
  renderItem,
  itemHeight = 50,
  overscan = 5,
  className,
}) => {
  const containerRef = useRef(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerHeight, setContainerHeight] = useState(0);

  useEffect(() => {
    const calculateVisibleRange = () => {
      if (!containerRef.current) return;

      const { scrollTop, clientHeight } = containerRef.current;
      const start = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
      const end = Math.min(
        data.length,
        Math.ceil((scrollTop + clientHeight) / itemHeight) + overscan
      );

      setVisibleRange({ start, end });
      setContainerHeight(clientHeight);
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener("scroll", calculateVisibleRange);
      calculateVisibleRange(); // Initial calculation
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", calculateVisibleRange);
      }
    };
  }, [data.length, itemHeight, overscan]);

  const visibleItems = data.slice(visibleRange.start, visibleRange.end);
  const totalHeight = data.length * itemHeight;

  return (
    <div
      ref={containerRef}
      className={`${styles.virtualizedList} ${className}`}
      style={{ height: "100%", overflow: "auto" }}
    >
      <div style={{ height: totalHeight, position: "relative" }}>
        {visibleItems.map((item, index) => {
          const actualIndex = visibleRange.start + index;
          return (
            <div
              key={item.id || actualIndex}
              style={{
                position: "absolute",
                top: actualIndex * itemHeight,
                width: "100%",
                height: itemHeight,
              }}
            >
              {renderItem(item, actualIndex)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default VirtualizedList;
