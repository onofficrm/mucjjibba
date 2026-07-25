import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, Activity, Shield, AlertTriangle, Clock, X, Info, CreditCard, MonitorSmartphone
} from 'lucide-react';
import { PrimaryButton, SecondaryButton } from '@/components/common/Buttons';

type UserStatus = 'normal' | 'suspended' | 'banned' | 'review' | 'chat_ban' | 'friend_ban';
type UserGrade = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

interface AdminUser {
  id: string;
  nickname: string;
  email: string;
  grade: UserGrade;
  points: number;
  totalGames: number;
  winRate: number;
  status: UserStatus;
  lastLogin: string;
}

const MOCK_USERS: AdminUser[] = [
  { id: 'USR-8A2F', nickname: '아레나마스터', email: 'user1@example.com', grade: 'gold', points: 154000, totalGames: 450, winRate: 62.2, status: 'normal', lastLogin: '2023.10.25 14:30' },
  { id: 'USR-9B3C', nickname: '초보게이머', email: 'user2@example.com', grade: 'bronze', points: 12000, totalGames: 12, winRate: 33.3, status: 'normal', lastLogin: '2023.10.25 12:10' },
  { id: 'USR-1C4D', nickname: '매크로의심', email: 'user3@example.com', grade: 'silver', points: 450000, totalGames: 890, winRate: 85.5, status: 'review', lastLogin: '2023.10.25 09:00' },
  { id: 'USR-2D5E', nickname: '욕설정지유저', email: 'user4@example.com', grade: 'bronze', points: 0, totalGames: 45, winRate: 45.0, status: 'suspended', lastLogin: '2023.10.20 18:20' },
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminUsersPage() {
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  if (selectedUser) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedUser(null)} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">회원 상세 정보</h1>
          </div>
          <button 
            onClick={() => setShowActionModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            상태 변경 / 제재
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Basic Info & Stats */}
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-2xl font-bold text-gray-700">
                  {selectedUser.nickname.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    {selectedUser.nickname}
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      selectedUser.status === 'normal' ? 'bg-green-100 text-green-700' :
                      selectedUser.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </h2>
                  <div className="text-sm text-gray-500 mt-1">ID: {selectedUser.id}</div>
                </div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">본인확인 상태</span>
                  <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-xs">확인 완료</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">이메일</span>
                  <span className="text-gray-900 font-medium">{selectedUser.email}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">휴대전화</span>
                  <span className="text-gray-900 font-medium">010-****-1234</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">국가 및 지역</span>
                  <span className="text-gray-900 font-medium">대한민국 (KR)</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">가입일</span>
                  <span className="text-gray-900 font-medium">2023.01.15</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">등급</span>
                  <span className="text-blue-600 font-bold uppercase">{selectedUser.grade}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-gray-500" /> 게임 전적 및 보유 포인트
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 flex justify-between items-center">
                  <span className="text-sm text-gray-600 font-medium">보유 포인트</span>
                  <span className="text-lg font-bold text-indigo-600">{selectedUser.points.toLocaleString()} P</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">전체 경기 수</div>
                    <div className="text-base font-bold text-gray-900">{selectedUser.totalGames}전</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <div className="text-xs text-gray-500 mb-1">승률</div>
                    <div className="text-base font-bold text-gray-900">{selectedUser.winRate}%</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Logs & History */}
          <div className="lg:col-span-2 space-y-6">
            
            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-500" /> 포인트 이용 내역
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">일시</th>
                      <th className="px-4 py-3 font-medium">유형</th>
                      <th className="px-4 py-3 font-medium text-right">변동 내역</th>
                      <th className="px-4 py-3 font-medium text-right">잔액</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs">2023.10.25 14:35</td>
                      <td className="px-4 py-3 text-gray-900">게임 보상 (승리)</td>
                      <td className="px-4 py-3 text-right font-medium text-green-600">+1,500</td>
                      <td className="px-4 py-3 text-right text-gray-900">{selectedUser.points.toLocaleString()}</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600 text-xs">2023.10.25 14:30</td>
                      <td className="px-4 py-3 text-gray-900">게임 참가비</td>
                      <td className="px-4 py-3 text-right font-medium text-red-600">-1,000</td>
                      <td className="px-4 py-3 text-right text-gray-900">{(selectedUser.points - 1500).toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <MonitorSmartphone className="w-4 h-4 mr-2 text-gray-500" /> 접속 및 기기 기록 (IP/기기)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">접속 일시</th>
                      <th className="px-4 py-3 font-medium">IP 주소</th>
                      <th className="px-4 py-3 font-medium">기기 정보</th>
                      <th className="px-4 py-3 font-medium">상태</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">{selectedUser.lastLogin}</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">192.168.1.100</td>
                      <td className="px-4 py-3 text-gray-600">iPhone 14 Pro, iOS 16.5</td>
                      <td className="px-4 py-3 text-green-600 font-medium">성공</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-900">2023.10.24 11:20</td>
                      <td className="px-4 py-3 text-gray-600 font-mono text-xs">192.168.1.100</td>
                      <td className="px-4 py-3 text-gray-600">Windows 11, Chrome</td>
                      <td className="px-4 py-3 text-green-600 font-medium">성공</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <Shield className="w-4 h-4 mr-2 text-gray-500" /> 신고 및 제재 내역, 관리자 메모
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 p-4 bg-red-50 border border-red-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-bold text-red-700 mb-1">채팅 금지 (3일)</div>
                    <div className="text-sm text-red-900 mb-2">사유: 게임 중 상대방에게 심한 욕설 및 비방 (신고 접수 3건)</div>
                    <div className="text-xs text-red-600/70">처리일시: 2023.09.15 14:00 | 처리자: admin_hero | 로그 ID: AUD-9182A</div>
                  </div>
                </div>
                
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="px-4 py-3 border-b border-gray-200 text-xs font-bold text-gray-700 flex justify-between items-center">
                    <span>관리자 메모 내역</span>
                    <button className="text-blue-600 hover:text-blue-700">+ 새 메모 작성</button>
                  </div>
                  <div className="p-4 bg-white">
                    <div className="mb-4 pb-4 border-b border-gray-100 last:border-0 last:mb-0 last:pb-0">
                      <p className="text-sm text-gray-700 mb-2">과거에도 욕설 이력이 있어 모니터링이 필요함. 다음 적발 시 7일 정지 검토.</p>
                      <div className="text-xs text-gray-400">작성일시: 2023.09.15 14:05 | 작성자: admin_hero</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Action Modal (감사 로그 기록용) */}
        {showActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">회원 상태 변경 및 제재</h2>
                  <p className="text-sm text-gray-500 mt-1">모든 상태 변경은 감사 로그(Audit Log)에 영구 기록됩니다.</p>
                </div>
                <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">조치 유형 <span className="text-red-500">*</span></label>
                  <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                    <option value="normal">정상 처리 (제재 해제)</option>
                    <option value="chat_ban">채팅 금지</option>
                    <option value="friend_ban">친구 기능 제한</option>
                    <option value="suspended_temp">일정 기간 이용 제한 (게임 이용 정지)</option>
                    <option value="banned_permanent">영구 정지</option>
                    <option value="review">포인트 처리 검토 상태 (출금/이동 제한)</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">처리 기간 <span className="text-red-500">*</span></label>
                  <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                    <option value="1">1일</option>
                    <option value="3">3일</option>
                    <option value="7">7일</option>
                    <option value="30">30일</option>
                    <option value="permanent">무기한 (영구)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">처리 사유 (사용자 노출용) <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="예: 운영정책 위반 (욕설/비방)" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow" />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">관리자 메모 (내부용 감사 로그) <span className="text-red-500">*</span></label>
                  <textarea placeholder="상세 처리 근거를 남겨주세요." className="w-full h-24 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-shadow" />
                </div>
                
                <div className="pt-4 border-t border-gray-100">
                  <label className="block text-gray-700 font-medium mb-1.5">관리자 비밀번호 재확인 <span className="text-red-500">*</span></label>
                  <input type="password" placeholder="권한 확인을 위해 비밀번호를 입력하세요" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow" />
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
                <button className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  상태 적용 및 로그 기록
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">회원 관리</h1>
          <p className="text-sm text-gray-500 mt-1">플랫폼 가입 회원을 검색하고 관리합니다.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="!p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">통합 검색</label>
            <div className="flex gap-2">
              <select className="w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="id">회원 ID</option>
                <option value="nickname">닉네임</option>
                <option value="email">이메일</option>
                <option value="phone">휴대전화</option>
                <option value="ip">IP 주소</option>
                <option value="device">기기 ID</option>
              </select>
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="검색어를 입력하세요" 
                  className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">회원 상태</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 상태</option>
              <option value="normal">정상</option>
              <option value="suspended">정지됨</option>
              <option value="review">검토 중</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">회원 등급</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 등급</option>
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
              <option value="platinum">Platinum</option>
              <option value="diamond">Diamond</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">가입일 (시작)</label>
            <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">가입일 (종료)</label>
            <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">최근 접속일 (시작)</label>
            <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">최근 접속일 (종료)</label>
            <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">초기화</button>
          <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">검색 적용</button>
        </div>
      </Card>

      {/* User List */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 font-bold">회원 ID / 프로필 / 닉네임</th>
                <th className="px-5 py-4 font-bold">등급</th>
                <th className="px-5 py-4 font-bold">보유 포인트</th>
                <th className="px-5 py-4 font-bold">전적 / 승률</th>
                <th className="px-5 py-4 font-bold">상태</th>
                <th className="px-5 py-4 font-bold">최근 접속</th>
                <th className="px-5 py-4 font-bold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_USERS.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-gray-600">
                        {user.nickname.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">{user.nickname}</div>
                        <div className="text-xs text-gray-500">{user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-blue-600 font-bold uppercase text-xs tracking-wider">{user.grade}</span>
                  </td>
                  <td className="px-5 py-4 font-bold text-indigo-600">
                    {user.points.toLocaleString()} P
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-gray-900 font-medium">{user.totalGames}전</div>
                    <div className="text-xs text-gray-500">{user.winRate}%</div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                      user.status === 'normal' ? 'bg-green-100 text-green-700' :
                      user.status === 'review' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-500 font-medium">
                    {user.lastLogin}
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setSelectedUser(user)}
                      className="text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      상세 보기
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">총 4명 중 1-4 표시</span>
          <div className="flex gap-1">
            <button className="p-1 rounded-md bg-white border border-gray-200 text-gray-400 disabled:opacity-50" disabled><ChevronLeft className="w-5 h-5" /></button>
            <button className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-bold shadow-sm">1</button>
            <button className="p-1 rounded-md bg-white border border-gray-200 text-gray-400 disabled:opacity-50" disabled><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </Card>
    </div>
  );
}
