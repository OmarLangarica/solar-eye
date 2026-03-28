import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import 'dotenv/config';

const geminiApiKey = process.env.GEMINI_API_KEY;
console.log('API Key loaded:', !!geminiApiKey);

if (!geminiApiKey || geminiApiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY no configurada. Establece la variable de entorno en backend/.env o en el entorno de despliegue.');
}

const genAI = new GoogleGenerativeAI(geminiApiKey);
const modeloPreferido = process.env.GEMINI_MODEL || "gemini-1.5-flash";
const modelosFallback = [
    modeloPreferido,
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash-preview-tts",
    "gemini-2.5-pro-preview-tts"
];
console.log('Modelo preferido:', modeloPreferido);
console.log('Modelos fallback:', modelosFallback.join(', '));

const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const listarModelosDisponibles = async () => {
    try {
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models', {
            headers: {
                'x-goog-api-key': geminiApiKey,
                'Content-Type': 'application/json'
            }
        });
        const data = await response.json();
        console.log('Lista de modelos disponibles:', JSON.stringify(data, null, 2));
        return data;
    } catch (err) {
        console.error('No se pudo listar modelos:', err);
        return null;
    }
};

export const consultarIA = async (mensaje: string, intentos = 3): Promise<string> => {
    const instruccion = `Eres el experto de SolarEye en Culiacán.
    Responde solamente lo que te pregunte el usuario, con un párrafo breve y directo.
    No repitas la pregunta, no inventes, y si no sabes responde "No tengo suficiente información".
    Ayuda con presupuestos y dudas de paneles solares de forma profesional.`;

    let ultimoError: any = null;

    for (const modelo of modelosFallback) {
        try {
            console.log('Intentando modelo IA:', modelo);
            const model = genAI.getGenerativeModel({ model: modelo });
            const result = await model.generateContent([instruccion, mensaje]);
            console.log('Respuesta recibida con modelo', modelo);

            const text = result?.response?.text?.() ?? '';
            if (!text) {
                throw new Error('Respuesta de IA vacía. Verifica la configuración de la API.');
            }

            return text;
        } catch (error: any) {
            ultimoError = error;
            const mensajeError = (error?.message || '').toLowerCase();
            console.error(`Error modelo ${modelo}:`, mensajeError);

            if (mensajeError.includes('429') && intentos > 0) {
                console.log(`Límite alcanzado, esperando 60 segundos... (intentos restantes: ${intentos})`);
                await esperar(60000);
                return consultarIA(mensaje, intentos - 1);
            }

            if (error instanceof GoogleGenerativeAIFetchError) {
                console.error(`Gemini HTTP ${error.status} ${error.statusText} -> ${error.message}`);
                if (error.errorDetails) {
                    console.error('Detalles y cuerpo de error:', JSON.stringify(error.errorDetails, null, 2));
                }
                if (error.status === 404) {
                    console.warn('Modelo no encontrado, probando siguiente modelo...');
                    continue;
                }
            }

            if (mensajeError.includes('apikey') || mensajeError.includes('unauthorized') || mensajeError.includes('forbidden')) {
                throw new Error('Error de autenticación con Gemini (API key): ' + (error?.message || 'clave inválida'));
            }

            throw error;
        }
    }

    await listarModelosDisponibles();
    throw new Error(`No se encontró un modelo compatible en fallback. Último error: ${ultimoError?.message || 'desconocido'}`);
};