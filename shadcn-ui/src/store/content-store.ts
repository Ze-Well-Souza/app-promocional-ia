import { create } from 'zustand';
import { 
  ContentData, 
  APIKeys, 
  UserSettings, 
  ColorSettings, 
  AIProvider, 
  PromotionType,
  LoadingOperation,
  LoadingState,
  DetailedLoadingStates,
  LOADING_MESSAGES,
  ESTIMATED_DURATIONS
} from '@/types';
import { StorageService } from '@/lib/storage';
import { APIService } from '@/lib/api-services';

interface ContentStore {
  // State
  content: ContentData;
  apiKeys: APIKeys;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  validatingKeys: Record<keyof APIKeys, boolean>;
  keyValidationStatus: Record<keyof APIKeys, boolean | null>;
  
  // Detailed Loading States
  loadingStates: DetailedLoadingStates;
  currentOperation: LoadingOperation;
  
  // Actions
  setContent: (updates: Partial<ContentData>) => void;
  setAPIKey: (provider: keyof APIKeys, key: string) => Promise<void>;
  getAPIKey: (provider: keyof APIKeys) => Promise<string>;
  validateAPIKey: (provider: keyof APIKeys, key: string) => Promise<boolean>;
  saveContent: () => Promise<void>;
  loadContent: (id: string) => Promise<void>;
  createNewContent: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateColors: (colors: Partial<ColorSettings>) => void;
  loadAPIKeys: () => Promise<void>;
  clearError: () => void;
  
  // Detailed Loading Actions
  startOperation: (operation: LoadingOperation, category: keyof DetailedLoadingStates) => void;
  updateProgress: (category: keyof DetailedLoadingStates, progress: number, message?: string) => void;
  completeOperation: (category: keyof DetailedLoadingStates) => void;
  resetLoadingStates: () => void;
}

const defaultColors: ColorSettings = {
  background: '#ffffff',
  text: '#000000',
  accent: '#3b82f6'
};

const defaultContent: ContentData = {
  id: '',
  description: '',
  promotionType: 'general' as PromotionType,
  generatedText: '',
  generatedImage: '',
  colors: defaultColors,
  selectedProvider: 'openai' as AIProvider,
  createdAt: new Date(),
  updatedAt: new Date()
};

const defaultAPIKeys: APIKeys = {
  openai: '',
  claude: '',
  gemini: '',
  grook: '',
  deepseek: ''
};

const defaultSettings: UserSettings = {
  preferredProvider: 'openai' as AIProvider,
  autoSave: true,
  language: 'pt-BR'
};

const defaultValidatingKeys: Record<keyof APIKeys, boolean> = {
  openai: false,
  claude: false,
  gemini: false,
  grook: false,
  deepseek: false
};

const defaultKeyValidationStatus: Record<keyof APIKeys, boolean | null> = {
  openai: null,
  claude: null,
  gemini: null,
  grook: null,
  deepseek: null
};

const createDefaultLoadingState = (): LoadingState => ({
  operation: 'idle',
  progress: 0,
  message: '',
  startTime: null,
  estimatedDuration: 0
});

const defaultLoadingStates: DetailedLoadingStates = {
  textGeneration: createDefaultLoadingState(),
  imageGeneration: createDefaultLoadingState(),
  urlScraping: createDefaultLoadingState(),
  contentSaving: createDefaultLoadingState(),
  keyValidation: createDefaultLoadingState()
};

const apiService = new APIService();

