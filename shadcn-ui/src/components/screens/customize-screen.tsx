import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { ColorPicker } from '@/components/ui/color-picker';
import { useContentStore } from '@/store/content-store';

interface CustomizeScreenProps {
  onBack: () => void;
  onNext: () => void;
}

export function CustomizeScreen({ onBack, onNext }: CustomizeScreenProps) {
  const { content, setContent, updateColors } = useContentStore();

  const handleTextChange = (newText: string) => {
    setContent({ generatedText: newText });
  };

  const handleColorChange = (colorType: 'background' | 'text' | 'accent', color: string) => {
    updateColors({ [colorType]: color });
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <div className="text-center">
          <h1 className="text-3xl font-bold">Personalizar</h1>
          <p className="text-muted-foreground">Ajuste as cores e edite o texto</p>
        </div>
        <Button onClick={onNext}>
          Avançar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Panel - Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🎨 Cores
              </CardTitle>
              <CardDescription>
                Personalize as cores do seu conteúdo promocional
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ColorPicker
                label="Cor de Fundo"
                color={content.colors.background}
                onChange={(color) => handleColorChange('background', color)}
              />
              <ColorPicker
                label="Cor do Texto"
                color={content.colors.text}
                onChange={(color) => handleColorChange('text', color)}
              />
              <ColorPicker
                label="Cor de Destaque"
                color={content.colors.accent}
                onChange={(color) => handleColorChange('accent', color)}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                ✏️ Editor de Texto
              </CardTitle>
              <CardDescription>
                Edite e ajuste o texto gerado pela IA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-editor">Texto Promocional</Label>
                  <Textarea
                    id="text-editor"
                    value={content.generatedText}
                    onChange={(e) => handleTextChange(e.target.value)}
                    className="min-h-[150px] mt-2"
                    placeholder="Seu texto promocional aparecerá aqui..."
                  />
                </div>
                <div className="text-sm text-muted-foreground">
                  {content.generatedText.length} caracteres
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>👀 Pré-visualização</CardTitle>
              <CardDescription>
                Veja como ficará seu conteúdo promocional
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Preview Card */}
                <div 
                  className="p-6 rounded-lg border-2 min-h-[200px] flex flex-col justify-center"
                  style={{ 
                    backgroundColor: content.colors.background,
                    borderColor: content.colors.accent
                  }}
                >
                  {content.generatedImage && (
                    <div className="mb-4">
                      <img 
                        src={content.generatedImage}
                        alt="Imagem promocional"
                        className="w-full max-w-xs mx-auto rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div 
                    className="text-center whitespace-pre-wrap leading-relaxed"
                    style={{ color: content.colors.text }}
                  >
                    {content.generatedText || 'Seu texto promocional aparecerá aqui...'}
                  </div>
                  
                  {content.generatedText && (
                    <div className="mt-4 text-center">
                      <div 
                        className="inline-block px-4 py-2 rounded-full text-sm font-semibold"
                        style={{ 
                          backgroundColor: content.colors.accent,
                          color: content.colors.background
                        }}
                      >
                        Saiba Mais 📞
                      </div>
                    </div>
                  )}
                </div>

                {/* Format Toggle */}
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" size="sm">
                    📱 WhatsApp
                  </Button>
                  <Button variant="outline" size="sm">
                    📷 Instagram
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>📋 Informações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de Promoção:</span>
                <span className="font-medium">{content.promotionType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">IA Utilizada:</span>
                <span className="font-medium">{content.selectedProvider}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Caracteres:</span>
                <span className="font-medium">{content.generatedText.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="font-medium">
                  {content.updatedAt.toLocaleTimeString('pt-BR')}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}