// ============================================================================
// LinkedinAgentPost - Workflow n8n (Workflow SDK)
// Titulo: "LinkedIn Post con Edicion por Telegram"
//
// ANTES DE IMPORTAR, reemplaza TODOS los YOUR_* por tus valores REALES:
//   YOUR_TELEGRAM_CHAT_ID        -> tu chatId de Telegram (lo da @userinfobot)
//   YOUR_LINKEDIN_PERSON_URN     -> tu URN de persona de LinkedIn (perfil -> Seccion
//                                   "acerca de" -> URN, o de la API)
//   YOUR_PENDIENTES_TABLE        -> nombre de tu data table (creala antes)
//   YOUR_TELEGRAM_BOT_CREDENTIAL -> el nombre de tu credencial del bot en n8n
//   YOUR_LINKEDIN_CREDENTIAL     -> el nombre de tu credencial de LinkedIn en n8n
//   YOUR_DEEPSEEK_CREDENTIAL     -> el nombre de tu credencial de DeepSeek en n8n
//   YOUR_WEBHOOK_HEADER_CREDENTIAL -> credencial Header Auth del webhook. Header
//                                   "X-LinkedIn-Key" con un valor aleatorio largo;
//                                   el agente lo lee de la variable de entorno
//                                   LINKEDIN_WEBHOOK_KEY. Sin ese header el webhook
//                                   responde 403.
//
// NO subas este archivo con valores reales a un repositorio publico.
// Guarda tu version rellenada localmente (esta marcada en .gitignore como
// workflows/*.real.json si exportas JSON, o fuera del repo).
//
// REGLAS DEL CONTENIDO (ver skills/linkedin-post-style/SKILL.md):
//   1. draftText va en TEXTO PLANO: sin **, sin backticks, sin cursivas. LinkedIn
//      no renderiza markdown y el nodo Telegram con parse mode Markdown falla
//      con "can't parse entities". Todos los nodos Telegram de este template
//      fijan parseMode: 'None'.
//   2. imageUrl debe ser una URL publica y ya publicada. En este proyecto es
//      https://raw.githubusercontent.com/<owner>/<repo>/main/assets/screenshots/<slug>.png
//      y la imagen tiene que estar commiteada y pusheada ANTES de llamar al
//      webhook: si no, el nodo "Descargar Imagen" responde 404 y no publica.
//   3. Insertar filas en la data table NO dispara este workflow. El unico
//      disparador es el webhook POST /linkedin-draft-v2.
// ============================================================================

