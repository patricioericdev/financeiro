import { Pencil, Trash2 } from 'lucide-react'

const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

const formatDate = (dateStr) => {
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

export default function TransactionList({ transactions, onEdit, onDelete }) {
  if (!transactions.length) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p className="text-4xl mb-3">📭</p>
        <p className="text-sm">Nenhuma transação encontrada</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Data</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Descrição</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categoria</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Valor</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {transactions.map((t) => (
            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4 text-sm text-gray-500">{formatDate(t.date)}</td>
              <td className="py-3 px-4">
                <div className="text-sm font-medium text-gray-800">{t.description}</div>
                {t.notes && <div className="text-xs text-gray-400">{t.notes}</div>}
              </td>
              <td className="py-3 px-4">
                {t.category ? (
                  <span
                    className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: t.category.color + '20', color: t.category.color }}
                  >
                    {t.category.icon} {t.category.name}
                  </span>
                ) : (
                  <span className="text-xs text-gray-400">Sem categoria</span>
                )}
              </td>
              <td className="py-3 px-4 text-right">
                <span className={`text-sm font-bold ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === 'income' ? '+' : '-'}{formatBRL(t.amount)}
                </span>
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onEdit(t)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(t.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
