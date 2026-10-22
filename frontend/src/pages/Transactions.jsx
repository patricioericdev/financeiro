import { useState, useEffect, useCallback } from 'react'
import { Plus } from 'lucide-react'
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getCategories } from '../api/client'
import TransactionList from '../components/TransactionList'
import TransactionForm from '../components/TransactionForm'

const formatBRL = (v) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)
const MONTHS = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez']

export default function Transactions() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [typeFilter, setTypeFilter] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { month, year }
      if (typeFilter) params.type = typeFilter
      if (categoryFilter) params.category_id = categoryFilter
      const [txRes, catRes] = await Promise.all([getTransactions(params), getCategories()])
      setTransactions(txRes.data)
      setCategories(catRes.data)
    } finally {
      setLoading(false)
    }
  }, [month, year, typeFilter, categoryFilter])

  useEffect(() => { load() }, [load])

  const handleSave = async (data) => {
    if (editingTransaction) {
      await updateTransaction(editingTransaction.id, data)
    } else {
      await createTransaction(data)
    }
    setEditingTransaction(null)
    load()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta transação?')) {
      await deleteTransaction(id)
      load()
    }
  }

  const handleEdit = (t) => {
    setEditingTransaction(t)
    setShowForm(true)
  }

  const income = transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Transações</h1>
          <p className="text-gray-500 text-sm mt-1">{transactions.length} transações encontradas</p>
        </div>
        <button
          onClick={() => { setEditingTransaction(null); setShowForm(true) }}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Nova Transação
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
          <p className="text-xs text-green-600 font-medium">Receitas</p>
          <p className="text-xl font-bold text-green-700 mt-1">{formatBRL(income)}</p>
        </div>
        <div className="bg-red-50 border border-red-100 rounded-2xl p-4">
          <p className="text-xs text-red-600 font-medium">Despesas</p>
          <p className="text-xl font-bold text-red-700 mt-1">{formatBRL(expense)}</p>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
          <p className="text-xs text-blue-600 font-medium">Saldo</p>
          <p className={`text-xl font-bold mt-1 ${income - expense >= 0 ? 'text-blue-700' : 'text-red-700'}`}>
            {formatBRL(income - expense)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6 flex flex-wrap gap-3">
        <select value={month} onChange={(e) => setMonth(parseInt(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          {[2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todos os tipos</option>
          <option value="income">Receitas</option>
          <option value="expense">Despesas</option>
        </select>
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Todas as categorias</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : (
          <TransactionList transactions={transactions} onEdit={handleEdit} onDelete={handleDelete} />
        )}
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingTransaction(null) }}
        />
      )}
    </div>
  )
}
