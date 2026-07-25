import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Gamepad2, 
  Coins, 
  Grid, 
  Trophy, 
  AlertTriangle, 
  ShieldAlert,
  Megaphone,
  Settings,
  LogOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const adminNavItems = [
  { name: '대시보드', path: '/admin', icon: LayoutDashboard },
  { name: '회원 관리', path: '/admin/users', icon: Users },
  { name: '게임 관리', path: '/admin/games', icon: Gamepad2 },
  { name: '포인트 관리', path: '/admin/points', icon: Coins },
  { name: '게임 테이블 관리', path: '/admin/tables', icon: Grid },
  { name: '토너먼트 관리', path: '/admin/tournaments', icon: Trophy },
  { name: '신고 및 분쟁', path: '/admin/reports', icon: AlertTriangle },
  { name: '이상 이용 탐지', path: '/admin/anomalies', icon: ShieldAlert },
  { name: '공지사항', path: '/admin/notices', icon: Megaphone },
  { name: '시스템 설정', path: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();

  // If it's the login page, don't show the sidebar
  if (location.pathname === '/admin/login') {
    return <Outlet />;
  }

  return (
    <div className="flex h-screen bg-[#f4f5f7] text-[#172b4d] overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 z-20">
        <div className="p-6 border-b border-gray-200">
          <Link to="/admin" className="text-xl font-bold text-[#172b4d] flex items-center space-x-2">
            <LayoutDashboard className="w-6 h-6 text-blue-600" />
            <span>Admin Console</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`relative flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium ${
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
                {isActive && (
                  <motion.div layoutId="admin-sidebar-active" className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-blue-600 rounded-r-full" />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-gray-200 bg-gray-50/50">
           <Link to="/admin/login" className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors font-medium">
              <LogOut className="w-5 h-5 text-gray-400" />
              <span className="text-sm">로그아웃</span>
           </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center justify-between px-5 py-4 bg-white border-b border-gray-200 z-20">
          <Link to="/admin" className="font-bold text-[#172b4d] flex items-center space-x-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            <span>Admin Console</span>
          </Link>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-7xl mx-auto"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
