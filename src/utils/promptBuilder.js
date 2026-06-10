import cases from '../data/cases.json';
import laws from '../data/laws.json';
import { searchCases } from './lawApi';

function findLocalCases(category) {
  return cases.filter(c => c.category === category).slice(0, 3);
}

export async function buildPromptWithRealCases(category, situation, answers) {
  const relatedLaws = laws[category] || [];

  // 실시간 판례 검색
  let realCases = [];
  try {
    realCases = await searchCases(situation, category, answers);
  } catch (err) {
    console.log('실시간 판례 검색 실패, 로컬 데이터 사용');
  }

  const finalCases = realCases.length > 0 ? realCases : findLocalCases(category);

  const answersText = Object.entries(answers)
    .filter(([, v]) => v.trim() !== '')
    .map(([q, a]) => `${q} → ${a}`)
    .join('\n');

 const casesText = realCases.length > 0
    ? finalCases.map(c =>
        `- ${c.title} (${c.court}, ${c.date})
   사건번호: ${c.caseNumber}
   판결요지: ${c.ruling?.slice(0, 300) || ''}
   판례 본문 요약: ${c.content?.slice(0, 500) || '(본문 없음)'}...`
      ).join('\n\n')
    : finalCases.map(c =>
        `- ${c.title} (${c.court}, ${c.date})
   판결: ${c.ruling}
   핵심: ${c.keyPoints?.join(', ') || ''}`
      ).join('\n\n');

  return `[시스템 역할]
너는 한국 생활법률 분석 전문가야. 반드시 한국어로 답변해.
법률 조언이 아닌 참고용 분석만 제공해.
판례 API 검색 결과가 부족하거나 상황과 맞지 않으면, 네가 학습한 관련 판례 지식도 활용해서 보완해줘.
단, AI 지식으로 보완한 판례는 "(AI 지식 기반)" 이라고 표시해줘.

[관련 법 조항]
${relatedLaws.map(l => `- ${l.law}: ${l.content}`).join('\n')}

[판례 검색 결과 ${realCases.length > 0 ? `(대법원 API ${realCases.length}건 + AI 보완)` : '(AI 지식 기반)'}]
${casesText}

[사용자 상황]
카테고리: ${category}
상황: ${situation}
추가 정보:
${answersText}

[중요 분석 지침 - 반드시 따를 것]
- API로 찾은 판례와 내 상황을 구체적으로 비교해줘
- API 판례가 부족하면 네가 아는 관련 판례도 추가해서 "(AI 지식 기반)" 으로 표시해줘
- 판례와 내 상황의 같은 점, 다른 점을 명확히 설명해줘
- 과실 비율이나 판결이 다른 이유를 구체적으로 설명해줘
- 내 상황에서 유리한 증거와 불리한 요소를 분리해서 설명해줘
- 예상 결과는 구체적 수치(벌금 금액, 과실 %, 가능성 %)로 말해줘
- 지금 당장 해야 할 행동을 우선순위 순서로 알려줘

[응답 형식 - 반드시 아래 순서로 답변]
1. **적용 법 조항** - 해당 법 조항과 구체적 설명
2. **핵심 분석** - 이 상황의 핵심 쟁점과 유리/불리 요소
3. **유사 판례 비교 분석**
   - API 검색 판례와 내 상황 비교
   - AI 지식 기반 유사 판례 (API에서 못 찾은 경우)
   - 판례와 내 상황이 다른 점과 이유
   - 내 주장이 인정되려면 필요한 조건과 증거
4. **예상 결과**
   - 최선의 경우: (구체적 결과 + 확률 %)
   - 일반적인 경우: (구체적 결과 + 확률 %)
   - 최악의 경우: (구체적 결과 + 확률 %)
   - 과실 비율 예상: (% 범위)
   - 손해배상/벌금 예상 범위: (금액)
5. **해결 방안**
   - 지금 당장 해야 할 것 (우선순위 순서)
   - 유리한 증거 수집 방법
   - 합의 방법과 유리한 점
   - 법적 대응이 필요한 경우
6. **면책 조항** - "⚠️ 본 분석은 참고용이며 법률 조언이 아닙니다. 실제 문제는 변호사와 상담하세요."`;
}