import {
  LineChart,
  Line,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'

const volume = [
  { semana: 'S1', valor: 9800 },
  { semana: 'S2', valor: 10400 },
  { semana: 'S3', valor: 11200 },
  { semana: 'S4', valor: 12450 },
]

export function StudentEvolucao() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-lg font-bold">Evolução</h1>
        <p className="text-sm text-white/40">Últimas 4 semanas</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Volume Total (kg)</CardTitle>
        </CardHeader>
        <p className="mb-2 text-xl font-bold">12.450 kg</p>
        <ResponsiveContainer width="100%" height={140}>
          <LineChart data={volume}>
            <XAxis dataKey="semana" stroke="#ffffff60" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ background: '#1A1A20', border: '1px solid #26262E', borderRadius: 12, fontSize: 12 }}
            />
            <Line type="monotone" dataKey="valor" stroke="#FEBC03" strokeWidth={2.5} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Distância Total</CardTitle>
        </CardHeader>
        <p className="text-xl font-bold">25,7 km</p>
        <p className="text-xs text-emerald-400">+8% vs. semana anterior</p>
      </Card>
    </div>
  )
}
