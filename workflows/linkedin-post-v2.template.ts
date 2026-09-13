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
//
// NO subas este archivo con valores reales a un repositorio publico.
// Guarda tu version rellenada localmente (esta marcada en .gitignore como
// workflows/*.real.json si exportas JSON, o fuera del repo).
// ============================================================================

workflow('LinkedIn Post con Edicion por Telegram')

  // ----------------------------------------------------------
  // 1) RECIBIR BORRADOR  (POST /linkedin-draft-v2)
  //    Cuerpo esperado (JSON):
  //    { "texto": "post...", "imageUrl": "https://...", "chat_id": "..." }
  // ----------------------------------------------------------
  .trigger(
    node('Recibir Borrador', 'n8n-nodes-base.webhook')
      .setParameter('httpMethod', 'POST')
      .setParameter('path', 'linkedin-draft-v2')
      .setParameter('responseMode', 'onReceived')
  )

  // Presupuestos a campos estables para el resto del flujo.
  .add(
    node('Normalizar Datos del Borrador', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_texto',
            name: 'texto',
            value: "={{ $json.body.texto ?? $json.body.content ?? '' }}",
            type: 'string',
          },
          {
            id: '_imageUrl',
            name: 'imageUrl',
            value: "={{ $json.body.imageUrl ?? $json.body.image_url ?? '' }}",
            type: 'string',
          },
          {
            id: '_chat_id',
            name: 'chat_id',
            value: "={{ $json.body.chat_id ?? $json.body.chatId ?? 'YOUR_TELEGRAM_CHAT_ID' }}",
            type: 'string',
          },
          {
            id: '_id',
            name: 'id',
            value: "={{ $json.body.id ?? '' }}",
            type: 'string',
          },
        ],
      })
  )

  // Guarda el borrador como "pendiente" en la data table.
  .add(
    node('Guardar en Tabla', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'create')
      .setParameter('tableId', { mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('columns', [
        { name: 'texto', type: 'string' },
        { name: 'imagen_url', type: 'string' },
        { name: 'estado', type: 'string' },
        { name: 'chat_id', type: 'string' },
      ])
      .setParameter('data', [
        {
          field: 'texto',
          value: "={{ $('Normalizar Datos del Borrador').item.json.texto }}",
        },
        {
          field: 'imagen_url',
          value: "={{ $('Normalizar Datos del Borrador').item.json.imageUrl }}",
        },
        { field: 'estado', value: 'pendiente' },
        {
          field: 'chat_id',
          value: "={{ $('Normalizar Datos del Borrador').item.json.chat_id }}",
        },
      ])
  )

  // Mensaje breve que se envia junto a los botones.
  .add(
    node('Preparar Aviso Recibido', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_aviso',
            name: 'texto',
            value:
              "📥 Borrador recibido para aprobación.\n\n{{ $('Normalizar Datos del Borrador').item.json.texto }}",
            type: 'string',
          },
        ],
      })
  )

  // Envia el borrador a Telegram con botones inline.
  // Necesita tu credencial YOUR_TELEGRAM_BOT_CREDENTIAL conectada a TODOS los
  // nodos Telegram del flujo (Enviar Borrador, Aviso Sin Pendiente, Enviar
  // Pregunta Edicion, Enviar Aviso Edicion, Enviar Aviso Publicado, Aviso Descartado).
  .add(
    node('Enviar Borrador a Telegram', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', "={{ $('Normalizar Datos del Borrador').item.json.chat_id }}")
      .setParameter('text', "={{ $('Preparar Aviso Recibido').item.json.texto }}")
      .setParameter('additionalFields', {
        replyMarkup: JSON.stringify({
          inline_keyboard: [
            [
              { text: '✅ Publicar', callback_data: 'publicar' },
              { text: '✏️ Editar', callback_data: 'editar' },
              { text: '❌ Descartar', callback_data: 'descartar' },
            ],
          ],
        }),
      })
  )

  // Espera la respuesta del usuario (callback de los botones o mensaje libre).
  // POST /linkedin-callback-v2 con el payload del update de Telegram.
  .add(
    node('Esperar Callback', 'n8n-nodes-base.webhook')
      .setParameter('httpMethod', 'POST')
      .setParameter('path', 'linkedin-callback-v2')
      .setParameter('responseMode', 'onReceived')
      .setParameter('respondWith', 'noData')
  )

  // Clasifica el update: boton (callback_query) o mensaje de texto libre.
  .add(
    node('Clasificar Interaccion', 'n8n-nodes-base.if')
      .setParameter('conditions', {
        options: {
          caseSensitive: true,
          typeValidation: 'strict',
        },
        conditions: [
          {
            leftValue: "={{ $json.callback_query?.data ?? '' }}",
            rightValue: '',
            operator: 'notEqual',
          },
        ],
        combinator: 'and',
      })
  )

  // Exporta un campo "tipo" limpio: publicar | editar | descartar | texto.
  .add(
    node('Estructurar Interaccion', 'n8n-nodes-base.code')
      .setParameter('jsCode', `// Se ejecuta una vez por rama del IF.
const callback = $input.first().json.callback_query?.data ?? '';
const text = $input.first().json.message?.text ?? '';
let tipo;
if (callback === 'publicar') tipo = 'publicar';
else if (callback === 'editar' || text) tipo = 'editar';
else if (callback === 'descartar') tipo = 'descartar';
else tipo = 'sinPendiente';
return [{ json: { tipo, callback, text } }];`)
  )

  // Rutea segun el tipo.
  .add(
    node('Rutear Interaccion', 'n8n-nodes-base.switch')
      .setParameter('rules', {
        values: [
          { name: 'publicar' },
          { name: 'editar' },
          { name: 'descartar' },
          { name: 'sinPendiente' },
        ],
        output: 'rules',
      })
  )

  // ----------------------------------------------------------
  // 2) CERO PENDIENTES  (respaldo del silencio)
  //    Sondea la tabla: si no hay ningun pendiente avisa y NA NADA.
  // ----------------------------------------------------------
  .add(
    node('Buscar Pendiente', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'get')
      .setParameter('tableId', { mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filters', {
        filters: [
          {
            columnName: 'estado',
            condition: 'eq',
            value: 'pendiente',
          },
        ],
        type: 'and',
      })
  )

  // Si la sonda devuelve 0 filas re-etiqueta el tipo a "sinPendiente";
  // si hay filas, deja pasar el item original (se dispara desde el item de
  // "Estructurar Interaccion" y lee la sonda por referencia).
  .add(
    node('Insertar Bandera', 'n8n-nodes-base.code')
      .setParameter('jsCode', `const original = $input.first().json;
const sinPendientes = $('Buscar Pendiente').all().length === 0;
return [{ json: { ...original, tipo: sinPendientes ? 'sinPendiente' : original.tipo } }];`)
  )

  .add(
    node('Aviso Sin Pendiente', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', '📭 No hay ningún borrador pendiente para editar o publicar. Envía un borrador nuevo primero (desde tu agente).')
  )

  // ----------------------------------------------------------
  // 3) RAMA EDICION: reescribe con IA y vuelve a pedir aprobacion
  // ----------------------------------------------------------
  .add(
    node('Preparar Pregunta Edicion', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_pregunta',
            name: 'texto',
            value:
              "✏️ Escribe la nueva version (o instrucciones) y la reescribo con IA. \"hecho\" para publicar igual, \"cancelar\" para salir.",
            type: 'string',
          },
        ],
      })
  )

  .add(
    node('Enviar Pregunta Edicion', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', "={{ $('Preparar Pregunta Edicion').item.json.texto }}")
  )

  .add(
    node('Esperar Respuesta Edicion', 'n8n-nodes-base.webhook')
      .setParameter('httpMethod', 'POST')
      .setParameter('path', 'linkedin-edit-v2')
      .setParameter('responseMode', 'onReceived')
      .setParameter('respondWith', 'noData')
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
              "={{ 'Reescribe este borrador de LinkedIn siguiendo el pedido del usuario. Muy breve.\\n\\nBORRADOR: ' + $('Enviar Borrador a Telegram').item.json.texto + '\\n\\nPEDIDO: ' + $json.message.text }}",
            type: 'string',
          },
        ],
      })
  )

  .add(
    node('Reescribir con IA', 'n8n-nodes-base.deepSeek')
      .setParameter('resource', 'chat')
      .setParameter('operation', 'message')
      .setParameter('model', 'deepseek-chat')
      .setParameter('promptType', 'defineBelow')
      .setParameter('text', "={{ $('Preparar Prompt Edicion').item.json.prompt }}")
  )

  .add(
    node('Preparar Nueva Version', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_nueva',
            name: 'texto',
            // La IA devuelve choices[0].message.content
            value: "={{ $('Reescribir con IA').item.json.choices[0].message.content }}",
            type: 'string',
          },
        ],
      })
  )

  .add(
    node('Actualizar Pendiente', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'update')
      .setParameter('tableId', { mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filter', {
        filters: [
          { columnName: 'estado', condition: 'eq', value: 'pendiente' },
        ],
        type: 'and',
      })
      .setParameter('data', [
        { field: 'texto', value: "={{ $('Preparar Nueva Version').item.json.texto }}" },
      ])
  )

  .add(
    node('Aviso Version Nueva', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', "={{ $('Preparar Nueva Version').item.json.texto }}")
  )

  // Lazo de vuelta al mensaje con botones.
  .bridge('Aviso Version Nueva').to('Enviar Borrador a Telegram')

  // ----------------------------------------------------------
  // 4) RAMA PUBLICAR: va directo a LinkedIn
  // ----------------------------------------------------------
  .add(
    node('Preparar Aviso Publicado', 'n8n-nodes-base.set')
      .setParameter('keepOnlySet', true)
      .setParameter('assignments', {
        assignments: [
          {
            id: '_aviso',
            name: 'texto',
            value: "✅ Publicado en tu perfil de LinkedIn.\n\n{{ $('Preparar Aviso Recibido').item.json.texto }}",
            type: 'string',
          },
        ],
      })
  )

  .add(
    node('Enviar Aviso Publicado', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', "={{ $('Preparar Aviso Publicado').item.json.texto }}")
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
      .setParameter('text', "={{ $('Preparar Aviso Publicado').item.json.texto }}")
  )

  // ----------------------------------------------------------
  // 5) RAMA DESCARTAR
  // ----------------------------------------------------------
  .add(
    node('Marcar Descartado', 'n8n-nodes-base.dataTable')
      .setParameter('resource', 'dataTable')
      .setParameter('operation', 'update')
      .setParameter('tableId', { mode: 'name', value: 'YOUR_PENDIENTES_TABLE' })
      .setParameter('filter', {
        filters: [
          { columnName: 'estado', condition: 'eq', value: 'pendiente' },
        ],
        type: 'and',
      })
      .setParameter('data', [{ field: 'estado', value: 'descartado' }])
  )

  .add(
    node('Aviso Descartado', 'n8n-nodes-base.telegram')
      .setParameter('resource', 'message')
      .setParameter('operation', 'sendMessage')
      .setParameter('chatId', 'YOUR_TELEGRAM_CHAT_ID')
      .setParameter('text', '🗑️ Borrador descartado. No se publicó.')
  )

  // ----------------------------------------------------------
  // CONEXIONES (Wire)
  // ----------------------------------------------------------
  .connect('Recibir Borrador', 'Normalizar Datos del Borrador')
  .connect('Normalizar Datos del Borrador', 'Guardar en Tabla')
  .connect('Guardar en Tabla', 'Preparar Aviso Recibido')
  .connect('Preparar Aviso Recibido', 'Enviar Borrador a Telegram')
  .connect('Enviar Borrador a Telegram', 'Esperar Callback')
  .connect('Esperar Callback', 'Clasificar Interaccion')
  .connect('Clasificar Interaccion', 'Estructurar Interaccion')
  // sonda paralela: se ejecuta siempre, la lee "Insertar Bandera" por referencia
  .connect('Clasificar Interaccion', 'Buscar Pendiente')
  .connect('Estructurar Interaccion', 'Insertar Bandera')
  // El Switch recibe UN solo item ya rotulado: publicar | editar | descartar | sinPendiente
  .connect('Insertar Bandera', 'Rutear Interaccion')
  .connect('Rutear Interaccion', 'Enviar Pregunta Edicion') // editar
  .connect('Rutear Interaccion', 'Preparar Aviso Publicado') // publicar
  .connect('Rutear Interaccion', 'Marcar Descartado') // descartar
  .connect('Rutear Interaccion', 'Aviso Sin Pendiente') // sinPendiente
  // (Buscar Pendiente alimenta "Insertar Bandera" por referencia $('Buscar Pendiente'))
  .connect('Enviar Pregunta Edicion', 'Esperar Respuesta Edicion')
  .connect('Esperar Respuesta Edicion', 'Preparar Prompt Edicion')
  .connect('Preparar Prompt Edicion', 'Reescribir con IA')
  .connect('Reescribir con IA', 'Preparar Nueva Version')
  .connect('Preparar Nueva Version', 'Actualizar Pendiente')
  .connect('Actualizar Pendiente', 'Aviso Version Nueva')
  .connect('Preparar Aviso Publicado', 'Enviar Aviso Publicado')
  .connect('Enviar Aviso Publicado', 'Publicar en LinkedIn')
  .connect('Marcar Descartado', 'Aviso Descartado')