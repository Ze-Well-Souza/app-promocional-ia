import { create } from 'zustand';
import { ContentData, APIKeys, UserSettings, ColorSettings, AIProvider, PromotionType } from '@/types';
import { StorageService } from '@/lib/storage';

interface ContentStore {
  // State
  content: ContentData;
  apiKeys: APIKeys;
  settings: UserSettings;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setContent: (updates: Partial<ContentData>) => void;
  setAPIKey: (provider: keyof APIKeys, key: string) => Promise<void>;
  getAPIKey: (provider: keyof APIKeys) => Promise<string>;
  saveContent: () => Promise<void>;
  loadContent: (id: string) => Promise<void>;
  createNewContent: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  updateColors: (colors: Partial<ColorSettings>) => void;
  loadAPIKeys: () => Promise<void>;
}

const defaultColors: ColorSettings = {
  background: '#ffffff',
  text: '#000000',
  accent: '#3b82f6'
};

const defaultContent: ContentData = {
  id: '',
  description: '',
  promotionType: 'general',
  generatedText: '',
  generatedImage: '',
  colors: defaultColors,
  selectedProvider: 'openai',
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
  preferredProvider: 'openai',
  autoSave: true,
  language: 'pt-BR'
};

export const useContentStore = create<ContentStore>((set, get) => ({
  // Initial state
  content: defaultContent,
  apiKeys: defaultAPIKeys,
  settings: defaultSettings,
  isLoading: false,
  error: null,

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
  }
}));