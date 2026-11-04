import 'reflect-metadata';
import type { INestApplication } from '@nestjs/common';
import type { OpenAPIObject } from '@nestjs/swagger';
import { upgradeApiReference } from './api-reference';
class Example {
  publicStatus(this: void) {}
  privateStatus(this: void) {}
}
Reflect.defineMetadata('isPublic', true, Example.prototype.publicStatus);
const app = {
  get: () =>
    new Map([
      [
        'test',
        { controllers: new Map([['example', { instance: new Example() }]]) },
      ],
    ]),
} as unknown as INestApplication;
const document = () =>
  ({
    openapi: '3.0.0',
    info: { title: 'test', version: '1' },
    paths: {
      '/public': {
        get: { operationId: 'Example_publicStatus', responses: {} },
      },
      '/private': {
        get: { operationId: 'Example_privateStatus', responses: {} },
      },
      '/ai/marketing': {
        post: { operationId: 'Example_publicStatus', responses: {} },
      },
      '/licensing/lease': { post: { responses: {} } },
    },
  }) as OpenAPIObject;
describe('API reference security metadata', () => {
  it('marks actual public metadata and documents JWT requirements on other tenant routes', () => {
    const result = upgradeApiReference(app, document(), 'tenant');
    expect(result.paths['/public'].get!.security).toEqual([]);
    expect(result.paths['/private'].get!.security).toEqual([{ bearer: [] }]);
    expect(result.paths['/ai/marketing'].post!.requestBody).toBeDefined();
    expect(result.paths['/ai/marketing'].post!.responses['429']).toBeDefined();
  });
  it('separates owner cookie/bearer authentication from device-proof renewal', () => {
    const result = upgradeApiReference(app, document(), 'provider');
    expect(result.paths['/private'].get!.security).toEqual([
      { bearer: [] },
      { 'provider-session': [] },
    ]);
    expect(result.paths['/licensing/lease'].post!.security).toEqual([]);
    expect(result.paths['/licensing/lease'].post!.description).toContain(
      'device proof',
    );
    expect(
      result.components!.securitySchemes!['provider-session'],
    ).toMatchObject({ in: 'cookie' });
  });
});
