// Serverless Function: generate-ics
// Keine externen Dependencies nötig. Wir schreiben eine ICS mit VTIMEZONE (Europe/Zurich).

function pad(n){ return String(n).padStart(2,'0'); }

function addOneHour(h, m){
  let hour = parseInt(h,10), min = parseInt(m,10);
  // +60 Minuten:
  min += 60;
  hour += Math.floor(min / 60);
  min = min % 60;
  return [pad(hour), pad(min)];
}

exports.handler = async (event) => {
  try {
    const p = event.queryStringParameters || {};
    const title = (p.title || 'Termin').toString();
    const date = (p.date || '').toString();      // yyyy-mm-dd
    const time = (p.time || '00:00').toString(); // HH:mm
    const location = (p.location || '').toString();
    const message = (p.message || '').toString();

    if(!date || !time){
      return { statusCode: 400, body: 'Fehlende Parameter: date, time' };
    }

    // Zerlegen
    const [Y, M, D] = date.split('-').map(x=>parseInt(x,10));
    const [h, m] = time.split(':');

    // Start/Ende in lokaler Zeit (Europe/Zurich) als "floating times":
    const startLocal = `${Y}${pad(M)}${pad(D)}T${pad(h)}${pad(m)}00`;
    const [eh, em] = addOneHour(h, m);
    const endLocal   = `${Y}${pad(M)}${pad(D)}T${eh}${em}00`;

    const uid = `appt-${Date.now()}-${Math.random().toString(36).slice(2)}@netlify`;
    const dtstamp = new Date().toISOString().replace(/[-:]/g,'').split('.')[0]+'Z';

    const ics = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Termin-App//Netlify//DE
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VTIMEZONE
TZID:Europe/Zurich
X-LIC-LOCATION:Europe/Zurich
BEGIN:STANDARD
TZOFFSETFROM:+0200
TZOFFSETTO:+0100
TZNAME:CET
DTSTART:19701025T030000
RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU
END:STANDARD
BEGIN:DAYLIGHT
TZOFFSETFROM:+0100
TZOFFSETTO:+0200
TZNAME:CEST
DTSTART:19700329T020000
RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU
END:DAYLIGHT
END:VTIMEZONE
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
SUMMARY:${title.replace(/\r?\n/g,' ')}
DESCRIPTION:${message.replace(/\r?\n/g,' ')}
LOCATION:${location.replace(/\r?\n/g,' ')}
DTSTART;TZID=Europe/Zurich:${startLocal}
DTEND;TZID=Europe/Zurich:${endLocal}
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Erinnerung 24 h vor dem Termin
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Erinnerung 1 h vor dem Termin
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': 'attachment; filename="termin.ics"',
        'Cache-Control': 'public, max-age=31536000, immutable'
      },
      body: ics
    };
  } catch (err) {
    return { statusCode: 500, body: 'Fehler beim Erstellen der ICS: ' + err.message };
  }
};
