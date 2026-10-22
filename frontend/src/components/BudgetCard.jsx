const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function BudgetCard({ budget }) {
  const { category, spent, limit, percentage } = budget
  const barColor =
    percentage >= 90 ? 'bg-red-500' : percentage >= 70 ? 'bg-yellow-500' : 'bg-green-500'
  const bgColor =
    percentage >= 90
      ? 'border-red-100 bg-red-50/30'
      : percentage >= 70
      ? 'border-yellow-100 bg-yellow-50/30'
      : 'border-green-100'

  return (
    <div className={`bg-white rounded-2xl p-5 border shadow-sm ${bgColor}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="text-2xl">{category?.icon}</span>
        <div>
          <h3 className="font-semibold text-gray-800 text-sm">{category?.name}</h3>
          <p className="text-xs text-gray-500">{(percentage || 0).toFixed(0)}% utilizado</p>
        </div>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
        <div
          className={`h-2 rounded-full transition-all ${barColor}`}
          style={{ width: `${Math.min(percentage || 0, 100)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>
          Gasto: <strong className="text-gray-700">{formatBRL(spent || 0)}</strong>
        </span>
        <span>
          Limite: <strong className="text-gray-700">{formatBRL(limit || 0)}</strong>
        </span>
      </div>
    </div>
  )
}
