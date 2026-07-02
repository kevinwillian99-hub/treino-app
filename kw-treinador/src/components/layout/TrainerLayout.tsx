import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Menu, Bell } from 'lucide-react'
import { Sidebar } from './Sidebar'

export function TrainerLayout() {
  const [menuAberto, setMenuAberto] = useState(false)

  return (
    <div className="flex h-screen bg-graphite-500">
      <Sidebar open={menuAberto} onClose={() => setMenuAberto(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Barra superior — só aparece no celular */}
        <header className="flex items-center justify-between border-b border-graphite-200 px-4 py-3 sm:hidden">
          <button onClick={() => setMenuAberto(true)} className="text-white/70">
            <Menu className="h-5 w-5" />
          </button>
          <img src="/logo-mark.png" alt="KW" className="h-6 w-6 object-contain" />
          <button className="text-white/40">
            <Bell className="h-5 w-5" />
          </button>
        </header>

        <main className="scrollbar-thin flex-1 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
