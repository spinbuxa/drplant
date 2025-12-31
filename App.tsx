import React, { useState, useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { Hero } from './components/Hero';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryList } from './components/HistoryList';
import { analyzePlantImage } from './services/geminiService';
import { PlantAnalysisResult } from './types';
import { Loader2, Leaf } from 'lucide-react';

const STORAGE_KEY = 'drplant_history_v1';
const THEME_KEY = 'drplant_theme';

const App: React.FC = () => {
  const [analysis, setAnalysis] = useState<PlantAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<PlantAnalysisResult[]>([]);
  
  // Theme State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme) {
        return savedTheme === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Apply Theme Effect
  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load history", e);
    }
  }, []);

  const saveToHistory = (result: PlantAnalysisResult) => {
    const newResult = { ...result, imageUrl: selectedImage || undefined };
    const updatedHistory = [newResult, ...history].slice(0, 10); // Keep last 10
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const removeFromHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedHistory = history.filter(h => h.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    // 1. Update Current View State
    if (analysis && analysis.id === id) {
      setAnalysis({ ...analysis, userNotes: notes });
    }

    // 2. Update History & Storage (only if it exists in history)
    const existsInHistory = history.some(h => h.id === id);
    if (existsInHistory) {
      const updatedHistory = history.map(h =>
        h.id === id ? { ...h, userNotes: notes } : h
      );
      setHistory(updatedHistory);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    }
  };

  const handleImageSelected = async (base64Image: string) => {
    setSelectedImage(base64Image);
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    // Scroll to analysis section
    window.scrollTo({ top: 100, behavior: 'smooth' });

    try {
      const result = await analyzePlantImage(base64Image);
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setError('Ocorreu um erro ao analisar a imagem. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHistorySelect = (item: PlantAnalysisResult) => {
    setAnalysis(item);
    setSelectedImage(item.imageUrl || null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleReset = () => {
    setAnalysis(null);
    setSelectedImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isCurrentAnalysisSaved = analysis ? history.some(h => h.id === analysis.id) : false;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      <AppHeader onReset={handleReset} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-grow container mx-auto px-4 py-8 max-w-4xl">
        {!selectedImage ? (
          <>
            <Hero />
            <div className="mt-12">
              <ImageUpload onImageSelected={handleImageSelected} />
            </div>
            
            {/* History Section */}
            <HistoryList items={history} onSelect={handleHistorySelect} onDelete={removeFromHistory} />

            {/* Features Section */}
            {history.length === 0 && (
              <div className="mt-20 grid md:grid-cols-3 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center transition-colors">
                  <div className="bg-green-100 dark:bg-green-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf className="text-green-600 dark:text-green-400" size={24} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Diagnóstico Preciso</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Identifica mais de 500 doenças comuns em diversas culturas.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center transition-colors">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Tratamento Expert</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Receba recomendações de tratamentos biológicos e químicos.</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 text-center transition-colors">
                  <div className="bg-amber-100 dark:bg-amber-900/30 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-slate-100">Ação Rápida</h3>
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Resultados em segundos para salvar sua colheita a tempo.</p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="animate-fade-in">
             <button 
                onClick={handleReset}
                className="mb-6 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-2 transition-colors"
              >
                ← Voltar para início
              </button>

            <div className="grid md:grid-cols-2 gap-8 items-start">
              <div className="relative bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden group transition-colors">
                <img 
                  src={selectedImage} 
                  alt="Planta analisada" 
                  className="w-full h-auto rounded-xl object-cover max-h-[500px]" 
                />
                
                {/* Scanner Effect */}
                {isLoading && (
                  <div className="absolute inset-4 rounded-xl overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_rgba(74,222,128,0.8)] animate-[scan_2s_linear_infinite]"></div>
                    <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
                  </div>
                )}
                <style>{`
                  @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                  }
                `}</style>
              </div>

              <div>
                {isLoading && (
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-8 text-center animate-pulse transition-colors">
                    <Loader2 className="animate-spin text-green-600 dark:text-green-400 mb-4" size={48} />
                    <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Analisando sua planta...</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-6">Nossa IA está examinando sintomas visuais, folhas e padrões.</p>
                    <div className="flex gap-2 text-xs text-slate-400 dark:text-slate-500">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Fitopatologia</span>
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Entomologia</span>
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Nutrição</span>
                    </div>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <p className="text-red-600 dark:text-red-300 font-medium">{error}</p>
                    <button 
                      onClick={() => handleImageSelected(selectedImage)}
                      className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                )}

                {analysis && !isLoading && (
                  <AnalysisResults 
                    result={analysis} 
                    onSave={saveToHistory}
                    isSaved={isCurrentAnalysisSaved}
                    onUpdateNotes={handleUpdateNotes}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-8 mt-auto transition-colors">
        <div className="container mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Dr Plant. Desenvolvido por Daniel Possamai Vieira.</p>
          <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">Nota: Esta ferramenta utiliza IA e pode cometer erros. Consulte sempre um agrônomo profissional para casos críticos.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;