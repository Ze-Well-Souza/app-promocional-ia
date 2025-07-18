import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Loader2, Settings, Wand2, Image, Link, Sparkles, Zap } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useContentStore } from '@/store/content-store';
import { APIService } from '@/lib/api-services';
import { StorageService } from '@/lib/storage';
import { PROMOTION_TYPES, AI_PROVIDERS, PromotionType, AIProvider } from '@/types';
import { toast } from 'sonner';

const formSchema = z.object({
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  promotionType: z.enum(['discount', 'event', 'launch', 'general']),
  selectedProvider: z.enum(['openai', 'claude', 'gemini', 'grook', 'deepseek']),
  productUrl: z.string().optional(),
  productPrice: z.number().optional()
});

type FormData = z.infer<typeof formSchema>;

interface ContentScreenProps {
  onNext: () => void;
}

export function ContentScreen({ onNext }: ContentScreenProps) {
  const { content, setContent, apiKeys, loadAPIKeys, setAPIKey, isLoading, error, setLoading, setError } = useContentStore();
  const [apiService] = useState(new APIService());
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [localApiKeys, setLocalApiKeys] = useState(apiKeys);
  const [isScrapingUrl, setIsScrapingUrl] = useState(false);
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [priceRange, setPriceRange] = useState<{min: number; max: number} | null>(null);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: content.description,
      promotionType: content.promotionType,
      selectedProvider: content.selectedProvider,
      productUrl: '',
      productPrice: undefined
    }
  });

  React.useEffect(() => {
    loadAPIKeys();
  }, [loadAPIKeys]);

  React.useEffect(() => {
    setLocalApiKeys(apiKeys);
  }, [apiKeys]);

  const buildPrompt = (description: string, promotionType: PromotionType, price?: number) => {
    const typePrompts = {
      discount: 'Crie um texto promocional focado em desconto especial',
      event: 'Crie um texto promocional para um evento ou ocasião especial',
      launch: 'Crie um texto promocional para o lançamento de um produto/serviço',
      general: 'Crie um texto promocional geral persuasivo'
    };

    const priceText = price ? `\nPreço: R$ ${price.toFixed(2)}` : '';

    return `${typePrompts[promotionType]} para: ${description}${priceText}. 
    O texto deve ser:
    - Persuasivo e direto
    - Adequado ao público brasileiro
    - Com call-to-action claro
    - Máximo 150 palavras
    - Incluir emojis relevantes
    ${price ? '- Destacar o valor do produto de forma atrativa' : ''}`;
  };

  const buildImagePrompt = (description: string, promotionType: PromotionType) => {
    return `Professional promotional image for ${promotionType}: ${description}. High quality, modern design, suitable for social media, Brazilian market`;
  };

  const handleScrapeUrl = async () => {
    const url = form.getValues('productUrl');
    if (!url) {
      setError('Digite uma URL para extrair informações do produto');
      return;
    }

    try {
      setIsScrapingUrl(true);
      setError(null);
      
      const scrapedData = await StorageService.scrapeProductFromURL(url);
      
      // Update form with scraped data
      const enhancedDescription = `${scrapedData.title}\n\n${scrapedData.description}`;
      form.setValue('description', enhancedDescription);
      
      // Set scraped image if available
      if (scrapedData.imageUrl) {
        setContent({ generatedImage: scrapedData.imageUrl });
      }
      
      // Set suggested price if available
      if (scrapedData.suggestedPrice) {
        setSuggestedPrice(scrapedData.suggestedPrice);
        setPriceRange(scrapedData.priceRange || null);
        form.setValue('productPrice', scrapedData.suggestedPrice);
      }
      
      toast.success('Informações extraídas com sucesso! ' + 
        (scrapedData.suggestedPrice ? `Preço médio: R$ ${scrapedData.suggestedPrice.toFixed(2)}` : ''));
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao extrair informações da URL';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsScrapingUrl(false);
    }
  };

  const handleGenerateText = async () => {
    const formData = form.getValues();
    const apiKey = await useContentStore.getState().getAPIKey(formData.selectedProvider);
    
    if (!apiKey) {
      setError(`Chave de API do ${AI_PROVIDERS[formData.selectedProvider]} não configurada`);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const prompt = buildPrompt(formData.description, formData.promotionType, formData.productPrice);
      const result = await apiService.generateText(prompt, formData.selectedProvider, apiKey);
      
      setContent({
        description: formData.description,
        promotionType: formData.promotionType,
        selectedProvider: formData.selectedProvider,
        generatedText: result.content
      });
      
      toast.success('Texto gerado com sucesso!');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar texto';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateImage = async () => {
    const formData = form.getValues();
    const apiKey = await useContentStore.getState().getAPIKey(formData.selectedProvider);
    
    if (!apiKey) {
      setError(`Chave de API do ${AI_PROVIDERS[formData.selectedProvider]} não configurada`);
      return;
    }

    if (!['openai', 'gemini'].includes(formData.selectedProvider)) {
      setError('Geração de imagem disponível apenas para OpenAI e Gemini');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const prompt = buildImagePrompt(formData.description, formData.promotionType);
      const result = await apiService.generateImage(prompt, formData.selectedProvider, apiKey);
      
      setContent({
        generatedImage: result.url
      });
      
      toast.success('Imagem gerada com sucesso!');

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Erro ao gerar imagem';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKeys = async () => {
    try {
      for (const [provider, key] of Object.entries(localApiKeys)) {
        if (key && key !== apiKeys[provider as keyof typeof apiKeys]) {
          await setAPIKey(provider as keyof typeof apiKeys, key);
        }
      }
      await loadAPIKeys(); // Reload to confirm save
      setShowApiConfig(false);
      toast.success('Chaves de API salvas com sucesso!');
    } catch (error) {
      toast.error('Erro ao salvar chaves de API');
    }
  };

  const canProceed = content.generatedText.length > 0;

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Modern Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 p-8 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Sparkles className="w-10 h-10" />
              Criar Conteúdo Promocional
            </h1>
            <p className="text-lg opacity-90">
              Transforme ideias em campanhas irresistíveis com IA
            </p>
          </div>
          
          <Dialog open={showApiConfig} onOpenChange={setShowApiConfig}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="lg" className="shadow-lg">
                <Settings className="w-5 h-5 mr-2" />
                Configurar APIs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md bg-white/95 backdrop-blur">
              <DialogHeader>
                <DialogTitle className="text-2xl">Configurar Chaves de API</DialogTitle>
                <DialogDescription>
                  Configure suas chaves de API para usar os serviços de IA
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {Object.entries(AI_PROVIDERS).map(([key, name]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={key} className="text-sm font-semibold">{name}</Label>
                    <Input
                      id={key}
                      type="password"
                      placeholder={`Chave de API do ${name}`}
                      value={localApiKeys[key as keyof typeof localApiKeys]}
                      onChange={(e) => setLocalApiKeys(prev => ({
                        ...prev,
                        [key]: e.target.value
                      }))}
                      className="bg-white/50"
                    />
                  </div>
                ))}
                <Button onClick={handleSaveApiKeys} className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Zap className="w-4 h-4 mr-2" />
                  Salvar Chaves
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute -top-6 -left-6 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>

      {/* URL Scraping Section */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-orange-50 to-red-50">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Link className="w-7 h-7 text-orange-600" />
            Extrair de URL de Produto
          </CardTitle>
          <CardDescription className="text-base">
            Cole o link de qualquer produto online para extrair automaticamente imagem e descrição
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="https://exemplo.com/produto..."
                className="h-12 bg-white/80 border-orange-200 focus:border-orange-500"
                value={form.watch('productUrl') || ''}
                onChange={(e) => form.setValue('productUrl', e.target.value)}
              />
              {form.formState.errors.productUrl && (
                <p className="text-sm text-red-600">{form.formState.errors.productUrl.message}</p>
              )}
            </div>
            <Button
              type="button"
              onClick={handleScrapeUrl}
              disabled={isScrapingUrl || !form.watch('productUrl')}
              className="h-12 px-6 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
            >
              {isScrapingUrl ? (
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-5 h-5 mr-2" />
              )}
              Extrair Dados
            </Button>
          </div>
          
          {/* Price Information */}
          {(suggestedPrice || form.watch('productPrice')) && (
            <Card className="mt-4 border-amber-200 bg-amber-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg text-amber-800">
                  💰 Informações de Preço
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {suggestedPrice && priceRange && (
                    <div className="text-sm text-amber-700">
                      <p><strong>Preço médio pesquisado:</strong> R$ {suggestedPrice.toFixed(2)}</p>
                      <p><strong>Faixa de preços:</strong> R$ {priceRange.min.toFixed(2)} - R$ {priceRange.max.toFixed(2)}</p>
                      <p className="text-xs mt-1 opacity-75">*Preços pesquisados em Amazon, Mercado Livre e Shopee</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label className="text-amber-800 font-semibold">Preço para o Conteúdo Promocional</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 99.90"
                      className="bg-white/80 border-amber-300 focus:border-amber-500"
                      value={form.watch('productPrice') || ''}
                      onChange={(e) => form.setValue('productPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                    />
                    <p className="text-xs text-amber-600">
                      💡 Este preço será usado para criar um texto promocional mais atrativo
                    </p>
                  </div>
                  
                  {suggestedPrice && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => form.setValue('productPrice', suggestedPrice)}
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      Usar Preço Médio Sugerido (R$ {suggestedPrice.toFixed(2)})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Main Content Creation */}
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-2xl">
            <Wand2 className="w-7 h-7 text-blue-600" />
            Descreva seu Produto/Serviço
          </CardTitle>
          <CardDescription className="text-base">
            Forneça detalhes sobre o que você quer promover ou use os dados extraídos da URL
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-8">
            <div className="space-y-2">
              <Label className="text-lg font-semibold">Descrição do Produto</Label>
              <Textarea
                placeholder="Ex: Curso online de marketing digital para iniciantes, com 20 aulas práticas e certificado..."
                className="min-h-[120px] bg-white/80 border-blue-200 focus:border-blue-500 text-base"
                value={form.watch('description')}
                onChange={(e) => form.setValue('description', e.target.value)}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600">{form.formState.errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <Label className="text-lg font-semibold">🎯 Tipo de Promoção</Label>
                <Select 
                  value={form.watch('promotionType')} 
                  onValueChange={(value) => form.setValue('promotionType', value as PromotionType)}
                >
                  <SelectTrigger className="h-12 bg-white/80 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PROMOTION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-base">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.promotionType && (
                  <p className="text-sm text-red-600">{form.formState.errors.promotionType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-lg font-semibold">🤖 Escolha a IA</Label>
                <Select 
                  value={form.watch('selectedProvider')} 
                  onValueChange={(value) => form.setValue('selectedProvider', value as AIProvider)}
                >
                  <SelectTrigger className="h-12 bg-white/80 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Selecione a IA" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(AI_PROVIDERS).map(([key, label]) => (
                      <SelectItem key={key} value={key} className="text-base">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.selectedProvider && (
                  <p className="text-sm text-red-600">{form.formState.errors.selectedProvider.message}</p>
                )}
              </div>
            </div>

            <div className="flex gap-6">
              <Button
                type="button"
                onClick={handleGenerateText}
                disabled={isLoading || !form.watch('description')}
                className="flex-1 h-14 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <Wand2 className="w-5 h-5 mr-3" />
                )}
                Gerar Texto
              </Button>

              <Button
                type="button"
                onClick={handleGenerateImage}
                disabled={isLoading || !form.watch('description') || !['openai', 'gemini'].includes(form.watch('selectedProvider'))}
                variant="outline"
                className="flex-1 h-14 text-lg border-2 border-purple-300 hover:bg-purple-50 shadow-lg"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                ) : (
                  <Image className="w-5 h-5 mr-3" />
                )}
                Gerar Imagem
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription className="text-base">{error}</AlertDescription>
        </Alert>
      )}

      {content.generatedText && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Sparkles className="w-7 h-7 text-green-600" />
              Texto Gerado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/80 p-6 rounded-xl border border-green-200">
              <p className="whitespace-pre-wrap text-base leading-relaxed">{content.generatedText}</p>
            </div>
            <div className="flex items-center justify-between mt-6">
              <Badge variant="secondary" className="px-4 py-2 text-sm">
                Gerado com {AI_PROVIDERS[content.selectedProvider]}
              </Badge>
              <Button 
                onClick={onNext} 
                disabled={!canProceed}
                className="px-8 py-3 text-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg"
              >
                Personalizar →
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {content.generatedImage && (
        <Card className="border-0 shadow-xl bg-gradient-to-br from-indigo-50 to-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-2xl">
              <Image className="w-7 h-7 text-indigo-600" />
              Imagem do Produto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/80 p-4 rounded-xl border border-indigo-200">
              <img 
                src={content.generatedImage} 
                alt="Imagem promocional gerada"
                className="w-full max-w-md mx-auto rounded-lg shadow-lg"
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}