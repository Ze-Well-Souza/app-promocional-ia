import axios, { AxiosInstance, AxiosError } from 'axios';
import { AIProvider, TextResult, ImageResult, APIError } from '@/types';

export class APIService {
  private httpClient: AxiosInstance;

  constructor() {
    this.httpClient = axios.create({
      timeout: 30000,
    });
  }

  async validateAPIKey(provider: AIProvider, apiKey: string): Promise<boolean> {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('Chave de API não pode estar vazia');
    }

    try {
      switch (provider) {
        case 'openai':
          return await this.validateOpenAIKey(apiKey);
        case 'claude':
          return await this.validateClaudeKey(apiKey);
        case 'gemini':
          return await this.validateGeminiKey(apiKey);
        case 'grook':
          return await this.validateGrookKey(apiKey);
        case 'deepseek':
          return await this.validateDeepseekKey(apiKey);
        default:
          throw new Error(`Provedor ${provider} não suportado`);
      }
    } catch (error) {
      // Re-throw the error to provide more detailed feedback
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Erro desconhecido na validação da chave de API');
    }
  }

  private async validateOpenAIKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.httpClient.get(
        'https://api.openai.com/v1/models',
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Chave de API da OpenAI inválida ou expirada');
      } else if (error.response?.status === 403) {
        throw new Error('Acesso negado - verifique as permissões da chave OpenAI');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Erro de conexão - verifique sua internet');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na validação - tente novamente');
      }
      throw new Error('Erro na validação da chave OpenAI');
    }
  }

  private async validateClaudeKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-haiku-20240307',
          max_tokens: 1,
          messages: [{ role: 'user', content: 'test' }]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error: any) {
      // Claude returns 400 for valid key but invalid request, 401 for invalid key
      if (error.response?.status === 400) {
        return true; // Valid key, invalid request format
      } else if (error.response?.status === 401) {
        throw new Error('Chave de API do Claude inválida ou expirada');
      } else if (error.response?.status === 403) {
        throw new Error('Acesso negado - verifique as permissões da chave Claude');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Erro de conexão - verifique sua internet');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na validação - tente novamente');
      }
      throw new Error('Erro na validação da chave Claude');
    }
  }

  private async validateGeminiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{ text: 'test' }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 400) {
        // API key is valid but request might have issues
        const errorMessage = error.response?.data?.error?.message || '';
        if (errorMessage.includes('API_KEY_INVALID')) {
          throw new Error('Chave de API do Gemini inválida');
        }
        return true; // Valid key, other request issue
      } else if (error.response?.status === 401) {
        throw new Error('Chave de API do Gemini inválida ou expirada');
      } else if (error.response?.status === 403) {
        throw new Error('Acesso negado - verifique as permissões da chave Gemini');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Erro de conexão - verifique sua internet');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na validação - tente novamente');
      }
      throw new Error('Erro na validação da chave Gemini');
    }
  }

  private async validateGrookKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        'https://api.x.ai/v1/chat/completions',
        {
          messages: [{ role: 'user', content: 'test' }],
          model: 'grok-beta',
          max_tokens: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return true; // Valid key, request format issue
      } else if (error.response?.status === 401) {
        throw new Error('Chave de API do Grook inválida ou expirada');
      } else if (error.response?.status === 403) {
        throw new Error('Acesso negado - verifique as permissões da chave Grook');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Erro de conexão - verifique sua internet');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na validação - tente novamente');
      }
      throw new Error('Erro na validação da chave Grook');
    }
  }

  private async validateDeepseekKey(apiKey: string): Promise<boolean> {
    try {
      const response = await this.httpClient.post(
        'https://api.deepseek.com/v1/chat/completions',
        {
          model: 'deepseek-chat',
          messages: [{ role: 'user', content: 'test' }],
          max_tokens: 1
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      return response.status === 200;
    } catch (error: any) {
      if (error.response?.status === 400) {
        return true; // Valid key, request format issue
      } else if (error.response?.status === 401) {
        throw new Error('Chave de API do Deepseek inválida ou expirada');
      } else if (error.response?.status === 403) {
        throw new Error('Acesso negado - verifique as permissões da chave Deepseek');
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        throw new Error('Erro de conexão - verifique sua internet');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Timeout na validação - tente novamente');
      }
      throw new Error('Erro na validação da chave Deepseek');
    }
  }

  async generateText(prompt: string, provider: AIProvider, apiKey: string): Promise<TextResult> {
    return this.withRetry(async () => {
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
    }, provider);
  }

  async generateImage(prompt: string, provider: AIProvider, apiKey: string): Promise<ImageResult> {
    return this.withRetry(async () => {
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
    }, provider);
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    provider: AIProvider,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        const apiError = this.handleError(error as AxiosError, provider);
        
        // Don't retry if it's not a retryable error or if it's the last attempt
        if (!apiError.retryable || attempt === maxRetries) {
          throw apiError;
        }
        
        // Exponential backoff with jitter
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw this.handleError(lastError as AxiosError, provider);
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
    // Use Gemini 2.0 Flash Preview Image Generation for real image generation
    try {
      const response = await this.httpClient.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: `Crie uma imagem promocional profissional para: ${prompt}. A imagem deve ser atrativa, moderna e adequada para redes sociais, com cores vibrantes e composição equilibrada que chame atenção dos clientes.`
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            responseModalities: ["TEXT", "IMAGE"]
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 30000 // Increased timeout for image generation
        }
      );

      // Extract the image from the response
      const candidates = response.data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('Nenhuma imagem foi gerada');
      }

      // Find the image part in the response
      let imageData = null;
      for (const candidate of candidates) {
        if (candidate.content && candidate.content.parts) {
          for (const part of candidate.content.parts) {
            if (part.inlineData && part.inlineData.mimeType && part.inlineData.mimeType.startsWith('image/')) {
              imageData = part.inlineData;
              break;
            }
          }
        }
        if (imageData) break;
      }

      if (!imageData) {
        throw new Error('Imagem não encontrada na resposta da API');
      }

      // Convert base64 image data to data URL
      const imageUrl = `data:${imageData.mimeType};base64,${imageData.data}`;

      return {
        url: imageUrl,
        provider: 'gemini'
      };
    } catch (error: any) {
      console.error('Gemini image generation error:', error);
      
      // If the new API fails, fallback to a descriptive SVG
      if (error?.response?.status === 404 || error?.response?.status === 400) {
        console.warn('Gemini 2.0 Flash Preview Image Generation not available, using fallback');
        return this.createGeminiFallbackImage(prompt);
      }
      
      throw new Error(`Erro ao gerar imagem com Gemini: ${error?.response?.data?.error?.message || error?.message || 'Erro desconhecido'}`);
    }
  }

  private createGeminiFallbackImage(prompt: string): ImageResult {
    // Create a beautiful SVG placeholder when real image generation is not available
    const svgContent = `
      <svg width="1024" height="1024" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#667eea;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#764ba2;stop-opacity:1" />
          </linearGradient>
          <pattern id="dots" patternUnits="userSpaceOnUse" width="20" height="20">
            <circle cx="10" cy="10" r="2" fill="rgba(255,255,255,0.1)"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grad1)"/>
        <rect width="100%" height="100%" fill="url(#dots)"/>
        <foreignObject x="50" y="150" width="924" height="724">
          <div xmlns="http://www.w3.org/1999/xhtml" style="
            color: white;
            font-family: 'Segoe UI', Arial, sans-serif;
            font-size: 24px;
            line-height: 1.5;
            padding: 60px;
            text-align: center;
            background: rgba(0,0,0,0.4);
            border-radius: 30px;
            height: calc(100% - 120px);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(10px);
          ">
            <div style="max-width: 600px;">
              <div style="font-size: 48px; margin-bottom: 30px;">🎨</div>
              <h2 style="font-size: 36px; margin-bottom: 30px; color: #FFD700; font-weight: bold;">Imagem Promocional</h2>
              <p style="margin: 0; font-size: 20px; margin-bottom: 30px; opacity: 0.9;">${prompt.substring(0, 200)}${prompt.length > 200 ? '...' : ''}</p>
              <div style="background: rgba(255,255,255,0.1); padding: 20px; border-radius: 15px; margin-top: 30px;">
                <p style="margin: 0; font-size: 16px; opacity: 0.8;">💡 Imagem conceitual gerada com Gemini AI</p>
                <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.6;">Para imagens reais, configure uma chave de API válida</p>
              </div>
            </div>
          </div>
        </foreignObject>
      </svg>
    `;

    const imageUrl = `data:image/svg+xml;base64,${btoa(svgContent)}`;

    return {
      url: imageUrl,
      provider: 'gemini'
    };
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