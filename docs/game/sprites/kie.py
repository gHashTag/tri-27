#!/usr/bin/env python3
"""Submit and poll kie.ai image jobs. resultJson arrives as a JSON *string*,
which is why a one-liner kept failing; this parses it once, properly."""
import json, sys, time, urllib.request

KEY = open('/tmp/.kie_key').read().strip()
BASE = 'https://api.kie.ai/api/v1/jobs'

def _req(url, body=None):
    data = json.dumps(body).encode() if body is not None else None
    r = urllib.request.Request(url, data=data, headers={
        'Authorization': f'Bearer {KEY}', 'Content-Type': 'application/json'})
    with urllib.request.urlopen(r, timeout=60) as f:
        return json.load(f)

def submit(model, inp):
    d = _req(f'{BASE}/createTask', {'model': model, 'input': inp})
    if d.get('code') != 200:
        raise SystemExit(f'createTask refused: {d}')
    return d['data']['taskId']

def wait(task_id, every=8, limit=300):
    t0 = time.time()
    while time.time() - t0 < limit:
        d = _req(f'{BASE}/recordInfo?taskId={task_id}')['data']
        st = d.get('state')
        if st == 'success':
            rj = d.get('resultJson')
            rj = json.loads(rj) if isinstance(rj, str) else (rj or {})
            return rj.get('resultUrls') or []
        if st in ('fail', 'failed', 'error'):
            raise SystemExit(f'task {task_id} failed: {d.get("failMsg")}')
        time.sleep(every)
    raise SystemExit(f'task {task_id} timed out after {limit}s')

def fetch(url, path):
    # tempfile.aiquickdraw.com answers 403 to a request without a User-Agent
    # and 200 with one; curl sends its own, urllib sends none. Measured.
    r = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(r, timeout=120) as f, open(path, 'wb') as o:
        o.write(f.read())
    return path

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'submit':
        print(submit(sys.argv[2], json.load(open(sys.argv[3]))))
    elif cmd == 'wait':
        urls = wait(sys.argv[2])
        print(urls[0] if urls else '')
        if len(sys.argv) > 3 and urls:
            fetch(urls[0], sys.argv[3]); print('saved', sys.argv[3])
