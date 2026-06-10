import { analyzeCase } from './api';

const LAW_API_KEY = import.meta.env.VITE_LAW_API_KEY;

// AI로 다양한 각도의 법률 키워드 추출
async function extractLegalKeywords(category, situation, answers) {
  const answersText = Object.entries(answers || {})
    .filter(([, v]) => v.trim() !== '')
    .map(([q, a]) => `${q}: ${a}`)
    .join(', ');

  const prompt = `너는 한국 대법원 판례 검색 키워드를 뽑는 전문가야.
대법원 API는 '사건명' 필드만 검색해. 사건명은 죄명/소송종류 위주야.
(예: "교통사고처리특례법위반(치상)", "특정범죄가중처벌등에관한법률위반(도주치상)", "손해배상(자)", "보증금반환", "사기")

아래 상황에 맞는 사건명에 들어갈 법한 키워드를 8~10개 뽑아줘.
일상 용어나 추상적 법리 용어("안전거리 미확보", "과실비율 산정")는 사건명에 없으니 절대 쓰지 마.
반드시 죄명, 법령명, 소송명 형태로 짧게 (2~12글자).

카테고리: ${category}
상황: ${situation}
추가정보: ${answersText}

좋은 예시 (교통사고):
교통사고처리특례법위반, 도주치상, 특정범죄가중처벌, 손해배상(자), 도로교통법위반, 음주운전, 사고후미조치, 무면허운전

좋은 예시 (절도):
절도, 상습절도, 야간주거침입절도, 특수절도, 점유이탈물횡령

좋은 예시 (사기):
사기, 특정경제범죄가중처벌, 전자금융거래법위반, 컴퓨터등사용사기

좋은 예시 (임대차):
보증금반환, 임대차보증금, 건물명도, 임차권등기명령

형식: 키워드1, 키워드2, 키워드3 ... (쉼표로 구분, 다른 말 절대 금지)`;

  try {
    const result = await analyzeCase(prompt);
    const keywords = result.trim()
      .split(',')
      .map(k => k.trim().replace(/\n/g, '').replace(/\d+\.\s*/g, '').trim())
      .filter(k => k.length > 1 && k.length < 20);
    console.log(`AI 추출 키워드 (${keywords.length}개):`, keywords);
    return keywords;
  } catch (err) {
    console.error('키워드 추출 실패:', err);
    const fallback = {
      '임대차 분쟁': ['임대차 보증금', '보증금 반환', '계약 해지', '주택임대차'],
      '절도': ['절도 고의성', '불법영득 의사', '절도 기소유예', '절도 합의'],
      '사기': ['사기 편취', '기망행위', '사기 손해배상', '형사고소'],
      '교통사고': ['교통사고 과실비율', '안전거리 미확보', '추돌사고', '손해배상'],
      '온라인 거래 사기': ['전자상거래 사기', '미배송 환불', '온라인 사기'],
    };
    return fallback[category] || [category];
  }
}

// 단일 키워드로 판례 검색
async function searchByKeyword(keyword) {
  try {
    const url = `https://www.law.go.kr/DRF/lawSearch.do?OC=${LAW_API_KEY}&target=prec&type=JSON&display=5&query=${encodeURIComponent(keyword)}`;
    const response = await fetch(url);
    if (!response.ok) return [];
    const data = await response.json();
    const items = data?.PrecSearch?.prec || [];
    if (!Array.isArray(items)) return [];
    return items.map(item => ({
      id: item.판례일련번호,
      title: item.사건명,
      court: item.법원명,
      date: item.선고일자,
      caseNumber: item.사건번호,
      ruling: item.판결요지 || '',
      summary: item.판시사항 || '',
    }));
  } catch (err) {
    return [];
  }
}

// 판례 본문 가져오기
async function getCaseDetail(caseId) {
  try {
    const url = `https://www.law.go.kr/DRF/lawService.do?OC=${LAW_API_KEY}&target=prec&type=JSON&ID=${caseId}`;
    const response = await fetch(url);
    if (!response.ok) return null;
    const data = await response.json();
    const prec = data?.PrecService || {};
    return {
      content: prec.전문 || '',
      ruling: prec.판결요지 || '',
      summary: prec.판시사항 || '',
    };
  } catch (err) {
    return null;
  }
}

// AI로 내 상황과 가장 유사한 판례 선택
// AI로 내 상황과 가장 유사한 판례 선택
async function selectBestCases(cases, category, situation, answers) {
  if (cases.length === 0) return [];
  if (cases.length <= 5) return cases;

  const answersText = Object.entries(answers || {})
    .filter(([, v]) => v.trim() !== '')
    .map(([q, a]) => `${q}: ${a}`)
    .join(', ');

  const caseList = cases.map((c, i) =>
    `[${i + 1}번] ${c.title}`
  ).join('\n');

  const prompt = `아래 ${cases.length}개의 판례 중에서 사용자 상황과 가장 관련성 높은 판례를 정확히 5개 골라줘.
반드시 5개를 골라야 해. 1개나 2개만 고르면 안 돼.
답변은 숫자 5개를 쉼표로 구분한 형식으로만. 다른 말 절대 금지.

사용자 상황: ${situation}
추가정보: ${answersText}
카테고리: ${category}

판례 목록:
${caseList}

답변 형식 (반드시 5개 숫자, 쉼표 구분):
3, 7, 12, 18, 24`;

  try {
    const result = await analyzeCase(prompt);
    console.log('selectBestCases AI 응답 원문:', result);
    const indices = result.trim()
      .replace(/[^\d,]/g, '')
      .split(',')
      .map(n => parseInt(n.trim()) - 1)
      .filter(n => !isNaN(n) && n >= 0 && n < cases.length);
    console.log('파싱된 인덱스:', indices);

    // 5개 미만이면 앞쪽 판례로 채워서 무조건 5개 보장
    const selected = indices.slice(0, 5);
    if (selected.length < 5) {
      for (let i = 0; i < cases.length && selected.length < 5; i++) {
        if (!selected.includes(i)) selected.push(i);
      }
    }
    console.log('최종 선택 인덱스:', selected);
    return selected.map(i => cases[i]);
  } catch (err) {
    console.error('selectBestCases 오류:', err);
    return cases.slice(0, 5);
  }
}

export async function searchCases(situation, category, answers = {}) {
  try {
    // 1. AI로 다양한 키워드 추출
    const keywords = await extractLegalKeywords(category, situation, answers);
    console.log(`총 ${keywords.length}개 키워드로 검색 시작`);

    // 2. 키워드별 병렬 검색
    const searchResults = await Promise.all(
      keywords.map(kw => searchByKeyword(kw))
    );

    // 3. 중복 제거
    const allCases = [];
    const seenIds = new Set();
    searchResults.flat().forEach(c => {
      if (c.id && !seenIds.has(c.id)) {
        seenIds.add(c.id);
        allCases.push(c);
      }
    });
    console.log(`총 ${allCases.length}개 판례 수집 (중복 제거 후)`);

    if (allCases.length === 0) return [];

    // 4. AI로 가장 유사한 판례 선택
    const bestCases = await selectBestCases(allCases, category, situation, answers);
    console.log(`최종 ${bestCases.length}개 판례 선택`);

    // 5. 선택된 판례 본문 가져오기
    const detailedCases = await Promise.all(
      bestCases.map(async (c) => {
        const detail = await getCaseDetail(c.id);
        return detail
          ? { ...c, content: detail.content?.slice(0, 1000) || '', ruling: detail.ruling || c.ruling }
          : c;
      })
    );

    return detailedCases;
  } catch (err) {
    console.error('판례 검색 오류:', err);
    return [];
  }
}