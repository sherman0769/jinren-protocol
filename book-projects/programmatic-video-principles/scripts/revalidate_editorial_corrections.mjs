import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {applyFileChanges,sha256,readOptional,safePath} from '../../../scripts/lib/book-write-safety.mjs';

// One-book, reviewed orthographic revision. Never admits arbitrary substitutions.
const root=fileURLToPath(new URL('../../../',import.meta.url));
const project='book-projects/programmatic-video-principles';
const folder='book-txt/程式如何變成影片';
const fixes=[
  {number:5,before:'秒錶示',after:'秒表示',reason:'秒作單位；更正誤轉為秒錶的字形'},
  {number:8,before:'擴充套件成',after:'擴展成',reason:'更正擴展動詞，不指軟體擴充套件'},
  {number:14,before:'変更',after:'變更',reason:'日文字形更正為繁體中文'},
  {number:18,before:'発音與聲音身份透過驗收',after:'發音與聲音身分通過驗收',reason:'日文字形及臺灣常用詞校正'},
];
const planned=new Map();
const changes=[];
function set(relative,after){
  const target=safePath(root,relative),before=readOptional(target);
  const bytes=Buffer.isBuffer(after)?after:Buffer.from(after);
  if(before?.equals(bytes))return;
  planned.set(relative,bytes);changes.push({path:target,before,after:bytes});
}
function json(relative){return JSON.parse(fs.readFileSync(safePath(root,relative),'utf8'));}
function text(relative){return fs.readFileSync(safePath(root,relative),'utf8');}
function correct(value,fix){
  if(value.split(fix.before).length!==2)throw Error(`Expected one reviewed correction: ${fix.number}`);
  const result=value.replace(fix.before,fix.after);
  if(JSON.stringify(value.match(/[0-9]+/g))!==JSON.stringify(result.match(/[0-9]+/g)))throw Error('Numerical content changed');
  return result;
}
const catalog=json('src/content/books.json'), original=structuredClone(catalog);
const book=catalog.books.find(b=>b.slug==='how-code-becomes-film');
const ledger=json(`${folder}/notebooklm-audio-ledger.json`);
const manifest=json(`${folder}/.book-txt-manifest.json`);
const publication=json(`${project}/qa/publication-manifest.json`);
const production=json(`${project}/qa/production-audio-validation.json`);
if(book.chapters.length!==24||production.status!=='passed'||!production.productionRemoteSeekChecked)throw Error('Existing release/media proof incomplete');
if(ledger.editorialRevalidation)throw Error('Revision already applied; inspect existing audit');
let full=text(`${project}/MANUSCRIPT/full_book.md`);
const audit=[];
for(const fix of fixes){
  const chapter=book.chapters.find(c=>c.number===fix.number);
  const previous=original.books.find(b=>b.slug===book.slug).chapters.find(c=>c.number===fix.number);
  const entry=ledger.entries.find(e=>e.chapterNumber===fix.number);
  const download=ledger.downloadValidation.chapters.find(e=>e.chapterNumber===fix.number);
  const numbered=String(fix.number).padStart(2,'0');
  const source=`${project}/MANUSCRIPT/chapters/chapter_${numbered}_main.md`;
  const reader=`${project}/publication/chapters/chapter_${numbered}/chapter_${numbered}_main.md`;
  const txt=`${folder}/${entry.sourceFilename}`;
  const beforeTxt=fs.readFileSync(safePath(root,txt));
  const owned=manifest.files.find(f=>f.filename===entry.sourceFilename);
  if(sha256(beforeTxt)!==owned.sha256||owned.sha256!==entry.sourceSha256||entry.promptSourceVerified!==true||download.fullDecode!==true||download.audioSrc!==chapter.audio.src)throw Error('Source/audio identity proof mismatch');
  const paragraphIndex=chapter.paragraphs.findIndex(p=>p.includes(fix.before));
  if(paragraphIndex<0||chapter.paragraphs.filter(p=>p.includes(fix.before)).length!==1)throw Error('Ambiguous reader correction');
  chapter.paragraphs[paragraphIndex]=correct(chapter.paragraphs[paragraphIndex],fix);
  const afterTxt=Buffer.from(`${[chapter.title,...chapter.paragraphs.map(t=>t.trim())].join('\n\n')}\n`);
  if(!afterTxt.equals(Buffer.from(correct(beforeTxt.toString('utf8'),fix))))throw Error('TXT differs beyond reviewed correction');
  const snapshot=`${folder}/notebooklm-source-snapshots/v1/${entry.sourceFilename}`;
  if(readOptional(safePath(root,snapshot))!==null)throw Error('Snapshot already exists');
  set(snapshot,beforeTxt);set(txt,afterTxt);owned.sha256=sha256(afterTxt);
  entry.sourcePath=snapshot;
  entry.readerSource={path:txt,sha256:sha256(afterTxt),bytes:afterTxt.length,revision:'orthographic-v2'};
  // Preserve actual uploaded source SHA, prompt/card identities and all audio metadata.
  const sourceAfter=correct(text(source),fix),readerAfter=correct(text(reader),fix);
  set(source,sourceAfter);set(reader,readerAfter);full=correct(full,fix);
  const pub=publication.chapters.find(c=>c.number===fix.number);
  pub.sourceSha256=sha256(Buffer.from(sourceAfter));pub.readerSha256=sha256(Buffer.from(readerAfter));
  pub.chineseCharacters=(sourceAfter.match(/[\u3400-\u9fff]/g)||[]).length;
  if(JSON.stringify(chapter.audio)!==JSON.stringify(previous.audio)||chapter.id!==previous.id||chapter.title!==previous.title||chapter.paragraphs.length!==previous.paragraphs.length)throw Error('Chapter/audio identity changed');
  audit.push({...fix,paragraphIndex,uploadedSourceSha256:entry.sourceSha256,readerSourceSha256:entry.readerSource.sha256,uploadedSourceSnapshot:snapshot,audioSrc:chapter.audio.src,audioSha256:download.sha256,audioDisposition:'retain-existing-verified-podcast',semanticReview:'Orthography only; same concept, chapter, order, numerical statements and examples. Podcast is an explanatory overview of the preserved v1 upload, not a verbatim reading of revised typography.',mediaValidation:'production HEAD exact length and 120s remote decode passed'});
}
for(const before of original.books.filter(b=>b.slug!==book.slug))if(JSON.stringify(before)!==JSON.stringify(catalog.books.find(b=>b.slug===before.slug)))throw Error('Unrelated book changed');
for(const [i,c] of book.chapters.entries())if(JSON.stringify(c.audio)!==JSON.stringify(original.books.find(b=>b.slug===book.slug).chapters[i].audio))throw Error('Audio remapped');
publication.chineseCharacters=publication.chapters.reduce((s,c)=>s+c.chineseCharacters,0);
ledger.editorialRevalidation={status:'passed-with-preserved-audio-source',readerRevision:'orthographic-v2',audioSourceRevision:'uploaded-v1',regeneratedAudio:false,chapterNumbers:fixes.map(f=>f.number),reviewer:'model editorial comparison; not human listening acceptance',changes:audit,checkedAt:new Date().toISOString()};
set(`${project}/MANUSCRIPT/full_book.md`,full);
set('src/content/books.json',JSON.stringify(catalog,null,2)+'\n');
set(`${folder}/.book-txt-manifest.json`,JSON.stringify(manifest,null,2)+'\n');
set(`${folder}/notebooklm-audio-ledger.json`,JSON.stringify(ledger,null,2)+'\n');
set(`${project}/qa/publication-manifest.json`,JSON.stringify(publication,null,2)+'\n');
set(`${project}/qa/editorial-source-audio-revalidation.json`,JSON.stringify(ledger.editorialRevalidation,null,2)+'\n');
const result={dryRun:!process.argv.includes('--apply'),corrections:audit.map(({number,before,after,reason})=>({number,before,after,reason})),all24AudioObjectsUnchanged:true,other23BooksUnchanged:true,changedFiles:changes.length};
if(process.argv.includes('--apply')){
  // Rebuild only corrected entries in the companion ZIP under tmp, then include
  // the archive in the same guarded transaction as manuscript/TXT/catalog.
  const replacements=Object.fromEntries([...planned].filter(([p])=>p.startsWith(project+'/MANUSCRIPT/')).map(([p,b])=>[p.slice(project.length+1),b.toString('base64')]));
  const temporary=safePath(root,'tmp/programmatic-companion-editorial-v2.zip');
  const companion=safePath(root,'public/books/how-code-becomes-film/companion.zip');
  execFileSync('C:/Users/User/anaconda3/python.exe',['-c',`import sys,json,zipfile,base64
d=json.load(sys.stdin.buffer)
with zipfile.ZipFile(d['source']) as src,zipfile.ZipFile(d['output'],'w') as dst:
 for item in src.infolist():
  data=base64.b64decode(d['replacements'][item.filename]) if item.filename in d['replacements'] else src.read(item.filename)
  if item.filename=='qa/publication-manifest.json':data=d['publication'].encode('utf-8')
  dst.writestr(item,data)
`,],{input:JSON.stringify({source:companion,output:temporary,replacements,publication:JSON.stringify(publication,null,2)}),stdio:['pipe','pipe','pipe']});
  set('public/books/how-code-becomes-film/companion.zip',fs.readFileSync(temporary));
  result.backupFolder=applyFileChanges(root,changes);
}
console.log(JSON.stringify(result,null,2));
