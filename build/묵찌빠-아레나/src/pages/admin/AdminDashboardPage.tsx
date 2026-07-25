import React from 'react';
import { 
  Users, Gamepad2, Coins, Clock, AlertTriangle, 
  Activity, Server, CheckCircle2, XCircle, BarChart3, TrendingUp, AlertCircle
} from 'lucide-react';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const hourlyData = [
  { time: '00', users: 1200, games: 450, points: 5000 },
  { time: '04', users: 800, games: 300, points: 3000 },
  { time: '08', users: 2100, games: 800, points: 8500 },
  { time: '12', users: 3500, games: 1500, points: 15000 },
  { time: '16', users: 4200, games: 1900, points: 21000 },
  { time: '20', users: 5800, games: 2800, points: 32000 },
  { time: '24', users: 3100, games: 1200, points: 14000 },
];

const systemStatus = [
  { name: 'API 서버', status: 'normal', latency: '24ms' },
  { name: '실시간 게임 서버', status: 'normal', latency: '12ms' },
  { name: 'WebSocket 서버', status: 'warning', latency: '85ms' },
  { name: '데이터베이스', status: 'normal', latency: '4ms' },
  { name: 'Redis', status: 'normal', latency: '1ms' },
  { name: '포인트 원장', status: 'normal', latency: '18ms' },
  { name: '알림 서버', status: 'error', latency: 'Timeout' },
];

const recentActivity = [
  { id: 1, type: 'report', message: '신고 접수: 어뷰징 의심 사용자 (user_8812)', time: '5분 전', admin: 'system' },
  { id: 2, type: 'point', message: '포인트 조정: 토너먼트 보상 지급 오류 수정 (+50,000)', time: '12분 전', admin: 'admin_kr_1' },
  { id: 3, type: 'game', message: '고액 게임 감지: 다이아 테이블 500만 포인트 매칭', time: '18분 전', admin: 'system' },
  { id: 4, type: 'void', message: '게임 무효 처리: 서버 불안정으로 인한 게임 (g_9912) 무효', time: '1시간 전', admin: 'admin_master' },
  { id: 5, type: 'error', message: '시스템 오류: 알림 서버 연결 지연', time: '2시간 전', admin: 'system' },
];

function Card({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {children}
    </div>
  );
}

