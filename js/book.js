import {loadConfig,assetURL,sceneURL,inferredPublicBase,renderQR} from './common.js';
const $=id=>document.getElementById(id);
let config,book,flip,currentPage=0,reading=false;
let requestedPage=Number(new URL(location.href).searchParams.get('page') || 1)-1;
const mediaAt=number=>config.scenes.filter(s=>s.bookPage===number);
const pageTitle=(page,index)=>page.title || (index===0?'Bìa sách':'Bìa sau');
const mascots={
  2:['👋','bottom-left','Chào cậu! Tớ là Hạt Tí, thám tử hạt. Khóa huấn luyện bắt đầu rồi, cậu cùng tớ đi phá các vụ án nhé!','assets/models/hat-ti-binh-thuong.glb'],
  3:['📱','bottom-right','Cậu hãy dùng điện thoại làm “Kính lúp ma thuật” để giúp tớ nhìn xuyên thấu vật chất nhé!'],
  4:['🕵️','inline','Lạ thật! Hai thứ này đều là nước, vậy cấu trúc hạt bên trong khác nhau ở đâu nhỉ? Cậu thử dự đoán cùng tớ xem!','assets/models/hat-ti-suy-nghi.glb'],
  8:['🔎','bottom-right','Tuyệt vời! Vụ án số 1: Tớ và cậu đã phá xong!'],
  9:['🧢','bottom-left','Nóng quá cậu ơi, tớ sắp tan ra thành nước luôn rồi!','assets/models/hat-ti-nong-nuc.glb'],
  10:['🧣','bottom-left','Lạnh cóng! Tớ thấy các hạt đang phải xếp sát lại để sưởi ấm cho nhau kìa cậu!','assets/models/hat-ti-lanh-cong.glb'],
  12:['🔍','bottom-right','Cậu ơi, hay là nước đã ngấm xuyên qua lớp thủy tinh dày để chảy ra ngoài nhỉ... cậu nghĩ tớ đoán thế có đúng không?'],
  15:['🤔','bottom-left','Đều là chuyển từ thể lỏng sang thể khí, nhưng cậu thấy hai quá trình này khác nhau ở đâu? Phơi quần áo hằng ngày là bay hơi hay sôi?'],
  18:['🤫','bottom-left','Nếu bí quá, cậu cứ lật lại trang 11 và 13 để xem gợi ý của tớ nhé, đừng ngại!'],
  19:['🧺','bottom-left','Nước bốc hơi hết sạch rồi, cậu nghĩ muối có mọc cánh bay theo nước luôn không nhỉ?'],
  22:['🔦','bottom-left','Sương mù này y hệt vụ án giọt nước ngoài thành cốc ở trang 12 đấy! Cậu mau dùng Kính lúp hạt soi thử bản chất bên trong xem nào!'],
  23:['⚖️','bottom-left','Đến lúc kiểm tra tài năng thám tử thực thụ của cậu rồi! Trả lời cẩn thận nha, đừng để tớ lừa đấy!'],
  25:['🏅','bottom-right','Cậu siêu thật đấy! Chúc mừng cậu đã cùng tớ phá đảo thành công toàn bộ khóa huấn luyện thám tử khoa học!']
};
function error(message){$('book-error').textContent=message;$('book-error').hidden=false;}

function mediaBox(scene){
  const box=document.createElement('aside');box.className='book-media';box.dataset.scene=scene.id;
  const lens=document.createElement('div');lens.className='book-lens';
  const qr=document.createElement('div');qr.className='book-qr';qr.dataset.model=scene.id;
  const copy=document.createElement('div');copy.className='book-media-copy';
  const title=document.createElement('h3');title.className='book-media-title';title.textContent=`Quan sát 3D · ${scene.shortTitle || scene.title}`;
  const text=document.createElement('p');text.textContent='Quét QR bằng điện thoại để mở mô hình của bài này.';
  const link=document.createElement('a');link.className='book-media-link';link.textContent='Mở mô hình 3D ↗';link.href=sceneURL(scene.id);link.setAttribute('aria-label',`Mở mô hình 3D ${scene.shortTitle || scene.title}`);
  const note=document.createElement('p');note.className='book-qr-note';note.textContent=scene.hasAnimation?'Kéo để xoay · Có nút phát / tạm dừng hoạt hình.':'Kéo để xoay · Mô hình tĩnh, chưa thể hiện dao động của hạt.';
  lens.append(qr);copy.append(title,text,link,note);box.append(lens,copy);return box;
}

