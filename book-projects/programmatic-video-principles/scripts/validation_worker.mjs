import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createValidatedDownloadStore} from '../../../scripts/resume-notebooklm-audio.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const dir=path.join(root,'tmp','programmatic-audio-validation');
const ledger=path.join(root,'book-txt','程式如何變成影片','notebooklm-audio-ledger.json');
const store=createValidatedDownloadStore({slug:'how-code-becomes-film',projectRoot:root});
const processed=new Set();
await fs.mkdir(dir,{recursive:true});
console.log('Local media validation worker ready');
while(true){
  const files=await fs.readdir(dir);
  if(files.includes('STOP'))break;
  for(const file of files.filter(f=>/^request-[a-f0-9-]+\.json$/.test(f)&&!processed.has(f))){
    processed.add(file);
    const id=file.slice(8,-5);
    const response=path.join(dir,`response-${id}.json`);
    try{
      const context=JSON.parse(await fs.readFile(path.join(dir,file),'utf8'));
      if(path.resolve(context.ledgerPath)!==path.resolve(ledger))throw Error('Ledger identity mismatch');
      if(!path.resolve(context.download.newPath).startsWith(path.resolve('C:/Users/User/Downloads')+path.sep))throw Error('Download outside authorized directory');
      const result=await store(context);
      await fs.writeFile(response,JSON.stringify({status:'validated',...result}));
      console.log(`Chapter ${context.chapter.chapterNumber}: full media validation passed`);
    }catch(error){
      await fs.writeFile(response,JSON.stringify({status:'failed',error:error.message}));
      console.error(error.message);
    }
  }
  await new Promise(resolve=>setTimeout(resolve,250));
}
console.log('Worker stopped');
