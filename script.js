const form = document.getElementById('form');
const result = document.getElementById('result');
const preview = document.getElementById('preview');
const calendarCta = document.getElementById('calendarCta');
const waBtn = document.getElementById('waBtn');
const smsBtn = document.getElementById('smsBtn');
const mailBtn = document.getElementById('mailBtn');

function fmtDate(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('de-DE', { weekday:'short', day:'2-digit', month:'2-digit', year:'numeric' });
}

function fmtTime(timeStr){
  const [h,m] = timeStr.split(':');
  const d = new Date(); d.setHours(+h, +m, 0, 0);
  return d.toLocaleTimeString('de-DE', { hour:'2-digit', minute:'2-digit' });
}

form.addEventListener('submit', (e)=>{
  e.preventDefault();
  const title = document.getElementById('title').value.trim();
  const date = document.getElementById('date').value;
  const time = document.getElementById('time').value;
  const location = document.getElementById('location').value.trim();
  const message = document.getElementById('message').value.trim();

  if(!title || !date || !time || !location){
    alert('Bitte Titel, Datum, Uhrzeit und Ort ausfüllen.');
    return;
  }

  // Schöne Vorschau
  const pretty = `📅 Termin: ${title}
📆 Datum: ${fmtDate(date)}
⏰ Uhrzeit: ${fmtTime(time)}
📍 Ort: ${location}${message ? `
💬 Hinweis: ${message}` : ''}`;
  preview.textContent = pretty;

  // Funktionslink bauen
  const url = new URL('/.netlify/functions/generate-ics', window.location.origin);
  url.searchParams.set('title', title);
  url.searchParams.set('date', date);
  url.searchParams.set('time', time);
  url.searchParams.set('location', location);
  if(message) url.searchParams.set('message', message);
  const icsLink = url.toString();

  // CTA
  calendarCta.href = icsLink;

  // Sharing
  const enc = encodeURIComponent(`${pretty}
🗓️ Termin eintragen: ${icsLink}`);
  waBtn.href = `https://wa.me/?text=${enc}`;
  smsBtn.href = `sms:?body=${enc}`;
  mailBtn.href = `mailto:?subject=${encodeURIComponent('Termin: ' + title)}&body=${enc}`;

  result.classList.remove('hidden');
});
