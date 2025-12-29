import React, { useState, useEffect } from 'react';
import { collection, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useMarketData, useOpportunities } from '../../hooks/useMarketData';
import { useTextModel } from '../../hooks/useTextModel';
import ArbitrageCard from '../ArbitrageCard';
import SentimentGauge from '../SentimentGauge';
import { shouldExecuteTrade } from '../../lib/strategies';

export default function Dashboard() {
  const { marketTicks, loading: marketLoading } = useMarketData(20);
  const { opportunities, loading: oppsLoading } = useOpportunities();
  const { model, loading: modelLoading, analyzeSentiment } = useTextModel();

  const [analyzingOpportunity, setAnalyzingOpportunity] = useState(null);
  const [newsHeadlines, setNewsHeadlines] = useState([
    'Bitcoin reaches new all-time high',
    'Ethereum network upgrade successful',
    'Crypto market shows strong bullish momentum'
  ]);

  // Analyze sentiment for new opportunities
  useEffect(() => {
    if (!model || modelLoading) return;

    const pendingOpportunities = opportunities.filter(
      opp => opp.status === 'DETECTED' && 
      (opp.ai_validation?.sentiment_score === null || opp.ai_validation?.sentiment_score === undefined)
    );

    if (pendingOpportunities.length > 0 && !analyzingOpportunity) {
      const opportunity = pendingOpportunities[0];
      setAnalyzingOpportunity(opportunity.id);

      // Update status to ANALYZING
      updateDoc(doc(db, 'opportunities', opportunity.id), {
        status: 'ANALYZING'
      }).then(async () => {
        try {
          // Analyze sentiment of news headlines
          const sentimentResults = await Promise.all(
            newsHeadlines.map(headline => analyzeSentiment(headline))
          );

          const avgScore = sentimentResults.reduce((sum, r) => sum + r.sentiment_score, 0) / sentimentResults.length;
          const avgConfidence = sentimentResults.reduce((sum, r) => sum + r.confidence, 0) / sentimentResults.length;
          const approval = avgScore > 0.3;

          // Update opportunity with sentiment analysis
          await updateDoc(doc(db, 'opportunities', opportunity.id), {
            status: approval ? 'ANALYZING' : 'REJECTED',
            ai_validation: {
              sentiment_score: avgScore,
              confidence: avgConfidence,
              approval: approval,
              analyzed_at: new Date().toISOString()
            }
          });

          setAnalyzingOpportunity(null);
        } catch (error) {
          console.error('Error analyzing sentiment:', error);
          setAnalyzingOpportunity(null);
        }
      });
    }
  }, [opportunities, model, modelLoading, newsHeadlines, analyzingOpportunity, analyzeSentiment]);

  // Calculate average sentiment from all opportunities
  const avgSentiment = opportunities.length > 0
    ? opportunities
        .filter(opp => opp.ai_validation?.sentiment_score !== null)
        .reduce((sum, opp) => sum + (opp.ai_validation?.sentiment_score || 0), 0) /
      Math.max(1, opportunities.filter(opp => opp.ai_validation?.sentiment_score !== null).length)
    : null;

  const readyToExecute = opportunities.filter(opp => shouldExecuteTrade(opp));

  if (marketLoading || oppsLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: 'white' }}>
        <p>Loading market data...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', textAlign: 'center' }}>
        <h1
          style={{
            fontSize: '36px',
            fontWeight: '700',
            color: 'white',
            marginBottom: '8px',
            textShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
        >
          Aetheris Trading Dashboard
        </h1>
        <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.9)' }}>
          Autonomous Crypto Arbitrage & Sentiment Engine
        </p>
      </div>

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}
      >
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Total Opportunities</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#374151' }}>{opportunities.length}</p>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Ready to Execute</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#10b981' }}>{readyToExecute.length}</p>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>Market Ticks</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#374151' }}>{marketTicks.length}</p>
        </div>
        <div
          style={{
            background: 'white',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            textAlign: 'center'
          }}
        >
          <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>AI Model Status</p>
          <p
            style={{
              fontSize: '16px',
              fontWeight: '600',
              color: modelLoading ? '#f59e0b' : model ? '#10b981' : '#ef4444'
            }}
          >
            {modelLoading ? 'Loading...' : model ? 'Active' : 'Error'}
          </p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 350px',
          gap: '24px',
          marginBottom: '32px'
        }}
      >
        {/* Opportunities List */}
        <div>
          <h2
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
              marginBottom: '16px'
            }}
          >
            Arbitrage Opportunities
          </h2>
          {opportunities.length === 0 ? (
            <div
              style={{
                background: 'white',
                borderRadius: '12px',
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280'
              }}
            >
              <p>No arbitrage opportunities detected yet.</p>
              <p style={{ fontSize: '12px', marginTop: '8px' }}>
                The system scans for opportunities every 60 seconds.
              </p>
            </div>
          ) : (
            opportunities.map(opp => (
              <ArbitrageCard key={opp.id} opportunity={opp} />
            ))
          )}
        </div>

        {/* Sidebar */}
        <div>
          <SentimentGauge sentimentScore={avgSentiment} />
        </div>
      </div>

      {/* Market Ticks Table */}
      <div
        style={{
          background: 'white',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: '600',
            marginBottom: '16px',
            color: '#374151'
          }}
        >
          Recent Market Ticks
        </h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px', textAlign: 'left', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Asset
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Exchange A
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Exchange B
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Spread
                </th>
                <th style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>
                  Time
                </th>
              </tr>
            </thead>
            <tbody>
              {marketTicks.slice(0, 10).map(tick => {
                const spread = ((Math.abs(tick.exchange_a_price - tick.exchange_b_price) / Math.min(tick.exchange_a_price, tick.exchange_b_price)) * 100).toFixed(2);
                return (
                  <tr key={tick.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', fontSize: '14px', fontWeight: '600' }}>
                      {tick.asset || 'N/A'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                      ${parseFloat(tick.exchange_a_price || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px' }}>
                      ${parseFloat(tick.exchange_b_price || 0).toFixed(2)}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '14px', fontWeight: '600', color: parseFloat(spread) > 1 ? '#10b981' : '#6b7280' }}>
                      {spread}%
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontSize: '12px', color: '#6b7280' }}>
                      {new Date(tick.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

