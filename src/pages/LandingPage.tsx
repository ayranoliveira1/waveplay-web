import { Link } from 'react-router'
import { motion } from 'motion/react'
import { Film, Users, Play, Monitor } from 'lucide-react'

const features = [
  {
    icon: Film,
    title: 'Catálogo completo',
    description: 'Filmes e séries atualizados diretamente do TMDB.',
  },
  {
    icon: Users,
    title: 'Múltiplos perfis',
    description: 'Cada membro da família com seu próprio espaço.',
  },
  {
    icon: Play,
    title: 'Continue assistindo',
    description: 'Retome de onde parou, em qualquer momento.',
  },
  {
    icon: Monitor,
    title: 'Qualquer dispositivo',
    description: 'Assista no celular, tablet ou computador.',
  },
] as const

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 sm:py-32 lg:py-40">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-background to-background" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary mb-4">
            WAVEPLAY
          </h1>
          <p className="text-lg sm:text-xl text-text-muted mb-10 max-w-lg">
            Sua plataforma de streaming. Filmes, séries e muito mais — tudo em um só lugar.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              to="/auth/login"
              className="h-12 px-8 rounded-lg bg-primary font-semibold text-sm text-text flex items-center justify-center transition-colors hover:bg-primary-light"
            >
              Entrar
            </Link>
            <Link
              to="/auth/register"
              className="h-12 px-8 rounded-lg border border-primary font-semibold text-sm text-primary flex items-center justify-center transition-colors hover:bg-primary/10"
            >
              Criar conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-24">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-text text-center mb-12">
            Por que escolher o WavePlay?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="rounded-xl bg-surface p-6 text-center"
              >
                <div className="mb-4 mx-auto h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-base font-semibold text-text mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-text-muted">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-sm text-text-muted">&copy; 2026 WavePlay</span>
          <div className="flex gap-6 text-sm text-text-muted">
            <span className="hover:text-text transition-colors cursor-pointer">Sobre</span>
            <span className="hover:text-text transition-colors cursor-pointer">Termos</span>
            <span className="hover:text-text transition-colors cursor-pointer">Contato</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
