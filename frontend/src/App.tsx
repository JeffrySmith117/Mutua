import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import LoginPage from './pages/auth/LoginPage'
import CadastroPage from './pages/auth/CadastroPage'
import PainelLayout from './components/layout/PainelLayout'
import DashboardPage from './pages/dashboard/DashboardPage'
import AmbientesPage from './pages/ambientes/AmbientesPage'
import EquipamentosPage from './pages/equipamentos/EquipamentosPage'
import MinhasReservasPage from './pages/reservas/MinhasReservasPage'
import AdminPage from './pages/admin/AdminPage'
import RotaProtegida from './components/layout/RotaProtegida'
import './App.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Rotas públicas de autenticação */}
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/cadastro" element={<CadastroPage />} />

          {/* Rotas protegidas com PainelLayout */}
          <Route
            path="/"
            element={
              <RotaProtegida>
                <PainelLayout />
              </RotaProtegida>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="ambientes" element={<AmbientesPage />} />
            <Route path="equipamentos" element={<EquipamentosPage />} />
            <Route path="minhas-reservas" element={<MinhasReservasPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>

          {/* Fallback inteligente */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

export default App
