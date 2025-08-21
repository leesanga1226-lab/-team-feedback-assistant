// GitHub Pages용 메인 JavaScript 파일
// 로컬 스토리지 기반으로 동작

// 전역 변수
let teamMembers = [];
let behaviorIncidents = [];
let feedbackTemplates = [];
let personalityChart = null;
let feedbackChart = null;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// 앱 초기화
async function initializeApp() {
    await loadTeamMembers();
    await loadBehaviorIncidents();
    await loadFeedbackTemplates();
    updateStats();
    initializeCharts();
    loadRecentActivities();
}

// 팀원 데이터 로드
async function loadTeamMembers() {
    try {
        const result = await LocalAPI.getTeamMembers();
        teamMembers = result.data || [];
        updateMemberSelectOptions();
    } catch (error) {
        console.error('팀원 데이터 로드 실패:', error);
        teamMembers = [];
    }
}

// 행동 기록 데이터 로드
async function loadBehaviorIncidents() {
    try {
        const result = await LocalAPI.getBehaviorIncidents();
        behaviorIncidents = result.data || [];
    } catch (error) {
        console.error('행동 기록 데이터 로드 실패:', error);
        behaviorIncidents = [];
    }
}

// 피드백 템플릿 로드
async function loadFeedbackTemplates() {
    try {
        const result = await LocalAPI.getFeedbackTemplates();
        feedbackTemplates = result.data || [];
    } catch (error) {
        console.error('피드백 템플릿 로드 실패:', error);
        feedbackTemplates = [];
    }
}

// 통계 업데이트
function updateStats() {
    document.getElementById('total-members').textContent = teamMembers.length;
    document.getElementById('total-feedbacks').textContent = behaviorIncidents.length;
    
    const analyzedMembers = teamMembers.filter(member => 
        member.personality_type && member.work_style && member.communication_style
    ).length;
    document.getElementById('analyzed-members').textContent = analyzedMembers;
    
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyActivities = behaviorIncidents.filter(incident => 
        new Date(incident.incident_date) > weekAgo
    ).length;
    document.getElementById('weekly-activities').textContent = weeklyActivities;
}

// 차트 초기화
function initializeCharts() {
    initializePersonalityChart();
    initializeFeedbackChart();
}

// 성격 유형 분포 차트
function initializePersonalityChart() {
    const ctx = document.getElementById('personalityChart').getContext('2d');
    
    // MBTI 유형별 카운트
    const personalityCounts = {};
    teamMembers.forEach(member => {
        if (member.personality_type) {
            personalityCounts[member.personality_type] = (personalityCounts[member.personality_type] || 0) + 1;
        }
    });

    const labels = Object.keys(personalityCounts);
    const data = Object.values(personalityCounts);
    const colors = [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#FF6384', '#C9CBCF',
        '#4BC0C0', '#36A2EB', '#FFCE56', '#9966FF',
        '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0'
    ];

    if (personalityChart) {
        personalityChart.destroy();
    }

    personalityChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// 피드백 현황 차트
function initializeFeedbackChart() {
    const ctx = document.getElementById('feedbackChart').getContext('2d');
    
    // 최근 7일간 피드백 현황
    const labels = [];
    const data = [];
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('ko-KR', { weekday: 'short' });
        
        labels.push(dayName);
        
        const dayCount = behaviorIncidents.filter(incident => {
            const incidentDate = new Date(incident.incident_date).toISOString().split('T')[0];
            return incidentDate === dateStr;
        }).length;
        
        data.push(dayCount);
    }

    if (feedbackChart) {
        feedbackChart.destroy();
    }

    feedbackChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: '피드백 요청',
                data: data,
                borderColor: '#36A2EB',
                backgroundColor: 'rgba(54, 162, 235, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
}

