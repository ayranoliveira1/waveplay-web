import { Link } from 'react-router'
import { Clock } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function RegisterPage() {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-warning/10 text-warning">
        <Clock size={28} />
      </div>

      <h2 className="mb-2 text-xl font-bold text-text">
        Cadastro indisponivel
      </h2>

      <p className="mb-8 text-sm text-text-muted">
        O cadastro de novas contas esta temporariamente desabilitado. Em breve
        estara disponivel novamente.
      </p>

      <Link to="/auth/login" className="w-full">
        <Button type="button" fullWidth>
          Voltar para o login
        </Button>
      </Link>
    </div>
  )
}
