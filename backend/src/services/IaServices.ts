import { GoogleGenerativeAI, GoogleGenerativeAIFetchError } from "@google/generative-ai";
import pdfParse from 'pdf-parse';
import 'dotenv/config';

const geminiApiKey = process.env.GEMINI_API_KEY;
console.log('API Key loaded:', !!geminiApiKey);

if (!geminiApiKey || geminiApiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY no configurada. Establece la variable de entorno en backend/.env o en el entorno de despliegue.');
}


const genAI = new GoogleGenerativeAI(geminiApiKey);
const modeloPreferido = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const modelosFallback = [
    modeloPreferido,
    "gemini-2.5-pro",
    "gemini-2.0-flash",
    "gemini-2.0-flash-001",
    "gemini-flash-latest",
    "gemini-pro-latest",
    "gemini-2.5-flash-lite"
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
export const analizarReciboIA = async (imagenBase64: string): Promise<any> => {
    const instruccionVision = `Analiza la imagen o PDF de este recibo de CFE y extrae los datos exactos del periodo mostrado en el recibo. No inventes valores. Devuelve únicamente un objeto JSON válido sin ningún texto adicional, sin bloques de código y sin explicaciones.

Instrucciones importantes:
- Extrae el valor que aparece en el recibo como "Total a pagar" o el valor total final del recibo.
- Extrae el consumo total de kWh del periodo facturado del recibo.
- Si el recibo es bimestral, devuelve el total del periodo bimestral; el backend dividirá entre 2 para convertir a mensual.
- No uses montos de cargos, recargos parciales o subtotales; usa el monto total final.
- Si aparece un código de tarifa CFE, extrae exactamente ese código.
- Si no puedes encontrar un valor claro, devuelve null para ese campo.

Datos a extraer:
- consumoKwh: el consumo total del periodo en kWh (número, o null si no se ve)
- costoMx: el costo total del periodo en MXN (número, o null si no se ve)
- tarifaCfe: la tarifa CFE exacta, debe ser uno de estos valores: 1, 1A, 1B, 1C, 1D, 1E, 1F, DAC. Devuelve null si no se encuentra claramente. No inventes valores.
- numRecibo: el número de recibo (string, o null)
- periodo_facturacion: el tipo de periodo de facturación ("mensual" o "bimestral", o null)
- tarifa_kwh_mxn: la tarifa en MXN por kWh (número con 4 decimales, calcula como costoMx/consumoKwh si no aparece explícitamente, o null si no se puede calcular)

Ejemplo de respuesta: {"consumoKwh": 86.5, "costoMx": 306, "tarifaCfe": "1A", "numRecibo": "REC-2026-001", "periodo_facturacion": "bimestral", "tarifa_kwh_mxn": 3.5341}`;

    const allowedTarifas = ['1', '1A', '1B', '1C', '1D', '1E', '1F', 'DAC'];
    const allowedPeriodos = ['mensual', 'bimestral'];

    const decodeBase64 = (base64: string): Buffer => Buffer.from(base64, 'base64');

    const detectMimeType = (buffer: Buffer): string => {
        if (buffer.slice(0, 4).toString('ascii') === '%PDF') return 'application/pdf';
        if (buffer.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]))) return 'image/png';
        if (buffer.slice(0, 3).equals(Buffer.from([0xFF, 0xD8, 0xFF]))) return 'image/jpeg';
        if (buffer.slice(0, 4).toString('ascii') === 'RIFF' && buffer.slice(8, 12).toString('ascii') === 'WEBP') return 'image/webp';
        return 'image/png';
    };

    const parseBase64Input = (input: string): { mimeType: string; base64: string; buffer: Buffer } => {
        const trimmed = input.trim();
        const dataUrlMatch = trimmed.match(/^data:([^;]+);base64,(.+)$/s);
        if (dataUrlMatch) {
            const [, mimeType, base64] = dataUrlMatch as [string, string, string];
            return { mimeType, base64, buffer: decodeBase64(base64) };
        }

        const base64Only = trimmed.replace(/\s+/g, '');
        if (!/^[A-Za-z0-9+/=]+$/.test(base64Only)) {
            throw new Error('Formato de imagen base64 inválido. Asegúrate de que sea una imagen o PDF válido.');
        }
        const buffer = decodeBase64(base64Only);
        return { mimeType: detectMimeType(buffer), base64: base64Only, buffer };
    };

    const extractJsonObject = (raw: string): string | null => {
        const match = raw.match(/(\{[\s\S]*\})/m);
        if (!match) return null;
        const [, candidate = ''] = match as [string, string];
        const lastBrace = candidate.lastIndexOf('}');
        if (lastBrace >= 0 && lastBrace < candidate.length - 1) {
            return candidate.slice(0, lastBrace + 1).trim();
        }
        return candidate.trim();
    };

    const { mimeType, base64: imageData, buffer } = parseBase64Input(imagenBase64);
    const isPdf = mimeType === 'application/pdf';

    const tiposSoportados = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (!tiposSoportados.includes(mimeType)) {
        throw new Error(`Tipo de archivo no soportado: ${mimeType}. Solo se aceptan imágenes (JPEG, PNG, WebP) y PDFs.`);
    }

    const parsePdfText = async (pdfBuffer: Buffer): Promise<string> => {
        try {
            const data = await pdfParse(pdfBuffer);
            return String(data.text ?? '').trim();
        } catch (err) {
            console.warn('No se pudo extraer texto del PDF:', err);
            return '';
        }
    };

    try {
        console.log('Iniciando análisis de imagen/PDF en SolarEye... Tipo MIME:', mimeType);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        let result;

        if (isPdf) {
            const textoPdf = await parsePdfText(buffer);
            if (textoPdf.length > 100) {
                console.log('Texto extraído del PDF:', textoPdf.substring(0, 200));
                result = await model.generateContent([instruccionVision, textoPdf]);
            } else {
                const pdfPart: any = {
                    inlineData: {
                        data: imageData,
                        mimeType
                    }
                };
                result = await model.generateContent([instruccionVision, pdfPart]);
            }
        } else {
            const imagePart: any = {
                inlineData: {
                    data: imageData,
                    mimeType
                }
            };
            result = await model.generateContent([instruccionVision, imagePart]);
        }

        const text = result?.response?.text?.() ?? '';
        console.log('Respuesta cruda de Gemini:', text);
        if (!text) throw new Error('La IA no devolvió texto.');

        const jsonLimpio = text.replace(/```json/g, '').replace(/```/g, '').trim();
        console.log('JSON limpio:', jsonLimpio);
        let datosExtraidos;
        try {
            datosExtraidos = JSON.parse(jsonLimpio);
        } catch (parseError) {
            console.error('Error al parsear JSON:', parseError);
            const fallbackJson = extractJsonObject(jsonLimpio) ?? extractJsonObject(text);
            if (!fallbackJson) {
                throw new Error('La IA no devolvió un JSON válido. Respuesta: ' + text);
            }
            datosExtraidos = JSON.parse(fallbackJson);
        }

        if (!datosExtraidos.tarifaCfe) {
            const fallbackTarifa = text.match(/\b(1A|1B|1C|1D|1E|1F|DAC|1)\b/i)?.[0];
            if (fallbackTarifa) {
                datosExtraidos.tarifaCfe = fallbackTarifa.toUpperCase();
            }
        }
        if (!datosExtraidos.periodo_facturacion) {
            const fallbackPeriodo = text.toLowerCase().includes('bimestral') ? 'bimestral' :
                text.toLowerCase().includes('mensual') ? 'mensual' : null;
            if (fallbackPeriodo) datosExtraidos.periodo_facturacion = fallbackPeriodo;
        }

        const normalizeTarifaCfe = (valor: any): string | null => {
            if (!valor) return null;
            let texto = String(valor).toUpperCase().trim();
            texto = texto.replace(/[^A-Z0-9]/g, '');
            const exactMatch = allowedTarifas.find(t => t === texto);
            if (exactMatch) return exactMatch;
            const match = texto.match(/(1A|1B|1C|1D|1E|1F|DAC|1)/);
            return match ? match[0] : null;
        };

        const normalizePeriodoFacturacion = (valor: any): string | null => {
            if (!valor) return null;
            const texto = String(valor).toLowerCase().trim();
            if (texto.includes('bimestral') || texto.includes('bimes')) return 'bimestral';
            if (texto.includes('mensual')) return 'mensual';
            const exactMatch = allowedPeriodos.find(p => p === texto);
            return exactMatch ?? null;
        };

        const parseNumero = (valor: any): number | null => {
            if (valor === null || valor === undefined) return null;
            const num = Number(String(valor).replace(/[^0-9.,-]/g, '').replace(',', '.'));
            return Number.isFinite(num) ? num : null;
        };

        if (datosExtraidos.tarifaCfe) {
            datosExtraidos.tarifaCfe = normalizeTarifaCfe(datosExtraidos.tarifaCfe);
        }

        const periodoNormalizado = normalizePeriodoFacturacion(datosExtraidos.periodo_facturacion);
        if (periodoNormalizado) {
            datosExtraidos.periodo_facturacion = periodoNormalizado;
        }

        let consumoKwh = parseNumero(datosExtraidos.consumoKwh);
        let costoMx = parseNumero(datosExtraidos.costoMx);
        let tarifaKwh = parseNumero(datosExtraidos.tarifa_kwh_mxn);

        if (periodoNormalizado === 'bimestral') {
            if (consumoKwh !== null) consumoKwh = parseFloat((consumoKwh / 2).toFixed(2));
            if (costoMx !== null) costoMx = parseFloat((costoMx / 2).toFixed(2));
        }

        if (tarifaKwh === null && consumoKwh && costoMx && consumoKwh > 0) {
            tarifaKwh = parseFloat((costoMx / consumoKwh).toFixed(4));
        }

        if (tarifaKwh !== null) {
            datosExtraidos.tarifa_kwh_mxn = tarifaKwh;
        } else {
            datosExtraidos.tarifa_kwh_mxn = null;
        }

        if (datosExtraidos.consumoKwh !== undefined) {
            datosExtraidos.consumoKwh = consumoKwh;
        }
        if (datosExtraidos.costoMx !== undefined) {
            datosExtraidos.costoMx = costoMx;
        }

        console.log('Datos extraídos del recibo:', datosExtraidos);
        return datosExtraidos;

    } catch (error: any) {
        console.error('Error procesando imagen/PDF:', error);
        if (error instanceof Error) {
            console.error(error.stack);
        }
        throw new Error('No se pudo leer el recibo automáticamente. Intenta con una foto más clara o un PDF legible.');
    }
};