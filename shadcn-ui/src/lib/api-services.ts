import axios, { AxiosInstance, AxiosError } from 'axios';
import { AIProvider, TextResult, ImageResult, APIError } from '@/types';

export class APIService {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      timeout: 30000,
    });
  }

  async generateText(prompt: string, provider: AIProvider, apiKey: string): Promise<TextResult> {
    try {
      let result: TextResult;
      
      switch (provider) {
        case 'openai':
          result = await this.callOpenAIText(prompt, apiKey);
          break;
        case 'claude':
          result = await this.callClaudeText(prompt, apiKey);
          break;
        case 'gemini':
          result = await this.callGeminiText(prompt, apiKey);
          break;
        case 'grook':
          result = await this.callGrookText(prompt, apiKey);
          break;
        case 'deepseek':
          result = await this.callDeepseekText(prompt, apiKey);
          break;
        default:
          throw new Error(`Provider ${provider} not supported`);
      }
      
      return result;
    } catch (error) {
      throw this.handleError(error as AxiosError, provider);
    }
  }

  async generateImage(prompt: string, provider: AIProvider, apiKey: string): Promise<ImageResult> {
    try {
      let result: ImageResult;
      
      switch (provider) {
        case 'openai':
          result = await this.callOpenAIImage(prompt, apiKey);
          break;
        case 'gemini':
          result = await this.callGeminiImage(prompt, apiKey);
          break;
        default:
          throw new Error(`Image generation not supported for ${provider}`);
      }
      
      return result;
    } catch (error) {
      throw this.handleError(error as AxiosError, provider);
    }
  }

  private async callOpenAIText(prompt: string, apiKey: string): Promise<TextResult> {
    const response = await this.httpClient.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em copywriting para marketing brasileiro. Crie textos promocionais persuasivos, diretos e adequados ao público brasileiro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      provider: 'openai',
      tokens_used: response.data.usage?.total_tokens
    };
  }

  private async callOpenAIImage(prompt: string, apiKey: string): Promise<ImageResult> {
    const response = await this.httpClient.post(
      'https://api.openai.com/v1/images/generations',
      {
        prompt: `Professional promotional image for: ${prompt}`,
        n: 1,
        size: '1024x1024',
        response_format: 'url'
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      url: response.data.data[0].url,
      provider: 'openai'
    };
  }

  private async callClaudeText(prompt: string, apiKey: string): Promise<TextResult> {
    const response = await this.httpClient.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-haiku-20240307',
        max_tokens: 300,
        messages: [
          {
            role: 'user',
            content: `Como especialista em copywriting brasileiro, crie um texto promocional persuasivo para: ${prompt}`
          }
        ]
      },
      {
        headers: {
          'x-api-key': apiKey,
          'Content-Type': 'application/json',
          'anthropic-version': '2023-06-01'
        }
      }
    );

    return {
      content: response.data.content[0].text,
      provider: 'claude'
    };
  }

  private async callGeminiText(prompt: string, apiKey: string): Promise<TextResult> {
    const response = await this.httpClient.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Como especialista em marketing brasileiro, crie um texto promocional persuasivo para: ${prompt}`
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.candidates[0].content.parts[0].text,
      provider: 'gemini'
    };
  }

  private async callGeminiImage(prompt: string, apiKey: string): Promise<ImageResult> {
    // Note: Gemini doesn't have direct image generation API like DALL-E
    // This is a placeholder implementation
    throw new Error('Gemini image generation not implemented yet');
  }

  private async callGrookText(prompt: string, apiKey: string): Promise<TextResult> {
    // Note: Grook API details may vary - this is a generic implementation
    const response = await this.httpClient.post(
      'https://api.x.ai/v1/chat/completions',
      {
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em copywriting brasileiro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-beta',
        stream: false,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      provider: 'grook'
    };
  }

  private async callDeepseekText(prompt: string, apiKey: string): Promise<TextResult> {
    const response = await this.httpClient.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'Você é um especialista em copywriting brasileiro.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      provider: 'deepseek'
    };
  }

  private handleError(error: AxiosError, provider: AIProvider): APIError {
    let message = 'Erro desconhecido';
    let code = 'UNKNOWN_ERROR';
    let retryable = false;

    if (error.response) {
      const status = error.response.status;
      
      switch (status) {
        case 401:
          message = 'Chave de API inválida ou expirada';
          code = 'INVALID_API_KEY';
          break;
        case 429:
          message = 'Limite de requisições excedido. Tente novamente em alguns minutos.';
          code = 'RATE_LIMIT_EXCEEDED';
          retryable = true;
          break;
        case 403:
          message = 'Acesso negado. Verifique suas permissões de API.';
          code = 'ACCESS_DENIED';
          break;
        case 500:
          message = 'Erro interno do servidor. Tente novamente mais tarde.';
          code = 'SERVER_ERROR';
          retryable = true;
          break;
        default:
          message = error.response.data?.error?.message || `Erro HTTP ${status}`;
          code = 'HTTP_ERROR';
      }
    } else if (error.code === 'ECONNABORTED') {
      message = 'Timeout da requisição. Tente novamente.';
      code = 'TIMEOUT';
      retryable = true;
    } else {
      message = 'Erro de conexão. Verifique sua internet.';
      code = 'NETWORK_ERROR';
      retryable = true;
    }

    return {
      message,
      code,
      provider,
      retryable
    };
  }
}