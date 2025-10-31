<h1 align="center">🎧 LP Player</h1>

<p align="center">
  <em>A visually immersive music experience — drag, drop, and play music on a spinning LP record.</em><br/>
  <strong>Built with Next.js · React DnD · TailwindCSS</strong>
</p>


---

<h2>🪩 About</h2>

<p>
  <strong>LP Player</strong>는 실제 턴테이블에서 음악을 듣는 듯한 시각적 경험을 제공하는 웹 앱입니다.<br/>
  사용자는 LP 위로 음악을 드래그해 올려 재생할 수 있고,<br/>
  LP를 클릭하거나 회전시키면 노래가 멈추거나 역재생되어 <em>스크래치 사운드</em>가 재현됩니다.
</p>

<ul>
  <li>🌀 LP 레코드 애니메이션 및 회전 효과</li>
  <li>🎧 Drag & Drop 기반 음악 플레이어</li>
  <li>⏸ LP 클릭 시 정지 및 스크래치 모션 구현</li>
  <li>💽 음악 메타데이터 자동 파싱 (<code>music-metadata-browser</code>)</li>
  <li>🌐 Spotify / Apple Music API 연동 (추후 추가 예정)</li>
</ul>

---

<h2>🧱 Tech Stack</h2>

<div align="center">

<h3>💅 Frontend</h3>

<img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
<img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white" />
<img src="https://img.shields.io/badge/React_DnD-FABD14?style=for-the-badge&logo=react&logoColor=black" />

<h3>🧰 Dev Tools</h3>

<img src="https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white" />
<img src="https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=white" />
<img src="https://img.shields.io/badge/Husky-000000?style=for-the-badge&logo=husky&logoColor=white" />
<img src="https://img.shields.io/badge/Lint_Staged-1E1E1E?style=for-the-badge&logo=git&logoColor=white" />
<img src="https://img.shields.io/badge/Vercel_Deploy-000000?style=for-the-badge&logo=vercel&logoColor=white" />

</div>

---

<h2>📁 Folder Structure</h2>

```planetext
lp-player/
├── public/              # Static assets (LP images, icons, etc.)
├── src/
│   ├── components/      # Reusable UI components (LP, Player, Controls)
│   ├── hooks/           # Custom React hooks
│   ├── pages/           # Next.js pages
│   ├── styles/          # Tailwind / global CSS
│   └── utils/           # Helper functions
├── package.json
└── tailwind.config.js
```

---

<h2>🚀 Deployment</h2> <p> 배포는 <strong>Vercel</strong> 플랫폼을 사용합니다.<br/> main 브랜치에 push 시 자동으로 배포가 트리거됩니다. </p>


---

---

<h2>🧠 Technical Insight & UX Design</h2>

<p>
LP Player는 단순히 음악을 재생하는 것을 넘어, 
<strong>‘사용자가 음악과 물리적으로 상호작용하는 경험’을 웹에서 구현</strong>하는 데 초점을 맞춘 프로젝트입니다.  
다음은 개발 과정에서의 주요 기술적 시도와 교훈입니다.
</p>

<h3>🎚️ 1. Web Audio API를 이용한 스크래치 사운드 실험</h3>

<p>
LP를 클릭한 상태로 마우스를 드래그하면, 
노래가 실제로 <strong>뒤로 감기거나 정지하는 듯한 “스크래치” 효과</strong>를 주기 위해
<code>Web Audio API</code>를 직접 다뤘습니다.
</p>

<ul>
  <li><strong>AudioBufferSourceNode</strong>를 활용해 오디오를 프레임 단위로 재생/역재생.</li>
  <li>LP 회전 각도(마우스 이동량)에 따라 <code>playbackRate</code>를 동적으로 조절.</li>
  <li>곡을 완전히 멈추는 대신, 회전 감속을 자연스럽게 구현하여 ‘턴테이블 질감’을 살림.</li>
</ul>

<p>
이 과정을 통해 <strong>‘UI의 시각적 모션이 실제 오디오와 동기화될 때 사용자의 몰입감이 극대화된다’</strong>는 UX적 교훈을 얻었습니다.
</p>

---

<h3>💿 2. Drag & Drop 기반의 직관적 상호작용</h3>

<p>
<code>react-dnd</code>를 사용해 사용자가 곡 카드를 LP 위로 드롭하면
즉시 재생되는 직관적인 인터랙션을 설계했습니다.
</p>

<ul>
  <li>곡 정보를 드래그 가능한 객체로 설정 (<code>useDrag</code>)</li>
  <li>LP 영역을 드롭 타겟으로 지정 (<code>useDrop</code>)</li>
  <li>드롭 성공 시 곡이 자동 재생되며 LP가 회전 애니메이션을 시작</li>
</ul>

<p>
UX 측면에서 <strong>‘플레이버튼을 누르는 절차 없이도 음악과 상호작용하는 감각’</strong>을 제공했습니다.
</p>

---

<h3>🌊 3. Tailwind CSS와 시각적 리듬</h3>

<p>
LP의 회전, 클릭 시 진동 효과, 호버 시 반사광 등은 
<code>Tailwind CSS</code>의 유틸리티 클래스를 이용해 구성했습니다.  
CSS 애니메이션 대신 <code>transition</code>과 <code>transform</code>을 활용해
실시간 반응성과 성능을 모두 확보했습니다.
</p>

<p>
이 과정을 통해 
<strong>“작은 모션이 오디오 경험 전체의 리듬을 강화한다”</strong>는 
UX 디자인의 미시적 원리를 배웠습니다.
</p>

---

<h3>🔊 4. music-metadata-browser를 통한 오디오 정보 처리</h3>

<p>
음악 파일에서 메타데이터(앨범 커버, 제목, 아티스트 등)를 추출하기 위해  
<code>music-metadata-browser</code> 패키지를 사용했습니다.
</p>

<ul>
  <li>MP3, FLAC, WAV 등 다양한 포맷 지원</li>
  <li>앨범 아트 자동 파싱 후 LP 이미지로 매핑</li>
  <li>메타데이터 불러오기 시 <code>async/await</code>으로 비동기 UX 보장</li>
</ul>

<p>
이를 통해 사용자는 <strong>“자신의 로컬 음악 파일을 직접 LP 위로 올려 감상하는 경험”</strong>을 하게 됩니다.
</p>

---

<h3>✨ 5. UX에서의 교훈</h3>

<ul>
  <li>음악 UI에서는 버튼보다 <strong>직접 조작</strong>이 몰입도를 높인다.</li>
  <li>시각적 인터랙션과 오디오 피드백이 <strong>실시간으로 연결</strong>되어야 한다.</li>
  <li>불필요한 UI 요소를 줄이고, 사용자의 감각적 피드백에 집중할 것.</li>
</ul>

<p>
LP Player는 이런 실험을 통해 <strong>“음악을 클릭하는 것이 아니라, 음악을 ‘만지는’ 경험”</strong>을 
웹 기술로 구현하려는 시도였습니다.
</p>

---
