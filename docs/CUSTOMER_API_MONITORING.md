# Customer API console

Open **API management** in the provider workspace. Select a customer card, then an API group to inspect endpoint activity. The console refreshes every 15 seconds while visible. Counters cover the current API process lifetime and reset on restart; they are not historical analytics. Active means at least one observed request, including rejected requests. Registered endpoints without traffic remain visible.

## Connect an installation

Set a unique, randomly generated `EVERGREEN_MONITOR_TOKEN` of at least 32 characters on the customer API server. Keep it in the host secret manager. The monitoring endpoint is `/internal/api-monitor`; currently it is registered alongside the development OpenAPI document, so production documentation-disabled installations do not expose it.

On the provider server, set a secret variable for that customer, for example `CUSTOMER_ONE_MONITOR_TOKEN`, with the same value. Set `EVERGREEN_API_MONITORS` to a JSON mapping keyed by the real provider company ID:

```json
{"COMPANY_ID":{"origin":"https://customer-api.example.com","tokenEnv":"CUSTOMER_ONE_MONITOR_TOKEN"}}
```

Restart the APIs after configuring their environment. Hosts must use HTTPS; loopback HTTP is accepted for local development. The origin must expose the API directly. Redirects are rejected. The provider does not send its administrator credential to customers or accept monitoring targets from browser input. Use a distinct token per customer. Requests expose route templates and aggregate metrics only, excluding bodies, queries and authorization headers.

Without a configured host and matching token, the console displays monitoring as disconnected. Customer synchronization times are independent from API health. Multiple API replicas each maintain their own counters; a shared telemetry collector is needed for durable aggregate history across replicas.
