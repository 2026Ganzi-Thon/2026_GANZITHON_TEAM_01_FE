# ganzi_thon

Vite + React + TypeScript 웹 개발 기본 프로젝트입니다.

## 시작하기

Node.js 22.12 이상을 사용하세요.

```sh
npm install
npm run dev
```

표시되는 로컬 주소로 접속하세요. PowerShell 실행 정책 오류가 나면 `npm` 대신 `npm.cmd`를 사용하세요.

## 명령어

- `npm run dev`: 개발 서버 및 변경 사항 자동 반영
- `npm run build`: 타입 검사 후 배포용 dist/ 생성
- `npm run preview`: 빌드 결과 미리보기
- `npm run lint`: Oxlint 코드 검사
- `npm run typecheck`: TypeScript 타입 검사

## 주요 파일

- src/App.tsx: 시작 화면
- src/App.css: 화면 스타일
- src/index.css: 전역 스타일
- src/main.tsx: React 진입점
- vite.config.ts: Vite 설정
- tsconfig.app.json: strict 모드 TypeScript 설정

환경 변수는 .env.local에 작성하고 브라우저용 변수에는 VITE_ 접두사를 붙이세요. VITE_ 변수는 공개되므로 비밀 키를 넣지 마세요.
