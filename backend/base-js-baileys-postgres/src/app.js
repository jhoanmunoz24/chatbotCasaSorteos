import { join } from 'path';
import {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  utils,
  EVENTS,
} from '@builderbot/bot';
import { BaileysProvider as Provider } from '@builderbot/provider-baileys';
import { adapterDB } from './postgres-database.js';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';

import Groq from 'groq-sdk';
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const PORT = process.env.PORT ?? 3008;
import { exec } from 'child_process';

function convertToWav(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    exec(`ffmpeg -i "${inputPath}" "${outputPath}"`, (error) => {
      if (error) reject(error);
      else resolve(outputPath);
    });
  });
}

const FlowAnalyzeVoice = addKeyword(EVENTS.MEDIA).addAnswer(
  '🎤 Por favor envía la nota de voz con tus datos.',
  { capture: true },
  async (ctx, { fallBack, flowDynamic, provider }) => {
    if (!ctx.message?.audioMessage) {
      return fallBack('❌ Debes enviar una nota de voz.');
    }

    await flowDynamic('📥 Recibiendo audio...');

    const localPath = await provider.saveFile(ctx);

    await flowDynamic('🧠 Transcribiendo audio...');

    const wavPath = localPath.replace(/\.[^/.]+$/, '.wav');
    await convertToWav(localPath, wavPath);
    const transcript = await analyzeVoice(wavPath);
    // Limpiar archivos temporales
    fs.unlinkSync(localPath);
    fs.unlinkSync(wavPath);

    const structuredData = await extractUserData(transcript);

    await flowDynamic('📝 Datos procesados:');
    await flowDynamic(structuredData); // ← usar wavPath, no localPath
  }
);

let userData = {};
const flowGetUserData = addKeyword(EVENTS.ACTION)
  .addAnswer(
    'Por favor dame tu nombre completo',
    { capture: true },
    async (ctx) => {
      userData.nombre = ctx.body;
    }
  )
  .addAnswer(
    'Por favor dame tu Documento de identidad',
    { capture: true },
    async (ctx) => {
      userData.documento = ctx.body;
    }
  )

  .addAnswer('Por favor dame tu Direccion', { capture: true }, async (ctx) => {
    userData.direccion = ctx.body;
    userData.telefono = ctx.from;
  })

  .addAnswer('Estos son tus datos', null, async (ctx, { flowDynamic }) => {
    flowDynamic(JSON.stringify(userData));
    console.log(userData);
  });

const flowAnalyzeImage = addKeyword(EVENTS.MEDIA).addAction(
  { capture: true },

  async (ctx, { flowDynamic, provider, fallBack, gotoFlow }) => {
    if (!ctx.message?.imageMessage) {
      return fallBack(
        '❌ Debes enviar una imagen del comprobante para continuar.'
      );
    }
    await flowDynamic('📥 Recibiendo comprobante...');

    const localPath = await provider.saveFile(ctx);

    await flowDynamic('🔍 Analizando imagen...');

    const result = await analyzeImage(localPath);
    let parsedResult;
    try {
      const clean = result.replace(/```json|```/g, '').trim();
      parsedResult = JSON.parse(clean);
    } catch (e) {
      console.error('Error parseando resultado IA:', result);  
        return fallBack(
          '❌ Error analizando el comprobante. Intenta de nuevo.'
        )
    
    
    }
    if (!parsedResult.esValido) {
      return fallBack(parsedResult.motivo);
    }

    await flowDynamic(result);
    return gotoFlow(flowChooseData);
  }
);

const flowChooseData = addKeyword(EVENTS.ACTION).addAnswer(
  'Escoje 1. Si quieres Mandar los datos por texto, 2. Si prefieres una nota de voz',
  { capture: true },
  async (ctx, { gotoFlow }) => {
    if (ctx.body.includes('1')) {
      gotoFlow(flowGetUserData);
    } else if (ctx.body.includes('2')) {
      gotoFlow(FlowAnalyzeVoice);
    }
  }
);

async function analyzeVoice(localPath) {
  // Create a transcription job
  const transcription = await groq.audio.transcriptions.create({
    file: fs.createReadStream(localPath), // Required path to audio file - replace with your audio file!
    model: 'whisper-large-v3-turbo', // Required model to use for transcription

    language: 'es', // Optional
  });

  console.log(JSON.stringify(transcription, null, 2));

  return transcription.text;
  // To print only the transcription text, you'd use console.log(transcription.text); (here we're printing the entire transcription object to access timestamps)
}

