# PySpur - LLM 워크플로우를 위한 그래프 기반 에디터

<p align="center">
  <a href="./README.md"><img alt="README in English" src="https://img.shields.io/badge/English-blue"></a>
  <a href="./README_CN.md"><img alt="简体中文版自述文件" src="https://img.shields.io/badge/简体中文-blue"></a>
  <a href="./README_JA.md"><img alt="日本語のREADME" src="https://img.shields.io/badge/日本語-blue"></a>
  <a href="./README_KR.md"><img alt="README in Korean" src="https://img.shields.io/badge/한국어-blue"></a>
  <a href="./README_DE.md"><img alt="Deutsche Version der README" src="https://img.shields.io/badge/Deutsch-blue"></a>
  <a href="./README_FR.md"><img alt="Version française du README" src="https://img.shields.io/badge/Français-blue"></a>
  <a href="./README_ES.md"><img alt="Versión en español del README" src="https://img.shields.io/badge/Español-blue"></a>
</p>

https://github.com/user-attachments/assets/9128885b-47ba-4fc6-ab6b-d567f52e332c

# ✨ 핵심 장점

## 모듈형 빌딩 블록

https://github.com/user-attachments/assets/6442f0ad-86d8-43d9-aa70-e5c01e55e876

## 노드 단위 디버깅:

https://github.com/user-attachments/assets/6e82ad25-2a46-4c50-b030-415ea9994690

## 최종 성능 평가

https://github.com/user-attachments/assets/4dc2abc3-c6e6-4d6d-a5c3-787d518de7ae

## 곧 출시 예정: 자기 개선(Self-improvement)

https://github.com/user-attachments/assets/5bef7a16-ef9f-4650-b385-4ea70fa54c8a


# 🕸️ 왜 PySpur인가?

* **개발 친화적**: 새로운 워크플로우 노드를 추가하려면 단지 하나의 파이썬 파일만 작성하면 됩니다.
* **JSON 구성 기반**: 워크플로우 그래프를 JSON으로 관리하여 손쉬운 공유 및 버전 관리를 지원합니다.
* **경량화**: 불필요한 종속성을 최소화하여, 무거운 LLM 프레임워크를 피할 수 있습니다.

# ⚡ 빠른 시작

다음의 간단한 세 단계로 PySpur를 시작할 수 있습니다.

1. **저장소 클론:**
    ```sh
    git clone https://github.com/PySpur-com/PySpur.git
    cd pyspur
    ```

2. **도커 서비스 시작:**

    ```sh
    sudo docker compose up --build -d
    ```

    이 명령으로 로컬에 PySpur 인스턴스를 시작합니다. 스퍼(spur)와 그 실행 기록은 로컬 SQLite 파일에 저장됩니다.

3. **포털 접속:**

    브라우저에서 `http://localhost:6080/`로 이동하세요.

    사용자명/비밀번호: `pyspur`/`canaryhattan`

4. **LLM 제공자 키 추가하기:**

   포털 오른쪽 상단의 설정 메뉴로 이동합니다.

   <img width="1913" alt="image" src="https://github.com/user-attachments/assets/32fe79f1-f518-4df5-859c-1d1c0fc0570e" />

   "API keys" 탭을 선택합니다.

   <img width="441" alt="image" src="https://github.com/user-attachments/assets/cccc7e27-c10b-4f3a-b818-3b65c55f4170" />

   제공자의 키를 입력한 뒤 저장을 누릅니다(키를 추가하거나 수정하면 저장 버튼이 나타납니다).

   <img width="451" alt="image" src="https://github.com/user-attachments/assets/e35ba2bb-4c60-4b13-9a8d-cc47cac45375" />

설정이 완료되었습니다. "New Spur" 버튼을 눌러 새로운 워크플로우를 만들거나, 기본으로 제공되는 템플릿 중 하나를 사용해보세요.

# 🗺️ 로드맵

- [X] 캔버스
- [X] 비동기/배치 실행
- [X] 평가(Evals)
- [X] Spur API
- [ ] 새로운 노드
    - [X] LLM 노드
    - [X] If-Else
    - [X] 브랜치 병합(Merge Branches)
    - [ ] 도구(Tools)
    - [ ] 루프(Loops)
- [ ] DSPy 등 관련 기법을 통한 파이프라인 최적화
- [ ] 템플릿
- [ ] 스퍼를 코드로 컴파일
- [ ] 멀티모달 지원
- [ ] 코드 검증기(Containerization)
- [ ] 리더보드(Leaderboard)
- [ ] AI를 통한 스퍼 자동 생성

여러분의 피드백은 큰 도움이 됩니다.  
[저희에게 알려주세요](mailto:founders@pyspur.dev?subject=Feature%20Request&body=I%20want%20this%20feature%3Ai) : 다음에 어떤 기능을 보고 싶은지, 또는 완전히 새로운 기능을 제안해주십시오.
