'use client';
import { useEffect, useState } from 'react';
import styles from './Heatmap.module.css';

export default function Heatmap() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Generate mock data for the last 365 days
    const mockData = [];
    for (let i = 0; i < 365; i++) {
      // Randomly assign intensity level (0-4)
      const level = Math.random() > 0.3 ? Math.floor(Math.random() * 4) + 1 : 0;
      mockData.push(level);
    }
    setData(mockData);
  }, []);

  const getCellClass = (level) => {
    switch (level) {
      case 1: return styles.level1;
      case 2: return styles.level2;
      case 3: return styles.level3;
      case 4: return styles.level4;
      default: return '';
    }
  };

  return (
    <div className={styles.heatmapContainer}>
      <div className={styles.header}>
        <div className={styles.title}>891 contributions in the last year</div>
        <div className={styles.yearSelect}>2026</div>
      </div>
      
      <div className={styles.gridWrapper}>
        <div className={styles.grid}>
          {data.map((level, i) => (
            <div 
              key={i} 
              className={`${styles.cell} ${getCellClass(level)}`}
              title={`Level ${level} footprint`}
            ></div>
          ))}
        </div>
      </div>

      <div className={styles.legend}>
        <span>Less</span>
        <div className={styles.cell}></div>
        <div className={`${styles.cell} ${styles.level1}`}></div>
        <div className={`${styles.cell} ${styles.level2}`}></div>
        <div className={`${styles.cell} ${styles.level3}`}></div>
        <div className={`${styles.cell} ${styles.level4}`}></div>
        <span>More</span>
      </div>
    </div>
  );
}
