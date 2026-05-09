import express from 'express';
import path from 'path';
import apiRoutes from './routes/api';
import { iniciarColetaAutomatica } from './services/coleta-automatica';

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
  console.log(`🔌 API: http://localhost:${PORT}/api/empresas\n`);

  // Iniciar coleta automática
  iniciarColetaAutomatica();
});
