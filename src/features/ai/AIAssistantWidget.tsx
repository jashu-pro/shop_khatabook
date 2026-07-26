import React, { useState } from 'react';
import { useAppStore } from '../../stores/useAppStore';
import { Mic, Sparkles, CheckCircle2, Sun, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

export const AIAssistantWidget: React.FC = () => {
  const { processVoiceAICommand, confirmAIAction } = useAppStore();
  const [isRecording, setIsRecording] = useState(false);
  const [voicePrompt, setVoicePrompt] = useState('Venkatesh bought 2 rice bags for 2900, paid 1000');
  const [parsedPreview, setParsedPreview] = useState<any | null>(null);
  const [activeQueryAnswer, setActiveQueryAnswer] = useState<string | null>(null);

  const handleSimulateVoiceInput = () => {
    setIsRecording(true);
    setTimeout(() => {
      setIsRecording(false);
      const parsed = processVoiceAICommand(voicePrompt);
      setParsedPreview(parsed);
    }, 1200);
  };

  const handleConfirmAI = () => {
    if (parsedPreview) {
      confirmAIAction(parsedPreview);
      confetti({ particleCount: 50, spread: 60 });
      setParsedPreview(null);
    }
  };

  const handleRunAIQuery = (query: string) => {
    if (query.includes('20,000') || query.includes('owing') || query.includes('overdue')) {
      setActiveQueryAnswer('AI Found 1 Customer owing over ₹20,000: Srinivasulu (Anantapur) — Overdue balance: ₹6,000 (Last payment 45 days ago).');
    } else if (query.includes('collections') || query.includes('today')) {
      setActiveQueryAnswer('AI Collection Forecast: Today\'s expected collections target is ₹3,500 based on customer promise dates.');
    } else {
      setActiveQueryAnswer('AI Search Analysis: Top selling product this week is Sona Masoori Rice (35 bags sold).');
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div>
          <h2>AI Retail Assistant</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Voice Transaction Entry & Smart Business Intelligence</p>
        </div>
      </div>

      {/* Daily Morning AI Summary Card */}
      <div style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', color: 'white', borderRadius: '16px', padding: '16px 18px', marginBottom: 16, boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '11px', background: 'rgba(255,255,255,0.2)', width: 'fit-content', padding: '3px 10px', borderRadius: '9999px', fontWeight: 700 }}>
          <Sun size={13} />
          Today's AI Morning Summary
        </div>
        <h3 style={{ color: 'white', fontSize: '16px', marginTop: 8 }}>Good Morning, Shopkeeper!</h3>
        <p style={{ fontSize: '12px', opacity: 0.9, marginTop: 4, lineHeight: 1.4 }}>
          Today's expected collections: <strong>₹3,500</strong>. Srinivasulu has an overdue debt of ₹6,000 (60+ days). 1 product (Tata Salt) is low in stock!
        </p>
      </div>

      {/* Voice Entry Mic Card */}
      <div style={{ background: 'var(--bg-card)', borderRadius: '16px', padding: '20px', border: '1px solid var(--border-light)', textAlign: 'center', marginBottom: 16, boxShadow: 'var(--shadow-sm)' }}>
        <h3 style={{ fontSize: '16px', marginBottom: 6 }}>AI Voice Transaction Entry</h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: 14 }}>
          Tap Mic & Speak naturally e.g., <em>"Venkatesh bought 2 rice bags for ₹2,900, paid ₹1,000"</em>
        </p>

        <div style={{ marginBottom: 12 }}>
          <input
            type="text"
            className="input-field"
            value={voicePrompt}
            onChange={(e) => setVoicePrompt(e.target.value)}
            style={{ textAlign: 'center', fontSize: '13px' }}
          />
        </div>

        <button
          onClick={handleSimulateVoiceInput}
          className={isRecording ? 'pulse-mic' : ''}
          style={{
            width: 64, height: 64, borderRadius: '50%',
            background: isRecording ? 'var(--debt-600)' : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
            color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 10px', cursor: 'pointer', boxShadow: '0 8px 20px rgba(99, 102, 241, 0.4)'
          }}
        >
          <Mic size={28} />
        </button>

        <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
          {isRecording ? 'Listening & Parsing Speech...' : 'Tap Mic to Process Voice'}
        </div>
      </div>

      {/* Human-in-the-Loop Safe AI Preview Modal */}
      {parsedPreview && (
        <div className="modal-overlay" onClick={() => setParsedPreview(null)}>
          <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={20} style={{ color: '#8b5cf6' }} />
              <div>
                <h2>AI Voice Draft Preview</h2>
                <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Review details before confirming to database</p>
              </div>
            </div>

            <div style={{ background: 'var(--khatta-50)', border: '1px solid var(--khatta-100)', padding: '14px', borderRadius: '12px', marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Target Customer:</span>
                <strong style={{ fontSize: '14px', color: 'var(--khatta-800)' }}>{parsedPreview.customer_name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Action Type:</span>
                <strong style={{ fontSize: '13px' }}>{parsedPreview.type}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Total Amount:</span>
                <strong style={{ fontSize: '14px', color: 'var(--debt-600)' }}>₹{parsedPreview.total_amount}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cash Paid Now:</span>
                <strong style={{ fontSize: '14px', color: 'var(--khatta-600)' }}>₹{parsedPreview.amount_paid}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn-secondary" onClick={() => setParsedPreview(null)}>
                Cancel / Edit
              </button>
              <button className="btn-primary" onClick={handleConfirmAI}>
                <CheckCircle2 size={18} />
                Confirm & Save to Khatta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Smart Query Engine */}
      <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '16px', border: '1px solid var(--border-light)' }}>
        <h3 style={{ fontSize: '14px', marginBottom: 10 }}>AI Natural Language Queries</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {[
            'Show customers owing over ₹20,000',
            'Which customers haven\'t paid in 60 days?',
            'What are today\'s expected collections?'
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleRunAIQuery(q)}
              style={{
                textAlign: 'left', padding: '10px 12px', borderRadius: '10px',
                background: 'var(--border-subtle)', border: '1px solid var(--border-light)',
                fontSize: '12px', fontWeight: 600, color: 'var(--text-main)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8
              }}
            >
              <HelpCircle size={14} style={{ color: '#8b5cf6' }} />
              {q}
            </button>
          ))}
        </div>

        {activeQueryAnswer && (
          <div style={{ background: '#f5f3ff', border: '1px solid #ddd6fe', color: '#5b21b6', padding: '12px', borderRadius: '10px', fontSize: '12px', lineHeight: 1.4 }}>
            <strong>AI Response:</strong> {activeQueryAnswer}
          </div>
        )}
      </div>
    </div>
  );
};
