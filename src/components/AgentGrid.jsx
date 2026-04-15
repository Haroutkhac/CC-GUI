import { useMemo } from 'react';
import { capitalize } from '../../shared/constants.js';

const PRIORITY_COLORS = {
  4: '#C04040',
  3: '#C08800',
  2: '#3060A0',
  1: '#40A048',
  0: '#808080',
};

const STATUS_COLORS = {
  idle: '#808080',
  active: '#3060A0',
  working: '#40A048',
  waiting: '#C08800',
  completed: '#2ECC71',
  exited: '#C04040',
};

const GRANULAR_LABELS = {
  thinking: 'thinking',
  tool_running: 'running tool',
  responding: 'responding',
  compacting: 'compacting',
  api_retry: 'retrying',
  working: 'working',
  error: 'error',
  waiting: 'waiting for input',
  idle: 'idle',
  active: 'active',
  completed: 'done',
  exited: 'exited',
};

function getGranularLabel(session) {
  const gs = session.granularState;
  const detail = session.stateDetail;
  if (!gs) return session.status;
  if (gs === 'tool_running' && detail?.toolName) return detail.toolName;
  if (gs === 'api_retry' && detail?.retryAttempt) return `retry ${detail.retryAttempt}/${detail.retryMax || '?'}`;
  if (gs === 'error' && detail?.errorType) return detail.errorType.replace(/_/g, ' ');
  return GRANULAR_LABELS[gs] || session.status;
}

const STATE_RANK = { waiting: 0, error: 0, completed: 1, working: 2, active: 2, idle: 3, exited: 4 };

export default function AgentGrid({
  project, sessions, orchestratorQueue, aiSummaries, aiBranches, aiDiffs,
  aiConflicts, prStatuses, onSelectSession, onCreatePR,
}) {
  const cards = useMemo(() => {
    const queueById = new Map((orchestratorQueue || []).map(q => [q.sessionId, q]));
    const conflictMap = {};
    const overlapMap = {};
    if (project) {
      const c = aiConflicts?.[project.id];
      for (const mc of (c?.mergeConflicts || [])) {
        (conflictMap[mc.sessionA] ||= []).push({ with: mc.sessionB, files: mc.conflicts });
        (conflictMap[mc.sessionB] ||= []).push({ with: mc.sessionA, files: mc.conflicts });
      }
      for (const ov of (c?.overlaps || [])) {
        for (const sid of ov.sessionIds) (overlapMap[sid] ||= []).push(ov.file);
      }
    }
    return sessions.map(s => {
      const q = queueById.get(s.id);
      return {
        session: s,
        priority: q?.priority ?? 0,
        reason: q?.reason,
        actionHint: q?.actionHint,
        detectedAt: q?.detectedAt,
        summary: aiSummaries?.[s.id],
        branch: aiBranches?.[s.id],
        diff: aiDiffs?.[s.id],
        prStatus: prStatuses?.[s.id],
        conflicts: conflictMap[s.id],
        overlaps: overlapMap[s.id],
      };
    }).sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      const ra = STATE_RANK[a.session.status] ?? 5;
      const rb = STATE_RANK[b.session.status] ?? 5;
      if (ra !== rb) return ra - rb;
      const ta = a.detectedAt || a.session.lastStateChange || 0;
      const tb = b.detectedAt || b.session.lastStateChange || 0;
      if (tb !== ta) return tb - ta;
      return (a.session.name || '').localeCompare(b.session.name || '');
    });
  }, [sessions, orchestratorQueue, aiSummaries, aiBranches, aiDiffs, aiConflicts, prStatuses, project]);

  if (!project) {
    return (
      <div className="agent-grid-empty">
        <div className="agent-grid-empty-title">NO TABLE SELECTED</div>
        <div className="agent-grid-empty-hint">Pick a table from the top-left to see its Pokemon</div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="agent-grid-empty">
        <div className="agent-grid-empty-title">{project.name?.toUpperCase() || 'TABLE'}</div>
        <div className="agent-grid-empty-hint">No Pokemon at this table yet — press S to spawn one</div>
      </div>
    );
  }

  return (
    <div className="agent-grid">
      {cards.map(c => (
        <AgentCard
          key={c.session.id}
          card={c}
          sessions={sessions}
          onSelect={() => onSelectSession(c.session.id)}
          onCreatePR={onCreatePR}
        />
      ))}
    </div>
  );
}

