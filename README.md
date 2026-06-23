# 손실함수 대시보드 · Loss Function Dashboard

ML task별 **손실함수(loss function)** 를 직관적으로 배우고, 곡선·기울기·하이퍼파라미터를
직접 만져보는 인터랙티브 정적 웹앱입니다. 의료영상에서 실제로 많이 쓰는 대표 손실 위주로
정리했고, 한국어 / English 두 로케일과 라이트/다크 테마를 지원합니다.

> [`snubilab/metric-dashboard`](https://snubilab.github.io/metric-dashboard/)의 설명
> 구조(사이드바 + Learn/Playground 뷰, KaTeX, 디자인 토큰, 백엔드 없음)를 따르되,
> *평가지표*가 아니라 학습 중 최적화하는 *손실함수*를 다룹니다.

## 무엇이 들어 있나

8개 task, 각 task마다 두 개의 뷰:

- **Learn** — 손실마다 **한 줄 요약**(항상 보임) + **“자세히 보기”** 로 펼치는 상세
  (KaTeX 수식·기울기, 직관, 언제 쓰나, 장점/단점, 관련 손실 cross-link, **검증된 실제 논문**).
  각 task 끝에 비교·선택 가이드 표.
- **Playground** — 여러 손실을 한 축에 겹쳐 비교, **기울기(gradient) 곡선** 토글,
  하이퍼파라미터 **슬라이더**(Focal γ, Huber δ, Tversky α/β, label smoothing ε, 온도 τ …)로
  실시간 재계산, 마우스 호버로 값·기울기 판독.

| Task | 대표 손실 |
|------|-----------|
| 분류 Classification | CE, BCE, Weighted CE, Focal, Label Smoothing |
| 회귀 Regression | MSE, MAE, Huber, Log-Cosh, Quantile |
| 세그멘테이션 Segmentation | Dice, IoU, Tversky, Focal-Tversky, Combo, Boundary |
| 객체검출 Detection | Smooth L1, L1/L2, IoU, GIoU, DIoU/CIoU, Focal |
| 대조·메트릭 Contrastive | InfoNCE, Triplet, Cosine, Contrastive, ArcFace, SupCon |
| 랭킹·추천 Ranking | BPR, Pairwise Hinge, RankBoost, ListNet, LambdaRank |
| 시퀀스·NLP·LLM | Next-token CE, Label Smoothing, CTC, DPO |
| 생성 Generative | GAN (minimax/non-sat), WGAN, Hinge-GAN, VAE, Diffusion, LPIPS |

곡선으로 정직하게 표현하기 어려운 손실(Boundary, GIoU/DIoU/CIoU, ArcFace, LPIPS 등)은
**Learn 전용**으로 표시하고 Playground에는 넣지 않습니다.

## 핵심 설계: 1차원 손실 프로파일

플레이그라운드의 모든 손실은 스칼라 입력 `x`에 대한 순수 함수
`value(x, params)` / `grad(x, params)` 로 표현됩니다(`src/engine/profiles.ts`).
task마다 `x`의 의미만 다릅니다(분류=정답확률 p, 회귀=잔차 r, 세그=재현율, 대조=유사도 …).
모든 기울기는 수치미분과 대조해 단위테스트로 검증합니다.

## 실행

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드 → dist/
npm run preview  # 빌드 결과 미리보기
npm run test     # Vitest 테스트
```

Node 20+ 필요.

## 구조

```
src/
  app/        App 셸: Sidebar, TaskPage(Learn/Playground 탭), ThemeToggle
  components/ LossCard, FormulaBlock(KaTeX), LossPlot(SVG 직접 구현), ParamSlider, ComparisonTable, Playground
  data/       types.ts, registry.ts, losses/<task>.ts (콘텐츠 + 논문)
  engine/     profiles.ts (순수 1D 손실/기울기) + 테스트
  i18n/       LanguageContext, LanguageToggle, ui 문자열
  styles/     tokens.css(디자인 토큰), global.css
```

## 배포

🔗 **Live:** https://gh-cho312.github.io/loss-function-dashboard/

GitHub Pages **deploy-from-branch** 방식으로 배포합니다(빌드 결과를 `gh-pages`
브랜치에 올리고, Pages 소스를 그 브랜치로 지정). 소스는 `main`, 배포물은 `gh-pages`로
분리됩니다. `vite.config.ts`의 `base: './'` 덕분에 프로젝트 하위 경로(`/loss-function-dashboard/`)
에서도 자산 경로가 올바르게 해석됩니다.

### 사이트 갱신(재배포)

```bash
npm run deploy
```

이 스크립트는 `npm run build` 후 `dist/`(+ `.nojekyll`)를 `gh-pages` 브랜치로
force-push 합니다. main에 푸시한다고 자동 배포되지는 않습니다(토큰에 `workflow`
스코프가 없어 Actions 워크플로는 제외함). 자동 배포가 필요하면
`gh auth refresh -s workflow` 후 `.github/workflows/deploy.yml`(Actions → Pages)을
다시 추가하면 됩니다.

## 설계 문서

- [`docs/superpowers/specs/2026-06-23-loss-function-dashboard-design.md`](docs/superpowers/specs/2026-06-23-loss-function-dashboard-design.md)

## 라이선스 · 출처

교육용 프로젝트입니다. 각 손실의 수식·직관은 카드에 표기된 원논문을 따릅니다.
