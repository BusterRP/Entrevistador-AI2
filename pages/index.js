import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState('start');
  const [language, setLanguage] = useState('');
  const [question, setQuestion] = useState('');
  const [response, setResponse] = useState('');
  const [feedback, setFeedback] = useState('');
  const [history, setHistory] = useState([]);

  const startInterview = async () => {
    const res = await fetch('/api/entrevista', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 'start',
        language
      })
    });
    const data = await res.json();
    setQuestion(data.question);
    setStep('interview');
  };

  const submitResponse = async () => {
    const newHistory = [...history, { question, response }];
    const res = await fetch('/api/entrevista', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        step: 'continue',
        language,
        response,
        history: newHistory
      })
    });
    const data = await res.json();
    if (data.done) {
      setFeedback(data.feedback);
      setStep('done');
    } else {
      setQuestion(data.question);
      setHistory(newHistory);
      setResponse('');
    }
  };

  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Entrevistador AI</h1>

      {step === 'start' && (
        <>
          <p>Selecciona l'idioma de l'entrevista:</p>
          <button onClick={() => setLanguage('cat')}>Català</button>
          <button onClick={() => setLanguage('esp')}>Castellano</button>
          <br /><br />
          <button onClick={startInterview}>Començar entrevista</button>
        </>
      )}

      {step === 'interview' && (
        <>
          <p><strong>{question}</strong></p>
          <textarea
            rows={4}
            style={{ width: '100%' }}
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
          <br />
          <button onClick={submitResponse}>Enviar resposta</button>
        </>
      )}

      {step === 'done' && (
        <>
          <p><strong>Veredicte final:</strong></p>
          <p>{feedback}</p>
        </>
      )}
    </div>
  );
}
