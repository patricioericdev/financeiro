const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

export default function SummaryCard({ title, value, icon, color = 'blue', subtitle }) {
  const colorMap = {
    green: 'bg-green-50 text-green-700 border-green-100',
    red: 'bg-red-50 text-red-700 border-red-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
  }
  const valueColor = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
  }
  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <span className={`p-2 rounded-xl border text-lg ${colorMap[color]}`}>{icon}</span>
      </div>
      <div className={`text-2xl font-bold ${valueColor[color]}`}>{formatBRL(value)}</div>
      {subtitle && <p className="text-xs text-gray-400 mt-2">{subtitle}</p>}
    </div>
  )
}
