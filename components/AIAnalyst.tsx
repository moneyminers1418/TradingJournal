import React, { useState } from 'react';
import { Trade, AIAnalysisResult } from '../types';
import { analyzeTradesWithGemini } from '../services/geminiService';
import { BrainCircuit, Loader2, Sparkles, AlertTriangle, Check } from 'lucide-react';

interface AIAnalystProps {
  trades: Trade[];
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ trades }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const analysis = await analyzeTradesWithGemini(trades);
      setResult(analysis);
    } catch (err) {
      setError("Failed to generate analysis. Check API Key or try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (trades.length < 3) {
    return (
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-8 text-center">
        <BrainCircuit className="mx-auto h-12 w-12 text-gray-600 mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">AI Trading Coach</h3>
        <p className="text-gray-400">Log at least 3 closed trades to unlock personalized AI performance analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-500/10 rounded-lg">
            <BrainCircuit className="h-6 w-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Trading Coach</h3>
            <p className="text-xs text-gray-500">Powered by Gemini Pro</p>
          </div>
        </div>
        {!result && !loading && (
          <button
            onClick={handleAnalysis}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:shadow-[0_0_25px_rgba(147,51,234,0.5)]"
          >
            <Sparkles size={16} />
            Generate Report
          </button>
        )}
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-gray-400 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin mb-3 text-purple-500" />
          <p>Analyzing your trade history & psychology...</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center gap-3 text-red-300">
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Summary & Score */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h4 className="text-sm uppercase tracking-wider text-gray-500 font-semibold mb-2">Executive Summary</h4>
              <p className="text-gray-300 leading-relaxed bg-gray-900/50 p-4 rounded-lg border border-gray-700/50">
                {result.summary}
              </p>
            </div>
            <div className="flex flex-col items-center justify-center bg-gray-900/50 p-6 rounded-lg border border-gray-700/50 min-w-[150px]">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                {result.sentimentScore}
              </div>
              <div className="text-xs text-gray-500 mt-1 uppercase tracking-widest">Discipline Score</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Strengths */}
            <div className="bg-emerald-900/10 border border-emerald-900/30 rounded-lg p-4">
              <h4 className="text-emerald-400 font-medium mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Strengths
              </h4>
              <ul className="space-y-2">
                {result.strengths.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
              <h4 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400"></span>
                Areas to Improve
              </h4>
              <ul className="space-y-2">
                {result.weaknesses.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Actionable Tips */}
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4">
              <h4 className="text-blue-400 font-medium mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Action Plan
              </h4>
              <ul className="space-y-2">
                {result.actionableTips.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="flex-shrink-0 flex items-center justify-center w-4 h-4 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold border border-blue-500/30">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex justify-end">
             <button
              onClick={handleAnalysis}
              className="text-sm text-gray-500 hover:text-white underline decoration-dotted underline-offset-4"
            >
              Refresh Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
};