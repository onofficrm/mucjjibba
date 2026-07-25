import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, AlertTriangle, MessageSquare, ShieldOff, Gamepad2, Users, FileText, CheckCircle2, X
} from 'lucide-react';

type ReportType = 'abusive_chat' | 'spam' | 'disconnect' | 'macro' | 'multi_account' | 'manipulation' | 'other';
type ReportStatus = 'received' | 'reviewing' | 'need_info' | 'resolved' | 'dismissed';

interface Report {
  id: string;
  gameId: string | null;
  reporter: string;
  target: string;
  type: ReportType;
  reason: string;
  status: ReportStatus;
  pointStatus: 'pending' | 'refunded' | 'maintained';
  createdAt: string;
}

const MOCK_REPORTS: Report[] = [
  { id: 'RPT-1004', gameId: 'GM-9182A', reporter: '초보게이머', target: '아레나마스터', type: 'abusive_chat', reason: '게임 중에 계속 조롱하고 심한 욕설을 했습니다.', status: 'received', pointStatus: 'maintained', createdAt: '2023.10.25 14:40:00' },
  { id: 'RPT-1003', gameId: 'GM-9182E', reporter: '억울한패배', target: '매크로의심', type: 'macro', reason: '시작하자마자 0.1초만에 반응해서 5번 연속 이겼습니다. 매크로 조사해주세요.', status: 'reviewing', pointStatus: 'pending', createdAt: '2023.10.25 13:55:00' },
  { id: 'RPT-1002', gameId: 'GM-9170X', reporter: '진지한겜머', target: '랜뽑장인', type: 'disconnect', reason: '자기가 질 것 같으니까 네트워크 연결을 끊어버렸습니다.', status: 'resolved', pointStatus: 'refunded', createdAt: '2023.10.25 11:20:00' },
  { id: 'RPT-1001', gameId: null, reporter: '관찰자', target: '포인트복사기', type: 'manipulation', reason: '승패조작기라는 아이디랑 계속 번갈아가며 져주고 있습니다.', status: 'need_info', pointStatus: 'pending', createdAt: '2023.10.24 20:10:00' },
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminReportsPage() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showActionModal, setShowActionModal] = useState(false);

  const getReportTypeName = (type: ReportType) => {
    switch(type) {
      case 'abusive_chat': return '욕설 / 비방';
      case 'spam': return '도배 / 광고';
      case 'disconnect': return '고의 연결 종료';
      case 'macro': return '부정 게임 의심 (매크로)';
      case 'multi_account': return '다중 계정 의심';
      case 'manipulation': return '승패 조작 의심';
      case 'other': return '기타';
    }
  };

  if (selectedReport) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedReport(null)} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">분쟁 및 신고 상세</h1>
          </div>
          <button 
            onClick={() => setShowActionModal(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
          >
            신고 처리 및 조치
          </button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="space-y-6 xl:col-span-1">
            <Card>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedReport.id}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedReport.status === 'received' ? 'bg-red-100 text-red-700' :
                    selectedReport.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                    selectedReport.status === 'need_info' ? 'bg-orange-100 text-orange-700' :
                    selectedReport.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedReport.status === 'received' ? '접수' :
                     selectedReport.status === 'reviewing' ? '검토 중' :
                     selectedReport.status === 'need_info' ? '추가 정보 필요' :
                     selectedReport.status === 'resolved' ? '처리 완료' : '기각'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">신고 일시: <span className="font-medium text-gray-900">{selectedReport.createdAt}</span></div>
              </div>

              <div className="space-y-5">
                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="text-center flex-1">
                    <div className="text-xs text-gray-500 mb-1">신고자</div>
                    <div className="text-sm font-bold text-blue-600">{selectedReport.reporter}</div>
                  </div>
                  <div className="text-gray-300 font-bold px-2">▶</div>
                  <div className="text-center flex-1">
                    <div className="text-xs text-red-500 font-bold mb-1">피신고자 (대상)</div>
                    <div className="text-sm font-bold text-red-600">{selectedReport.target}</div>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">신고 유형</div>
                  <div className="text-sm font-bold text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded">
                    {getReportTypeName(selectedReport.type)}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">신고 내용 / 분쟁 사유</div>
                  <div className="text-sm text-gray-800 bg-red-50/50 p-3 rounded-lg border border-red-100">
                    {selectedReport.reason}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">포인트 처리 상태</div>
                  <div className="text-sm font-medium">
                    {selectedReport.pointStatus === 'pending' ? <span className="text-yellow-600">지급 보류 (검토 중)</span> :
                     selectedReport.pointStatus === 'refunded' ? <span className="text-blue-600">반환 완료</span> :
                     <span className="text-green-600">정상 지급 완료</span>}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column */}
          <div className="xl:col-span-2 space-y-6">
            {selectedReport.gameId ? (
              <Card className="h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center">
                    <Gamepad2 className="w-4 h-4 mr-2 text-gray-500" /> 관련 게임 정보 및 로그
                  </h3>
                  <button className="text-xs text-indigo-600 font-bold hover:underline">게임 상세 페이지로 이동</button>
                </div>
                
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-sm font-bold text-gray-900 mb-1">게임 ID: {selectedReport.gameId}</div>
                  <div className="text-xs text-gray-500 mb-3">테이블: 골드 (50,000 P) | 상태: 조사 중</div>
                  
                  <div className="flex justify-center items-center gap-4 mb-2">
                    <span className="font-bold text-blue-700">{selectedReport.reporter}</span>
                    <span className="text-xs bg-gray-200 px-2 rounded-full">VS</span>
                    <span className="font-bold text-red-700">{selectedReport.target}</span>
                  </div>
                </div>

                <div className="flex-1 bg-gray-900 rounded-lg p-4 font-mono text-xs text-gray-300 overflow-y-auto min-h-[200px]">
                  <div className="text-gray-500 mb-2">// 해당 게임의 시스템/채팅 로그 내역입니다.</div>
                  {selectedReport.type === 'macro' ? (
                    <>
                      <div className="flex gap-2"><span className="text-blue-400">[13:50:20.100]</span><span>Round 1 Start. Turn: P1({selectedReport.reporter}).</span></div>
                      <div className="flex gap-2"><span className="text-red-400">[13:50:20.180]</span><span className="text-red-300">P2({selectedReport.target}) action received. (Left) - Response Time: 80ms</span></div>
                      <div className="flex gap-2"><span className="text-gray-500">[13:50:21.300]</span><span>P1({selectedReport.reporter}) action received. (Right)</span></div>
                      <div className="flex gap-2"><span className="text-blue-400">[13:50:22.000]</span><span>Round 2 Start.</span></div>
                      <div className="flex gap-2"><span className="text-red-400">[13:50:22.090]</span><span className="text-red-300">P2({selectedReport.target}) action received. (Up) - Response Time: 90ms</span></div>
                    </>
                  ) : selectedReport.type === 'abusive_chat' ? (
                    <>
                      <div className="flex gap-2"><span className="text-blue-400">[14:35:10.000]</span><span>Round 1 Result: P2 Win</span></div>
                      <div className="flex gap-2"><span className="text-red-400">[CHAT] {selectedReport.target}:</span><span className="text-white">ㅋㅋ 개못하네 접어라</span></div>
                      <div className="flex gap-2"><span className="text-blue-400">[CHAT] {selectedReport.reporter}:</span><span className="text-gray-400">? 매너좀요</span></div>
                      <div className="flex gap-2"><span className="text-red-400">[CHAT] {selectedReport.target}:</span><span className="text-white">응 니 실력 벌레~ *******</span></div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 mt-10">게임 로그가 존재하지 않거나 만료되었습니다.</div>
                  )}
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center flex-col text-gray-500">
                <FileText className="w-8 h-8 mb-2 text-gray-300" />
                <p>특정 게임과 연결되지 않은 일반 신고입니다.</p>
              </Card>
            )}
          </div>
        </div>

        {/* Action Modal */}
        {showActionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-lg p-6 shadow-xl">
              <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">신고 및 분쟁 처리</h2>
                  <p className="text-sm text-gray-500 mt-1">관리자 판단에 따라 로그를 남기고 처리를 완료합니다.</p>
                </div>
                <button onClick={() => setShowActionModal(false)} className="text-gray-400 hover:text-gray-600 bg-gray-50 hover:bg-gray-100 p-2 rounded-lg transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-5 text-sm">
                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">신고 처리 상태 변경 <span className="text-red-500">*</span></label>
                  <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
                    <option value="reviewing">검토 중</option>
                    <option value="need_info">추가 정보 필요</option>
                    <option value="resolved">처리 완료 (제재 적용)</option>
                    <option value="dismissed">기각 (무혐의/증거 불충분)</option>
                  </select>
                </div>

                {selectedReport.gameId && (
                  <div>
                    <label className="block text-gray-700 font-medium mb-1.5">관련 게임 포인트 처리 <span className="text-red-500">*</span></label>
                    <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
                      <option value="pending">현재 상태 유지 (보류)</option>
                      <option value="refund">게임 무효 및 양측 포인트 반환</option>
                      <option value="reporter_win">신고자 승리 처리 (포인트 지급)</option>
                      <option value="target_win">피신고자 승리 처리 (포인트 지급)</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">피신고자 제재 (선택사항)</label>
                  <div className="flex gap-2">
                    <select className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
                      <option value="none">제재 없음</option>
                      <option value="chat_ban">채팅 금지</option>
                      <option value="suspend">게임 이용 정지</option>
                      <option value="ban">영구 정지</option>
                    </select>
                    <select className="w-1/3 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-shadow">
                      <option value="1">1일</option>
                      <option value="3">3일</option>
                      <option value="7">7일</option>
                      <option value="perm">무기한</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1.5">관리자 판단 및 결과 요약 (사용자 알림용) <span className="text-red-500">*</span></label>
                  <textarea placeholder="신고자에게 안내될 처리 결과입니다." className="w-full h-20 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-gray-900 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none transition-shadow" />
                </div>
              </div>
              
              <div className="mt-8 flex gap-3">
                <button 
                  onClick={() => setShowActionModal(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  취소
                </button>
                <button className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors shadow-sm">
                  처리 완료
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
          <h1 className="text-2xl font-bold text-gray-900">신고 및 분쟁 관리</h1>
          <p className="text-sm text-gray-500 mt-1">사용자 간의 신고 내역과 게임 분쟁을 검토하고 처리합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="!p-5 bg-red-50/50 border-red-100">
          <div className="text-sm font-bold text-red-800 mb-1">신규 접수</div>
          <div className="text-2xl font-black text-red-600">12 건</div>
        </Card>
        <Card className="!p-5 bg-yellow-50/50 border-yellow-100">
          <div className="text-sm font-bold text-yellow-800 mb-1">검토 중</div>
          <div className="text-2xl font-black text-yellow-600">5 건</div>
        </Card>
        <Card className="!p-5 bg-orange-50/50 border-orange-100">
          <div className="text-sm font-bold text-orange-800 mb-1">지급 보류 (분쟁)</div>
          <div className="text-2xl font-black text-orange-600">3 건</div>
        </Card>
        <Card className="!p-5">
          <div className="text-sm font-bold text-gray-600 mb-1">오늘 처리 완료</div>
          <div className="text-2xl font-black text-gray-900">42 건</div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="!p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">신고 상태</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="active">미처리 전체 (접수+검토)</option>
              <option value="received">접수</option>
              <option value="reviewing">검토 중</option>
              <option value="resolved">처리 완료</option>
              <option value="all">전체</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">신고 유형</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 유형</option>
              <option value="abusive_chat">욕설 / 비방</option>
              <option value="macro">부정 게임 / 매크로</option>
              <option value="disconnect">고의 연결 종료</option>
              <option value="manipulation">승패 조작</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1.5">검색 (ID, 게임, 사유)</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="검색어를 입력하세요" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      </Card>

      {/* List */}
      <Card className="!p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-5 py-4 font-bold">상태</th>
                <th className="px-5 py-4 font-bold">신고 일시 / ID</th>
                <th className="px-5 py-4 font-bold">유형 / 관련 게임</th>
                <th className="px-5 py-4 font-bold text-center">신고자 → 대상</th>
                <th className="px-5 py-4 font-bold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                      report.status === 'received' ? 'bg-red-100 text-red-700' :
                      report.status === 'reviewing' ? 'bg-yellow-100 text-yellow-700' :
                      report.status === 'need_info' ? 'bg-orange-100 text-orange-700' :
                      report.status === 'resolved' ? 'bg-green-100 text-green-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {report.status === 'received' ? '접수' :
                       report.status === 'reviewing' ? '검토 중' :
                       report.status === 'need_info' ? '추가 정보 필요' :
                       report.status === 'resolved' ? '처리 완료' : '기각'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-gray-600 font-medium">{report.createdAt}</div>
                    <div className="text-[10px] text-gray-400 font-mono mt-0.5">{report.id}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900">{getReportTypeName(report.type)}</div>
                    {report.gameId && <div className="text-xs font-mono text-indigo-600 bg-indigo-50 inline-block px-1.5 rounded mt-1">{report.gameId}</div>}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="font-medium text-blue-700 max-w-[80px] truncate">{report.reporter}</span>
                      <span className="text-gray-400 text-xs">▶</span>
                      <span className="font-bold text-red-700 max-w-[80px] truncate">{report.target}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setSelectedReport(report)}
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
      </Card>
    </div>
  );
}
