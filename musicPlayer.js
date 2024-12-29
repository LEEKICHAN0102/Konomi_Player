// musicPlayer.js
const params = new URLSearchParams(window.location.search);
const videoUrl = params.get("videoUrl");

if (videoUrl) {
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${videoUrl.split('v=')[1]}?autoplay=1&loop=1`;
  iframe.frameBorder = '0';
  iframe.allow = 'autoplay';
  document.body.appendChild(iframe);
}