async function extractUserData(transcript) {
  const completion = await groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `
Eres un extractor de datos estrictamente estructurado.

Reglas:
- Extrae SOLO los datos personales del hablante.
- Ignora datos que el hablante mencione como pertenecientes a otra persona.
- Si dice "el teléfono de mi esposa es...", NO lo uses.
- Si un dato no está claro, pon null.
- Responde únicamente en JSON válido.
`,
      },
      {
        role: 'user',
        content: `
Texto transcrito:

"${transcript}"

Devuelve exactamente este formato JSON:

{
  "nombre": "",
  "documento": "",
  "telefono": "",
  "direccion": ""
}
`,
      },
    ],
  });

  return completion.choices[0].message.content;
}
const flowChooseNumber = addKeyword(EVENTS.ACTION).addAnswer(
  'Si ya escogiste un numero por favor escribelo debajo,\n NOTA: Escribe solo el numero...',
  {
    capture: true,
  },
  async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
    const fourDigits = /^[0-9]{4}$/;
    if (!fourDigits.test(ctx.body.trim())) {
      return fallBack(
        '❌ Debe ser exactamente 4 dígitos numéricos (ej: 1234). Intenta nuevamente.'
      );
    }
    await flowDynamic(`
          🎟️ *RESERVA DE NÚMERO CONFIRMADA*

          Has seleccionado el número: *${ctx.body}*

          💰 *Valor del número:* $10.000 COP

          Para continuar con el proceso, por favor realiza el pago a cualquiera de los siguientes métodos:

          📲 *Nequi:* 300 123 4567  
          📲 *Daviplata:* 301 987 6543  
          🏦 *Bancolombia Ahorros:* 123-456789-00  
          🏦 *Transferencia Bancolombia:* 12345678901  
          👤 *Titular:* Juan Pérez  
          🆔 *CC:* 1.234.567.890  

          📌 *Importante:*
          Después de realizar el pago, envía el comprobante por este medio para validar tu participación.

          ⏳ Tu número quedará reservado por 30 minutos.  
          Si no se recibe el pago en ese tiempo, el número volverá a estar disponible.

          ¡Gracias por participar en CASASORTEOS RIFAS! 🎉
          `);

    await gotoFlow(flowAnalyzeImage);
  }
);

// KILL TERMINAL BOT taskkill /F /IM node.exe
const flowWelcome = addKeyword(EVENTS.WELCOME)
  .addAnswer(
    `Bienvenido a CASASORTEOS RIFAS \n
   Estos son los numeros disponibles  `
  )
  .addAnswer(
    ' ',
    {
      media:
        'https://res.cloudinary.com/diptb0uza/image/upload/v1771442763/free-numbers_shkb7g.png',
    },
    async (ctx, { fallBack, flowDynamic, gotoFlow }) => {
      console.log(ctx.body);

      await flowDynamic(`Tu numero Es: ${ctx.from}`);
      await gotoFlow(flowChooseNumber);
    }
  );

async function analyzeImage(localPath) {
  const imageBuffer = fs.readFileSync(localPath);
  const base64Image = imageBuffer.toString('base64');
  const fecha = new Date().toLocaleDateString('es-CO');
  const chatCompletion = await groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Eres un experto en verificación de comprobantes de pago colombianos.
            
              Analiza esta imagen y determina si es un comprobante de pago real o falso,
              

              Evalúa:
              - ¿Tiene los elementos típicos de un comprobante (fecha, monto, entidad bancaria, número de transacción)?
              - ¿El formato corresponde a Nequi, Daviplata o Bancolombia?
              - ¿Hay señales de edición o manipulación (pixelado raro, fuentes inconsistentes, bordes extraños)?
              - ¿El monto visible corresponde a un pago real?

              Responde SOLO con este JSON sin nada más:
              {
                "esValido": true o false,
                "confianza": "alta" | "media" | "baja",
                "Analisis": "Explica la razon por la cual no es valida"
                "motivo": "Si la fecha no coincide, explica que el comprobante no es valido, que lo intente de nuevo, si no es valido el comprobante dile que no es valido que lo intente otravez"
              }`,
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`,
            },
          },
        ],
      },
    ],
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
  });

  return chatCompletion.choices[0].message.content;
}
export async function getGroqChatCompletion() {
  return groq.chat.completions.create({
    messages: [
      {
        role: 'user',
        content: 'Explain the importance of fast language models',
      },
    ],
    model: 'openai/gpt-oss-20b',
  });
}

const main = async () => {
  const adapterFlow = createFlow([
    flowWelcome,
    flowChooseNumber,
    flowAnalyzeImage,
    flowChooseData,
    flowGetUserData,
    FlowAnalyzeVoice,
  ]);

  /* const chatCompletion = await getGroqChatCompletion();
  // Print the completion returned by the LLM.
  console.log(chatCompletion.choices[0]?.message?.content || ''); */

  const adapterProvider = createProvider(Provider, {
    version: [2, 3000, 1027934701],
    writeMyself: 'both',
  });

  const { handleCtx, httpServer } = await createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  adapterProvider.server.post(
    '/v1/messages',
    handleCtx(async (bot, req, res) => {
      const { number, message, urlMedia } = req.body;
      await bot.sendMessage(number, message, { media: urlMedia ?? null });
      return res.end('sended');
    })
  );

  adapterProvider.server.post(
    '/v1/register',
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch('REGISTER_FLOW', { from: number, name });
      return res.end('trigger');
    })
  );

  adapterProvider.server.post(
    '/v1/samples',
    handleCtx(async (bot, req, res) => {
      const { number, name } = req.body;
      await bot.dispatch('SAMPLES', { from: number, name });
      return res.end('trigger');
    })
  );

  adapterProvider.server.post(
    '/v1/blacklist',
    handleCtx(async (bot, req, res) => {
      const { number, intent } = req.body;
      if (intent === 'remove') bot.blacklist.remove(number);
      if (intent === 'add') bot.blacklist.add(number);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', number, intent }));
    })
  );

  adapterProvider.server.get(
    '/v1/blacklist/list',
    handleCtx(async (bot, req, res) => {
      const blacklist = bot.blacklist.getList();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ status: 'ok', blacklist }));
    })
  );

  httpServer(Number(PORT));
};

main();
