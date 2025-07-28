export type PromotionType = 'discount' | 'event' | 'launch' | 'general';

export type AIProvider = 'openai' | 'claude' | 'gemini' | 'grook' | 'deepseek';

export interface ContentData {
  id: string;
  description: string;
  promotionType: PromotionType;
  generatedText: string;
  generatedImage: string;
  colors: ColorSettings;
  selectedProvider: AIProvider;
  createdAt: Date;
  updatedAt: Date;
}

export interface ColorSettings {
  background: string;
  text: string;
  accent: string;
}

export interface APIKeys {
  openai: string;
  claude: string;
  gemini: string;
  grook: string;
  deepseek: string;
}

export interface UserSettings {
  preferredProvider: AIProvider;
  autoSave: boolean;
  language: string;
}

export interface TextResult {
  content: string;
  provider: AIProvider;
  tokens_used?: number;
  cost?: number;
}

export interface ImageResult {
  url: string;
  provider: AIProvider;
  cost?: number;
}

export interface APIError {
  message: string;
  code: string;
  provider: AIProvider;
  retryable: boolean;
}

export const PROMOTION_TYPES: Record<PromotionType, string> = {
  discount: '💰 Desconto',
  event: '🎉 Evento',
  launch: '🚀 Lançamento',
  general: '📢 Geral'
};

export const AI_PROVIDERS: Record<AIProvider, string> = {
  openai: 'OpenAI',
  claude: 'Claude',
  gemini: 'Gemini',
  grook: 'Grook',
  deepseek: 'Deepseek'
};

// Loading States
export type LoadingOperation = 
  | 'idle'
  | 'validating-key'
  | 'generating-text'
  | 'generating-image'
  | 'scraping-url'
  | 'saving-content'
  | 'loading-content';

export interface LoadingState {
  operation: LoadingOperation;
  progress: number; // 0-100
  message: string;
  startTime: Date | null;
  estimatedDuration?: number; // em segundos
}

export interface DetailedLoadingStates {
  textGeneration: LoadingState;
  imageGeneration: LoadingState;
  urlScraping: LoadingState;
  contentSaving: LoadingState;
  keyValidation: LoadingState;
}

export const LOADING_MESSAGES: Record<LoadingOperation, string> = {
  'idle': '',
  'validating-key': 'Validando chave de API...',
  'generating-text': 'Gerando texto promocional...',
  'generating-image': 'Criando imagem promocional...',
  'scraping-url': 'Extraindo dados do produto...',
  'saving-content': 'Salvando conteúdo...',
  'loading-content': 'Carregando conteúdo...'
};

export const ESTIMATED_DURATIONS: Record<LoadingOperation, number> = {
  'idle': 0,
  'validating-key': 3,
  'generating-text': 8,
  'generating-image': 15,
  'scraping-url': 5,
  'saving-content': 2,
  'loading-content': 2
};