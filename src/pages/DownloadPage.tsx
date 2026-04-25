import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import {
  Apple,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  Smartphone,
  Monitor,
  AlertCircle,
} from 'lucide-react'
import { appVersionService } from '../services/app-version'
import { Button } from '../components/ui/Button'
import { Skeleton } from '../components/ui/Skeleton'
import type { AppVersion } from '../types/mobile-app'

type Platform = 'android' | 'ios' | 'desktop'

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase()
  if (/android/.test(ua)) return 'android'
  if (
    /iphone|ipad|ipod/.test(ua) ||
    (ua.includes('mac') && 'ontouchend' in document)
  ) {
    return 'ios'
  }
  return 'desktop'
}

export function DownloadPage() {
  const platform = useMemo<Platform>(() => detectPlatform(), [])

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['app', 'version'],
    queryFn: async () => {
      const response = await appVersionService.getCurrent()
      if (!response.success) {
        const code = response.error?.[0]?.code
        if (code === 'NO_CURRENT_VERSION') return null
        throw new Error(response.error?.[0]?.message ?? 'Falha')
      }
      return response.data
    },
    staleTime: 60_000,
    retry: false,
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Header simples */}
      <header className="border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-4">
          <Link to="/" className="text-xl font-bold text-primary">
            WAVEPLAY
          </Link>
          <Link
            to="/auth/login"
            className="text-sm text-text-muted transition-colors hover:text-text"
          >
            Entrar
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-10 text-center"
        >
          <h1 className="text-3xl font-bold text-text sm:text-4xl">
            Baixar WavePlay
          </h1>
          <p className="mt-3 text-sm text-text-muted">
            App Android disponivel para download direto
          </p>
        </motion.div>

        {isLoading && <DownloadSkeleton />}

        {!isLoading && isError && (
          <ErrorCard
            title="Nao foi possivel carregar a versao"
            description="Verifique sua conexao e tente novamente."
            onRetry={() => refetch()}
          />
        )}

        {!isLoading && !isError && !data && (
          <ErrorCard
            title="Nenhuma versao disponivel ainda"
            description="A primeira versao do app sera publicada em breve. Volte depois ou use o WavePlay no navegador."
            ctaLabel="Abrir no navegador"
            ctaTo="/auth/login"
          />
        )}

        {!isLoading && !isError && data && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {platform === 'android' && <AndroidDownloadCard data={data} />}
            {platform === 'ios' && <IosComingSoonCard />}
            {platform === 'desktop' && <DesktopQrCard data={data} />}
          </motion.div>
        )}
      </main>
    </div>
  )
}

function DownloadSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 rounded-xl" />
      <Skeleton className="h-24 rounded-xl" />
    </div>
  )
}

interface ErrorCardProps {
  title: string
  description: string
  onRetry?: () => void
  ctaLabel?: string
  ctaTo?: string
}

function ErrorCard({
  title,
  description,
  onRetry,
  ctaLabel,
  ctaTo,
}: ErrorCardProps) {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <AlertCircle size={32} className="mx-auto mb-4 text-text-muted" />
      <h2 className="text-lg font-semibold text-text">{title}</h2>
      <p className="mt-2 text-sm text-text-muted">{description}</p>
      {onRetry && (
        <Button
          fullWidth={false}
          className="mt-5 px-6"
          onClick={onRetry}
        >
          Tentar novamente
        </Button>
      )}
      {ctaTo && ctaLabel && (
        <Link to={ctaTo} className="mt-5 inline-block">
          <Button fullWidth={false} className="px-6">
            {ctaLabel}
          </Button>
        </Link>
      )}
    </div>
  )
}

