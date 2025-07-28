import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, Share, Copy, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WhatsAppPreview } from '@/components/preview/whatsapp-preview';
import { InstagramPreview } from '@/components/preview/instagram-preview';
import { useContentStore } from '@/store/content-store';
import { toast } from 'sonner';
import { PROMOTION_TYPES, AI_PROVIDERS } from '@/types';

interface PreviewScreenProps {
  onBack: () => void;
  onRestart: () => void;
}

export function PreviewScreen({ onBack, onRestart }: PreviewScreenProps) {
  const { content, saveContent } = useContentStore();
  const [isSaving, setIsSaving] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  const handleSaveLocal = async () => {
    try {
      setIsSaving(true);
      await saveContent();
      setNotification({ type: 'success', message: 'Conteúdo salvo com sucesso!' });
      toast.success('Conteúdo salvo localmente!');
    } catch (error) {
      setNotification({ type: 'error', message: 'Erro ao salvar conteúdo.' });
      toast.error('Erro ao salvar conteúdo');
    } finally {
      setIsSaving(false);
    }
  };

  const handleShareWhatsApp = async () => {
    try {
      if (content.generatedImage && navigator.share) {
        // For mobile devices with Web Share API support
        const response = await fetch(content.generatedImage);
        const blob = await response.blob();
        const file = new File([blob], 'promocional.jpg', { type: 'image/jpeg' });
        
        await navigator.share({
          title: 'Conteúdo Promocional',
          text: content.generatedText,
          files: [file]
        });
        toast.success('Compartilhado com sucesso!');
      } else {
        // Fallback: Open WhatsApp with text and suggest manual image sharing
        const message = encodeURIComponent(content.generatedText);
        const whatsappURL = `https://wa.me/?text=${message}`;
        window.open(whatsappURL, '_blank');
        
        if (content.generatedImage) {
          // Also download the image for manual sharing
          handleDownloadImage();
          toast.success('WhatsApp aberto! Imagem baixada - compartilhe manualmente.');
        } else {
          toast.success('Abrindo WhatsApp...');
        }
      }
    } catch (error) {
      // Fallback for any errors
      const message = encodeURIComponent(content.generatedText);
      const whatsappURL = `https://wa.me/?text=${message}`;
      window.open(whatsappURL, '_blank');
      
      if (content.generatedImage) {
        handleDownloadImage();
        toast.success('WhatsApp aberto! Imagem baixada - compartilhe manualmente.');
      } else {
        toast.success('Abrindo WhatsApp...');
      }
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content.generatedText);
      toast.success('Texto copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar texto');
    }
  };

  const handleDownloadImage = () => {
    if (content.generatedImage) {
      const link = document.createElement('a');
      link.href = content.generatedImage;
      link.download = `promocional_${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Download iniciado!');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <Button variant="outline" onClick={onBack} className="w-full sm:w-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center order-first sm:order-none">
          <h1 className="text-2xl sm:text-3xl font-bold">Visualizar e Compartilhar</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Veja como ficará seu conteúdo nas redes sociais</p>
        </div>
        <Button onClick={onRestart} variant="outline" className="w-full sm:w-auto">
          Criar Novo
        </Button>
      </div>

      {notification && (
        <Alert variant={notification.type === 'error' ? 'destructive' : 'default'}>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{notification.message}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Previews */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>📱 Pré-visualização nas Redes Sociais</CardTitle>
              <CardDescription>
                Veja como seu conteúdo aparecerá no WhatsApp e Instagram
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="whatsapp" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="whatsapp">📱 WhatsApp</TabsTrigger>
                  <TabsTrigger value="instagram">📷 Instagram</TabsTrigger>
                </TabsList>
                
                <TabsContent value="whatsapp" className="mt-6">
                  <WhatsAppPreview content={content} />
                </TabsContent>
                
                <TabsContent value="instagram" className="mt-6">
                  <InstagramPreview content={content} />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>💾 Salvar e Compartilhar</CardTitle>
              <CardDescription>
                Salve seu conteúdo localmente ou compartilhe diretamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleSaveLocal} 
                disabled={isSaving}
                className="w-full"
                size="lg"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar Localmente'}
              </Button>

              <Button 
                onClick={handleShareWhatsApp}
                variant="outline"
                className="w-full bg-green-50 hover:bg-green-100 border-green-200"
                size="lg"
              >
                <Share className="w-4 h-4 mr-2" />
                Compartilhar no WhatsApp
              </Button>

              <Button 
                onClick={handleCopyToClipboard}
                variant="outline"
                className="w-full"
                size="lg"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Texto
              </Button>

              {content.generatedImage && (
                <Button 
                  onClick={handleDownloadImage}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  📥 Download da Imagem
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📊 Resumo do Conteúdo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tipo de Promoção:</span>
                <span className="font-medium">{PROMOTION_TYPES[content.promotionType]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">IA Utilizada:</span>
                <span className="font-medium">{AI_PROVIDERS[content.selectedProvider]}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Palavras:</span>
                <span className="font-medium">{content.generatedText.split(' ').length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Caracteres:</span>
                <span className="font-medium">{content.generatedText.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Possui Imagem:</span>
                <span className="font-medium">{content.generatedImage ? 'Sim' : 'Não'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Criado em:</span>
                <span className="font-medium">
                  {content.createdAt.toLocaleDateString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>💡 Dicas de Uso</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <p className="text-muted-foreground">
                • Use o botão "Compartilhar no WhatsApp" para enviar diretamente aos seus contatos
              </p>
              <p className="text-muted-foreground">
                • Copie o texto para usar em outras plataformas
              </p>
              <p className="text-muted-foreground">
                • Salve localmente para acessar depois mesmo offline
              </p>
              <p className="text-muted-foreground">
                • Use as pré-visualizações para ajustar antes de publicar
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}