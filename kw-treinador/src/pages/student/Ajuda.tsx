import { useNavigate } from 'react-router-dom'
import { ArrowLeft, MessageCircle, Mail } from 'lucide-react'
import { Card } from '@/components/ui/Card'

export function StudentAjuda() {
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/aluno/perfil')} className="flex items-center gap-2 text-sm text-white/50">
        <ArrowLeft className="h-4 w-4" />
        Voltar
      </button>
      <h1 className="text-lg font-bold">Ajuda e Suporte</h1>

      <Card className="space-y-4">
        <p className="text-sm text-white/60">
          Precisa de ajuda com o app ou tem alguma dúvida sobre o seu treino? Fale direto com seu treinador.
        </p>
        <a
          href="https://wa.me/55"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 rounded-xl border border-graphite-100 px-4 py-3 text-sm hover:bg-graphite-300"
        >
          <MessageCircle className="h-4 w-4 text-gold" />
          Falar no WhatsApp
        </a>
        <a
          href="mailto:contato@kevinwillian.com"
          className="flex items-center gap-3 rounded-xl border border-graphite-100 px-4 py-3 text-sm hover:bg-graphite-300"
        >
          <Mail className="h-4 w-4 text-gold" />
          Enviar e-mail
        </a>
      </Card>
    </div>
  )
}
