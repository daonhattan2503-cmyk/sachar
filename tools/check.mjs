import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {publicBase,sceneURL} from '../js/common.js';

const site=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const config=JSON.parse(fs.readFileSync(path.join(site,'data/scenes.json'),'utf8'));
const book=JSON.parse(fs.readFileSync(path.join(site,'data/book.json'),'utf8'));
assert.equal(book.pages.length,20);
assert.equal(config.scenes.length,10);
assert.equal(config.scenes.find(s=>s.id==='the-ran').bookPage,5);
assert.equal(config.scenes.find(s=>s.id==='the-khi').bookPage,7);
assert.equal(config.scenes.find(s=>s.id==='lam-muoi-tu-nuoc-bien').bookPage,16);
assert.equal(config.scenes.find(s=>s.id==='lam-nen').bookPage,17);
assert.ok(!JSON.stringify(book).includes('https://khtn6.edu.vn/'));
for(const file of ['data/book.json','js/book.js','css/book.css','css/book-utilities.css','vendor/page-flip-2.0.7.js','models.html'])assert.ok(fs.existsSync(path.join(site,file)),file);
assert.deepEqual(config.scenes.map(s=>s.id).sort(),['bay-hoi','dong-dac','lam-muoi-tu-nuoc-bien','lam-nen','nong-chay','su-soi','suong-mu','the-khi','the-long','the-ran']);
assert.equal(publicBase('https://example.com/hat-ar'),'https://example.com/hat-ar/');
assert.equal(sceneURL('the-khi',publicBase('https://example.com/class/book/')),'https://example.com/class/book/viewer.html?id=the-khi');
for(const value of ['file:///C:/web/','http://example.com/','https://localhost:8123/','https://127.0.0.1/','https://10.1.1.1/','https://192.168.1.7/','https://172.31.2.2/','https://[::1]/','https://github.com/user/repo','https://example.com/viewer.html','https://user:password@example.com/']) {
  assert.throws(()=>publicBase(value),undefined,`Must reject ${value}`);
}
function readGLB(file) {
  const b=fs.readFileSync(file);assert.equal(b.toString('ascii',0,4),'glTF');assert.equal(b.readUInt32LE(4),2);assert.equal(b.readUInt32LE(8),b.length);
  const n=b.readUInt32LE(12);const json=JSON.parse(b.toString('utf8',20,20+n));
  return {json,binary:b.subarray(20+n),bytes:b.length};
}
const sourceNames={
  'the-ran':'ran.glb','the-long':'long.glb','the-khi':'khi.glb','nong-chay':'nong_chay.glb','dong-dac':'dong_dac.glb',
  'bay-hoi':'bay_hoi.glb','suong-mu':'suong_mu.glb','su-soi':'su_soi.glb','lam-muoi-tu-nuoc-bien':'lam_muoi_tu_nuoc_bien.glb','lam-nen':'lam_nen.glb'
};
for(const scene of config.scenes) {
  const model=readGLB(path.join(site,scene.modelSrc));assert.ok(model.bytes>0);
  assert.ok(model.json.nodes.some(n=>n.name==='WebAR_Tabletop_24cm'));
  for(const source of [scene.videoSrc,scene.posterSrc,scene.iosSrc])if(source&&!source.startsWith('https:'))assert.ok(fs.existsSync(path.join(site,source)));
  const originalPath=path.join(site,'..','3D',sourceNames[scene.id]);
  assert.ok(model.binary.equals(readGLB(originalPath).binary),'Original geometry/animation binary must remain intact');
  const animations=model.json.animations||[];
  assert.equal(animations.length,scene.hasAnimation?1:0);
  if(scene.hasAnimation) {
    const animation=animations[0];
    if(scene.animationName)assert.equal(animation.name,scene.animationName);
    const targets=new Set(animation.channels.map(c=>`${c.target.node}/${c.target.path}`));
    assert.equal(targets.size,animation.channels.length);
    for(const channel of animation.channels)assert.ok(animation.samplers[channel.sampler]);
  }
}
for(const file of ['index.html','viewer.html','qr.html','huong-dan.html','css/site.css','js/common.js','js/home.js','js/viewer.js','js/qr.js','vendor/model-viewer-4.4.0.min.js','vendor/qrcode-1.0.0.min.js'])assert.ok(fs.existsSync(path.join(site,file)),file);
console.log('PASS: assets, GLB headers, binary preservation, animation merge, public QR URLs and project subpaths.');
