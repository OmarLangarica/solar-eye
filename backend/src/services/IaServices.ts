import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const esperar = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const consultarIA = async (mensaje: string, intentos = 3): Promise<string> => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const instruccion = `Eres el experto de SolarEye en Culiacán. 
    Ayuda con presupuestos y dudas de paneles solares de forma profesional.`;

    try {
        const result = await model.generateContent([instruccion, mensaje]);
        return result.response.text();
    } catch (error: any) {
        if (error.message?.includes('429') && intentos > 0) {
            console.log(`Límite alcanzado, esperando 60 segundos... (intentos restantes: ${intentos})`);
            await esperar(60000);
            return consultarIA(mensaje, intentos - 1);
        }
        throw error;
    }
};