function makePage(page,index){
  const sheet=document.createElement('article');sheet.className='page-sheet';sheet.dataset.page=String(index+1);sheet.setAttribute('aria-label',`Trang ${index+1}: ${pageTitle(page,index)}`);
  if(page.type==='cover'||page.type==='back-cover'){sheet.dataset.density='hard';sheet.innerHTML=page.content;}
  else{
    const header=document.createElement('div');header.className='sheet-header';
    const chapter=document.createElement('span');chapter.textContent=page.chapter || 'KHOA HỌC TỰ NHIÊN 6';
    const number=document.createElement('span');number.textContent=`TRANG ${index+1}`;header.append(chapter,number);
    const body=document.createElement('div');body.className='sheet-body';
    const title=document.createElement('h2');title.className='book-page-title';title.textContent=page.title;
    const content=document.createElement('div');content.className='book-page-content';content.innerHTML=page.content;
    const scenes=mediaAt(index+1);body.append(title,content);
    const mascot=mascots[index+1];
    if(mascot){const position=scenes.length&&mascot[1].startsWith('bottom-')?'inline with-qr':mascot[1];const figure=document.createElement('aside');figure.className=`hat-ti ${position}${mascot[3]?' has-model':''}`;figure.setAttribute('aria-label','Lời thoại của Hạt Tí');const avatar=document.createElement('span');avatar.className='hat-ti-avatar';avatar.setAttribute('aria-hidden','true');if(mascot[3]&&window.customElements?.get('model-viewer')){const model=document.createElement('model-viewer');model.src=assetURL(mascot[3]);model.setAttribute('animation-name','TatCaCacHat');model.setAttribute('autoplay','');model.setAttribute('auto-rotate','');model.setAttribute('interaction-prompt','none');model.setAttribute('loading','eager');avatar.append(model);}else avatar.textContent=mascot[0];const speech=document.createElement('p');speech.textContent=mascot[2];figure.append(avatar,speech);body.append(figure);}
    for(const scene of scenes)body.append(mediaBox(scene));
    const footer=document.createElement('div');footer.className='sheet-footer';
    const name=document.createElement('span');name.textContent='THẾ GIỚI HẠT · KHTN 6';const n=document.createElement('strong');n.textContent=String(index+1);footer.append(name,n);
    const layout=document.createElement('div');layout.className='sheet-layout';layout.append(header,body,footer);sheet.append(layout);
  }
  return sheet;
}

async function fillQR(){
  const base=inferredPublicBase(config);
  await Promise.all([...document.querySelectorAll('.book-qr')].map(async el=>{
    if(!base){el.textContent='QR xuất hiện sau khi đăng web HTTPS. Bấm nút bên cạnh để xem thử.';return;}
    try{await renderQR(el,sceneURL(el.dataset.model,base));}catch{el.textContent='Chưa tạo được QR. Hãy bấm Mở mô hình 3D.';}
  }));
}

function updateNavigation(index){
  currentPage=index;$('page-select').value=String(index);
  const orientation=flip?.getOrientation();
  const end=orientation==='landscape'&&index>0&&index<book.pages.length-1?`–${Math.min(index+2,book.pages.length)}`:'';
  $('page-indicator').textContent=`Trang ${index+1}${end} / ${book.pages.length}`;
  $('book-prev').disabled=index===0;$('book-next').disabled=index===book.pages.length-1;
}
function jump(index){
  if(!Number.isInteger(index)||index<0||index>=book.pages.length)return;
  if(reading){document.querySelector(`#reading-pages [data-page="${index+1}"]`)?.scrollIntoView({behavior:'smooth',block:'start'});updateNavigation(index);}
  else if(flip){flip.turnToPage(index);updateNavigation(flip.getCurrentPageIndex());$('page-select').value=String(index);}
}
function toggleReading(){
  reading=!reading;$('reading-pages').hidden=!reading;$('flip-area').hidden=reading;$('flip-navigation').hidden=reading;
  $('toggle-reading').textContent=reading?'Xem sách lật trang':'Đọc dạng cuộn';$('toggle-reading').setAttribute('aria-pressed',String(reading));
  const selected=Number($('page-select').value);
  if(reading)document.querySelector(`#reading-pages [data-page="${selected+1}"]`)?.scrollIntoView({behavior:'smooth',block:'start'});
  else if(flip){flip.update();jump(selected);}
}

