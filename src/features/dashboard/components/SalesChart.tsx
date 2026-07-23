import React, { useState } from 'react';
import type { SalesDataPoint } from '../types/dashboard.types';
import { BarChart2, LineChart, Info } from 'lucide-react';

interface SalesChartProps {
  salesData: SalesDataPoint[] | null | undefined;
  isLoading: boolean;
}

export const SalesChart: React.FC<SalesChartProps> = ({ salesData, isLoading }) => {
  const [chartType, setChartType] = useState<'line' | 'bar'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  if (isLoading || !salesData || salesData.length === 0) {
    return (
      <div style={styles.chartCard} className="glass-panel">
        <div style={styles.header}>
          <h3 style={styles.title}>Weekly Sales Performance</h3>
        </div>
        <div style={styles.loadingContainer} className="loading-shimmer">
          <div style={styles.chartSkeleton} />
        </div>
      </div>
    );
  }

  const handleTimeRangeChange = (range: '7d' | '30d') => {
    if (range === '30d') {
      alert('30-day analytics charts will be unlocked in later phases when transactional history is populated.');
      return;
    }
    setTimeRange(range);
  };

  // Dimensions for SVG mapping
  const width = 560;
  const height = 180;
  const paddingX = 45;
  const paddingY = 25;

  const maxAmount = Math.max(...salesData.map((d) => d.amount), 1000);
  const minAmount = 0; // standard baseline
  const amountRange = maxAmount - minAmount;

  // Calculate coordinates
  const points = salesData.map((d, index) => {
    const x = paddingX + (index * (width - paddingX * 2)) / (salesData.length - 1);
    // Inverse y for SVG origin (top-left)
    const y = height - paddingY - ((d.amount - minAmount) / amountRange) * (height - paddingY * 2);
    return { x, y, data: d };
  });

  // SVG Line path string
  const linePath = points.map((p, idx) => `${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

  // SVG Area path string (goes to bottom baseline)
  const areaPath = points.length > 0 
    ? `${linePath} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
    : '';

  return (
    <div style={styles.chartCard} className="glass-panel animate-fade-in">
      <div style={styles.header}>
        <div style={styles.headerTextGroup}>
          <h3 style={styles.title}>Sales Analytics</h3>
          <span style={styles.subtitle}>Daily credit sales totals</span>
        </div>

        <div style={styles.controls}>
          {/* Chart Type Toggle */}
          <div style={styles.segmentedControl}>
            <button
              onClick={() => setChartType('line')}
              style={{
                ...styles.segmentedBtn,
                backgroundColor: chartType === 'line' ? 'var(--primary)' : 'transparent',
                color: chartType === 'line' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <LineChart size={14} />
            </button>
            <button
              onClick={() => setChartType('bar')}
              style={{
                ...styles.segmentedBtn,
                backgroundColor: chartType === 'bar' ? 'var(--primary)' : 'transparent',
                color: chartType === 'bar' ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              <BarChart2 size={14} />
            </button>
          </div>

          {/* Time range selector */}
          <div style={styles.rangeControl}>
            <button
              onClick={() => handleTimeRangeChange('7d')}
              style={{
                ...styles.rangeBtn,
                backgroundColor: timeRange === '7d' ? 'var(--bg-secondary)' : 'transparent',
                borderColor: timeRange === '7d' ? 'var(--primary)' : 'transparent',
                color: timeRange === '7d' ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              7 Days
            </button>
            <button
              onClick={() => handleTimeRangeChange('30d')}
              style={{
                ...styles.rangeBtn,
                backgroundColor: timeRange === '30d' ? 'var(--bg-secondary)' : 'transparent',
                borderColor: timeRange === '30d' ? 'var(--primary)' : 'transparent',
                color: timeRange === '30d' ? 'var(--primary)' : 'var(--text-muted)',
              }}
            >
              30 Days
            </button>
          </div>
        </div>
      </div>

      <div style={styles.svgWrapper}>
        <svg viewBox={`0 0 ${width} ${height}`} style={styles.svg}>
          {/* Define gradients for premium area glow */}
          <defs>
            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.5, 1].map((val, idx) => {
            const yGrid = height - paddingY - val * (height - paddingY * 2);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={yGrid}
                  x2={width - paddingX}
                  y2={yGrid}
                  stroke="var(--border-color)"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                />
                <text
                  x={paddingX - 10}
                  y={yGrid + 4}
                  textAnchor="end"
                  style={styles.axisLabel}
                >
                  ₹{new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(minAmount + val * amountRange)}
                </text>
              </g>
            );
          })}

          {/* Render Area Glow */}
          {chartType === 'line' && areaPath && (
            <path d={areaPath} fill="url(#chartGlow)" />
          )}

          {/* Render Line Graph */}
          {chartType === 'line' && linePath && (
            <path
              d={linePath}
              fill="none"
              stroke="var(--primary)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Render Bar Graph */}
          {chartType === 'bar' &&
            points.map((p, idx) => {
              const barWidth = 18;
              const barHeight = height - paddingY - p.y;
              return (
                <g key={idx}>
                  <rect
                    x={p.x - barWidth / 2}
                    y={p.y}
                    width={barWidth}
                    height={Math.max(barHeight, 4)} // minimum height of 4px for visual feedback
                    fill="var(--primary)"
                    rx="3"
                    style={{ transition: 'all var(--transition-fast)' }}
                  />
                </g>
              );
            })}

          {/* Data Points / Vertices */}
          {points.map((p, idx) => (
            <g key={idx} style={{ cursor: 'pointer' }}>
              {chartType === 'line' && (
                <>
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="5"
                    fill="var(--bg-secondary)"
                    stroke="var(--primary)"
                    strokeWidth="3"
                  />
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r="9"
                    fill="var(--primary)"
                    opacity="0"
                    className="chart-hover-ring"
                    style={{ transition: 'opacity 0.2s' }}
                  />
                </>
              )}

              {/* Day Labels */}
              <text
                x={p.x}
                y={height - 6}
                textAnchor="middle"
                style={styles.axisLabel}
              >
                {p.data.dayName}
              </text>

              {/* Tooltip Hover Value */}
              <title>{`${p.data.date}: ₹${new Intl.NumberFormat('en-IN').format(p.data.amount)}`}</title>
            </g>
          ))}
        </svg>
      </div>

      <div style={styles.chartFooter}>
        <Info size={14} style={{ color: 'var(--text-muted)' }} />
        <span style={styles.footerText}>
          Total weekly sales equal <strong>₹{new Intl.NumberFormat('en-IN').format(salesData.reduce((acc, curr) => acc + curr.amount, 0))}</strong>. Hover dots to inspect daily stats.
        </span>
      </div>
    </div>
  );
};

const styles = {
  chartCard: {
    padding: '24px',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    width: '100%',
    flexGrow: 1,
  } as React.CSSProperties,
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
  } as React.CSSProperties,
  headerTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  } as React.CSSProperties,
  title: {
    fontSize: '1rem',
    fontWeight: '800',
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  subtitle: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  } as React.CSSProperties,
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  } as React.CSSProperties,
  segmentedControl: {
    display: 'flex',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    padding: '2px',
  } as React.CSSProperties,
  segmentedBtn: {
    border: 'none',
    cursor: 'pointer',
    padding: '6px 8px',
    borderRadius: 'var(--radius-xs)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  rangeControl: {
    display: 'flex',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-sm)',
    overflow: 'hidden',
  } as React.CSSProperties,
  rangeBtn: {
    border: 'none',
    borderRight: '1px solid var(--border-color)',
    cursor: 'pointer',
    padding: '6px 12px',
    fontSize: '0.75rem',
    fontWeight: '700',
    transition: 'all var(--transition-fast)',
  } as React.CSSProperties,
  svgWrapper: {
    width: '100%',
    position: 'relative',
    height: '180px',
  } as React.CSSProperties,
  svg: {
    width: '100%',
    height: '100%',
    overflow: 'visible',
  } as React.CSSProperties,
  axisLabel: {
    fontSize: '10px',
    fontWeight: '700',
    fill: 'var(--text-muted)',
    fontFamily: 'Inter, sans-serif',
  } as React.CSSProperties,
  chartFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-tertiary)',
    padding: '10px 14px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border-color)',
  } as React.CSSProperties,
  footerText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.4',
  } as React.CSSProperties,
  // Loaders
  loadingContainer: {
    height: '180px',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-secondary)',
    border: '2px dashed var(--border-color)',
    borderRadius: 'var(--radius-sm)',
  } as React.CSSProperties,
  chartSkeleton: {
    width: '80%',
    height: '4px',
    backgroundColor: 'var(--border-color)',
    borderRadius: '2px',
  } as React.CSSProperties,
};
// Add CSS triggers externally for rings hover
styles.rangeBtn[':last-child'] = {
  borderRight: 'none',
};
