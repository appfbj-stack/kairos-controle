/**
 * Configurações e variáveis de ambiente seguras para execução na Vercel e localmente.
 * Todas as variáveis possuem valores de contingência (fallback) para que o build
 * e a execução na Vercel NUNCA quebrem mesmo se nenhuma variável for preenchida.
 */

export const ENV = {
  // Nome da aplicação
  appName: (import.meta.env.VITE_APP_NAME as string) || 'Almoxarifado Obra',

  // Identificação da obra / canteiro de serviço
  obraName: (import.meta.env.VITE_OBRA_NAME as string) || 'Canteiro de Obras Central',

  // URL base da aplicação na Vercel ou local
  appUrl: (import.meta.env.VITE_APP_URL as string) || 
    (typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000'),

  // Versão da aplicação
  appVersion: (import.meta.env.VITE_APP_VERSION as string) || '1.0.0',

  // Ambiente de execução (development, production, etc.)
  nodeEnv: import.meta.env.MODE || 'production',

  // Indicador se está rodando em ambiente de produção
  isProduction: import.meta.env.PROD ?? true,
};
