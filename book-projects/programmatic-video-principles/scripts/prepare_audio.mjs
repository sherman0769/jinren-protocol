import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const project=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const repo=path.resolve(project,'../..');
const slug='how-code-becomes-film';
const catalogPath=path.join(repo,'src/content/books.json');
const catalog=JSON.parse(fs.readFileSync(catalogPath,'utf8'));
const before=JSON.parse(fs.readFileSync(path.join(repo,'tmp/programmatic-video-catalog-before.json'),'utf8'));
for(const original of before.books){
  const current=catalog.books.find(b=>b.slug===original.slug);
  if(JSON.stringify(current)!==JSON.stringify(original)) throw new Error('其他書籍改變：'+original.slug);
}
for(const [key,value] of Object.entries(before))if(key!=='books'&&JSON.stringify(value)!==JSON.stringify(catalog[key]))throw new Error('頂層資料改變');
const book=catalog.books.find(b=>b.slug===slug);
const manifest=JSON.parse(fs.readFileSync(path.join(project,'qa/publication-manifest.json'),'utf8'));
book.companionUrl=`/books/${slug}/companion.zip`;
book.chapters.forEach((chapter,i)=>{const m=manifest.chapters[i];chapter.figure={src:m.figure,alt:m.figureAlt};if(!fs.existsSync(path.join(repo,'public',m.figure)))throw new Error('圖檔遺失');});
fs.writeFileSync(catalogPath,JSON.stringify(catalog,null,2)+'\n');
const folder=path.join(repo,'book-txt',book.title);
const files=fs.readdirSync(folder).filter(f=>/^\d{2}_.+\.txt$/.test(f)).sort();
if(files.length!==24)throw new Error('TXT數量錯誤');
const entries=files.map((filename,i)=>{
 const data=fs.readFileSync(path.join(folder,filename));
 const chapter=book.chapters[i];
 const expected=[chapter.title,...chapter.paragraphs.map(t=>t.trim())].join('\n\n')+'\n';
 if(!filename.startsWith(String(i+1).padStart(2,'0')+'_')||data.length===0||data.toString()!==expected)throw new Error('TXT身份錯誤：'+filename);
 return {chapterNumber:i+1,sourcePath:path.relative(repo,path.join(folder,filename)).replaceAll('\\','/'),sourceFilename:filename,sourceSha256:createHash('sha256').update(data).digest('hex'),sourceBytes:data.length,promptMarker:'章節標誌：'+filename.slice(0,-4),expectedAudioTitle:filename.slice(0,-4),selectedSourceCount:0,generationStatus:'not-started',promptSourceVerified:false,finalAudioCardTitle:null,completedAt:null};
});
const ledgerPath=path.join(folder,'notebooklm-audio-ledger.json');
if(fs.existsSync(ledgerPath))throw new Error('保留既有音訊ledger，不覆寫');
const ledger={bookTitle:book.title,slug,notebookTitle:book.title+'｜章節音頻',notebookUrl:null,expectedChapterCount:24,createdAt:new Date().toISOString(),authorization:'2026-10-05 使用者要求執行交接包直到電子書平台上架；依母專案規則包含NotebookLM章節音訊、下載、Blob與production',status:'prepared',generationFormat:'深入探索',language:'中文（繁體）',preflight:{count:24,contiguous:true,nonempty:true,txtMatchesBooksJson:true,existing23BooksUnchanged:true},entries,uploadTransaction:{id:'programmatic-video-txt24-20261005',status:'pre-mutation',preExistingSourceCount:null,sourceFiles:entries.map(c=>({file:c.sourceFilename,sha256:c.sourceSha256,bytes:c.sourceBytes}))},downloadValidation:{status:'partial',expectedChapterCount:24,downloadedCount:0,linkedCount:0,missingChapterNumbers:entries.map(c=>c.chapterNumber),assetFolder:'public/books/'+slug+'/audio'}};
fs.writeFileSync(ledgerPath,JSON.stringify(ledger,null,2)+'\n');
fs.writeFileSync(path.join(project,'qa/txt-preflight.json'),JSON.stringify({status:'passed',...ledger.preflight,files:entries.map(c=>({file:c.sourceFilename,bytes:c.sourceBytes,sha256:c.sourceSha256}))},null,2)+'\n');
console.log(JSON.stringify({status:'passed',sources:files.length,ledgerPath,otherBooksPreserved:23}));
