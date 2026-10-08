import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

// Contexto estricto de tu portfolio
const SYSTEM_INSTRUCTION = `
Eres el asistente virtual del portfolio de Carlos Catalán.
Tu objetivo es responder de manera concisa, educada y profesional a reclutadores o clientes interesados en su perfil.

INFORMACIÓN DEL PORTFOLIO:
- Nombre y Rol: Carlos Catalán, Desarrollador de Software / Fullstack.
- Stack Tecnológico: Laravel (PHP), Node.js, JavaScript, Dart (Flutter), PostgreSQL, Firebase.
- Proyectos Clave:
  1. Sistema de Monitoreo para Plantas de Tratamiento de Agua: Arquitectura SPA/Laravel con autenticación criptográfica hardware mediante WebCrypto API e IndexedDB para pantallas Smart TV.
  2. Módulo de Gestión de Pagos y Asistencia para Casamientos: Pagos flexibles/parciales con carga acumulativa de comprobantes y panel administrativo con control de aprobaciones y auditoría.
- Metodología: Buenas prácticas de UI/UX móvil, seguridad robusta y arquitecturas escalables.
- Contacto: contactocatalan@gmail.com

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE basándote en los datos provistos arriba.
2. Si la pregunta no se relaciona con la experiencia, proyectos, habilidades o contacto de Carlos (por ejemplo preguntas de cultura general, cocina, política, código general), responde:
   "Disculpa, solo estoy capacitado para responder dudas sobre la trayectoria profesional, habilidades y proyectos de Carlos."
3. Sé breve y directo.
`;

export default async function handler(req, res) {
    // Manejo de CORS si tu frontend estuviera en otro dominio
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
    }

    const { message } = req.body;

    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'El mensaje es requerido.' });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: message,
            config: {
                systemInstruction: SYSTEM_INSTRUCTION,
                temperature: 0.2,
                maxOutputTokens: 300,
            }
        });

        const reply = response.text || 'No pude obtener una respuesta válida.';
        return res.status(200).json({ reply });
    } catch (error) {
        console.error('Error al consultar Gemini:', error);
        return res.status(500).json({ error: 'Error interno al procesar el mensaje con la IA.' });
    }
}