import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  MoreVertical,
  Plus,
  Smartphone,
  Star,
  Trash2,
  Zap,
} from 'lucide-react'
import { motion } from 'motion/react'
import { admin } from '../../services/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import {
  DropdownMenu,
  type DropdownMenuItem,
} from '../../components/ui/DropdownMenu'
import { CreateAppVersionModal } from './components/CreateAppVersionModal'
import { toast } from '../../lib/toast'
import type { AdminAppVersion } from '../../types/mobile-app'

type ActionType = 'promote' | 'delete'

interface ConfirmState {
  type: ActionType
  version: AdminAppVersion
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function formatSize(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function PageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function AdminAppVersionsPage() {
  const queryClient = useQueryClient()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'app-versions'],
    queryFn: async () => {
      const response = await admin.listAppVersions()
      if (!response.success) throw new Error('Falha ao carregar versoes')
      return response.data
    },
    staleTime: 30_000,
  })

  function invalidate() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'app-versions'] })
  }

  const promoteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await admin.setCurrentAppVersion(id)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao promover versao',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidate()
      toast.success('Versao promovida a atual')
      setConfirmState(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao promover versao')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await admin.deleteAppVersion(id)
      if (!response.success) {
        const msg = response.error?.[0]?.message ?? 'Falha ao excluir versao'
        const code = response.error?.[0]?.code
        throw Object.assign(new Error(msg), { code })
      }
      return response.data
    },
    onSuccess: () => {
      invalidate()
      toast.success('Versao excluida')
      setConfirmState(null)
    },
    onError: (error: Error & { code?: string }) => {
      if (error.code === 'CANNOT_DELETE_CURRENT_VERSION') {
        toast.error('Promova outra versao como atual antes de excluir')
        invalidate()
      } else {
        toast.error(error.message ?? 'Falha ao excluir versao')
      }
    },
  })

  const confirmPending =
    (confirmState?.type === 'promote' && promoteMutation.isPending) ||
    (confirmState?.type === 'delete' && deleteMutation.isPending)

  function handleConfirm() {
    if (!confirmState) return
    if (confirmState.type === 'promote')
      promoteMutation.mutate(confirmState.version.id)
    else if (confirmState.type === 'delete')
      deleteMutation.mutate(confirmState.version.id)
  }

  function buildMenuItems(version: AdminAppVersion): DropdownMenuItem[] {
    return [
      {
        label: 'Promover a atual',
        icon: Star,
        onSelect: () => setConfirmState({ type: 'promote', version }),
        disabled: version.isCurrent,
        disabledTooltip: version.isCurrent
          ? 'Esta versao ja e a atual'
          : undefined,
      },
      {
        label: 'Excluir',
        icon: Trash2,
        variant: 'danger',
        onSelect: () => setConfirmState({ type: 'delete', version }),
        disabled: version.isCurrent,
        disabledTooltip: version.isCurrent
          ? 'Promova outra versao antes de excluir'
          : undefined,
      },
    ]
  }

  const confirmCopy = useMemo(() => {
    if (!confirmState) return null
    const { type, version } = confirmState
    if (type === 'promote') {
      return {
        variant: 'warning' as const,
        title: `Promover versao "${version.version}" como atual?`,
        description:
          'Apps com versao mais antiga vao receber notificacao de atualizacao na proxima abertura.',
        confirmLabel: 'Promover',
      }
    }
    return {
      variant: 'danger' as const,
      title: `Excluir versao "${version.version}"?`,
      description:
        'O APK sera removido do storage permanentemente. Esta acao nao pode ser desfeita.',
      confirmLabel: 'Excluir',
    }
  }, [confirmState])

  if (isLoading) return <PageSkeleton />

  if (isError) {
    return (
      <EmptyState
        title="Nao foi possivel carregar as versoes"
        description="Verifique sua conexao e tente novamente."
        action={
          <Button fullWidth={false} className="px-6" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  const versions = data?.versions ?? []

  return (
    <div className="space-y-6">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <Smartphone size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-text sm:text-3xl">
              Versoes do App
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie as versoes do app mobile Android
          </p>
        </div>

        <Button fullWidth={false} onClick={() => setIsCreateOpen(true)}>
          <Plus size={18} />
          Nova versao
        </Button>
      </motion.header>

      {versions.length === 0 ? (
        <EmptyState
          title="Nenhuma versao publicada"
          description="Publique a primeira versao do APK para comecar."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {versions.map((v) => (
              <div
                key={v.id}
                className={`rounded-xl border border-border bg-surface p-4 ${
                  !v.isCurrent ? 'opacity-70' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-text">v{v.version}</p>
                      {v.isCurrent && (
                        <Badge variant="success">Atual</Badge>
                      )}
                      {v.forceUpdate && (
                        <Badge variant="warning">Force update</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {formatSize(v.fileSize)} ·{' '}
                      {formatDate(v.publishedAt)}
                    </p>
                    {v.releaseNotes && (
                      <p className="mt-2 line-clamp-2 text-xs text-text-muted">
                        {v.releaseNotes}
                      </p>
                    )}
                  </div>
                  <DropdownMenu
                    trigger={
                      <button
                        type="button"
                        aria-label="Acoes"
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-border/30 hover:text-text cursor-pointer"
                      >
                        <MoreVertical size={18} />
                      </button>
                    }
                    items={buildMenuItems(v)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop: tabela */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-5 py-3 font-medium">Versao</th>
                  <th className="px-5 py-3 font-medium">Tamanho</th>
                  <th className="px-5 py-3 font-medium">Publicado em</th>
                  <th className="w-12 px-2 py-3 font-medium text-right">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {versions.map((v) => (
                  <tr
                    key={v.id}
                    className={`border-b border-border last:border-0 ${
                      !v.isCurrent ? 'opacity-70' : ''
                    }`}
                  >
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-text">
                          v{v.version}
                        </span>
                        {v.isCurrent && (
                          <Badge variant="success">
                            <Star size={10} />
                            Atual
                          </Badge>
                        )}
                        {v.forceUpdate && (
                          <Badge variant="warning">
                            <Zap size={10} />
                            Force
                          </Badge>
                        )}
                      </div>
                      {v.releaseNotes && (
                        <p className="mt-1 max-w-md truncate text-xs text-text-muted">
                          {v.releaseNotes}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {formatSize(v.fileSize)}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {formatDate(v.publishedAt)}
                    </td>
                    <td className="px-2 py-3 text-right">
                      <DropdownMenu
                        trigger={
                          <button
                            type="button"
                            aria-label="Acoes"
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-border/30 hover:text-text cursor-pointer"
                          >
                            <MoreVertical size={18} />
                          </button>
                        }
                        items={buildMenuItems(v)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      <CreateAppVersionModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />

      {confirmState && confirmCopy && (
        <ConfirmDialog
          open={!!confirmState}
          onOpenChange={(o) => !o && setConfirmState(null)}
          title={confirmCopy.title}
          description={confirmCopy.description}
          variant={confirmCopy.variant}
          confirmLabel={confirmCopy.confirmLabel}
          isPending={!!confirmPending}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  )
}
