import { useCallback } from 'react'

type HapticType = 'light' | 'medium' | 'heavy' | 'selection' | 'impact' | 'notification'

interface HapticFeedback {
  vibrate: (pattern?: number | number[]) => void
  impactOccurred: (style: 'light' | 'medium' | 'heavy') => void
  selectionChanged: () => void
  notificationOccurred: (type: 'success' | 'warning' | 'error') => void
}

// Detecta se o dispositivo suporta vibração
const supportsVibration = () => {
  return 'vibrate' in navigator
}

// Detecta se é um dispositivo iOS com suporte a Haptic Feedback
const supportsHapticFeedback = () => {
  return (
    typeof window !== 'undefined' &&
    'DeviceMotionEvent' in window &&
    /iPad|iPhone|iPod/.test(navigator.userAgent)
  )
}

export const useHapticFeedback = (): HapticFeedback => {
  const vibrate = useCallback((pattern: number | number[] = 50) => {
    if (supportsVibration()) {
      try {
        navigator.vibrate(pattern)
      } catch (error) {
        console.warn('Vibration not supported:', error)
      }
    }
  }, [])

  const impactOccurred = useCallback((style: 'light' | 'medium' | 'heavy') => {
    if (supportsHapticFeedback()) {
      // Para dispositivos iOS com suporte nativo
      try {
        // @ts-ignore - Haptic Feedback API não está tipada
        if (window.DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === 'function') {
          // iOS 13+ com permissão
          const patterns = {
            light: [10],
            medium: [20],
            heavy: [30]
          }
          vibrate(patterns[style])
        }
      } catch (error) {
        // Fallback para vibração padrão
        const patterns = {
          light: 10,
          medium: 20,
          heavy: 30
        }
        vibrate(patterns[style])
      }
    } else {
      // Fallback para dispositivos Android e outros
      const patterns = {
        light: 10,
        medium: 20,
        heavy: 30
      }
      vibrate(patterns[style])
    }
  }, [vibrate])

  const selectionChanged = useCallback(() => {
    // Vibração sutil para mudança de seleção
    vibrate(5)
  }, [vibrate])

  const notificationOccurred = useCallback((type: 'success' | 'warning' | 'error') => {
    const patterns = {
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [50, 100, 50, 100, 50]
    }
    vibrate(patterns[type])
  }, [vibrate])

  return {
    vibrate,
    impactOccurred,
    selectionChanged,
    notificationOccurred
  }
}

// Hook simplificado para uso rápido
export const useSimpleHaptic = () => {
  const { impactOccurred, selectionChanged, notificationOccurred } = useHapticFeedback()
  
  return {
    light: () => impactOccurred('light'),
    medium: () => impactOccurred('medium'),
    heavy: () => impactOccurred('heavy'),
    selection: selectionChanged,
    success: () => notificationOccurred('success'),
    warning: () => notificationOccurred('warning'),
    error: () => notificationOccurred('error')
  }
}