import { describe, it, expect } from 'vitest';
import { anonymize, hashForUpload } from '../src/anonymize.js';
import type {
  AssistantRecord,
  AttachmentRecord,
  AiTitleRecord,
  FileHistorySnapshotRecord,
  QueueOperationRecord,
  SystemRecord,
  UserRecord,
} from '../src/types.js';

describe('hashForUpload', () => {
  it('returns a 16-char hex string', () => {
    const h = hashForUpload('any-input-string');
    expect(h).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic', () => {
    expect(hashForUpload('foo')).toBe(hashForUpload('foo'));
  });

  it('produces different hashes for different inputs', () => {
    expect(hashForUpload('a')).not.toBe(hashForUpload('b'));
  });
});

describe('anonymize — record-type filtering', () => {
  it('drops queue-operation records', () => {
    const r: QueueOperationRecord = {
      type: 'queue-operation',
      operation: 'enqueue',
      timestamp: '2026-04-01T10:00:00.000Z',
      sessionId: 'sess-1',
    };
    expect(anonymize(r)).toBeNull();
  });

  it('drops ai-title records (per spec — auto-generated titles leak content)', () => {
    const r: AiTitleRecord = {
      type: 'ai-title',
      sessionId: 'sess-1',
      aiTitle: 'Fix bug in customer dashboard',
    };
    expect(anonymize(r)).toBeNull();
  });

  it('drops file-history-snapshot records (per spec — contains source code backups)', () => {
    const r: FileHistorySnapshotRecord = {
      type: 'file-history-snapshot',
      messageId: 'm-1',
      snapshot: { trackedFileBackups: [{ path: '/etc/passwd', content: 'root:x:0:0' }] },
    };
    expect(anonymize(r)).toBeNull();
  });
});

