# 🏎️ Snakeka

> 26×26 와이드 필드, 3종 특수 아이템(속도감소, 길이감소, 5초무적), 시간에 따라 출현하는 도로 차단벽을 돌파하는 자동차 스네이크 웹 아케이드 게임입니다.
> **빌드 과정 없이 index.html 하나로 GitHub Pages에서 즉시 실행됩니다.**

![Snakeka Badge](https://img.shields.io/badge/Game-Snakeka-cyan?style=for-the-badge&logo=googlechrome)
![Zero Build](https://img.shields.io/badge/Zero--Build-Vanilla_HTML5_|_CSS_|_JS-emerald?style=for-the-badge)
![License](https://img.shields.io/badge/License-Apache_2.0-green?style=for-the-badge)

---

## 🎮 핵심 시스템 및 게임 규칙

1. **26 × 26 경기장 (총 676칸)**
   - 와이드 필드에서 긴 차체를 안정적으로 회전시키고 장애물을 회피할 수 있는 최적의 경기 공간.

2. **핵심 시스템 & 아이템 안내**
   - ⛽ **연료통**: 개당 10점 (최대 4개 등장: 초기 2개 → 16개 후 3개 → 30개 후 4개)
   - ❄️ **속도감소**: 6초간 주행 속도 감소 (고속 주행 중 안전한 코너링 확보)
   - 🔧 **길이감소**: 꼬리 3칸 감소 (차체 경량화 및 슬림화, +30점 보너스)
   - 🛡️ **5초무적**: 5초간 몸체/장애물에 닿기 가능 (몸통 통과 및 차단벽 파괴 돌파!)
   - 🚧 **차단벽**: 시간이 지남에 따라 최대 20개까지 등장 (30초 후 5개 시작, 밀집 방지 안전 거리 분산)

3. **고대비 비주얼 컬러 시스템**
   - **스네이크카**: 미래형 네온 사이언 & 코발트 블루 슈퍼카 (`#06b6d4` / `#0ea5e9` / `#38bdf8`)
   - **도로 차단벽**: 안전 경고 옐로우 & 블랙 사선 스트라이프 및 적색 경광등 (`#facc15` / `#09090b` / `#ef4444`)
   - 색상 대비를 극대화하여 고속 주행 시에도 자동차와 차단벽을 100% 명확히 구분할 수 있습니다.

4. **조정된 주행 속도 (최적 밸런스)**
   - 최고 주행 속도가 이전 대비 약 0.85배로 미세 조정되어 급격한 코너링에서도 정밀한 핸들링이 가능합니다.

5. **자체 합성 레트로 오디오 & 조작**
   - Web Audio API 내장 8비트 아케이드 효과음 (외부 mp3 파일 필요 없음)
   - 키보드: 방향키 / WASD, Space(일시정지/재개/시작), R(초기화면), M(음소거)
   - 모바일: 터치 스와이프 제스처 및 가상 D-패드 지원

---

## 🚀 GitHub Pages 30초 배포 방법 (No Build)

빌드(`npm run build`)할 필요 없이, `index.html` 파일을 GitHub 저장소 루트에 올리기만 하면 즉시 배포됩니다!

```bash
# 1. git 초기화
git init

# 2. 파일 추가 및 커밋
git add index.html script.js README.md
git commit -m "feat: Deploy Snakeka to GitHub Pages"

# 3. 기본 브랜치를 main으로 설정
git branch -M main

# 4. 본인의 GitHub 리포지토리 연결
git remote add origin https://github.com/당신의깃허브아이디/리포지토리이름.git

# 5. 푸시
git push -u origin main
```

### GitHub 웹사이트 설정
1. 저장소의 **Settings > Pages** 메뉴로 이동합니다.
2. **Build and deployment > Source**에서 `Deploy from a branch`를 선택합니다.
3. Branch를 `main` / `/(root)`로 지정하고 **Save**를 클릭합니다.
4. 1~2분 후 `https://<당신의-아이디>.github.io/<저장소-이름>/` 링크로 접속하면 바로 플레이 가능합니다!
