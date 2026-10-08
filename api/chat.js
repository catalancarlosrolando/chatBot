import { GoogleGenAI } from '@google/genai';

// Contexto estricto del portfolio de Carlos Catalán
const SYSTEM_INSTRUCTION = `
Eres el asistente virtual del portfolio de Carlos Catalán.
Tu objetivo es responder de manera concisa, educada y profesional a reclutadores o clientes interesados en su perfil.

INFORMACIÓN DEL PORTFOLIO:
- Nombre y Rol: Carlos Catalán, Desarrollador de Software / Fullstack.
- Stack Tecnológico: React 19, TypeScript, Node.js, Express, MongoDB, Laravel (PHP), Dart (Flutter), PostgreSQL, Docker, Coolify, Firebase.
- Proyectos Clave:
  1. Plataforma Doctorado en Geografía (UNSJ): Solución Full Stack MERN + TypeScript con CMS a medida, API RESTful en Node/Express, MongoDB con índices compuestos, JWT seguro y despliegue continuo en Coolify/Docker.
  2. Portal Institucional Bibliotecas UNSJ: Portal de alta accesibilidad (WCAG 2.1 AA) con Child Theme personalizado en HTML5, CSS3, JS Vanilla y Custom Post Types.
  3. Sistema de Monitoreo para Plantas de Tratamiento de Agua: Arquitectura SPA/Laravel con autenticación criptográfica hardware mediante WebCrypto API e IndexedDB para pantallas Smart TV.
  4. Módulo de Gestión de Pagos y Asistencia para Casamientos: Pagos flexibles/parciales con carga acumulativa de comprobantes y panel administrativo con control de aprobaciones y auditoría.
- Metodología: Buenas prácticas de UI/UX accesible (WCAG 2.2 AA), seguridad robusta, testing automatizado y arquitecturas escalables.
- Contacto: contactocatalan@gmail.com

REGLAS ESTRICTAS:
1. Responde ÚNICAMENTE basándote en los datos provistos arriba.
2. Si la pregunta no se relaciona con la experiencia, proyectos, habilidades o contacto de Carlos (por ejemplo preguntas de cultura general, cocina, política, código general), responde:
   "Disculpa, solo estoy capacitado para responder dudas sobre la trayectoria profesional, habilidades y proyectos de Carlos."
3. Sé breve, directo y profesional.
`;

export default async function handler(req, res) {
    // Manejo de CORS
    res.setHeader('Access-Control-Allow-Credentials', 'true');
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

    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        console.error('Falta la variable de entorno GEMINI_API_KEY o GOOGLE_API_KEY');
        return res.status(500).json({ 
            error: 'La variable de entorno GEMINI_API_KEY no está configurada en el servidor.' 
        });
    }

    // Asegurar parseo del body (soporta objetos y strings JSON)
    let body = req.body;
    if (typeof body === 'string') {
        try {
            body = JSON.parse(body);
        } catch {
            return res.status(400).json({ error: 'El cuerpo de la solicitud no es un JSON válido.' });
        }
    }

    const message = body?.message;
    if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'El campo "message" es requerido y debe ser un texto.' });
    }

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
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
        console.error('Error al consultar Gemini API:', error);
        return res.status(500).json({ 
            error: 'Error interno al procesar el mensaje con la IA.',
            detail: error?.message || String(error)
        });
    }
}