# Engineering Standard

Project configuration is downstream of current engineering discovery, never upstream of it.

Core sequence:

1. Identify the current date and execution platform.
2. Query official sources for currently supported versions and platform requirements.
3. Resolve runtime requirements.
4. Resolve dependency and plugin compatibility.
5. Generate configuration once from the resolved facts.

Remembered examples, stale templates and historical defaults are not valid version evidence. Commodity quality gates must use maintained stack-native mainstream tools when available; custom gates require a genuine Calystr-specific invariant rather than reimplementing ecosystem tooling.
