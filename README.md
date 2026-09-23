# Seojin An · Portfolio

[love09010224.github.io](https://love09010224.github.io)

따뜻한 아이보리·베이지 톤의 개인 포트폴리오. Astro + TypeScript로 생성하는 정적 사이트이며, 블로그는 [Velog](https://velog.io/@love09010224)로 연결합니다.

## 로컬 실행

Node.js 24 권장 (최소 22.12).

```sh
npm ci 
npm run dev
```

## 검증

```sh
npm run check
npm run build
npx playwright install chromium
npm test
```

배포된 사이트를 같은 테스트로 확인할 수도 있습니다.

```sh
BASE_URL=https://love09010224.github.io npm test
```

## 배포

GitHub Pages Source는 **GitHub Actions**를 사용합니다. `main`에 push하면 `.github/workflows/deploy.yml`에서 타입 검사 → 정적 빌드 → 브라우저 테스트가 성공한 뒤 배포합니다. Pull request에서는 검증만 수행합니다.
