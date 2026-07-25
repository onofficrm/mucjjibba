/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { HashRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layouts/Layout';
import { AdminLayout } from './components/layouts/AdminLayout';

// Auth Pages
import { SplashPage } from './pages/auth/SplashPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { OnboardingPage } from './pages/auth/OnboardingPage';
import { LobbyPage } from './pages/lobby/LobbyPage';

// User Pages
import {
  TermsPage, QuickMatchPage,
  RematchPage, RankingPage, NotificationsPage,
  FriendsListPage, GameSettingsPage, CustomerSupportPage,
  UsageLimitsPage, DecorationPage
} from './pages/UserPages';
import { TableSelectPage } from './pages/match/TableSelectPage';
import { RealtimeMatchingPage } from './pages/match/RealtimeMatchingPage';
import { FriendMatchPage } from './pages/match/FriendMatchPage';
import { ArenaPage } from './pages/arena/ArenaPage';
import { TournamentListPage } from './pages/tournament/TournamentListPage';
import { TournamentBracketPage } from './pages/tournament/TournamentBracketPage';
import { GamePlayPage } from './pages/game/GamePlayPage';
import { GameResultPage } from './pages/game/GameResultPage';
import { MatchHistoryPage } from './pages/user/MatchHistoryPage';
import { PlayPatternAnalysisPage } from './pages/user/PlayPatternAnalysisPage';
import { MyPage } from './pages/user/MyPage';
import { PointHistoryPage } from './pages/user/PointHistoryPage';
import { CompetitionPage } from './pages/competition/CompetitionPage';
import { TutorialPage } from './pages/tutorial/TutorialPage';
import { SpectatePage } from './pages/spectate/SpectatePage';

// Admin Pages
import {
  AdminLoginPage, AdminDashboardPage, AdminUsersPage, AdminGamesPage,
  AdminPointsPage, AdminTablesPage, AdminTournamentsPage, AdminReportsPage,
  AdminAnomaliesPage, AdminNoticesPage, AdminSettingsPage
} from './pages/AdminPages';

import { AdvisoryBanner } from './components/common/AdvisoryBanner';

export default function App() {
  return (
    <>
      <AdvisoryBanner />
      <HashRouter>
      <Routes>
        {/* Splash & Auth (No Layout) */}
        <Route path="/" element={<SplashPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/terms" element={<TermsPage />} />

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
    </HashRouter>
    </>
  );
}
