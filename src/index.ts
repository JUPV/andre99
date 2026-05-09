import express from 'express';
import path from 'path';
import apiRoutes from './routes/api';
import { iniciarColetaAutomatica } from './services/coleta-automatica';
import { logger, limparLogsAntigos } from './utils/logger';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Rotas da API
app.use('/api', apiRoutes);

// Rota principal - redireciona para dashboard
app.get('/', (req, res) => {
  res.redirect('/dashboard.html');
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log(`📄 Relatórios: http://localhost:${PORT}/relatorios.html`);
  console.log(`🔌 API: http://localhost:${PORT}/api/empresas\n`);

  logger.success('SERVIDOR', `Servidor iniciado na porta ${PORT}`, {
    urls: {
      dashboard: `http://localhost:${PORT}/dashboard.html`,
      relatorios: `http://localhost:${PORT}/relatorios.html`,
      api: `http://localhost:${PORT}/api/empresas`
    }
  });

  // Limpar logs antigos (mantém últimos 30 dias)
  limparLogsAntigos();
  
  // Iniciar coleta automática
  iniciarColetaAutomatica();
});
