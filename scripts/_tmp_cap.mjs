import puppeteer from 'puppeteer-core';
import { readdirSync } from 'node:fs';
const base='/home/user/Roiducarton/chrome/'; const dir=readdirSync(base).find(d=>d.startsWith('linux-'));
const CHROME=`${base}${dir}/chrome-linux64/chrome`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function click(page,t){const h=await page.evaluateHandle((t)=>{const e=[...document.querySelectorAll('button, .cursor-pointer')];return e.find(x=>x.textContent&&x.textContent.includes(t))||null;},t);const el=h.asElement();if(!el)return false;await el.click();return true;}
async function has(page,t){return await page.evaluate((t)=>document.body.innerText.includes(t),t);}
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars']});
const p=await b.newPage();
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true});
await p.goto('http://localhost:4173/',{waitUntil:'networkidle2'}); await sleep(900);
await click(p,'Nouvelle Partie'); await sleep(800);
await p.click('.cursor-pointer'); await sleep(800);
for(let i=0;i<15;i++){
  if(await has(p,'Fin de l\'Aventure')) break;
  await click(p,'Jour Suivant'); await sleep(500);
  // fermer un éventuel overlay de résultat
  await click(p,'Continuer'); await sleep(200);
}
await sleep(1600); // laisser les animations + éviter la pub interstitielle (no-op web)
await p.screenshot({path:'/tmp/14-gameover.png', fullPage:true});
console.log('gameover?', await has(p,'Fin de l\'Aventure'));
await b.close(); console.log('OK');
