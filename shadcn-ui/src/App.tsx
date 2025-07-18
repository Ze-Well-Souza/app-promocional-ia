import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ContentScreen } from '@/components/screens/content-screen';
import { CustomizeScreen } from '@/components/screens/customize-screen';
import { PreviewScreen } from '@/components/screens/preview-screen';
import { useContentStore } from '@/store/content-store';

type Screen = 'content' | 'customize' | 'preview';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('content');
  const { createNewContent } = useContentStore();

  useEffect(() => {
    // Initialize with new content on app start
    createNewContent();
  }, [createNewContent]);

  const handleNext = () => {
    if (currentScreen === 'content') {
      setCurrentScreen('customize');
    } else if (currentScreen === 'customize') {
      setCurrentScreen('preview');
    }
  };

  const handleBack = () => {
    if (currentScreen === 'preview') {
      setCurrentScreen('customize');
    } else if (currentScreen === 'customize') {
      setCurrentScreen('content');
    }
  };

  const handleRestart = () => {
    createNewContent();
    setCurrentScreen('content');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'content':
        return <ContentScreen onNext={handleNext} />;
      case 'customize':
        return <CustomizeScreen onBack={handleBack} onNext={handleNext} />;
      case 'preview':
        return <PreviewScreen onBack={handleBack} onRestart={handleRestart} />;
      default:
        return <ContentScreen onNext={handleNext} />;
    }
  };

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">🚀</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">App Promocional IA</h1>
                  <p className="text-sm text-gray-500">Crie conteúdo promocional com inteligência artificial</p>
                </div>
              </div>
              
              {/* Progress indicator */}
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentScreen === 'content' ? 'bg-blue-500 text-white' : 
                  ['customize', 'preview'].includes(currentScreen) ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-8 h-1 ${
                  ['customize', 'preview'].includes(currentScreen) ? 'bg-green-500' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentScreen === 'customize' ? 'bg-blue-500 text-white' : 
                  currentScreen === 'preview' ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
                <div className={`w-8 h-1 ${
                  currentScreen === 'preview' ? 'bg-green-500' : 'bg-gray-200'
                }`} />
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold ${
                  currentScreen === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  3
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-8">
          {renderScreen()}
        </main>

        {/* Footer */}
        <footer className="bg-white border-t mt-16">
          <div className="max-w-7xl mx-auto px-6 py-8">
            <div className="text-center text-sm text-gray-500">
              <p>© 2025 App Promocional IA - Criando conteúdo promocional com inteligência artificial</p>
              <p className="mt-1">Feito com ❤️ para o mercado brasileiro</p>
            </div>
          </div>
        </footer>
      </div>
      <Toaster position="top-right" />
    </TooltipProvider>
  );
};

export default App;