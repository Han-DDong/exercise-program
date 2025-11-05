# GitHub 웹에서 직접 파일 올리기 가이드

## 방법 1: 웹에서 직접 업로드 (가장 간단!)

### 1단계: GitHub 저장소 생성

1. **GitHub.com에 로그인**

   - https://github.com 접속
   - 계정이 없다면 회원가입

2. **새 저장소 생성**
   - 우측 상단 **"+"** 버튼 클릭 → **"New repository"**
   - 저장소 이름 입력 (예: `exercise-program`)
   - 설명 입력 (선택사항)
   - **Public** 또는 **Private** 선택
     - **Public (공개)**: 누구나 볼 수 있음, 무료
     - **Private (비공개)**: 초대받은 사람만 볼 수 있음, 무료
   - **"Create repository"** 클릭

### 2단계: 파일 업로드

1. **저장소 페이지에서 "uploading an existing file" 클릭**

   - 또는 상단의 **"Add file"** 버튼 → **"Upload files"** 클릭

2. **파일 드래그 앤 드롭**

   - 파일 탐색기에서 다음 파일들을 선택:
     - `index.html`
     - `script.js`
     - `style.css`
   - 선택한 파일들을 GitHub 페이지로 드래그 앤 드롭

3. **커밋 메시지 입력**

   - 하단에 "Commit changes" 섹션
   - 메시지 입력 (예: "Initial commit: 운동 프로그램 관리 시스템")
   - **"Commit changes"** 버튼 클릭

4. **완료!**
   - 파일이 업로드되었습니다
   - 저장소 페이지에서 파일들을 확인할 수 있습니다

### 3단계: GitHub Pages로 웹사이트 호스팅 (선택사항)

1. 저장소 페이지에서 **"Settings"** 탭 클릭
2. 왼쪽 메뉴에서 **"Pages"** 클릭
3. Source에서 **"Deploy from a branch"** 선택
4. Branch에서 **"main"** 선택
5. **"Save"** 클릭
6. 몇 분 후 웹사이트 URL이 표시됩니다 (예: `https://사용자명.github.io/저장소명/`)

---

## 방법 2: Git 명령어 사용 (고급)

### 1. Git 설치하기

1. **Git 다운로드 페이지 방문**

   - https://git-scm.com/download/win 접속
   - 다운로드 후 설치

2. **설치 확인**
   - 터미널에서 `git --version` 실행

### 2. GitHub 저장소 생성

1. GitHub.com에 로그인
2. 우측 상단 "+" 버튼 클릭 → "New repository"
3. 저장소 이름 입력
4. "Create repository" 클릭

### 3. 로컬에서 Git 초기화 및 업로드

```bash
# 프로젝트 폴더로 이동
cd C:\Users\HanJungwoo\Desktop\test

# Git 초기화
git init

# 모든 파일 추가
git add .

# 첫 커밋
git commit -m "Initial commit: 운동 프로그램 관리 시스템"

# GitHub 저장소 연결
git remote add origin https://github.com/사용자명/저장소명.git

# GitHub에 푸시
git branch -M main
git push -u origin main
```

### 4. 이후 변경사항 업로드

```bash
git add .
git commit -m "변경 사항 설명"
git push
```

---

## Public vs Private 차이점

### Public (공개 저장소)

- ✅ **누구나 볼 수 있음**: 인터넷에 접속하는 모든 사람이 코드를 볼 수 있습니다
- ✅ **무료**: 제한 없이 무료로 사용 가능
- ✅ **오픈소스**: 다른 사람들과 코드를 공유하고 싶을 때 적합
- ✅ **포트폴리오**: 프로젝트를 자랑하고 싶을 때 좋음
- ⚠️ **주의**: 코드가 공개되므로 민감한 정보(비밀번호, API 키 등)는 포함하지 않아야 함

### Private (비공개 저장소)

- 🔒 **나만 볼 수 있음**: 초대받은 사람만 접근 가능
- ✅ **무료**: 개인 계정도 무료로 Private 저장소 생성 가능
- ✅ **프라이버시**: 개인 프로젝트나 비공개 작업에 적합
- ✅ **안전**: 민감한 정보를 포함한 프로젝트에 적합
- ⚠️ **제한**: 초대하지 않으면 다른 사람이 코드를 볼 수 없음

### 추천

- **이 프로젝트(운동 프로그램)**: Public 권장 (포트폴리오로 사용 가능)
- **개인 연습용**: Private 또는 Public 둘 다 괜찮음
- **비즈니스/민감한 정보**: Private 필수

---

## 참고사항

- **웹에서 직접 업로드**가 가장 간단합니다!
- GitHub Pages를 사용하면 웹사이트로 바로 접속 가능합니다
- 파일 수정 후 다시 업로드하려면 "Add file" → "Upload files"로 같은 방법 사용
- 나중에 Public ↔ Private로 변경 가능합니다 (Settings → Danger Zone)
