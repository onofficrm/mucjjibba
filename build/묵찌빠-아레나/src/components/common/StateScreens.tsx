import React from 'react';
import { Loader2, AlertCircle, WifiOff, ShieldAlert, Lock, Wrench, RefreshCw, Database } from 'lucide-react';

interface StateProps {
  message?: string;
  onRetry?: () => void;
}

export function LoadingState({ message = '데이터를 불러오는 중입니다...' }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <Loader2 className="w-8 h-8 animate-spin mb-4 text-indigo-600" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function EmptyState({ message = '데이터가 없습니다.' }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <Database className="w-12 h-12 mb-4 text-gray-300" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function ServerErrorState({ message = '서버 오류가 발생했습니다.', onRetry }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <AlertCircle className="w-12 h-12 mb-4 text-red-500" />
      <p className="text-sm font-bold text-gray-900 mb-2">오류 발생</p>
      <p className="text-sm font-medium mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> 다시 시도
        </button>
      )}
    </div>
  );
}

export function NetworkErrorState({ message = '네트워크 연결이 불안정합니다.', onRetry }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <WifiOff className="w-12 h-12 mb-4 text-orange-500" />
      <p className="text-sm font-bold text-gray-900 mb-2">연결 오류</p>
      <p className="text-sm font-medium mb-4">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-bold text-gray-700 transition-colors">
          <RefreshCw className="w-4 h-4" /> 다시 시도
        </button>
      )}
    </div>
  );
}

export function NoPermissionState({ message = '접근 권한이 없습니다.' }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <ShieldAlert className="w-12 h-12 mb-4 text-red-500" />
      <p className="text-sm font-bold text-gray-900 mb-2">접근 거부</p>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function RestrictedState({ message = '이용이 제한된 계정입니다.' }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <Lock className="w-12 h-12 mb-4 text-gray-400" />
      <p className="text-sm font-bold text-gray-900 mb-2">이용 제한</p>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export function MaintenanceState({ message = '서버 점검 중입니다.' }: StateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-gray-500 min-h-[300px]">
      <Wrench className="w-12 h-12 mb-4 text-blue-500" />
      <p className="text-sm font-bold text-gray-900 mb-2">점검 중</p>
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}
