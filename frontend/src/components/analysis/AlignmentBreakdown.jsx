import React from "react";
import { ThumbsUp, ThumbsDown, AlertTriangle } from "lucide-react";

const SECTIONS = [
  { key: "good", label: "Good", icon: ThumbsUp, color: "green", field: "note", border: "border-green-900/50 bg-green-950/20", title: "text-green-300", iconColor: "text-green-400" },
  { key: "bad",  label: "Bad",  icon: ThumbsDown, color: "yellow", field: "fix", border: "border-yellow-900/50 bg-yellow-950/20", title: "text-yellow-300", iconColor: "text-yellow-400" },
  { key: "ugly", label: "Ugly", icon: AlertTriangle, color: "red", field: "fix", border: "border-red-900/50 bg-red-950/20", title: "text-red-300", iconColor: "text-red-400" },
];

const itemKey = (section, item, i) => `${section}-${item.component || "x"}-${i}`;

export default function AlignmentBreakdown({ alignment }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10" data-testid="alignment-section">
      {SECTIONS.map(({ key, label, icon: Icon, field, border, title, iconColor }) => (
        <div key={key} className={`p-5 border rounded-sm ${border}`}>
          <div className="flex items-center gap-2 mb-3">
            <Icon size={16} className={iconColor} />
            <span className={`text-sm font-semibold ${title}`}>{label}</span>
          </div>
          <ul className="space-y-2 text-sm">
            {(alignment[key] || []).map((g, i) => (
              <li key={itemKey(key, g, i)} className="text-neutral-200" data-testid={`${key}-${i}`}>
                <span className="text-xs mono text-neutral-500 uppercase">{g.component}</span>
                <div>{g[field] || g.note || g.fix}</div>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
