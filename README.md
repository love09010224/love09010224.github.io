# Seojin An · Portfolio

[love09010224.github.io](https://love09010224.github.io)

따뜻한 아이보리·베이지 톤의 개인 포트폴리오. Astro + TypeScript로 생성하는 정적 사이트이며, 블로그는 [Velog](https://velog.io/@love09010224)로 연결합니다.

## 로컬 실행

Node.js 24 권장 (최소 22.12).

```sh
npm ci
npm run dev
```

## 콘텐츠 수정

**`src/data/portfolio.ts`**에서 기술 목록, 학력, 수상 및 CTF 실적, CVE, 프로젝트, 근로·활동 이력을 수정합니다.

- 버비컴퍼니 직무: `work[0].role`
- 방탈출 CTF 역할: `projects[0].role`
- 프로젝트 설명·링크: `projects[0].description`, `projects[0].url`
- 비어 있는 직무·역할·설명·링크는 화면에 표시하지 않습니다.
- Home 소개 문구와 강조 항목: `src/pages/index.astro`
- 색상·간격·반응형 레이아웃: `src/styles/global.css`
- 초상 원본: `src/assets/portrait.png` (빌드 시 반응형 WebP 생성)

`loot/`의 원본 참고 자료는 그대로 보존하며 Git에 포함하지 않습니다. 사이트에 사용하는 웃는 초상만 별도로 복사했습니다.

## 페이지

| 주소 | 내용 |
| --- | --- |
| `/` | 소개, 관심 분야, 기술, 학력, 대표 성과 |
| `/achievements/` | 주요 실적 6개와 기타 실적 7개, CVE 2개, 프로젝트 |
| `/experience/` | 근로 및 활동 이력 |
| `/links/` | GitHub, Velog, CTFtime, Discord 복사 |

## 검증

```sh
npm run check
npm run build
npx playwright install chromium
npm test
```

Playwright는 데스크톱·모바일에서 내비게이션, 직접 접속/새로고침, 콘텐츠, 접근성(axe WCAG 2.1 AA), 320–1440px 가로 넘침, Discord 복사/실패 처리, 내부 링크와 404를 검사합니다. 화면 캡처는 `test-results/`에 저장합니다.

배포된 사이트를 같은 테스트로 확인할 수도 있습니다.

```sh
BASE_URL=https://love09010224.github.io npm test
```

## 배포

GitHub Pages Source는 **GitHub Actions**를 사용합니다. `main`에 push하면 `.github/workflows/deploy.yml`에서 타입 검사 → 정적 빌드 → 브라우저 테스트가 성공한 뒤 배포합니다. Pull request에서는 검증만 수행합니다.

## 콘텐츠 출처

- 소개·CTF 기록·연락처: [Velog About](https://velog.io/@love09010224/about), 2026-09-23 확인
- 학력·근로·활동 기간과 프로젝트명: 사용자 제공
- CVE 공개 상태와 대상: CVE Program 공개 레코드 확인
- CTFtime: [프로필 254082](https://ctftime.org/user/254082)
- 직무 및 프로젝트 역할은 의도적으로 빈 상태

글꼴은 로컬 번들로 제공하며 각 라이선스는 `public/licenses/`에 보관합니다. 아이콘은 Feather의 MIT 라이선스 도형을 바탕으로 구성했습니다.
