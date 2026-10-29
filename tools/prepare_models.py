"""Prepare copies of the supplied GLBs; never modify the source files."""
import copy
import itertools
import json
import math
import struct
from pathlib import Path

SITE = Path(__file__).resolve().parents[1]
SOURCE = SITE.parent / '3D'

# Tên tệp ở thư mục 3D và tên dùng công khai trên website. Không sửa tệp nguồn.
MODELS = {
    'ran.glb': 'the-ran.glb',
    'long.glb': 'the-long.glb',
    'khi.glb': 'the-khi.glb',
    'nong_chay.glb': 'nong-chay.glb',
    'dong_dac.glb': 'dong-dac.glb',
    'bay_hoi.glb': 'bay-hoi.glb',
    'suong_mu.glb': 'suong-mu.glb',
    'su_soi.glb': 'su-soi.glb',
    'lam_muoi_tu_nuoc_bien.glb': 'lam-muoi-tu-nuoc-bien.glb',
    'lam_nen.glb': 'lam-nen.glb',
}


def read_glb(path):
    blob = path.read_bytes()
    magic, version, length = struct.unpack_from('<4sII', blob)
    if magic != b'glTF' or version != 2 or length != len(blob):
        raise ValueError(f'Invalid GLB: {path.name}')
    chunks, offset = [], 12
    while offset < length:
        size, kind = struct.unpack_from('<II', blob, offset)
        chunks.append((kind, blob[offset + 8:offset + 8 + size]))
        offset += 8 + size
    return json.loads(chunks[0][1]), chunks[1:]


def write_glb(path, data, chunks):
    raw = json.dumps(data, ensure_ascii=False, separators=(',', ':')).encode('utf-8')
    raw += b' ' * (-len(raw) % 4)
    body = struct.pack('<II', len(raw), 0x4E4F534A) + raw
    for kind, content in chunks:
        body += struct.pack('<II', len(content), kind) + content
    path.write_bytes(struct.pack('<4sII', b'glTF', 2, len(body) + 12) + body)


def multiply(a, b):
    return [[sum(a[i][k] * b[k][j] for k in range(4)) for j in range(4)] for i in range(4)]


IDENTITY = [[int(i == j) for j in range(4)] for i in range(4)]


def matrix(node):
    if 'matrix' in node:
        return [[node['matrix'][j * 4 + i] for j in range(4)] for i in range(4)]
    x, y, z, w = node.get('rotation', [0, 0, 0, 1])
    s = node.get('scale', [1, 1, 1])
    t = node.get('translation', [0, 0, 0])
    m = [[1-2*(y*y+z*z), 2*(x*y-z*w), 2*(x*z+y*w), t[0]],
         [2*(x*y+z*w), 1-2*(x*x+z*z), 2*(y*z-x*w), t[1]],
         [2*(x*z-y*w), 2*(y*z+x*w), 1-2*(x*x+y*y), t[2]], [0, 0, 0, 1]]
    for i in range(3):
        for j in range(3):
            m[i][j] *= s[j]
    return m


def world_bounds(data):
    points = []
    def visit(idx, parent):
        node = data['nodes'][idx]
        world = multiply(parent, matrix(node))
        if 'mesh' in node:
            for primitive in data['meshes'][node['mesh']]['primitives']:
                acc = data['accessors'][primitive['attributes']['POSITION']]
                for p in itertools.product(*zip(acc['min'], acc['max'])):
                    points.append([sum(world[i][j] * p[j] for j in range(3)) + world[i][3] for i in range(3)])
        for child in node.get('children', []):
            visit(child, world)
    for node in data['scenes'][data.get('scene', 0)].get('nodes', []):
        visit(node, IDENTITY)
    return [min(p[i] for p in points) for i in range(3)], [max(p[i] for p in points) for i in range(3)]


def merge_animations(data):
    old = data.get('animations', [])
    if len(old) < 2:
        return len(old)
    merged = {'name': 'TatCaCacHat', 'samplers': [], 'channels': []}
    targets = set()
    for anim in old:
        offset = len(merged['samplers'])
        merged['samplers'].extend(copy.deepcopy(anim['samplers']))
        for channel in anim['channels']:
            target = (channel['target'].get('node'), channel['target']['path'])
            if target in targets:
                raise ValueError('Animation clips conflict; cannot merge them safely')
            targets.add(target)
            item = copy.deepcopy(channel)
            item['sampler'] += offset
            merged['channels'].append(item)
    data['animations'] = [merged]
    return len(old)


def describe(path, data):
    acc = data.get('accessors', [])
    return {
        'file': path.name, 'bytes': path.stat().st_size,
        'meshes': len(data.get('meshes', [])), 'nodes': len(data.get('nodes', [])),
        'vertices': sum(acc[p['attributes']['POSITION']]['count'] for m in data.get('meshes', []) for p in m['primitives']),
        'embeddedImages': len(data.get('images', [])),
        'animations': [{'name': a.get('name'), 'channels': len(a['channels']),
                        'seconds': max(acc[s['input']].get('max', [0])[0] for s in a['samplers'])}
                       for a in data.get('animations', [])],
        'extensionsUsed': data.get('extensionsUsed', [])
    }


def main():
    reports = []
    dest = SITE / 'assets' / 'models'
    dest.mkdir(parents=True, exist_ok=True)
    for source_name, target_name in MODELS.items():
        source = SOURCE / source_name
        data, chunks = read_glb(source)
        original = describe(source, data)
        lo, hi = world_bounds(data)
        factor = 0.24 / max(hi[i] - lo[i] for i in range(3))
        old_clips = merge_animations(data)
        for scene in data['scenes']:
            root = {'name': 'WebAR_Tabletop_24cm', 'children': scene.get('nodes', []),
                    'scale': [factor] * 3,
                    'translation': [-(hi[0]+lo[0])/2*factor, -lo[1]*factor, -(hi[2]+lo[2])/2*factor]}
            scene['nodes'] = [len(data['nodes'])]
            data['nodes'].append(root)
        target = dest / target_name
        write_glb(target, data, chunks)
        reports.append({'original': original, 'web': describe(target, data),
                        'originalWorldBounds': {'min': lo, 'max': hi},
                        'scaleFactor': factor, 'maxDimensionMeters': 0.24,
                        'mergedOriginalClips': old_clips if old_clips > 1 else 0})
    (SITE / 'data' / 'model-analysis.json').write_text(json.dumps(reports, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps([{'file': r['original']['file'], 'webBytes': r['web']['bytes'],
                      'oldClips': len(r['original']['animations']), 'newClips': len(r['web']['animations']),
                      'scale': r['scaleFactor']} for r in reports], ensure_ascii=True))


if __name__ == '__main__':
    main()
