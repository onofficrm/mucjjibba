import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, Activity, Shield, AlertTriangle, Clock, X, Info, Gamepad2, Server, WifiOff, FileText, CheckCircle2
} from 'lucide-react';

type GameStatus = 'playing' | 'completed' | 'aborted' | 'voided' | 'investigating';
type NetworkStatus = 'stable' | 'unstable' | 'disconnected';

interface AdminGame {
  id: string;
  startTime: string;
  endTime: string | null;
  player1: string;
  player2: string;
  table: string;
  entryPoints: number;
  result: string;
  status: GameStatus;
  networkStatus: NetworkStatus;
}

const MOCK_GAMES: AdminGame[] = [
  { id: 'GM-9182A', startTime: '2023.10.25 14:30:15', endTime: '2023.10.25 14:31:45', player1: '아레나마스터', player2: '초보게이머', table: '실버 (5,000 P)', entryPoints: 5000, result: '아레나마스터 승리', status: 'completed', networkStatus: 'stable' },
  { id: 'GM-9182B', startTime: '2023.10.25 14:28:00', endTime: null, player1: '도전자123', player2: '고인물', table: '골드 (50,000 P)', entryPoints: 50000, result: '-', status: 'playing', networkStatus: 'unstable' },
  { id: 'GM-9182C', startTime: '2023.10.25 14:15:10', endTime: '2023.10.25 14:16:30', player1: '연승가자', player2: '패배의쓴맛', table: '브론즈 (1,000 P)', entryPoints: 1000, result: '무승부', status: 'completed', networkStatus: 'stable' },
  { id: 'GM-9182D', startTime: '2023.10.25 14:05:00', endTime: '2023.10.25 14:05:30', player1: '연결끊김', player2: '운좋은자', table: '실버 (5,000 P)', entryPoints: 5000, result: '연결끊김 패배 (네트워크 종료)', status: 'aborted', networkStatus: 'disconnected' },
  { id: 'GM-9182E', startTime: '2023.10.25 13:50:00', endTime: '2023.10.25 13:51:20', player1: '매크로의심', player2: '억울한패배', table: '골드 (50,000 P)', entryPoints: 50000, result: '매크로의심 승리', status: 'investigating', networkStatus: 'stable' },
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminGamesPage() {
  const [selectedGame, setSelectedGame] = useState<AdminGame | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  if (selectedGame) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedGame(null)} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">게임 상세 정보</h1>
          </div>
          <button 
            onClick={() => setShowActionModal(true)}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            게임 관리 / 상태 변경
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column: Basic Info & Players */}
          <div className="space-y-6 xl:col-span-1">
            <Card>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedGame.id}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedGame.status === 'completed' ? 'bg-green-100 text-green-700' :
                    selectedGame.status === 'playing' ? 'bg-blue-100 text-blue-700' :
                    selectedGame.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {selectedGame.status}
                  </span>
                </div>
                <div className="text-sm text-gray-500">테이블: <span className="font-medium text-gray-900">{selectedGame.table}</span></div>
              </div>
              
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">시작 시간</span>
                  <span className="text-gray-900 font-medium">{selectedGame.startTime}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">종료 시간</span>
                  <span className="text-gray-900 font-medium">{selectedGame.endTime || '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">최종 결과</span>
                  <span className="text-indigo-600 font-bold">{selectedGame.result}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">운영 수수료 (10%)</span>
                  <span className="text-gray-900 font-medium">{selectedGame.status === 'completed' ? (selectedGame.entryPoints * 2 * 0.1).toLocaleString() + ' P' : '-'}</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">지급 처리 상태</span>
                  {selectedGame.status === 'completed' ? (
                    <span className="text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded text-xs flex items-center"><CheckCircle2 className="w-3 h-3 mr-1" /> 완료됨</span>
                  ) : selectedGame.status === 'voided' ? (
                    <span className="text-gray-600 font-medium bg-gray-100 px-2 py-0.5 rounded text-xs">반환 완료</span>
                  ) : (
                    <span className="text-yellow-600 font-medium bg-yellow-50 px-2 py-0.5 rounded text-xs">대기 중</span>
                  )}
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <Gamepad2 className="w-4 h-4 mr-2 text-gray-500" /> 플레이어 정보
              </h3>
              
              <div className="space-y-4">
                {/* Player 1 */}
                <div className="bg-blue-50/50 rounded-lg p-4 border border-blue-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-blue-900">Player 1</span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">공격 시작</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{selectedGame.player1}</div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>참가 포인트</span>
                    <span className="font-bold">{selectedGame.entryPoints.toLocaleString()} P</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> 예치 완료 (2023.10.25 14:30:10)
                  </div>
                </div>

                <div className="flex justify-center text-gray-400 font-bold text-xs">VS</div>

                {/* Player 2 */}
                <div className="bg-red-50/50 rounded-lg p-4 border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-red-900">Player 2</span>
                    <span className="text-xs font-medium px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">방어 시작</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1">{selectedGame.player2}</div>
                  <div className="flex justify-between text-xs text-gray-600 mb-2">
                    <span>참가 포인트</span>
                    <span className="font-bold">{selectedGame.entryPoints.toLocaleString()} P</span>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" /> 예치 완료 (2023.10.25 14:30:12)
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Logs & Details */}
          <div className="xl:col-span-2 space-y-6">
            
            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <Clock className="w-4 h-4 mr-2 text-gray-500" /> 라운드 진행 기록
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-3 font-medium">라운드</th>
                      <th className="px-4 py-3 font-medium">상태</th>
                      <th className="px-4 py-3 font-medium text-center">P1 선택 (시간)</th>
                      <th className="px-4 py-3 font-medium text-center">P2 선택 (시간)</th>
                      <th className="px-4 py-3 font-medium">결과</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">1R (P1 공격)</td>
                      <td className="px-4 py-3 text-xs text-gray-500">2023.10.25 14:30:20</td>
                      <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-gray-100 rounded text-gray-900 font-medium">오른쪽 (1.2s)</span></td>
                      <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-gray-100 rounded text-gray-900 font-medium">왼쪽 (0.8s)</span></td>
                      <td className="px-4 py-3 font-medium text-blue-600">P1 공격권 유지</td>
                    </tr>
                    <tr className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-900">2R (P1 공격)</td>
                      <td className="px-4 py-3 text-xs text-gray-500">2023.10.25 14:30:45</td>
                      <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-gray-100 rounded text-gray-900 font-medium">위 (2.1s)</span></td>
                      <td className="px-4 py-3 text-center"><span className="px-2 py-1 bg-gray-100 rounded text-gray-900 font-medium">위 (1.5s)</span></td>
                      <td className="px-4 py-3 font-bold text-green-600">P1 승리 (일치)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <WifiOff className="w-4 h-4 mr-2 text-gray-500" /> 네트워크 및 서버 로그
                </h3>
                <div className="bg-gray-900 text-gray-300 p-4 rounded-lg font-mono text-xs overflow-y-auto h-48 space-y-2">
                  <div className="flex gap-2"><span className="text-green-400">[14:30:15.001]</span><span>Game GM-9182A initialized. Table: silver.</span></div>
                  <div className="flex gap-2"><span className="text-green-400">[14:30:15.105]</span><span>P1 (아레나마스터) connected via WS. Latency: 45ms.</span></div>
                  <div className="flex gap-2"><span className="text-green-400">[14:30:15.220]</span><span>P2 (초보게이머) connected via WS. Latency: 32ms.</span></div>
                  <div className="flex gap-2"><span className="text-blue-400">[14:30:20.100]</span><span>Round 1 Start. Turn: P1.</span></div>
                  <div className="flex gap-2"><span className="text-gray-500">[14:30:21.300]</span><span>P1 action received. (Right)</span></div>
                  <div className="flex gap-2"><span className="text-gray-500">[14:30:20.900]</span><span>P2 action received. (Left)</span></div>
                  <div className="flex gap-2"><span className="text-blue-400">[14:30:45.000]</span><span>Round 2 Start. Turn: P1.</span></div>
                  <div className="flex gap-2"><span className="text-yellow-400">[14:31:45.000]</span><span>Match Condition Met. Winner: P1.</span></div>
                  <div className="flex gap-2"><span className="text-green-400">[14:31:45.050]</span><span>Payout trigger dispatched.</span></div>
                </div>
              </Card>

              <Card>
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                  <AlertTriangle className="w-4 h-4 mr-2 text-gray-500" /> 신고 및 분쟁 내역
                </h3>
                {selectedGame.status === 'investigating' ? (
                  <div className="space-y-4">
                    <div className="p-3 bg-red-50 border border-red-100 rounded-lg">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-red-700">신고자: 억울한패배</span>
                        <span className="text-xs text-red-500">2023.10.25 13:55</span>
                      </div>
                      <p className="text-sm text-red-900">상대방이 시작하자마자 0.1초만에 반응해서 계속 이겼습니다. 매크로가 의심됩니다. 조사해주세요.</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full min-h-[150px] flex items-center justify-center text-sm text-gray-500 flex-col">
                    <Shield className="w-8 h-8 mb-2 text-gray-300" />
                    접수된 신고나 분쟁이 없습니다.
                  </div>
                )}
              </Card>
            </div>
            
          </div>
        </div>

        {/* Action Modal (감사 로그 기록용) */}
        {showActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">게임 관리 및 조치</h2>
                  <p className="text-sm text-gray-500 mt-1">상태 변경 시 양측 플레이어에게 알림이 발송되며 로그가 남습니다.</p>
                </div>
                <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">게임 상태 변경 <span className="text-red-500">*</span></label>
                  <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-shadow">
                    <option value="investigating">게임 조사 시작 (지급 보류)</option>
                    <option value="voided">게임 무효 처리 (양쪽 포인트 반환)</option>
                    <option value="p1_win">관리자 판정: P1 승리 처리</option>
                    <option value="p2_win">관리자 판정: P2 승리 처리</option>
                    <option value="completed">정상 완료 처리 (조사 종결)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">처리 사유 / 관리자 메모 (내부용) <span className="text-red-500">*</span></label>
                  <textarea placeholder="게임 무효 처리 사유나 판정 근거를 상세히 작성하세요." className="w-full h-24 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-shadow" />
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
                  적용 및 감사 로그 기록
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
          <h1 className="text-2xl font-bold text-gray-900">게임 관리</h1>
          <p className="text-sm text-gray-500 mt-1">게임 진행 현황, 결과 로그 및 분쟁 내역을 관리합니다.</p>
        </div>
      </div>

      {/* Search & Filter */}
      <Card className="!p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">게임 / 플레이어 검색</label>
            <div className="flex gap-2">
              <select className="w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="id">게임 ID</option>
                <option value="player">플레이어 (닉네임/ID)</option>
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
            <label className="block text-xs font-bold text-gray-700 mb-1.5">게임 상태</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 상태</option>
              <option value="playing">진행 중</option>
              <option value="completed">정상 완료</option>
              <option value="aborted">비정상 종료</option>
              <option value="investigating">조사 중 (분쟁)</option>
              <option value="voided">무효 처리됨</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">이용 테이블</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 테이블</option>
              <option value="bronze">브론즈 (1,000 P)</option>
              <option value="silver">실버 (5,000 P)</option>
              <option value="gold">골드 (50,000 P)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5 pb-5 border-b border-gray-100">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">게임 시작일 (시작)</label>
            <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">게임 시작일 (종료)</label>
            <input type="date" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
          </div>
        </div>
        
        <div className="flex justify-end gap-3">
          <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">초기화</button>
          <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">검색 적용</button>
        </div>
      </Card>

      {/* Game List */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 font-bold">게임 ID / 테이블</th>
                <th className="px-5 py-4 font-bold">시작/종료 시간</th>
                <th className="px-5 py-4 font-bold text-center">대진 (P1 vs P2)</th>
                <th className="px-5 py-4 font-bold text-center">결과</th>
                <th className="px-5 py-4 font-bold text-center">상태 / 네트워크</th>
                <th className="px-5 py-4 font-bold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_GAMES.map((game) => (
                <tr key={game.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900 font-mono text-xs">{game.id}</div>
                    <div className="text-xs text-gray-500 mt-1">{game.table}</div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600">
                    <div>{game.startTime}</div>
                    <div className="text-gray-400">{game.endTime || '진행 중...'}</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2 text-sm">
                      <span className="font-medium text-blue-700 truncate max-w-[80px]">{game.player1}</span>
                      <span className="text-gray-400 text-xs font-bold px-1">VS</span>
                      <span className="font-medium text-red-700 truncate max-w-[80px]">{game.player2}</span>
                    </div>
                    <div className="text-[10px] text-gray-500 mt-1">참가비: {game.entryPoints.toLocaleString()} P</div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className="text-xs font-bold text-gray-800">{game.result}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        game.status === 'completed' ? 'bg-green-100 text-green-700' :
                        game.status === 'playing' ? 'bg-blue-100 text-blue-700' :
                        game.status === 'investigating' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {game.status}
                      </span>
                      {game.networkStatus !== 'stable' && (
                        <span className="text-[10px] flex items-center text-red-500 font-medium">
                          <WifiOff className="w-3 h-3 mr-0.5" /> 불안정
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setSelectedGame(game)}
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
          <span className="text-sm text-gray-600 font-medium">총 5건 중 1-5 표시</span>
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
