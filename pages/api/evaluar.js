export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { respuesta, idioma } = req.body;

  const promptBase = `
Eres un miembro del tribunal del ISPC (Institut de Seguretat Pública de Catalunya) y tu función es simular entrevistas reales de acceso al cuerpo de Mossos d'Esquadra. 
Evalúa esta respuesta de un candidato a la pregunta "Explica'm qui ets i per què ets aquí avui". 
Analiza las siguientes competencias: motivación, identificación con la organización, habilidades comunicativas y sinceridad. 

La respuesta debe recibir una puntuación del 1 al 10 y un pequeño feedback. 
Si la respuesta parece forzada, poco creíble o vacía, penalízalo. 
Devuelve una respuesta en ${idioma === 'cat' ? 'catalán' : 'castellano'} en este formato:

Puntuación: X/10  
Feedback: <análisis breve y profesional>
`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        { role: "system", content: promptBase },
        { role: "user", content: respuesta }
      ],
      temperature: 0.7,
    }),
  });

  const data = await openaiRes.json();
  const output = data.choices?.[0]?.message?.content || "No se pudo generar una respuesta.";

  return res.status(200).json({ feedback: output });
}
