import { Link, useRouterState } from "@tanstack/react-router"
import { useAuth } from "../hooks/useAuth"
import UserAvatar from "./UserAvatar"
import { Calendar, CreditCard, FlameKindling, Wallet, type LucideProps } from "lucide-react"
import type { ComponentType } from "react"


export interface MobileFooterProps {}

type NavItem = {
  name: string
  to: string
  icon: ComponentType<LucideProps>
  isCenter?: boolean
}

export default function MobileFooter({}: MobileFooterProps){
 const { user, hasRole } = useAuth()
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  if (!user) return null

  // Check if user has admin/treasurer/reviewer roles
  const canAccessTesoreria = hasRole('admin') || hasRole('tesorero') || hasRole('revisor')

  const navItems: NavItem[] = [
    { name: 'Calendario', to: '/calendario', icon: Calendar },
    { name: 'Inicio', to: '/dashboard', icon: FlameKindling, isCenter: true },
    { name: 'Pagos', to: '/pagos', icon: CreditCard },
    // Add Tesorería for authorized users
    ...(canAccessTesoreria ? [{ name: 'Tesorería', to: '/tesoreria', icon: Wallet }] : [])
  ]

  return (
    <>
      <nav className="hidden md:block bg-white border-b border-gray-200 shadow-sm z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="text-2xl font-bold">
                <span className="text-[#FF6B35]">CAS</span>
              </div>
            </Link>

            <div className="flex items-center space-x-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.to

                if (item.isCenter) {
                  return (
                    <Link
                      key={item.name}
                      to={item.to}
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-[#FF6B35] to-[#E55A2B] text-white hover:shadow-lg transition-all"
                    >
                      <Icon className="w-5 h-5" />
                    </Link>
                  )
                }

                return (
                  <Link
                    key={item.name}
                    to={item.to}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'text-[#FF6B35] bg-orange-50'
                        : 'text-gray-600 hover:text-[#FF6B35] hover:bg-orange-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                )
              })}
            </div>

            <UserAvatar size="md" showName showDropdown />
          </div>
        </div>
      </nav>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
        <div className="flex items-end justify-around px-2 py-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.to

            if (item.isCenter) {
              return (
                <Link key={item.name} to={item.to} className="relative flex flex-col items-center -mt-8">
                  <div className="bg-gradient-to-br from-[#FF6B35] to-[#E55A2B] rounded-full w-16 h-16 flex items-center justify-center shadow-lg border-4 border-white text-white">
                    <Icon className="w-8 h-8" />
                  </div>
                </Link>
              )
            }

            return (
              <Link
                key={item.name}
                to={item.to}
                className={`flex flex-col items-center justify-center min-w-[60px] py-1 transition-colors ${
                  isActive ? 'text-[#FF6B35]' : 'text-gray-500'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'text-[#FF6B35]' : 'text-gray-600'}`} strokeWidth={isActive ? 2.5 : 2} />
                <span className={`text-[10px] mt-1 font-medium ${isActive ? 'text-[#FF6B35]' : 'text-gray-600'}`}>
                  {item.name}
                </span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
