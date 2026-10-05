"""六十秒四幕教學遷移基準；不是原片或讀者自選畢業作品。"""
import argparse,json,math,shutil,struct,subprocess,wave
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
from render_demo import find_font
from motion_core import frame_time,circle_x,quadratic,Point,particle_state
W,H,FPS,SECONDS=1280,720,30,60

def main():
    ap=argparse.ArgumentParser(description=__doc__);ap.add_argument('--output',type=Path,default=Path(__file__).resolve().parent/'output/transfer_demo.mp4');ap.add_argument('--font')
    args=ap.parse_args(); out=args.output.resolve();out.parent.mkdir(parents=True,exist_ok=True)
    if out.exists(): raise RuntimeError('保留既有輸出，請選一個新檔名')
    ffmpeg=shutil.which('ffmpeg')
    if not ffmpeg:raise RuntimeError('需要既有FFmpeg')
    font=find_font(args.font); large=ImageFont.truetype(str(font),40);small=ImageFont.truetype(str(font),24)
    titles=['時間決定位置','參數進度不等於路程','每顆點都有目標','資料決定幾何']
    captions=['半秒：等速250，緩動193.75','控制點是牽引，不一定在曲線上','自繪井形，固定身份與起點','教學假資料10、20、30；零到40映射200像素']
    cue=out.with_suffix('.wav')
    with wave.open(str(cue),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(48000)
        for sec in range(SECONDS):
            samples=[]
            for n in range(48000):
                local=n/48000
                value=.03*math.sin(2*math.pi*440*local)*math.sin(math.pi*local/.2)**2 if sec%15==0 and local<.2 else 0
                samples.append(struct.pack('<h',round(32767*value)))
            w.writeframes(b''.join(samples))
    log=out.with_suffix('.ffmpeg.log')
    command=[ffmpeg,'-hide_banner','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','pipe:0','-i',str(cue),'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','fast','-crf','22','-threads','2','-pix_fmt','yuv420p','-c:a','aac','-b:a','80k','-t','60','-movflags','+faststart',str(out)]
    with log.open('w',encoding='utf-8') as stderr:
        proc=subprocess.Popen(command,stdin=subprocess.PIPE,stdout=subprocess.DEVNULL,stderr=stderr)
        try:
            for frame in range(1800):
                t=frame_time(frame,FPS); scene=min(int(t//15),3);local=t-scene*15;u=min(local/5,1)
                im=Image.new('RGB',(W,H),(247,245,239));d=ImageDraw.Draw(im)
                d.text((70,40),'程式如何變成影片｜六十秒教學重建',font=small,fill='#60717a')
                d.text((70,100),titles[scene],font=large,fill='#172b3a')
                if scene==0:
                    for eased,y in [(False,300),(True,440)]:
                        x=230+(circle_x(local)-100)/600*800 if not eased else 230+(circle_x(local,eased=True)-100)/600*800
                        d.line((230,y,1030,y),fill='#bdccc5',width=3);d.ellipse((x-18,y-18,x+18,y+18),fill='#0b746b')
                elif scene==1:
                    points=[quadratic(Point(250,450),Point(640,160),Point(1030,450),i/200) for i in range(int(u*200)+1)]
                    if len(points)>1:d.line([(p.x,p.y) for p in points],fill='#0b746b',width=5)
                    for x,y in [(250,450),(640,160),(1030,450)]:d.ellipse((x-5,y-5,x+5,y+5),fill='#172b3a')
                elif scene==2:
                    for p in particle_state(local,duration=5):
                        x=160+p.x*1.1;y=150+p.y;d.ellipse((x-3,y-3,x+3,y+3),fill='#0b746b')
                else:
                    d.line((250,470,1000,470),fill='#172b3a',width=3)
                    for i,value in enumerate((10,20,30)):
                        x=340+i*220;h=200*value/40*u
                        d.rectangle((x,470-h,x+90,470),fill='#0b746b');d.text((x,500),str(value),font=small,fill='#172b3a')
                d.text((70,585),captions[scene],font=small,fill='#172b3a')
                d.text((70,650),f'第{scene+1}幕｜全片{t:.2f}秒｜本幕{local:.2f}秒｜無正式旁白',font=small,fill='#60717a')
                if frame in (15,450,465,900,975,1350,1425,1799):im.save(out.with_name(f'transfer_frame_{frame:04d}.png'))
                proc.stdin.write(im.tobytes())
            proc.stdin.close(); code=proc.wait(timeout=90)
        except BaseException:
            proc.kill();proc.wait();raise
    if code:raise RuntimeError(f'編碼失敗，讀取{log}')
    out.with_suffix('.json').write_text(json.dumps({'kind':'teaching_transfer_baseline','frames':1800,'fps':30,'durationSeconds':60,'scenes':4,'audio':'quiet original cue; no narration','bytes':out.stat().st_size},ensure_ascii=False,indent=2),encoding='utf-8')
    print(out)

if __name__=='__main__':main()