workflow('LinkedIn Post con Edicion por Telegram')

  // ----------------------------------------------------------
  // 1) RECIBIR BORRADOR  (POST /linkedin-draft-v2)
  //    Cuerpo esperado (JSON):
  //    {
  //      "draftText": "texto del post...",
  //      "sourceNote": "ruta de la nota fuente en Obsidian",
  //      "seccion": "kira | andres",
  //      "fecha": "YYYY-MM-DD",
  //      "veredicto": "OK | REVISAR",
  //      "imageUrl": "https://... (opcional)",
  //      "chatId": "tu_chat_id_de_telegram"
  //    }
  // ----------------------------------------------------------
  .trigger(
    node('Recibir Borrador de OpenCode', 'n8n-nodes-base.webhook')
      .setParameter('httpMethod', 'POST')
      .setParameter('path', 'linkedin-draft-v2')
      // Header Auth: el webhook solo acepta llamadas que lleven el header con la
      // clave. Sin el, responde 403 y nadie puede inyectar borradores en tu cola.
      // La credencial se conecta en la UI (ver YOUR_WEBHOOK_HEADER_CREDENTIAL).
      .setParameter('authentication', 'headerAuth')
      .setParameter('responseMode', 'onReceived')
  )

  // Presupuestos a campos estables para el resto del flujo.
  .add(
    node('Normalizar Datos del Borrador', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_draftText',
            name: 'draftText',
            value: "={{ $json.body.draftText ?? '' }}",
            type: 'string',
          },
          {
            id: '_sourceNote',
            name: 'sourceNote',
            value: "={{ $json.body.sourceNote ?? 'Sin nota fuente' }}",
            type: 'string',
          },
          {
            id: '_seccion',
            name: 'seccion',
            value: "={{ $json.body.seccion ?? '' }}",
            type: 'string',
          },
          {
            id: '_fecha',
            name: 'fecha',
            value: "={{ $json.body.fecha ?? '' }}",
            type: 'string',
          },
          {
            id: '_veredicto',
            name: 'veredicto',
            value: "={{ $json.body.veredicto ?? 'OK' }}",
            type: 'string',
          },
          {
            id: '_imageUrl',
            name: 'imageUrl',
            value: "={{ $json.body.imageUrl ?? '' }}",
            type: 'string',
          },
          {
            id: '_chatId',
            name: 'chatId',
            value: "={{ $json.body.chatId ?? 'YOUR_TELEGRAM_CHAT_ID' }}",
            type: 'string',
          },
        ],
      })
  )

  // Guarda el borrador como "pendiente" en la data table.
  .add(
    node('Guardar Borrador Pendiente', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'create')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('columns', [
        { name: 'draftText', type: 'string' },
        { name: 'seccion', type: 'string' },
        { name: 'fecha', type: 'string' },
        { name: 'sourceNote', type: 'string' },
        { name: 'veredicto', type: 'string' },
        { name: 'imageUrl', type: 'string' },
        { name: 'chatId', type: 'string' },
        { name: 'estado', type: 'string' },
      ])
      .setParameter('data', [
        { field: 'draftText', value: "={{ $('Normalizar Datos del Borrador').item.json.draftText }}" },
        { field: 'seccion', value: "={{ $('Normalizar Datos del Borrador').item.json.seccion }}" },
        { field: 'fecha', value: "={{ $('Normalizar Datos del Borrador').item.json.fecha }}" },
        { field: 'sourceNote', value: "={{ $('Normalizar Datos del Borrador').item.json.sourceNote }}" },
        { field: 'veredicto', value: "={{ $('Normalizar Datos del Borrador').item.json.veredicto }}" },
        { field: 'imageUrl', value: "={{ $('Normalizar Datos del Borrador').item.json.imageUrl }}" },
        { field: 'chatId', value: "={{ $('Normalizar Datos del Borrador').item.json.chatId }}" },
        { field: 'estado', value: 'pendiente' },
      ])
  )

  // Envia el borrador a Telegram con 2 botones + indicacion de chat.
  // Necesita tu credencial YOUR_TELEGRAM_BOT_CREDENTIAL conectada a TODOS los
  // nodos Telegram del flujo.
  .add(
    node('Enviar Borrador a Telegram', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', "={{ $('Normalizar Datos del Borrador').item.json.chatId }}")
      .setParameter('text', "={{ '📝 Borrador para LinkedIn\\nSección: ' + $('Normalizar Datos del Borrador').item.json.seccion + ' · Fecha: ' + $('Normalizar Datos del Borrador').item.json.fecha + '\\n\\n' + $('Normalizar Datos del Borrador').item.json.draftText + '\\n\\n💬 Escribe en este chat un cambio (ej: \"se más breve\", \"cambia el título\") o pulsa un botón.' }}")
      // parseMode: 'None' es OBLIGATORIO. Con el default (Markdown) cualquier
      // guion bajo o asterisco sin cerrar rompe el envio con
      // "can't parse entities". El post va en texto plano, asi que no se parsea.
      .setParameter('additionalFields', {
        parseMode: 'None',
        replyMarkup: JSON.stringify({
          inline_keyboard: [
            [
              { text: '✅ Publicar', callback_data: 'publicar' },
              { text: '❌ Descartar', callback_data: 'descartar' },
            ],
          ],
          link_preview_options: { is_disabled: true },
        }),
      })
  )

  // ----------------------------------------------------------
  // 2) ESCUCHAR RESPUESTA DEL USUARIO
  //    El usuario responde desde Telegram: ya sea un callback de boton
  //    o un mensaje de texto libre (para pedir ediciones).
  //    Se usa telegramTrigger (TRIGGER PARALELO, siempre escuchando).
  // ----------------------------------------------------------
  .add(
    node('Escuchar Telegram', 'n8n-nodes-base.telegramTrigger')
      .setParameter('updates', ['message', 'callback_query'])
  )

  // Clasifica la interaccion: publicar | descartar | editar (texto libre).
  .add(
    node('Clasificar Interaccion', 'n8n-nodes-base.code')
      .setParameter('jsCode', `const item = $input.first().json;
const callback = item.callback_query?.data ?? '';
const text = item.message?.text ?? '';
let tipo;
if (callback === 'publicar') tipo = 'publicar';
else if (callback === 'descartar') tipo = 'descartar';
else if (text) tipo = 'editar';
else tipo = 'sinPendiente';
return [{ json: { tipo, callback, text } }];`)
  )

  // Busca el borrador pendiente mas reciente en la tabla.
  .add(
    node('Buscar Pendiente', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'get')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filters', {
        filters: [
          { columnName: 'estado', condition: 'eq', value: 'pendiente' },
        ],
        type: 'and',
      })
  )

  // Si no hay pendiente, fuerza tipo = sinPendiente.
  .add(
    node('Insertar Bandera', 'n8n-nodes-base.code')
      .setParameter('jsCode', `const original = $input.first().json;
const sinPendientes = $('Buscar Pendiente').all().length === 0;
return [{ json: { ...original, tipo: sinPendientes ? 'sinPendiente' : original.tipo } }];`)
  )

  // Rutea segun el tipo.
  .add(
    node('Rutear Interaccion', 'n8n-nodes-base.switch')
      .setParameter('rules', {
        values: [
          { name: 'publicar' },
          { name: 'descartar' },
          { name: 'editar' },
          { name: 'sinPendiente' },
        ],
        output: 'rules',
      })
  )

  // ----------------------------------------------------------
  // 3) CERO PENDIENTES  (respaldo del silencio)
  // ----------------------------------------------------------
  .add(
    node('Aviso Sin Pendiente', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', '📭 No hay ningún borrador pendiente para editar o publicar. Envía un borrador nuevo primero (desde tu agente).')
      .setParameter('additionalFields', { parseMode: 'None' })
  )

  // ----------------------------------------------------------
  // 4) RAMA EDICION: reescribe con IA y vuelve a pedir aprobacion
  // ----------------------------------------------------------

  // Busca el borrador pendiente para pasarselo a DeepSeek.
  .add(
    node('Buscar Pendiente Editar', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'get')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filters', {
        filters: [
          { columnName: 'estado', condition: 'eq', value: 'pendiente' },
        ],
        type: 'and',
      })
  )

  .add(
    node('Preparar Prompt Edicion', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_prompt',
            name: 'prompt',
            value:
              "={{ 'Reescribe este borrador de LinkedIn siguiendo el pedido del usuario. Muy breve.\\n\\nBORRADOR ACTUAL:\\n' + $('Buscar Pendiente Editar').item.json.draftText + '\\n\\nPEDIDO DEL USUARIO: ' + $json.text }}",
            type: 'string',
          },
        ],
      })
  )

  .add(
    node('DeepSeek Model', 'n8n-nodes-base.deepSeek')
      .setParameter('resource', 'chat')
      .setParameter('operation', 'message')
      .setParameter('model', 'deepseek-chat')
      .setParameter('promptType', 'defineBelow')
      .setParameter('text', "={{ $('Preparar Prompt Edicion').item.json.prompt }}")
  )

  // Guarda la version reescrita en la tabla y reenvia a Telegram.
  .add(
    node('Guardar Borrador Editado', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'update')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('matchType', 'allConditions')
      .setParameter('filters', {
        conditions: [
          { keyName: 'estado', condition: 'eq', keyValue: 'pendiente' },
        ],
      })
      .setParameter('columns', {
        mappingMode: 'defineBelow',
        value: {
          draftText: "={{ $('DeepSeek Model').item.json.choices[0].message.content }}",
        },
      })
  )

  .add(
    node('Reenviar Borrador Mejorado', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', "={{ '📝 Borrador para LinkedIn (editado)\\n\\n' + $('Guardar Borrador Editado').item.json.draftText + '\\n\\n💬 Escribe otro cambio o pulsa un botón.' }}")
      .setParameter('additionalFields', { parseMode: 'None' })
      .setParameter('additionalFields', {
        replyMarkup: JSON.stringify({
          inline_keyboard: [
            [
              { text: '✅ Publicar', callback_data: 'publicar' },
              { text: '❌ Descartar', callback_data: 'descartar' },
            ],
          ],
          link_preview_options: { is_disabled: true },
        }),
      })
  )

  // ----------------------------------------------------------
  // 5) RAMA PUBLICAR: va directo a LinkedIn
  // ----------------------------------------------------------
  .add(
    node('Buscar Pendiente Publicar', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'get')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filters', {
        filters: [
          { columnName: 'estado', condition: 'eq', value: 'pendiente' },
        ],
        type: 'and',
      })
  )

  .add(
    node('Notificar Publicado', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', "={{ '✅ Publicado en tu perfil de LinkedIn.\\n\\n' + $('Buscar Pendiente Publicar').item.json.draftText }}")
      .setParameter('additionalFields', { parseMode: 'None' })
  )

  .add(
    node('Marcar Publicado', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'update')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('matchType', 'allConditions')
      .setParameter('filters', {
        conditions: [
          { keyName: 'estado', condition: 'eq', keyValue: 'pendiente' },
        ],
      })
      .setParameter('columns', {
        mappingMode: 'defineBelow',
        value: { estado: 'publicado' },
      })
  )

  // Publica como actualizacion del perfil (person). Necesita tu credencial
  // YOUR_LINKEDIN_CREDENTIAL.
  .add(
    node('Publicar en LinkedIn', 'n8n-nodes-base.linkedIn')
      .setParameter('resource', 'post')
      .setParameter('operation', 'create')
      .setParameter('postAs', 'person')
      .setParameter('visibility', 'PUBLIC')
      .setParameter('person', 'YOUR_LINKEDIN_PERSON_URN')
      .setParameter('text', "={{ $('Buscar Pendiente Publicar').item.json.draftText }}")
  )

  // ----------------------------------------------------------
  // 6) RAMA DESCARTAR
  // ----------------------------------------------------------
  .add(
    node('Buscar Pendiente Descartar', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'get')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filters', {
        filters: [
          { columnName: 'estado', condition: 'eq', value: 'pendiente' },
        ],
        type: 'and',
      })
  )

  .add(
    node('Notificar Descartado', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', '🗑️ Borrador descartado. No se publicó.')
      .setParameter('additionalFields', { parseMode: 'None' })
  )

  .add(
    node('Marcar Descartado', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'update')
      .setParameter('tableId', { __rl: true, mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('matchType', 'allConditions')
      .setParameter('filters', {
        conditions: [
          { keyName: 'estado', condition: 'eq', keyValue: 'pendiente' },
        ],
      })
      .setParameter('columns', {
        mappingMode: 'defineBelow',
        value: { estado: 'descartado' },
      })
  )

  // ----------------------------------------------------------
  // CONEXIONES (Wire)
  // ----------------------------------------------------------
  // Rama webhook: recibe el borrador y lo muestra en Telegram (termina aqui).
  .connect('Recibir Borrador de OpenCode', 'Normalizar Datos del Borrador')
  .connect('Normalizar Datos del Borrador', 'Guardar Borrador Pendiente')
  .connect('Guardar Borrador Pendiente', 'Enviar Borrador a Telegram')
  // Rama de respuesta: el telegramTrigger escucha SIEMPRE (paralelo) y alimenta la
  // clasificacion. Nunca se conecta nada HACIA un trigger.
  .connect('Escuchar Telegram', 'Clasificar Interaccion')
  .connect('Clasificar Interaccion', 'Buscar Pendiente')        // sonda paralela
  .connect('Clasificar Interaccion', 'Insertar Bandera')        // lee la sonda por referencia
  .connect('Insertar Bandera', 'Rutear Interaccion')
  // El Switch recibe un item ya rotulado: publicar | descartar | editar | sinPendiente
  .connect('Rutear Interaccion', 'Buscar Pendiente Publicar')   // publicar
  .connect('Rutear Interaccion', 'Buscar Pendiente Descartar')  // descartar
  .connect('Rutear Interaccion', 'Buscar Pendiente Editar')     // editar
  .connect('Rutear Interaccion', 'Aviso Sin Pendiente')         // sinPendiente
  // Rama publicar: primero LinkedIn, despues marcar y avisar
  .connect('Buscar Pendiente Publicar', 'Publicar en LinkedIn')
  .connect('Publicar en LinkedIn', 'Marcar Publicado')
  .connect('Marcar Publicado', 'Notificar Publicado')
  // Rama editar
  .connect('Buscar Pendiente Editar', 'Preparar Prompt Edicion')
  .connect('Preparar Prompt Edicion', 'DeepSeek Model')
  .connect('DeepSeek Model', 'Guardar Borrador Editado')
  .connect('Guardar Borrador Editado', 'Reenviar Borrador Mejorado')
  // Rama descartar
  .connect('Buscar Pendiente Descartar', 'Marcar Descartado')
  .connect('Marcar Descartado', 'Notificar Descartado')
