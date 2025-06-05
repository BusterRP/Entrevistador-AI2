import { useState } from 'react';

export default function Home() {
  const [step, setStep] = useState('start');
  const [language, setLanguage] = useState('');
  const [inputMode, setInputMode] = useState('text');
  const [outputMode, setOutputMode] = useState('text');
  const [userResponse, setUserResponse] = useState('');
  const [feedback, setFeedback] = useState('');

  const startInterview = () => setStep('question');

const handleSubmit = async () => {
  const res = await fetch('/api/evaluar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      respuesta: userResponse,
      idioma: language
    })
  });

  const data = await res.json();
  setFeedback(data.feedback);
  setStep('feedback');
};


  return (
    <div style={{ padding: 20, fontFamily: 'Arial' }}>
      <h1>Entrevistador AI</h1>

      {step === 'start' && (
        <>
          <p>Selecciona el idioma:</p>
          <button onClick={() => setLanguage('cat')}>Català</button>
          <button onClick={() => setLanguage('esp')}>Castellano</button>

          <p>Forma de resposta:</p>
          <button onClick={() => setInputMode('text')}>Text</button>
          <button onClick={() => setInputMode('voice')}>Voz</button>

          <p>Resposta de l'entrevistador:</p>
          <button onClick={() => setOutputMode('text')}>Text</button>
          <button onClick={() => setOutputMode('voice')}>Voz</button>

          <br /><br />
          <button onClick={startInterview}>Començar entrevista</button>
        </>
      )}

      {step === 'question' && (
        <>
          <p><strong>{language === 'cat'
            ? "Explica’m qui ets i per què ets aquí avui."
            : "Explícame quién eres y por qué estás aquí hoy."}</strong></p>
          <textarea
            rows={4}
            style={{ width: '100%' }}
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
          />
          <br />
          <button onClick={handleSubmit}>Enviar resposta</button>
        </>
      )}

      {step === 'feedback' && (
        <>
          <p><strong>Feedback inicial:</strong></p>
          <p>{feedback}</p>
          <p>Per continuar amb l'entrevista completa, cal fer el pagament.</p>
        </>
      )}
    </div>
  );
}
