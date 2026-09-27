# Seojin An · Portfolio

[love09010224.github.io](https://love09010224.github.io)

따뜻한 아이보리·베이지 톤의 개인 포트폴리오. Astro + TypeScript로 생성하는 정적 사이트이며, 블로그는 [Velog](https://velog.io/@love09010224)로 연결합니다.

## 로컬 실행

Node.js 24 권장 (최소 22.12).

```sh
npm ci 
npm run dev
```

## 프로젝트 추가

`src/data/portfolio.ts`의 `projects` 배열에 항목을 추가하면 됩니다.
왼쪽 영역은 각 항목의 `art`에서 따로 설정합니다.

```ts
{
  name: '프로젝트 이름',
  subtitle: '간단한 소개',
  year: '2026',
  role: '',
  description: '프로젝트 설명',
  url: '',
  art: {
    title: '왼쪽 제목\n두 번째 줄', // \n으로 줄바꿈
    caption: 'PROJECT CATEGORY',
    icon: 'code',
  },
},
```

- `art`를 생략하면 프로젝트 이름·소개와 `code` 아이콘을 사용합니다.
- `caption: ''`이면 왼쪽 하단 문구를 숨깁니다.
- 아이콘 예: `code`, `shield`, `lock`, `terminal`, `book`, `flag`, `users`.
  전체 목록은 `src/data/icons.ts`에서 확인할 수 있습니다.
- `role`, `description`, `url`은 빈 문자열이면 표시하지 않습니다.

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
