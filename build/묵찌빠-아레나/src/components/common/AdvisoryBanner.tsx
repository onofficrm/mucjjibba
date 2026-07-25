import React, { useState } from 'react';
import { Info, X } from 'lucide-react';

export function AdvisoryBanner() {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  return (
    <div className="bg-indigo-600 text-white px-4 py-2 text-xs md:text-sm flex items-center justify-between z-50 relative">
      <div className="flex items-center gap-2 mx-auto max-w-7xl w-full justify-center">
        <Info className="w-4 h-4 flex-shrink-0" />
        <span className="font-medium text-center">
          실제 운영 기능은 관련 허가와 정책 검토 및 승인된 백엔드 API 연결 후 활성화됩니다.
        </span>
      </div>
      <button 
        onClick={() => setVisible(false)}
        className="p-1 hover:bg-indigo-700 rounded transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
