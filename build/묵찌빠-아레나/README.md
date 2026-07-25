<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

## 운영 문서

- [하우스 수수료 정책](./docs/HOUSE_FEE_POLICY.md) — 요율·테이블·공격 프리미엄 (수정 시 `src/game/houseFeePolicy.ts` 동기화)

View your app in AI Studio: https://ai.studio/apps/de310280-986d-4e9d-b480-9de26257348f

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`
