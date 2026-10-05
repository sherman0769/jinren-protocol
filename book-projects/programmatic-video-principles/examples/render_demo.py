"""八秒最小影音鏈路示範：Pillow 畫影格，FFmpeg 編碼／封裝。不呼叫任何 API。"""
from __future__ import annotations
import argparse, json, math, os, shutil, struct, subprocess, sys, wave
from pathlib import Path
try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    raise SystemExit('缺少 Pillow；請先執行 python -m pip install -r requirements-demo.txt') from exc
from motion_core import circle_x, particle_state, frame_time, progress, glyph_targets
W,H,FPS,SECONDS=1280,720,30,8
PAPER=(247,245,239); INK=(23,43,58); ACCENT=(11,116,107); MUTED=(96,113,122)

def find_font(requested: str | None) -> Path:
    names=[requested,os.environ.get('BOOK_DEMO_FONT'),r'C:\Windows\Fonts\msjh.ttc',
           '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
           '/System/Library/Fonts/PingFang.ttc']
    for name in names:
        if name and Path(name).is_file():return Path(name)
    raise RuntimeError('未找到可用中文字型；請用 --font 或 BOOK_DEMO_FONT 指向本機合法字型檔。本包不附字型。')

def make_cue(path: Path) -> None:
    # 單聲道 48 kHz，兩次短提示音，沒有旁白或受版權保護配樂。
    rate=48000;buf=bytearray()
    for n in range(SECONDS*rate):
        t=n/rate;value=0.0
        for start in (0.35,4.35):
            local=t-start
            if 0<=local<.18:
                value+=.12*math.sin(math.pi*local/.18)**2*math.sin(2*math.pi*660*local)*math.exp(-local*9)
        buf.extend(struct.pack('<h',int(max(-1,min(1,value))*32767)))
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(rate);w.writeframes(buf)

def draw_frame(frame: int, fonts: dict) -> Image.Image:
    t=frame_time(frame,FPS);im=Image.new('RGB',(W,H),PAPER);d=ImageDraw.Draw(im)
    d.text((80,48),'程式如何變成影片',font=fonts[24],fill=MUTED)
    if t<4:
        d.text((80,102),'同樣距離　同樣兩秒　不同節奏',font=fonts[40],fill=INK)
        local=max(0,t-.35)
        for eased,y,label in [(False,300,'等速'),(True,455,'慢起步　慢停下')]:
            d.text((80,y-48),label,font=fonts[26],fill=INK)
            d.line((290,y,1110,y),fill=(194,204,199),width=3)
            x=290+(circle_x(local,eased=eased)-100)/600*820
            d.ellipse((x-18,y-18,x+18,y+18),fill=ACCENT if eased else INK)
        d.text((80,565),f'移動時間 {min(local,2):.2f} 秒　｜　到達後保持終點',font=fonts[26],fill=MUTED)
    else:
        local=t-4
        d.text((80,102),'不是小點懂得排字　是每顆都有目標',font=fonts[40],fill=INK)
        for p in particle_state(local,start=.35,duration=3):
            x=150+p.x*1.2;y=174+p.y*1.02
            d.ellipse((x-2.9,y-2.9,x+2.9,y+2.9),fill=ACCENT)
        d.text((80,602),f'{len(glyph_targets())} 個取樣點　｜　自繪「井」形遮罩　｜　同時點可重算',font=fonts[24],fill=MUTED)
    d.line((80,659,1200,659),fill=(208,216,211),width=2)
    d.text((80,678),'原創教學重建　沒有語音服務　沒有 GPU　不是原片引擎摘錄',font=fonts[20],fill=MUTED)
    return im

def main():
    ap=argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--output',type=Path,default=Path(__file__).resolve().parent/'output/principles_demo.mp4')
    ap.add_argument('--font');args=ap.parse_args()
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise SystemExit('找不到 FFmpeg。請安裝並確認 ffmpeg -version 可執行；本程式不會自動下載。')
    font=find_font(args.font);fonts={s:ImageFont.truetype(str(font),s) for s in (20,24,26,40)}
    out=args.output.resolve();out.parent.mkdir(parents=True,exist_ok=True)
    cue=out.with_name('demo_cue.wav');make_cue(cue)
    log=out.with_suffix('.ffmpeg.log')
    cmd=[ffmpeg,'-hide_banner','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}',
         '-r',str(FPS),'-i','pipe:0','-i',str(cue),'-map','0:v:0','-map','1:a:0',
         '-c:v','libx264','-pix_fmt','yuv420p','-r',str(FPS),'-crf','22','-preset','fast','-threads','2',
         '-c:a','aac','-b:a','128k','-t',str(SECONDS),'-movflags','+faststart',str(out)]
    with log.open('w',encoding='utf-8') as err:
        proc=subprocess.Popen(cmd,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=err)
        try:
            for frame in range(FPS*SECONDS):proc.stdin.write(draw_frame(frame,fonts).tobytes())
            proc.stdin.close()
            code=proc.wait(timeout=90)
        except BaseException:
            proc.kill();proc.wait();raise
    if code:raise RuntimeError(f'FFmpeg 失敗，詳見 {log}')
    if not out.is_file() or out.stat().st_size==0:raise RuntimeError('影片未成功產生')
    draw_frame(30,fonts).save(out.with_name('demo_still.png'))
    data={'kind':'teaching_demo_not_case_film','frames':FPS*SECONDS,'fps':FPS,'duration_seconds':SECONDS,
          'width':W,'height':H,'audio':'original synthesized cue only; no TTS','uses_gpu':False,
          'font_bundled':False,'particle_count':len(glyph_targets()),'output':out.name,'bytes':out.stat().st_size}
    out.with_suffix('.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(data,ensure_ascii=False))
if __name__=='__main__':
    try:main()
    except Exception as e:print(f'錯誤：{e}',file=sys.stderr);sys.exit(1)
