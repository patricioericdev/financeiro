import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { getDashboard } from '../api/client'
import SummaryCard from '../components/SummaryCard'
import BudgetCard from '../components/BudgetCard'
import Rule503020Card from '../components/Rule503020Card'

const formatBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const formatDate = (s) => {
  const [y, m, d] = s.split('-')
  return `${d}/${m}/${y}`
}
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Dashboard() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDashboard({ month, year })
      setData(res.data)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Visão geral das suas finanças</p>
        </div>
        <div className="flex gap-2">
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64 text-gray-400">Carregando...</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <SummaryCard title="Total Receitas" value={data.total_income} icon="📈" color="green" subtitle={`${data.transactions_count} transações`} />
            <SummaryCard title="Total Despesas" value={data.total_expense} icon="📉" color="red" />
            <SummaryCard title="Saldo" value={data.balance} icon="💳" color={data.balance >= 0 ? 'blue' : 'red'} />
          </div>

          {/* Planejamento de Salário com Regra 50/30/20 */}
          <Rule503020Card ruleData={data.rule_50_30_20} totalIncome={data.total_income} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {data.chart_data && data.chart_data.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h2 className="text-base font-semibold text-gray-700 mb-4">Receitas vs Despesas por Categoria</h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={data.chart_data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `R$${v}`} />
                    <Tooltip formatter={(v) => formatBRL(v)} />
                    <Legend />
                    <Bar dataKey="receitas" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-base font-semibold text-gray-700 mb-4">Últimas Transações</h2>
              <div className="space-y-3">
                {data.recent_transactions?.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{t.category?.icon || '📦'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-700">{t.description}</p>
                        <p className="text-xs text-gray-400">{formatDate(t.date)}</p>
                      </div>
                    </div>
                    <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                      {t.type === 'income' ? '+' : '-'}{formatBRL(t.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {data.budgets_summary && data.budgets_summary.length > 0 && (
            <div>
              <h2 className="text-base font-semibold text-gray-700 mb-4">Orçamentos do Mês</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {data.budgets_summary.map((b) => <BudgetCard key={b.id} budget={b} />)}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12 text-gray-400">Erro ao carregar dados</div>
      )}
    </div>
  )
}
