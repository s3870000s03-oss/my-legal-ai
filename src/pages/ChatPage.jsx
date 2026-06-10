import { useState, useEffect, useRef } from 'react';
import { analyzeCase } from '../utils/api';
import { buildPromptWithRealCases } from '../utils/promptBuilder';

const categories = ['임대차 분쟁', '절도', '사기', '교통사고', '온라인 거래 사기'];

const followUpQuestions = {
  '임대차 분쟁': ['보증금 금액이 얼마인가요?', '계약서가 있나요?', '내용증명을 보내셨나요?', '현재 거주 중인가요?'],
  '절도': ['초범인가요?', 'CCTV에 찍혔나요?', '피해 금액이 얼마인가요?', '피해자와 합의하셨나요?'],
  '사기': ['피해 금액이 얼마인가요?', '증거가 있나요?', '상대방과 연락이 되나요?', '고소하셨나요?'],
  '교통사고': ['보험에 가입되어 있나요?', '상대방 과실이 있나요?', '부상 정도가 어떻게 되나요?', '음주운전이었나요?'],
  '온라인 거래 사기': ['결제 방법이 무엇인가요?', '피해 금액이 얼마인가요?', '판매자와 연락이 되나요?', '증거 캡처가 있나요?'],
};

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('category');
  const [category, setCategory] = useState('');
  const [situation, setSituation] = useState('');
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const bottomRef = useRef(null);

  useEffect(() => {
    setMessages([{
      role: 'ai',
      content: '안녕하세요! 생활법률 AI 상담 서비스입니다. 어떤 법률 문제로 상담하시겠어요?',
      type: 'category'
    }]);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMessage = (role, content, type = 'text') => {
    setMessages(prev => [...prev, { role, content, type }]);
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setStep('situation');
    addMessage('user', cat);
    setTimeout(() => {
      addMessage('ai', `${cat} 관련 상담이군요. 구체적인 상황을 자유롭게 설명해주세요.`);
    }, 300);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userInput = input.trim();
    setInput('');
    addMessage('user', userInput);

    if (step === 'situation') {
      setSituation(userInput);
      setStep('questions');
      const questions = followUpQuestions[category];
      setTimeout(() => {
        addMessage('ai', `감사합니다. 더 정확한 분석을 위해 몇 가지 여쭤볼게요.\n\n${questions[0]}`);
      }, 300);
      return;
    }

    if (step === 'questions') {
      const questions = followUpQuestions[category];
      const currentQuestion = questions[questionIndex];
      const newAnswers = { ...answers, [currentQuestion]: userInput };
      setAnswers(newAnswers);

      if (questionIndex < questions.length - 1) {
        setQuestionIndex(prev => prev + 1);
        setTimeout(() => {
          addMessage('ai', questions[questionIndex + 1]);
        }, 300);
      } else {
        setStep('result');
        setLoading(true);
        setTimeout(() => {
          addMessage('ai', '모든 정보를 수집했습니다. 대법원 판례를 검색하고 분석 중입니다... ⚖️');
        }, 300);

        try {
          const prompt = await buildPromptWithRealCases(category, situation, newAnswers);
          const response = await analyzeCase(prompt);
          addMessage('ai', response, 'result');
          setTimeout(() => {
            addMessage('ai', '추가로 궁금한 점이 있으시면 편하게 물어보세요.');
            setStep('followup');
          }, 500);
        } catch (err) {
          addMessage('ai', '분석 중 오류가 발생했습니다. 다시 시도해주세요.');
          setStep('followup');
        }
        setLoading(false);
      }
      return;
    }

    if (step === 'followup') {
      setLoading(true);
      try {
        const context = `이전 상담 내용:
카테고리: ${category}
상황: ${situation}
추가 질문: ${userInput}

위 상담 내용을 바탕으로 추가 질문에 답변해줘. 반드시 한국어로. 끝에 면책 조항 포함.`;
        const response = await analyzeCase(context);
        addMessage('ai', response);
      } catch (err) {
        addMessage('ai', '오류가 발생했습니다. 다시 시도해주세요.');
      }
      setLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([{
      role: 'ai',
      content: '안녕하세요! 생활법률 AI 상담 서비스입니다. 어떤 법률 문제로 상담하시겠어요?',
      type: 'category'
    }]);
    setStep('category');
    setCategory('');
    setSituation('');
    setQuestionIndex(0);
    setAnswers({});
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#F8FAFC', fontFamily: 'sans-serif' }}>

      {/* 헤더 */}
      <div style={{ background: '#1B2A4A', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 18, color: '#fff', margin: 0 }}>⚖️ 생활법률 AI 상담</h1>
        <button onClick={handleReset} style={{ padding: '6px 14px', borderRadius: 6, border: '1px solid #93C5FD', background: 'none', color: '#93C5FD', cursor: 'pointer', fontSize: 13 }}>
          새 상담
        </button>
      </div>

      {/* 채팅 영역 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {messages.map((msg, i) => (
          <div key={i}>
            {msg.role === 'ai' && (
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1B2A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                  ⚖️
                </div>
                <div style={{ maxWidth: '75%' }}>
                  <div style={{
                    padding: '12px 16px',
                    background: '#fff',
                    borderRadius: '0 12px 12px 12px',
                    border: msg.type === 'result' ? '1px solid #2E75B6' : '1px solid #E2E8F0',
                    fontSize: 14,
                    lineHeight: 1.8,
                    color: '#333',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)'
                  }}>
                    {msg.content}
                  </div>
                  {msg.type === 'category' && step === 'category' && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 10 }}>
                      {categories.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleCategorySelect(cat)}
                          style={{ padding: '8px 14px', borderRadius: 20, border: '1px solid #2E75B6', background: '#EFF6FF', color: '#2E75B6', cursor: 'pointer', fontSize: 13, fontWeight: 'bold' }}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
            {msg.role === 'user' && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '75%',
                  padding: '12px 16px',
                  background: '#2E75B6',
                  borderRadius: '12px 0 12px 12px',
                  fontSize: 14,
                  color: '#fff',
                  lineHeight: 1.7,
                  wordBreak: 'break-word'
                }}>
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#1B2A4A', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>⚖️</div>
            <div style={{ padding: '12px 16px', background: '#fff', borderRadius: '0 12px 12px 12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: '#2E75B6', animation: `bounce 1s ${i * 0.2}s infinite` }} />
                ))}
                <span style={{ marginLeft: 8, fontSize: 13, color: '#64748B' }}>대법원 판례 검색 중...</span>
              </div>
              <style>{`@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }`}</style>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* 입력창 */}
      <div style={{ padding: '12px 16px', background: '#fff', borderTop: '1px solid #E2E8F0' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
            placeholder={
              step === 'category' ? '위 버튼에서 카테고리를 선택해주세요' :
              step === 'situation' ? '상황을 자유롭게 설명해주세요...' :
              step === 'questions' ? '답변을 입력해주세요...' :
              '추가로 궁금한 점을 물어보세요...'
            }
            disabled={step === 'category' || loading}
            style={{
              flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid #E2E8F0',
              fontSize: 14, outline: 'none', background: step === 'category' ? '#F8FAFC' : '#fff'
            }}
          />
          <button
            onClick={handleSend}
            disabled={step === 'category' || loading || !input.trim()}
            style={{
              width: 46, height: 46, borderRadius: '50%', border: 'none',
              background: step === 'category' || loading || !input.trim() ? '#CBD5E1' : '#2E75B6',
              color: '#fff', cursor: step === 'category' || loading || !input.trim() ? 'default' : 'pointer',
              fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ➤
          </button>
        </div>
        <p style={{ fontSize: 11, color: '#94A3B8', margin: '8px 0 0', textAlign: 'center' }}>
          ⚠️ 본 서비스는 참고용이며 법률 조언이 아닙니다
        </p>
      </div>
    </div>
  );
}