import {loadConfig, sceneURL} from './common.js';

function illustration(theme) {
  let shapes = '';
  if (theme === 'gas') {
    for (let i = 0; i < 42; i++) {
      const x = 130 + ((i * 73 + 13) % 188), y = 65 + ((i * 53 + 7) % 162);
      shapes += `<circle cx="${x}" cy="${y}" r="${4 + i % 3}" fill="url(#gas-ball)"/>`;
      if (i % 5 === 0) shapes += `<path d="M${x-17} ${y+5}l-12 4" stroke="#9dbee7" stroke-width="1.5" stroke-linecap="round"/>`;
    }
    return `<svg aria-hidden="true" viewBox="0 0 450 280"><defs><radialGradient id="gas-ball" cx="30%" cy="25%"><stop stop-color="#94ceff"/><stop offset=".5" stop-color="#4589df"/><stop offset="1" stop-color="#2259b0"/></radialGradient></defs><ellipse cx="225" cy="244" rx="98" ry="12" fill="#b2c4d5" opacity=".2"/><path d="M117 53v169c0 25 216 25 216 0V53" stroke="#a8bac9" fill="#d2e0e9" fill-opacity=".16" stroke-width="1.2"/><ellipse cx="225" cy="53" rx="108" ry="20" fill="#f2f7fa" fill-opacity=".5" stroke="#a8bac9"/>${shapes}<path d="M117 222c0 25 216 25 216 0" fill="none" stroke="#a8bac9"/></svg>`;
  }
  const p = (x,y,z) => [225 + (x-z)*27, 186 + (x+z)*13-y*32];
  for (let y=0;y<4;y++) for (let z=0;z<4;z++) for (let x=0;x<4;x++) {
    const [a,b]=p(x,y,z);
    for (const [dx,dy,dz] of [[1,0,0],[0,1,0],[0,0,1]]) if(x+dx<4&&y+dy<4&&z+dz<4) {
      const [c,d]=p(x+dx,y+dy,z+dz); shapes+=`<path d="M${a} ${b}L${c} ${d}" stroke="#c4aaa0" stroke-width="2.5"/>`;
    }
    shapes+=`<circle cx="${a}" cy="${b}" r="8" fill="url(#solid-ball)"/>`;
  }
  return `<svg aria-hidden="true" viewBox="0 0 450 280"><defs><radialGradient id="solid-ball" cx="30%" cy="25%"><stop stop-color="#ffb3a2"/><stop offset=".4" stop-color="#d97057"/><stop offset="1" stop-color="#a9473b"/></radialGradient></defs><ellipse cx="225" cy="246" rx="100" ry="14" fill="#bda999" opacity=".15"/><g transform="translate(0,-29)">${shapes}</g></svg>`;
}

try {
  const config = await loadConfig();
  const grid = document.getElementById('model-grid');
  grid.replaceChildren();
  config.scenes.forEach((scene, index) => {
    const card = document.createElement('a');
    card.className = `model-card ${scene.theme === 'solid' ? 'solid' : 'gas'}`;
    card.href = sceneURL(scene.id);
    const art = document.createElement('div'); art.className='card-art';
    art.innerHTML = illustration(scene.theme);
    const number = document.createElement('span'); number.className='art-number'; number.textContent=String(index+1).padStart(2,'0');
    const badge = document.createElement('span'); badge.className='art-pill'; badge.textContent=scene.hasAnimation?'Có chuyển động':'Cấu trúc tĩnh';
    const label = document.createElement('span'); label.className='art-label'; label.textContent='HÌNH MINH HOẠ · MỞ ĐỂ XEM MÔ HÌNH THẬT';
    art.append(number,badge,label);
    const content = document.createElement('div'); content.className='card-content';
    const heading=document.createElement('div'); heading.className='card-heading';
    const title=document.createElement('h3'); title.textContent=scene.shortTitle;
    const arrow=document.createElement('span'); arrow.className='card-arrow'; arrow.textContent='↗'; arrow.setAttribute('aria-hidden','true');
    heading.append(title,arrow);
    const desc=document.createElement('p'); desc.textContent=scene.description;
    const meta=document.createElement('div'); meta.className='card-meta';
    for(const value of ['Xem 3D & AR',scene.sizeLabel,scene.hasAnimation?'Hoạt hình':'Tĩnh']) {const span=document.createElement('span');span.textContent=value;meta.append(span);}
    content.append(heading,desc,meta);card.append(art,content);grid.append(card);
  });
} catch(error) {
  const grid=document.getElementById('model-grid');grid.replaceChildren();
  const notice=document.createElement('p');notice.className='notice error';notice.textContent=`Chưa mở được danh sách. ${error.message} Nếu đang mở tệp trên máy, hãy dùng XEM_THU.cmd hoặc một HTTP server.`;grid.append(notice);
}
