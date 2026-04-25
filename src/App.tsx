import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { TooltipProvider } from '@/components/ui/tooltip';
import ClientesListPage from '@/routes/ClientesListPage';
import ClienteDetailPage from '@/routes/ClienteDetailPage';
import EstudoAnalyzerPage from '@/routes/EstudoAnalyzerPage';

export default function App() {
  return (
    <BrowserRouter>
      <TooltipProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/clientes" replace />} />
          <Route path="/clientes" element={<ClientesListPage />} />
          <Route path="/clientes/:clienteId" element={<ClienteDetailPage />} />
          <Route path="/clientes/:clienteId/estudos/:estudoId" element={<EstudoAnalyzerPage />} />
        </Routes>
      </TooltipProvider>
    </BrowserRouter>
  );
}
