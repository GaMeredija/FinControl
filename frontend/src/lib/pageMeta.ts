/** Títulos e subtítulos do cabeçalho (pt-BR com acentuação). */

export const routeTitles: Record<string, string> = {
  '/app/overview': 'Visão geral',
  '/app/accounts': 'Contas financeiras',
  '/app/categories': 'Categorias',
  '/app/transactions': 'Lançamentos',
  '/app/goals': 'Metas',
  '/app/reports': 'Relatórios',
  '/app/settings': 'Configurações',
};

/** Subtítulo contextual por rota (alinha ao título principal). */
export const routeSubtitles: Record<string, string> = {
  '/app/overview':
    'Indicadores do mês e movimentação recente.',
  '/app/accounts':
    'Contas e saldos conectados ao backend FinControl.',
  '/app/categories':
    'Receitas e despesas classificadas para lançamentos e relatórios.',
  '/app/transactions':
    'Entradas, saídas e filtros do período.',
  '/app/goals':
    'Metas de poupança e limites de gastos.',
  '/app/reports':
    'Totais mensais e leitura por categoria.',
  '/app/settings':
    'Perfil, URL da API e dados sincronizados com o FinControl.',
};

export function getPageSubtitle(pathname: string): string {
  return routeSubtitles[pathname] ?? 'Gerencie os dados conectados ao backend FinControl.';
}
