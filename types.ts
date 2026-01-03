export enum TradeType {
  LONG = 'Long',
  SHORT = 'Short'
}

export enum AssetClass {
  CRYPTO = 'Crypto',
  FOREX = 'Forex',
  STOCKS = 'Stocks',
  FUTURES = 'Futures',
  OPTIONS = 'Options'
}

export interface Trade {
  id: string;
  entryDate: string; // ISO date string (Entry Time)
  exitDate?: string; // ISO date string (Exit Time)
  symbol: string;
  type: TradeType;
  assetClass: AssetClass;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  fees: number;
  pnl?: number; // Net PnL
  
  // Advanced Journaling
  setup?: string; 
  mistakes?: string[]; 
  followedSetup?: boolean;
  entryReason?: string;
  feeling?: string; // Greedy, Fearful, Calm, etc.
  lessonLearned?: string;
  tags?: string[];
  screenshot?: string; // Base64 data URL
  notes: string; // General notes
}

export interface TradeFilter {
  symbol?: string;
  startDate?: string;
  endDate?: string;
}

export interface AIAnalysisResult {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  actionableTips: string[];
  sentimentScore: number; // 0-100
}

export interface GrowthChallenge {
  id: string;
  title: string;
  startingCapital: number;
  targetCapital: number;
  currentCapital: number;
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed';
}