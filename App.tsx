import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { WeatherWidget } from './components/WeatherWidget';
import { Hero } from './components/Hero';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryList } from './components/HistoryList';
import { analyzePlantImage } from './services/geminiService';
import { PlantAnalysisResult } from './types';
import { Loader2, Leaf, AlertTriangle, Users, BookOpen } from 'lucide-react';

const STORAGE_KEY = 'drplant_history_v1';
const THEME_KEY = 'drplant_theme';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
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
    if (analysis && analysis.id === id) {
      setAnalysis({ ...analysis, userNotes: notes });
    }
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
    setActiveTab('home'); // Ensure we are on home view
    
    // Scroll to analysis section
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
    setActiveTab('home');
  };

  const handleReset = () => {
    setAnalysis(null);
    setSelectedImage(null);
    setError(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveTab('home');
  };

  const triggerCamera = () => {
    // Logic to trigger file input click is handled by ref in ImageUpload usually, 
    // but for now we just scroll to the uploader and highlight it, or reset state to show uploader.
    handleReset();
    setActiveTab('home');
    setTimeout(() => {
        const uploadElement = document.getElementById('image-upload-area');
        if(uploadElement) {
            uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            uploadElement.classList.add('ring-4', 'ring-green-400');
            setTimeout(() => uploadElement.classList.remove('ring-4', 'ring-green-400'), 1000);
        }
    }, 100);
  };

  const isCurrentAnalysisSaved = analysis ? history.some(h => h.id === analysis.id) : false;

  const renderContent = () => {
    if (activeTab === 'community') {
      return (
        <div className="space-y-6 animate-fade-in py-6">
           <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
             <Users size={48} className="mx-auto text-green-500 mb-4" />
             <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Comunidade de Produtores</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto">Conecte-se com outros agricultores e especialistas para trocar experiências.</p>
             <button className="mt-6 px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors">
               Entrar no Fórum
             </button>
           </div>
           
           <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200 px-2">Destaques Recentes</h3>
           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
               <div className="flex gap-3 mb-2">
                 <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600"></div>
                 <div>
                   <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">Produtor Rural {i}</p>
                   <p className="text-xs text-slate-400">Há 2 horas</p>
                 </div>
               </div>
               <p className="text-slate-600 dark:text-slate-300 text-sm">Alguém sabe identificar essa mancha nas folhas do tomateiro? Apareceu depois da chuva.</p>
             </div>
           ))}
        </div>
      );
    }
    
    if (activeTab === 'library' || activeTab === 'profile') {
      return (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center animate-fade-in">
           <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-full mb-4">
             {activeTab === 'library' ? <BookOpen size={40} className="text-slate-400" /> : <Users size={40} className="text-slate-400" />}
           </div>
           <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Em Breve</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-2">Esta funcionalidade estará disponível na próxima atualização.</p>
        </div>
      );
    }

    // Default: Home Tab
    return (
      <div className="animate-fade-in">
        {!selectedImage ? (
          <>
            <WeatherWidget />
            
            <div id="image-upload-area" className="scroll-mt-24">
               <div className="mb-6 flex items-center justify-between">
                 <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Diagnóstico de Saúde</h2>
               </div>
               <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 text-center mb-8">
                  <div className="bg-green-50 dark:bg-green-900/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Leaf size={32} className="text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-slate-900 dark:text-slate-100">Sua colheita está saudável?</h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">Tire uma foto para detectar doenças, pragas ou deficiências nutricionais instantaneamente.</p>
                  <ImageUpload onImageSelected={handleImageSelected} />
               </div>
            </div>
            
            <HistoryList items={history} onSelect={handleHistorySelect} onDelete={removeFromHistory} />
          </>
        ) : (
          <div>
            <button 
              onClick={handleReset}
              className="mb-6 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-2 transition-colors font-medium bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700"
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
                    <div className="flex gap-2 text-xs text-slate-400 dark:text-slate-500 justify-center">
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Fitopatologia</span>
                      <span className="bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">Entomologia</span>
                    </div>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-2" size={32} />
                    <p className="text-red-600 dark:text-red-300 font-medium mb-4">{error}</p>
                    <button 
                      onClick={() => handleImageSelected(selectedImage)}
                      className="px-6 py-2 bg-red-100 dark:bg-red-800/50 text-red-700 dark:text-red-200 rounded-full hover:bg-red-200 dark:hover:bg-red-800 transition-colors font-medium"
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
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300 pb-20">
      <Navbar onReset={handleReset} isDarkMode={isDarkMode} toggleTheme={toggleTheme} />
      
      <main className="flex-grow container mx-auto px-4 py-6 max-w-2xl">
        {renderContent()}
      </main>

      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onCameraClick={triggerCamera} 
      />
    </div>
  );
};

export default App;