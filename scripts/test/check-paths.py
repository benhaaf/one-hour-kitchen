# Prüft Personen, Simulationswege und Wege gegen Möbel-Grundflächen (Abstand 0,25 m)
import json, math, sys
L = json.load(open('src/layout.json')); R = 0.25
rects = []
for m in L['moebel']:
    if 'rechteck' in m: rects.append((m['id'], m['rechteck']))
    elif 'mitte' in m:
        cx, cz = m['mitte']; u = m['richtung']; n = math.hypot(*u)
        rects.append((m['id'], ('rot', cx, cz, m['laenge'], m['tiefe'], u[0] / n, u[1] / n)))
    elif 'stationen' in m:
        for x, z in m['stationen']: rects.append((m['id'], [x - .2, x + .2, z - .2, z + .2]))
    for x in m.get('stuehle_x', []):
        for z in m.get('stuehle_z', []): rects.append((m['id'] + '-Stuhl', [x - .2, x + .2, z - .2, z + .2]))
def hits(x, z):
    out = []
    for i, rc in rects:
        if rc[0] == 'rot':
            _, cx, cz, l, t, dx, dz = rc
            u = (x - cx) * dx + (z - cz) * dz; v = -(x - cx) * dz + (z - cz) * dx
            if abs(u) < l / 2 + R and abs(v) < t / 2 + R: out.append(i)
        elif rc[0] - R < x < rc[1] + R and rc[2] - R < z < rc[3] + R: out.append(i)
    return out
bad = 0
for p in L['personen']:
    h = hits(*p['pos'])
    if h: print('Person', p['_wer'], h); bad += 1
def seg(name, pts):
    global bad
    for a, b in zip(pts, pts[1:]):
        n = int(math.hypot(b[0] - a[0], b[1] - a[1]) / 0.05) + 1
        s = set()
        for i in range(n + 1): s |= set(hits(a[0] + (b[0] - a[0]) * i / n, a[1] + (b[1] - a[1]) * i / n))
        if s: print(name, a, b, s); bad += 1
for k in L['simulation']['kunden']: seg(k['name'], [p['p'] for p in k['punkte']])
for w in L['wege']:
    if w['id'] != 'blickachse': seg(w['id'], w['punkte'])
print('Konflikte:', bad)
