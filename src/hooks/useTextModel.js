import { useState, useEffect } from 'react';
import { pipeline } from '@xenova/transformers';

/**
 * Hook to load and use Transformers.js sentiment analysis model
 * @returns {object} Model, loading state, and analyze function
 */
export function useTextModel() {
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadModel() {
      try {
        console.log('Loading sentiment analysis model...');
        
        // Load a quantized BERT model for sentiment analysis
        // Using a smaller model for browser compatibility
        const sentimentModel = await pipeline(
          'sentiment-analysis',
          'Xenova/distilbert-base-uncased-finetuned-sst-2-english',
          {
            quantized: true
          }
        );

        if (isMounted) {
          setModel(sentimentModel);
          setLoading(false);
          console.log('Model loaded successfully');
        }
      } catch (err) {
        console.error('Error loading model:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    loadModel();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Analyze sentiment of text
   * @param {string} text - Text to analyze
   * @returns {Promise<object>} Sentiment analysis result
   */
  const analyzeSentiment = async (text) => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      const result = await model(text);
      
      // Transform result to our format
      // Result format: [{ label: 'POSITIVE' | 'NEGATIVE', score: number }]
      const sentiment = result[0];
      const score = sentiment.label === 'POSITIVE' 
        ? sentiment.score 
        : -sentiment.score;

      return {
        sentiment_score: score, // -1.0 to 1.0
        confidence: sentiment.score,
        label: sentiment.label,
        approval: score > 0.3 // Approve if positive sentiment
      };
    } catch (err) {
      console.error('Error analyzing sentiment:', err);
      throw err;
    }
  };

  /**
   * Analyze multiple texts and return average sentiment
   * @param {string[]} texts - Array of texts to analyze
   * @returns {Promise<object>} Average sentiment analysis result
   */
  const analyzeMultipleSentiments = async (texts) => {
    if (!model) {
      throw new Error('Model not loaded');
    }

    try {
      const results = await Promise.all(
        texts.map(text => analyzeSentiment(text))
      );

      const avgScore = results.reduce((sum, r) => sum + r.sentiment_score, 0) / results.length;
      const avgConfidence = results.reduce((sum, r) => sum + r.confidence, 0) / results.length;
      const positiveCount = results.filter(r => r.sentiment_score > 0).length;

      return {
        sentiment_score: avgScore,
        confidence: avgConfidence,
        approval: avgScore > 0.3 && positiveCount > results.length / 2,
        sample_size: texts.length
      };
    } catch (err) {
      console.error('Error analyzing multiple sentiments:', err);
      throw err;
    }
  };

  return {
    model,
    loading,
    error,
    analyzeSentiment,
    analyzeMultipleSentiments
  };
}

