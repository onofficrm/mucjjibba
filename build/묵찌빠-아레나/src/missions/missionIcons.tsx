import React from 'react';
import {
  Target,
  Eye,
  Clock,
  Hand,
  Book,
  MessageSquare,
  FileText,
  Users,
  Trophy,
  Settings,
  Share2,
  Brain,
  Flame,
} from 'lucide-react';
import type { MissionIconKey } from '@/types/mission';

const CLASS = 'w-5 h-5';

export function MissionIcon({ name, className = CLASS }: { name: MissionIconKey; className?: string }) {
  switch (name) {
    case 'target':
      return <Target className={`${className} text-blue-400`} />;
    case 'eye':
      return <Eye className={`${className} text-purple-400`} />;
    case 'clock':
      return <Clock className={`${className} text-amber-400`} />;
    case 'hands':
      return <Hand className={`${className} text-pink-400`} />;
    case 'book':
      return <Book className={`${className} text-arena-cyan`} />;
    case 'message':
      return <MessageSquare className={`${className} text-yellow-400`} />;
    case 'file':
      return <FileText className={`${className} text-green-400`} />;
    case 'users':
      return <Users className={`${className} text-indigo-400`} />;
    case 'trophy':
      return <Trophy className={`${className} text-arena-gold`} />;
    case 'settings':
      return <Settings className={`${className} text-gray-300`} />;
    case 'share':
      return <Share2 className={`${className} text-arena-cyan`} />;
    case 'brain':
      return <Brain className={`${className} text-violet-300`} />;
    case 'flame':
      return <Flame className={`${className} text-orange-400`} />;
    default:
      return <Target className={`${className} text-arena-cyan`} />;
  }
}
