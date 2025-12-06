import React, { useState, useEffect } from 'react';
import { analyzeFoodImage } from './services/geminiService';
import { ImageUploader } from './components/ImageUploader';
import { NutritionDisplay } from './components/NutritionDisplay';
import { DailySummary } from './components/DailySummary';
import { AppState, AnalysisResult } from './types';
import { Utensils, Loader2, Info, LogOut, LogIn } from 'lucide-react';
import { auth, googleProvider, db } from './services/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const saveScanToFirestore = async (analysisData: AnalysisResult, imageUrl: string) => {
    if (!user) return;
    setSaving(true);
    try {
      await addDoc(collection(db, "scans"), {
        userId: user.uid,
        userEmail: user.email,
        timestamp: serverTimestamp(),
        analysis: analysisData,
      });
      console.log("Scan saved to Firestore!");
    } catch (e) {
      console.error("Error adding document: ", e);
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelected = async (base64: string) => {
    setImage(base64);
    setAppState(AppState.ANALYZING);
    setError(null);

    try {
      const analysisData = await analyzeFoodImage(base64);
      setResult(analysisData);
      setAppState(AppState.SUCCESS);

      if (user) {
        saveScanToFirestore(analysisData, base64);
      }
    } catch (err) {
      console.error(err);
      setError("We couldn't analyze that image. Please ensure it's a clear photo of food and try again.");
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setAppState(AppState.IDLE);
    setImage(null);
    setResult(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-500 p-2 rounded-lg text-white">
              <Utensils size={20} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">NutriSnap</h1>
          </div>

          <div className="flex items-center gap-4">
            {appState === AppState.SUCCESS && (
              <button onClick={handleReset} className="text-sm font-medium text-slate-500 hover:text-green-600 transition">
                New Scan
              </button>
            )}

            {user ? (
              <div className="flex items-center gap-3">
                <img src={user.photoURL || ''} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
                <button onClick={handleLogout} className="text-sm font-medium text-slate-500 hover:text-red-600 transition flex items-center gap-1">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={handleLogin} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition">
                <LogIn size={16} />
                Sign In
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">

        {/* Intro Text (only visible when IDLE) */}
        {appState === AppState.IDLE && (
          <div className="text-center mb-10 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">
              Know what's on <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                your plate.
              </span>
            </h2>
            <p className="text-lg text-slate-600 max-w-lg mx-auto">
              Snap a photo of your meal to get instant calorie counts and nutritional insights powered by AI.
            </p>
            {!user && (
              <p className="text-sm text-slate-400">Sign in to save your history automatically.</p>
            )}
          </div>
        )}

        {/* State Management */}
        {appState === AppState.IDLE && (
          <>
            <ImageUploader onImageSelected={handleImageSelected} />
            {user && <DailySummary user={user} />}
          </>
        )}

        {appState === AppState.ANALYZING && image && (
          <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in duration-500">
            <div className="relative w-64 h-64 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <img src={image} alt="Analyzing" className="w-full h-full object-cover opacity-80" />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                <div className="bg-white/90 p-4 rounded-full shadow-lg">
                  <Loader2 className="animate-spin text-green-600" size={40} />
                </div>
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-green-500 animate-loading-bar"></div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold text-slate-800">Analyzing your meal...</h3>
              <p className="text-slate-500 mt-1">Identifying ingredients and calculating macros</p>
            </div>
          </div>
        )}

        {appState === AppState.ERROR && (
          <div className="max-w-md mx-auto bg-red-50 border border-red-200 rounded-2xl p-6 text-center animate-in zoom-in-95 duration-300">
            <div className="bg-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 shadow-sm">
              <Info size={24} />
            </div>
            <h3 className="text-lg font-bold text-red-800 mb-2">Analysis Failed</h3>
            <p className="text-red-600 mb-6 text-sm">{error}</p>
            <button
              onClick={handleReset}
              className="w-full py-3 bg-white border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-100 transition shadow-sm"
            >
              Try Again
            </button>
          </div>
        )}

        {appState === AppState.SUCCESS && result && (
          <>
            {user && saving && <p className="text-center text-xs text-slate-400 mb-2">Saving to history...</p>}
            <NutritionDisplay data={result} onReset={handleReset} />
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 text-center text-slate-400 text-xs">
        <p>NutriSnap uses AI. Results are estimates and should not be used for medical purposes.</p>
      </footer>

      {/* Custom Styles for animations */}
      <style>{`
        @keyframes loading-bar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
        .animate-loading-bar {
          animation: loading-bar 1.5s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default App;
