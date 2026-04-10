import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Users,
  BadgeCheck,
  Monitor,
  DollarSign,
  UserCheck,
  Play,
  Clock,
  TrendingUp,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { startOfMonth, format } from 'date-fns'
import type { DateRange } from 'react-day-picker'
import { admin } from '../../services/admin'
import { Skeleton } from '../../components/ui/Skeleton'
import { EmptyState } from '../../components/ui/EmptyState'
import { Button } from '../../components/ui/Button'
import { DateRangePicker } from '../../components/ui/DateRangePicker'

// ── Theme ─────────────────────────────────────────────────────
const C = {
  primary: '#7B2FBE',
  primaryLight: '#9B4FDE',
  primaryDark: '#5B1F9E',
  textMuted: '#A0A0B0',
  border: '#2A2A3E',
  surface: '#1A1A2E',
} as const

const PIE_COLORS = [
  '#7B2FBE',
  '#9B4FDE',
  '#22C55E',
  '#F59E0B',
  '#3B82F6',
  '#EC4899',
  '#EF4444',
]

// ── Helpers ───────────────────────────────────────────────────
function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

function formatDuration(seconds: number): string {
  return Math.round(seconds / 60) + 'min'
}

function formatDateLabel(dateStr: string): string {
  const [, m, d] = dateStr.split('-')
  return `${d}/${m}`
}

// ── Animated MetricCard ───────────────────────────────────────
interface MetricCardProps {
  icon: ReactNode
  label: string
  value: string | number
  delay?: number
}

function MetricCard({ icon, label, value, delay = 0 }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ scale: 1.02 }}
      className="flex items-center gap-4 rounded-xl border border-border bg-surface p-5 transition-colors hover:border-primary/30"
      aria-label={`${label}: ${value}`}
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-text-muted">{label}</p>
        <p className="text-2xl font-bold text-text">{value}</p>
      </div>
    </motion.div>
  )
}

// ── ChartCard ─────────────────────────────────────────────────
function ChartCard({
  title,
  children,
  delay = 0,
  className = '',
}: {
  title: string
  children: ReactNode
  delay?: number
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`rounded-xl border border-border bg-surface p-5 ${className}`}
    >
      <h3 className="mb-4 text-sm font-medium text-text-muted">{title}</h3>
      {children}
    </motion.div>
  )
}

// ── Empty chart placeholder ───────────────────────────────────
function ChartEmpty({ message = 'Sem dados para o periodo selecionado' }: { message?: string }) {
  return (
    <div className="flex h-[200px] items-center justify-center">
      <p className="text-sm text-text-muted">{message}</p>
    </div>
  )
}

// ── Custom Tooltip ────────────────────────────────────────────
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: Array<{ value: number; name: string; color?: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
      <p className="mb-1 text-text-muted">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="font-medium text-text">
          {entry.value.toLocaleString('pt-BR')}
        </p>
      ))}
    </div>
  )
}

// ── Pie Legend ─────────────────────────────────────────────────
function PieLegend({
  items,
}: {
  items: Array<{ name: string; color: string; value: number }>
}) {
  return (
    <div className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1">
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5 text-xs">
          <span
            className="inline-block h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-text-muted">
            {item.name}{' '}
            <span className="font-medium text-text">{item.value}</span>
          </span>
        </div>
      ))}
    </div>
  )
}

// ── Skeleton ──────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="mb-2 h-8 w-48" />
          <Skeleton className="h-5 w-72" />
        </div>
        <Skeleton className="h-10 w-52" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 rounded-xl lg:col-span-3" />
        <Skeleton className="h-80 rounded-xl lg:col-span-2" />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-64 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Skeleton className="h-48 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────