export function AdminDashboardPage() {
  return (
    <div className="space-y-6 pb-20 font-sans">
      
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-sm text-gray-500 mt-1">실시간 서비스 운영 지표 및 시스템 상태</p>
        </div>
        <div className="text-sm bg-white border border-gray-200 px-4 py-2 rounded-lg text-gray-500 shadow-sm">
          마지막 업데이트: <span className="text-gray-900 font-bold">방금 전</span>
        </div>
      </div>

      {/* Key Metrics - Row 1 (Realtime) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold">현재 접속자 수</span>
            <Users className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">5,842<span className="text-sm font-normal text-gray-500 ml-1">명</span></div>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold">현재 진행 중인 게임</span>
            <Gamepad2 className="w-5 h-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">1,204<span className="text-sm font-normal text-gray-500 ml-1">게임</span></div>
        </Card>
        
        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold">매칭 대기자 수</span>
            <Activity className="w-5 h-5 text-purple-500" />
          </div>
          <div className="text-3xl font-black text-gray-900">342<span className="text-sm font-normal text-gray-500 ml-1">명</span></div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-sm font-bold">서버 상태</span>
            <Server className="w-5 h-5 text-red-500" />
          </div>
          <div className="text-xl font-bold text-red-600 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" /> 주의 필요
          </div>
        </Card>
      </div>

      {/* Key Metrics - Row 2 (Today) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">오늘 완료된 게임</div>
          <div className="text-xl font-bold text-gray-900">24,512</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">오늘 무효 처리된 게임</div>
          <div className="text-xl font-bold text-red-500">42</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">오늘 총 참가 포인트</div>
          <div className="text-xl font-bold text-yellow-600">450M</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">오늘 총 지급 포인트</div>
          <div className="text-xl font-bold text-blue-600">432M</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">오늘 총 운영 수수료</div>
          <div className="text-xl font-bold text-purple-600">4.5M</div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">평균 매칭 시간 / 게임 시간</div>
          <div className="text-[10px] font-bold text-gray-900"><span className="text-sm">4.2초 / 1.5분</span></div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">재대결 비율 / 중도 이탈률</div>
          <div className="text-[10px] font-bold text-gray-900"><span className="text-sm">24% / 1.2%</span></div>
        </div>
        <div className="bg-white border border-gray-200 p-4 rounded-xl shadow-sm">
          <div className="text-xs text-gray-500 mb-1">신고 건수</div>
          <div className="text-xl font-bold text-red-500">156</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Charts */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" /> 시간대별 접속자 및 시간대별 게임 수
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={hourlyData}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorGames" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="right" orientation="right" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#111827' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Area yAxisId="left" type="monotone" dataKey="users" name="접속자 (명)" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area yAxisId="right" type="monotone" dataKey="games" name="게임 수" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGames)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-indigo-500" /> 포인트 이동량
            </h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis dataKey="time" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e5e7eb', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#111827' }}
                    cursor={{fill: '#f3f4f6'}}
                  />
                  <Bar dataKey="points" name="이동 포인트" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">매칭 성공률 / 매칭 실패율</h3>
              <div className="flex items-end justify-between mb-2">
                <div className="text-3xl font-black text-green-600">98.4%</div>
                <div className="text-sm font-bold text-red-500">실패율 1.6%</div>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.4%' }}></div>
              </div>
              <p className="text-xs text-gray-500">네트워크 종료율: 0.8%</p>
            </Card>
            
            <Card className="p-6">
              <h3 className="text-sm font-bold text-gray-900 mb-4">테이블별 이용률</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">브론즈 (1,000 P)</span>
                    <span className="font-bold text-gray-900">45%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-amber-700 h-1.5 rounded-full w-[45%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">실버 (5,000 P)</span>
                    <span className="font-bold text-gray-900">35%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-gray-400 h-1.5 rounded-full w-[35%]"></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-600">골드 (50,000 P)</span>
                    <span className="font-bold text-gray-900">15%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5"><div className="bg-yellow-500 h-1.5 rounded-full w-[15%]"></div></div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Side Panel (System Status & Activity) */}
        <div className="space-y-6">
          
          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <Server className="w-4 h-4 mr-2 text-gray-400" /> 시스템 상태
            </h3>
            <div className="space-y-3">
              {systemStatus.map((sys, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center">
                    {sys.status === 'normal' && <CheckCircle2 className="w-4 h-4 text-green-500 mr-2" />}
                    {sys.status === 'warning' && <AlertTriangle className="w-4 h-4 text-yellow-500 mr-2" />}
                    {sys.status === 'error' && <XCircle className="w-4 h-4 text-red-500 mr-2" />}
                    <span className="text-sm text-gray-700">{sys.name}</span>
                  </div>
                  <span className={`text-xs font-bold ${
                    sys.status === 'normal' ? 'text-gray-500' : 
                    sys.status === 'warning' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {sys.latency}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-gray-400" /> 최근 관리자 활동
            </h3>
            <div className="space-y-4">
              {recentActivity.map(act => (
                <div key={act.id} className="relative pl-4 border-l-2 border-gray-100">
                  <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white ${
                    act.type === 'error' ? 'bg-red-500' : 
                    act.type === 'void' ? 'bg-yellow-500' : 
                    act.type === 'point' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div className="text-xs text-gray-700 mb-1 leading-relaxed">
                    {act.message}
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>{act.time}</span>
                    <span>{act.admin}</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="w-full mt-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg text-xs font-bold text-gray-600 transition-colors">
              모든 활동 보기
            </button>
          </Card>

        </div>
      </div>
    </div>
  );
}
