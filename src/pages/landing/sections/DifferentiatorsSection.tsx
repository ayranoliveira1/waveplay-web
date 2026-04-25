import { motion } from 'motion/react'
import { QRCodeSVG } from 'qrcode.react'
import { Users, Play, Tv, Smartphone, Laptop } from 'lucide-react'
import { Link } from 'react-router'

const profileColors = ['#7B2FBE', '#EC4899', '#3B82F6', '#22C55E', '#F59E0B'] as const

export function DifferentiatorsSection() {
  return (
    <section className="wave-grain relative overflow-hidden px-4 py-20 sm:py-28">
      <div className="relative z-10 mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-12 max-w-2xl sm:mb-16"
        >
          <span className="inline-block rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-primary-light">
            Diferenciais
          </span>
          <h2 className="mt-4 text-3xl font-black leading-tight tracking-tight text-text sm:text-5xl">
            Pensado para a família <span className="text-gradient-brand">toda assistir junta.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-4 lg:grid-rows-3">
          <BentoCard delay={0} className="lg:col-span-2 lg:row-span-2" spotlight>
            <div className="flex h-full flex-col justify-between gap-8">
              <div>
                <CardEyebrow icon={Users}>Perfis</CardEyebrow>
                <h3 className="mt-3 text-2xl font-bold text-text sm:text-3xl">
                  Cada um com seu espaço.
                </h3>
                <p className="mt-3 max-w-sm text-sm text-text-muted sm:text-base">
                  Até 5 perfis isolados — recomendações, histórico e favoritos para cada membro da
                  família.
                </p>
              </div>
              <div className="flex items-end">
                <div className="flex -space-x-3">
                  {profileColors.map((color, i) => (
                    <div
                      key={color}
                      className="wp-pulse h-14 w-14 rounded-full border-2 border-background shadow-lg sm:h-16 sm:w-16"
                      style={{
                        background: `linear-gradient(135deg, ${color} 0%, ${color}aa 100%)`,
                        animationDelay: `${i * 0.25}s`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </BentoCard>

          <BentoCard delay={0.1} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <CardEyebrow icon={Play}>Continue assistindo</CardEyebrow>
                <h3 className="mt-3 text-xl font-bold text-text sm:text-2xl">
                  Retome de onde parou.
                </h3>
                <p className="mt-2 text-sm text-text-muted">
                  Sincronizado entre TV, notebook e celular.
                </p>
              </div>
              <div className="space-y-2">
                <ProgressRow label="O Senhor dos Anéis" percent={68} />
                <ProgressRow label="Stranger Things — S04E07" percent={42} />
              </div>
            </div>
          </BentoCard>

          <BentoCard delay={0.2} className="lg:col-span-2">
            <div className="flex h-full flex-col justify-between gap-6">
              <div>
                <CardEyebrow icon={Tv}>Multi-tela</CardEyebrow>
                <h3 className="mt-3 text-xl font-bold text-text sm:text-2xl">
                  Até 4 telas ao mesmo tempo.
                </h3>
                <p className="mt-2 text-sm text-text-muted">Sem brigar pelo controle remoto.</p>
              </div>
              <div className="flex items-end gap-3 text-text-muted">
                <Tv size={48} className="text-primary" strokeWidth={1.5} />
                <Laptop size={36} strokeWidth={1.5} />
                <Smartphone size={28} strokeWidth={1.5} />
              </div>
            </div>
          </BentoCard>

          <BentoCard delay={0.3} className="lg:col-span-4">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
              <div>
                <CardEyebrow icon={Smartphone}>App Android</CardEyebrow>
                <h3 className="mt-3 text-xl font-bold text-text sm:text-2xl">
                  Leve o WavePlay no bolso.
                </h3>
                <p className="mt-2 max-w-md text-sm text-text-muted">
                  Aponte a câmera no QR code e baixe o APK. iOS em breve.
                </p>
                <Link
                  to="/download"
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary-light transition-colors hover:border-primary hover:bg-primary/20"
                >
                  <Smartphone size={14} />
                  Baixar app
                </Link>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-[0_8px_30px_rgba(123,47,190,0.35)]">
                <QRCodeSVG
                  value={`${typeof window !== 'undefined' ? window.location.origin : ''}/download`}
                  size={112}
                  level="M"
                  bgColor="#FFFFFF"
                  fgColor="#0A0A0F"
                />
              </div>
            </div>
          </BentoCard>
        </div>
      </div>
    </section>
  )
}

interface BentoCardProps {
  children: React.ReactNode
  className?: string
  delay?: number
  spotlight?: boolean
}

function BentoCard({ children, className = '', delay = 0, spotlight }: BentoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`group relative overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-colors hover:border-primary/40 sm:p-8 ${className}`}
    >
      {spotlight && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-1/4 -right-1/4 h-2/3 w-2/3 opacity-40 transition-opacity duration-500 group-hover:opacity-70"
          style={{
            background:
              'radial-gradient(circle at 50% 50%, var(--color-spotlight) 0%, transparent 70%)',
            filter: 'blur(20px)',
          }}
        />
      )}
      <div className="relative z-10 h-full">{children}</div>
    </motion.div>
  )
}

interface CardEyebrowProps {
  icon: React.ComponentType<{ size?: number; className?: string }>
  children: React.ReactNode
}

function CardEyebrow({ icon: Icon, children }: CardEyebrowProps) {
  return (
    <span className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary-light">
      <Icon size={14} />
      {children}
    </span>
  )
}

function ProgressRow({ label, percent }: { label: string; percent: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="text-text">{label}</span>
        <span className="text-text-muted">{percent}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-gradient-brand" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}
