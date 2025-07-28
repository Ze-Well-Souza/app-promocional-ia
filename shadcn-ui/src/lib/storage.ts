import Dexie, { Table } from 'dexie';
import { ContentData, APIKeys } from '@/types';

export type StoredContent = ContentData;

export interface StoredAPIKeys {
  id: number;
  provider: string;
  key: string; // Simplified - no encryption for now
  createdAt: Date;
}

export class AppDatabase extends Dexie {
  contents!: Table<StoredContent>;
  apiKeys!: Table<StoredAPIKeys>;

  constructor() {
    super('AppPromocionalIA');
    this.version(1).stores({
      contents: 'id, description, promotionType, createdAt, updatedAt',
      apiKeys: '++id, provider, key, createdAt'
    });
  }
}

export const db = new AppDatabase();

export class StorageService {
  static async saveContent(content: ContentData): Promise<void> {
    try {
      await db.contents.put(content);
      console.log('Content saved successfully:', content.id);
    } catch (error) {
      console.error('Error saving content:', error);
      throw new Error('Falha ao salvar conteúdo');
    }
  }

  static async loadContent(id: string): Promise<ContentData | undefined> {
    try {
      const content = await db.contents.get(id);
      console.log('Content loaded:', id, content ? 'found' : 'not found');
      return content;
    } catch (error) {
      console.error('Error loading content:', error);
      throw new Error('Falha ao carregar conteúdo');
    }
  }

  static async listContents(): Promise<ContentData[]> {
    try {
      const contents = await db.contents.orderBy('updatedAt').reverse().toArray();
      console.log('Contents listed:', contents.length, 'items');
      return contents;
    } catch (error) {
      console.error('Error listing contents:', error);
      throw new Error('Falha ao listar conteúdos');
    }
  }

  static async deleteContent(id: string): Promise<void> {
    try {
      await db.contents.delete(id);
      console.log('Content deleted:', id);
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new Error('Falha ao deletar conteúdo');
    }
  }

  static async saveAPIKey(provider: string, key: string): Promise<void> {
    try {
      // Remove existing key for this provider
      await db.apiKeys.where('provider').equals(provider).delete();
      
      // Add new key
      await db.apiKeys.add({
        provider,
        key, // Store directly for now
        createdAt: new Date()
      });
      
      console.log('API key saved for provider:', provider);
    } catch (error) {
      console.error('Error saving API key:', error);
      throw new Error(`Falha ao salvar chave de API para ${provider}`);
    }
  }

  static async getAPIKey(provider: string): Promise<string> {
    try {
      const stored = await db.apiKeys.where('provider').equals(provider).first();
      const key = stored?.key || '';
      console.log('API key retrieved for provider:', provider, key ? 'found' : 'not found');
      return key;
    } catch (error) {
      console.error('Error getting API key:', error);
      throw new Error(`Falha ao obter chave de API para ${provider}`);
    }
  }

  static async getAllAPIKeys(): Promise<APIKeys> {
    try {
      const keys = await db.apiKeys.toArray();
      const apiKeys: APIKeys = {
        openai: '',
        claude: '',
        gemini: '',
        grook: '',
        deepseek: ''
      };

      for (const key of keys) {
        if (key.provider in apiKeys) {
          apiKeys[key.provider as keyof APIKeys] = key.key;
        }
      }

      console.log('All API keys retrieved:', Object.keys(apiKeys).filter(k => apiKeys[k as keyof APIKeys]));
      return apiKeys;
    } catch (error) {
      console.error('Error getting all API keys:', error);
      throw new Error('Falha ao obter chaves de API');
    }
  }

  // New function for price research
  static async searchAveragePrice(productName: string): Promise<{
    averagePrice: number;
    priceRange: { min: number; max: number };
    sources: string[];
  }> {
    try {
      // Simulate price search from major e-commerce sites
      // In a real implementation, you would use proper APIs or web scraping
      const mockPrices = {
        amazon: Math.floor(Math.random() * 200) + 50,
        mercadolivre: Math.floor(Math.random() * 180) + 40,
        shopee: Math.floor(Math.random() * 150) + 30
      };
      
      const prices = Object.values(mockPrices);
      const averagePrice = Math.floor(prices.reduce((sum, price) => sum + price, 0) / prices.length);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      return {
        averagePrice,
        priceRange: { min: minPrice, max: maxPrice },
        sources: ['Amazon Brasil', 'Mercado Livre', 'Shopee Brasil']
      };
    } catch (error) {
      console.error('Error searching prices:', error);
      throw new Error('Não foi possível pesquisar preços no momento.');
    }
  }

  // New function for URL scraping with price research
  static async scrapeProductFromURL(url: string): Promise<{
    title: string;
    description: string;
    imageUrl: string;
    suggestedPrice?: number;
    priceRange?: { min: number; max: number };
  }> {
    try {
      // Use a CORS proxy service to fetch the URL
      const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
      const response = await fetch(proxyUrl);
      const data = await response.json();
      const html = data.contents;
      
      // Create a temporary DOM parser
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      
      // Extract title
      let title = doc.querySelector('title')?.textContent || '';
      if (!title) {
        title = doc.querySelector('h1')?.textContent || '';
      }
      
      // Extract description from meta tags
      let description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
      if (!description) {
        description = doc.querySelector('meta[property="og:description"]')?.getAttribute('content') || '';
      }
      
      // Extract image URL
      let imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute('content') || '';
      if (!imageUrl) {
        const firstImg = doc.querySelector('img[src]');
        imageUrl = firstImg?.getAttribute('src') || '';
      }
      
      // Clean up the data
      title = title.trim().substring(0, 100);
      description = description.trim().substring(0, 500);
      
      // Make sure image URL is absolute
      if (imageUrl && !imageUrl.startsWith('http')) {
        const urlObj = new URL(url);
        imageUrl = new URL(imageUrl, urlObj.origin).href;
      }
      
      // Try to research prices based on the title
      let suggestedPrice;
      let priceRange;
      
      if (title) {
        try {
          const priceData = await this.searchAveragePrice(title);
          suggestedPrice = priceData.averagePrice;
          priceRange = priceData.priceRange;
        } catch (error) {
          console.warn('Could not fetch price data:', error);
        }
      }
      
      return {
        title: title || 'Produto encontrado',
        description: description || 'Descrição não disponível',
        imageUrl: imageUrl || '',
        suggestedPrice,
        priceRange
      };
    } catch (error) {
      console.error('Error scraping URL:', error);
      throw new Error('Não foi possível extrair informações da URL. Verifique se o link está correto.');
    }
  }
}