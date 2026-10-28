import {loadConfig, assetURL, sceneURL, inferredPublicBase, renderQR, saveQR, copyURL, showPageError} from './common.js';

const $ = id => document.getElementById(id);
let scene, config, viewer, ready=false, playing=true, currentMode='3d', timeout, shareCanvas;

function updateAR() {
  const button=$('activate-ar');
  if (!ready) {button.disabled=true;button.textContent='AR chưa sẵn sàng';$('ar-status').textContent='Mô hình cần tải thành công trước khi mở AR.';return;}
  if (currentMode==='video') {button.disabled=true;button.textContent='Chọn mô hình 3D để mở AR';$('ar-status').textContent='Em đang xem video minh hoạ.';return;}
  const supported=!!viewer?.canActivateAR;
  button.disabled=!supported;
  button.textContent=supported?'Xem trong không gian thật ↗':'AR chưa khả dụng trên máy này';
  $('ar-status').textContent=supported?'Hướng camera vào mặt bàn đủ sáng sau khi mở AR.':'Em vẫn xem được 3D. Để thử AR, mở link HTTPS trên điện thoại hỗ trợ bằng Chrome hoặc Safari.';
}

function modelError(message) {
  clearTimeout(timeout); ready=false;
  $('load-overlay').hidden=true;$('model-error').hidden=false;
  $('model-error-text').textContent=message;
  $('load-status').textContent='Chưa tải được';
  $('rotate-toggle').disabled=true;$('animation-toggle').disabled=true;
  updateAR();
}

async function mountModel() {
  clearTimeout(timeout);ready=false;playing=true;
  $('load-overlay').hidden=false;$('model-error').hidden=true;
  $('load-progress').value=0;$('load-label').textContent='Đang mở mô hình…';
  $('load-status').textContent='Đang tải…';$('rotate-toggle').disabled=true;
  $('animation-toggle').hidden=true;$('rotate-toggle').setAttribute('aria-pressed','false');
  updateAR();
  const old=viewer;viewer=null;if(old)old.remove();
  timeout=setTimeout(()=>modelError('Mô hình tải lâu hơn dự kiến. Hãy kiểm tra kết nối rồi thử lại; nếu đã có video, em có thể chọn Video minh hoạ.'),45000);
  try {
    await import(assetURL('vendor/model-viewer-4.4.0.min.js'));
    await customElements.whenDefined('model-viewer');
    const mv=document.createElement('model-viewer');
    viewer=mv;
    mv.id='particle-model';
    mv.setAttribute('alt',scene.title);
    mv.setAttribute('camera-controls','');mv.setAttribute('touch-action','pan-y');
    mv.setAttribute('camera-orbit','32deg 72deg auto');mv.setAttribute('field-of-view','32deg');
    mv.setAttribute('shadow-intensity','0.6');mv.setAttribute('shadow-softness','0.8');
    mv.setAttribute('exposure','1.1');mv.setAttribute('ar','');
    mv.setAttribute('ar-modes','webxr scene-viewer quick-look');mv.setAttribute('ar-placement','floor');
    mv.setAttribute('loading','eager');
    if(scene.posterSrc)mv.setAttribute('poster',assetURL(scene.posterSrc));
    if(scene.iosSrc)mv.setAttribute('ios-src',assetURL(scene.iosSrc));
    if(scene.animationName)mv.setAttribute('animation-name',scene.animationName);
    // Hide only the default button; our visible AR button uses the public activateAR API.
    const hiddenButton=document.createElement('button');hiddenButton.slot='ar-button';hiddenButton.hidden=true;hiddenButton.setAttribute('aria-hidden','true');mv.append(hiddenButton);
    mv.addEventListener('progress',event=>{if(viewer!==mv)return;const value=event.detail.totalProgress;$('load-progress').value=value;$('load-label').textContent=value<1?`Đang tải mô hình · ${Math.round(value*100)}%`:'Đang chuẩn bị hình ảnh…';});
    mv.addEventListener('load',()=>{
      if(viewer!==mv)return;
      clearTimeout(timeout);ready=true;mv.dataset.ready='true';
      $('load-overlay').hidden=true;$('model-error').hidden=true;
      $('load-status').textContent=`Đã tải · ${scene.sizeLabel || 'GLB'}`;
      $('rotate-toggle').disabled=false;
      const animations=mv.availableAnimations || [];
      $('animation-toggle').hidden=animations.length===0;
      $('animation-toggle').disabled=false;
      if(animations.length) {
        if(!animations.includes(scene.animationName))mv.animationName=animations[0];
        mv.play();playing=true;$('animation-toggle').textContent='Tạm dừng chuyển động';
      }
      updateAR();
      // Native/WebXR support detection can finish just after the model load event.
      setTimeout(()=>{if(viewer===mv)updateAR();},1200);
    });
    mv.addEventListener('error',()=>{if(viewer===mv)modelError('Kiểm tra kết nối và tệp mô hình trong assets/models. Em có thể tải lại hoặc xem video thay thế nếu có.');});
    mv.addEventListener('ar-status',event=>{
      if(viewer!==mv)return;
      if(event.detail.status==='failed')$('ar-status').textContent='Chưa mở được AR. Hãy thử trình duyệt hệ thống, kiểm tra quyền camera hoặc tiếp tục xem 3D.';
      if(event.detail.status==='not-presenting')updateAR();
    });
    mv.setAttribute('src',assetURL(scene.modelSrc));
    $('viewer-mount').replaceChildren(mv);
  } catch(error) {modelError(`Chưa tải được trình xem 3D. Hãy kiểm tra thư mục vendor hoặc tải lại trang. ${error.message}`);}
}

