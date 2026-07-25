import React from "react";
import { GameCard } from '@/components/common/Cards';
import { PrimaryButton } from '@/components/common/Buttons';

function AdminPageTemplate({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-white">{title}</h1>
        <p className="text-arena-text-muted">{description}</p>
      </div>
      <GameCard className="min-h-[400px]">
        {children || <p className="text-arena-text-muted text-sm text-center py-12">해당 관리 기능이 구현될 예정입니다.</p>}
      </GameCard>
    </div>
  );
}

export const AdminLoginPage = () => (
  <div className="min-h-screen bg-arena-bg flex items-center justify-center p-4">
    <GameCard className="max-w-md w-full p-8 space-y-8 border-arena-gold/20 shadow-2xl">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-black text-white">아레나 관리자</h1>
        <p className="text-arena-text-muted font-medium">관리자 시스템에 로그인합니다.</p>
      </div>
      {/* Login form placeholder */}
      <div className="space-y-4 pt-4">
         <input type="text" placeholder="관리자 ID" className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
         <input type="password" placeholder="비밀번호" className="w-full h-14 bg-black/50 border border-white/10 rounded-xl px-4 text-white outline-none focus:border-arena-gold/50 transition-colors" />
         <PrimaryButton className="mt-4">
            로그인
         </PrimaryButton>
      </div>
    </GameCard>
  </div>
);

export * from './admin/AdminDashboardPage';
export * from './admin/AdminUsersPage';
export * from './admin/AdminGamesPage';
export * from './admin/AdminPointsPage';
export const AdminTablesPage = () => <AdminPageTemplate title="게임 테이블 관리" description="입장 포인트별 채널/테이블 설정입니다." />;
export const AdminTournamentsPage = () => <AdminPageTemplate title="토너먼트 관리" description="토너먼트 생성, 보상 설정 및 대진 관리입니다." />;
export * from './admin/AdminReportsPage';
export * from './admin/AdminAnomaliesPage';
export const AdminNoticesPage = () => <AdminPageTemplate title="공지사항 관리" description="앱 내 팝업 및 공지사항 게시판 관리입니다." />;
export const AdminSettingsPage = () => <AdminPageTemplate title="시스템 설정" description="운영 환경 및 권한 설정입니다." />;

