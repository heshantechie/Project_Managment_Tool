import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { UserMenu } from './components/auth/UserMenu';

const S = {
    get(k: string) { try { return JSON.parse(localStorage.getItem(k) || 'null') || null } catch { return null } },
    set(k: string, v: any) { localStorage.setItem(k, JSON.stringify(v)) }
};

const db = {
    async fetch(table: string) {
        const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: true });
        if (error) console.error(error);
        return data || [];
    },
    async insert(table: string, record: any) {
        const { data, error } = await supabase.from(table).insert([record]).select();
        if (error) console.error(error);
        return data ? data[0] : null;
    },
    async update(table: string, id: any, updates: any) {
        const { data, error } = await supabase.from(table).update(updates).eq('id', id).select();
        if (error) console.error(error);
        return data ? data[0] : null;
    },
    async remove(table: string, id: any) {
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) console.error(error);
    }
};

const fmt = (d: string) => { if (!d) return '—'; const dt = new Date(d + 'T00:00:00'); return dt.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) };

const CARD_DEFS = [
    { key: 'tasks', label: 'Tasks', color: 'var(--blue)', bg: 'var(--blue-light)', tc: 'var(--blue-text)', dateField: 'date_value', dateName: 'Deadline' },
    { key: 'marketing_ideas', label: 'Marketing Ideas', color: 'var(--purple)', bg: 'var(--purple-light)', tc: 'var(--purple-text)', dateField: 'date_value', dateName: 'Scheduled Date' },
    { key: 'completed_tasks', label: 'Completed Marketing Tasks', color: 'var(--green)', bg: 'var(--green-light)', tc: 'var(--green-text)', dateField: 'date_value', dateName: 'Completed Date' },
    { key: 'portfolio', label: 'Portfolio', color: 'var(--coral)', bg: 'var(--coral-light)', tc: 'var(--coral-text)' },
    { key: 'ideas', label: 'Ideas', color: 'var(--rose)', bg: 'var(--rose-light)', tc: 'var(--rose-text)' },
    { key: 'new_projects', label: 'New Projects', color: 'var(--blue)', bg: 'var(--blue-light)', tc: 'var(--blue-text)', dateField: 'date_value', dateName: 'Deadline' },
    { key: 'new_implementations', label: 'New Implementations', color: 'var(--lime)', bg: 'var(--lime-light)', tc: 'var(--lime-text)', dateField: 'date_value', dateName: 'Deadline' },
    { key: 'recruiting', label: 'Recruiting', color: 'var(--amber)', bg: 'var(--amber-light)', tc: 'var(--amber-text)' },
    { key: 'collaborations', label: 'Collaborations', color: 'var(--teal)', bg: 'var(--teal-light)', tc: 'var(--teal-text)' },
    { key: 'clients', label: 'Clients', color: 'var(--purple)', bg: 'var(--purple-light)', tc: 'var(--purple-text)' },
    { key: 'financial', label: 'Financial', color: 'var(--green)', bg: 'var(--green-light)', tc: 'var(--green-text)' },
];

const PROJ_SECTIONS = [
    { key: 'tasks', label: 'Tasks', dateField: 'date_value', dateName: 'Deadline', color: 'var(--purple)', bg: 'var(--purple-light)', tc: 'var(--purple-text)' },
    { key: 'improvements', label: 'Improvements', dateField: 'date_value', dateName: 'Deadline', color: 'var(--green)', bg: 'var(--green-light)', tc: 'var(--green-text)' },
    { key: 'new_features', label: 'New Features', dateField: 'date_value', dateName: 'Deadline', color: 'var(--blue)', bg: 'var(--blue-light)', tc: 'var(--blue-text)' },
    { key: 'ideas', label: 'Ideas', color: 'var(--rose)', bg: 'var(--rose-light)', tc: 'var(--rose-text)' },
    { key: 'bugs', label: 'Bugs', dateField: 'date_value', dateName: 'Solved Date', color: 'var(--coral)', bg: 'var(--coral-light)', tc: 'var(--coral-text)' },
];

