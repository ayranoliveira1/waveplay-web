import { useMemo, useState, useEffect } from 'react'
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import {
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Pencil,
  Power,
  PowerOff,
  Search,
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react'
import { motion } from 'motion/react'
import { admin } from '../../services/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import {
  DropdownMenu,
  type DropdownMenuItem,
} from '../../components/ui/DropdownMenu'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { CreateUserModal } from './components/CreateUserModal'
import { EditUserModal } from './components/EditUserModal'
import { toast } from '../../lib/toast'
import type { AdminUser } from '../../types/admin'

type ActionType = 'deactivate' | 'activate' | 'delete'

interface ConfirmState {
  type: ActionType
  user: AdminUser
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('pt-BR')
}

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-40" />
          <Skeleton className="h-5 w-64" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-10 w-36" />
        </div>
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    </div>
  )
}

export function AdminUsersPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [confirmState, setConfirmState] = useState<ConfirmState | null>(null)

  // Debounce 300ms + reset page
  useEffect(() => {
    const t = setTimeout(() => {
      const trimmed = searchInput.trim()
      setDebouncedSearch((prev) => {
        if (prev !== trimmed) setPage(1)
        return trimmed
      })
    }, 300)
    return () => clearTimeout(t)
  }, [searchInput])

  const { data, isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['admin', 'users', { page, search: debouncedSearch }],
    queryFn: async () => {
      const response = await admin.listUsers({
        page,
        limit: 20,
        search: debouncedSearch || undefined,
      })
      if (!response.success) throw new Error('Falha ao carregar usuarios')
      return response.data
    },
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })

  function invalidateUsers() {
    queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
  }

  const deactivateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await admin.deactivateUser(userId)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao desativar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUsers()
      toast.success('Usuario desativado com sucesso')
      setConfirmState(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao desativar usuario')
    },
  })

  const activateMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await admin.activateUser(userId)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao ativar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUsers()
      toast.success('Usuario ativado com sucesso')
      setConfirmState(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao ativar usuario')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (userId: string) => {
      const response = await admin.deleteUser(userId)
      if (!response.success) {
        throw new Error(
          response.error?.[0]?.message ?? 'Falha ao deletar usuario',
        )
      }
      return response.data
    },
    onSuccess: () => {
      invalidateUsers()
      toast.success('Usuario deletado com sucesso')
      setConfirmState(null)
    },
    onError: (error: Error) => {
      toast.error(error.message ?? 'Falha ao deletar usuario')
    },
  })

  const confirmPending =
    (confirmState?.type === 'deactivate' && deactivateMutation.isPending) ||
    (confirmState?.type === 'activate' && activateMutation.isPending) ||
    (confirmState?.type === 'delete' && deleteMutation.isPending)

  function handleConfirm() {
    if (!confirmState) return
    const { type, user } = confirmState
    if (type === 'deactivate') deactivateMutation.mutate(user.id)
    else if (type === 'activate') activateMutation.mutate(user.id)
    else if (type === 'delete') deleteMutation.mutate(user.id)
  }

  function buildMenuItems(user: AdminUser): DropdownMenuItem[] {
    const isAdminUser = user.role === 'admin'
    const adminTooltip = (action: string) =>
      `Nao e permitido ${action} um administrador`

    return [
      {
        label: 'Editar',
        icon: Pencil,
        onSelect: () => setEditingUser(user),
        disabled: isAdminUser,
        disabledTooltip: isAdminUser ? adminTooltip('editar') : undefined,
      },
      user.active
        ? {
            label: 'Desativar',
            icon: PowerOff,
            onSelect: () => setConfirmState({ type: 'deactivate', user }),
            disabled: isAdminUser,
            disabledTooltip: isAdminUser ? adminTooltip('desativar') : undefined,
          }
        : {
            label: 'Ativar',
            icon: Power,
            onSelect: () => setConfirmState({ type: 'activate', user }),
            disabled: isAdminUser,
            disabledTooltip: isAdminUser ? adminTooltip('ativar') : undefined,
          },
      {
        label: 'Deletar',
        icon: Trash2,
        variant: 'danger',
        onSelect: () => setConfirmState({ type: 'delete', user }),
        disabled: isAdminUser || user.active,
        disabledTooltip: isAdminUser
          ? adminTooltip('deletar')
          : user.active
            ? 'Desative o usuario antes de excluir'
            : undefined,
      },
    ]
  }

  const confirmCopy = useMemo(() => {
    if (!confirmState) return null
    const { type, user } = confirmState
    if (type === 'deactivate') {
      return {
        variant: 'warning' as const,
        title: 'Desativar usuario',
        description: `Desativar ${user.name}? O usuario nao conseguira fazer login e todas as sessoes ativas serao encerradas.`,
        confirmLabel: 'Desativar',
      }
    }
    if (type === 'activate') {
      return {
        variant: 'warning' as const,
        title: 'Ativar usuario',
        description: `Reativar ${user.name}? O usuario voltara a poder fazer login normalmente.`,
        confirmLabel: 'Ativar',
      }
    }
    return {
      variant: 'danger' as const,
      title: 'Deletar usuario',
      description: `Deletar ${user.name} permanentemente? Esta acao nao pode ser desfeita.`,
      confirmLabel: 'Deletar',
    }
  }, [confirmState])

  if (isLoading) return <UsersSkeleton />

  if (isError) {
    return (
      <EmptyState
        title="Nao foi possivel carregar os usuarios"
        description="Verifique sua conexao e tente novamente."
        action={
          <Button fullWidth={false} className="px-6" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  const users = data?.users ?? []
  const totalItems = data?.totalItems ?? 0
  const totalPages = data?.totalPages ?? 1

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <Users size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-text sm:text-3xl">
              Usuarios
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Gerencie os usuarios do WavePlay
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
            />
            <input
              type="search"
              placeholder="Buscar por nome ou email"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Buscar usuarios"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-text outline-none transition-colors placeholder:text-text-muted/50 focus:border-primary sm:w-72"
            />
          </div>
          <Button fullWidth={false} onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus size={18} />
            Novo usuario
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      {users.length === 0 ? (
        <EmptyState
          title="Nenhum usuario encontrado"
          description={
            debouncedSearch
              ? `Nenhum resultado para "${debouncedSearch}"`
              : 'Nenhum usuario cadastrado.'
          }
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className={isFetching ? 'opacity-60 transition-opacity' : ''}
        >
          {/* Mobile: cards */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {users.map((user) => (
              <div
                key={user.id}
                onClick={() => navigate(`/admin/users/${user.id}`)}
                className={`block cursor-pointer rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30 ${
                  !user.active ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-text">{user.name}</p>
                      {!user.active && (
                        <Badge variant="default">Inativo</Badge>
                      )}
                    </div>
                    <p className="mt-1 truncate text-sm text-text-muted">
                      {user.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={user.role === 'admin' ? 'primary' : 'default'}
                    >
                      {user.role}
                    </Badge>
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
                      items={buildMenuItems(user)}
                    />
                  </div>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  {user.subscription?.planName ?? 'Sem assinatura'}
                </p>
              </div>
            ))}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-x-auto rounded-xl border border-border bg-surface md:block">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-text-muted">
                  <th className="px-5 py-3 font-medium">Nome</th>
                  <th className="px-5 py-3 font-medium">Email</th>
                  <th className="px-5 py-3 font-medium">Role</th>
                  <th className="px-5 py-3 font-medium">Plano</th>
                  <th className="px-5 py-3 font-medium">Criado em</th>
                  <th className="w-12 px-2 py-3 font-medium text-right">
                    Acoes
                  </th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className={`cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-primary/5 ${
                      !user.active ? 'opacity-60' : ''
                    }`}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td className="px-5 py-3 font-medium text-text">
                      <div className="flex items-center gap-2">
                        <span>{user.name}</span>
                        {!user.active && (
                          <Badge variant="default">Inativo</Badge>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-text-muted">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={user.role === 'admin' ? 'primary' : 'default'}
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {user.subscription?.planName ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {formatDate(user.createdAt)}
                    </td>
                    <td
                      className="px-2 py-3 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
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
                        items={buildMenuItems(user)}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <footer className="flex items-center justify-between gap-2">
          <p className="text-sm text-text-muted">
            {totalItems} {totalItems === 1 ? 'usuario' : 'usuarios'}
          </p>
          <div className="flex items-center gap-2">
            <button
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-border hover:text-text disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="text-sm text-text-muted">
              {page} / {totalPages}
            </span>
            <button
              disabled={page >= totalPages || isFetching}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-surface text-text-muted transition-colors hover:bg-border hover:text-text disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </footer>
      )}

      {/* Create user modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {/* Edit user modal */}
      <EditUserModal
        open={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
      />

      {/* Confirm dialog (deactivate / activate / delete) */}
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
