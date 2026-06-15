import { formatBusRoute } from '../lib/busRoutes.js';
import { normalizeTrainLine, TRAIN_LINES } from '../lib/trainLines.js';

// Each pill is a link to the relevant /line/:id or /route/:id page. Brand
// colors stay loud, so we lean on subtle hover affordance (cursor + slight
// dim) rather than a competing visual cue. Multi-route alerts render one
// pill per route, each with its own destination.
const PILL_BASE =
  'inline-flex items-center min-h-[24px] px-2 py-0.5 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity';

export default function LinePill({ kind, line, routes, linked = true }) {
  const keys = routes?.length > 0 ? routes : [line];
  const chipClass = linked ? PILL_BASE : PILL_BASE.replace('cursor-pointer hover:opacity-80', '');
  const renderChip = (key, href, className, children, props = {}) =>
    linked ? (
      <a key={key} href={href} className={className} {...props}>
        {children}
      </a>
    ) : (
      <span key={key} className={className} {...props}>
        {children}
      </span>
    );
  return (
    <>
      {keys.map((key) => {
        const normalizedKey = kind === 'train' ? normalizeTrainLine(key) : key;
        const info = kind === 'train' ? TRAIN_LINES[normalizedKey] : null;
        if (info) {
          const label = normalizedKey === 'streetcar' ? info.label : `${info.label} Line`;
          return renderChip(key, `/line/${normalizedKey}`, chipClass, label, {
            style: { backgroundColor: info.color, color: info.textColor },
          });
        }
        const busLabel = kind === 'bus' ? formatBusRoute(key) : key;
        return renderChip(
          key,
          kind === 'bus' ? `/route/${key}` : '/',
          `${chipClass} bg-slate-700 text-white max-w-full`,
          <span className="min-w-0 truncate">{busLabel}</span>,
          { title: kind === 'bus' ? busLabel : undefined },
        );
      })}
    </>
  );
}
