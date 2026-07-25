import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User, MoreVertical, Menu, X, Swords, Zap, Users, Play, ChevronDown, Bell, Settings, History, CreditCard, Shield, HelpCircle, FileText, LogOut, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '@/utils/haptics';
import { DEMO_USER } from '@/data/demoData';

const navItems = [
  { name: '로비', path: '/lobby', icon: Home },
  { name: '게임', path: '#game', icon: Gamepad2, action: 'openGameSelect' },
  { name: '대회', path: '/competition', icon: Trophy },
  { name: 'MY', path: '/mypage', icon: User },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isGameSelectOpen, setIsGameSelectOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  // Listen for custom event from LobbyPage to open the game select bottom sheet
  useEffect(() => {
    const handleOpenGameSelect = () => {
      setIsGameSelectOpen(true);
    };
    
    window.addEventListener('openGameSelect', handleOpenGameSelect);
    
    return () => {
      window.removeEventListener('openGameSelect', handleOpenGameSelect);
    };
  }, []);

  // Determine current page title
  const getPageTitle = () => {
    if (location.pathname.includes('/lobby')) return '로비';
    if (location.pathname.includes('/competition')) return '대회';
    if (location.pathname.includes('/mypage')) return '마이페이지';
    if (location.pathname.includes('/game')) return '게임 중';
    if (location.pathname.includes('/arena')) return '연승 아레나';
    if (location.pathname.includes('/match')) return '매칭';
    return '묵찌빠 아레나';
  };

  const handleNavClick = (item: any, e: React.MouseEvent) => {
    triggerHaptic('light');
    if (item.action === 'openGameSelect') {
      e.preventDefault();
      setIsGameSelectOpen(true);
    }
  };

  return (
    <div className="flex h-screen bg-arena-bg text-arena-text overflow-hidden font-sans">
      {/* Desktop/Tablet Collapsible Sidebar */}
      <aside 
        className={`hidden md:flex flex-col bg-arena-card border-r border-white/5 z-30 shadow-xl transition-all duration-300 ${
          isSidebarExpanded ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        <div className="p-6 flex items-center justify-center h-20">
          <Link to="/" className="text-2xl font-black text-white tracking-tight flex items-center space-x-2 whitespace-nowrap overflow-hidden">
            <span className="text-arena-gold shrink-0">✊</span>
            <AnimatePresence>
              {isSidebarExpanded && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                >
                  묵찌빠 아레나
                </motion.span>
              )}
            </AnimatePresence>
          </Link>
        </div>
        <nav className="flex-1 px-3 space-y-2 overflow-y-auto mt-4">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item, e)}
                className={`flex items-center space-x-4 px-3 py-4 rounded-2xl transition-all font-bold overflow-hidden ${
                  isActive
                    ? 'bg-white/10 text-white shadow-sm'
                    : 'text-arena-text-muted hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-6 h-6 shrink-0 ${isActive ? 'text-arena-gold' : ''}`} />
                <AnimatePresence>
                  {isSidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      className="whitespace-nowrap"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
                {isActive && isSidebarExpanded && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-8 bg-arena-gold rounded-r-full" />
                )}
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Global Header */}
        <header className="flex items-center justify-between px-4 h-16 bg-arena-card/90 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
          <div className="flex items-center">
             <Link to="/" className="text-xl font-black text-white flex items-center space-x-2 md:hidden">
                <span className="text-arena-gold">✊</span>
              </Link>
              <div className="hidden md:block w-8" />
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 font-bold text-white">
            {getPageTitle()}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/30 px-3 py-1.5 rounded-full border border-white/5 flex items-center gap-1.5">
              <span className="text-xs font-bold text-arena-gold">P</span>
              <span className="text-sm font-bold text-white">{DEMO_USER.points.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => { triggerHaptic('light'); setIsMoreMenuOpen(true); }}
              className="p-2 text-arena-text-muted hover:text-white transition-colors"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
          </div>
        </header>

        {/* Page Content with Transitions */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative bg-arena-bg pb-24 md:pb-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="w-full h-full"
            >
              <Outlet context={{ openGameSelect: () => setIsGameSelectOpen(true) }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-arena-card/95 backdrop-blur-xl border-t border-white/5 pb-safe z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path) && item.path !== '#game';
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={(e) => handleNavClick(item, e)}
                className={`relative flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${
                  isActive ? 'text-arena-gold' : 'text-arena-text-muted hover:text-white'
                }`}
              >
                {isActive && (
                  <motion.div layoutId="bottom-nav-indicator" className="absolute top-0 w-8 h-1 bg-arena-gold rounded-b-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
                )}
                <item.icon className={`w-6 h-6 mt-1`} />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Game Select Bottom Sheet */}
      <AnimatePresence>
        {isGameSelectOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsGameSelectOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-arena-card border border-white/10 rounded-3xl p-6 shadow-2xl pb-8"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">게임 선택</h2>
                <button onClick={() => setIsGameSelectOpen(false)} className="text-gray-400 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={() => { setIsGameSelectOpen(false); navigate('/tutorial'); }}
                  className="w-full flex items-center justify-between p-4 bg-arena-success/10 border border-arena-success/20 hover:bg-arena-success/20 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-arena-success/20 rounded-xl flex items-center justify-center text-arena-success">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg">초보자 빠른 시작</div>
                      <div className="text-arena-success text-sm">안전한 입문 테이블</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsGameSelectOpen(false); navigate('/match/tables'); }}
                  className="w-full flex items-center justify-between p-4 bg-arena-cyan/10 border border-arena-cyan/20 hover:bg-arena-cyan/20 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-arena-cyan/20 rounded-xl flex items-center justify-center text-arena-cyan">
                      <Swords className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg">일반 빠른 대전</div>
                      <div className="text-arena-cyan text-sm">실력에 맞는 상대 찾기</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsGameSelectOpen(false); navigate('/arena'); }}
                  className="w-full flex items-center justify-between p-4 bg-arena-gold/10 border border-arena-gold/20 hover:bg-arena-gold/20 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-arena-gold/20 rounded-xl flex items-center justify-center text-arena-gold">
                      <Trophy className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg">연승 아레나</div>
                      <div className="text-arena-gold text-sm">최고 8연승</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsGameSelectOpen(false); navigate('/match/friend'); }}
                  className="w-full flex items-center justify-between p-4 bg-purple-500/10 border border-purple-500/20 hover:bg-purple-500/20 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg">친구 대전</div>
                      <div className="text-purple-400 text-sm">비공개 방 만들기</div>
                    </div>
                  </div>
                </button>

                <button 
                  onClick={() => { setIsGameSelectOpen(false); navigate('/match/tables'); }}
                  className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 hover:bg-white/10 rounded-2xl transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-gray-400">
                      <Play className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-white text-lg">무료 연습</div>
                      <div className="text-gray-400 text-sm">포인트 차감 없음</div>
                    </div>
                  </div>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global More Menu (더보기) */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsMoreMenuOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-sm bg-arena-card border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto my-4 sm:hidden" />
              <div className="px-6 pb-2 pt-2 flex justify-between items-center sm:pt-6">
                <h2 className="text-lg font-bold text-white">더보기</h2>
                <button onClick={() => setIsMoreMenuOpen(false)} className="text-gray-400 hover:text-white p-2 -mr-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto pb-safe">
                <div className="p-2 space-y-1">
                  <MenuButton icon={CreditCard} label="포인트 이용 내역" onClick={() => { setIsMoreMenuOpen(false); navigate('/point-history'); }} />
                  <MenuButton icon={History} label="플레이 분석" onClick={() => { setIsMoreMenuOpen(false); navigate('/analysis'); }} />
                  <MenuButton icon={Users} label="친구 관리" onClick={() => { setIsMoreMenuOpen(false); navigate('/friends'); }} />
                  <MenuButton icon={Bell} label="알림 설정" onClick={() => { setIsMoreMenuOpen(false); navigate('/notifications'); }} />
                  <MenuButton icon={Sparkles} label="내 꾸미기" onClick={() => { setIsMoreMenuOpen(false); navigate('/decoration'); }} />
                  <MenuButton icon={Settings} label="게임 설정" onClick={() => { setIsMoreMenuOpen(false); navigate('/settings'); }} />
                  <MenuButton icon={Shield} label="이용 제한 설정" onClick={() => { setIsMoreMenuOpen(false); navigate('/usage-limits'); }} />
                  <div className="h-px bg-white/10 my-2 mx-4" />
                  <MenuButton icon={HelpCircle} label="고객센터" onClick={() => { setIsMoreMenuOpen(false); navigate('/support'); }} />
                  <MenuButton icon={FileText} label="이용약관" onClick={() => { setIsMoreMenuOpen(false); navigate('/terms'); }} />
                  <MenuButton icon={LogOut} label="로그아웃" className="text-arena-error hover:bg-arena-error/10" onClick={() => { setIsMoreMenuOpen(false); navigate('/login'); }} />
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuButton({ icon: Icon, label, onClick, className = "text-white hover:bg-white/5" }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left ${className}`}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="font-bold text-sm">{label}</span>
    </button>
  );
}

