import React from 'react';
import styles from './MatrixBackground.module.css';

const NUM_PATTERNS = 5;
const COLUMNS_PER_PATTERN = 40;

const MatrixBackground: React.FC = () => {
  return (
    <div className={styles.matrixContainer}>
      {Array.from({ length: NUM_PATTERNS }).map((_, patternIdx) => (
        <div className={styles.matrixPattern} key={patternIdx}>
          {Array.from({ length: COLUMNS_PER_PATTERN }).map((_, colIdx) => (
            <div
              className={styles.matrixColumn}
              key={colIdx}
              style={{ left: `${colIdx * 25}px` }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

export default MatrixBackground;


