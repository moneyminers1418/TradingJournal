import React, { useState, useEffect } from 'react';
import { LayoutDashboard, BookOpen, Plus, LineChart, Wallet, Calendar, Palette, LogOut, User, Trophy, Settings2, Menu, X } from 'lucide-react';
import { Trade, GrowthChallenge } from './types';
import { MOCK_TRADES, SETUP_TYPES, DEFAULT_RULES, COMMON_MISTAKES } from './constants';
import { Dashboard } from './components/Dashboard';
import { TradeList } from './components/TradeList';
import { TradeForm } from './components/TradeForm';
import { AIAnalyst } from './components/AIAnalyst';
import { TradeCalendar } from './components/TradeCalendar';
import { Login } from './components/Login';
import { SuccessCelebration } from './components/SuccessCelebration';
import { ChallengeView } from './components/ChallengeView';
import { SetupManager } from './components/SetupManager';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, addDoc, updateDoc, deleteDoc, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { saveTrade, loadTrades, deleteTrade, updateTrade } from './services/firebase';

enum View {
  DASHBOARD = 'Dashboard',
  JOURNAL = 'Journal',
  CALENDAR = 'Calendar',
  CHALLENGE = 'Challenge',
  SETUP_MANAGER = 'Setup Manager',
  ANALYSIS = 'Analysis'
}

type Theme = 'default' | 'midnight' | 'oled' | 'light';

