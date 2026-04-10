import { useState, useEffect } from 'react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useNavigate, Link } from 'react-router'
import { Search, UserPlus, Users } from 'lucide-react'
import { motion } from 'motion/react'
import { admin } from '../../services/admin'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { CreateUserModal } from './components/CreateUserModal'

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
  const [page, setPage] = useState(1)
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

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

  if (isLoading) return <UsersSkeleton />

  if (isError) {
    return (
      <EmptyState
        title="Nao foi possivel carregar os usuarios"
        description="Verifique sua conexao e tente novamente."
        action={
          <Button className="w-auto px-6" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  const users = data?.users ?? []
  const total = data?.total ?? 0

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
          <Button
            className="w-auto"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <UserPlus size={18} className="mr-1.5" />
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
              <Link
                key={user.id}
                to={`/admin/users/${user.id}`}
                className="block rounded-xl border border-border bg-surface p-4 transition-colors hover:border-primary/30"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium text-text">{user.name}</p>
                    <p className="mt-1 truncate text-sm text-text-muted">
                      {user.email}
                    </p>
                  </div>
                  <Badge
                    variant={user.role === 'admin' ? 'primary' : 'default'}
                  >
                    {user.role}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-text-muted">
                  {user.subscription?.plan?.name ?? 'Sem assinatura'}
                </p>
              </Link>
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
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="cursor-pointer border-b border-border last:border-0 transition-colors hover:bg-primary/5"
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    <td className="px-5 py-3 font-medium text-text">
                      {user.name}
                    </td>
                    <td className="px-5 py-3 text-text-muted">{user.email}</td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          user.role === 'admin' ? 'primary' : 'default'
                        }
                      >
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {user.subscription?.plan?.name ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-text-muted">
                      {formatDate(user.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <footer className="flex items-center justify-between gap-2">
          <p className="text-sm text-text-muted">
            {total} {total === 1 ? 'usuario' : 'usuarios'}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              className="w-auto px-4"
              disabled={page === 1 || isFetching}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <span className="text-sm text-text-muted">Pagina {page}</span>
            <Button
              variant="secondary"
              className="w-auto px-4"
              disabled={users.length < 20 || isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              Proximo
            </Button>
          </div>
        </footer>
      )}

      {/* Create user modal */}
      <CreateUserModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  )
}
