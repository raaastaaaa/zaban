#!/usr/bin/env python3
"""
زبان رستا — ساخت تلفظ انگلیسی به خط فارسی از روی دیکشنری
  آمریکایی: CMU Pronouncing Dictionary (cmudict)
  بریتانیایی: Britfone (دیکشنری تلفظ بریتانیایی، MIT) و برای واژه‌هایی که در آن نیست: همان CMU با قواعد بریتانیایی
هر واژه جداگانه و دقیقاً مطابق تلفظ دیکشنری نوشته می‌شود (بدون حدس).
اجرا:  python3 tools/pron_build.py  (فایل‌های audio/pron*.json را بازنویسی می‌کند)
"""
import json, re, sys, os, csv
import cmudict
from num2words import num2words

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CMU = cmudict.dict()
BRIT = {}
_bf = os.environ.get('BRITFONE', '/tmp/claude-0/britfone.csv')
for row in csv.reader(open(_bf, encoding='utf-8')):
    if len(row) < 2: continue
    w = re.sub(r'\(\d+\)$', '', row[0].strip()).lower()
    BRIT.setdefault(w, []).append(row[1].strip().split())

# ---------- واج‌های یکسان داخلی ----------
# صامت‌ها: P B T D K G F V TH DH S Z SH ZH CH JH HH M N NG L R W Y
# مصوت‌ها: a=æ  A=ɑ/ɑː  o=ɒ/ɔ/ɔː/ʊ  u=uː  i=iː/ɪ  e=ɛ/ə/ɜ  ʌ=V
#          EY AY AW OY OW(US oʊ) OU(UK əʊ) IA(ɪə) EA(ɛə) UA(ʊə) ER(US ɝ/ɚ)
CMU_V = {'AE': 'a', 'AA': 'A', 'AO': 'o', 'UH': 'o', 'UW': 'u', 'IY': 'i', 'IH': 'i', 'EH': 'e',
         'EY': 'EY', 'AY': 'AY', 'AW': 'AW', 'OY': 'OY', 'OW': 'OW', 'ER': 'ER'}
def cmu_units(ph):
    out = []
    for p in ph:
        b = re.sub(r'\d', '', p); st = p[-1] if p[-1].isdigit() else None
        if b == 'AH': out.append('Q' if st in ('1', '2') else 'e')
        elif b in CMU_V: out.append(CMU_V[b])
        else: out.append(b)
    return out
IPA = {'p': 'P', 'b': 'B', 't': 'T', 'd': 'D', 'k': 'K', 'g': 'G', 'f': 'F', 'v': 'V_', 'θ': 'TH', 'ð': 'DH', 's': 'S', 'z': 'Z',
       'ʃ': 'SH', 'ʒ': 'ZH', 'tʃ': 'CH', 'dʒ': 'JH', 'h': 'HH', 'm': 'M', 'n': 'N', 'ŋ': 'NG', 'l': 'L', 'ɹ': 'R', 'r': 'R', 'w': 'W', 'j': 'Y',
       'æ': 'a', 'ɑː': 'A', 'ɒ': 'o', 'ɔː': 'o', 'ʊ': 'o', 'uː': 'u', 'iː': 'i', 'i': 'i', 'ɪ': 'i', 'ɛ': 'e', 'ə': 'e', 'ɜː': 'e', 'ɐ': 'Q',
       'eɪ': 'EY', 'aɪ': 'AY', 'aʊ': 'AW', 'ɔɪ': 'OY', 'əʊ': 'OU', 'ɪə': 'IA', 'ɛə': 'EA', 'ʊə': 'UA'}
def brit_units(ph):
    out = []
    for p in ph:
        u = IPA[re.sub('[ˈˌ]', '', p)]
        out.append('V' if u == 'V_' else u)
    return out
VOW = {'a', 'A', 'o', 'u', 'i', 'e', 'Q', 'EY', 'AY', 'AW', 'OY', 'OW', 'OU', 'IA', 'EA', 'UA', 'ER'}

