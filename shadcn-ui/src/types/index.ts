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