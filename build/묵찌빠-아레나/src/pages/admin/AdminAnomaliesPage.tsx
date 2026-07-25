import React, { useState } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, ShieldAlert, AlertTriangle, Activity, MonitorSmartphone, Users, History, FileText, CheckCircle2, X
} from 'lucide-react';

type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
type ReviewStatus = 'pending' | 'reviewing' | 'resolved' | 'ignored';

interface Anomaly {
  id: string;
  detectedAt: string;
  userId: string;
  nickname: string;
  reason: string;
  riskLevel: RiskLevel;
  status: ReviewStatus;
}

const MOCK_ANOMALIES: Anomaly[] = [
  { id: 'AN-8821', detectedAt: '2023.10.25 14:10:00', userId: 'USR-1C4D', nickname: '매크로의심', reason: '비정상적으로 빠른 선택 (평균 0.1초)', riskLevel: 'high', status: 'reviewing' },
  { id: 'AN-8820', detectedAt: '2023.10.25 13:45:20', userId: 'USR-8A2F', nickname: '아레나마스터', reason: '동일 IP에서 다중 계정 접속', riskLevel: 'critical', status: 'pending' },
  { id: 'AN-8819', detectedAt: '2023.10.25 12:30:15', userId: 'USR-5X9T', nickname: '포인트복사기', reason: '특정 사용자(승패조작기)와 반복 대전 및 승패 교환', riskLevel: 'critical', status: 'pending' },
  { id: 'AN-8818', detectedAt: '2023.10.25 10:15:00', userId: 'USR-7U2W', nickname: '랜뽑장인', reason: '게임 중 반복적인 연결 종료 (최근 10게임 중 8회)', riskLevel: 'medium', status: 'pending' },
  { id: 'AN-8817', detectedAt: '2023.10.24 23:50:00', userId: 'USR-9P1M', nickname: '신규부자', reason: '신규 계정 간 반복 고액 대전', riskLevel: 'high', status: 'resolved' },
  { id: 'AN-8816', detectedAt: '2023.10.24 18:20:00', userId: 'USR-2K4J', nickname: '욕쟁이', reason: '신고가 누적된 사용자 (최근 3일 15건)', riskLevel: 'low', status: 'ignored' },
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className}`}>
      {children}
    </div>
  );
}

export function AdminAnomaliesPage() {
  const [selectedAnomaly, setSelectedAnomaly] = useState<Anomaly | null>(null);

  if (selectedAnomaly) {
    return (
      <div className="space-y-6 font-sans">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedAnomaly(null)} 
              className="p-2 -ml-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">이상 이용 상세 정보</h1>
          </div>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm font-medium rounded-lg transition-colors shadow-sm">
              정상 처리 (오탐)
            </button>
            <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm">
              제재 및 상태 변경
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <div className="mb-6 pb-6 border-b border-gray-100">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-xl font-bold text-gray-900">{selectedAnomaly.id}</h2>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                    selectedAnomaly.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                    selectedAnomaly.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                    selectedAnomaly.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {selectedAnomaly.riskLevel === 'critical' ? '매우 높음' : 
                     selectedAnomaly.riskLevel === 'high' ? '높음' : 
                     selectedAnomaly.riskLevel === 'medium' ? '보통' : '낮음'}
                  </span>
                </div>
                <div className="text-sm text-gray-500">탐지 일시: <span className="font-medium text-gray-900">{selectedAnomaly.detectedAt}</span></div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">대상 사용자</div>
                  <div className="text-sm font-bold text-gray-900">{selectedAnomaly.nickname} <span className="text-gray-500 font-normal">({selectedAnomaly.userId})</span></div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">의심 사유 (탐지 규칙)</div>
                  <div className="text-sm font-medium text-red-600 bg-red-50 p-2 rounded border border-red-100">
                    {selectedAnomaly.reason}
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-gray-500 mb-1">검토 상태</div>
                  <select 
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    defaultValue={selectedAnomaly.status}
                  >
                    <option value="pending">대기 중</option>
                    <option value="reviewing">검토 중</option>
                    <option value="resolved">처리 완료 (제재 적용)</option>
                    <option value="ignored">기각 (정상)</option>
                  </select>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <MonitorSmartphone className="w-4 h-4 mr-2 text-gray-500" /> 네트워크 및 환경 정보
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500">관련 IP</span>
                  <span className="text-gray-900 font-mono font-medium text-xs bg-gray-100 px-1.5 py-0.5 rounded">192.168.1.45 (한국)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-gray-50">
                  <span className="text-gray-500">관련 기기</span>
                  <span className="text-gray-900 font-medium">Windows 11, Chrome</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-gray-500">연관 계정 수 (동일 IP)</span>
                  <span className="text-red-600 font-bold">3개</span>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <Activity className="w-4 h-4 mr-2 text-gray-500" /> 이상 활동 지표
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">반복 대전 횟수</div>
                  <div className="text-lg font-bold text-gray-900">12회 <span className="text-xs text-gray-500 font-normal">/ 1시간</span></div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">포인트 이동량</div>
                  <div className="text-lg font-bold text-indigo-600">450,000 P</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">평균 선택 시간</div>
                  <div className="text-lg font-bold text-red-600">0.12초</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">연결 종료 비율</div>
                  <div className="text-lg font-bold text-gray-900">45%</div>
                </div>
              </div>

              <h4 className="text-sm font-bold text-gray-900 mb-3">관련 의심 게임 목록</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-y border-gray-200">
                    <tr>
                      <th className="px-4 py-2 font-medium">게임 ID</th>
                      <th className="px-4 py-2 font-medium">일시</th>
                      <th className="px-4 py-2 font-medium text-center">상대방</th>
                      <th className="px-4 py-2 font-medium text-right">판돈</th>
                      <th className="px-4 py-2 font-medium text-center">결과</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600 cursor-pointer">GM-9182</td>
                      <td className="px-4 py-2 text-xs text-gray-500">14:10:00</td>
                      <td className="px-4 py-2 text-center">승패조작기</td>
                      <td className="px-4 py-2 text-right">50,000</td>
                      <td className="px-4 py-2 text-center text-green-600 font-bold">승리</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600 cursor-pointer">GM-9181</td>
                      <td className="px-4 py-2 text-xs text-gray-500">14:08:15</td>
                      <td className="px-4 py-2 text-center">승패조작기</td>
                      <td className="px-4 py-2 text-right">50,000</td>
                      <td className="px-4 py-2 text-center text-red-600 font-bold">패배</td>
                    </tr>
                    <tr className="hover:bg-gray-50">
                      <td className="px-4 py-2 font-mono text-blue-600 cursor-pointer">GM-9180</td>
                      <td className="px-4 py-2 text-xs text-gray-500">14:05:30</td>
                      <td className="px-4 py-2 text-center">승패조작기</td>
                      <td className="px-4 py-2 text-right">50,000</td>
                      <td className="px-4 py-2 text-center text-green-600 font-bold">승리</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>

            <Card>
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2 text-gray-500" /> 관리자 메모 및 조치 기록
              </h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                  <div className="px-4 py-3 border-b border-gray-200 text-xs font-bold text-gray-700 flex justify-between items-center bg-white">
                    <span>과거 제재 내역</span>
                  </div>
                  <div className="p-4">
                    <div className="text-sm text-gray-600 flex items-center">
                      <CheckCircle2 className="w-4 h-4 mr-2 text-green-500" /> 과거 제재 내역이 없습니다.
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1.5">조사 메모 작성</label>
                  <textarea 
                    className="w-full h-24 bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none transition-shadow" 
                    placeholder="조사 내용이나 특이사항을 기록하세요."
                  ></textarea>
                  <div className="mt-2 flex justify-end">
                    <button className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition-colors">
                      메모 저장
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">이상 이용 탐지</h1>
          <p className="text-sm text-gray-500 mt-1">부정 이용, 다중 계정, 승패 조작 의심 사례를 모니터링합니다.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="!p-5 border-red-200 bg-red-50/30">
          <div className="text-sm font-bold text-red-800 mb-1">매우 높음 (Critical)</div>
          <div className="text-2xl font-black text-red-600">2 건</div>
        </Card>
        <Card className="!p-5 border-orange-200 bg-orange-50/30">
          <div className="text-sm font-bold text-orange-800 mb-1">높음 (High)</div>
          <div className="text-2xl font-black text-orange-600">5 건</div>
        </Card>
        <Card className="!p-5 border-yellow-200 bg-yellow-50/30">
          <div className="text-sm font-bold text-yellow-800 mb-1">보통 (Medium)</div>
          <div className="text-2xl font-black text-yellow-600">12 건</div>
        </Card>
        <Card className="!p-5">
          <div className="text-sm font-bold text-gray-600 mb-1">검토 대기 중</div>
          <div className="text-2xl font-black text-gray-900">8 건</div>
        </Card>
      </div>

      {/* Filter */}
      <Card className="!p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">위험도</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체</option>
              <option value="critical">매우 높음</option>
              <option value="high">높음</option>
              <option value="medium">보통</option>
              <option value="low">낮음</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">탐지 유형</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="all">전체 유형</option>
              <option value="multi_account">다중 계정 (IP/기기)</option>
              <option value="manipulation">승패 조작 의심</option>
              <option value="macro">매크로 의심 (빠른 선택)</option>
              <option value="abuse">어뷰징 (비정상 포인트/종료)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">처리 상태</label>
            <select className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
              <option value="pending">대기 중</option>
              <option value="reviewing">검토 중</option>
              <option value="resolved">처리 완료</option>
              <option value="all">전체 상태</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1.5">검색</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="회원 ID/닉네임" className="w-full bg-white border border-gray-300 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
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
                <th className="px-5 py-4 font-bold">위험도 / 상태</th>
                <th className="px-5 py-4 font-bold">탐지 일시</th>
                <th className="px-5 py-4 font-bold">대상 회원</th>
                <th className="px-5 py-4 font-bold">의심 사유 (탐지 규칙)</th>
                <th className="px-5 py-4 font-bold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {MOCK_ANOMALIES.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex flex-col gap-1.5 items-start">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        item.riskLevel === 'critical' ? 'bg-red-100 text-red-700' :
                        item.riskLevel === 'high' ? 'bg-orange-100 text-orange-700' :
                        item.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {item.riskLevel === 'critical' ? '매우 높음' : item.riskLevel === 'high' ? '높음' : item.riskLevel === 'medium' ? '보통' : '낮음'}
                      </span>
                      <span className={`text-[10px] font-bold ${
                        item.status === 'pending' ? 'text-gray-500' :
                        item.status === 'reviewing' ? 'text-blue-600' :
                        item.status === 'resolved' ? 'text-green-600' : 'text-gray-400'
                      }`}>
                        {item.status === 'pending' ? '대기 중' : item.status === 'reviewing' ? '검토 중' : item.status === 'resolved' ? '처리 완료' : '기각됨'}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-xs text-gray-600 font-medium">{item.detectedAt}</td>
                  <td className="px-5 py-4">
                    <div className="font-bold text-gray-900">{item.nickname}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5">{item.userId}</div>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-red-600 bg-red-50 inline-block px-2 py-1 rounded border border-red-100 max-w-md truncate">
                      {item.reason}
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button 
                      onClick={() => setSelectedAnomaly(item)}
                      className="text-xs font-medium bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                    >
                      조사하기
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
