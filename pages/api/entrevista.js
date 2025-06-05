export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const { step, language, response, history } = req.body;

  const intro = "Actua com un entrevistador del tribunal del ISPC. Simula una entrevista real per accedir al cos de Mossos d’Esquadra. Fes preguntes una per una, en un to institucional, seriós i objectiu. No parlis mai de competències ni del motiu de les preguntes. No justifiquis el que preguntes. Mantén el to directe, com si realment avaluessis el candidat. No donis feedback fins al final. Utilitza un català formal i administratiu.";


  if (step === 'start') {
    const prompt = intro + "\nComença amb la primera pregunta: Explica’m qui ets i per què ets aquí avui.";
    return res.status(200).json({ question: language === 'cat' ? "Explica’m qui ets i per què ets aquí avui." : "Explícame quién eres y por qué estás aquí hoy." });
  }

  if (step === 'continue') {
    const fullPrompt = [
      { role: 'system', content: intro },
      { role: 'user', content: `Historial de respostes: ${JSON.stringify(history)}\nÚltima resposta: ${response}\nQuina hauria de ser la següent pregunta?` }
    ];

    const completion = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: fullPrompt,
        temperature: 0.7
      })
    });

    const result = await completion.json();
    const newQuestion = result.choices?.[0]?.message?.content;

    const done = history.length >= 5; // provisional stop
    if (done) {
      const evalPrompt = [
        { role: 'system', content: intro },
        { role: 'user', content: `Avalua aquestes respostes: ${JSON.stringify([...history, { question: newQuestion, response }])}\nDona un feedback final detallat amb puntuació per competència i un veredicte Apto / No Apto.` }
      ];

      const evaluation = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: evalPrompt,
          temperature: 0.7
        })
      });

      const evalResult = await evaluation.json();
      const finalFeedback = evalResult.choices?.[0]?.message?.content;

      return res.status(200).json({ done: true, feedback: finalFeedback });
    }

    return res.status(200).json({ done: false, question: newQuestion });
  }
}
