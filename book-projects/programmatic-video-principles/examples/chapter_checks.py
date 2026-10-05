"""逐章數值實驗；教學重建，標準函式庫，非原案測試。"""
import argparse, json, math, random, struct, wave
from pathlib import Path
from motion_core import (Point, frame_time, progress, circle_x, smoothstep, quadratic,
                         seeded_points, glyph_targets, particle_state, project, validate_scenes, scene_at, DEMO_SCENES)

ROOT = Path(__file__).resolve().parents[1]

def spring_exact(t):
    w = math.sqrt(3.75)
    return math.exp(-.5*t)*(math.cos(w*t)+.5/w*math.sin(w*t))

def spring_replay(t, dt):
    x, v = 1.0, 0.0
    for _ in range(round(t/dt)):
        v += (-4*x-v)*dt
        x += v*dt
    return x

def expect_rejected(fn):
    try:
        fn()
    except (ValueError, KeyError, TypeError):
        return True
    raise AssertionError('錯誤輸入未被拒絕')

def bar_height(v, low, high, height):
    if high <= low:
        raise ValueError('比例尺範圍必須大於零')
    return height*(v-low)/(high-low)

def check(n):
    if n == 1:
        values = [frame_time(i,30) for i in (0,1,29,30,89)]
        assert len(range(90)) == 90 and max(range(90)) == 89
        return {'frames':90,'lastIndex':89,'times':values}
    if n == 2:
        assert (960/2,540/2)==(480,270)
        assert 20+20==40 and 0-20<0
        return {'center':[480,270],'safeCenter':[40,40]}
    if n == 3:
        xs = [100+50*frame_time(i,30) for i in (60,0,30,60)]
        assert xs==[200,100,150,200]
        return xs
    if n in (4,22):
        xs=[circle_x(frame_time(i,30)) for i in (0,15,30,60,89)]
        assert xs==[100,250,400,700,700]
        return xs
    if n == 5:
        xs=[circle_x(t,eased=True) for t in (.5,1,1.5)]
        assert xs==[193.75,400,606.25] and smoothstep(.25)==.15625
        return xs
    if n == 6:
        scenes=[{'id':'a','start':0,'duration':3,'type':'easing'},
                {'id':'b','start':3,'duration':3,'type':'particles'}]
        assert scene_at(3,scenes)==('b',0) and scene_at(6,scenes) is None
        assert math.isclose(scene_at(4.2,scenes)[1],1.2)
        return {'boundary':scene_at(3,scenes),'at4.2':scene_at(4.2,scenes)}
    if n == 7:
        vals=[quadratic(Point(0,0),Point(50,100),Point(100,0),u) for u in (0,.25,.5,.75,1)]
        assert vals[1]==Point(25,37.5) and vals[2]==Point(50,50)
        assert vals[0]==Point(0,0) and vals[-1]==Point(100,0)
        return [vars(p) for p in vals]
    if n == 8:
        x,y=200-(2+102)/2,100-(5+45)/2
        assert (x,y)==(148,75) and (x+52,y+25)==(200,100)
        return {'drawingOrigin':[x,y],'visibleCenter':[x+52,y+25]}
    if n == 9:
        state=random.getstate(); a=seeded_points(200,20261005); b=seeded_points(200,20261005)
        assert a==b and random.getstate()==state
        assert all(0<=p.x<800 and 0<=p.y<400 for p in a)
        return {'count':len(a),'firstPoint':vars(a[0]),'globalRandomUnchanged':True}
    if n == 10:
        targets=glyph_targets(); starts=seeded_points(len(targets),20261005)
        assert len(set(targets))==len(targets)
        assert particle_state(0)==starts and particle_state(3)==targets
        assert particle_state(1.5)==particle_state(1.5)
        return {'targetCount':len(targets),'unique':True,'endMatches':True}
    if n == 11:
        vals=[10*math.sin(2*math.pi*.5*t) for t in (0,.5,1,1.5,2)]
        assert all(math.isclose(a,b,abs_tol=1e-12) for a,b in zip(vals,(0,10,0,-10,0)))
        return vals
    if n == 12:
        v=-4*.1; x=1+v*.1
        assert math.isclose(x,.96)
        target=spring_exact(2)
        errors=[abs(spring_replay(2,dt)-target) for dt in (1/60,1/120,1/240)]
        assert errors[2]<errors[1]<errors[0]
        assert spring_replay(2,1/120)==spring_replay(2,1/120)
        return {'firstStep':[x,v],'exactAt2':target,'stepErrors':errors}
    if n == 13:
        hs=[bar_height(v,0,40,200) for v in (10,20,30)]
        assert hs==[50,100,150]
        expect_rejected(lambda:bar_height(20,20,20,200))
        return {'heights':hs,'tops':[250-h for h in hs],'constantRangeRejected':True}
    if n == 14:
        nodes=set('ABCDE'); edges=[('A','B'),('A','C'),('B','D'),('C','D'),('D','E')]
        assert all(a in nodes and b in nodes for a,b in edges)
        assert sum(b=='D' for a,b in edges)==2
        return {'nodes':5,'edges':5,'DInDegree':2}
    if n == 15:
        a=project(1,1,0); b=project(1,1,4)
        pixels=lambda p:[400+200*p.x,225-200*p.y]
        assert pixels(a)==[450,175] and pixels(b)==[425,200]
        assert project(1,1,-4) is None and project(1,1,-5) is None
        return {'near':pixels(a),'far':pixels(b),'behindRejected':True}
    if n == 16:
        vals=[.2+.8*max(0,d) for d in (1,0,-1)]
        assert vals==[1,.2,.2]
        return {'cpuNumericalTeaching':True,'brightness':vals,'gpuRun':False}
    if n == 17:
        out=ROOT/'examples/output/chapter17_two_seconds.wav'; out.parent.mkdir(parents=True,exist_ok=True)
        data=b''.join(struct.pack('<h',round(32767*.05*math.sin(2*math.pi*440*n/48000))) for n in range(96000))
        with wave.open(str(out),'wb') as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000); w.writeframes(data)
        with wave.open(str(out),'rb') as w:
            assert (w.getnchannels(),w.getframerate(),w.getnframes())==(1,48000,96000)
        return {'file':str(out.relative_to(ROOT)),'duration':2,'samples':96000,'dataBytes':len(data)}
    if n == 18:
        def schedule(lengths):
            if any(v>2 for v in lengths):raise ValueError('語音超窗')
            return [i*2+v for i,v in enumerate(lengths)]
        vals=schedule([1.6,1.8,1.9]); assert vals==[1.6,3.8,5.9]
        expect_rejected(lambda:schedule([1.6,2.4,1.9]))
        return {'hypotheticalDurations':True,'ends':vals,'overflowRejected':True}
    if n == 19:
        assert 1280*720*3==2764800 and 8*30==240
        return {'rawFrameBytes':2764800,'rawEightSecondsBytes':663552000,'frames':240}
    if n in (20,23):
        validate_scenes(DEMO_SCENES)
        expect_rejected(lambda:validate_scenes([{'id':'a','start':.5,'duration':4,'type':'easing'}]))
        expect_rejected(lambda:validate_scenes([{'id':'a','start':0,'duration':-1,'type':'easing'}]))
        expect_rejected(lambda:validate_scenes([{'id':'a','start':0,'duration':4,'type':'other'}]))
        expect_rejected(lambda:validate_scenes([dict(DEMO_SCENES[0], extra=1)]))
        expect_rejected(lambda:validate_scenes([DEMO_SCENES[0],dict(DEMO_SCENES[1],id='easing')]))
        return {'invalidInputsRejected':5,'frames':240,'localAt5':scene_at(5,DEMO_SCENES)[1]}
    if n == 21:
        assert 5*30==150 and progress(frame_time(60,30),0,4)==.5
        return {'frames':150,'lastIndex':149,'halfProgress':.5,'lastTime':149/30}
    if n == 24:
        assert 60*30==1800 and 450/30==15
        return {'frames':1800,'lastIndex':1799,'lastTime':1799/30,'sceneAt450':2}
    raise ValueError('章節須為1至24')

if __name__=='__main__':
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--chapter',type=int)
    args=parser.parse_args()
    results={f'CH{n:02d}':check(n) for n in ([args.chapter] if args.chapter else range(1,25))}
    report={'status':'passed','scope':'numerical teaching examples, not human reading or original-case tests','chapters':results}
    if args.chapter is None:
        (ROOT/'qa/chapter_checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps(report,ensure_ascii=False,indent=2))
