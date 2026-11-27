// Script para el Google Calendar de Territorio Saludable.
// Se pega en script.google.com (con el Gmail dueño del calendario) y se publica como "Aplicación web".
// - El bot lo llama cuando se aprueba un pago: aquí se crea el evento con sus recordatorios.
// - También envía por correo el resumen diario de pedidos.
// - Si se ejecuta una vez "instalarResumenDiario", todos los días a las 2 pm pide el resumen a la página.

// Enlace del resumen diario (se copia desde el panel: Configuración → Avisos de pedidos y calendario)
var ENLACE_RESUMEN = '';

function doPost(e) {
  try {
    var d = JSON.parse(e.postData.contents);
    if (d.accion === 'correo') {
      MailApp.sendEmail({ to: d.para, subject: d.asunto, body: d.cuerpo, name: 'Territorio Saludable' });
      return respuesta({ ok: true });
    }
    var calendario = CalendarApp.getDefaultCalendar();
    var opciones = { description: d.descripcion || '', location: d.ubicacion || '' };
    if (d.invitados) {
      opciones.guests = d.invitados;
      opciones.sendInvites = true;
    }
    var evento = d.todoElDia
      ? calendario.createAllDayEvent(d.titulo, new Date(d.inicio), opciones)
      : calendario.createEvent(d.titulo, new Date(d.inicio), new Date(d.fin), opciones);
    evento.removeAllReminders();
    (d.recordatoriosMinutos || [1440, 120]).forEach(function (minutos) {
      evento.addPopupReminder(minutos);
    });
    return respuesta({ ok: true, id: evento.getId() });
  } catch (error) {
    return respuesta({ ok: false, error: String(error) });
  }
}

// Para probar que quedó publicado: al abrir el enlace en el navegador debe decir {"ok":true,"listo":true}
function doGet() {
  return respuesta({ ok: true, listo: true, correo: true });
}

function respuesta(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(ContentService.MimeType.JSON);
}

// Se ejecuta una sola vez (botón "Ejecutar") para programar el resumen de las 2 pm.
function instalarResumenDiario() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'pedirResumenDiario') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('pedirResumenDiario').timeBased().atHour(14).nearMinute(0).everyDays(1).inTimezone('America/Bogota').create();
  MailApp.getRemainingDailyQuota(); // pide el permiso de correo de una vez
}

function pedirResumenDiario() {
  if (!ENLACE_RESUMEN) return;
  UrlFetchApp.fetch(ENLACE_RESUMEN, { muteHttpExceptions: true });
}
