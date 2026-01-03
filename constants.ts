
import { Trade, TradeType, AssetClass } from './types';

export const MOCK_TRADES: Trade[] = [
  {
    id: '1',
    entryDate: '2023-10-01T09:30:00Z',
    exitDate: '2023-10-01T10:30:00Z',
    symbol: 'RELIANCE',
    type: TradeType.LONG,
    assetClass: AssetClass.STOCKS,
    entryPrice: 2350.50,
    exitPrice: 2380.00,
    quantity: 100,
    fees: 50.00,
    pnl: 2900.00,
    setup: 'Breakout',
    mistakes: [],
    followedSetup: true,
    entryReason: 'Price broke above 200 EMA with volume.',
    feeling: 'Calm',
    lessonLearned: 'Patience pays off.',
    tags: ['#breakout', '#reliance'],
    notes: 'Good execution.'
  },
  {
    id: '2',
    entryDate: '2023-10-02T14:00:00Z',
    exitDate: '2023-10-02T14:45:00Z',
    symbol: 'NIFTY 50',
    type: TradeType.SHORT,
    assetClass: AssetClass.FUTURES,
    entryPrice: 19500,
    exitPrice: 19550,
    quantity: 50,
    fees: 200.00,
    pnl: -2700.00,
    setup: 'Reversal',
    mistakes: ['Impatience'],
    followedSetup: false,
    entryReason: 'Thought it was overextended.',
    feeling: 'Fearful',
    lessonLearned: 'Do not fade strong trends without confirmation.',
    tags: ['#faded', '#loss'],
    notes: 'Short covering rally caught me off guard.'
  },
  {
    id: '3',
    entryDate: '2023-10-03T10:15:00Z',
    exitDate: '2023-10-03T11:00:00Z',
    symbol: 'TCS',
    type: TradeType.LONG,
    assetClass: AssetClass.STOCKS,
    entryPrice: 3400.00,
    exitPrice: 3450.00,
    quantity: 50,
    fees: 100.00,
    pnl: 2400.00,
    setup: 'Trend Following',
    mistakes: [],
    followedSetup: true,
    entryReason: 'Retest of support.',
    feeling: 'Confident',
    lessonLearned: 'Stick to the plan.',
    tags: ['#support', '#it'],
    notes: 'IT sector looking strong.'
  },
  {
    id: '4',
    entryDate: '2023-10-04T11:00:00Z',
    exitDate: '2023-10-04T11:30:00Z',
    symbol: 'BANKNIFTY',
    type: TradeType.LONG,
    assetClass: AssetClass.OPTIONS,
    entryPrice: 450.00,
    exitPrice: 410.00,
    quantity: 25,
    fees: 50.00,
    pnl: -1050.00,
    setup: 'Breakout',
    mistakes: ['Hope Trading'],
    followedSetup: true,
    entryReason: 'Triangle breakout.',
    feeling: 'Greedy',
    lessonLearned: 'Options decay kills momentum trades if they stall.',
    tags: ['#options', '#theta'],
    notes: 'Theta decay killed the trade.'
  },
  {
    id: '5',
    entryDate: '2023-10-05T09:45:00Z',
    exitDate: '2023-10-05T10:00:00Z',
    symbol: 'HDFCBANK',
    type: TradeType.SHORT,
    assetClass: AssetClass.STOCKS,
    entryPrice: 1520.00,
    exitPrice: 1510.00,
    quantity: 200,
    fees: 150.00,
    pnl: 1850.00,
    setup: 'Gap Fill',
    mistakes: [],
    followedSetup: true,
    entryReason: 'Gap up at resistance.',
    feeling: 'Calm',
    lessonLearned: 'Gaps often fill.',
    tags: ['#gapfill'],
    notes: 'Gap fill play.'
  },
  {
    id: '6',
    entryDate: '2023-10-08T15:30:00Z',
    exitDate: '2023-10-08T15:35:00Z',
    symbol: 'INFY',
    type: TradeType.LONG,
    assetClass: AssetClass.STOCKS,
    entryPrice: 1450,
    exitPrice: 1480,
    quantity: 100,
    fees: 80.00,
    pnl: 2920.00,
    setup: 'News Catalyst',
    mistakes: [],
    followedSetup: true,
    entryReason: 'Positive earnings surprise.',
    feeling: 'Excited',
    lessonLearned: 'News momentum is powerful.',
    tags: ['#earnings'],
    notes: 'Results expectation run up.'
  }
];

export const SETUP_TYPES = [
  'Breakout',
  'Scalp',
  'Support/Resistance'
];

export const COMMON_MISTAKES = [
  'FOMO',
  'Revenge Trading',
  'Overleveraged',
  'Impatience',
  'Did not follow plan',
  'Hope Trading',
  'Moved Stop Loss'
];

export const FEELINGS = [
  'Calm',
  'Confident',
  'Fearful',
  'Greedy',
  'Anxious',
  'Excited',
  'Frustrated',
  'Bored'
];

// Added DEFAULT_RULES to resolve the import error in App.tsx
export const DEFAULT_RULES = [
  'Stick to the trading plan',
  'Risk no more than 1% per trade',
  'Wait for setup confirmation',
  'No trading during high-impact news'
];