def us_to_uk(units, word):
    """واژه‌ای که در Britfone نیست: قواعد بریتانیایی روی تلفظ آمریکایی"""
    out = []
    for i, u in enumerate(units):
        nxt = units[i + 1] if i + 1 < len(units) else None
        if u == 'ER': out.append('e'); continue                       # bird → بِد
        if u == 'R' and (nxt is None or nxt not in VOW): continue      # r فقط پیش از مصوت
        if u == 'OW': out.append('OU'); continue                      # go → گِئو
        if u == 'A' and 'o' in word and not re.search(r'a', word):   # lot/hot → اُ
            out.append('o'); continue
        out.append(u)
    return out

# ---------- نوشتن به خط فارسی ----------
CONS = {'P': 'پ', 'B': 'ب', 'T': 'ت', 'D': 'د', 'K': 'ک', 'G': 'گ', 'F': 'ف', 'V': 'و', 'TH': 'ث', 'DH': 'ذ', 'S': 'س', 'Z': 'ز',
        'SH': 'ش', 'ZH': 'ژ', 'CH': 'چ', 'JH': 'ج', 'HH': 'ه', 'M': 'م', 'N': 'ن', 'NG': 'نگ', 'L': 'ل', 'R': 'ر', 'W': 'و', 'Y': 'ی'}
# (پس از صامت، آغاز واژه، پس از مصوت)
VFA = {'a': ('َ', 'اَ', 'ئَ'), 'e': ('ِ', 'اِ', 'ئِ'), 'Q': ('َ', 'اَ', 'ئَ'), 'o': ('ُ', 'اُ', 'ئُ'),
       'i': ('ی', 'ای', 'ئی'), 'u': ('و', 'او', 'ئو'), 'A': ('ا', 'آ', 'ئا'),
       'EY': ('ِی', 'اِی', 'ئِی'), 'AY': ('ای', 'آی', 'ئای'), 'AW': ('او', 'آو', 'ئاو'), 'OY': ('ُی', 'اُی', 'ئُی'),
       'OW': ('و', 'او', 'ئو'), 'OU': ('ِئو', 'اِئو', 'ئِئو'), 'IA': ('یِ', 'ایِ', 'ئیِ'), 'EA': ('ِ', 'اِ', 'ئِ'), 'UA': ('وِ', 'اوِ', 'ئوِ'),
       'ER': ('ِر', 'اِر', 'ئِر')}
def to_fa(units):
    s = ''; prev = None
    for i, u in enumerate(units):
        if u in VOW:
            s += VFA[u][1 if prev is None else 2 if prev == 'v' else 0]; prev = 'v'; continue
        s += 'ن' if u == 'NG' and i + 1 < len(units) and units[i + 1] in ('K', 'G') else CONS[u]
        if prev is None and i + 1 < len(units) and units[i + 1] not in VOW: s += 'ْ'   # خوشهٔ صامتِ آغاز واژه
        prev = 'c'
    return s

# ---------- انتخاب تلفظ درست برای واژه‌های چندتلفظی ----------
VERB_CUE = {'to', 'i', 'you', 'we', 'they', 'can', 'could', 'will', 'would', "don't", "didn't", 'please', 'should', 'may', 'might', 'must', "let's", "can't", "won't", 'cannot', 'not'}
NV = {'subject', 'record', 'present', 'object', 'project', 'contract', 'increase', 'decrease', 'permit', 'produce', 'conduct', 'desert', 'export', 'import',
      'progress', 'protest', 'rebel', 'refund', 'insult', 'suspect', 'address', 'contrast', 'convert', 'digest', 'discount', 'escort', 'extract', 'transport', 'update', 'upset', 'survey', 'conflict', 'combat'}
def nv_pick(w, vs, prev, first_stressed):
    base = re.sub(r"(s|ed|ing)$", '', w)
    if w not in NV and base not in NV or len(vs) < 2: return None
    verb = prev in VERB_CUE or w.endswith(('ed', 'ing'))
    for v in vs:
        if first_stressed(v) != verb: return v
    return None
