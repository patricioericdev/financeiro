import { useState, useEffect, useCallback } from 'react'
import { Plus, Pencil, Trash2, X } from 'lucide-react'
import { getCategories, createCategory, updateCategory, deleteCategory } from '../api/client'

const EMPTY_FORM = { name: '', type: 'expense', icon: '📦', color: '#6b7280' }
const PRESET_COLORS = [
  '#ef4444','#f97316','#f59e0b','#84cc16',
  '#10b981','#06b6d4','#3b82f6','#6366f1',
  '#8b5cf6','#ec4899','#6b7280','#1f2937',
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingCat, setEditingCat] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const load = useCallback(async () => {
    const res = await getCategories()
    setCategories(res.data)
  }, [])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setForm(EMPTY_FORM); setEditingCat(null); setShowForm(true) }
  const openEdit = (cat) => {
    setForm({ name: cat.name, type: cat.type, icon: cat.icon, color: cat.color })
    setEditingCat(cat)
    setShowForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (editingCat) {
      await updateCategory(editingCat.id, form)
    } else {
      await createCategory(form)
    }
    setShowForm(false)
    load()
  }

  const handleDelete = async (id) => {
    if (window.confirm('Excluir esta categoria?')) {
      await deleteCategory(id)
      load()
    }
  }

  const income = categories.filter((c) => c.type === 'income')
  const expense = categories.filter((c) => c.type === 'expense')

  const CategoryCard = ({ cat }) => (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-start justify-between mb-3">
        <span className="text-3xl">{cat.icon}</span>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => openEdit(cat)} className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
            <Pencil size={12} />
          </button>
          <button onClick={() => handleDelete(cat.id)} className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
            <Trash2 size={12} />
          </button>
        </div>
      </div>
      <p className="text-sm font-medium text-gray-800">{cat.name}</p>
      <div className="flex items-center gap-1.5 mt-2">
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
        <span className={`text-xs px-1.5 py-0.5 rounded-md ${cat.type === 'income' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {cat.type === 'income' ? 'Receita' : 'Despesa'}
        </span>
      </div>
    </div>
  )

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="text-gray-500 text-sm mt-1">{categories.length} categorias cadastradas</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={18} /> Nova Categoria
        </button>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-green-600 uppercase tracking-wider mb-4">💰 Receitas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {income.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-red-600 uppercase tracking-wider mb-4">💸 Despesas</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {expense.map((cat) => <CategoryCard key={cat.id} cat={cat} />)}
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800">{editingCat ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-xl"><X size={18} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="flex rounded-xl border border-gray-200 overflow-hidden">
                <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'expense' }))} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.type === 'expense' ? 'bg-red-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>💸 Despesa</button>
                <button type="button" onClick={() => setForm((f) => ({ ...f, type: 'income' }))} className={`flex-1 py-2.5 text-sm font-medium transition-colors ${form.type === 'income' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>💰 Receita</button>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nome da categoria" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ícone (emoji)</label>
                <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="📦" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setForm((f) => ({ ...f, color: c }))} className={`w-7 h-7 rounded-full border-2 transition-all ${form.color === c ? 'border-gray-800 scale-110' : 'border-transparent'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">Cancelar</button>
                <button type="submit" className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700">{editingCat ? 'Salvar' : 'Criar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
