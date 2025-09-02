# 사이드바 메뉴 구성 PRD (Product Requirements Document)

## 개요
사용자가 프로젝트와 조직을 효율적으로 관리할 수 있도록 체계적인 사이드바 메뉴 구조를 제공합니다.

## 메뉴 구조

### 1. 대시보드 (Dashboard)
- **페이지**: Dashboard Page
- **목적**: 사용자가 할당받은 작업의 현재 상태를 한눈에 파악
- **주요 기능**:
  - 할당된 작업의 진행 상태 표시
  - 참조된 게시물 및 프로젝트 관련 업데이트
  - 상태 개요 페이지 역할

### 2. 캘린더 (Calendar)
- **페이지**: Calendar Page
- **목적**: 각 사용자의 작업 기간을 캘린더 형태로 표시
- **주요 기능**:
  - 작업 기간 시각화
  - 사용자별 작업 일정 관리

### 3. 조직 관리 (Organization Management)
- **페이지**: Organization Management Page
- **목적**: 사용자가 속한 조직의 정보 및 구성원 관리
- **주요 기능**:
  - 조직 정보 표시
  - 조직 내 구성원 목록
  - 초대 수락/거절 등의 액션

### 4. 프로젝트 관리 (Project Management)

#### 4.1 프로젝트 목록 (Project List)
- **페이지**: Project List Page
- **목적**: 사용자가 할당된 프로젝트 정보 표시
- **주요 기능**:
  - 프로젝트 목록 뷰
  - 프로젝트 카드 뷰
  - 두 가지 뷰 모드 지원

##### 4.1.1 WBS 관리 (WBS Management)
- **페이지**: WBS Management Page
- **목적**: 프로젝트 작업 분할 구조(WBS) 관리
- **주요 기능**:
  - 레벨별 작업 목록
  - 시작일 및 종료일 표시
  - 간트 차트 형태로 작업 표시
  - 월별 컬럼 구성
  - 단일 가로 스크롤 페이지 (연도별 분리 없음)

##### 4.1.2 프로젝트 비용 관리 (Project Cost Management)
- **페이지**: Project Cost Management Page
- **목적**: 프로젝트 비용 계획 및 수익성 계산
- **주요 기능**:
  - 손익계산서 (Profit & Loss statement)
  - 노력 할당 (Effort allocation)
  - 조달 (Procurement)
  - 다중 탭 구성

##### 4.1.3 비용 및 조달 (Expense & Procurement)
- **페이지**: Expense & Procurement Page
- **목적**: 프로젝트에서 사용되는 비용 및 구매 품목 관리
- **주요 기능**:
  - 비용 관리
  - 구매 품목 관리

##### 4.1.4 일일 보고서 (Daily Report)
- **페이지**: Daily Report Page
- **목적**: 각 구성원의 일일 보고서 작성
- **주요 기능**:
  - 오늘/내일 작업 계획
  - 지연 사항
  - 이슈 및 요청사항

##### 4.1.5 주간 보고서 (Weekly Report)
- **페이지**: Weekly Report Page
- **목적**: 프로젝트 리더의 주간 보고서 작성
- **주요 기능**:
  - 지연률 (Delay Rate)
  - 미시작률 (Unstarted Rate)
  - 지연 항목 및 이슈 (Delayed Items & Issues)
  - 작업 목록 상태 (Task List Status)
  - 다중 탭 구성

##### 4.1.6 프로젝트 로그 (Project Log)
- **페이지**: Project Log Page
- **목적**: 프로젝트 실행 로그 관리
- **주요 기능**:
  - 클라이언트와의 합의사항 추적
  - 결정사항 기록

##### 4.1.7 회의록 (Meeting Minutes)
- **페이지**: Meeting Minutes Page
- **목적**: 회의 노트 관리
- **주요 기능**:
  - 전체 회의 (All Meetings)
  - 외부 회의 (External)
  - 내부 회의 (Internal)
  - 정기 회의 (Regular)
  - 탭별 구성

##### 4.1.8 자원 및 노력 관리 (Resource & Effort Management)
- **페이지**: Resource & Effort Management Page
- **목적**: 프로젝트 구성원의 작업 수행, 노력 할당, 출장 관리
- **주요 기능**:
  - 수행된 작업 관리
  - 노력 할당 관리
  - 출장 관리
  - 다중 탭 구성

#### 4.2 프로젝트 타임라인 (Project Timeline)
- **페이지**: Project Timeline Page
- **목적**: 선택된 프로젝트의 전체 일정을 간트 차트로 확인
- **주요 기능**:
  - 선택된 프로젝트의 간트 차트 표시
  - 월별 컬럼 구성
  - 단일 가로 스크롤 페이지 (연도별 분리 없음)

## 기술적 요구사항
- 반응형 디자인 지원
- 직관적인 네비게이션 구조
- 적절한 아이콘 및 라벨링
- 접근성 고려

## 사용자 경험 목표
- 3클릭 이내에 원하는 페이지 접근
- 명확한 계층 구조로 메뉴 탐색 용이성 향상
- 일관된 UI/UX 패턴 적용