def pick_cmu(w, prev, nxt):
    vs = CMU[w]
    r = nv_pick(w, vs, prev, lambda v: next((p for p in v if p[-1].isdigit() and p[-1] in '012'), '').endswith('1'))
    if r: return r
    def has(ph): return [v for v in vs if ph in ' '.join(v)]
    if w in ('excuse', 'use', 'close', 'abuse', 'refuse'):
        z = [v for v in vs if v[-1] == 'Z']; s_ = [v for v in vs if v[-1] == 'S']
        verb = (w == 'excuse' and nxt in ('me', 'us', 'my')) or prev in VERB_CUE or (w == 'close' and nxt in ('the', 'it', 'your', 'my', 'this', 'that', 'a', 'door', 'window'))
        if w == 'use' and nxt == 'to' and prev in ('i', 'you', 'we', 'they', 'he', 'she', 'used'): verb = False
        return (z if verb else s_ or z or vs)[0]
    if w == 'used' and nxt == 'to': return [v for v in vs if 'S' in v and 'Z' not in v][0] if any('Z' not in v for v in vs) else vs[0]
    if w == 'read': r = [v for v in vs if 'IY1' in v]; return (r or vs)[0]
    if w == 'the': return ['DH', 'IY0'] if nxt and nxt[0] in 'aeiou' and not nxt.startswith(('uni', 'use', 'eu', 'one', 'once')) else ['DH', 'AH0']
    if w == 'live': return [v for v in vs if 'IH1' in v][0]
    if w != 'a' and not any(p.endswith('1') for p in vs[0]):
        st = [v for v in vs if any(p.endswith('1') for p in v)]
        if st: return st[0]
    return vs[0]
def pick_brit(w, prev, nxt):
    vs = BRIT[w]
    r = nv_pick(w, vs, prev, lambda v: next((('ˈ' in p) for p in v if re.sub('[ˈˌ]', '', p) in IPA and IPA[re.sub('[ˈˌ]', '', p)] in VOW | {'V_'} - {'V_'}), False))
    if r: return r
    if len(vs) > 1 and w in ('excuse', 'use', 'close', 'abuse', 'refuse'):
        verb = (w == 'excuse' and nxt in ('me', 'us', 'my')) or prev in VERB_CUE or (w == 'close' and nxt in ('the', 'it', 'your', 'my', 'this', 'that', 'a', 'door', 'window'))
        z = [v for v in vs if v[-1] == 'z']; s_ = [v for v in vs if v[-1] == 's']
        return (z if verb else s_ or z or vs)[0]
    if w == 'read': r = [v for v in vs if any('iː' in p for p in v)]; return (r or vs)[0]
    if w == 'the': return ['ð', 'iː'] if nxt and nxt[0] in 'aeiou' and not nxt.startswith(('uni', 'use', 'eu', 'one', 'once')) else ['ð', 'ə']
    if w in ('your', 'yours'): return ['j', 'ˈɔː'] + (['z'] if w == 'yours' else [])
    if w != 'a':
        st = [v for v in vs if any('ˈ' in p for p in v)]
        if st and not any('ˈ' in p for p in vs[0]): return st[0]
    return vs[0]

# ---------- واژه‌های خاص ----------
FA_NAMES = {'ali': 'علی', 'reza': 'رضا', 'sara': 'سارا', 'maryam': 'مریم', 'mina': 'مینا', 'rasta': 'رَستا', 'ahmadi': 'احمدی', 'karimi': 'کریمی',
            'abbas': 'عباس', 'khodafez': 'خداحافظ', 'taarof': 'تعارف', 'hassan': 'حسن', 'neda': 'ندا', 'amir': 'امیر'}
LETTER = {'US': dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ', ['اِی', 'بی', 'سی', 'دی', 'ای', 'اِف', 'جی', 'اِیچ', 'آی', 'جِی', 'کِی', 'اِل', 'اِم', 'اِن', 'او', 'پی', 'کیو', 'آر', 'اِس', 'تی', 'یو', 'وی', 'دَبِلیو', 'اِکس', 'وای', 'زی'])),
          'UK': dict(zip('ABCDEFGHIJKLMNOPQRSTUVWXYZ', ['اِی', 'بی', 'سی', 'دی', 'ای', 'اِف', 'جی', 'اِیچ', 'آی', 'جِی', 'کِی', 'اِل', 'اِم', 'اِن', 'اِئو', 'پی', 'کیو', 'آ', 'اِس', 'تی', 'یو', 'وی', 'دَبِلیو', 'اِکس', 'وای', 'زِد']))}
ACRO = {'PM', 'AM', 'TV', 'CEO', 'ID', 'ATM', 'CV', 'AI', 'IT', 'HR', 'US', 'UK', 'USA', 'DVD', 'PC', 'SMS', 'VIP', 'DNA', 'BBC', 'CNN', 'GPS', 'PDF', 'FAQ', 'EU', 'UN', 'NBA', 'IQ', 'WC'}
SPECIAL = {'adj': 'adjective', 'gogh': 'go', 'ok': 'okay'}

