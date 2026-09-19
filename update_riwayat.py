import os

with open('src/components/AdminDashboard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

replacements = {
    'bg-slate-900 border-slate-900 text-white font-bold shadow-sm': 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-md shadow-emerald-500/20',
    'bg-white rounded-xl border border-dashed border-slate-300 p-8': 'bg-white rounded-[2rem] border-2 border-dashed border-emerald-100 p-8',
    'w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-4': 'w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 shadow-inner',
    'History className="h-6 w-6 text-slate-450"': 'History className="h-8 w-8 text-emerald-500"',
    'w-full bg-emerald-600 text-white border border-emerald-600 rounded-full text-xs font-black uppercase tracking-widest hover:bg-emerald-700 py-3.5 px-8 transition-all duration-300 active:scale-[0.98] btn-active shadow-md text-center cursor-pointer': 'w-full bg-gradient-to-r from-emerald-600 to-teal-700 text-white border-none rounded-full text-xs font-black uppercase tracking-widest hover:from-emerald-700 hover:to-teal-800 py-3.5 px-8 transition-all duration-300 active:scale-[0.98] btn-active shadow-lg shadow-emerald-900/20 text-center cursor-pointer'
}

for old, new_ in replacements.items():
    content = content.replace(old, new_)

with open('src/components/AdminDashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated UI successfully')
