const {chromium}=require('playwright');
(async()=>{
const w=+process.argv[2]||390,h=+process.argv[3]||844,prefix=process.argv[4]||'s';
const steps=(process.argv[5]||'entry,0,1,2,3,sec0,sec1,sec2').split(',');
const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist','--enable-webgl']});
const p=await b.newPage({viewport:{width:w,height:h},deviceScaleFactor:1.5,hasTouch:w<800});
p.on('console',m=>{if(m.type()==='error'&&!/TUNNEL|Failed to load resource/.test(m.text()))console.log('ERR',m.text().slice(0,300))});
p.on('pageerror',e=>console.log('pageerror',e.message.slice(0,400)));
await p.goto('http://127.0.0.1:4173/pritiado/',{waitUntil:'load'});
await p.waitForTimeout(3500);
const shot=async(n)=>{await p.screenshot({path:`${prefix}-${n}.png`,timeout:170000});};
let entered=false;
for(const s of steps){
 if(s!=='entry'&&!entered){await p.click('text=Entrar sin sonido');await p.waitForTimeout(2500);entered=true;}
 if(s==='entry')entered=true;
 if(s==='entry'){await shot('entry');await p.click('text=Entrar sin sonido');await p.waitForTimeout(2500);}
 else if(/^\d$/.test(s)){
   const cur=await p.evaluate(()=>+(document.querySelector('.count span')?.textContent||'01').slice(0,2))-1;
   for(let i=cur;i<+s;i++){await p.keyboard.press('ArrowRight');await p.waitForTimeout(300);}
   await p.waitForTimeout(3500);await shot('st'+s);}
 else if(s.startsWith('sec')){
   const i=+s.slice(3);
   await p.evaluate((i)=>{const sc=document.querySelector('.scroller');const el=document.querySelector(`[data-sec="${i}"]`);sc.scrollTo({top:sc.scrollTop+el.getBoundingClientRect().top-sc.clientHeight*0.38});},i);
   await p.waitForTimeout(4500);await shot(s);}
}
await b.close();})();
