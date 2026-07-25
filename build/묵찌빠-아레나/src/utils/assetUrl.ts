/** GNU Board / builder-bridge 임베드 시 Vite `/assets/` 절대경로를 플러그인 URL로 보정 */

declare global {
  interface Window {
    __ONOFF_ASSET_BASE__?: string;
  }
}

export function resolveAssetUrl(url: string): string {
  if (!url) return url;
  if (
    url.startsWith('data:') ||
    url.startsWith('blob:') ||
    /^https?:\/\//i.test(url) ||
    url.startsWith('//')
  ) {
    return url;
  }

  const base =
    typeof window !== 'undefined' && window.__ONOFF_ASSET_BASE__
      ? window.__ONOFF_ASSET_BASE__
      : '';

  if (base && url.startsWith('/assets/')) {
    return `${base.replace(/\/?$/, '/')}${url.slice('/assets/'.length)}`;
  }

  return url;
}
