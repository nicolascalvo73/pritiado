const {chromium}=require('playwright');
(async()=>{
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
const out=process.argv[2]||'shot.png';
const w=+process.argv[3]||390,h=+process.argv[4]||844;
const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:2,hasTouch:w<800});
p.on('console',m=>{if(['error','warning'].includes(m.type()))console.log(m.type(),m.text().slice(0,300))});
p.on('pageerror',e=>console.log('pageerror',e.message.slice(0,300)));
await p.goto('http://127.0.0.1:4173/pritiado/',{waitUntil:'load'});
await p.waitForTimeout(6000);
await p.screenshot({path:out,timeout:150000});
await b.close();})();