// The original book content calls checkQuiz from its answer buttons.
window.checkQuiz=(button,correct)=>{
  const group=button.parentElement;
  for(const b of group.querySelectorAll('.quiz-btn')){b.classList.remove('bg-emerald-200','bg-rose-200','border-emerald-500','border-rose-500');b.setAttribute('aria-pressed','false');}
  button.classList.add(correct?'bg-emerald-200':'bg-rose-200',correct?'border-emerald-500':'border-rose-500');button.setAttribute('aria-pressed','true');
  let feedback=group.parentElement.querySelector('.quiz-feedback');
  if(!feedback){feedback=document.createElement('p');feedback.className='quiz-feedback';feedback.setAttribute('role','status');group.after(feedback);}
  feedback.textContent=correct?'Đúng rồi! Em hãy giải thích lại bằng lời của mình.':'Chưa đúng. Hãy đọc lại phần chuyển thể rồi thử lại.';
};

try{
  try{await import(assetURL('vendor/model-viewer-4.4.0.min.js'));await customElements.whenDefined('model-viewer');}catch{ /* Emoji fallback remains available if the 3D component cannot load. */ }
  config=await loadConfig();const response=await fetch(assetURL('data/book.json'),{cache:'no-store'});
  if(!response.ok)throw new Error('Không đọc được nội dung data/book.json.');
  book=await response.json();if(!Array.isArray(book.pages)||!book.pages.length)throw new Error('Nội dung sách chưa hợp lệ.');
  $('book-count').textContent=String(book.pages.length);$('toc-count').textContent=String(book.pages.length);
  if(!Number.isInteger(requestedPage)||requestedPage<0||requestedPage>=book.pages.length)requestedPage=0;
  for(const [index,page] of book.pages.entries()){
    $('flipbook').append(makePage(page,index));$('reading-pages').append(makePage(page,index));
    const option=document.createElement('option');option.value=String(index);option.textContent=`Trang ${index+1}: ${pageTitle(page,index)}`;$('page-select').append(option);
    const item=document.createElement('button');item.type='button';item.className='toc-item';
    const text=document.createElement('span');text.textContent=`${index+1}. ${pageTitle(page,index)}`;item.append(text);
    if(mediaAt(index+1).length){const tag=document.createElement('span');tag.className='toc-3d';tag.textContent='QR · 3D';item.append(tag);}
    item.addEventListener('click',()=>{$('book-toc').close();jump(index);});$('toc-list').append(item);
  }
  $('page-select').addEventListener('change',event=>jump(Number(event.target.value)));
  $('book-prev').addEventListener('click',()=>flip?.flipPrev());$('book-next').addEventListener('click',()=>flip?.flipNext());
  $('open-toc').addEventListener('click',()=>$('book-toc').showModal());$('close-toc').addEventListener('click',()=>$('book-toc').close());
  $('toggle-reading').addEventListener('click',toggleReading);
  if(!window.St?.PageFlip){error('Chế độ lật trang chưa tải được. Em vẫn có thể đọc toàn bộ sách dạng cuộn.');reading=true;$('reading-pages').hidden=false;$('flip-area').hidden=true;$('flip-navigation').hidden=true;$('toggle-reading').hidden=true;}
  else{
    flip=new window.St.PageFlip($('flipbook'),{width:400,height:620,size:'stretch',minWidth:275,maxWidth:400,minHeight:425,maxHeight:620,showCover:true,flippingTime:500,maxShadowOpacity:.35,mobileScrollSupport:false,useMouseEvents:false});
    flip.on('flip',event=>updateNavigation(event.data));flip.on('changeOrientation',()=>updateNavigation(flip.getCurrentPageIndex()));
    flip.loadFromHTML(document.querySelectorAll('#flipbook .page-sheet'));flip.turnToPage(requestedPage);updateNavigation(flip.getCurrentPageIndex());$('page-select').value=String(requestedPage);
  }
  $('book-loading').hidden=true;
  window.addEventListener('keydown',event=>{
    if(reading||$('book-toc').open||event.target.closest('input,select,textarea,button,a,[contenteditable]'))return;
    if(event.key==='ArrowRight'){event.preventDefault();flip?.flipNext();}
    if(event.key==='ArrowLeft'){event.preventDefault();flip?.flipPrev();}
  });
  await fillQR();
}catch(e){$('book-loading').hidden=true;error(`${e.message} Hãy chạy bằng HTTP server hoặc đăng đầy đủ các thư mục lên GitHub Pages.`);}
