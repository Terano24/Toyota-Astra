import React from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './ClosingRatioProgress.css';

/**
 * ClosingRatioProgress - 3-segment doughnut progress for "Closing Ratio"
 * Props:
 *   - percent (number): closing ratio percentage (0-100)
 *   - sold (number): cars sold
 *   - inProgress (number): in-progress leads
 *   - pending (number): pending leads
 */
export default function ClosingRatioProgress({ percent = 41, sold = 24, inquiries = 58 }) {
  return (
    <div className="crp-card crp-card-large">
      <div className="crp-doughnut-wrap crp-doughnut-large">
        <CircularProgressbar
          value={percent}
          text={`${percent}%`}
          strokeWidth={14}
          styles={buildStyles({
            pathColor: '#e81c34',
            trailColor: '#e0e0e0',
            textColor: '#222',
            textSize: '2rem',
            pathTransitionDuration: 0.6,
          })}
        />
      </div>
      <div className="crp-center-label">Closing Ratio</div>
      <div className="crp-bottom-count">
        <span className="crp-sold">{sold} Sold</span>
        <span className="crp-sep"> / </span>
        <span className="crp-inquiries">{inquiries} Inquiries</span>
      </div>
    </div>
  );
}
