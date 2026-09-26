#!/usr/bin/env python3
# quilt-murmur charts — one figure, four receipts (SuperInstance palette).
import json, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.font_manager as fm
for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']:
    if os.path.exists(p): fm.fontManager.addfont(p)
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['DejaVu Sans']
plt.rcParams['axes.unicode_minus'] = False

NAVY, INK, GOLD, CORAL, TEAL, VIOLET, GREY = '#13294b', '#1c2b3a', '#e8a33d', '#d45d5d', '#3aa6a6', '#7b6fa8', '#8a97a8'
PAL = [NAVY, GOLD, CORAL, TEAL, VIOLET]
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'experiments', 'outputs')
SITE = os.path.join(HERE, 'site')
os.makedirs(SITE, exist_ok=True)

fig, axes = plt.subplots(2, 2, figsize=(13.5, 9.5), constrained_layout=True)
fig.suptitle('quilt-murmur — the murmur lineage, receipted', fontsize=15, color=INK, weight='bold')

# ── E14: post-flip revenue by arm ──────────────────────────────
ax = axes[0][0]
try:
    s = json.load(open(f'{OUT}/e14_summary.json'))['summaries']
    arms = list(s.keys())
    posts = [s[a]['postRev'] for a in arms]
    sds = [s[a]['postSd'] for a in arms]
    bars = ax.bar(arms, posts, yerr=sds, capsize=4, color=[GREY, PAL[1], PAL[2], PAL[3], PAL[4]], edgecolor=INK, linewidth=0.6)
    ax.set_title('E14 pricing mesh — post-flip revenue (adaptive arms vs fixed)', fontsize=11, color=INK)
    ax.set_ylabel('revenue, rounds 150-300')
    ax.grid(axis='y', alpha=0.25)
    for b, v in zip(bars, posts): ax.text(b.get_x() + b.get_width()/2, v, f'{v/1000:.0f}k', ha='center', va='bottom', fontsize=8, color=INK)
except Exception as e:
    ax.text(0.5, 0.5, f'e14: {e}', ha='center')
    ax.set_title('E14', fontsize=11)

# ── E15: quality vs budget ─────────────────────────────────────
ax = axes[0][1]
try:
    s = json.load(open(f'{OUT}/e15_summary.json'))
    curve = s['curve']  # {arm: {budget: [...], quality: [...]}}
    for i, (name, cur) in enumerate(curve.items()):
        ax.plot(cur['budget'], cur['quality'], color=PAL[i % len(PAL)], label=name, linewidth=1.8)
    ax.legend(fontsize=7.5)
    ax.set_title('E15 adventure gardener — quality vs beat budget (seed 0)', fontsize=11, color=INK)
    ax.set_xlabel('beats generated'); ax.set_ylabel('best branch quality')
    ax.grid(alpha=0.25)
except Exception as e:
    ax.text(0.5, 0.5, f'e15: {e}', ha='center'); ax.set_title('E15', fontsize=11)

# ── E16: consensus error + lie detector ───────────────────────
ax = axes[1][0]
try:
    s = json.load(open(f'{OUT}/e16_summary.json'))
    per = s['perArm']
    names = list(per.keys())
    errs = [per[n]['meanErr'] for n in names]
    ax.bar(names, errs, color=[GREY, TEAL, GOLD, NAVY][:len(names)], edgecolor=INK, linewidth=0.6)
    ax.set_title('E16 resonance consensus — mean |posterior − truth| (20 seeds)', fontsize=11, color=INK)
    q4 = s['questions']['q4']
    ax.text(0.02, 0.93, f"lie detector: r = {q4['meanR_devGt03']:.3f} when a murmur fights\nconsensus vs {q4['meanR_devLt01']:.3f} in agreement (Δ {q4['delta']:+.3f})",
            transform=ax.transAxes, fontsize=8, color=CORAL, weight='bold')
    ax.grid(axis='y', alpha=0.25)
except Exception as e:
    ax.text(0.5, 0.5, f'e16: {e}', ha='center'); ax.set_title('E16', fontsize=11)

# ── E17: cumulative regret by learner ─────────────────────────
ax = axes[1][1]
try:
    s = json.load(open(f'{OUT}/e17_summary.json'))
    learners = s['learners']
    for i, (name, l) in enumerate(learners.items()):
        cur = l.get('regretCurveSeed0') or []
        if cur:
            ax.plot([p['t'] for p in cur], [p['cumRegret'] for p in cur],
                    color=PAL[i % len(PAL)], label=f"{name} ({l['regret']['mean']:+.1f}±{l['regret']['sd']:.1f})", linewidth=1.8)
        else:
            ax.barh(name, l['regret']['mean'], xerr=l['regret']['sd'], color=PAL[i % len(PAL)], edgecolor=INK, linewidth=0.6)
    ax.legend(fontsize=7.5, loc='upper left')
    ax.set_title('E17 gossip trust — cumulative regret vs best fixed expert (seed 0)', fontsize=11, color=INK)
    ax.set_xlabel('round'); ax.set_ylabel('cumulative regret')
    ax.grid(alpha=0.25)
    ax.axhline(0, color=INK, linewidth=0.8, alpha=0.5)
except Exception as e:
    ax.text(0.5, 0.5, f'e17: {e}', ha='center'); ax.set_title('E17', fontsize=11)

out = os.path.join(SITE, 'receipts.png')
fig.savefig(out, dpi=140, facecolor='white')
print('chart ->', out)
