import React, { useState } from 'react';
import { formatWeeXSymbol, formatPrice, formatPercentage, getSpreadColor } from '../lib/weexApi';
import { shouldExecuteTrade } from '../lib/strategies';
import { requestTradeExecution } from '../lib/tradeExecution';

export default function ArbitrageCard({ opportunity }) {
  if (!opportunity) return null;

  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const canExecute = shouldExecuteTrade(opportunity);
  const spreadColor = getSpreadColor(opportunity.spread_pct);

  const handleExecuteTrade = async () => {
    if (!canExecute || executing) return;

    setExecuting(true);
    setExecutionResult(null);

    try {
      const result = await requestTradeExecution(opportunity.id);
      setExecutionResult({ success: true, message: result.message || 'Trade execution requested' });
    } catch (error) {
      setExecutionResult({ success: false, message: error.message || 'Failed to execute trade' });
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '16px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        border: canExecute ? '2px solid #10b981' : '2px solid #e5e7eb',
        transition: 'all 0.3s ease'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
            {formatWeeXSymbol(opportunity.symbol || 'N/A')}
          </h3>
          <p style={{ fontSize: '12px', color: '#6b7280' }}>
            Status: <span style={{ fontWeight: '600', textTransform: 'uppercase' }}>{opportunity.status}</span>
          </p>
        </div>
        <div
          style={{
            background: spreadColor,
            color: 'white',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          {formatPercentage(opportunity.spread_pct)}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Exchange A Price</p>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>
            ${formatPrice(opportunity.exchange_a_price)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Exchange B Price</p>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>
            ${formatPrice(opportunity.exchange_b_price)}
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Projected Profit</p>
          <p style={{ fontSize: '16px', fontWeight: '600', color: '#10b981' }}>
            ${formatPrice(opportunity.projected_profit)}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Risk Level</p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color:
                opportunity.risk_level === 'LOW'
                  ? '#10b981'
                  : opportunity.risk_level === 'MEDIUM'
                  ? '#f59e0b'
                  : '#ef4444'
            }}
          >
            {opportunity.risk_level}
          </p>
        </div>
        <div>
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Volume (24h)</p>
          <p style={{ fontSize: '16px', fontWeight: '600' }}>
            {formatPrice(opportunity.volume || 0, 0)}
          </p>
        </div>
      </div>

      {opportunity.ai_validation && (
        <div
          style={{
            background: '#f3f4f6',
            padding: '12px',
            borderRadius: '8px',
            marginTop: '12px'
          }}
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>AI Validation</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', fontWeight: '500' }}>
              Sentiment: {opportunity.ai_validation.sentiment_score !== null 
                ? opportunity.ai_validation.sentiment_score.toFixed(2) 
                : 'Pending'}
            </span>
            <span
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                fontWeight: '600',
                background: opportunity.ai_validation.approval ? '#10b981' : '#ef4444',
                color: 'white'
              }}
            >
              {opportunity.ai_validation.approval === null
                ? 'Pending'
                : opportunity.ai_validation.approval
                ? 'Approved'
                : 'Rejected'}
            </span>
          </div>
        </div>
      )}

      {canExecute && opportunity.status !== 'EXECUTED' && (
        <div style={{ marginTop: '12px' }}>
          <button
            onClick={handleExecuteTrade}
            disabled={executing}
            style={{
              width: '100%',
              padding: '12px',
              background: executing ? '#9ca3af' : '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: executing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {executing ? 'Executing Trade...' : 'Execute Trade (10 USDT)'}
          </button>
          {executionResult && (
            <div
              style={{
                marginTop: '8px',
                padding: '8px',
                background: executionResult.success ? '#d1fae5' : '#fee2e2',
                borderRadius: '6px',
                fontSize: '12px',
                color: executionResult.success ? '#065f46' : '#991b1b',
                textAlign: 'center',
                fontWeight: '500'
              }}
            >
              {executionResult.success ? '✓ ' : '✗ '}
              {executionResult.message}
            </div>
          )}
        </div>
      )}

      {opportunity.status === 'EXECUTED' && (
        <div
          style={{
            marginTop: '12px',
            padding: '8px',
            background: '#d1fae5',
            borderRadius: '6px',
            textAlign: 'center',
            fontSize: '12px',
            color: '#065f46',
            fontWeight: '600'
          }}
        >
          ✓ Trade Executed
          {opportunity.order_id && (
            <div style={{ fontSize: '10px', marginTop: '4px', opacity: 0.8 }}>
              Order ID: {opportunity.order_id}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

