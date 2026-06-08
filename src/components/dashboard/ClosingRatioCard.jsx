import React from 'react';
import './ClosingRatioCard.css';

/**
 * ClosingRatioCard - Semi-circular doughnut progress card for "Closing Ratio"
 * Props:
 *   - percent (number): closing ratio percentage (0-100)
 *   - sold (number): cars sold
 *   - inquiries (number): total inquiries
 *   - inProgress (number): in-progress leads
 *   - pending (number): pending leads
 */
export default function ClosingRatioCard({ percent = 41, sold = 24, inquiries = 58 }) {
  // SVG arc math for a half-doughnut
  const radius = 60;
  const stroke = 18;
  const normalizedRadius = radius - stroke / 2;
  const startAngle = 180;
  const endAngle = 0;
  const angle = startAngle - (startAngle - endAngle) * (percent / 100);

  return (
    <div className="closing-ratio-card closing-ratio-simple">
      <div className="closing-ratio-svg-wrap">
        <svg
          width={radius * 2}
          height={radius + stroke}
          viewBox={`0 0 ${radius * 2} ${radius + stroke}`}
          className="closing-ratio-svg"
        >
          <defs>
            <linearGradient id="cr-gradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#e81c34" />
              <stop offset="100%" stopColor="#c0102b" />
            </linearGradient>
          </defs>
          {/* Background arc */}
          <path
            d={describeArc(radius, radius, normalizedRadius, 180, 0)}
            fill="none"
            stroke="#f0f1f3"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d={describeArc(radius, radius, normalizedRadius, 180, angle)}
            fill="none"
            stroke="url(#cr-gradient)"
            strokeWidth={stroke}
            strokeLinecap="round"
          />
        </svg>
        <div className="closing-ratio-center">
          <span className="closing-ratio-percent">{percent}%</span>
          <span className="closing-ratio-label">Closing Ratio</span>
        </div>
      </div>
      <div className="closing-ratio-bottom-count">
        <span className="sold-count">{sold} Sold</span>
        <span className="sep"> / </span>
        <span className="inquiries-count">{inquiries} Inquiries</span>
      </div>
    </div>
  );
}

// SVG arc helpers
function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const arcSweep = endAngle - startAngle <= 180 ? "0" : "1";
  return [
    "M", start.x, start.y,
    "A", r, r, 0, arcSweep, 0, end.x, end.y
  ].join(" ");
}
function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180.0;
  return {
    x: cx + (r * Math.cos(rad)),
    y: cy + (r * Math.sin(rad))
  };
}
