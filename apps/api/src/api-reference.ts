import type { INestApplication } from '@nestjs/common';
import { ModulesContainer } from '@nestjs/core';
import type { OpenAPIObject, OperationObject } from '@nestjs/swagger';

/** Document the same authentication boundary the installed guards enforce. */
export function upgradeApiReference(
  app: INestApplication,
  document: OpenAPIObject,
  plane: 'tenant' | 'provider',
) {
  const publicOperations = new Set<string>();
  for (const module of app.get(ModulesContainer).values()) {
    for (const wrapper of module.controllers.values()) {
      const instance = wrapper.instance as object | undefined;
      if (!instance) continue;
      const prototype = Object.getPrototypeOf(instance) as Record<
        string,
        unknown
      >;
      for (const name of Object.getOwnPropertyNames(prototype)) {
        const handler = prototype[name];
        if (
          typeof handler === 'function' &&
          (Reflect.getMetadata('isPublic', handler) ||
            Reflect.getMetadata('isPublic', instance.constructor))
        )
          publicOperations.add(`${instance.constructor.name}_${name}`);
      }
    }
  }
  document.info.version = '1.1.0';
  document.info.description =
    plane === 'tenant'
      ? 'EverGreen operational API. Configure issuer details, receive material, record production, review stock, issue invoices and record payments.\n\n**Access:** protected routes require a staff JWT and active owner-signed installation. VIEWER reads; MODIFIER changes permitted records; ADMIN manages privileged actions. Public shop and AI routes still require activation.\n\n**New:** Loom/Weave/Scout AI guidance, persistent helpdesk tickets, CSV import/history and Tally XML export. AI sends only the supplied conversation to Groq and cannot execute operations.\n\n**Errors:** 400 validation; 401 sign-in; 403 role/scope; 409 concurrency or duplicate key; 429 limits; 502 AI failure; 503 activation/setup. Reuse request keys for unchanged ticket/import retries. Try it out executes real requests.'
      : 'EverGreen owner control API. Tenant databases and staff JWTs are separate from this provider plane.\n\n**Access:** owner bearer credential or an eight-hour HttpOnly cookie from POST /auth/provider/session. Cookie mutations require an allowed Origin. ADMIN installation scope is also required. Signing keys are never returned.\n\n**New:** Atlas advisory assistant and live read-only provider database/schema diagnostics. Subscription records do not issue signed activation files.\n\n**Device renewal:** POST /licensing/lease requires signed grant, device proof, nonce and timestamp, not an owner bearer key.\n\nTry it out executes real operations. 401 authentication; 403 scope/origin; 409 refresh; 429 wait; 502 AI provider failure; 503 activation/configuration.';
  document.components ||= {};
  document.components.securitySchemes ||= {};
  if (plane === 'provider')
    document.components.securitySchemes['provider-session'] = {
      type: 'apiKey',
      in: 'cookie',
      name: 'evergreen_provider_session',
      description:
        'Eight-hour HttpOnly session created by POST /auth/provider/session. Browser mutations also require an allowed Origin. Prefer this session for the console.',
    };
  for (const [path, item] of Object.entries(document.paths)) {
    if (!item) continue;
    for (const method of [
      'get',
      'post',
      'put',
      'patch',
      'delete',
      'head',
    ] as const) {
      const operation = item[method];
      if (!operation) continue;
      const publicProbe =
        method === 'get' && ['/', '/health', '/license/status'].includes(path);
      const deviceProof = plane === 'provider' && path === '/licensing/lease';
      const isPublic =
        plane === 'tenant'
          ? publicOperations.has(operation.operationId || '')
          : publicProbe || deviceProof;
      operation.security = isPublic
        ? []
        : plane === 'tenant'
          ? [{ bearer: [] }]
          : [{ bearer: [] }, { 'provider-session': [] }];
      if (!operation.tags?.length)
        operation.tags = [
          path.startsWith('/ai')
            ? 'AI assistants'
            : path.startsWith('/integrations')
              ? 'Integrations'
              : path.startsWith('/auth')
                ? 'Authentication'
                : path.startsWith('/helpdesk')
                  ? 'Helpdesk'
                  : path.split('/')[1] || 'Service status',
        ];
      operation.summary ||= `${method === 'get' ? 'Read' : method === 'post' ? 'Submit' : method === 'patch' ? 'Update' : method === 'delete' ? 'Remove' : 'Replace'} ${path}`;
      operation.responses ||= {};
      if (!isPublic) {
        operation.responses['401'] ||= {
          description:
            plane === 'tenant'
              ? 'Staff JWT is missing, invalid or expired'
              : 'Owner credential or session is missing, invalid or expired',
        };
        operation.responses['403'] ||= {
          description:
            'Account role, installation role scope or request origin does not permit this action',
        };
      }
      if (path !== '/license/status')
        operation.responses['503'] ||= {
          description:
            'Installation activation is missing/expired, or this feature is not configured',
        };
      if (method !== 'get')
        operation.responses['400'] ||= {
          description:
            'Validation failed; review the response message and correct the request',
        };
      if (path.startsWith('/ai/') && method === 'post') {
        operation.requestBody = {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                additionalProperties: false,
                required: ['message'],
                properties: {
                  message: { type: 'string', minLength: 1, maxLength: 2000 },
                  history: {
                    type: 'array',
                    maxItems: 8,
                    items: {
                      type: 'object',
                      required: ['role', 'content'],
                      additionalProperties: false,
                      properties: {
                        role: { type: 'string', enum: ['user', 'assistant'] },
                        content: { type: 'string', maxLength: 6000 },
                      },
                    },
                  },
                },
              },
              example: {
                message: 'Explain the next step for this workflow.',
                history: [],
              },
            },
          },
        };
        operation.responses['201'] = {
          description:
            'Read-only guidance. No records changed and no commands executed.',
          content: {
            'application/json': {
              example: {
                requestId: 'generated-request-id',
                agent:
                  plane === 'provider' ? 'EverGreen Atlas' : 'EverGreen Loom',
                answer: 'A workflow explanation...',
                advisoryOnly: true,
              },
            },
          },
        };
        operation.responses['429'] = {
          description:
            'Per-client, daily process budget, concurrency or Groq limit reached. Wait before retrying.',
        };
        operation.responses['502'] = {
          description:
            'Groq timed out, rejected the request or returned an invalid response. Provider details and credentials are withheld.',
        };
      }
      if (deviceProof)
        operation.description =
          'Installation renewal authenticated by owner-signed grant, fresh nonce and installation RSA device proof. A provider bearer key is not used here. Replayed, stale, revoked and unsigned requests are rejected.';
    }
  }
  const usedTags = new Set(
    Object.values(document.paths).flatMap((item) =>
      item
        ? Object.values(item).flatMap((value) =>
            value && typeof value === 'object' && 'tags' in value
              ? (value as OperationObject).tags || []
              : [],
          )
        : [],
    ),
  );
  document.tags = [...usedTags].sort().map((name) => ({ name }));
  return document;
}
