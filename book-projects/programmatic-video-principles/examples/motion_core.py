"""本書原創最小原理。僅用標準函式庫；不是既有影片引擎的原始碼。"""
from __future__ import annotations
from dataclasses import dataclass
import math
import random
from typing import Iterable

@dataclass(frozen=True)
class Point:
    x: float
    y: float


def finite(*values: float) -> None:
    if not all(math.isfinite(v) for v in values):
        raise ValueError("數值必須有限，不可使用 NaN 或無限大")


def frame_time(frame: int, fps: float) -> float:
    """從零起算的影格編號 → 秒。"""
    finite(fps)
    if isinstance(frame, bool) or not isinstance(frame, int) or frame < 0:
        raise ValueError("影格編號必須是非負整數")
    if fps <= 0:
        raise ValueError("每秒影格數必須大於零")
    return frame / fps


def progress(t: float, start: float, duration: float) -> float:
    """時間進度限於 [0,1]；結束後保持終點。"""
    finite(t, start, duration)
    if duration <= 0:
        raise ValueError("持續時間必須大於零")
    return max(0.0, min(1.0, (t-start)/duration))


def lerp(a: float, b: float, u: float) -> float:
    """線性插值；本函數允許外插，動畫呼叫端自行限制進度。"""
    finite(a, b, u)
    return a + (b-a)*u


def smoothstep(u: float) -> float:
    """一種緩動：起終變化率為零；不是所有緩動的通用定義。"""
    finite(u)
    u=max(0.0, min(1.0,u))
    return u*u*(3-2*u)


def circle_x(t: float, duration: float = 2.0, eased: bool = False) -> float:
    u=progress(t, 0.0, duration)
    return lerp(100.0, 700.0, smoothstep(u) if eased else u)


def quadratic(a: Point, control: Point, b: Point, u: float) -> Point:
    finite(a.x,a.y,control.x,control.y,b.x,b.y,u)
    if not 0<=u<=1:
        raise ValueError("這個示範的曲線參數須介於零與一")
    q=1-u
    return Point(q*q*a.x+2*q*u*control.x+u*u*b.x,
                 q*q*a.y+2*q*u*control.y+u*u*b.y)


def seeded_points(count: int, seed: int, width: float=800, height: float=400) -> tuple[Point,...]:
    finite(width,height)
    if isinstance(count,bool) or not isinstance(count,int) or count<0 or width<=0 or height<=0:
        raise ValueError("點數須為非負整數，尺寸須大於零")
    rng=random.Random(seed)  # 區域亂數，不消耗或修改全域序列。
    return tuple(Point(rng.random()*width,rng.random()*height) for _ in range(count))


def glyph_targets(step: int=10) -> tuple[Point,...]:
    """以四條矩形筆畫自繪『井』形遮罩取樣；不讀任何字型檔。"""
    if isinstance(step,bool) or not isinstance(step,int) or not 2<=step<=30:
        raise ValueError("取樣間隔須為 2～30 的整數")
    pts=[]
    for y in range(70,331,step):
        for x in range(270,531,step):
            inside=(315<=x<=345 or 455<=x<=485 or 130<=y<=160 or 240<=y<=270)
            if inside:
                pts.append(Point(float(x),float(y)))
    return tuple(pts)


def particle_state(t: float, seed: int=20261005, start: float=0, duration: float=3) -> tuple[Point,...]:
    targets=glyph_targets()
    starts=seeded_points(len(targets),seed)
    u=smoothstep(progress(t,start,duration))
    # 不保留前一幀狀態，因此亂序取幀仍可重現。配對採相同索引，不宣稱最佳配對。
    return tuple(Point(lerp(a.x,b.x,u),lerp(a.y,b.y,u)) for a,b in zip(starts,targets))


def project(x: float,y: float,z: float,distance: float=4,near: float=.1) -> Point | None:
    """相機在 z=-distance，看向 +z；y 向上。回傳未平移的二維投影。"""
    finite(x,y,z,distance,near)
    if distance<=0 or near<=0:
        raise ValueError("相機距離與近裁切距離須為正數")
    depth=z+distance
    if depth<=near:
        return None
    return Point(x/depth,y/depth)


def validate_scenes(scenes: Iterable[dict]) -> list[dict]:
    """教學用兩幕規格：精確連續的半開區間，沒有轉場交疊。"""
    scenes=list(scenes)
    if not scenes:
        raise ValueError("至少需要一幕")
    seen=set(); end=0.0
    for s in scenes:
        if set(s)!={'id','start','duration','type'}:
            raise ValueError("場景欄位必須為 id/start/duration/type")
        if not isinstance(s['id'],str) or not s['id'] or s['id'] in seen:
            raise ValueError("場景 ID 必須存在且不重複")
        finite(s['start'],s['duration'])
        if s['duration']<=0 or not math.isclose(s['start'],end,abs_tol=1e-9):
            raise ValueError("場景必須從零起連續排列，長度須為正數")
        if s['type'] not in ('easing','particles'):
            raise ValueError("未知場景類型")
        end=s['start']+s['duration']; seen.add(s['id'])
    return scenes


def scene_at(t: float,scenes: Iterable[dict]) -> tuple[str,float] | None:
    finite(t)
    for s in validate_scenes(scenes):
        if s['start']<=t<s['start']+s['duration']:
            return (s['id'],t-s['start'])
    return None

DEMO_SCENES=[{'id':'easing','start':0.0,'duration':4.0,'type':'easing'},
             {'id':'particles','start':4.0,'duration':4.0,'type':'particles'}]