describe('anonymize — assistant record', () => {
  const baseAssistant: AssistantRecord = {
    type: 'assistant',
    uuid: 'a1',
    parentUuid: 'u1',
    sessionId: 'sess-1',
    timestamp: '2026-04-01T10:00:00.000Z',
    isSidechain: false,
    cwd: 'c:\\Users\\victim\\secret-project',
    version: '2.1.96',
    entrypoint: 'claude-vscode',
    requestId: 'req_001',
    message: {
      id: 'msg_a1',
      type: 'message',
      role: 'assistant',
      model: 'claude-opus-4-6',
      content: [{ type: 'text', text: 'this should never appear in upload payload' }],
      stop_reason: 'end_turn',
      usage: {
        input_tokens: 1000,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 500,
        cache_creation: { ephemeral_5m_input_tokens: 0, ephemeral_1h_input_tokens: 0 },
        output_tokens: 200,
      },
    },
  };

  it('hashes the cwd', () => {
    const out = anonymize(baseAssistant);
    expect(out).not.toBeNull();
    expect(out!.type).toBe('assistant');
    if (out!.type === 'assistant') {
      expect(out.cwdHash).toBe(hashForUpload('c:\\Users\\victim\\secret-project'));
      expect(out.cwdHash).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it('hashes the sessionId', () => {
    const out = anonymize(baseAssistant);
    if (out?.type === 'assistant') {
      expect(out.sessionIdHash).toBe(hashForUpload('sess-1'));
    }
  });

  it('preserves all numeric token counts', () => {
    const out = anonymize(baseAssistant);
    if (out?.type === 'assistant') {
      expect(out.usage.input_tokens).toBe(1000);
      expect(out.usage.cache_read_input_tokens).toBe(500);
      expect(out.usage.output_tokens).toBe(200);
    }
  });

  it('summarizes content blocks without including text', () => {
    const out = anonymize(baseAssistant);
    if (out?.type === 'assistant') {
      expect(out.contentBlocks.length).toBe(1);
      expect(out.contentBlocks[0]!.type).toBe('text');
      expect(out.contentBlocks[0]!.byteSize).toBeGreaterThan(0);
      // Verify the original text isn't in the serialized output anywhere.
      const serialized = JSON.stringify(out);
      expect(serialized).not.toContain('this should never appear in upload payload');
    }
  });

  it('marks synthetic records but still produces a valid payload', () => {
    const synth: AssistantRecord = {
      ...baseAssistant,
      message: { ...baseAssistant.message, model: '<synthetic>' },
    };
    const out = anonymize(synth);
    if (out?.type === 'assistant') {
      expect(out.isSynthetic).toBe(true);
      expect(out.model).toBe('<synthetic>');
    }
  });
});

describe('anonymize — user record with tool_result', () => {
  const userWithToolResult: UserRecord = {
    type: 'user',
    uuid: 'u1',
    sessionId: 'sess-1',
    timestamp: '2026-04-01T10:00:00.000Z',
    cwd: 'c:\\demo',
    promptId: 'prompt-id-1',
    sourceToolAssistantUUID: 'a1',
    toolUseResult: {
      tool_use_id: 'toolu_01',
      content: 'tool output that contains a CANARY-MARKER and should be dropped',
      is_error: false,
    },
    message: {
      role: 'user',
      content: [
        {
          type: 'tool_result',
          tool_use_id: 'toolu_01',
          content: 'tool output that contains a CANARY-MARKER and should be dropped',
          is_error: false,
        },
      ],
    },
  };

  it('drops the actual content but keeps the size', () => {
    const out = anonymize(userWithToolResult);
    if (out?.type === 'user') {
      expect(out.toolUseResultSummary).toBeDefined();
      expect(out.toolUseResultSummary!.toolUseId).toBe('toolu_01');
      expect(out.toolUseResultSummary!.byteSize).toBeGreaterThan(0);
      expect(out.toolUseResultSummary!.isError).toBe(false);

      const serialized = JSON.stringify(out);
      expect(serialized).not.toContain('CANARY-MARKER');
      expect(serialized).not.toContain('tool output that contains');
    }
  });

  it('hashes promptId', () => {
    const out = anonymize(userWithToolResult);
    if (out?.type === 'user') {
      expect(out.promptIdHash).toBe(hashForUpload('prompt-id-1'));
    }
  });
});

describe('anonymize — system record', () => {
  const sys: SystemRecord = {
    type: 'system',
    uuid: 'sys1',
    sessionId: 'sess-1',
    timestamp: '2026-04-01T10:00:00.000Z',
    subtype: 'api_error',
    level: 'error',
    cause: { code: 'ECONNRESET', errno: -4077, path: '/secret/path/should/not/leak' },
    error: { type: 'ConnectionError', cause: { stack: 'at /secret/file.ts:42' } },
    retryInMs: 500,
    retryAttempt: 2,
    maxRetries: 10,
  };

  it('keeps numeric retry fields and error metadata but drops paths', () => {
    const out = anonymize(sys);
    if (out?.type === 'system') {
      expect(out.subtype).toBe('api_error');
      expect(out.level).toBe('error');
      expect(out.errorCode).toBe('ECONNRESET');
      expect(out.errorErrno).toBe(-4077);
      expect(out.errorType).toBe('ConnectionError');
      expect(out.retryInMs).toBe(500);
      expect(out.retryAttempt).toBe(2);
      expect(out.maxRetries).toBe(10);

      const serialized = JSON.stringify(out);
      expect(serialized).not.toContain('/secret/path/should/not/leak');
      expect(serialized).not.toContain('/secret/file.ts');
    }
  });
});

describe('anonymize — attachment record', () => {
  it('counts files but drops names', () => {
    const att: AttachmentRecord = {
      type: 'attachment',
      uuid: 'att1',
      sessionId: 'sess-1',
      timestamp: '2026-04-01T10:00:00.000Z',
      attachment: {
        addedNames: ['/secret/customer-list.csv', '/secret/employee-salaries.xlsx'],
        addedLines: 100,
        removedNames: [],
        removedLines: 0,
      },
    };
    const out = anonymize(att);
    if (out?.type === 'attachment') {
      expect(out.addedFileCount).toBe(2);
      expect(out.addedLines).toBe(100);
      expect(out.removedFileCount).toBe(0);

      const serialized = JSON.stringify(out);
      expect(serialized).not.toContain('customer-list.csv');
      expect(serialized).not.toContain('employee-salaries');
    }
  });
});
