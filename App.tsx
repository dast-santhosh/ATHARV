import React, { useState, useEffect } from 'react';
import { LessonPlan } from './types';
import { solveOnBlackboard } from './services/geminiService';
import Blackboard from './components/Blackboard';
import InputTab from './components/InputTab';
import { Menu, X, Smartphone, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [language, setLanguage] = useState('English');
  
  // State for content
  const [lessonPlan, setLessonPlan] = useState<LessonPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [tabOpen, setTabOpen] = useState(true);

  // Landscape Orientation Prompt State
  const [showRotatePrompt, setShowRotatePrompt] = useState(false);

  useEffect(() => {
    const checkOrientation = () => {
      // Logic: If width < 768px (Mobile) AND Height > Width (Portrait)
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        setShowRotatePrompt(true);
      } else {
        setShowRotatePrompt(false);
      }
    };

    // Check initially
    checkOrientation();
    
    // Add listener
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setLessonPlan(null); // Clear previous

    // On mobile, close tab to see result automatically
    if (window.innerWidth < 768) {
        setTabOpen(false);
    }
    
    try {
      const result = await solveOnBlackboard(prompt, language);
      setLessonPlan(result);
    } catch (error) {
      console.error(error);
      setLessonPlan({
          steps: [
              { board: "<h1>Connection Error</h1><p>Could not reach Atharv. Please try again.</p>", spoken: "Sorry students, I lost connection. Please ask again.", visualType: 'html' }
          ]
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setLessonPlan(null);
    setPrompt('');
    setTabOpen(true);
  };

  return (
    <div className="h-screen w-screen bg-slate-900 flex overflow-hidden font-sans select-none">
      
      {/* MOBILE LANDSCAPE PROMPT OVERLAY */}
      {showRotatePrompt && (
        <div className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-md flex flex-col items-center justify-center text-white text-center p-8 animate-in fade-in">
            <RotateCcw size={64} className="mb-6 text-yellow-400 animate-spin-slow" />
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">Please Rotate Your Phone</h2>
            <p className="text-lg text-slate-300 max-w-md mb-8">
                Atharv's Blackboard works best in <b>Landscape Mode</b>. 
                Please turn your device sideways for the full classroom experience.
            </p>
            <div className="flex gap-4">
                 <div className="w-16 h-24 border-2 border-slate-600 rounded-lg flex items-center justify-center">
                    <Smartphone size={24} className="text-slate-600" />
                 </div>
                 <div className="flex items-center text-yellow-400">
                    →
                 </div>
                 <div className="w-24 h-16 border-2 border-yellow-400 rounded-lg flex items-center justify-center bg-yellow-400/10 shadow-[0_0_15px_rgba(250,204,21,0.3)]">
                    <Smartphone size={24} className="text-yellow-400 rotate-90" />
                 </div>
            </div>
            <button 
                onClick={() => setShowRotatePrompt(false)}
                className="mt-12 text-sm text-slate-500 underline hover:text-slate-300"
            >
                Dismiss (Use Portrait anyway)
            </button>
        </div>
      )}

      {/* SIDEBAR TOGGLE (Mobile & Desktop) */}
      <button 
        onClick={() => setTabOpen(!tabOpen)}
        className={`fixed z-50 p-2 rounded-full shadow-lg transition-all duration-300 ${
            tabOpen 
            ? 'top-4 left-[280px] md:left-[360px] bg-slate-800 text-white' 
            : 'top-4 left-4 bg-yellow-400 text-black'
        }`}
      >
        {tabOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex relative">
          
          {/* SIDEBAR (InputTab) */}
          <div 
            className={`
                absolute top-0 bottom-0 left-0 z-40 h-full shadow-2xl transition-all duration-300 ease-in-out
                w-[300px] md:w-[380px]
                ${tabOpen ? 'translate-x-0' : '-translate-x-full'}
            `}
          >
            <InputTab 
                prompt={prompt} 
                setPrompt={setPrompt} 
                onSubmit={handleSubmit} 
                loading={loading}
                language={language}
                setLanguage={setLanguage}
            />
          </div>

          {/* BLACKBOARD AREA */}
          <div 
             className={`
                flex-1 h-full transition-all duration-300 ease-in-out
                ${tabOpen ? 'ml-[300px] md:ml-[380px]' : 'ml-0'}
             `}
          >
            <Blackboard 
                lessonPlan={lessonPlan} 
                loading={loading} 
                onClear={handleClear} 
                language={language}
            />
          </div>

      </div>
    </div>
  );
};

export default App;
