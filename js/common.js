export const SITE_BASE = new URL('../', import.meta.url);
let configPromise;
export function assetURL(path) {
  const url = new URL(path, SITE_BASE);
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Đường dẫn tài nguyên không hợp lệ.');
  return url.href;
}
export async function loadConfig() {
  if (!configPromise) configPromise = (async () => {
    const response = await fetch(new URL('data/scenes.json', SITE_BASE), {cache: 'no-store'});
    if (!response.ok) throw new Error('Không đọc được data/scenes.json. Hãy kiểm tra các tệp đã đăng.');
    const config = await response.json();
    if (!Array.isArray(config.scenes) || !config.scenes.length) throw new Error('Danh sách mô hình chưa hợp lệ.');
    const ids = new Set();
    for (const scene of config.scenes) {
      if (typeof scene.id !== 'string' || !/^[a-z0-9_-]+$/i.test(scene.id) || ids.has(scene.id) || !scene.title || !scene.modelSrc) throw new Error('Cấu hình cảnh thiếu thông tin hoặc có ID trùng.');
      ids.add(scene.id);
    }
    return config;
  })();
  return configPromise;
}
export function sceneURL(id, base = SITE_BASE.href) {
  const url = new URL('viewer.html', base);
  url.searchParams.set('id', id);
  return url.href;
}
export function publicBase(value) {
  let url;
  try {url = new URL(value.trim());} catch {throw new Error('Hãy dán URL HTTPS được GitHub Pages cấp, ví dụ https://tenban.github.io/hat-ar/.');}
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  const ipv4 = /^\d+\.\d+\.\d+\.\d+$/.test(host) ? host.split('.').map(Number) : null;
  const privateIP = ipv4 && (ipv4[0] === 0 || ipv4[0] === 10 || ipv4[0] === 127 || (ipv4[0] === 169 && ipv4[1] === 254) || (ipv4[0] === 172 && ipv4[1] >= 16 && ipv4[1] <= 31) || (ipv4[0] === 192 && ipv4[1] === 168));
  if (url.protocol !== 'https:' || url.username || url.password || host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host === '::1' || host === '::' || /^(fc|fd)[0-9a-f]{2}:/.test(host) || host.startsWith('fe80:') || privateIP || !host.includes('.')) throw new Error('QR dùng chung cần URL HTTPS công khai. Localhost, IP nội bộ và file trên máy chỉ dùng để xem thử.');
  if (['github.com', 'www.github.com'].includes(host)) throw new Error('Đây là link repository. Hãy dùng URL website trong Settings → Pages, thường có dạng tenban.github.io/ten-repo/.');
  if (/\.html?$/i.test(url.pathname) || /\.(glb|mp4|usdz)$/i.test(url.pathname)) throw new Error('Hãy dán URL thư mục gốc website, không dán link HTML, GLB hoặc video.');
  url.search = ''; url.hash = '';
  if (!url.pathname.endsWith('/')) url.pathname += '/';
  return url.href;
}
export function inferredPublicBase(config) {
  const candidate = config.publicBaseUrl || SITE_BASE.href;
  try {return publicBase(candidate);} catch {return '';}
}
let qrLibrary;
export async function loadQR() {
  if (window.QRCode) return window.QRCode;
  if (!qrLibrary) qrLibrary = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = assetURL('vendor/qrcode-1.0.0.min.js');
    script.onload = () => window.QRCode ? resolve(window.QRCode) : reject(new Error('Thư viện QR chưa sẵn sàng.'));
    script.onerror = () => {qrLibrary = null; script.remove(); reject(new Error('Chưa tải được thư viện QR. Hãy kiểm tra thư mục vendor.'));};
    document.head.append(script);
  });
  return qrLibrary;
}
export async function renderQR(container, text) {
  const QRCode = await loadQR();
  const temp = document.createElement('div');
  temp.className = 'qr-source';
  container.replaceChildren(temp);
  new QRCode(temp, {text, width: 512, height: 512, colorDark: '#111111', colorLight: '#ffffff', correctLevel: QRCode.CorrectLevel.M});
  const source = temp.querySelector('canvas');
  if (!source) throw new Error('Trình duyệt chưa tạo được ảnh QR.');
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 640;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, 640, 640); ctx.drawImage(source, 64, 64);
  canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Mã QR dẫn tới mô hình');
  container.replaceChildren(canvas);
  return canvas;
}
export function saveQR(canvas, filename) {
  canvas.toBlob(blob=>{
    if(!blob){toast('Chưa xuất được ảnh QR. Hãy thử lại.');return;}
    const url=URL.createObjectURL(blob), a=document.createElement('a');
    a.download=filename;a.href=url;document.body.append(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),30000);
  },'image/png');
}
let toastTimer;
export function toast(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  clearTimeout(toastTimer); el.textContent = message; el.hidden = false;
  toastTimer = setTimeout(() => {el.hidden = true;}, 4200);
}
export async function copyURL(value, input) {
  try {await navigator.clipboard.writeText(value); toast('Đã sao chép liên kết.');}
  catch {if (input) {input.focus(); input.select();} toast('Hãy nhấn giữ hoặc Ctrl+C để sao chép đường dẫn đang chọn.');}
}
export function showPageError(message) {
  const error = document.getElementById('page-error');
  if (error) {error.textContent = message; error.hidden = false;}
}
