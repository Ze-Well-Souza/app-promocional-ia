import React from 'react';
import { ContentData } from '@/types';
import { format } from 'date-fns';

interface WhatsAppPreviewProps {
  content: ContentData;
}

export function WhatsAppPreview({ content }: WhatsAppPreviewProps) {
  const now = new Date();
  const timeStr = format(now, 'HH:mm');

  return (
    <div className="max-w-sm mx-auto">
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="bg-white rounded-lg shadow-sm">
          {/* WhatsApp Header */}
          <div className="flex items-center gap-3 p-3 border-b bg-green-500 text-white rounded-t-lg">
            <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold">M</span>
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm">Minha Empresa</div>
              <div className="text-xs opacity-90">online</div>
            </div>
          </div>

          {/* Message Area */}
          <div className="p-4 bg-gray-50 min-h-[200px] space-y-2">
            {/* Date indicator */}
            <div className="text-center">
              <span className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
                Hoje
              </span>
            </div>

            {/* Message bubble */}
            <div className="flex justify-end">
              <div className="max-w-[85%] bg-green-500 text-white rounded-lg p-3 relative">
                {content.generatedImage && (
                  <div className="mb-2">
                    <img 
                      src={content.generatedImage} 
                      alt="Imagem promocional"
                      className="w-full rounded-lg max-w-xs"
                    />
                  </div>
                )}
                
                {content.generatedText && (
                  <div 
                    className="text-sm leading-relaxed whitespace-pre-wrap break-words"
                    style={{ color: content.colors.text === '#000000' ? 'white' : content.colors.text }}
                  >
                    {content.generatedText}
                  </div>
                )}
                
                <div className="flex items-center justify-end gap-1 mt-2">
                  <span className="text-xs opacity-70">{timeStr}</span>
                  <div className="flex">
                    <svg className="w-4 h-4 opacity-70" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <svg className="w-4 h-4 opacity-70 -ml-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>

                {/* Message tail */}
                <div className="absolute -right-2 bottom-3 w-0 h-0 border-l-[16px] border-l-green-500 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent"></div>
              </div>
            </div>
          </div>

          {/* Input area */}
          <div className="p-3 border-t bg-white rounded-b-lg">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              <span className="flex-1 text-sm text-gray-500">Digite uma mensagem</span>
              <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}