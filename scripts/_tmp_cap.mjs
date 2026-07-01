import puppeteer from 'puppeteer-core';
import { readdirSync } from 'node:fs';
const base='/home/user/Roiducarton/chrome/'; const dir=readdirSync(base).find(d=>d.startsWith('linux-'));
const CHROME=`${base}${dir}/chrome-linux64/chrome`;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function click(page,t){const h=await page.evaluateHandle((t)=>{const e=[...document.querySelectorAll('button')];return e.find(x=>x.textContent&&x.textContent.includes(t))||null;},t);const el=h.asElement();if(!el)throw new Error('no '+t);await el.click();}
const b=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--hide-scrollbars']});
const p=await b.newPage();
await p.setViewport({width:390,height:844,deviceScaleFactor:2,isMobile:true});
await p.goto('http://localhost:4173/',{waitUntil:'networkidle2'}); await sleep(900);
await click(p,'Nouvelle Partie'); await sleep(800);
await p.click('.cursor-pointer'); await sleep(800);
await click(p,'Sac'); await sleep(900); await p.screenshot({path:'/tmp/11-inv.png'});
await b.close(); console.log('OK');
