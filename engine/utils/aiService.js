/**
 * AI Service for VPS Bot (Backend)
 * Secure AI analysis using EmbedAPI - API key stays on server
 */

import EmbedAPIClient from '@embedapi/core';
import dotenv from 'dotenv';

dotenv.config();

class BackendAIService {
  constructor() {
    this.client = null;
    this.initialized = false;
    this.apiKey = process.env.EMBEDAPI_KEY;
    this.selectedService = 'anthropic';
    this.selectedModel = 'claude-3-5-sonnet-20240620';
  }

  /**
   * Initialize the AI client
   */
  async initialize() {
    if (this.initialized) return;

    if (!this.apiKey) {
      console.warn('⚠️  EMBEDAPI_KEY not found in environment. AI features disabled.');
      return;
    }

    try {
      this.client = new EmbedAPIClient(this.apiKey);
      this.initialized = true;
      console.log('✅ Backend AI Service initialized');
      
      // List available models
      try {
        const models = await this.client.listModels();
        console.log(`📋 Available models: ${Array.isArray(models) ? models.length : 0}`);
        
        // Find Claude 3.5 Sonnet
        if (Array.isArray(models) && models.length > 0) {
          const claudeModel = models.find(m => {
            const modelStr = JSON.stringify(m).toLowerCase();
            return modelStr.includes('claude-3-5-sonnet');
          });
          
          if (claudeModel) {
            this.selectedService = claudeModel.service || 'anthropic';
            this.selectedModel = claudeModel.model || 'claude-3-5-sonnet-20240620';
            console.log(`✅ Using: service=${this.selectedService}, model=${this.selectedModel}`);
          }
        }
      } catch (listError) {
        console.warn('⚠️  Could not list models:', listError.message);
      }
    } catch (error) {
      console.error('❌ Failed to initialize Backend AI Service:', error);
      throw error;
    }
  }

  /**
   * Generate AI response
   */
  async generate(prompt, options = {}) {
    if (!this.initialized || !this.client) {
      throw new Error('Backend AI Service not initialized');
    }

    try {
      const response = await this.client.generate({
        provider: 'anthropic',
        service: options.service || this.selectedService,
        model: options.model || this.selectedModel,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: options.temperature || 0.3,
        max_tokens: options.maxTokens || options.max_tokens || 500,
        ...options
      });

      // Extract text from response - handle EmbedAPI format
      // Format: { data: "string", tokenUsage: number, cost: number, code: number }
      if (response.data) {
        // data is a string, return it directly
        return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
      }
      if (response.choices && response.choices[0] && response.choices[0].message) {
        return response.choices[0].message.content;
      }
      if (response.message) {
        return typeof response.message === 'string' ? response.message : response.message.content || JSON.stringify(response.message);
      }
      if (response.text) {
        return response.text;
      }
      if (response.content) {
        return response.content;
      }
      if (typeof response === 'string') {
        return response;
      }
      return JSON.stringify(response);
    } catch (error) {
      console.error('Error generating AI response:', error);
      throw error;
    }
  }

  /**
   * Analyze arbitrage opportunity
   */
  async analyzeOpportunity(alert, context = []) {
    if (!this.initialized) {
      // Try to initialize if not already done
      if (!this.apiKey) {
        throw new Error('Backend AI Service not initialized: EMBEDAPI_KEY missing from environment');
      }
      try {
        await this.initialize();
        if (!this.initialized) {
          throw new Error('Backend AI Service not initialized: Initialization failed');
        }
      } catch (error) {
        throw new Error(`Backend AI Service not initialized: ${error.message}`);
      }
    }

    try {
      const prompt = `You are a professional cryptocurrency trading analyst. Analyze this arbitrage opportunity and respond ONLY with valid JSON (no markdown, no code blocks):

Symbol: ${alert.symbol || alert.asset}
Spread: ${alert.spread?.toFixed(2)}%
WEEX Price: $${alert.weex_price?.toFixed(2)}
Other Exchange Price: $${alert.other_price?.toFixed(2)}
Projected Profit: $${alert.projected_profit?.toFixed(2)}
Risk Level: ${alert.risk_level}

${context.length > 0 ? `\nAdditional Context:\n${context.join('\n')}` : ''}

Respond with ONLY this JSON structure (no other text):
{
  "sentiment_score": <number between -1 and 1>,
  "confidence": <number between 0 and 1>,
  "reasoning": "<brief explanation>",
  "recommendation": "<APPROVE|REJECT|CAUTION>"
}`;

      const response = await this.generate(prompt, {
        temperature: 0.3,
        maxTokens: 300
      });

      // Parse JSON response - response.data is a string containing JSON
      let analysis = response;
      
      // Handle EmbedAPI format: { data: "{\"sentiment_score\": 0.6, ...}", tokenUsage: 317, cost: 0, code: 200 }
      if (typeof analysis === 'string') {
        // Try to parse as JSON string
        try {
          analysis = JSON.parse(analysis);
        } catch {
          // If not JSON, try to extract JSON from markdown
          const jsonMatch = analysis.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/);
          if (jsonMatch) {
            analysis = JSON.parse(jsonMatch[1]);
          } else {
            const jsonObjectMatch = analysis.match(/\{[\s\S]*\}/);
            if (jsonObjectMatch) {
              analysis = JSON.parse(jsonObjectMatch[0]);
            }
          }
        }
      }
      
      // If analysis is still a string, try to parse it as JSON
      if (typeof analysis === 'string') {
        try {
          analysis = JSON.parse(analysis);
        } catch {
          analysis = {
            sentiment_score: 0.5,
            confidence: 0.7,
            reasoning: analysis,
            recommendation: 'CAUTION'
          };
        }
      }

      return {
        sentiment_score: Math.max(-1, Math.min(1, parseFloat(analysis.sentiment_score) || 0)),
        confidence: Math.max(0, Math.min(1, parseFloat(analysis.confidence) || 0.5)),
        reasoning: analysis.reasoning || 'Analysis completed',
        recommendation: analysis.recommendation || 'CAUTION',
        analyzed_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error analyzing opportunity:', error);
      return {
        sentiment_score: 0,
        confidence: 0.3,
        reasoning: `Error during analysis: ${error.message}`,
        recommendation: 'REJECT',
        analyzed_at: new Date().toISOString()
      };
    }
  }
}

// Export singleton instance
export const backendAIService = new BackendAIService();
export default backendAIService;