function AgentCard({ card, sessions, onSelect, onCreatePR }) {
  const { session, priority, reason, summary, branch, diff, prStatus, conflicts, overlaps } = card;
  const statusColor = STATUS_COLORS[session.status] || '#808080';
  const priorityColor = PRIORITY_COLORS[priority];
  const starterName = session.starter ? capitalize(session.starter) : '???';
  const stateLabel = getGranularLabel(session);
  const isWaiting = session.status === 'waiting';
  const isHighPriority = priority >= 3;

  const hasBranch = branch && branch.commitCount > 0;
  const hasFiles = diff?.changedFiles?.length > 0;
  const hasConflicts = conflicts && conflicts.length > 0;
  const hasOverlaps = overlaps && overlaps.length > 0;
  const prDone = prStatus?.status === 'created';
  const prBusy = prStatus?.status && !['created', 'error'].includes(prStatus.status);
  const prError = prStatus?.status === 'error';

  return (
    <button
      className={`agent-card ${isHighPriority ? 'high-priority' : ''} ${isWaiting ? 'urgent' : ''} ${hasConflicts ? 'conflict' : ''}`}
      onClick={onSelect}
      style={{ borderLeftColor: priorityColor }}
    >
      <div className="agent-card-header">
        <span className={`agent-card-dot ${isHighPriority ? 'blink' : ''}`} style={{ background: priorityColor }} />
        <span className="agent-card-name">{starterName}</span>
        <span className="agent-card-session">{session.name}</span>
        {session.sessionType === 'protected_agent' && <span className="agent-card-badge">PROT</span>}
      </div>

      <div className="agent-card-state" style={{ color: statusColor }}>
        <span className="agent-card-state-dot" style={{ background: statusColor }} />
        {stateLabel}
      </div>

      {reason && (
        <div className="agent-card-reason" style={{ color: priorityColor }}>
          {reason}
        </div>
      )}

      {summary?.summary && (
        <div className="agent-card-summary">{summary.summary}</div>
      )}

      {(hasBranch || hasFiles || hasOverlaps || hasConflicts) && (
        <div className="agent-card-git">
          {hasBranch && <span>{branch.commitCount}c</span>}
          {hasFiles && <span>{diff.changedFiles.length}f</span>}
          {hasOverlaps && !hasConflicts && (
            <span className="agent-card-overlap">overlap</span>
          )}
          {hasConflicts && (
            <span className="agent-card-conflict">
              CONFLICT w/ {conflicts.map(c => {
                const o = sessions.find(s => s.id === c.with);
                return o?.starter ? capitalize(o.starter) : '?';
              }).join(', ')}
            </span>
          )}
        </div>
      )}

      {(hasBranch || prDone || prBusy || prError) && (
        <div className="agent-card-pr">
          {prDone && (
            <span className="agent-card-pr-done" onClick={e => { e.stopPropagation(); window.open(prStatus.prUrl, '_blank'); }}>
              PR ✓
            </span>
          )}
          {prBusy && <span className="agent-card-pr-busy">{prStatus.status.toUpperCase()}</span>}
          {prError && <span className="agent-card-pr-error" title={prStatus.error}>PR FAIL</span>}
          {!prDone && !prBusy && hasBranch && session.branch && (
            <span
              className="agent-card-pr-create"
              onClick={e => { e.stopPropagation(); onCreatePR?.(session.id); }}
            >
              CREATE PR
            </span>
          )}
        </div>
      )}
    </button>
  );
}
