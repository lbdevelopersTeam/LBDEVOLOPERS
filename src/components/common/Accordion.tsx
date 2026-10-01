// Adapted from ddoemonn's Accordion, retrieved through 21st MCP.
// https://21st.dev/@ddoemonn/components/accordion
import { useId, useRef, useState, type ReactNode, type KeyboardEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Plus, Minus } from 'lucide-react';

export type AccordionItem = { id: string; title: string; content: ReactNode };

export default function Accordion({ items }: { items: AccordionItem[] }) {
  const base = useId();
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null);
  const headers = useRef(new Map<string, HTMLButtonElement>());
  const reduced = useReducedMotion();
  const moveFocus = (event: KeyboardEvent, index: number) => {
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length
      : event.key === 'ArrowUp' ? (index - 1 + items.length) % items.length
        : event.key === 'Home' ? 0 : event.key === 'End' ? items.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    headers.current.get(items[next].id)?.focus();
  };
  return <div className="faq-list">
    {items.map((item, index) => {
      const active = open === item.id;
      const headerId = `${base}-header-${item.id}`;
      const panelId = `${base}-panel-${item.id}`;
      return <div key={item.id} className="faq-row">
        <h2>
          <button type="button" id={headerId} aria-expanded={active} aria-controls={panelId}
            ref={(node) => { if (node) headers.current.set(item.id, node); else headers.current.delete(item.id); }}
            onKeyDown={(event) => moveFocus(event, index)} onClick={() => setOpen(active ? null : item.id)}
            className="faq-trigger">
            <span>{item.title}</span>
            {active ? <Minus aria-hidden="true" size={22} /> : <Plus aria-hidden="true" size={22} />}
          </button>
        </h2>
        <div id={panelId} role="region" aria-labelledby={headerId} hidden={!active}>
          <motion.div initial={false} animate={{ opacity: active ? 1 : 0 }} transition={{ duration: reduced ? 0 : 0.18 }} className="faq-answer reading-copy">
            {item.content}
          </motion.div>
        </div>
      </div>;
    })}
  </div>;
}
