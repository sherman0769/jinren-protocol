import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createValidatedDownloadStore} from '../../../scripts/resume-notebooklm-audio.mjs';

const root=fileURLToPath(new URL('../../../',import.meta.url));
const context=JSON.parse(await fs.readFile(process.argv[2],'utf8'));
const expectedLedger=path.join(root,'book-txt','程式如何變成影片','notebooklm-audio-ledger.json');
if(path.resolve(context.ledgerPath)!==path.resolve(expectedLedger))throw Error('Ledger identity mismatch');
const store=createValidatedDownloadStore({slug:'how-code-becomes-film',projectRoot:root});
const result=await store(context);
console.log(JSON.stringify({status:'validated',chapter:result.chapterNumber,...result.validation}));
