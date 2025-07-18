import React from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

interface ColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  label?: string;
}

const PRESET_COLORS = [
  '#000000', '#ffffff', '#f87171', '#fb923c', '#fbbf24',
  '#a3e635', '#34d399', '#22d3ee', '#60a5fa', '#a78bfa',
  '#f472b6', '#f87171', '#dc2626', '#ea580c', '#d97706',
  '#65a30d', '#059669', '#0891b2', '#2563eb', '#7c3aed',
  '#c026d3', '#be185d'
];

export function ColorPicker({ color, onChange, label }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium">{label}</label>}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full h-10 p-1 flex items-center gap-2"
          >
            <div 
              className="w-6 h-6 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 text-left">{color}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3">
          <div className="space-y-3">
            <input
              type="color"
              value={color}
              onChange={(e) => onChange(e.target.value)}
              className="w-full h-10 rounded border cursor-pointer"
            />
            <div className="grid grid-cols-6 gap-2">
              {PRESET_COLORS.map((presetColor) => (
                <button
                  key={presetColor}
                  className="w-8 h-8 rounded border-2 hover:scale-110 transition-transform"
                  style={{ 
                    backgroundColor: presetColor,
                    borderColor: color === presetColor ? '#3b82f6' : '#e5e5e5'
                  }}
                  onClick={() => onChange(presetColor)}
                />
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}