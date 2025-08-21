<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>팀장 피드백 비서 - 스마트 팀원 분석 시스템</title>
    
    <!-- Tailwind CSS -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- Font Awesome Icons -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css">
    
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <!-- Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    
    <style>
        body {
            font-family: 'Inter', sans-serif;
        }
        .gradient-bg {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }
        .card-hover {
            transition: all 0.3s ease;
        }
        .card-hover:hover {
            transform: translateY(-5px);
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }
    </style>
</head>
<body class="bg-gray-50 min-h-screen">
    <!-- Header -->
    <header class="gradient-bg shadow-lg">
        <div class="container mx-auto px-4 py-6">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-users text-white text-3xl"></i>
                    <h1 class="text-2xl font-bold text-white">팀장 피드백 비서</h1>
                </div>
                <nav class="hidden md:flex space-x-6">
                    <a href="#dashboard" class="text-white hover:text-purple-200 transition duration-300">대시보드</a>
                    <a href="#team-members" class="text-white hover:text-purple-200 transition duration-300">팀원 관리</a>
                    <a href="#feedback-guide" class="text-white hover:text-purple-200 transition duration-300">피드백 가이드</a>
                    <a href="#analytics" class="text-white hover:text-purple-200 transition duration-300">분석</a>
                </nav>
                <button class="md:hidden text-white">
                    <i class="fas fa-bars text-xl"></i>
                </button>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="container mx-auto px-4 py-8">
        <!-- Quick Stats -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" id="stats-cards">
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">등록된 팀원</p>
                        <p class="text-3xl font-bold text-blue-600" id="total-members">0</p>
                    </div>
                    <div class="bg-blue-100 p-3 rounded-full">
                        <i class="fas fa-users text-blue-600 text-xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">피드백 기록</p>
                        <p class="text-3xl font-bold text-green-600" id="total-feedbacks">0</p>
                    </div>
                    <div class="bg-green-100 p-3 rounded-full">
                        <i class="fas fa-comments text-green-600 text-xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">분석 완료</p>
                        <p class="text-3xl font-bold text-purple-600" id="analyzed-members">0</p>
                    </div>
                    <div class="bg-purple-100 p-3 rounded-full">
                        <i class="fas fa-chart-line text-purple-600 text-xl"></i>
                    </div>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-gray-600 text-sm">이번 주 활동</p>
                        <p class="text-3xl font-bold text-orange-600" id="weekly-activities">0</p>
                    </div>
                    <div class="bg-orange-100 p-3 rounded-full">
                        <i class="fas fa-calendar-week text-orange-600 text-xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover cursor-pointer" onclick="openTeamMemberModal()">
                <div class="text-center">
                    <div class="bg-blue-100 p-4 rounded-full inline-block mb-4">
                        <i class="fas fa-user-plus text-blue-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">팀원 등록</h3>
                    <p class="text-gray-600">새로운 팀원을 등록하고 성향을 분석해보세요</p>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover cursor-pointer" onclick="openBehaviorModal()">
                <div class="text-center">
                    <div class="bg-green-100 p-4 rounded-full inline-block mb-4">
                        <i class="fas fa-clipboard-list text-green-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">행동 기록</h3>
                    <p class="text-gray-600">팀원의 행동을 기록하고 피드백을 받아보세요</p>
                </div>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6 card-hover cursor-pointer" onclick="openFeedbackGuide()">
                <div class="text-center">
                    <div class="bg-purple-100 p-4 rounded-full inline-block mb-4">
                        <i class="fas fa-lightbulb text-purple-600 text-2xl"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">피드백 가이드</h3>
                    <p class="text-gray-600">AI 기반 맞춤형 피드백 가이드를 확인하세요</p>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-lg font-semibold mb-4">팀원 성격 유형 분포</h3>
                <canvas id="personalityChart" style="height: 300px;"></canvas>
            </div>
            
            <div class="bg-white rounded-lg shadow-lg p-6">
                <h3 class="text-lg font-semibold mb-4">최근 피드백 현황</h3>
                <canvas id="feedbackChart" style="height: 300px;"></canvas>
            </div>
        </div>

        <!-- Recent Activities -->
        <div class="bg-white rounded-lg shadow-lg p-6">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-lg font-semibold">최근 활동</h3>
                <button class="text-blue-600 hover:text-blue-800" onclick="loadRecentActivities()">
                    <i class="fas fa-refresh"></i> 새로고침
                </button>
            </div>
            <div id="recent-activities" class="space-y-4">
                <!-- Recent activities will be loaded here -->
            </div>
        </div>
    </main>

    <!-- Team Member Modal -->
    <div id="teamMemberModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">팀원 등록 및 분석</h2>
                        <button onclick="closeTeamMemberModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <form id="teamMemberForm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이름 *</label>
                                <input type="text" id="memberName" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">직책</label>
                                <input type="text" id="memberPosition" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">부서</label>
                                <input type="text" id="memberDepartment" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                                <input type="email" id="memberEmail" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">MBTI 유형</label>
                                <select id="personalityType" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">선택하세요</option>
                                    <option value="ENFP">ENFP</option>
                                    <option value="ENFJ">ENFJ</option>
                                    <option value="ENTP">ENTP</option>
                                    <option value="ENTJ">ENTJ</option>
                                    <option value="ESFP">ESFP</option>
                                    <option value="ESFJ">ESFJ</option>
                                    <option value="ESTP">ESTP</option>
                                    <option value="ESTJ">ESTJ</option>
                                    <option value="INFP">INFP</option>
                                    <option value="INFJ">INFJ</option>
                                    <option value="INTP">INTP</option>
                                    <option value="INTJ">INTJ</option>
                                    <option value="ISFP">ISFP</option>
                                    <option value="ISFJ">ISFJ</option>
                                    <option value="ISTP">ISTP</option>
                                    <option value="ISTJ">ISTJ</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">업무 스타일</label>
                                <select id="workStyle" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">선택하세요</option>
                                    <option value="체계적">체계적</option>
                                    <option value="창의적">창의적</option>
                                    <option value="분석적">분석적</option>
                                    <option value="협력적">협력적</option>
                                    <option value="독립적">독립적</option>
                                    <option value="목표지향적">목표지향적</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">커뮤니케이션 스타일</label>
                                <select id="communicationStyle" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">선택하세요</option>
                                    <option value="직접적">직접적</option>
                                    <option value="간접적">간접적</option>
                                    <option value="논리적">논리적</option>
                                    <option value="감정적">감정적</option>
                                    <option value="시각적">시각적</option>
                                    <option value="청각적">청각적</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">선호하는 피드백 스타일</label>
                            <select id="preferredFeedbackStyle" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="">선택하세요</option>
                                <option value="직접적">직접적</option>
                                <option value="부드러운">부드러운</option>
                                <option value="구체적">구체적</option>
                                <option value="격려중심">격려중심</option>
                                <option value="목표중심">목표중심</option>
                            </select>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">커리어 목표</label>
                            <textarea id="careerGoals" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">추가 메모</label>
                            <textarea id="profileNotes" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3"></textarea>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="closeTeamMemberModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                등록하기
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Behavior Record Modal -->
    <div id="behaviorModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-90vh overflow-y-auto">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">행동 기록 및 피드백 요청</h2>
                        <button onclick="closeBehaviorModal()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6">
                    <form id="behaviorForm">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">팀원 선택 *</label>
                                <select id="behaviorMember" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">팀원을 선택하세요</option>
                                </select>
                            </div>
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2">상황 유형 *</label>
                                <select id="situationType" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                                    <option value="">선택하세요</option>
                                    <option value="성과 달성">성과 달성</option>
                                    <option value="문제 발생">문제 발생</option>
                                    <option value="팀워크 이슈">팀워크 이슈</option>
                                    <option value="커뮤니케이션 문제">커뮤니케이션 문제</option>
                                    <option value="기한 지연">기한 지연</option>
                                    <option value="창의적 아이디어">창의적 아이디어</option>
                                    <option value="리더십 발휘">리더십 발휘</option>
                                    <option value="고객 대응">고객 대응</option>
                                    <option value="프로세스 개선">프로세스 개선</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">행동 상세 설명 *</label>
                            <textarea id="behaviorDescription" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="4" placeholder="무엇을 했는지, 어떤 상황이었는지 구체적으로 설명해주세요..." required></textarea>
                        </div>

                        <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700 mb-2">상황 배경</label>
                            <textarea id="behaviorContext" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" rows="3" placeholder="당시 상황, 배경, 제약 사항 등을 설명해주세요..."></textarea>
                        </div>

                        <div class="mb-6">
                            <label class="block text-sm font-medium text-gray-700 mb-2">영향도</label>
                            <select id="impactLevel" class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                <option value="보통">보통</option>
                                <option value="높음">높음</option>
                                <option value="낮음">낮음</option>
                            </select>
                        </div>

                        <div class="flex justify-end space-x-3">
                            <button type="button" onclick="closeBehaviorModal()" class="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
                                취소
                            </button>
                            <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                                피드백 요청
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>

    <!-- Feedback Guide Modal -->
    <div id="feedbackGuideModal" class="fixed inset-0 bg-black bg-opacity-50 hidden z-50">
        <div class="flex items-center justify-center min-h-screen p-4">
            <div class="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-90vh overflow-y-auto">
                <div class="p-6 border-b">
                    <div class="flex items-center justify-between">
                        <h2 class="text-xl font-semibold">AI 피드백 가이드</h2>
                        <button onclick="closeFeedbackGuide()" class="text-gray-400 hover:text-gray-600">
                            <i class="fas fa-times text-xl"></i>
                        </button>
                    </div>
                </div>
                <div class="p-6" id="feedbackGuideContent">
                    <!-- Feedback guide content will be loaded here -->
                </div>
            </div>
        </div>
    </div>

    <!-- Load Data and Main Script -->
    <script src="data.js"></script>
    <script src="main.js"></script>
</body>
</html>
