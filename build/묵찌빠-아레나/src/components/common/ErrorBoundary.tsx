import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message?: string;
}

/** 렌더 예외로 인한 흰 화면을 막고 복구 경로를 제공하는 전역 폴백 */
export class ErrorBoundary extends Component<Props, State> {
  // 이 프로젝트에는 @types/react가 없어 클래스 필드를 명시적으로 선언
  declare props: Props;
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : undefined,
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  private handleReload = () => {
    window.location.hash = '#/lobby';
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="flex h-[100dvh] flex-col items-center justify-center gap-5 bg-arena-bg px-8 text-center text-arena-text">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-3xl">
          ✊
        </div>
        <div className="space-y-1.5">
          <p className="text-lg font-black text-white">잠시 문제가 발생했어요</p>
          <p className="text-sm text-arena-text-muted">
            화면을 다시 불러오면 계속 이용할 수 있습니다.
          </p>
        </div>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-xl bg-arena-gold px-6 py-3 text-sm font-black text-black transition-colors hover:bg-arena-gold-light"
        >
          다시 시작
        </button>
      </div>
    );
  }
}
