import { useState, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { getBudgets, createBudget, deleteBudget, getCategories } from '../api/client'
import BudgetCard from '../components/BudgetCard'

const MONTHS = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro']

export default function Budgets() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [budgets, setBudgets] = useState([])
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ category_id: '', limit_amount: '' })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [bRes, cRes] = await Promise.all([getBudgets({ month, year }), getCategories()])
      setBudgets(bRes.data)
      setCategories(cRes.data.filter((c) => c.type === 'expense'))
    } finally {
      setLoading(false)
    }
  }, [month, year])

  useEffect(() => { load() }, [load])

  const handleCreate = async (e) => {
    e.preventDefault()
    await createBudget({
      ...form,
      category_id: parseInt(form.category_id),
      limit_amount: parseFloat(form.limit_amount),
      month,
      year,
    })
    setShowForm(false)
    setForm({ category_id: '', limit_amount: '' })
    load()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Excluir este orçamento?')) {
      await deleteBudget(id)
      load()
    }
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Orçamentos</h1>
          <p className="text-gray-500 text-sm mt-1">Metas de gastos por categoria</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Novo Orçamento
        </button>
      </div>

      <div className="flex gap-3 mb-6">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-400">Carregando...</div>
      ) : budgets.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-5xl mb-4">🎯</p>
          <p className="font-medium">Nenhum orçamento para este mês</p>
          <p className="text-sm mt-1">Crie orçamentos para controlar seus gastos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map((b) => (
            <div key={b.id} className="relative group">
              <BudgetCard budget={{ ...b, spent: 0, percentage: 0 }} />
              <button
                onClick={() => handleDelete(b.id)}
                className="absolute top-3 right-3 p-1 bg-red-100 text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">Novo Orçamento</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Categoria *</label>
                <select
                  required
                  value={form.category_id}
                  onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Limite Mensal (R$) *</label>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.limit_amount}
                  onChange={(e) => setForm((f) => ({ ...f, limit_amount: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0,00"
                />
              </div>
              <p className="text-xs text-gray-400">Período: {MONTHS[month - 1]} {year}</p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