function switchMode(mode) {
  currentMode=mode;
  const is3d=mode==='3d';
  $('model-stage').hidden=!is3d;$('video-stage').hidden=is3d;
  $('tab-3d').classList.toggle('selected',is3d);$('tab-video').classList.toggle('selected',!is3d);
  $('tab-3d').setAttribute('aria-pressed',String(is3d));$('tab-video').setAttribute('aria-pressed',String(!is3d));
  document.querySelector('.viewer-controls').hidden=!is3d;
  if(is3d) {$('fallback-video').pause();if(!viewer)mountModel();else if(playing&&ready)viewer.play();}
  else {viewer?.pause();if(!$('fallback-video').hasAttribute('src'))$('fallback-video').src=assetURL(scene.videoSrc);}
  updateAR();
}

async function openShare() {
  const base=inferredPublicBase(config);
  const url=sceneURL(scene.id,base || undefined);
  $('share-url').value=url;$('share-message').textContent='';$('share-qr').replaceChildren();
  $('download-share').disabled=true;shareCanvas=null;
  $('share-dialog').showModal();
  if(!base) {$('share-message').textContent='Đây là bản xem thử trên máy. Hãy đăng GitHub Pages hoặc vào trang Tạo QR để điền URL HTTPS công khai trước khi in.';return;}
  try {shareCanvas=await renderQR($('share-qr'),url);$('download-share').disabled=false;$('share-message').textContent='In thử và quét bằng điện thoại bật 4G trước khi dùng cho cả lớp.';}
  catch(error){$('share-message').textContent=error.message;}
}

try {
  config=await loadConfig();
  const id=new URL(location.href).searchParams.get('id');
  scene=config.scenes.find(item=>item.id===id);
  if(!scene)throw new Error('Không tìm thấy mô hình. Hãy chọn một mô hình từ trang Khám phá.');
  document.title=`${scene.title} · Thế giới hạt`;
  if(scene.bookPage){const bookURL=new URL('index.html',assetURL('./'));bookURL.searchParams.set('page',scene.bookPage);$('back-book').href=bookURL.href;}
  $('scene-kicker').textContent=scene.kicker || 'QUAN SÁT MÔ HÌNH';$('scene-title').textContent=scene.title;
  $('scene-description').textContent=scene.description || '';$('motion-note').textContent=scene.motionNote || '';
  for(const text of scene.observations || []){const li=document.createElement('li');li.textContent=text;$('observations').append(li);}
  $('model-stage').classList.toggle('solid',scene.theme==='solid');
  $('model-file').href=assetURL(scene.modelSrc);
  const other=config.scenes.find(item=>item.id!==scene.id);
  if(other){$('other-model').href=sceneURL(other.id);$('other-model').textContent=`${other.shortTitle || other.title} →`;}
  if(scene.videoSrc){$('tab-video').hidden=false;if(scene.posterSrc)$('fallback-video').poster=assetURL(scene.posterSrc);}
  $('viewer-content').hidden=false;
  $('retry').addEventListener('click',()=>{if(!customElements.get('model-viewer'))location.reload();else mountModel();});
  $('reset-camera').addEventListener('click',()=>{if(!viewer)return;viewer.cameraOrbit='32deg 72deg auto';viewer.cameraTarget='auto auto auto';viewer.fieldOfView='32deg';viewer.jumpCameraToGoal();});
  $('rotate-toggle').addEventListener('click',()=>{if(!viewer)return;const rotate=!viewer.autoRotate;viewer.autoRotate=rotate;$('rotate-toggle').setAttribute('aria-pressed',String(rotate));});
  $('animation-toggle').addEventListener('click',()=>{if(!viewer||!ready)return;playing=!playing;if(playing)viewer.play();else viewer.pause();$('animation-toggle').textContent=playing?'Tạm dừng chuyển động':'Phát chuyển động';});
  $('activate-ar').addEventListener('click',()=>{
    if(!ready||!viewer?.canActivateAR)return;
    // Must call synchronously within the user's gesture for native AR launchers.
    viewer.activateAR().catch(()=>{$('ar-status').textContent='Chưa mở được AR. Hãy kiểm tra thiết bị, trình duyệt và quyền camera. Em vẫn có thể xem 3D.';});
  });
  $('tab-3d').addEventListener('click',()=>switchMode('3d'));
  $('tab-video').addEventListener('click',()=>switchMode('video'));
  $('fallback-video').addEventListener('error',()=>{$('video-error').hidden=false;});
  $('share').addEventListener('click',openShare);
  $('close-share').addEventListener('click',()=>$('share-dialog').close());
  $('share-dialog').addEventListener('click',event=>{if(event.target===$('share-dialog')){const r=$('share-dialog').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('share-dialog').close();}});
  $('copy-share').addEventListener('click',()=>copyURL($('share-url').value,$('share-url')));
  $('download-share').addEventListener('click',()=>{if(shareCanvas)saveQR(shareCanvas,`qr-${scene.id}.png`);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){viewer?.pause();$('fallback-video').pause();}else if(playing&&currentMode==='3d'&&ready)viewer?.play();});
  switchMode(scene.defaultView==='video'&&scene.videoSrc?'video':'3d');
} catch(error){showPageError(`${error.message} Mở trang chủ để chọn lại mô hình. Nếu đang mở bằng file trên máy, hãy chạy HTTP server theo README.`);}
