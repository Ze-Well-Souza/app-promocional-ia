import React, { useState, useEffect } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ContentScreen } from '@/components/screens/content-screen';
import { CustomizeScreen } from '@/components/screens/customize-screen';
import { PreviewScreen } from '@/components/screens/preview-screen';
import { EnvironmentIndicator, EnvironmentInfo } from '@/components/ui/environment-indicator';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useContentStore } from '@/store/content-store';
import { logEnvironmentInfo, envConfig } from '@/lib/env-config';

type Screen = 'content' | 'customize' | 'preview';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('content');
  const { createNewContent } = useContentStore();

  useEffect(() => {
    // Initialize environment and app
    logEnvironmentInfo();
    
    // Initialize with new content on app start
    try {
      createNewContent();
    } catch (error) {
      console.error('Error initializing app:', error);
    }
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 transition-colors duration-500">
        {/* Environment Indicators */}
        <EnvironmentIndicator showVersion={true} />
        <EnvironmentInfo />
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-md border-b shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center transition-transform duration-300 hover:scale-110">
                  <span className="text-white font-bold text-lg">🚀</span>
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-foreground transition-colors duration-300">{envConfig.appName}</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground transition-colors duration-300">Crie conteúdo promocional com inteligência artificial</p>
                </div>
              </div>
              
              {/* Theme Toggle and Progress */}
              <div className="flex items-center gap-4">
                <ThemeToggle />
              
                {/* Progress indicator */}
                <div className="flex items-center gap-1 sm:gap-2">
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                    currentScreen === 'content' ? 'bg-blue-500 text-white scale-110 shadow-lg' : 
                    ['customize', 'preview'].includes(currentScreen) ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    1
                  </div>
                  <div className={`w-4 sm:w-8 h-1 transition-all duration-500 ${
                    ['customize', 'preview'].includes(currentScreen) ? 'bg-green-500' : 'bg-muted'
                  }`} />
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                    currentScreen === 'customize' ? 'bg-blue-500 text-white scale-110 shadow-lg' : 
                    currentScreen === 'preview' ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                  }`}>
                    2
                  </div>
                  <div className={`w-4 sm:w-8 h-1 transition-all duration-500 ${
                    currentScreen === 'preview' ? 'bg-green-500' : 'bg-muted'
                  }`} />
                  <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all duration-500 ${
                    currentScreen === 'preview' ? 'bg-blue-500 text-white scale-110 shadow-lg' : 'bg-muted text-muted-foreground'
                  }`}>
                    3
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="py-4 sm:py-8 px-4 sm:px-0">
          {renderScreen()}
        </main>

        {/* Footer */}
        <footer className="bg-background/80 backdrop-blur-md border-t mt-8 sm:mt-16 transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
            <div className="text-center text-xs sm:text-sm text-muted-foreground transition-colors duration-300">
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