export function AdminDashboardPage() {
  const [range, setRange] = useState<DateRange | undefined>({
    from: startOfMonth(new Date()),
    to: new Date(),
  })

  const startDate = range?.from ? format(range.from, 'yyyy-MM-dd') : undefined
  const endDate = range?.to ? format(range.to, 'yyyy-MM-dd') : undefined

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'dashboard', { startDate, endDate }],
    queryFn: async () => {
      const response = await admin.getDashboardAnalytics({
        startDate,
        endDate,
      })
      if (!response.success) throw new Error('Falha ao carregar dashboard')
      return response.data
    },
    staleTime: 60_000,
  })

  // ── Derived chart data ────────────────────────────────────
  const registrationData = useMemo(
    () =>
      data?.period.registrationsByDay.map((d) => ({
        date: formatDateLabel(d.date),
        registros: d.count,
      })) ?? [],
    [data],
  )

  const cumulativeData = useMemo(
    () =>
      data?.period.cumulativeUsers.map((d) => ({
        date: formatDateLabel(d.date),
        total: d.total,
      })) ?? [],
    [data],
  )

  const streamsByHourData = useMemo(
    () =>
      data?.period.streamsByHour.map((d) => ({
        hour: `${String(d.hour).padStart(2, '0')}h`,
        sessoes: d.count,
      })) ?? [],
    [data],
  )

  const subscriptionsPieData = useMemo(
    () =>
      data?.overview.subscriptionsByPlan.map((s) => ({
        name: s.planName,
        value: s.count,
      })) ?? [],
    [data],
  )

  const profileTypePieData = useMemo(
    () =>
      data
        ? [
            { name: 'Normal', value: data.overview.profilesByType.normal },
            { name: 'Kids', value: data.overview.profilesByType.kids },
          ]
        : [],
    [data],
  )

  const contentTypePieData = useMemo(() => {
    if (!data) return []
    let movies = 0
    let series = 0
    for (const item of data.period.topContent) {
      if (item.type === 'movie') movies++
      else series++
    }
    return [
      { name: 'Filmes', value: movies },
      { name: 'Series', value: series },
    ]
  }, [data])

  // ── Loading / Error ───────────────────────────────────────
  if (isLoading) return <DashboardSkeleton />

  if (isError || !data) {
    return (
      <EmptyState
        title="Nao foi possivel carregar o dashboard"
        description="Verifique sua conexao e tente novamente."
        action={
          <Button className="w-auto px-6" onClick={() => refetch()}>
            Tentar novamente
          </Button>
        }
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Header ──────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp size={22} className="text-primary" />
            <h1 className="text-2xl font-bold text-text sm:text-3xl">
              Dashboard
            </h1>
          </div>
          <p className="mt-1 text-sm text-text-muted">
            Visao geral das metricas do WavePlay
          </p>
        </div>
        <DateRangePicker value={range} onChange={setRange} />
      </motion.header>

      {/* ── Overview cards ──────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={<Users size={24} />}
          label="Total de usuarios"
          value={data.overview.totalUsers.toLocaleString('pt-BR')}
          delay={0}
        />
        <MetricCard
          icon={<BadgeCheck size={24} />}
          label="Assinaturas ativas"
          value={data.overview.totalActiveSubscriptions.toLocaleString('pt-BR')}
          delay={0.1}
        />
        <MetricCard
          icon={<Monitor size={24} />}
          label="Streams ativos"
          value={data.overview.activeStreams.toLocaleString('pt-BR')}
          delay={0.2}
        />
        <MetricCard
          icon={<DollarSign size={24} />}
          label="Receita mensal estimada"
          value={formatCurrency(data.overview.estimatedMonthlyRevenue)}
          delay={0.3}
        />
      </section>

      {/* ── Time-series charts ──────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <ChartCard title="Novos registros por dia" delay={0.2}>
            {registrationData.length === 0 ? (
              <ChartEmpty message="Nenhum registro no periodo" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={registrationData}>
                  <defs>
                    <linearGradient
                      id="gradReg"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={C.primary}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="100%"
                        stopColor={C.primary}
                        stopOpacity={0.02}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.border}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: C.textMuted, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: C.textMuted, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="registros"
                    stroke={C.primary}
                    strokeWidth={2}
                    fill="url(#gradReg)"
                    animationDuration={1200}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          <ChartCard title="Usuarios acumulados" delay={0.3}>
            {cumulativeData.length === 0 ? (
              <ChartEmpty message="Nenhum dado acumulado no periodo" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={cumulativeData}>
                  <defs>
                    <linearGradient
                      id="gradCum"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="0%"
                        stopColor={C.primaryLight}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="100%"
                        stopColor={C.primaryLight}
                        stopOpacity={0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={C.border}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: C.textMuted, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: C.textMuted, fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke={C.primaryLight}
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 5, fill: C.primaryLight, strokeWidth: 0 }}
                    animationDuration={1000}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        <div className="lg:col-span-2">
          <ChartCard title="Streams por hora do dia" delay={0.35} className="flex h-full flex-col">
            {streamsByHourData.length === 0 ? (
              <ChartEmpty message="Nenhum stream no periodo" />
            ) : (
              <div className="min-h-0 flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={streamsByHourData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={C.border}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="hour"
                      tick={{ fill: C.textMuted, fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: C.textMuted, fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar
                      dataKey="sessoes"
                      fill={C.primary}
                      radius={[6, 6, 0, 0]}
                      animationDuration={800}
                      activeBar={{ fill: C.primaryLight }}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      </section>

      {/* ── Pie charts ─────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Subscriptions by plan */}
        <ChartCard title="Assinaturas por plano" delay={0.4}>
          {subscriptionsPieData.length === 0 ? (
            <ChartEmpty message="Nenhuma assinatura encontrada" />
          ) : (
            <>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={subscriptionsPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      animationDuration={800}
                      animationBegin={200}
                    >
                      {subscriptionsPieData.map((_, i) => (
                        <Cell
                          key={i}
                          fill={PIE_COLORS[i % PIE_COLORS.length]}
                          stroke="transparent"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const entry = payload[0]!
                        return (
                          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
                            <p className="text-text-muted">{entry.name}</p>
                            <p className="font-medium text-text">{entry.value}</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <PieLegend
                items={subscriptionsPieData.map((d, i) => ({
                  name: d.name,
                  value: d.value,
                  color: PIE_COLORS[i % PIE_COLORS.length]!,
                }))}
              />
            </>
          )}
        </ChartCard>

        {/* Profiles by type */}
        <ChartCard title="Perfis por tipo" delay={0.5}>
          {data.overview.profilesByType.normal === 0 && data.overview.profilesByType.kids === 0 ? (
            <ChartEmpty message="Nenhum perfil encontrado" />
          ) : (
            <>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={profileTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={800}
                      animationBegin={300}
                    >
                      <Cell fill={C.primary} stroke="transparent" />
                      <Cell fill="#22C55E" stroke="transparent" />
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const entry = payload[0]!
                        return (
                          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
                            <p className="text-text-muted">{entry.name}</p>
                            <p className="font-medium text-text">{entry.value}</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <PieLegend
                items={[
                  {
                    name: 'Normal',
                    value: data.overview.profilesByType.normal,
                    color: C.primary,
                  },
                  {
                    name: 'Kids',
                    value: data.overview.profilesByType.kids,
                    color: '#22C55E',
                  },
                ]}
              />
            </>
          )}
        </ChartCard>

        {/* Content by type */}
        <ChartCard title="Conteudo por tipo" delay={0.6}>
          {contentTypePieData.every((d) => d.value === 0) ? (
            <ChartEmpty message="Nenhum conteudo assistido no periodo" />
          ) : (
            <>
              <div className="flex justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={contentTypePieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                      animationDuration={800}
                      animationBegin={400}
                    >
                      <Cell fill={C.primaryLight} stroke="transparent" />
                      <Cell fill="#F59E0B" stroke="transparent" />
                    </Pie>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const entry = payload[0]!
                        return (
                          <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-lg">
                            <p className="text-text-muted">{entry.name}</p>
                            <p className="font-medium text-text">{entry.value}</p>
                          </div>
                        )
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <PieLegend
                items={contentTypePieData.map((d, i) => ({
                  name: d.name,
                  value: d.value,
                  color: i === 0 ? C.primaryLight : '#F59E0B',
                }))}
              />
            </>
          )}
        </ChartCard>
      </section>

      {/* ── Period cards ────────────────────────────────────── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          icon={<UserCheck size={24} />}
          label="Usuarios ativos (periodo)"
          value={data.period.activeUsers.toLocaleString('pt-BR')}
          delay={0.5}
        />
        <MetricCard
          icon={<Play size={24} />}
          label="Sessoes de stream"
          value={data.period.totalStreamSessions.toLocaleString('pt-BR')}
          delay={0.6}
        />
        <MetricCard
          icon={<Clock size={24} />}
          label="Duracao media"
          value={formatDuration(data.period.avgStreamDuration)}
          delay={0.7}
        />
      </section>

      {/* ── Bottom section: profiles + top content ──────────── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Profiles per user */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-xl border border-border bg-surface p-5"
        >
          <h3 className="mb-4 text-sm font-medium text-text-muted">
            Perfis por usuario
          </h3>
          {data.overview.profileDistribution.length === 0 ? (
            <p className="py-6 text-center text-sm text-text-muted">Nenhum dado de perfis</p>
          ) : (
            <div className="space-y-3">
              {data.overview.profileDistribution.map((d) => {
                const maxUsers = Math.max(
                  ...data.overview.profileDistribution.map((x) => x.users),
                )
                const pct = maxUsers > 0 ? (d.users / maxUsers) * 100 : 0
                return (
                  <div key={d.count}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-text-muted">
                        {d.count} {d.count === 1 ? 'perfil' : 'perfis'}
                      </span>
                      <span className="font-medium text-text">
                        {d.users} usuarios
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-border">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.8 }}
                        className="h-full rounded-full bg-primary"
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </motion.div>

        {/* Top content table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.65 }}
          className="overflow-hidden rounded-xl border border-border bg-surface"
        >
          <div className="px-5 pt-5 pb-3">
            <h3 className="text-sm font-medium text-text-muted">
              Top conteudos (periodo)
            </h3>
          </div>
          {data.period.topContent.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-text-muted">Nenhum conteudo assistido no periodo</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="px-5 py-2.5 font-medium">Titulo</th>
                    <th className="px-5 py-2.5 font-medium">Tipo</th>
                    <th className="px-5 py-2.5 font-medium text-right">Views</th>
                  </tr>
                </thead>
                <tbody>
                  {data.period.topContent.map((item) => (
                    <tr
                      key={item.tmdbId}
                      className="border-b border-border last:border-0 transition-colors hover:bg-primary/5"
                    >
                      <td className="px-5 py-2.5 text-text">{item.title}</td>
                      <td className="px-5 py-2.5 text-text-muted">
                        {item.type === 'movie' ? 'Filme' : 'Serie'}
                      </td>
                      <td className="px-5 py-2.5 text-right font-medium text-text">
                        {item.views.toLocaleString('pt-BR')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </section>

      {/* ── Subscriptions table (detail) ────────────────────── */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <h2 className="mb-4 text-lg font-semibold text-text">
          Detalhamento de assinaturas
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-text-muted">
                <th className="px-5 py-3 font-medium">Plano</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium text-right">
                  Assinantes
                </th>
              </tr>
            </thead>
            <tbody>
              {data.overview.subscriptionsByPlan.map((row, i) => (
                <tr
                  key={row.planSlug}
                  className="border-b border-border last:border-0 transition-colors hover:bg-primary/5"
                >
                  <td className="px-5 py-3 text-text">
                    <span className="flex items-center gap-2">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            PIE_COLORS[i % PIE_COLORS.length],
                        }}
                      />
                      {row.planName}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-mono text-xs text-text-muted">
                    {row.planSlug}
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-text">
                    {row.count}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.section>
    </div>
  )
}
