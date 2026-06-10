import { useNavigate } from 'react-router-dom';

const categories = [
  { icon: '🏠', name: '임대차 분쟁', desc: '보증금 미반환, 월세 연체, 계약 해지, 수리 거부 등' },
  { icon: '🔒', name: '절도', desc: '고의성 여부, 초범 처리, 합의, 친족상도례 등' },
  { icon: '⚠️', name: '사기', desc: '중고거래 사기, 투자 사기, 보이스피싱, 전세 사기 등' },
  { icon: '🚗', name: '교통사고', desc: '과실 비율, 음주운전, 뺑소니, 보험 처리 등' },
  { icon: '💻', name: '온라인 거래 사기', desc: '미배송, 환불 거부, 가품 판매, 게임 사기 등' },
];

export default function InfoPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#F8FAFC', fontFamily: 'sans-serif' }}>

      {/* 헤더 */}
      <div style={{ background: '#1B2A4A', padding: '24px 20px', textAlign: 'center' }}>
        <h1 style={{ fontSize: 26, color: '#fff', margin: 0 }}>⚖️ 서비스 안내</h1>
        <p style={{ color: '#93C5FD', fontSize: 14, margin: '8px 0 0' }}>
          생활법률 AI 상담 에이전트 소개
        </p>
      </div>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '30px 20px' }}>

        {/* 서비스 소개 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 16, color: '#1B2A4A', marginTop: 0 }}>📌 이 서비스는 무엇인가요?</h3>
          <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>
            생활 속 법률 문제를 겪었을 때, 변호사 상담 전에 자신의 상황을 미리 파악할 수 있도록 도와주는 AI 분석 도구입니다.
            관련 법 조항과 유사 판례를 바탕으로 상황을 분석하고 예상 결과를 알려드립니다.
          </p>
        </div>

        {/* 지원 카테고리 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 16, color: '#1B2A4A', marginTop: 0, marginBottom: 16 }}>📂 지원 카테고리</h3>
          {categories.map(cat => (
            <div key={cat.name} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14, padding: 12, background: '#F8FAFC', borderRadius: 8 }}>
              <span style={{ fontSize: 24 }}>{cat.icon}</span>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', fontSize: 14, color: '#1B2A4A' }}>{cat.name}</p>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748B' }}>{cat.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 사용 방법 */}
        <div style={{ background: '#fff', borderRadius: 12, padding: 24, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <h3 style={{ fontSize: 16, color: '#1B2A4A', marginTop: 0, marginBottom: 16 }}>📖 사용 방법</h3>
          {[
            { step: '1', text: '카테고리를 선택하세요' },
            { step: '2', text: '상황을 자유롭게 설명하세요' },
            { step: '3', text: '보충 질문에 답변하세요 (선택)' },
            { step: '4', text: 'AI 법률 분석 요청 버튼을 누르세요' },
            { step: '5', text: '분석 결과를 확인하고 추가 질문을 해보세요' },
          ].map(item => (
            <div key={item.step} style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#2E75B6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold', flexShrink: 0 }}>
                {item.step}
              </div>
              <p style={{ margin: 0, fontSize: 14, color: '#475569' }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* 한계점 */}
        <div style={{ background: '#FEF2F2', borderRadius: 12, padding: 24, marginBottom: 24, borderLeft: '4px solid #DC2626' }}>
          <h3 style={{ fontSize: 16, color: '#DC2626', marginTop: 0 }}>⚠️ 반드시 알아두세요</h3>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 14, color: '#7F1D1D', lineHeight: 2 }}>
            <li>본 서비스는 <strong>법률 조언이 아닌 참고용 정보</strong>만 제공합니다</li>
            <li>분석 결과는 <strong>법적 효력이 없습니다</strong></li>
            <li>실제 법률 문제는 반드시 <strong>변호사와 상담</strong>하시기 바랍니다</li>
            <li>판례와 법령은 변경될 수 있으며, <strong>최신 정보와 다를 수 있습니다</strong></li>
          </ul>
        </div>

        {/* 상담 시작 버튼 */}
        <button
          onClick={() => navigate('/')}
          style={{ width: '100%', padding: 16, borderRadius: 12, border: 'none', background: '#1B2A4A', color: '#fff', fontSize: 16, fontWeight: 'bold', cursor: 'pointer' }}
        >
          ⚖️ 상담 시작하기
        </button>
      </div>
    </div>
  );
}