interface UserProfile {
  name: string;
  email: string;
  avatar: string;
}

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [recentlySavedTrade, setRecentlySavedTrade] = useState<Trade | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [customSetups, setCustomSetups] = useState<string[]>([]);
  const [customRules, setCustomRules] = useState<string[]>(DEFAULT_RULES);
  const [mistakesList, setMistakesList] = useState<string[]>(COMMON_MISTAKES);
  const [theme, setTheme] = useState<Theme>('default');

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [journalSetupFilter, setJournalSetupFilter] = useState<string>('All');

  const [challenge, setChallenge] = useState<GrowthChallenge>({
    id: crypto.randomUUID(),
    title: "10L Professional Milestone",
    startingCapital: 500000,
    targetCapital: 1000000,
    currentCapital: 500000,
    startDate: new Date().toISOString(),
    status: 'active'
  });

  const [completedChallenges, setCompletedChallenges] = useState<GrowthChallenge[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = {
          name: firebaseUser.displayName || 'User',
          email: firebaseUser.email || '',
          avatar: firebaseUser.photoURL || 'https://ui-avatars.com/api/?name=User&background=0D8ABC&color=fff'
        };
        setUser(userProfile);
        setIsAuthenticated(true);

        // Set up real-time listener for trades
        const q = query(
          collection(db, 'trades'),
          where('userId', '==', firebaseUser.uid),
          orderBy('createdAt', 'desc')
        );

        const unsubscribeTrades = onSnapshot(q, (querySnapshot) => {
          const trades: Trade[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            // Extract data without the id field to avoid overwriting doc.id
            const { id: _, ...tradeData } = data;
            trades.push({
              id: doc.id, // Use the Firestore document ID
              ...tradeData,
              // Convert Timestamps back to ISO strings
              entryDate: data.entryDate?.toDate()?.toISOString() || '',
              exitDate: data.exitDate?.toDate()?.toISOString() || '',
            } as Trade);
          });
          setTrades(trades);
        });

        // Load other user data from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        console.log('Loading user data for:', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);

          if (userDoc.exists()) {
            // If user exists, just load their data
            const userData = userDoc.data();
            console.log('User data loaded:', userData);
            setChallenge(userData.challenge || challenge);
            setCompletedChallenges(userData.completedChallenges || []);
            setCustomSetups(userData.customSetups || []);
            setCustomRules(userData.customRules || DEFAULT_RULES);
            setMistakesList(userData.mistakesList || COMMON_MISTAKES);
          } else {
            // ONLY if it's a brand new user, create the initial document
            await setDoc(userDocRef, {
              challenge,
              completedChallenges: [],
              customSetups: [],
              customRules: DEFAULT_RULES,
              mistakesList: COMMON_MISTAKES
            });
          }
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setTrades([]);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogin = (googleUser: { name: string; email: string; picture: string }) => {
    // Firebase auth state is handled in useEffect, no need to manually set state here
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveTrade = async (trade: Trade) => {
    console.log('Saving trade, current user:', auth.currentUser);
    if (!auth.currentUser) {
      console.error('No authenticated user, cannot save trade');
      return;
    }

    try {
      let tradeId: string | void;
      let updatedTrades: Trade[];

      if (editingTrade) {
        // Update existing trade
        console.log('Updating existing trade:', editingTrade.id);
        tradeId = await updateTrade(editingTrade.id, trade);
        console.log('Trade updated, new ID if created:', tradeId);

        // Update local state
        if (tradeId) {
          // New trade was created
          updatedTrades = trades.filter(t => t.id !== editingTrade.id);
          updatedTrades = [{ ...trade, id: tradeId }, ...updatedTrades];
        } else {
          // Trade was updated in place
          updatedTrades = trades.map(t => t.id === editingTrade.id ? { ...trade, id: editingTrade.id } : t);
        }
        setTrades(updatedTrades);
        setRecentlySavedTrade({ ...trade, id: tradeId || editingTrade.id });
      } else {
        // Save new trade to Firestore
        tradeId = await saveTrade(trade);
        console.log('Trade saved to Firestore with ID:', tradeId);

        // Update local state
        updatedTrades = [{ ...trade, id: tradeId }, ...trades];
        setTrades(updatedTrades);
        setRecentlySavedTrade({ ...trade, id: tradeId });
      }

      setShowForm(false);
      setEditingTrade(null);

      console.log('Updated trades array:', updatedTrades);
    } catch (error) {
      console.error('Error saving trade:', error);
    }
  };

  const handleDeleteTrade = async (id: string) => {
    if (!auth.currentUser) return;

    if(window.confirm('Are you sure you want to delete this trade?')) {
      try {
        setDeleteError(null); // Clear any previous errors
        // Delete from Firestore - real-time listener will update the UI
        await deleteTrade(id);
      } catch (error) {
        console.error('Error deleting trade:', error);
        setDeleteError(`Failed to delete trade: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setShowForm(true);
  };

  const handleAddSetup = async (newSetup: string) => {
    if (!auth.currentUser || SETUP_TYPES.includes(newSetup) || customSetups.includes(newSetup)) return;

    const updatedSetups = [...customSetups, newSetup];

    // Update Firestore first
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        customSetups: updatedSetups
      });
      console.log('Custom setup saved to Firestore');
      // Then update local state
      setCustomSetups(updatedSetups);
    } catch (error) {
      console.error('Error adding setup:', error);
    }
  };

  const handleRemoveSetup = async (setupToRemove: string) => {
    if (!auth.currentUser) return;

    const updatedSetups = customSetups.filter(s => s !== setupToRemove);

    // Update Firestore first
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        customSetups: updatedSetups
      });
      // Then update local state
      setCustomSetups(updatedSetups);
    } catch (error) {
      console.error('Error removing setup:', error);
    }
  };

  const handleRenameSetup = async (oldName: string, newName: string) => {
    if (!auth.currentUser || !customSetups.includes(oldName) || customSetups.includes(newName) || SETUP_TYPES.includes(newName)) return;

    const updatedSetups = customSetups.map(s => s === oldName ? newName : s);
    setCustomSetups(updatedSetups);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await updateDoc(userDocRef, {
        customSetups: updatedSetups
      });

      // Update all trades with the old setup name
      const tradesToUpdate = trades.filter(t => t.setup === oldName);
      for (const trade of tradesToUpdate) {
        await updateTrade(trade.id, { ...trade, setup: newName });
      }
    } catch (error) {
      console.error('Error renaming setup:', error);
    }
  };

  const handleAddRule = async (newRule: string) => {
    if (!auth.currentUser || customRules.includes(newRule)) return;

    const updatedRules = [...customRules, newRule];
    setCustomRules(updatedRules);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, {
        customRules: updatedRules
      }, { merge: true });
    } catch (error) {
      console.error('Error adding rule:', error);
    }
  };

  const handleRemoveRule = async (rule: string) => {
    if (!auth.currentUser) return;

    const updatedRules = customRules.filter(r => r !== rule);
    setCustomRules(updatedRules);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, {
        customRules: updatedRules
      }, { merge: true });
    } catch (error) {
      console.error('Error removing rule:', error);
    }
  };

  const handleAddMistake = async (newMistake: string) => {
    if (!auth.currentUser || mistakesList.includes(newMistake)) return;

    const updatedMistakes = [...mistakesList, newMistake];
    setMistakesList(updatedMistakes);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, {
        mistakesList: updatedMistakes
      }, { merge: true });
    } catch (error) {
      console.error('Error adding mistake:', error);
    }
  };

  const handleRemoveMistake = async (mistake: string) => {
    if (!auth.currentUser) return;

    const updatedMistakes = mistakesList.filter(m => m !== mistake);
    setMistakesList(updatedMistakes);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, {
        mistakesList: updatedMistakes
      }, { merge: true });
    } catch (error) {
      console.error('Error removing mistake:', error);
    }
  };

  const updateChallenge = async (newChallenge: GrowthChallenge) => {
    if (!auth.currentUser) return;

    setChallenge(newChallenge);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, {
        challenge: newChallenge
      }, { merge: true });
    } catch (error) {
      console.error('Error updating challenge:', error);
    }
  };

  const archiveChallenge = async (challengeToArchive: GrowthChallenge) => {
    if (!auth.currentUser) return;

    const updatedHistory = [
      { ...challengeToArchive, status: 'completed' as const, endDate: new Date().toISOString() },
      ...completedChallenges
    ];
    setCompletedChallenges(updatedHistory);

    // Reset to a default new challenge
    const newChallenge: GrowthChallenge = {
      id: crypto.randomUUID(),
      title: "Next Professional Milestone",
      startingCapital: challengeToArchive.targetCapital, // Compound effect
      targetCapital: challengeToArchive.targetCapital * 2,
      currentCapital: challengeToArchive.targetCapital,
      startDate: new Date().toISOString(),
      status: 'active'
    };
    setChallenge(newChallenge);

    // Update Firestore
    const userDocRef = doc(db, 'users', auth.currentUser.uid);
    try {
      await setDoc(userDocRef, {
        challenge: newChallenge,
        completedChallenges: updatedHistory
      }, { merge: true });
    } catch (error) {
      console.error('Error archiving challenge:', error);
    }
  };

  const cycleTheme = () => {
    if (theme === 'default') setTheme('midnight');
    else if (theme === 'midnight') setTheme('oled');
    else if (theme === 'oled') setTheme('light');
    else setTheme('default');
  };

  const allSetups = [...SETUP_TYPES, ...customSetups];

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gray-950 text-primary flex flex-col md:flex-row transition-all duration-500 ease-in-out">

      {/* Sidebar Navigation */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-700 flex flex-col h-screen transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50 group-hover:scale-110 transition-transform">
              <LineChart className="text-white h-5 w-5" />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">Trading Diary</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: View.DASHBOARD, icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            { id: View.JOURNAL, icon: <BookOpen size={20} />, label: 'Trade Journal' },
            { id: View.CALENDAR, icon: <Calendar size={20} />, label: 'Calendar' },
            { id: View.CHALLENGE, icon: <Trophy size={20} />, label: 'Growth Challenge' },
            { id: View.SETUP_MANAGER, icon: <Settings2 size={20} />, label: 'Setup Manager' },
            { id: View.ANALYSIS, icon: <Wallet size={20} />, label: 'AI Coach', highlight: true },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setCurrentView(item.id as View); setSidebarOpen(false); }}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all transform hover:translate-x-1 ${
                currentView === item.id
                  ? item.highlight ? 'bg-purple-600/10 text-purple-400 border border-purple-600/20' : 'bg-blue-600/10 text-blue-400 border border-blue-600/20'
                  : 'text-secondary hover:bg-gray-800 hover:text-primary'
              }`}
            >
              {item.icon}
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* User Profile & Actions */}
        <div className="p-4 border-t border-gray-700 bg-gray-900/50">
           <button
            onClick={() => {
              setEditingTrade(null);
              setShowForm(true);
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 shadow-lg shadow-blue-900/30 mb-4 hover:scale-[1.02] active:scale-95"
          >
            <Plus size={20} />
            <span>Log Trade</span>
          </button>

           <div className="flex items-center gap-3 mb-4 px-1">
             <div className="w-10 h-10 rounded-full bg-gray-700 border border-gray-600 overflow-hidden ring-2 ring-blue-500/20">
               {user?.avatar ? (
                 <img src={user.avatar} alt="User" className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-gray-400"><User size={20} /></div>
               )}
             </div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate">{user?.name}</p>
               <p className="text-[10px] text-gray-500 truncate uppercase tracking-widest">{user?.email}</p>
             </div>
           </div>

           <div className="grid grid-cols-2 gap-2">
             <button
               onClick={cycleTheme}
               className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-gray-700 border border-gray-700 text-[10px] text-gray-400 hover:text-white transition-colors capitalize font-bold"
             >
               <Palette size={14} />
               {theme}
             </button>
             <button
               onClick={handleLogout}
               className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800 hover:bg-red-900/20 border border-gray-700 hover:border-red-900/30 text-[10px] text-gray-400 hover:text-red-400 transition-colors font-bold"
             >
               <LogOut size={14} />
               Logout
             </button>
           </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto h-screen p-4 md:p-8 relative scroll-smooth">
        <header className="flex items-center justify-between mb-10 animate-fade-in-up">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="md:hidden p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white mr-4">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <div>
            <h1 className="text-3xl font-black text-primary tracking-tight">{currentView}</h1>
            <p className="text-secondary text-sm mt-1">
              {currentView === View.CHALLENGE ? "Your journey to professional status." : `Welcome back, ${user?.name.split(' ')[0]}. Analyzing ${trades.length} data points.`}
            </p>
          </div>
          <div className="hidden md:flex items-center gap-4">
            <div className="bg-gray-800/50 border border-gray-700 px-4 py-2 rounded-xl text-xs font-bold text-gray-400">
               STREAK: <span className="text-trading-green">12 DAYS</span>
            </div>
            <span className="text-xs font-mono text-secondary border border-gray-700 px-2 py-1 rounded bg-gray-900">v1.3.0</span>
          </div>
        </header>

        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700 ease-out">
          {deleteError && (
            <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">!</span>
                </div>
                <div>
                  <p className="text-red-400 font-bold text-sm">Delete Error</p>
                  <p className="text-red-300 text-xs">{deleteError}</p>
                </div>
              </div>
              <button
                onClick={() => setDeleteError(null)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                ×
              </button>
            </div>
          )}
          {currentView === View.DASHBOARD && <Dashboard trades={trades} />}
          {currentView === View.JOURNAL && (
            <div className="h-[calc(100vh-14rem)]">
              <TradeList trades={trades} onEdit={handleEditTrade} onDelete={handleDeleteTrade} availableSetups={allSetups} initialSetupFilter={journalSetupFilter} />
            </div>
          )}
          {currentView === View.CALENDAR && (
            <div className="h-[calc(100vh-14rem)]">
              <TradeCalendar trades={trades} />
            </div>
          )}
          {currentView === View.CHALLENGE && (
            <ChallengeView
              trades={trades}
              challenge={challenge}
              onUpdateChallenge={updateChallenge}
              completedChallenges={completedChallenges}
              onArchiveChallenge={archiveChallenge}
            />
          )}
          {currentView === View.SETUP_MANAGER && (
            <SetupManager
              trades={trades}
              customSetups={customSetups}
              onAddSetup={handleAddSetup}
              onRemoveSetup={handleRemoveSetup}
              onRenameSetup={handleRenameSetup}
              navigateToJournalWithFilter={(setup: string) => { setCurrentView(View.JOURNAL); setJournalSetupFilter(setup); }}
            />
          )}
          {currentView === View.ANALYSIS && <AIAnalyst trades={trades} />}
        </div>
      </main>

      {/* Modals & Celebrations */}
      {showForm && (
        <TradeForm
          initialData={editingTrade}
          onSave={handleSaveTrade}
          onCancel={() => { setShowForm(false); setEditingTrade(null); }}
          availableSetups={allSetups}
          availableRules={customRules}
          availableMistakes={mistakesList}
          onAddSetup={handleAddSetup}
          onRemoveSetup={handleRemoveSetup}
          onAddRule={handleAddRule}
          onRemoveRule={handleRemoveRule}
          onAddMistake={handleAddMistake}
          onRemoveMistake={handleRemoveMistake}
        />
      )}

      {recentlySavedTrade && (
        <SuccessCelebration
          trade={recentlySavedTrade}
          onClose={() => setRecentlySavedTrade(null)}
        />
      )}
    </div>
  );
};

export default App;
