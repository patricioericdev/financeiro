const formatBRL = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0)

export default function Rule503020Card({ ruleData, totalIncome }) {
  if (!ruleData || !totalIncome || totalIncome <= 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
        <h2 className="text-base font-semibold text-gray-800 mb-1">🎯 Planejamento Salarial — Regra 50 / 30 / 20</h2>
        <p className="text-xs text-gray-400">
          Adicione uma receita ou salário no mês selecionado para ver o cálculo automático da regra.
        </p>
      </div>
    )
  }

  const { needs, wants, savings } = ruleData

  const getBarColor = (pct) => {
    if (pct > 100) return 'bg-red-500'
    if (pct >= 85) return 'bg-yellow-500'
    return 'bg-blue-600'
  }

  const getSavingsBarColor = (pct) => {
    if (pct >= 100) return 'bg-green-500'
    if (pct >= 50) return 'bg-blue-500'
    return 'bg-yellow-500'
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-gray-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <span>🎯</span> Regra 50 / 30 / 20 do Salário
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Distribuição ideal baseada nas receitas de {formatBRL(totalIncome)}
          </p>
        </div>
        <span className="text-xs font-semibold px-3 py-1 bg-blue-50 text-blue-700 rounded-full self-start sm:self-auto">
          Educação Financeira
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 50% Necessidades */}
        <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                🏠 50% Necessidades
              </span>
              <span className="text-xs font-bold text-gray-600">{needs.percentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Moradia, contas, supermercado, transporte e saúde.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full transition-all ${getBarColor(needs.percentage)}`}
                style={{ width: `${Math.min(needs.percentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs pt-2 text-gray-500 border-t border-gray-200/60 mt-3">
            <span>Gasto: <strong className={needs.percentage > 100 ? 'text-red-600' : 'text-gray-800'}>{formatBRL(needs.spent)}</strong></span>
            <span>Meta máx: <strong className="text-gray-700">{formatBRL(needs.budget)}</strong></span>
          </div>
        </div>

        {/* 30% Desejos */}
        <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                🎮 30% Estilo de Vida
              </span>
              <span className="text-xs font-bold text-gray-600">{wants.percentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Lazer, restaurantes, assinaturas e compras pessoais.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full transition-all ${getBarColor(wants.percentage)}`}
                style={{ width: `${Math.min(wants.percentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs pt-2 text-gray-500 border-t border-gray-200/60 mt-3">
            <span>Gasto: <strong className={wants.percentage > 100 ? 'text-red-600' : 'text-gray-800'}>{formatBRL(wants.spent)}</strong></span>
            <span>Meta máx: <strong className="text-gray-700">{formatBRL(wants.budget)}</strong></span>
          </div>
        </div>

        {/* 20% Poupança */}
        <div className="p-4 rounded-xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-sm text-gray-800 flex items-center gap-1.5">
                💰 20% Poupança & Futuro
              </span>
              <span className="text-xs font-bold text-green-700">{savings.percentage}%</span>
            </div>
            <p className="text-xs text-gray-500 mb-3">
              Reserva de emergência, investimentos e sobra do mês.
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
              <div
                className={`h-2.5 rounded-full transition-all ${getSavingsBarColor(savings.percentage)}`}
                style={{ width: `${Math.min(savings.percentage, 100)}%` }}
              />
            </div>
          </div>
          <div className="flex justify-between text-xs pt-2 text-gray-500 border-t border-gray-200/60 mt-3">
            <span>Poupado: <strong className="text-green-700">{formatBRL(savings.actual)}</strong></span>
            <span>Meta mín: <strong className="text-gray-700">{formatBRL(savings.budget)}</strong></span>
          </div>
        </div>
      </div>
    </div>
  )
}
