import React from 'react';
import { ContentData } from '@/types';
import { Heart, MessageCircle, Send, Bookmark } from 'lucide-react';

interface InstagramPreviewProps {
  content: ContentData;
}

export function InstagramPreview({ content }: InstagramPreviewProps) {
  return (
    <div className="max-w-sm mx-auto bg-white border rounded-lg overflow-hidden">
      {/* Instagram Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-semibold">M</span>
          </div>
          <div>
            <div className="font-semibold text-sm">minha_empresa</div>
          </div>
        </div>
        <button className="text-lg font-bold">⋯</button>
      </div>

      {/* Image Area */}
      <div className="aspect-square bg-gray-100 flex items-center justify-center relative">
        {content.generatedImage ? (
          <img 
            src={content.generatedImage} 
            alt="Imagem promocional"
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white font-bold text-lg"
            style={{ backgroundColor: content.colors.background }}
          >
            <div className="text-center p-4">
              <div 
                className="text-2xl mb-2"
                style={{ color: content.colors.text }}
              >
                📢
              </div>
              <div 
                className="text-sm leading-relaxed"
                style={{ color: content.colors.text }}
              >
                {content.generatedText || 'Seu texto promocional aparecerá aqui'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-4">
          <Heart className="w-6 h-6 cursor-pointer hover:text-red-500" />
          <MessageCircle className="w-6 h-6 cursor-pointer" />
          <Send className="w-6 h-6 cursor-pointer" />
        </div>
        <Bookmark className="w-6 h-6 cursor-pointer" />
      </div>

      {/* Likes */}
      <div className="px-3 pb-2">
        <div className="font-semibold text-sm">156 curtidas</div>
      </div>

      {/* Caption */}
      <div className="px-3 pb-3">
        <div className="text-sm">
          <span className="font-semibold">minha_empresa</span>
          {content.generatedText && (
            <span className="ml-2">{content.generatedText}</span>
          )}
        </div>
        <div className="text-gray-500 text-sm mt-1">Ver todos os comentários</div>
        <div className="text-gray-400 text-xs mt-1 uppercase">HÁ 2 HORAS</div>
      </div>
    </div>
  );
}