# 🏎️ 슈퍼 카 스네이크: 해저드 런 (Super Car Snake: Hazard Run)

> 26×26 확장 경기장, 3종 특수 아이템(감속, 꼬리 단축, 5초 무적), 30초 후 분산 설치되는 도로 공사 차단벽을 돌파하는 웹 아케이드 주행 게임입니다.

![Game Preview](https://img.shields.io/badge/Game-Super_Car_Snake-amber?style=for-the-badge&logo=googlechrome)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_TypeScript_|_Tailwind_CSS_|_Vite-blue?style=for-the-badge)
![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)

---

## 🎮 게임 특징 및 시스템

1. **3배 확장 경기장 (26 × 26 그리드)**
   - 기존 15×15(225칸) 대비 **약 3.0배 넓어진 676칸**의 광활한 주행 필드.
   - 길어진 차체도 시원하게 코너링할 수 있는 충분한 공간 제공.

2. **무작위 3종 특수 아이템**
   - ❄️ **일시적 속도 감소 (Cooling Brake)**: 6초간 주행 속도 감속으로 좁은 구역 안전 코너링.
   - 🔧 **길이 3칸 감소 (Chassis Trim)**: 꼬리 3칸 즉시 제거 & 차체 경량화 (+30점 보너스).
   - 🛡️ **일시적 무적 5초 (Star Shield)**: 5초간 차체 주변에 에너지 방어막 가동. **몸통 충돌 및 차단벽 충돌 완전 무효화/돌파**.

3. **연료통 단계별 확장 시스템**
   - ⛽ **0 ~ 15개**: 초기 연료 2개 동시 출현
   - ⛽ **16 ~ 29개**: 연료 3개 동시 출현
   - ⛽ **30개 이상**: 연료 4개 동시 출현

4. **30초 도로 공사 차단벽 (5개 시작 ~ 최대 20개 분산)**
   - 주행 시간 30초 도달 시 5개의 차단벽 생성 경보 발령.
   - 이후 시간에 따라 최대 20개까지 분산 배치 (차단벽끼리 뭉치지 않는 밀집 방지 알고리즘 적용).
   - 5초 무적 쉴드 상태에서는 차단벽을 방어막으로 파괴하며 통과 가능.

5. **레트로 아케이드 Web Audio 사운드 & 모바일 터치 지원**
   - Web Audio API 내장 합성 사운드 (외부 오디오 파일 불필요).
   - 모바일 가상 D-패드 및 키보드 조작 지원.

---

## 🚀 빠른 시작 (Local Development)

### 1. 패키지 설치
```bash
npm install
```

### 2. 로컬 개발 서버 실행
```bash
npm run dev
```
브라우저에서 `http://localhost:3000` 접속

### 3. 프로덕션 빌드
```bash
npm run build
```

---

## 📦 GitHub에 프로젝트 올리는 방법

바탕화면에 생성된 `game` 폴더에서 터미널(또는 Git Bash / 명령 프롬프트)을 열고 아래 명령어를 순서대로 실행하세요:

```bash
# 1. git 초기화
git init

# 2. 모든 파일 스테이징
git add .

# 3. 첫 번째 커밋 생성
git commit -m "feat: Super Car Snake Hazard Run initial release"

# 4. 기본 브랜치 이름을 main으로 설정
git branch -M main

# 5. 본인의 GitHub 리포지토리 주소 연결
# (GitHub 웹사이트에서 새로 만든 리포지토리의 URL을 입력하세요)
git remote add origin https://github.com/당신의깃허브아이디/리포지토리이름.git

# 6. GitHub로 푸시
git push -u origin main
```

---

## 🌐 GitHub Pages로 무료 배포하기 (친구들과 공유)

`package.json`의 scripts에 아래와 같이 빌드 후 바로 GitHub Pages에 배포할 수 있습니다:

1. `gh-pages` 패키지 설치:
```bash
npm install -D gh-pages
```

2. `vite.config.ts`의 base 경로를 리포지토리 이름으로 설정:
```typescript
export default defineConfig({
  base: '/리포지토리이름/',
  // ...
});
```

3. `package.json`에 배포 스크립트 추가:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

4. 배포 실행:
```bash
npm run deploy
```

---

## 📄 라이선스
Apache License 2.0
