import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { castPlatformFor, type CastPlatform } from '../../lib/player/cast-tip'

const NEXT: Record<CastPlatform, CastPlatform> = {
  desktop: 'android',
  android: 'ios',
  ios: 'desktop',
}

const TIPS: Record<CastPlatform, { device: string; steps: string[] }> = {
  desktop: {
    device: 'Computador',
    steps: [
      'No Chrome ou no Edge, abra o menu ⋮ e escolha Transmitir…',
      'Selecione a sua TV ou Chromecast',
      'Em Fontes, escolha Transmitir guia',
    ],
  },
  android: {
    device: 'Android',
    steps: [
      'Puxe o painel rápido do topo da tela',
      'Toque em Transmitir tela (ou Smart View)',
      'Escolha a sua TV',
    ],
  },
  ios: {
    device: 'iPhone',
    steps: [
      'Abra a Central de Controle',
      'Toque em Espelhamento de tela',
      'Escolha a sua Apple TV ou TV com AirPlay',
    ],
  },
}

interface CastHelpModalProps {
  open: boolean
  onClose: () => void
}

function detectPlatform() {
  return castPlatformFor(navigator.userAgent, navigator.maxTouchPoints)
}

export function CastHelpModal({ open, onClose }: CastHelpModalProps) {
  const [platform, setPlatform] = useState(detectPlatform)
  const [wasOpen, setWasOpen] = useState(open)
  const tip = TIPS[platform]

  // Cada abertura volta ao aparelho detectado.
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setPlatform(detectPlatform())
  }

  return (
    <Modal open={open} onClose={onClose} title="Transmitir para a TV">
      <p className="text-sm text-text-muted">
        Conecte o aparelho e a TV ao mesmo Wi-Fi e espelhe a tela.
      </p>

      <p className="mt-5 mb-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
        {tip.device}
      </p>
      <ol className="space-y-3 text-sm text-text">
        {tip.steps.map((step, i) => (
          <li key={step} className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>

      <button
        type="button"
        onClick={() => setPlatform(NEXT[platform])}
        className="mt-6 text-sm font-semibold text-primary transition-colors hover:text-primary-light cursor-pointer"
      >
        Ver instruções de outro aparelho
      </button>
    </Modal>
  )
}
