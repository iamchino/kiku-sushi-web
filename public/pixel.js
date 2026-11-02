// Meta Pixel (ID 202717241811091). Antes estaba inline en index.html; vive acá
// para que la Content-Security-Policy pueda prohibir scripts inline.
// Solo PageView al cargar y el evento Schedule al confirmar una reserva (ver
// ReservationFormV2.tsx). No se manda ningún dato personal.
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '202717241811091');
fbq('track', 'PageView');