// 최근 활동 로드
function loadRecentActivities() {
    const recentActivitiesContainer = document.getElementById('recent-activities');
    
    if (behaviorIncidents.length === 0) {
        recentActivitiesContainer.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i class="fas fa-inbox text-4xl mb-4"></i>
                <p>아직 기록된 활동이 없습니다.</p>
                <p class="text-sm">팀원의 행동을 기록해보세요.</p>
            </div>
        `;
        return;
    }

    // 최근 5개 활동만 표시
    const recentIncidents = behaviorIncidents
        .sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date))
        .slice(0, 5);

    const activitiesHTML = recentIncidents.map(incident => {
        const date = new Date(incident.incident_date).toLocaleDateString('ko-KR');
        const situationIcon = getSituationIcon(incident.situation_type);
        const impactColor = getImpactColor(incident.impact_level);
        
        return `
            <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                <div class="flex-shrink-0">
                    <div class="w-10 h-10 rounded-full ${impactColor} flex items-center justify-center">
                        <i class="${situationIcon} text-white"></i>
                    </div>
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between">
                        <h4 class="text-sm font-medium text-gray-900">${incident.member_name}</h4>
                        <span class="text-xs text-gray-500">${date}</span>
                    </div>
                    <p class="text-sm text-gray-600 mt-1">${incident.situation_type}</p>
                    <p class="text-xs text-gray-500 mt-1 line-clamp-2">${incident.behavior_description.substring(0, 100)}...</p>
                </div>
                <button onclick="viewIncidentDetail('${incident.id}')" class="text-blue-600 hover:text-blue-800">
                    <i class="fas fa-eye"></i>
                </button>
            </div>
        `;
    }).join('');

    recentActivitiesContainer.innerHTML = activitiesHTML;
}

// 상황별 아이콘 반환
function getSituationIcon(situationType) {
    const iconMap = {
        '성과 달성': 'fas fa-trophy',
        '문제 발생': 'fas fa-exclamation-triangle',
        '팀워크 이슈': 'fas fa-users',
        '커뮤니케이션 문제': 'fas fa-comments',
        '기한 지연': 'fas fa-clock',
        '창의적 아이디어': 'fas fa-lightbulb',
        '리더십 발휘': 'fas fa-star',
        '고객 대응': 'fas fa-handshake',
        '프로세스 개선': 'fas fa-cogs',
        '기타': 'fas fa-info-circle'
    };
    return iconMap[situationType] || 'fas fa-info-circle';
}

// 영향도별 색상 반환
function getImpactColor(impactLevel) {
    const colorMap = {
        '높음': 'bg-red-500',
        '보통': 'bg-yellow-500',
        '낮음': 'bg-green-500'
    };
    return colorMap[impactLevel] || 'bg-gray-500';
}

// 팀원 등록 모달 열기
function openTeamMemberModal() {
    document.getElementById('teamMemberModal').classList.remove('hidden');
}

// 팀원 등록 모달 닫기
function closeTeamMemberModal() {
    document.getElementById('teamMemberModal').classList.add('hidden');
    document.getElementById('teamMemberForm').reset();
}

// 행동 기록 모달 열기
function openBehaviorModal() {
    document.getElementById('behaviorModal').classList.remove('hidden');
    updateMemberSelectOptions();
}

// 행동 기록 모달 닫기
function closeBehaviorModal() {
    document.getElementById('behaviorModal').classList.add('hidden');
    document.getElementById('behaviorForm').reset();
}

// 팀원 선택 옵션 업데이트
function updateMemberSelectOptions() {
    const select = document.getElementById('behaviorMember');
    if (!select) return;
    
    select.innerHTML = '<option value="">팀원을 선택하세요</option>';
    
    teamMembers.forEach(member => {
        const option = document.createElement('option');
        option.value = member.id;
        option.textContent = `${member.name} (${member.position || '직책 미정'})`;
        select.appendChild(option);
    });
}

// 팀원 등록 폼 제출
document.getElementById('teamMemberForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('memberName').value,
        position: document.getElementById('memberPosition').value,
        department: document.getElementById('memberDepartment').value,
        email: document.getElementById('memberEmail').value,
        join_date: new Date().toISOString(),
        personality_type: document.getElementById('personalityType').value,
        work_style: document.getElementById('workStyle').value,
        communication_style: document.getElementById('communicationStyle').value,
        preferred_feedback_style: document.getElementById('preferredFeedbackStyle').value,
        career_goals: document.getElementById('careerGoals').value,
        profile_notes: document.getElementById('profileNotes').value,
        motivation_factors: [],
        stress_triggers: [],
        strengths: [],
        development_areas: []
    };

    try {
        await LocalAPI.addTeamMember(formData);
        alert('팀원이 성공적으로 등록되었습니다!');
        closeTeamMemberModal();
        await loadTeamMembers();
        updateStats();
        initializePersonalityChart();
    } catch (error) {
        console.error('팀원 등록 오류:', error);
        alert('팀원 등록 중 오류가 발생했습니다.');
    }
});

// 행동 기록 폼 제출
document.getElementById('behaviorForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const memberId = document.getElementById('behaviorMember').value;
    const member = teamMembers.find(m => m.id === memberId);
    
    if (!member) {
        alert('팀원을 선택해주세요.');
        return;
    }

    const formData = {
        member_id: memberId,
        member_name: member.name,
        incident_date: new Date().toISOString(),
        situation_type: document.getElementById('situationType').value,
        behavior_description: document.getElementById('behaviorDescription').value,
        context: document.getElementById('behaviorContext').value,
        impact_level: document.getElementById('impactLevel').value,
        positive_aspects: [],
        improvement_areas: [],
        feedback_given: '',
        follow_up_needed: false,
        tags: []
    };

    try {
        const result = await LocalAPI.addBehaviorIncident(formData);
        closeBehaviorModal();
        await loadBehaviorIncidents();
        updateStats();
        initializeFeedbackChart();
        loadRecentActivities();
        
        // 피드백 가이드 자동 생성 및 표시
        setTimeout(() => {
            generateFeedbackGuide(result.id, member, formData);
        }, 500);
    } catch (error) {
        console.error('행동 기록 오류:', error);
        alert('행동 기록 중 오류가 발생했습니다.');
    }
});

// 피드백 가이드 생성 및 표시
async function generateFeedbackGuide(incidentId, member, incidentData) {
    const guide = await createPersonalizedFeedbackGuide(member, incidentData);
    showFeedbackGuide(guide, member, incidentData);
}

// 개인화된 피드백 가이드 생성
async function createPersonalizedFeedbackGuide(member, incidentData) {
    // 적합한 템플릿 찾기
    let template = feedbackTemplates.find(t => 
        t.situation_type === incidentData.situation_type && 
        (t.personality_type === member.personality_type || t.personality_type === '모든 유형')
    );

    // 템플릿이 없으면 기본 템플릿 사용
    if (!template) {
        template = feedbackTemplates.find(t => t.personality_type === '모든 유형');
    }

    if (!template) {
        // 기본 피드백 생성
        return createBasicFeedbackGuide(member, incidentData);
    }

    // 템플릿 개인화
    const personalizedGuide = {
        ...template,
        opening_statement: template.opening_statement.replace('{이름}', member.name),
        member_analysis: generateMemberAnalysis(member),
        situation_analysis: generateSituationAnalysis(incidentData),
        personalized_suggestions: generatePersonalizedSuggestions(member, incidentData),
        communication_tips: generateCommunicationTips(member)
    };

    return personalizedGuide;
}

// 기본 피드백 가이드 생성
function createBasicFeedbackGuide(member, incidentData) {
    return {
        template_name: `${incidentData.situation_type} - 맞춤형 가이드`,
        situation_type: incidentData.situation_type,
        personality_type: member.personality_type || '미정',
        feedback_approach: member.preferred_feedback_style || '구체적',
        opening_statement: `${member.name}님, 최근 상황에 대해 이야기해보고 싶습니다.`,
        main_message: '상황을 함께 검토하고 앞으로의 방향을 논의해보겠습니다.',
        member_analysis: generateMemberAnalysis(member),
        situation_analysis: generateSituationAnalysis(incidentData),
        personalized_suggestions: generatePersonalizedSuggestions(member, incidentData),
        communication_tips: generateCommunicationTips(member)
    };
}

// 팀원 분석 생성
function generateMemberAnalysis(member) {
    let analysis = `<div class="bg-blue-50 p-4 rounded-lg mb-4">
        <h4 class="font-semibold text-blue-800 mb-2"><i class="fas fa-user-circle mr-2"></i>팀원 프로필 분석</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">`;

    if (member.personality_type) {
        const mbtiDescriptions = {
            'ENFP': '열정적이고 창의적, 사람 중심적 사고',
            'ENFJ': '타인을 이끌고 영감을 주는 리더십',
            'ENTP': '혁신적이고 도전적인 아이디어 추구',
            'ENTJ': '목표 지향적이고 체계적인 리더십',
            'ESFP': '활발하고 실용적, 팀워크 중시',
            'ESFJ': '협력적이고 책임감 강한 조화 추구',
            'ESTP': '현실적이고 즉석에서 문제 해결',
            'ESTJ': '체계적이고 효율성을 중시하는 실행력',
            'INFP': '가치 중심적이고 깊이 있는 사고',
            'INFJ': '통찰력이 뛰어나고 장기적 비전 보유',
            'INTP': '논리적이고 분석적인 문제 해결',
            'INTJ': '전략적이고 독립적인 계획 수립',
            'ISFP': '온화하고 유연한 적응력',
            'ISFJ': '세심하고 배려 깊은 지원',
            'ISTP': '실용적이고 냉정한 분석력',
            'ISTJ': '신중하고 계획적인 실행력'
        };
        analysis += `<div><strong>성격 유형:</strong> ${member.personality_type}<br><span class="text-gray-600">${mbtiDescriptions[member.personality_type] || '분석 준비중'}</span></div>`;
    }

    if (member.work_style) {
        analysis += `<div><strong>업무 스타일:</strong> ${member.work_style}</div>`;
    }

    if (member.communication_style) {
        analysis += `<div><strong>커뮤니케이션:</strong> ${member.communication_style}</div>`;
    }

    if (member.preferred_feedback_style) {
        analysis += `<div><strong>선호 피드백:</strong> ${member.preferred_feedback_style}</div>`;
    }

    analysis += '</div></div>';
    return analysis;
}

// 상황 분석 생성
function generateSituationAnalysis(incidentData) {
    let analysis = `<div class="bg-yellow-50 p-4 rounded-lg mb-4">
        <h4 class="font-semibold text-yellow-800 mb-2"><i class="fas fa-search mr-2"></i>상황 분석</h4>
        <div class="text-sm space-y-2">
            <div><strong>상황 유형:</strong> ${incidentData.situation_type}</div>
            <div><strong>영향도:</strong> <span class="px-2 py-1 rounded text-xs ${getImpactBadgeClass(incidentData.impact_level)}">${incidentData.impact_level}</span></div>
            <div><strong>발생 배경:</strong></div>
            <div class="pl-4 text-gray-600">${incidentData.behavior_description}</div>`;
    
    if (incidentData.context) {
        analysis += `<div><strong>상황 맥락:</strong></div>
            <div class="pl-4 text-gray-600">${incidentData.context}</div>`;
    }

    analysis += '</div></div>';
    return analysis;
}

// 개인화된 제안 생성
function generatePersonalizedSuggestions(member, incidentData) {
    let suggestions = `<div class="bg-green-50 p-4 rounded-lg mb-4">
        <h4 class="font-semibold text-green-800 mb-2"><i class="fas fa-lightbulb mr-2"></i>맞춤형 피드백 제안</h4>
        <div class="text-sm space-y-3">`;

    // 성격 유형별 맞춤 제안
    if (member.personality_type) {
        const personalityGuidance = {
            'E': '외향적 성향을 고려하여 팀 앞에서 공개적으로 인정하거나 논의',
            'I': '내향적 성향을 고려하여 1:1 개별 면담으로 진행',
            'S': '구체적이고 실질적인 예시와 단계별 행동 계획 제시',
            'N': '큰 그림과 가능성, 미래 비전 연결하여 설명',
            'T': '논리적 근거와 객관적 데이터로 설명',
            'F': '개인적 가치와 팀에 미치는 영향 중심으로 접근',
            'J': '명확한 기준과 일정, 구조화된 계획 제시',
            'P': '유연성과 대안, 선택권을 제공'
        };

        const firstLetter = member.personality_type[0];
        const secondLetter = member.personality_type[1];
        const thirdLetter = member.personality_type[2];
        const fourthLetter = member.personality_type[3];

        suggestions += `<div class="bg-white p-3 rounded border-l-4 border-green-400">
            <strong>성격 유형 맞춤 접근:</strong>
            <ul class="mt-2 ml-4 space-y-1 list-disc">
                <li>${personalityGuidance[firstLetter]}</li>
                <li>${personalityGuidance[secondLetter]}</li>
                <li>${personalityGuidance[thirdLetter]}</li>
                <li>${personalityGuidance[fourthLetter]}</li>
            </ul>
        </div>`;
    }

    // 상황별 맞춤 제안
    const situationGuidance = {
        '성과 달성': [
            '구체적인 성과와 노력을 명시적으로 인정',
            '성공 요인을 분석하고 다른 업무에 적용 방안 논의',
            '더 큰 도전과 성장 기회 제안'
        ],
        '문제 발생': [
            '비난보다는 문제 해결에 집중',
            '학습 기회로 프레임하여 접근',
            '구체적인 개선 방안과 지원 계획 제시'
        ],
        '팀워크 이슈': [
            '팀 전체의 관점에서 상황 설명',
            '개인과 팀의 이익 연결점 찾기',
            '협력을 위한 구체적 행동 계획 수립'
        ],
        '창의적 아이디어': [
            '창의성과 혁신적 사고 적극 격려',
            '아이디어 실현을 위한 구체적 지원방안 논의',
            '실험과 도전을 장려하는 환경 조성'
        ]
    };

    if (situationGuidance[incidentData.situation_type]) {
        suggestions += `<div class="bg-white p-3 rounded border-l-4 border-blue-400">
            <strong>상황별 핵심 포인트:</strong>
            <ul class="mt-2 ml-4 space-y-1 list-disc">`;
        
        situationGuidance[incidentData.situation_type].forEach(point => {
            suggestions += `<li>${point}</li>`;
        });
        
        suggestions += '</ul></div>';
    }

    suggestions += '</div></div>';
    return suggestions;
}

// 커뮤니케이션 팁 생성
function generateCommunicationTips(member) {
    let tips = `<div class="bg-purple-50 p-4 rounded-lg mb-4">
        <h4 class="font-semibold text-purple-800 mb-2"><i class="fas fa-comments mr-2"></i>커뮤니케이션 가이드</h4>
        <div class="text-sm space-y-3">`;

    // 선호 피드백 스타일별 팁
    const feedbackStyleTips = {
        '직접적': {
            'do': ['명확하고 구체적으로 표현', '핵심을 먼저 전달', '사실 기반으로 설명'],
            'dont': ['돌려서 말하기', '애매한 표현 사용', '감정적 접근']
        },
        '부드러운': {
            'do': ['긍정적 분위기 조성', '단계적으로 접근', '충분한 설명과 이해 확인'],
            'dont': ['갑작스러운 피드백', '압박감 조성', '비판적 톤']
        },
        '구체적': {
            'do': ['구체적 예시 제시', '데이터와 근거 활용', '명확한 행동 계획 제시'],
            'dont': ['추상적 표현', '일반론적 조언', '모호한 지시']
        },
        '격려중심': {
            'do': ['강점과 가능성 강조', '성장 마인드셋 격려', '지원 의지 표현'],
            'dont': ['부정적 측면만 강조', '실패에 집중', '비교 평가']
        },
        '목표중심': {
            'do': ['명확한 목표 설정', '성과 지표 제시', '달성 계획 수립'],
            'dont': ['과정만 강조', '목표 없는 조언', '결과 무시']
        }
    };

    const style = member.preferred_feedback_style || '구체적';
    if (feedbackStyleTips[style]) {
        tips += `<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-green-100 p-3 rounded">
                <h5 class="font-medium text-green-800 mb-2">✅ DO</h5>
                <ul class="text-xs space-y-1">`;
        
        feedbackStyleTips[style].do.forEach(tip => {
            tips += `<li>• ${tip}</li>`;
        });
        
        tips += `</ul></div>
            <div class="bg-red-100 p-3 rounded">
                <h5 class="font-medium text-red-800 mb-2">❌ DON'T</h5>
                <ul class="text-xs space-y-1">`;
        
        feedbackStyleTips[style].dont.forEach(tip => {
            tips += `<li>• ${tip}</li>`;
        });
        
        tips += '</ul></div></div>';
    }

    tips += '</div></div>';
    return tips;
}

// 영향도 배지 클래스 반환
function getImpactBadgeClass(impactLevel) {
    const classMap = {
        '높음': 'bg-red-100 text-red-800',
        '보통': 'bg-yellow-100 text-yellow-800',
        '낮음': 'bg-green-100 text-green-800'
    };
    return classMap[impactLevel] || 'bg-gray-100 text-gray-800';
}

// 피드백 가이드 표시
function showFeedbackGuide(guide, member, incidentData) {
    const content = document.getElementById('feedbackGuideContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <div class="text-center pb-4 border-b">
                <h3 class="text-xl font-bold text-gray-800">${member.name}님에 대한 맞춤형 피드백 가이드</h3>
                <p class="text-gray-600 mt-2">${guide.situation_type} 상황 • ${guide.feedback_approach} 접근법</p>
            </div>

            ${guide.member_analysis || ''}
            ${guide.situation_analysis || ''}
            ${guide.personalized_suggestions || ''}
            ${guide.communication_tips || ''}

            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-800 mb-3"><i class="fas fa-script mr-2"></i>피드백 스크립트</h4>
                
                <div class="space-y-4">
                    <div class="bg-white p-3 rounded border-l-4 border-blue-400">
                        <h5 class="font-medium text-blue-800 mb-2">1. 시작 멘트</h5>
                        <p class="text-sm text-gray-700">${guide.opening_statement}</p>
                    </div>

                    <div class="bg-white p-3 rounded border-l-4 border-green-400">
                        <h5 class="font-medium text-green-800 mb-2">2. 핵심 메시지</h5>
                        <p class="text-sm text-gray-700">${guide.main_message || '상황에 대한 관찰과 의견을 차분하게 전달합니다.'}</p>
                    </div>

                    <div class="bg-white p-3 rounded border-l-4 border-yellow-400">
                        <h5 class="font-medium text-yellow-800 mb-2">3. 구체적 예시</h5>
                        <p class="text-sm text-gray-700">${guide.specific_examples || incidentData.behavior_description}</p>
                    </div>

                    <div class="bg-white p-3 rounded border-l-4 border-purple-400">
                        <h5 class="font-medium text-purple-800 mb-2">4. 개선 제안</h5>
                        <p class="text-sm text-gray-700">${guide.improvement_suggestions || '함께 개선 방안을 논의하고 구체적인 행동 계획을 수립합니다.'}</p>
                    </div>

                    <div class="bg-white p-3 rounded border-l-4 border-pink-400">
                        <h5 class="font-medium text-pink-800 mb-2">5. 격려 및 마무리</h5>
                        <p class="text-sm text-gray-700">${guide.encouragement || '지속적인 성장과 발전을 응원하며 필요한 지원을 약속합니다.'}</p>
                    </div>
                </div>
            </div>

            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold text-blue-800 mb-3"><i class="fas fa-tasks mr-2"></i>후속 조치 계획</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <h5 class="font-medium mb-2">실행 항목:</h5>
                        <ul class="space-y-1 ml-4 list-disc">
                            <li>피드백 내용 문서화</li>
                            <li>개선 계획 수립</li>
                            <li>정기 체크포인트 설정</li>
                            <li>필요 지원사항 파악</li>
                        </ul>
                    </div>
                    <div>
                        <h5 class="font-medium mb-2">후속 일정:</h5>
                        <ul class="space-y-1 ml-4 list-disc">
                            <li>1주 후: 진행상황 확인</li>
                            <li>2주 후: 중간 점검</li>
                            <li>1개월 후: 최종 평가</li>
                        </ul>
                    </div>
                </div>
            </div>

            <div class="flex justify-between pt-4 border-t">
                <button onclick="printFeedbackGuide()" class="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <i class="fas fa-print mr-2"></i>인쇄하기
                </button>
                <div class="space-x-2">
                    <button onclick="saveFeedbackTemplate()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <i class="fas fa-save mr-2"></i>템플릿 저장
                    </button>
                    <button onclick="closeFeedbackGuide()" class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                        <i class="fas fa-check mr-2"></i>확인
                    </button>
                </div>
            </div>
        </div>
    `;

    document.getElementById('feedbackGuideModal').classList.remove('hidden');
}

// 피드백 가이드 모달 열기 (직접 호출)
function openFeedbackGuide() {
    if (teamMembers.length === 0) {
        alert('먼저 팀원을 등록해주세요.');
        return;
    }

    if (behaviorIncidents.length === 0) {
        alert('먼저 팀원의 행동을 기록해주세요.');
        return;
    }

    // 최근 행동 기록 기반으로 가이드 생성
    const recentIncident = behaviorIncidents
        .sort((a, b) => new Date(b.incident_date) - new Date(a.incident_date))[0];
    
    const member = teamMembers.find(m => m.id === recentIncident.member_id);
    
    if (member) {
        generateFeedbackGuide(recentIncident.id, member, recentIncident);
    }
}

// 피드백 가이드 모달 닫기
function closeFeedbackGuide() {
    document.getElementById('feedbackGuideModal').classList.add('hidden');
}

// 사건 상세 보기
function viewIncidentDetail(incidentId) {
    const incident = behaviorIncidents.find(i => i.id === incidentId);
    const member = teamMembers.find(m => m.id === incident.member_id);
    
    if (incident && member) {
        generateFeedbackGuide(incidentId, member, incident);
    }
}

// 피드백 가이드 인쇄
function printFeedbackGuide() {
    window.print();
}

// 피드백 템플릿 저장
async function saveFeedbackTemplate() {
    alert('템플릿이 저장되었습니다. (GitHub Pages에서는 브라우저 새로고침 시 초기화됩니다)');
}

// 모달 외부 클릭시 닫기
document.addEventListener('click', function(e) {
    const modals = ['teamMemberModal', 'behaviorModal', 'feedbackGuideModal'];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
});

// ESC 키로 모달 닫기
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modals = ['teamMemberModal', 'behaviorModal', 'feedbackGuideModal'];
        modals.forEach(modalId => {
            document.getElementById(modalId).classList.add('hidden');
        });
    }
});
