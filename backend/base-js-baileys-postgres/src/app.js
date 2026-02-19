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

const PORT = process.env.PORT ?? 3008;



const flowChooseNumber = addKeyword(EVENTS.ACTION).addAnswer(
  'Si ya escogiste un numero por favor escribelo debajo,\n NOTA: Escribe solo el numero...',
  {
    capture: true,
  },
  async (ctx, { fallBack, flowDynamic }) => {
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
    async (ctx, { fallBack, flowDynamic, gotoFlow}) => {
      console.log(ctx.body);
      await flowDynamic(`Tu numero Es: ${ctx.from}`);
      await gotoFlow(flowChooseNumber)

      
    },
    flowChooseNumber
      
  );

const main = async () => {
  const adapterFlow = createFlow([flowWelcome,flowChooseNumber]);

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