def numwords(tok, prev):
    if re.fullmatch(r'\d{1,2}:\d{2}', tok):
        h, m = tok.split(':'); m = int(m)
        return num2words(int(h)) + ('' if m == 0 else ' oh ' + num2words(m) if m < 10 else ' ' + num2words(m))
    if tok == '911': return 'nine one one'
    n = int(tok)
    if 1100 <= n <= 2099 and len(tok) == 4 and n % 100 != 0 or n in (1900, 2000) and prev in ('in', 'since', 'of', 'from'):
        return num2words(n, to='year')
    return num2words(n)

def word_fa(w, acc, prev, nxt):
    raw = w; lw = w.lower().replace('’', "'")
    if lw in FA_NAMES: return FA_NAMES[lw]
    if raw.isupper() and len(raw) >= 2 and raw in ACRO: return ' '.join(LETTER[acc][c] for c in raw)
    if len(raw) == 1 and raw.isupper() and raw not in ('I', 'A'): return LETTER[acc][raw]
    if raw == 'A' and nxt is None: return LETTER[acc]['A']
    lw = SPECIAL.get(lw, lw)
    if ' ' in lw: return ' '.join(word_fa(x, acc, prev, nxt) for x in lw.split())
    poss = ''
    if lw not in CMU and lw.endswith("'s"):
        base = SPECIAL.get(lw[:-2], lw[:-2]); last = CMU.get(base, [['Z']])[0][-1]
        poss = 'ز' if re.sub(r'\d', '', last) not in ('P', 'T', 'K', 'F', 'TH', 'S', 'SH', 'CH', 'Z', 'ZH', 'JH') else ('س' if re.sub(r'\d', '', last) in ('P', 'T', 'K', 'F', 'TH') else 'ِز')
        lw = base
    if lw not in CMU: return None
    if acc == 'US': u = cmu_units(pick_cmu(lw, prev, nxt))
    elif lw in BRIT: u = brit_units(pick_brit(lw, prev, nxt))
    else: u = us_to_uk(cmu_units(pick_cmu(lw, prev, nxt)), lw)
    return to_fa(u) + poss

TOK = re.compile(r"\d{1,2}:\d{2}|\d+|[A-Za-z]+(?:['’][A-Za-z]+)*|[.,!?;:…]|\S")
PUNCT = {',': '،', '?': '؟', '.': '.', '!': '!', ';': '؛', ':': ':', '…': '…'}
def sentence_fa(text, acc):
    toks = TOK.findall(text.replace('%', ' percent').replace('$', ' dollar '))
    exp = []
    for i, t in enumerate(toks):
        if t.isdigit() or re.fullmatch(r'\d{1,2}:\d{2}', t):
            exp += numwords(t, exp[-1].lower() if exp else None).replace('-', ' ').replace(',', '').split()
        else: exp.append(t)
    out = []; words = [t for t in exp if re.match(r"[A-Za-z]", t)]
    wi = 0; bad = []
    for t in exp:
        if re.match(r"[A-Za-z]", t):
            prev = words[wi - 1].lower() if wi else None; nxt = words[wi + 1].lower() if wi + 1 < len(words) else None
            f = word_fa(t, acc, prev, nxt); wi += 1
            if f is None: bad.append(t); f = t
            out.append(f)
        elif t in PUNCT:
            if out: out[-1] += PUNCT[t]
        elif t in ('→', '-', '–', '—', '/', '+', '(', ')', '[', ']', '"', '“', '”', "'", '>'): continue
    return re.sub(r'\s+', ' ', ' '.join(out)).strip(), bad

if __name__ == '__main__':
    allbad = set()
    for f in ['pron.json', 'pron-owsa.json', 'pron-owsb.json', 'pron-owsi.json']:
        p = os.path.join(ROOT, 'audio', f); j = json.load(open(p, encoding='utf-8'))
        for acc in ('US', 'UK'):
            for k in list(j[acc]):
                fa, bad = sentence_fa(k, acc); allbad |= set(bad)
                if fa: j[acc][k] = fa
        if '--dry' not in sys.argv: json.dump(j, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('words not in dictionary:', sorted(allbad))
