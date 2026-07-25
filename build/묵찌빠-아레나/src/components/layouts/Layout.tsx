import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Home, Gamepad2, Trophy, User, MoreVertical, Menu, X, Swords, Zap, Users, Play, ChevronDown, Bell, Settings, History, CreditCard, Shield, HelpCircle, FileText, LogOut, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { triggerHaptic } from '@/utils/haptics';
import { HostessAvatar } from '@/components/casino/HostessAvatar';
import { HOSTESS, hostessByIndex } from '@/data/hostessAssets';
import { GameSelectCard } from '@/components/casino/GameSelectCard';
import { useDemoWallet } from '@/hooks/useDemoWallet';
import { DEMO_USER } from '@/data/demoData';
import { SidebarAnchor } from '@/components/layouts/SidebarAnchor';
import { MissionFanfareToast, useMissionFanfare } from '@/components/casino/DopamineFX';
import { useSoundMuted } from '@/hooks/useSoundMuted';

const navItems = [
  { name: '로비', path: '/lobby', icon: Home },
  { name: '게임', path: '#game', icon: Gamepad2, action: 'openGameSelect' },
  { name: '대회', path: '/competition', icon: Trophy },
  { name: 'MY', path: '/mypage', icon: User },
];

export function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const wallet = useDemoWallet();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isGameSelectOpen, setIsGameSelectOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { fanfare, clear: clearFanfare } = useMissionFanfare();
  const { soundEnabled, toggleMuted } = useSoundMuted();

  // 포털로 띄우는 팝업까지 사이드바 폭을 알 수 있도록 body에 표식
  useEffect(() => {
    document.body.classList.add('app-shell');
    return () => document.body.classList.remove('app-shell');
  }, []);

  // 게임 플레이 화면에서 하단 내비 자동 숨김 (위로 스와이프하면 다시 표시)
  const isGamePlayScreen = /^\/game\/[^/]+$/.test(location.pathname);
  const [isNavHidden, setIsNavHidden] = useState(false);
  const navHideTimer = useRef<number | null>(null);

  const scheduleNavHide = useCallback((delay: number) => {
    if (navHideTimer.current !== null) window.clearTimeout(navHideTimer.current);
    navHideTimer.current = window.setTimeout(() => setIsNavHidden(true), delay);
  }, []);

  const revealNav = useCallback(() => {
    triggerHaptic('light');
    setIsNavHidden(false);
    scheduleNavHide(3500);
  }, [scheduleNavHide]);

  useEffect(() => {
    if (!isGamePlayScreen) {
      if (navHideTimer.current !== null) window.clearTimeout(navHideTimer.current);
      setIsNavHidden(false);
      return;
    }
    scheduleNavHide(1200);
    return () => {
      if (navHideTimer.current !== null) window.clearTimeout(navHideTimer.current);
    };
  }, [isGamePlayScreen, location.pathname, scheduleNavHide]);

  useEffect(() => {
    if (!isGamePlayScreen) return;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };
    const onTouchEnd = (e: TouchEvent) => {
      const deltaY = e.changedTouches[0].clientY - startY;
      const fromBottom = startY > window.innerHeight * 0.65;
      if (fromBottom && deltaY < -40) revealNav();
    };
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [isGamePlayScreen, revealNav]);

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
      <MissionFanfareToast
        open={!!fanfare}
        title={fanfare?.title ?? ''}
        onDone={clearFanfare}
      />
      {/* Desktop sidebar — 무대 사이드윙 + 하단 앵커 */}
      <aside
        className={`hidden md:flex flex-col relative z-30 overflow-hidden transition-all duration-300 ${
          isSidebarExpanded ? 'w-64' : 'w-20 lg:w-56'
        }`}
        onMouseEnter={() => setIsSidebarExpanded(true)}
        onMouseLeave={() => setIsSidebarExpanded(false)}
      >
        {/* Atmosphere */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#121826] via-[#0c111b] to-[#070a10]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(245,158,11,0.12)_0%,_transparent_55%)] pointer-events-none" />
        <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent pointer-events-none" />
        {/* Hostess wing — 하단 실루엣, 좌·상 페이드로 프로필/내비와 겹침 방지 */}
        <img
          src={HOSTESS.lobby}
          alt=""
          className="absolute -bottom-4 -right-6 h-[42%] w-auto max-w-[90%] object-cover object-[center_10%] opacity-[0.16] pointer-events-none select-none"
          style={{
            WebkitMaskImage:
              'linear-gradient(to top, black 15%, transparent 88%), linear-gradient(to left, black 45%, transparent 100%)',
            maskImage:
              'linear-gradient(to top, black 15%, transparent 88%), linear-gradient(to left, black 45%, transparent 100%)',
            WebkitMaskComposite: 'source-in',
            maskComposite: 'intersect',
          }}
          draggable={false}
        />
        {/* Gold hairline — 우측 엣지 */}
        <div className="absolute top-0 right-0 bottom-0 w-px bg-gradient-to-b from-arena-gold/50 via-arena-gold/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-arena-gold/40 to-transparent pointer-events-none" />

        {/* Brand monogram */}
        <div className="relative z-10 px-4 pt-5 pb-3">
          <Link to="/lobby" className="flex items-center gap-2.5 overflow-hidden group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-300/20 via-arena-gold/10 to-transparent border border-arena-gold/40 flex items-center justify-center shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] group-hover:border-arena-gold/70 transition-colors">
              <span className="text-lg leading-none">✊</span>
            </div>
            <div className={`${isSidebarExpanded ? 'block' : 'hidden lg:block'} min-w-0`}>
              <p className="font-display text-[10px] font-black text-arena-gold tracking-[0.28em] leading-none">
                ARENA
              </p>
              <p className="text-sm font-black text-white tracking-tight truncate mt-1">묵찌빠 아레나</p>
            </div>
          </Link>
        </div>

        {/* Mini profile */}
        <div
          className={`relative z-10 mx-3 mb-3 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${
            isSidebarExpanded ? 'px-2.5 py-2' : 'p-2 lg:px-2.5 lg:py-2'
          }`}
        >
          <div className="flex items-center gap-2">
            <HostessAvatar role="icon" size="sm" className="shrink-0" />
            <div className={`min-w-0 flex-1 ${isSidebarExpanded ? '' : 'hidden lg:block'}`}>
              <p className="text-[11px] font-black text-white truncate">{DEMO_USER.nickname}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[9px] font-black text-arena-gold px-1.5 py-0.5 rounded bg-arena-gold/10 border border-arena-gold/25">
                  {DEMO_USER.grade}
                </span>
                <span className="text-[10px] font-bold text-gray-400 tabular-nums truncate">
                  {wallet.points.toLocaleString()} P
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="relative z-10 flex-1 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path !== '#game' && location.pathname.startsWith(item.path);
            const showLabel = isSidebarExpanded;
            return (
              <Link
                key={item.name}
                to={item.path === '#game' ? '#' : item.path}
                onClick={(e) => handleNavClick(item, e)}
                className={`relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all font-bold overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-arena-gold/15 via-white/[0.06] to-transparent text-white border border-arena-gold/25 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]'
                    : 'text-arena-text-muted border border-transparent hover:bg-white/[0.04] hover:text-white hover:border-white/5'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-7 rounded-r-full bg-gradient-to-b from-amber-300 via-arena-gold to-amber-600 shadow-[0_0_10px_rgba(245,158,11,0.7)]" />
                )}
                <item.icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-arena-gold' : ''}`} />
                <span
                  className={`whitespace-nowrap text-sm tracking-tight ${
                    showLabel ? 'inline' : 'hidden lg:inline'
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        <SidebarAnchor expanded={isSidebarExpanded} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Global Header */}
        <header className="flex items-center justify-between px-4 h-16 bg-arena-card/90 backdrop-blur-md border-b border-white/5 z-20 shrink-0">
          <div className="flex items-center">
             <Link to="/" className="text-xl font-black text-white flex items-center space-x-2 md:hidden">
                <HostessAvatar role="icon" size="sm" />
              </Link>
              <div className="hidden md:block w-8" />
          </div>
          
          <div className="absolute left-1/2 -translate-x-1/2 font-bold text-white text-sm md:text-base flex items-center gap-2">
            <HostessAvatar role="dealer" size="xs" ring={false} className="hidden sm:inline-flex ring-1 ring-arena-gold/40" />
            {getPageTitle()}
          </div>

          <div className="flex items-center gap-2">
            <div className="bg-black/30 px-3 py-1.5 md:px-4 md:py-2 rounded-full border border-white/5 flex items-center gap-1.5">
              <HostessAvatar role="icon" size="xs" ring={false} />
              <span className="text-xs font-bold text-arena-gold">P</span>
              <span className="text-sm md:text-base font-bold text-white">{wallet.points.toLocaleString()}</span>
            </div>
            <button 
              onClick={() => { triggerHaptic('light'); setIsMoreMenuOpen(true); }}
              className="p-1.5 text-arena-text-muted hover:text-white transition-colors"
            >
              <HostessAvatar index={3} size="sm" />
            </button>
          </div>
        </header>

        {/* Page Content with Transitions */}
        <div
          className={`flex-1 overflow-x-hidden relative bg-arena-bg ${
            isGamePlayScreen
              ? 'overflow-hidden pb-0 md:pb-0'
              : 'overflow-y-auto pb-24 md:pb-8'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: isGamePlayScreen ? 0 : 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: isGamePlayScreen ? 0 : -10 }}
              transition={{ duration: 0.2 }}
              className={`w-full ${isGamePlayScreen ? 'h-full min-h-0' : 'h-full'}`}
            >
              <Outlet context={{ openGameSelect: () => setIsGameSelectOpen(true) }} />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Mobile Bottom Navigation — 게임 중에는 아래로 스르륵 숨김 */}
      <nav
        className={`md:hidden fixed bottom-0 left-0 right-0 bg-arena-card/95 backdrop-blur-xl border-t border-white/5 pb-safe z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-in-out ${
          isNavHidden ? 'translate-y-[110%]' : 'translate-y-0'
        }`}
        aria-hidden={isNavHidden}
      >
        <div className="flex justify-around items-center h-16 px-2">
          {navItems.map((item, idx) => {
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
                <HostessAvatar index={idx} size="xs" ring={isActive} className="mt-1" />
                <span className="text-[10px] font-bold">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 숨김 상태 핸들 — 탭하거나 위로 쓸어올리면 내비 표시 */}
      <AnimatePresence>
        {isGamePlayScreen && isNavHidden && (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ delay: 0.4 }}
            onClick={revealNav}
            className="md:hidden fixed bottom-0 left-1/2 -translate-x-1/2 z-30 px-8 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
            aria-label="메뉴 열기"
          >
            <span className="block w-12 h-1.5 rounded-full bg-white/30" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Game Select Bottom Sheet */}
      <AnimatePresence>
        {isGameSelectOpen && (
          <div className="overlay-area z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsGameSelectOpen(false)}
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-md bg-arena-card border border-white/10 rounded-3xl p-6 shadow-2xl pb-8 overflow-hidden"
            >
              <img
                src={hostessByIndex(8)}
                alt=""
                className="absolute right-0 top-0 h-36 w-24 object-cover object-[center_10%] opacity-20 pointer-events-none select-none"
                style={{
                  WebkitMaskImage: 'linear-gradient(to left, black 40%, transparent 100%)',
                  maskImage: 'linear-gradient(to left, black 40%, transparent 100%)',
                }}
                draggable={false}
              />
              <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-6 sm:hidden" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <HostessAvatar role="match" size="sm" /> 게임 선택
                </h2>
                <button onClick={() => setIsGameSelectOpen(false)} className="text-gray-400 hover:text-white p-2">
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-3 relative z-10">
                <GameSelectCard
                  title="초보자 빠른 시작"
                  subtitle="안전한 입문 테이블"
                  tone="mint"
                  hostessIndex={12}
                  chips={[{ label: '무료' }, { label: '튜토리얼' }]}
                  delayIndex={0}
                  onClick={() => { setIsGameSelectOpen(false); navigate('/tutorial'); }}
                />
                <GameSelectCard
                  title="일반 빠른 대전"
                  subtitle="실력에 맞는 상대 찾기"
                  tone="cyan"
                  hostessIndex={8}
                  chips={[{ label: '+WP' }, { label: '랭킹 반영' }]}
                  delayIndex={1}
                  onClick={() => { setIsGameSelectOpen(false); navigate('/match/tables'); }}
                />
                <GameSelectCard
                  title="연승 아레나"
                  subtitle="최고 8연승 도전"
                  tone="gold"
                  hostessIndex={14}
                  chips={[{ label: '8연승' }, { label: 'WP x2.0' }]}
                  hot
                  featured
                  delayIndex={2}
                  onClick={() => { setIsGameSelectOpen(false); navigate('/arena'); }}
                />
                <GameSelectCard
                  title="친구 대전"
                  subtitle="비공개 방 만들기"
                  tone="purple"
                  hostessIndex={10}
                  chips={[{ label: '초대 코드' }, { label: '관전' }]}
                  delayIndex={3}
                  onClick={() => { setIsGameSelectOpen(false); navigate('/match/friend'); }}
                />
                <GameSelectCard
                  title="무료 연습"
                  subtitle="포인트 차감 없음 · AI 상대"
                  tone="silver"
                  hostessIndex={5}
                  chips={[{ label: '무료' }, { label: 'AI' }]}
                  delayIndex={4}
                  onClick={() => {
                    setIsGameSelectOpen(false);
                    navigate('/match/tables', { state: { preferFree: true } });
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global More Menu (더보기) */}
      <AnimatePresence>
        {isMoreMenuOpen && (
          <div className="overlay-area z-50 flex items-end justify-center sm:items-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
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
                  <MenuButton
                    icon={soundEnabled ? Volume2 : VolumeX}
                    label={`게임 소리 ${soundEnabled ? 'ON' : 'OFF'}`}
                    className={soundEnabled ? '' : 'text-arena-error hover:bg-arena-error/10'}
                    onClick={toggleMuted}
                  />
                  <div className="h-px bg-white/10 my-2 mx-4" />
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