const COLORS = [
    { color: 'var(--purple)', bg: 'var(--purple-light)', tc: 'var(--purple-text)' },
    { color: 'var(--green)', bg: 'var(--green-light)', tc: 'var(--green-text)' },
    { color: 'var(--coral)', bg: 'var(--coral-light)', tc: 'var(--coral-text)' },
    { color: 'var(--pink)', bg: 'var(--pink-light)', tc: 'var(--pink-text)' },
    { color: 'var(--blue)', bg: 'var(--blue-light)', tc: 'var(--blue-text)' },
    { color: 'var(--lime)', bg: 'var(--lime-light)', tc: 'var(--lime-text)' },
    { color: 'var(--amber)', bg: 'var(--amber-light)', tc: 'var(--amber-text)' },
    { color: 'var(--teal)', bg: 'var(--teal-light)', tc: 'var(--teal-text)' },
    { color: 'var(--rose)', bg: 'var(--rose-light)', tc: 'var(--rose-text)' }
];

function DeleteConfirmModal({ title, expectedName, onConfirm, onClose }: any) {
    const [input, setInput] = useState('');
    return <Modal title={title} onClose={onClose}>
        <p style={{ marginBottom: 10, fontSize: 13, color: 'var(--text2)', lineHeight: 1.5 }}>
            Are you sure you want to delete? Please type <strong style={{ color: 'var(--text)' }}>{expectedName}</strong> to confirm.
        </p>
        <div className="field-group">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder={expectedName} autoFocus />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" style={{ background: 'var(--pink)' }} disabled={input !== expectedName} onClick={() => {
                if (input === expectedName) onConfirm();
            }}>Delete</button>
        </div>
    </Modal>;
}

function AddCardModal({ title, onSave, onClose }: any) {
    const [name, setName] = useState('');
    return <Modal title={title} onClose={onClose}>
        <div className="field-group">
            <label className="field-label">Card Name *</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. New Feature" autoFocus onKeyDown={e => {
                if (e.key === 'Enter' && name.trim()) { onSave(name.trim()); onClose(); }
            }} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={() => {
                if (name.trim()) { onSave(name.trim()); onClose(); }
            }}>Add</button>
        </div>
    </Modal>;
}

function Modal({ title, onClose, children }: any) {
    return <div className="overlay" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="modal">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', fontFamily: 'Syne, sans-serif' }}>{title}</h3>
                <button className="icon-btn" onClick={onClose} style={{ fontSize: 18, color: 'var(--text2)' }}>✕</button>
            </div>
            {children}
        </div>
    </div>;
}

function ItemForm({ item, dateField, dateName, onSave, onClose }: any) {
    const [f, setF] = useState<any>({ title: item?.title || '', description: item?.description || '', [dateField || '__d']: item?.[dateField] || '' });
    const df = dateField || '__d';
    return <div>
        <div className="field-group">
            <label className="field-label">Title *</label>
            <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} placeholder="Enter title..." />
        </div>
        <div className="field-group">
            <label className="field-label">Description</label>
            <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Enter description..." />
        </div>
        {dateField && <div className="field-group">
            <label className="field-label">{dateName}</label>
            <input type="date" value={f[df] || ''} onChange={e => setF({ ...f, [df]: e.target.value })} />
        </div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={() => {
                if (!f.title.trim()) return;
                const payload = { ...f };
                if (dateField && !payload[dateField]) payload[dateField] = null;
                if (!payload.description) payload.description = null;
                delete payload['__d'];
                onSave(payload);
                onClose();
            }}>Save</button>
        </div>
    </div>;
}

function ProjectForm({ proj, onSave, onClose }: any) {
    const [f, setF] = useState({ name: proj?.name || '', description: proj?.description || '' });
    return <div>
        <div className="field-group">
            <label className="field-label">Project Name *</label>
            <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} placeholder="e.g. Talvorax" />
        </div>
        <div className="field-group">
            <label className="field-label">Description</label>
            <textarea value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="What is this project about?" />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
            <button className="btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn-primary" onClick={() => {
                if (!f.name.trim()) return;
                const payload = { ...f };
                if (!payload.description) payload.description = null;
                onSave(payload);
                onClose();
            }}>Save</button>
        </div>
    </div>;
}

