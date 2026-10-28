import {loadConfig,assetURL,sceneURL,inferredPublicBase,renderQR} from './common.js';
const $=id=>document.getElementById(id);
let config,book,flip,currentPage=0,reading=false;
let requestedPage=Number(new URL(location.href).searchParams.get('page') || 1)-1;
const mediaAt=number=>config.scenes.filter(s=>s.bookPage===number);
const pageTitle=(page,index)=>page.title || (index===0?'Bìa sách':'Bìa sau');
function error(message){$('book-error').textContent=message;$('book-error').hidden=false;}

function mediaBox(scene){
  const box=document.createElement('aside');box.className='book-media';box.dataset.scene=scene.id;
  const qr=document.createElement('div');qr.className='book-qr';qr.dataset.model=scene.id;
  const copy=document.createElement('div');copy.className='book-media-copy';
  const title=document.createElement('h3');title.className='book-media-title';title.textContent=`Quan sát 3D · ${scene.shortTitle || scene.title}`;
  const text=document.createElement('p');text.textContent='Quét QR bằng điện thoại để mở mô hình của bài này.';
  const link=document.createElement('a');link.className='book-media-link';link.textContent='Mở mô hình 3D ↗';link.href=sceneURL(scene.id);link.setAttribute('aria-label',`Mở mô hình 3D ${scene.shortTitle || scene.title}`);
  const note=document.createElement('p');note.className='book-qr-note';note.textContent=scene.hasAnimation?'Kéo để xoay · Có nút phát / tạm dừng hoạt hình.':'Kéo để xoay · Mô hình tĩnh, chưa thể hiện dao động của hạt.';
  copy.append(title,text,link);box.append(qr,copy,note);return box;
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
    body.append(title,content);for(const scene of mediaAt(index+1))body.append(mediaBox(scene));
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
  config=await loadConfig();const response=await fetch(assetURL('data/book.json'),{cache:'no-store'});
  if(!response.ok)throw new Error('Không đọc được nội dung data/book.json.');
  book=await response.json();if(!Array.isArray(book.pages)||!book.pages.length)throw new Error('Nội dung sách chưa hợp lệ.');
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
