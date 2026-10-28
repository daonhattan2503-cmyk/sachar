import {loadConfig, publicBase, inferredPublicBase, sceneURL, renderQR, saveQR, copyURL} from './common.js';
const form=document.getElementById('qr-form'), input=document.getElementById('base-url'), results=document.getElementById('qr-results'), error=document.getElementById('qr-error');
let config, generation=0;
function placeholder(text) {const p=document.createElement('p');p.className='qr-placeholder';p.textContent=text;results.replaceChildren(p);}
async function generate(event) {
  event?.preventDefault();error.hidden=true;
  let base;
  try {base=publicBase(input.value);}catch(e){generation++;placeholder('Chưa có QR hợp lệ cho địa chỉ đang nhập. Hãy sửa URL rồi tạo lại.');error.textContent=e.message;error.hidden=false;return;}
  if(!config)return;
  const token=++generation;
  input.value=base;results.replaceChildren();
  try {localStorage.setItem('hat-ar-public-base',base);}catch{}
  for(const scene of config.scenes) {
    const card=document.createElement('section');card.className='qr-result';
    const heading=document.createElement('h2');heading.textContent=scene.title;
    const tag=document.createElement('span');tag.className='small-label';tag.textContent=`MÃ CẢNH · ${scene.id.toUpperCase()}`;
    const qr=document.createElement('div');qr.className='qr-display';
    const url=sceneURL(scene.id,base);
    const link=document.createElement('input');link.readOnly=true;link.value=url;link.className='url-output';link.setAttribute('aria-label',`Đường dẫn ${scene.title}`);
    const actions=document.createElement('div');actions.className='dialog-actions';
    const download=document.createElement('button');download.type='button';download.className='button button-primary';download.textContent='Tải QR PNG ↓';download.disabled=true;
    const copy=document.createElement('button');copy.type='button';copy.className='button button-outline';copy.textContent='Sao chép link';copy.addEventListener('click',()=>copyURL(url,link));
    const open=document.createElement('a');open.href=url;open.className='text-link';open.textContent='Mở thử mô hình ↗';open.target='_blank';open.rel='noopener';
    const note=document.createElement('p');note.className='small-copy';note.textContent='640 × 640 px · có lề trắng · giữ nguyên URL để dùng lại QR';
    actions.append(download,copy);card.append(heading,tag,qr,link,actions,note,open);results.append(card);
    try {const canvas=await renderQR(qr,url);if(token!==generation)return;download.disabled=false;download.addEventListener('click',()=>saveQR(canvas,`qr-${scene.id}.png`));}
    catch(e){qr.textContent=e.message;}
  }
}
form.addEventListener('submit',generate);
document.getElementById('clear-url').addEventListener('click',()=>{
  generation++;
  try{localStorage.removeItem('hat-ar-public-base');}catch{}
  input.value=inferredPublicBase(config || {});error.hidden=true;
  placeholder('Đã xoá địa chỉ đã nhớ. Dán URL website HTTPS thật để tạo QR.');
  if(input.value)generate();
});
try {
  config=await loadConfig();
  let stored='';try{stored=localStorage.getItem('hat-ar-public-base')||'';}catch{}
  const inferred=inferredPublicBase(config);
  input.value=inferred || stored;
  if(input.value)await generate();
  else placeholder('Website đang chạy trên máy. Sau khi đăng GitHub Pages, dán URL HTTPS được cấp vào ô phía trên để tạo mã QR.');
}catch(e){error.textContent=`Chưa đọc được cấu hình. ${e.message}`;error.hidden=false;}