function DashCard({ def, data, onSave, onDel, onComplete, onDelCard }: any) {
    const items = data || [];
    const [modal, setModal] = useState<any>(null);
    return <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 9, height: 9, borderRadius: '50%', background: def.color, flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{def.label}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 11, color: 'var(--text3)', fontWeight: 500 }}>{items.length}</span>
                <button onClick={() => setModal({ type: 'add' })} style={{ background: def.bg, color: def.tc, padding: '3px 9px', borderRadius: 6, fontSize: 12, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add</button>
                {onDelCard && <button onClick={() => onDelCard(def)} className="icon-btn" style={{ color: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }} title="Delete Card">✕</button>}
            </div>
        </div>
        {items.length === 0 && <p className="empty">No items yet</p>}
        <div className="items-list">
            {items.map((it: any) => <div key={it.id} style={{ background: def.bg, borderRadius: 8, padding: '9px 11px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 500, color: def.tc, flex: 1, lineHeight: 1.35 }}>{it.title}</span>
                    <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
                        {!def.key.startsWith('completed_') && def.key !== 'completed_tasks' && onComplete && (
                            <button className="icon-btn" onClick={() => onComplete(it)} style={{ color: def.tc, opacity: 0.8 }} title="Complete">✓</button>
                        )}
                        <button className="icon-btn" onClick={() => setModal({ type: 'edit', item: it })} style={{ color: def.tc, opacity: 0.75 }}>✎</button>
                        <button className="icon-btn" onClick={() => onDel(it.id)} style={{ color: 'var(--pink)' }}>✕</button>
                    </div>
                </div>
                {it.description && <p style={{ fontSize: 11, color: def.tc, opacity: 0.7, marginTop: 3, lineHeight: 1.4 }}>{it.description}</p>}
                {def.dateField && it[def.dateField] && <p style={{ fontSize: 10, color: def.tc, opacity: 0.55, marginTop: 4, fontWeight: 500 }}>{def.dateName}: {fmt(it[def.dateField])}</p>}
            </div>)}
        </div>
        {modal && <Modal title={modal.type === 'add' ? `Add — ${def.label}` : 'Edit Item'} onClose={() => setModal(null)}>
            <ItemForm item={modal.item} dateField={def.dateField} dateName={def.dateName} onSave={(f: any) => { onSave(f, modal.item?.id); setModal(null); }} onClose={() => setModal(null)} />
        </Modal>}
    </div>;
}

function ProjectSection({ sec, data, onSave, onDel, onComplete, onDelCard }: any) {
    const items = data || [];
    const [modal, setModal] = useState<any>(null);
    return <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: sec.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{sec.label}</span>
                <span style={{ fontSize: 11, color: 'var(--text3)' }}>({items.length})</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button onClick={() => setModal({ type: 'add' })} style={{ background: sec.bg, color: sec.tc, padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>+ Add</button>
                {onDelCard && <button onClick={() => onDelCard(sec)} className="icon-btn" style={{ color: 'var(--pink)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: 24, height: 24 }} title="Delete Section">✕</button>}
            </div>
        </div>
        {items.length === 0 && <p className="empty">Empty</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {items.map((it: any) => <div key={it.id} style={{ background: sec.bg, borderRadius: 7, padding: '8px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <span style={{ fontSize: 12, fontWeight: 500, color: sec.tc, flex: 1, lineHeight: 1.35 }}>{it.title}</span>
                    <div style={{ display: 'flex', gap: 2, marginLeft: 6 }}>
                        {!sec.key.startsWith('completed_') && onComplete && (
                            <button className="icon-btn" onClick={() => onComplete(it)} style={{ color: sec.tc, opacity: 0.8 }} title="Complete">✓</button>
                        )}
                        <button className="icon-btn" onClick={() => setModal({ type: 'edit', item: it })} style={{ color: sec.tc, opacity: 0.8 }}>✎</button>
                        <button className="icon-btn" onClick={() => onDel(it.id)} style={{ color: 'var(--pink)' }}>✕</button>
                    </div>
                </div>
                {it.description && <p style={{ fontSize: 11, color: sec.tc, opacity: 0.65, marginTop: 2, lineHeight: 1.4 }}>{it.description}</p>}
                {sec.dateField && it[sec.dateField] && <p style={{ fontSize: 10, color: sec.tc, opacity: 0.5, marginTop: 3, fontWeight: 500 }}>{sec.dateName}: {fmt(it[sec.dateField])}</p>}
            </div>)}
        </div>
        {modal && <Modal title={modal.type === 'add' ? `Add ${sec.label}` : 'Edit'} onClose={() => setModal(null)}>
            <ItemForm item={modal.item} dateField={sec.dateField} dateName={sec.dateName} onSave={(f: any) => { onSave(f, modal.item?.id); setModal(null); }} onClose={() => setModal(null)} />
        </Modal>}
    </div>;
}

function ProjectDetail({ project, projSecsDef, onBack, saveProjectItem, delProjectItem, completeProjectItem, setDelCardPrompt, setAddCardModal }: any) {
    const sections = project.sections || {};
    const total = Object.values(sections).reduce((s: any, a: any) => s + (a?.length || 0), 0) as number;
    return <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 22 }}>
            <button className="btn-back" onClick={onBack}>← Back</button>
            <div>
                <h1 className="page-title">{project.name}</h1>
                {project.description && <p className="page-sub">{project.description}</p>}
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 12, color: 'var(--text3)', fontWeight: 500 }}>{total} items total</span>
                <button className="btn-primary" onClick={() => setAddCardModal('project')}>+ Add Card</button>
            </div>
        </div>
        <div className="sec-grid">
            {projSecsDef.map((sec: any) => <ProjectSection key={sec.key} sec={sec} data={sections[sec.key]} onSave={(f: any, editId: any) => saveProjectItem(project.id, sec.key, f, editId)} onDel={(id: any) => delProjectItem(project.id, sec.key, id)} onComplete={(it: any) => completeProjectItem(project.id, sec.key, it)} onDelCard={() => setDelCardPrompt({ type: 'project', item: sec })} />)}
        </div>
        {Object.keys(sections).some(k => k.startsWith('completed_') && sections[k].length > 0) && (
            <div style={{ marginTop: 40 }}>
                <h2 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>Completed Items</h2>
                <div className="sec-grid">
                    {projSecsDef.map((sec: any) => {
                        const k = 'completed_' + sec.key;
                        if (!sections[k] || sections[k].length === 0) return null;
                        return <ProjectSection key={k} sec={{ ...sec, key: k, label: 'Completed ' + sec.label }} data={sections[k]} onSave={(f: any, editId: any) => saveProjectItem(project.id, k, f, editId)} onDel={(id: any) => delProjectItem(project.id, k, id)} />;
                    })}
                </div>
            </div>
        )}
    </div>;
}

export default function Dashboard() {
    const [view, setView] = useState('dashboard');
    const [activeProject, setActiveProject] = useState<any>(null);
    const [cardData, setCardData] = useState<any>({});
    const [projects, setProjects] = useState<any[]>([]);
    const [projModal, setProjModal] = useState(false);
    const [editProj, setEditProj] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const [dashCardsDef, setDashCardsDef] = useState<any[]>(() => S.get('vt_dash_cards') || CARD_DEFS);
    const [projSecsDef, setProjSecsDef] = useState<any[]>(() => S.get('vt_proj_secs') || PROJ_SECTIONS);

    const [addCardModal, setAddCardModal] = useState<any>(null);
    const [delCardPrompt, setDelCardPrompt] = useState<any>(null);

    useEffect(() => {
        async function load() {
            setLoading(true);
            try {
                const [dItems, pList, pItems] = await Promise.all([
                    db.fetch('dashboard_items'),
                    db.fetch('projects'),
                    db.fetch('project_items')
                ]);

                const cd: any = {};
                dItems.forEach((it: any) => {
                    if (!cd[it.category]) cd[it.category] = [];
                    cd[it.category].push(it);
                });
                setCardData(cd);

                const pr = pList.map((p: any) => {
                    const sections: any = {};
                    pItems.filter((i: any) => i.project_id === p.id).forEach((i: any) => {
                        if (!sections[i.section]) sections[i.section] = [];
                        sections[i.section].push(i);
                    });
                    return { ...p, sections };
                });
                setProjects(pr);
            } catch (err) { console.error(err); }
            setLoading(false);
        }
        load();
    }, []);

    const saveCardItem = async (category: string, f: any, editId: any) => {
        if (editId) {
            const res = await db.update('dashboard_items', editId, f);
            if (res) {
                setCardData((prev: any) => {
                    const arr = prev[category] || [];
                    return { ...prev, [category]: arr.map((x: any) => x.id === editId ? res : x) };
                });
            }
        } else {
            const res = await db.insert('dashboard_items', { ...f, category });
            if (res) {
                setCardData((prev: any) => ({ ...prev, [category]: [...(prev[category] || []), res] }));
            }
        }
    };

    const delCardItem = async (category: string, id: any) => {
        await db.remove('dashboard_items', id);
        setCardData((prev: any) => ({ ...prev, [category]: (prev[category] || []).filter((x: any) => x.id !== id) }));
    };

    const completeCardItem = async (category: string, it: any) => {
        const newCat = 'completed_' + category;
        const res = await db.update('dashboard_items', it.id, { category: newCat });
        if (res) {
            setCardData((prev: any) => {
                const st = { ...prev };
                st[category] = (st[category] || []).filter((x: any) => x.id !== it.id);
                st[newCat] = [...(st[newCat] || []), res];
                return st;
            });
        }
    };

    const saveProjectItem = async (projectId: string, section: string, f: any, editId: any) => {
        if (editId) {
            const res = await db.update('project_items', editId, f);
            if (res) {
                setProjects((prev: any) => prev.map((p: any) => {
                    if (p.id !== projectId) return p;
                    const arr = p.sections[section] || [];
                    return { ...p, sections: { ...p.sections, [section]: arr.map((x: any) => x.id === editId ? res : x) } };
                }));
                if (activeProject && activeProject.id === projectId) {
                    setActiveProject((prev: any) => {
                        const arr = prev.sections[section] || [];
                        return { ...prev, sections: { ...prev.sections, [section]: arr.map((x: any) => x.id === editId ? res : x) } };
                    });
                }
            }
        } else {
            const res = await db.insert('project_items', { ...f, section, project_id: projectId });
            if (res) {
                setProjects((prev: any) => prev.map((p: any) => {
                    if (p.id !== projectId) return p;
                    return { ...p, sections: { ...p.sections, [section]: [...(p.sections[section] || []), res] } };
                }));
                if (activeProject && activeProject.id === projectId) {
                    setActiveProject((prev: any) => ({ ...prev, sections: { ...prev.sections, [section]: [...(prev.sections[section] || []), res] } }));
                }
            }
        }
    };

    const delProjectItem = async (projectId: string, section: string, id: any) => {
        await db.remove('project_items', id);
        setProjects((prev: any) => prev.map((p: any) => {
            if (p.id !== projectId) return p;
            return { ...p, sections: { ...p.sections, [section]: (p.sections[section] || []).filter((x: any) => x.id !== id) } };
        }));
        if (activeProject && activeProject.id === projectId) {
            setActiveProject((prev: any) => ({ ...prev, sections: { ...prev.sections, [section]: (prev.sections[section] || []).filter((x: any) => x.id !== id) } }));
        }
    };

    const completeProjectItem = async (projectId: string, section: string, it: any) => {
        const newSec = 'completed_' + section;
        const res = await db.update('project_items', it.id, { section: newSec });
        if (res) {
            setProjects((prev: any) => prev.map((p: any) => {
                if (p.id !== projectId) return p;
                return {
                    ...p,
                    sections: {
                        ...p.sections,
                        [section]: (p.sections[section] || []).filter((x: any) => x.id !== it.id),
                        [newSec]: [...(p.sections[newSec] || []), res]
                    }
                };
            }));
            if (activeProject && activeProject.id === projectId) {
                setActiveProject((prev: any) => ({
                    ...prev,
                    sections: {
                        ...prev.sections,
                        [section]: (prev.sections[section] || []).filter((x: any) => x.id !== it.id),
                        [newSec]: [...(prev.sections[newSec] || []), res]
                    }
                }));
            }
        }
    };

    const saveProject = async (f: any, editId: any) => {
        if (editId) {
            const res = await db.update('projects', editId, f);
            if (res) setProjects((prev: any) => prev.map((p: any) => p.id === editId ? { ...p, ...res } : p));
        } else {
            const res = await db.insert('projects', f);
            if (res) setProjects((prev: any) => [...prev, { sections: {}, ...res }]);
        }
    };

    const delProject = async (id: any) => {
        if (!confirm('Delete this project?')) return;
        await db.remove('projects', id);
        setProjects((prev: any) => prev.filter((p: any) => p.id !== id));
        if (activeProject?.id === id) setView('projects');
    };

    const handleAddCard = (name: string) => {
        const style = COLORS[Math.floor(Math.random() * COLORS.length)];
        if (addCardModal === 'dashboard') {
            const newDef = { key: 'custom_dash_' + Date.now(), label: name, dateField: 'date_value', dateName: 'Date', ...style };
            const next = [...dashCardsDef, newDef];
            setDashCardsDef(next);
            S.set('vt_dash_cards', next);
        } else if (addCardModal === 'project') {
            const newDef = { key: 'custom_proj_' + Date.now(), label: name, dateField: 'date_value', dateName: 'Date', ...style };
            const next = [...projSecsDef, newDef];
            setProjSecsDef(next);
            S.set('vt_proj_secs', next);
        }
    };

    const handleConfirmDelCard = () => {
        if (delCardPrompt.type === 'dashboard') {
            const next = dashCardsDef.filter(c => c.key !== delCardPrompt.item.key);
            setDashCardsDef(next);
            S.set('vt_dash_cards', next);
        } else if (delCardPrompt.type === 'project') {
            const next = projSecsDef.filter(c => c.key !== delCardPrompt.item.key);
            setProjSecsDef(next);
            S.set('vt_proj_secs', next);
        }
        setDelCardPrompt(null);
    };

    const openProject = (p: any) => { setActiveProject(p); setView('project') };
    const navTo = (v: string) => { setView(v) };

    return <div>
        <nav style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg,var(--purple),var(--rose))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ color: '#fff', fontSize: 15, fontFamily: 'Syne,sans-serif', fontWeight: 700 }}>V</span>
                </div>
                <span style={{ fontSize: 17, fontWeight: 700, fontFamily: 'Syne,sans-serif', color: 'var(--text)', letterSpacing: '-0.3px' }}>Ve</span>
            </div>
            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                <button className={`nav-btn${view === 'dashboard' ? ' active' : ''}`} onClick={() => navTo('dashboard')}>Dashboard</button>
                <button className={`nav-btn${view === 'projects' || view === 'project' ? ' active' : ''}`} onClick={() => navTo('projects')}>Projects</button>
                <div style={{ width: 1, height: 24, background: 'var(--border)', margin: '0 8px' }}></div>
                <UserMenu />
            </div>
        </nav>

        <div style={{ padding: '24px', maxWidth: 1200, margin: '0 auto' }}>
            {loading ? <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text3)' }}>Loading data...</div> : <>
                {view === 'dashboard' && <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                        <div>
                            <h1 className="page-title">Dashboard</h1>
                            <p className="page-sub">Manage your marketing, ideas, clients, and more</p>
                        </div>
                        <button className="btn-primary" onClick={() => setAddCardModal('dashboard')}>+ Add Card</button>
                    </div>
                    <div className="dash-grid">
                        {dashCardsDef.map(def => <DashCard key={def.key} def={def} data={cardData[def.key]} onSave={(f: any, editId: any) => saveCardItem(def.key, f, editId)} onDel={(id: any) => delCardItem(def.key, id)} onComplete={(it: any) => completeCardItem(def.key, it)} onDelCard={() => setDelCardPrompt({ type: 'dashboard', item: def })} />)}
                    </div>

                    {Object.keys(cardData).some(k => k.startsWith('completed_') && k !== 'completed_tasks' && cardData[k].length > 0) && (
                        <div style={{ marginTop: 40 }}>
                            <h2 className="page-title" style={{ fontSize: 18, marginBottom: 16 }}>Completed Items</h2>
                            <div className="dash-grid">
                                {dashCardsDef.map(def => {
                                    if (def.key === 'completed_tasks') return null;
                                    const k = 'completed_' + def.key;
                                    if (!cardData[k] || cardData[k].length === 0) return null;
                                    return <DashCard key={k} def={{ ...def, key: k, label: 'Completed ' + def.label }} data={cardData[k]} onSave={(f: any, editId: any) => saveCardItem(k, f, editId)} onDel={(id: any) => delCardItem(k, id)} />;
                                })}
                            </div>
                        </div>
                    )}
                </>}

                {view === 'projects' && <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 }}>
                        <div>
                            <h1 className="page-title">Projects Managed by Ve</h1>
                            <p className="page-sub">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
                        </div>
                        <button className="btn-primary" onClick={() => { setEditProj(null); setProjModal(true) }}>+ New Project</button>
                    </div>
                    {projects.length === 0 && <div className="card" style={{ textAlign: 'center', padding: 40 }}>
                        <p style={{ color: 'var(--text3)', fontSize: 14 }}>No projects yet — create your first one!</p>
                    </div>}
                    <div className="proj-grid">
                        {projects.map((p: any) => {
                            const total = Object.values(p.sections || {}).reduce((s: any, a: any) => s + (a?.length || 0), 0);
                            const initials = p.name ? p.name.split(' ').map((w: any) => w[0]).join('').slice(0, 2).toUpperCase() : 'P';
                            return <div key={p.id} className="card" style={{ cursor: 'pointer' }}
                                onClick={() => openProject(p)}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple)'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(108,92,231,0.12)' }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--purple-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: 'var(--purple-text)', fontFamily: 'Syne,sans-serif' }}>{initials}</div>
                                    <div style={{ display: 'flex', gap: 2 }} onClick={e => e.stopPropagation()}>
                                        <button className="icon-btn" onClick={e => { e.stopPropagation(); setEditProj(p); setProjModal(true) }} style={{ color: 'var(--text2)' }}>✎</button>
                                        <button className="icon-btn" onClick={e => { e.stopPropagation(); delProject(p.id) }} style={{ color: 'var(--pink)' }}>✕</button>
                                    </div>
                                </div>
                                <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text)', marginBottom: 4, fontFamily: 'Syne,sans-serif' }}>{p.name}</h3>
                                {p.description && <p style={{ fontSize: 12, color: 'var(--text2)', marginBottom: 10, lineHeight: 1.5 }}>{p.description}</p>}
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
                                    {projSecsDef.map(s => { const cnt = (p.sections?.[s.key] || []).length; return cnt > 0 && <span key={s.key} className="pill" style={{ background: s.bg, color: s.tc }}>{s.label}: {cnt}</span> })}
                                    {total === 0 && <span style={{ fontSize: 11, color: 'var(--text3)' }}>No items yet — click to add</span>}
                                </div>
                            </div>;
                        })}
                    </div>
                    {projModal && <Modal title={editProj ? 'Edit Project' : 'New Project'} onClose={() => { setProjModal(false); setEditProj(null) }}>
                        <ProjectForm proj={editProj} onSave={(f: any) => { saveProject(f, editProj?.id); setProjModal(false); setEditProj(null) }} onClose={() => { setProjModal(false); setEditProj(null) }} />
                    </Modal>}
                </>}

                {view === 'project' && activeProject && <ProjectDetail project={activeProject} projSecsDef={projSecsDef} onBack={() => setView('projects')} saveProjectItem={saveProjectItem} delProjectItem={delProjectItem} completeProjectItem={completeProjectItem} setDelCardPrompt={setDelCardPrompt} setAddCardModal={setAddCardModal} />}

                {addCardModal && <AddCardModal title={`New ${addCardModal === 'dashboard' ? 'Dashboard' : 'Project'} Card`} onSave={handleAddCard} onClose={() => setAddCardModal(null)} />}
                {delCardPrompt && <DeleteConfirmModal title="Delete Card" expectedName={delCardPrompt.item.label} onConfirm={handleConfirmDelCard} onClose={() => setDelCardPrompt(null)} />}
            </>}
        </div>
    </div>;
}