export const useContentStore = create<ContentStore>((set, get) => ({
  // Initial state
  content: defaultContent,
  apiKeys: defaultAPIKeys,
  settings: defaultSettings,
  isLoading: false,
  error: null,
  validatingKeys: defaultValidatingKeys,
  keyValidationStatus: defaultKeyValidationStatus,
  loadingStates: defaultLoadingStates,
  currentOperation: 'idle',

  // Actions
  setContent: (updates) => {
    const current = get().content;
    const updatedContent = {
      ...current,
      ...updates,
      updatedAt: new Date()
    };
    
    set({ content: updatedContent });
    
    // Auto-save if enabled
    if (get().settings.autoSave && updatedContent.id) {
      get().saveContent();
    }
  },

  createNewContent: () => {
    const newContent: ContentData = {
      ...defaultContent,
      id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    set({ content: newContent, error: null });
  },

  setAPIKey: async (provider, key) => {
    try {
      await StorageService.saveAPIKey(provider, key);
      const apiKeys = get().apiKeys;
      set({ 
        apiKeys: { ...apiKeys, [provider]: key },
        error: null 
      });
    } catch (error) {
      console.error('Error saving API key:', error);
      set({ error: 'Erro ao salvar chave de API' });
    }
  },

  getAPIKey: async (provider) => {
    try {
      const key = await StorageService.getAPIKey(provider);
      return key;
    } catch (error) {
      console.error('Error loading API key:', error);
      return '';
    }
  },

  loadAPIKeys: async () => {
    try {
      const keys = await StorageService.getAllAPIKeys();
      set({ apiKeys: keys });
    } catch (error) {
      console.error('Error loading API keys:', error);
      set({ error: 'Erro ao carregar chaves de API' });
    }
  },

  saveContent: async () => {
    const { content } = get();
    if (!content.id) return;

    try {
      set({ isLoading: true, error: null });
      await StorageService.saveContent(content);
    } catch (error) {
      console.error('Error saving content:', error);
      set({ error: 'Erro ao salvar conteúdo' });
    } finally {
      set({ isLoading: false });
    }
  },

  loadContent: async (id) => {
    try {
      set({ isLoading: true, error: null });
      const content = await StorageService.loadContent(id);
      if (content) {
        set({ content });
      } else {
        set({ error: 'Conteúdo não encontrado' });
      }
    } catch (error) {
      console.error('Error loading content:', error);
      set({ error: 'Erro ao carregar conteúdo' });
    } finally {
      set({ isLoading: false });
    }
  },

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  updateColors: (colors) => {
    const current = get().content;
    const updatedColors = { ...current.colors, ...colors };
    get().setContent({ colors: updatedColors });
  },

  validateAPIKey: async (provider, key) => {
    try {
      set(state => ({
        validatingKeys: { ...state.validatingKeys, [provider]: true },
        keyValidationStatus: { ...state.keyValidationStatus, [provider]: null }
      }));

      const isValid = await apiService.validateAPIKey(provider, key);
      
      set(state => ({
        validatingKeys: { ...state.validatingKeys, [provider]: false },
        keyValidationStatus: { ...state.keyValidationStatus, [provider]: isValid }
      }));

      return isValid;
    } catch (error) {
      console.error('Error validating API key:', error);
      set(state => ({
        validatingKeys: { ...state.validatingKeys, [provider]: false },
        keyValidationStatus: { ...state.keyValidationStatus, [provider]: false }
      }));
      return false;
    }
  },

  clearError: () => set({ error: null }),

  // Detailed Loading Actions
  startOperation: (operation, category) => {
    const now = Date.now();
    const estimatedDuration = ESTIMATED_DURATIONS[operation] || 5000;
    const message = LOADING_MESSAGES[operation] || 'Processando...';
    
    set(state => ({
      currentOperation: operation,
      loadingStates: {
        ...state.loadingStates,
        [category]: {
          operation,
          progress: 0,
          message,
          startTime: now,
          estimatedDuration
        }
      }
    }));
  },

  updateProgress: (category, progress, message) => {
    set(state => {
      const currentState = state.loadingStates[category];
      const updatedMessage = message || currentState.message;
      
      return {
        loadingStates: {
          ...state.loadingStates,
          [category]: {
            ...currentState,
            progress: Math.min(100, Math.max(0, progress)),
            message: updatedMessage
          }
        }
      };
    });
  },

  completeOperation: (category) => {
    set(state => ({
      currentOperation: 'idle',
      loadingStates: {
        ...state.loadingStates,
        [category]: {
          ...state.loadingStates[category],
          operation: 'idle',
          progress: 100,
          message: 'Concluído'
        }
      }
    }));
    
    // Reset after a short delay
    setTimeout(() => {
      set(state => ({
        loadingStates: {
          ...state.loadingStates,
          [category]: createDefaultLoadingState()
        }
      }));
    }, 2000);
  },

  resetLoadingStates: () => {
    set({
      currentOperation: 'idle',
      loadingStates: defaultLoadingStates
    });
  }
}));