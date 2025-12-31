import React, { useState, useEffect } from 'react';
import { SiteHeader } from './components/SiteHeader';
import { FooterNav } from './components/FooterNav';
import { PlantWeather } from './components/PlantWeather';
import { ImageUpload } from './components/ImageUpload';
import { AnalysisResults } from './components/AnalysisResults';
import { HistoryList } from './components/HistoryList';
import { analyzePlantImage } from './services/geminiService';
import { PlantAnalysisResult } from './types';
import { Loader2, AlertTriangle, Users, BookOpen, Calculator, Sprout, Bug } from 'lucide-react';

const STORAGE_KEY = 'drplant_history_v1';
const THEME_KEY = 'drplant_theme';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [analysis, setAnalysis] = useState<PlantAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<PlantAnalysisResult[]>([]);
  
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
    const updatedHistory = [newResult, ...history].slice(0, 10);
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
    setActiveTab('home');
    
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
    handleReset();
    setActiveTab('home');
    setTimeout(() => {
        const uploadElement = document.getElementById('image-upload-area');
        if(uploadElement) {
            uploadElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            uploadElement.classList.add('ring-4', 'ring-green-400', 'transition-all');
            setTimeout(() => uploadElement.classList.remove('ring-4', 'ring-green-400'), 1500);
        }
    }, 100);
  };

  const isCurrentAnalysisSaved = analysis ? history.some(h => h.id === analysis.id) : false;

  const renderContent = () => {
    if (activeTab === 'community') {
      return (
        <div className="space-y-6 animate-fade-in py-4">
           <div className="text-center py-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
             <div className="bg-green-100 dark:bg-green-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
               <Users size={32} className="text-green-600 dark:text-green-400" />
             </div>
             <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">Comunidade Dr Plant</h2>
             <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto text-sm">
               Tire dúvidas, compartilhe fotos da sua colheita e aprenda com especialistas.
             </p>
             <button className="mt-6 px-8 py-2.5 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-colors text-sm shadow-md shadow-green-200 dark:shadow-none">
               Participar da Conversa
             </button>
           </div>
           
           <div className="flex items-center justify-between px-1">
             <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">Discussões Populares</h3>
             <span className="text-green-600 dark:text-green-400 text-xs font-semibold">Ver tudo</span>
           </div>

           {[1, 2, 3].map(i => (
             <div key={i} className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
               <div className="flex gap-3 mb-3">
                 <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex-shrink-0"></div>
                 <div>
                   <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">João Agricultor</p>
                   <p className="text-xs text-slate-400">Tomate • Há 2 horas</p>
                 </div>
               </div>
               <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                 Minhas folhas de tomate estão amarelando nas bordas. Já apliquei cálcio mas não resolveu. Alguém já viu isso?
               </p>
               <div className="mt-3 flex gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><Users size={12}/> 5 respostas</span>
                  <span className="flex items-center gap-1">👁️ 124 views</span>
               </div>
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
           <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300">Em Desenvolvimento</h2>
           <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-xs mx-auto text-sm">Estamos preparando conteúdos exclusivos para você cultivar melhor.</p>
           {activeTab === 'profile' && (
             <div className="mt-8 pt-8 border-t border-slate-200 dark:border-slate-700 w-full max-w-xs">
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-2">Desenvolvedor</p>
                <p className="font-bold text-slate-700 dark:text-slate-200">Daniel Possamai Vieira</p>
             </div>
           )}
        </div>
      );
    }

    return (
      <div className="animate-fade-in space-y-6">
        {!selectedImage ? (
          <>
            <div className="relative">
               <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-4 px-1">Olá, Produtor 👋</h1>
               <PlantWeather />
            </div>
            
            <div id="image-upload-area" className="scroll-mt-24 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-md border border-slate-100 dark:border-slate-700 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-full h-1 bg-green-500"></div>
               <div className="flex flex-col items-center text-center">
                  <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 mb-2">
                    Cure sua plantação
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs">
                    Tire uma foto para detectar doenças, pragas e deficiências nutricionais em segundos.
                  </p>
                  <ImageUpload onImageSelected={handleImageSelected} />
               </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600 dark:text-orange-400 group-hover:scale-110 transition-transform">
                    <Calculator size={24} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Calculadora de<br/>Fertilizantes</span>
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <Bug size={24} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Biblioteca de<br/>Pragas</span>
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform">
                    <Sprout size={24} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Dicas de<br/>Cultivo</span>
               </div>
               <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center text-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Fórum de<br/>Especialistas</span>
               </div>
            </div>
            
            {history.length > 0 && (
               <div className="pt-2">
                 <HistoryList items={history} onSelect={handleHistorySelect} onDelete={removeFromHistory} />
               </div>
            )}
            
            <div className="py-6 text-center">
              <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-600 font-semibold mb-1">Desenvolvido por</p>
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Daniel Possamai Vieira</p>
            </div>
          </>
        ) : (
          <div className="animate-fade-in">
            <button 
              onClick={handleReset}
              className="mb-4 text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 flex items-center gap-2 transition-colors font-medium text-sm"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center shadow-sm border border-slate-200 dark:border-slate-700">
                ←
              </div>
              Voltar para início
            </button>

            <div className="grid md:grid-cols-2 gap-6 items-start">
              <div className="relative bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden group transition-colors">
                <img 
                  src={selectedImage} 
                  alt="Planta analisada" 
                  className="w-full h-auto rounded-xl object-cover max-h-[400px]" 
                />
                
                {isLoading && (
                  <div className="absolute inset-2 rounded-xl overflow-hidden pointer-events-none z-10">
                    <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_20px_rgba(74,222,128,1)] animate-[scan_2s_linear_infinite]"></div>
                    <div className="absolute inset-0 bg-green-900/20 animate-pulse"></div>
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
                  <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-8 text-center animate-pulse">
                    <Loader2 className="animate-spin text-green-600 dark:text-green-400 mb-6" size={56} />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Diagnosticando...</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8 text-sm max-w-xs mx-auto">
                      Nossa IA está analisando padrões nas folhas e identificando possíveis patógenos.
                    </p>
                    <div className="flex gap-2 text-[10px] text-slate-400 font-mono uppercase tracking-wider">
                      <span>Analisando Textura</span> • <span>Identificando Cores</span>
                    </div>
                  </div>
                )}

                {error && !isLoading && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                    <AlertTriangle className="mx-auto text-red-500 mb-3" size={40} />
                    <h3 className="font-bold text-red-700 dark:text-red-200 mb-2">Falha na Análise</h3>
                    <p className="text-red-600 dark:text-red-300 text-sm mb-6">{error}</p>
                    <button 
                      onClick={() => handleImageSelected(selectedImage)}
                      className="px-6 py-2.5 bg-white border border-red-200 text-red-700 rounded-full hover:bg-red-50 transition-colors font-medium text-sm shadow-sm"
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

  export default App;