export interface Plan {
  id: 'basic' | 'standard' | 'premium'
  name: string
  priceLabel: string
  period?: string
  tagline: string
  features: string[]
  highlight: boolean
  badge?: string
}

export const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    priceLabel: 'Grátis',
    tagline: 'Para começar a explorar.',
    features: ['1 perfil', '1 tela por vez', 'Catálogo completo', 'Histórico e favoritos'],
    highlight: false,
  },
  {
    id: 'standard',
    name: 'Padrão',
    priceLabel: 'R$ 19,90',
    period: '/mês',
    tagline: 'O preferido das famílias.',
    features: ['3 perfis isolados', '2 telas simultâneas', 'Continue assistindo', 'Sem fidelidade'],
    highlight: true,
    badge: 'Mais popular',
  },
  {
    id: 'premium',
    name: 'Premium',
    priceLabel: 'R$ 39,90',
    period: '/mês',
    tagline: 'Para quem quer tudo.',
    features: ['5 perfis isolados', '4 telas simultâneas', 'Qualidade máxima', 'Sem fidelidade'],
    highlight: false,
  },
]
