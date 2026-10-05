import sys, math, random, unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'examples'))
from motion_core import *

class MotionTests(unittest.TestCase):
    def test_01_frame_time(self): self.assertEqual(frame_time(45,30),1.5)
    def test_02_invalid_fps(self):
        for fps in (0,-1,float('nan')):
            with self.assertRaises(ValueError): frame_time(0,fps)
    def test_03_invalid_frame(self):
        for frame in (-1,1.2,True):
            with self.assertRaises(ValueError): frame_time(frame,30)
    def test_04_last_frame(self): self.assertAlmostEqual(frame_time(89,30),3-1/30)
    def test_05_progress_before(self): self.assertEqual(progress(-1,0,2),0)
    def test_06_progress_after(self): self.assertEqual(progress(3,0,2),1)
    def test_07_progress_middle(self): self.assertEqual(progress(.5,0,2),.25)
    def test_08_bad_duration(self):
        with self.assertRaises(ValueError): progress(0,0,0)
    def test_09_lerp_start(self): self.assertEqual(lerp(100,700,0),100)
    def test_10_lerp_end(self): self.assertEqual(lerp(100,700,1),700)
    def test_11_lerp_quarter(self): self.assertEqual(lerp(100,700,.25),250)
    def test_12_ease_quarter(self): self.assertEqual(smoothstep(.25),.15625)
    def test_13_ease_monotonic(self):
        v=[smoothstep(i/100) for i in range(101)];self.assertEqual(v,sorted(v));self.assertEqual((v[0],v[-1]),(0,1))
    def test_14_duration_change(self): self.assertEqual(circle_x(.5,4),175)
    def test_15_end_hold(self): self.assertEqual(circle_x(frame_time(89,30)),700)
    def test_16_seed_same(self): self.assertEqual(seeded_points(30,4),seeded_points(30,4))
    def test_17_seed_change(self): self.assertNotEqual(seeded_points(30,4),seeded_points(30,5))
    def test_18_no_global_rng_change(self):
        random.seed(8);state=random.getstate();seeded_points(3,2);self.assertEqual(state,random.getstate())
    def test_19_points_in_bounds(self):
        self.assertTrue(all(0<=p.x<800 and 0<=p.y<400 for p in seeded_points(100,9)))
    def test_20_particle_start(self):
        self.assertEqual(particle_state(0),seeded_points(len(glyph_targets()),20261005))
    def test_21_particle_end(self):
        for a,b in zip(particle_state(3),glyph_targets()):self.assertAlmostEqual(a.x,b.x);self.assertAlmostEqual(a.y,b.y)
    def test_22_particle_random_access(self):
        a=particle_state(1.2);particle_state(2.7);particle_state(0);self.assertEqual(a,particle_state(1.2))
    def test_23_curve_endpoints(self):
        a=Point(0,0);c=Point(5,8);b=Point(10,0);self.assertEqual(quadratic(a,c,b,0),a);self.assertEqual(quadratic(a,c,b,1),b)
    def test_24_projection_clip(self): self.assertIsNone(project(1,1,-4))
    def test_25_projection_near_far(self): self.assertGreater(project(1,1,0).x,project(1,1,2).x)
    def test_26_scene_boundary(self): self.assertEqual(scene_at(4,DEMO_SCENES),('particles',0))
    def test_27_scene_end_excluded(self): self.assertIsNone(scene_at(8,DEMO_SCENES))
    def test_28_valid_scenes(self): self.assertEqual(validate_scenes(DEMO_SCENES),DEMO_SCENES)
    def test_29_reject_scene_gap(self):
        with self.assertRaises(ValueError):validate_scenes([{'id':'x','start':1,'duration':2,'type':'easing'}])
    def test_30_reject_nan(self):
        with self.assertRaises(ValueError):lerp(0,1,float('nan'))
    def test_31_reject_duplicate_scene_id(self):
        with self.assertRaises(ValueError):validate_scenes([DEMO_SCENES[0],{'id':'easing','start':4,'duration':2,'type':'particles'}])
    def test_32_reject_unknown_scene_field(self):
        with self.assertRaises(ValueError):validate_scenes([dict(DEMO_SCENES[0],extra=1)])
    def test_33_reject_invalid_target_step(self):
        with self.assertRaises(ValueError):glyph_targets(0)
    def test_34_particle_targets_unique(self): self.assertEqual(len(glyph_targets()),len(set(glyph_targets())))

if __name__=='__main__':unittest.main()
