import React from 'react';
import { getSentimentLabel, getSentimentColor } from '../lib/strategies';

export default function SentimentGauge({ sentimentScore, confidence = null }) {
  const sentimentLabel = getSentimentLabel(sentimentScore);
  const sentimentColor = getSentimentColor(sentimentScore);

  // Normalize score to 0-100 for gauge display
  const normalizedScore = sentimentScore !== null && sentimentScore !== undefined
    ? ((sentimentScore + 1) / 2) * 100 // Convert -1 to 1 range to 0-100
    : 50; // Neutral position when pending

  // Calculate angle for gauge (0-180 degrees)
  const angle = (normalizedScore / 100) * 180;

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '24px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}
    >
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '20px', color: '#374151' }}>
        Market Sentiment
      </h3>

      {/* Gauge Visualization */}
      <div style={{ position: 'relative', width: '200px', height: '100px', margin: '0 auto 20px' }}>
        {/* Gauge Background Arc */}
        <svg width="200" height="100" style={{ overflow: 'visible' }}>
          {/* Background arc */}
          <path
            d="M 20 80 A 80 80 0 0 1 180 80"
            fill="none"
            stroke="#e5e7eb"
            strokeWidth="12"
          />
          {/* Colored arc based on sentiment */}
          <path
            d={`M 20 80 A 80 80 0 ${angle > 90 ? 1 : 0} 1 ${180 - (180 - angle) * 1.6} ${80 - Math.sin((angle * Math.PI) / 180) * 80}`}
            fill="none"
            stroke={sentimentColor}
            strokeWidth="12"
            strokeLinecap="round"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="80"
            x2={100 + Math.cos(((angle - 90) * Math.PI) / 180) * 70}
            y2={80 - Math.sin(((angle - 90) * Math.PI) / 180) * 70}
            stroke="#374151"
            strokeWidth="3"
            strokeLinecap="round"
          />
          {/* Center dot */}
          <circle cx="100" cy="80" r="6" fill="#374151" />
        </svg>

        {/* Score Display */}
        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '24px',
            fontWeight: '700',
            color: sentimentColor
          }}
        >
          {sentimentScore !== null && sentimentScore !== undefined
            ? sentimentScore.toFixed(2)
            : '--'}
        </div>
      </div>

      {/* Sentiment Label */}
      <div
        style={{
          fontSize: '18px',
          fontWeight: '600',
          color: sentimentColor,
          marginBottom: '8px'
        }}
      >
        {sentimentLabel}
      </div>

      {/* Confidence Score */}
      {confidence !== null && (
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          Confidence: {(confidence * 100).toFixed(0)}%
        </div>
      )}

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '20px',
          fontSize: '10px',
          color: '#9ca3af'
        }}
      >
        <span>Very Negative</span>
        <span>Neutral</span>
        <span>Very Positive</span>
      </div>
    </div>
  );
}

