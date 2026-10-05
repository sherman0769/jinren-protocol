"""以標準函式庫重建六張 SVG。執行：python examples/build_examples.py"""
from pathlib import Path
import math, json, html
from motion_core import Point, quadratic, circle_x, particle_state, project
ROOT=Path(__file__).resolve().parent
OUT=ROOT/'output'
INK='#172b3a'; ACCENT='#0b746b'; MUTED='#60717a'; PAPER='#f7f5ef'
def text(x,y,s,size=22,color=INK):
    return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-family="Microsoft JhengHei,PingFang TC,Noto Sans CJK TC,sans-serif">{html.escape(str(s))}</text>'
def line(x1,y1,x2,y2,color=MUTED,width=2):
    return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{color}" stroke-width="{width}"/>'
def dot(x,y,r=8,color=ACCENT):
    return f'<circle cx="{x:.4f}" cy="{y:.4f}" r="{r}" fill="{color}"/>'
def write(name,title,body,desc):
    OUT.mkdir(exist_ok=True)
    content=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" role="img"><title>{html.escape(title)}</title><desc>{html.escape(desc)}</desc><rect width="960" height="540" fill="{PAPER}"/>'+text(48,63,title,30)+''.join(body)+text(48,506,'程式如何變成影片｜教學重建，不是原引擎摘錄',16,MUTED)+'</svg>'
    (OUT/name).write_text(content,encoding='utf-8')

def main():
    # 960×540 的邏輯畫布，以 0.55 倍縮放放入這張教學圖。
    ox,oy,scale=170,115,.55
    b=[f'<rect x="{ox}" y="{oy}" width="528" height="297" fill="white" stroke="{MUTED}"/>']
    for x in range(0,961,120):
        b.append(line(ox+x*scale,oy,ox+x*scale,oy+297,'#d6dcd9',1))
    for y in range(0,541,90):
        b.append(line(ox,oy+y*scale,ox+528,oy+y*scale,'#d6dcd9',1))
    cx,cy=ox+480*scale,oy+270*scale
    b += [dot(cx,cy,12),text(cx+18,cy-14,'圓心 (480,270)',22),
          text(ox-5,oy-14,'原點 (0,0)',18),text(ox+400,oy-14,'x 往右增加 →',18),
          text(ox+544,oy+65,'y 往下',18),text(ox+544,oy+93,'增加 ↓',18),
          text(ox+394,oy+324,'(960,540)',18),text(48,461,'以縮小的畫布示意；座標數字仍以原畫布像素為單位',21)]
    write('01_coordinate.svg','電腦怎麼知道白點在哪裡',b,'邏輯畫布為 960×540，原點在左上角，圓心是 480,270。為排版縮放至 0.55 倍並平移，格線只是讀圖輔助。')
    b=[]
    for t,y in [(0,135),(.5,215),(1,295),(2,375)]:
        x=circle_x(t)
        b += [line(150,y,750,y,'#c8d0ce'),dot(x+50,y,12),text(800,y+6,f'{t:g} 秒',20)]
    b += [text(48,438,'起點 100 → 終點 700；移動兩秒，之後停留一秒',22)]
    write('02_interpolation.svg','不是叫圓移動，而是算出現在的位置',b,'四個指定時點的圓心位置依次為 100、250、400、700。圖中為排版加了 50 像素位移。')
    b=[]
    for eased,y,label in [(False,185,'等速'),(True,315,'慢起步、慢停下')]:
        b+=[line(150,y,750,y),text(48,y-50,label,24)]
        for i in range(9):
            u=i/8;t=u*2;x=circle_x(t,eased=eased)+50
            b.append(dot(x,y,5 if i!=2 else 13,ACCENT if eased else INK))
    b += [text(48,408,'每個點相隔 0.25 秒；比較相同時間的位移',23),text(48,446,'四分之一時間：等速走 25%；本例緩動走 15.625%',21)]
    write('03_easing.svg','同樣兩秒、同樣終點，節奏可以不同',b,'九個等時間間隔的取樣位置。緩動兩端較密，中間較疏。')
    a=Point(140,390);c=Point(480,100);z=Point(800,390)
    b=[line(a.x,a.y,c.x,c.y,'#a8b5b2'),line(c.x,c.y,z.x,z.y,'#a8b5b2')]
    pts=[quadratic(a,c,z,i/80) for i in range(81)]
    b += [f'<polyline points="'+ ' '.join(f'{p.x},{p.y}' for p in pts)+f'" fill="none" stroke="{ACCENT}" stroke-width="5"/>']
    for p in [a,c,z]:b.append(dot(p.x,p.y,8))
    b += [text(493,111,'控制點不必在曲線上',21),text(140,438,'先有幾何，再決定顯示多少路徑',22)]
    write('04_path.svg','三個位置，決定一條彎曲的線',b,'二次貝茲曲線以兩端點和一個控制點決定。控制線是輔助，不是實際曲線。')
    b=[]
    for i,t in enumerate([0,1.5,3]):
        ox=35+i*300
        for p in particle_state(t):b.append(dot(ox+p.x*.34,150+p.y*.55,1.35))
        b.append(text(ox+90,429,f'{t:g} 秒',21))
    write('05_particles.svg','給每個小點安排一個目的地',b,'同一批粒子在零、一點五、三秒的狀態，最後形成自繪的井形幾何遮罩。不是通用字型取樣器。')
    angle=.65;verts=[]
    for x,y,z in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]:
        xr=x*math.cos(angle)+z*math.sin(angle);zr=-x*math.sin(angle)+z*math.cos(angle)
        p=project(xr,y,zr)
        verts.append(Point(470+p.x*420,255-p.y*420))
    b=[]
    for i,j in [(0,1),(1,2),(2,3),(3,0),(4,5),(5,6),(6,7),(7,4),(0,4),(1,5),(2,6),(3,7)]:
        a=verts[i];z=verts[j];b.append(line(a.x,a.y,z.x,z.y,ACCENT,3))
    b += [text(48,460,'三維座標 → 相機深度 → 二維畫面',23)]
    write('06_projection.svg','螢幕是平的，空間可以先是立體的',b,'旋轉線框立方體以透視投影轉成二維。這個最小示範不做隱面消除或材質照明。')
    manifest={'generated_by':'examples/build_examples.py','kind':'teaching_reconstruction','svg_files':sorted(p.name for p in OUT.glob('*.svg'))}
    (OUT/'examples_index.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(f'已產生 {len(manifest["svg_files"])} 張 SVG：{OUT}')
if __name__=='__main__':main()