function AndroidDownloadCard({ data }: { data: AppVersion }) {
  const [showInstructions, setShowInstructions] = useState(false)

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success/10 text-success">
            <Smartphone size={24} />
          </div>
          <div>
            <p className="text-sm text-text-muted">Android detectado</p>
            <p className="font-semibold text-text">Pronto para baixar</p>
          </div>
        </div>

        <a
          href={data.downloadUrl}
          download
          className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-text transition-colors hover:bg-primary-light"
        >
          <Download size={18} />
          Baixar APK v{data.version}
        </a>

        {data.releaseNotes && (
          <div className="mt-5 rounded-lg border border-border/50 bg-background/40 p-4">
            <p className="mb-2 text-xs font-medium uppercase text-text-muted">
              Novidades
            </p>
            <p className="whitespace-pre-line text-sm text-text">
              {data.releaseNotes}
            </p>
          </div>
        )}

        <p className="mt-4 text-xs text-text-muted">
          Voce esta baixando direto do nosso servidor. Sem app store por ora.
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowInstructions((v) => !v)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface px-5 py-3 text-left text-sm font-medium text-text transition-colors hover:border-primary/30 cursor-pointer"
      >
        Como instalar?
        {showInstructions ? (
          <ChevronUp size={18} className="text-text-muted" />
        ) : (
          <ChevronDown size={18} className="text-text-muted" />
        )}
      </button>

      {showInstructions && (
        <ol className="rounded-xl border border-border bg-surface p-6 space-y-3 text-sm text-text">
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              1
            </span>
            <span>Toque em &quot;Baixar APK&quot; acima.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              2
            </span>
            <span>Quando o download concluir, abra o arquivo .apk.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              3
            </span>
            <span>
              O Android pode pedir para permitir instalar de fontes
              desconhecidas — autorize.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              4
            </span>
            <span>Confirme a instalacao na tela do sistema.</span>
          </li>
          <li className="flex gap-3">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/20 text-xs font-bold text-primary">
              5
            </span>
            <span>Pronto! Abra o WavePlay e faca login.</span>
          </li>
        </ol>
      )}
    </div>
  )
}

function IosComingSoonCard() {
  return (
    <div className="rounded-xl border border-border bg-surface p-8 text-center">
      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-text/10 text-text">
        <Apple size={28} />
      </div>
      <h2 className="text-xl font-bold text-text">Em breve no iOS</h2>
      <p className="mx-auto mt-3 max-w-md text-sm text-text-muted">
        Estamos trabalhando para disponibilizar o WavePlay no iOS. Por
        enquanto voce pode usar pelo navegador no seu iPhone ou iPad.
      </p>
      <Link to="/auth/login" className="mt-6 inline-block">
        <Button fullWidth={false} className="px-6">
          Abrir no navegador
        </Button>
      </Link>
    </div>
  )
}

function DesktopQrCard({ data }: { data: AppVersion }) {
  const pageUrl = typeof window !== 'undefined' ? window.location.href : ''
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(data.downloadUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Browsers antigos sem Clipboard API — fallback silencioso
    }
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-8">
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={pageUrl} size={160} />
        </div>

        <div className="flex-1 text-center sm:text-left">
          <div className="mb-3 flex items-center justify-center gap-2 sm:justify-start">
            <Monitor size={20} className="text-text-muted" />
            <span className="text-sm text-text-muted">
              Desktop detectado
            </span>
          </div>
          <h2 className="text-lg font-semibold text-text">
            Abra esta pagina no celular
          </h2>
          <p className="mt-2 text-sm text-text-muted">
            Aponte a camera do seu Android para o QR code para baixar
            automaticamente o app v{data.version}.
          </p>

          <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
            <a
              href={data.downloadUrl}
              download
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-text transition-colors hover:bg-primary-light"
            >
              <Download size={16} />
              Baixar agora
            </a>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-10 items-center justify-center gap-2 rounded-lg border border-border bg-surface/40 px-5 text-sm font-medium text-text-muted transition-colors hover:border-primary/30 hover:text-text cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={16} className="text-success" />
                  Link copiado
                </>
              ) : (
                <>
                  <Copy size={16} />
                  Copiar link
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
