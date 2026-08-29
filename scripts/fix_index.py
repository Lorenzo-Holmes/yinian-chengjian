import io
p = r'index.html'
with io.open(p, 'r', encoding='utf-8') as f:
    t = f.read()
bad = '  <script src="./app.js"></script>`n  <script src="./gemini.js"></script>'
good = '  <script src="./app.js"></script>\n  <script src="./gemini.js"></script>'
if bad in t:
    t = t.replace(bad, good)
    with io.open(p, 'w', encoding='utf-8', newline='') as f:
        f.write(t)
    print('REPLACED')
else:
    print('NO_MATCH; first 400 around gemini.js:')
    i = t.find('gemini.js')
    print(repr(t[max(0,i-120):i+80]))
