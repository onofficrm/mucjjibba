import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, Activity, Shield, AlertTriangle, Clock, X, Info, Coins, ArrowRightLeft, CheckCircle2, XCircle
} from 'lucide-react';

type TransactionType = 'deposit' | 'payout' | 'refund' | 'admin_adjust' | 'fee';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'suspected_duplicate';

interface AdminTransaction {
  id: string;
  time: string;
  userId: string;
  nickname: string;
  type: TransactionType;
  amount: number;
  balanceAfter: number;
  relatedGameId: string | null;
  status: TransactionStatus;
  note: string;
}

const MOCK_TRANSACTIONS: AdminTransaction[] = [
  { id: 'TX-99812', time: '2023.10.25 14:35:10', userId: 'USR-8A2F', nickname: '아레나마스터', type: 'payout', amount: 9000, balanceAfter: 154000, relatedGameId: 'GM-9182A', status: 'completed', note: '게임 승리 보상 (실버)' },
  { id: 'TX-99811', time: '2023.10.25 14:35:10', userId: 'SYSTEM', nickname: '운영수수료', type: 'fee', amount: 1000, balanceAfter: 0, relatedGameId: 'GM-9182A', status: 'completed', note: '게임 수수료 징수 (실버)' },
  { id: 'TX-99810', time: '2023.10.25 14:30:15', userId: 'USR-8A2F', nickname: '아레나마스터', type: 'deposit', amount: -5000, balanceAfter: 145000, relatedGameId: 'GM-9182A', status: 'completed', note: '게임 참가 예치 (실버)' },
  { id: 'TX-99809', time: '2023.10.25 14:30:15', userId: 'USR-9B3C', nickname: '초보게이머', type: 'deposit', amount: -5000, balanceAfter: 12000, relatedGameId: 'GM-9182A', status: 'completed', note: '게임 참가 예치 (실버)' },
  { id: 'TX-99808', time: '2023.10.25 14:20:00', userId: 'USR-1C4D', nickname: '매크로의심', type: 'payout', amount: 90000, balanceAfter: 450000, relatedGameId: 'GM-9181X', status: 'suspected_duplicate', note: '중복 지급 의심 (검토 필요)' },
  { id: 'TX-99807', time: '2023.10.25 10:15:00', userId: 'USR-2D5E', nickname: '욕설정지유저', type: 'admin_adjust', amount: -50000, balanceAfter: 0, relatedGameId: null, status: 'completed', note: '어뷰징 적발 포인트 몰수 (Admin: hero)' },
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminPointsPage() {
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">포인트 관리 (원장)</h1>
          <p className="text-sm text-gray-500 mt-1">포인트 거래 내역 검색 및 수동 조정 기능을 제공합니다.</p>
        </div>
        <button 
          onClick={() => setShowAdjustmentModal(true)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm flex items-center"
        >
          <Coins className="w-4 h-4 mr-2" /> 포인트 수동 조정
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="!p-5 bg-gradient-to-br from-indigo-50 to-white">
          <div className="text-sm font-bold text-indigo-800 mb-1">오늘 총 지급 포인트</div>
          <div className="text-2xl font-black text-indigo-600">452,150,000 P</div>
        </Card>
        <Card className="!p-5 bg-gradient-to-br from-purple-50 to-white">
          <div className="text-sm font-bold text-purple-800 mb-1">오늘 누적 운영 수수료</div>
          <div className="text-2xl font-black text-purple-600">45,215,000 P</div>
        </Card>
        <Card className="!p-5 bg-gradient-to-br from-yellow-50 to-white border-yellow-200">
          <div className="text-sm font-bold text-yellow-800 mb-1">검토 필요 거래</div>
          <div className="text-2xl font-black text-yellow-600">12 건</div>
        </Card>
        <Card className="!p-5 bg-gradient-to-br from-red-50 to-white border-red-200">
          <div className="text-sm font-bold text-red-800 mb-1">처리 실패 거래</div>
          <div className="text-2xl font-black text-red-600">3 건</div>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="!p-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="lg:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">거래 검색</label>
            <div className="flex gap-2">
              <select className="w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                <option value="user">회원 (ID/닉네임)</option>
                <option value="tx_id">거래 ID</option>
                <option value="game_id">게임 ID</option>
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
            <label className="block text-xs font-bold text-gray-700 mb-1.5">거래 유형</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 유형</option>
              <option value="deposit">게임 예치 (차감)</option>
              <option value="payout">게임 보상 (지급)</option>
              <option value="refund">무효 반환</option>
              <option value="fee">운영 수수료</option>
              <option value="admin_adjust">관리자 조정</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">처리 상태</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 상태</option>
              <option value="completed">정상 처리 완료</option>
              <option value="pending">처리 대기 중</option>
              <option value="failed">처리 실패</option>
              <option value="suspected_duplicate">중복 지급 의심 (검토 필요)</option>
            </select>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
          <button className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors">초기화</button>
          <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">조건 검색</button>
        </div>
      </Card>

      {/* Transaction List */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 font-bold">거래 일시 / ID</th>
                <th className="px-5 py-4 font-bold">회원 정보</th>
                <th className="px-5 py-4 font-bold">관련 게임 ID</th>
                <th className="px-5 py-4 font-bold text-center">유형 / 상태</th>
                <th className="px-5 py-4 font-bold text-right">변동 포인트</th>
                <th className="px-5 py-4 font-bold text-right">잔액</th>
                <th className="px-5 py-4 font-bold">적요 (메모)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_TRANSACTIONS.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <div className="text-xs font-medium text-gray-900">{tx.time}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{tx.id}</div>
                  </td>
                  <td className="px-5 py-3">
                    {tx.userId === 'SYSTEM' ? (
                      <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded">SYSTEM (수수료)</span>
                    ) : (
                      <>
                        <div className="text-sm font-bold text-gray-900">{tx.nickname}</div>
                        <div className="text-[10px] text-gray-500 font-mono">{tx.userId}</div>
                      </>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {tx.relatedGameId ? (
                      <span className="text-xs font-mono font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded cursor-pointer hover:bg-blue-100 transition-colors">
                        {tx.relatedGameId}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        tx.type === 'deposit' ? 'bg-gray-100 text-gray-700' :
                        tx.type === 'payout' ? 'bg-indigo-100 text-indigo-700' :
                        tx.type === 'admin_adjust' ? 'bg-orange-100 text-orange-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {tx.type}
                      </span>
                      {tx.status === 'completed' && <span className="text-[10px] text-green-600 font-medium flex items-center"><CheckCircle2 className="w-3 h-3 mr-0.5" /> 완료</span>}
                      {tx.status === 'suspected_duplicate' && <span className="text-[10px] text-red-600 font-bold flex items-center"><AlertTriangle className="w-3 h-3 mr-0.5" /> 중복 의심</span>}
                    </div>
                  </td>
                  <td className={`px-5 py-3 text-right font-bold ${tx.amount > 0 ? 'text-green-600' : tx.amount < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()} P
                  </td>
                  <td className="px-5 py-3 text-right font-medium text-gray-900">
                    {tx.balanceAfter.toLocaleString()} P
                  </td>
                  <td className="px-5 py-3 text-xs text-gray-600 max-w-[200px] truncate">
                    {tx.note}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-600 font-medium">총 6건 중 1-6 표시</span>
          <div className="flex gap-1">
            <button className="p-1 rounded-md bg-white border border-gray-200 text-gray-400 disabled:opacity-50" disabled><ChevronLeft className="w-5 h-5" /></button>
            <button className="px-3 py-1 rounded-md bg-blue-600 text-white text-sm font-bold shadow-sm">1</button>
            <button className="p-1 rounded-md bg-white border border-gray-200 text-gray-400 disabled:opacity-50" disabled><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
      </Card>

      {/* Point Adjustment Modal */}
      {showAdjustmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">포인트 수동 조정</h2>
                <p className="text-sm text-red-500 font-medium mt-1">주의: 포인트 증감은 새로운 거래(admin_adjust)를 생성하며 영구 기록됩니다.</p>
              </div>
              <button onClick={() => setShowAdjustmentModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4 text-sm">
              <div>
                <label className="block text-gray-700 font-medium mb-1.5">대상 회원 ID (또는 닉네임) <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" placeholder="회원을 검색하세요" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">증감 구분 <span className="text-red-500">*</span></label>
                  <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
                    <option value="increase">증가 (지급 +)</option>
                    <option value="decrease">차감 (회수 -)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">조정 포인트 <span className="text-red-500">*</span></label>
                  <input type="number" placeholder="0" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow text-right font-mono" />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1.5">관련 게임 ID (선택)</label>
                <input type="text" placeholder="예: GM-9182A" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow font-mono" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1.5">조정 사유 및 관리자 메모 (내부용) <span className="text-red-500">*</span></label>
                <textarea placeholder="시스템 오류 보상, 어뷰징 적발 몰수 등 명확한 사유를 기재하세요." className="w-full h-20 bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-shadow" />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-gray-700 font-medium mb-1.5">관리자 비밀번호 재확인 <span className="text-red-500">*</span></label>
                <input type="password" placeholder="권한 확인을 위해 비밀번호를 입력하세요" className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-900 outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-shadow" />
              </div>
            </div>
            
            <div className="mt-8 flex gap-3">
              <button 
                onClick={() => setShowAdjustmentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
              >
                취소
              </button>
              <button className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                포인트 조정 실행
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
