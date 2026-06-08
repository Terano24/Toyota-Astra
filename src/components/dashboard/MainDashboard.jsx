import React from 'react';
import './MainDashboard.css';
import ClosingRatioProgress from './ClosingRatioProgress';

// Modular Card Component
const StatCard = ({ title, value, subtitle, gradient, children }) => (
  <div className="stat-card" style={{ background: gradient }}>
    <div className="stat-card-header">
      <span className="stat-card-title">{title}</span>
    </div>
    <div className="stat-card-value">{value}</div>
    {subtitle && <div className="stat-card-subtitle">{subtitle}</div>}
    {children}
  </div>
);

const gradient =
  'linear-gradient(135deg, #e81c34 0%, #c0102b 100%)';

const MainDashboard = () => {
  // Placeholder values for now; integrate real data later
  return (
    <div className="main-dashboard-bg">
      <div className="dashboard-grid">
        <div className="dashboard-grid--span2">
          <ClosingRatioProgress percent={41} sold={24} inProgress={12} pending={22} inquiries={58} />
        </div>
        <StatCard title="Ongoing Inquiries" value="18" subtitle="Active this month" gradient={gradient} />
        <StatCard title="Sales Target vs Actual" value="32 / 24" subtitle="Target / Actual" gradient={gradient} />
        <StatCard title="Cars Sold This Month" value="24" subtitle="Up 5 from last month" gradient={gradient} />
        <StatCard title="Leads Connected" value="40" subtitle="10 new this week" gradient={gradient} />
        <StatCard title="New Leads" value="7" subtitle="Filtered by last contact" gradient={gradient} />
        <StatCard title="Lost / Won" value="3 / 21" subtitle="Lost / Won this month" gradient={gradient} />
        <StatCard title="Hot/Featured Inventory" value="4" subtitle="Hot cars now" gradient={gradient} />
        <StatCard title="Available Inventory" value="36" subtitle="On lot" gradient={gradient} />
        <StatCard title="Dealership Sales vs Target" value="$520k / $600k" subtitle="Current / Target" gradient={gradient} />
      </div>
    </div>
  );
};

export default MainDashboard;
