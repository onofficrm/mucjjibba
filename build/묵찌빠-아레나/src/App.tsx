/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, lazy } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layouts/Layout';
import { AdminLayout } from './components/layouts/AdminLayout';

// Core flow — eager (splash → auth → lobby → play → result)
import { SplashPage } from './pages/auth/SplashPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { LobbyPage } from './pages/lobby/LobbyPage';
import { GamePlayPage } from './pages/game/GamePlayPage';
import { GameResultPage } from './pages/game/GameResultPage';
import { AdvisoryBanner } from './components/common/AdvisoryBanner';

// User Pages — lazy (secondary routes)
const TermsPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.TermsPage })));
const QuickMatchPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.QuickMatchPage })));
const RematchPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.RematchPage })));
const RankingPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.RankingPage })));
const NotificationsPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.NotificationsPage })));
const FriendsListPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.FriendsListPage })));
const GameSettingsPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.GameSettingsPage })));
const CustomerSupportPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.CustomerSupportPage })));
const UsageLimitsPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.UsageLimitsPage })));
const DecorationPage = lazy(() => import('./pages/UserPages').then((m) => ({ default: m.DecorationPage })));
const TableSelectPage = lazy(() => import('./pages/match/TableSelectPage').then((m) => ({ default: m.TableSelectPage })));
const RealtimeMatchingPage = lazy(() => import('./pages/match/RealtimeMatchingPage').then((m) => ({ default: m.RealtimeMatchingPage })));
const FriendMatchPage = lazy(() => import('./pages/match/FriendMatchPage').then((m) => ({ default: m.FriendMatchPage })));
const ArenaPage = lazy(() => import('./pages/arena/ArenaPage').then((m) => ({ default: m.ArenaPage })));
const TournamentListPage = lazy(() => import('./pages/tournament/TournamentListPage').then((m) => ({ default: m.TournamentListPage })));
const TournamentBracketPage = lazy(() => import('./pages/tournament/TournamentBracketPage').then((m) => ({ default: m.TournamentBracketPage })));
const ReplayPage = lazy(() => import('./pages/game/ReplayPage').then((m) => ({ default: m.ReplayPage })));
const MatchHistoryPage = lazy(() => import('./pages/user/MatchHistoryPage').then((m) => ({ default: m.MatchHistoryPage })));
const PlayPatternAnalysisPage = lazy(() => import('./pages/user/PlayPatternAnalysisPage').then((m) => ({ default: m.PlayPatternAnalysisPage })));
const MyPage = lazy(() => import('./pages/user/MyPage').then((m) => ({ default: m.MyPage })));
const PointHistoryPage = lazy(() => import('./pages/user/PointHistoryPage').then((m) => ({ default: m.PointHistoryPage })));
const CompetitionPage = lazy(() => import('./pages/competition/CompetitionPage').then((m) => ({ default: m.CompetitionPage })));
const TutorialPage = lazy(() => import('./pages/tutorial/TutorialPage').then((m) => ({ default: m.TutorialPage })));
const SpectatePage = lazy(() => import('./pages/spectate/SpectatePage').then((m) => ({ default: m.SpectatePage })));
const BroadcastPage = lazy(() => import('./pages/broadcast/BroadcastPage').then((m) => ({ default: m.BroadcastPage })));

// Admin Pages — lazy (separate operator bundle)
const AdminLoginPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminDashboardPage })));
const AdminUsersPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminUsersPage })));
const AdminGamesPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminGamesPage })));
const AdminPointsPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminPointsPage })));
const AdminTablesPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminTablesPage })));
const AdminTournamentsPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminTournamentsPage })));
const AdminReportsPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminReportsPage })));
const AdminAnomaliesPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminAnomaliesPage })));
const AdminNoticesPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminNoticesPage })));
const AdminSettingsPage = lazy(() => import('./pages/AdminPages').then((m) => ({ default: m.AdminSettingsPage })));

function RouteFallback() {
  return (
    <div className="flex h-[100dvh] items-center justify-center bg-arena-bg" aria-live="polite" aria-busy="true">
      <span className="sr-only">불러오는 중</span>
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-arena-gold" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <AdvisoryBanner />
      <HashRouter>
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        {/* Splash & Auth (No Layout) */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/terms" element={<TermsPage />} />

        {/* Broadcast — layout 없음, 읽기 전용 */}
        <Route path="/broadcast/game/:gameId" element={<BroadcastPage />} />

        {/* User App (With Mobile/Desktop Layout) */}
        <Route element={<Layout />}>
          <Route path="/lobby" element={<LobbyPage />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          
          <Route path="/match">
            <Route index element={<QuickMatchPage />} />
            <Route path="quick" element={<QuickMatchPage />} />
            <Route path="tables" element={<TableSelectPage />} />
            <Route path="waiting" element={<RealtimeMatchingPage />} />
            <Route path="friend" element={<FriendMatchPage />} />
          </Route>
          
          <Route path="/game/:id" element={<GamePlayPage />} />
          <Route path="/game/:id/result" element={<GameResultPage />} />
          <Route path="/game/:id/rematch" element={<RematchPage />} />
          <Route path="/replay/:id" element={<ReplayPage />} />
          
          <Route path="/arena" element={<ArenaPage />} />
          
          <Route path="/competition" element={<CompetitionPage />} />
          
          <Route path="/tournament">
            <Route index element={<TournamentListPage />} />
            <Route path=":id" element={<TournamentBracketPage />} />
          </Route>
          
          <Route path="/spectate/:id" element={<SpectatePage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/history" element={<MatchHistoryPage />} />
          <Route path="/analysis" element={<PlayPatternAnalysisPage />} />
          <Route path="/point-history" element={<PointHistoryPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/friends" element={<FriendsListPage />} />
          <Route path="/mypage" element={<MyPage />} />
          <Route path="/settings" element={<GameSettingsPage />} />
          <Route path="/decoration" element={<DecorationPage />} />
          <Route path="/support" element={<CustomerSupportPage />} />
          <Route path="/usage-limits" element={<UsageLimitsPage />} />
        </Route>

        {/* Admin App (With Admin Layout) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="login" element={<AdminLoginPage />} />
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="games" element={<AdminGamesPage />} />
          <Route path="points" element={<AdminPointsPage />} />
          <Route path="tables" element={<AdminTablesPage />} />
          <Route path="tournaments" element={<AdminTournamentsPage />} />
          <Route path="reports" element={<AdminReportsPage />} />
          <Route path="anomalies" element={<AdminAnomaliesPage />} />
          <Route path="notices" element={<AdminNoticesPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
      </Suspense>
    </HashRouter>
    </>
  );
}
