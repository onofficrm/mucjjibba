import React from "react";
import { Link } from 'react-router-dom';
import { GameCard } from '@/components/common/Cards';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';

function PageTemplate({ title, description, children }: { title: string, description: string, children?: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-black tracking-tight text-white">{title}</h1>
        <p className="text-arena-text-muted font-medium">{description}</p>
      </div>
      <GameCard className="min-h-[400px] flex flex-col">
        {children || (
          <div className="flex-1 flex items-center justify-center text-arena-text-muted">
            해당 페이지의 기능이 구현될 예정입니다.
          </div>
        )}
      </GameCard>
    </div>
  );
}

export * from './user/MyPage';
export * from './user/PointHistoryPage';
export * from './user/FriendsListPage';
export * from './user/GameSettingsPage';
export * from './user/UsageLimitsPage';
export * from './user/DecorationPage';

export const TermsPage = () => <PageTemplate title="이용 안내" description="서비스 이용약관 및 성인 이용 안내" />;

export const QuickMatchPage = () => <PageTemplate title="빠른 대전" description="최적의 상대를 찾고 있습니다..." />;
export const RematchPage = () => <PageTemplate title="재대결 제안" description="같은 상대와 다시 한번 승부합니다." />;
export { RankingPage } from './ranking/RankingPage';
export const NotificationsPage = () => <PageTemplate title="알림" description="시스템 안내 및 게임 초대" />;
export const CustomerSupportPage = () => <PageTemplate title="고객센터" description="도움말 및 문의하기" />;

