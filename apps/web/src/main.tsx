import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import App from './App.tsx'
import ShopPortal from './pages/ShopPortal.tsx'
import './index.css'
import { setMutationListener } from './utils/api'

// Keep server data fresh by default. Screens that benefit from caching set
// their own staleTime/refetch policy at the query that owns that data.
const queryClient = new QueryClient()
setMutationListener(() => { void queryClient.invalidateQueries(); })

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    {window.location.pathname.startsWith('/shop') ? <ShopPortal /> : <App />}
    </QueryClientProvider>
  </React.StrictMode>,
)
