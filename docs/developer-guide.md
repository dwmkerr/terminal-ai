# Developer Guide

Clone the repo, install dependencies, build and then run:

```bash
git clone git@github.com:dwmkerr/boxes.git

# optional: use the latest node with:
# nvm use --lts
npm install
npm start

# If 'actionlint' is installed, the GitHub workflows will be linted.
brew install actionlint
```

If you want to install the `ai` command run the following:

```bash
npm run build # or 'npm run build:watch' to live rebuild...
npm install -g .

# Now run ai commands such as:
ai "ask me anything" # run 'ai' again if the build has updated...

# Clean up when you are done...
npm uninstall -g .
```

### Debugging

The [`debug`](https://github.com/debug-js/debug) library is used to make it easy to provide debug level output. Debug logging to the console can be enabled with:

```bash
AI_DEBUG_ENABLE="1" npm start
```

The debug namespaces can be configured like so:

```bash
AI_DEBUG_NAMESPACE='ai*'
```

### Testing

The following commands are helpful when testing:

```bash
# Run all tests. Run tests with coverage.
npm run test
npm run test:cov

# Run (or watch, or debug) tests that match a pattern.
npm run test -- theme
npm run test:watch -- theme
npm run test:debug -- theme
```

### Terminal Recording / asciinema

To create a terminal recording for the documentation:

- Install [asciinema](https://asciinema.org/) `brew install asciinema`
- Check that you have your profiles setup as documented in `./scripts/record-demo.sh`
- Run the script to start a 'clean' terminal `./scripts/record-demo.sh`
- Download your recording, e.g. to `./docs/620124.cast`
- Install [svg-term-cli](https://github.com/marionebl/svg-term-cli) `npm install -g svg-term-cli`
- Convert to SVG: `./scripts/demo-to-svg.sh`

### Concepts

**Actions** - these are commander.js functions that are called by the CLI. They should validate/decode parameters and ask for missing parameters. They will then call a **command**.
**Commands** - these are the underlying APIs that the CLI offers - they are agnostic of the command line interface (and could therefore be exposed in a web server or so on).
**Context** - information which is provided via prompts to shape the intended output. More details below.

### Context

"Context" refers to prompts which are passed to the model before the user interacts, which can provide the model with more information about the environment of the user or their potential intent. Examples would be:

- That the user is running in a shell, with a given set of terminal dimensions
- What the operating system is that the user is running
- (WIP) the organisation and name of the local Git repo
- (WIP) the primary language of the current Git repo.

### Context Prompts

When expanding context prompts (e.g. ./prompts/chat/context/context.txt) environment variables may be used to give more specific information. As well as those provided by the system (or yourself), the following are automatically set for convenience:

| Environment Variable | Description                            |
|----------------------|----------------------------------------|
| `OS_PLATFORM`        | `nodejs os.platform()`                 |
| `TTY_WIDTH`          | The terminal width (or 80 if not set)  |
| `TTY_HEIGHT`         | The terminal height (or 24 if not set) |

## Security & Safety

**Critical security considerations for AI applications:**

### Prompt Injection Prevention

User input must be sanitized to prevent prompt injection attacks. Implement these safeguards:

```typescript
/**
 * sanitizeUserInput - removes potential prompt injection patterns
 * @param input - raw user input
 * @returns sanitized input safe for AI processing
 */
export function sanitizeUserInput(input: string): string {
  // Remove potential instruction delimiters
  const dangerous = [
    /ignore\s+previous\s+instructions/gi,
    /forget\s+everything/gi,
    /you\s+are\s+now/gi,
    /system\s*[:]\s*/gi,
    /assistant\s*[:]\s*/gi,
    /human\s*[:]\s*/gi,
    /<\|.*?\|>/g, // Remove potential special tokens
    /```[\s\S]*?```/g, // Remove code blocks in user input
  ];
  
  let sanitized = input;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '[FILTERED]');
  });
  
  // Truncate excessively long inputs
  if (sanitized.length > 4000) {
    sanitized = sanitized.substring(0, 4000) + '...[TRUNCATED]';
  }
  
  return sanitized;
}
```

### Input Validation

Validate all user inputs before processing:

```typescript
/**
 * validateUserInput - validates input meets safety requirements
 * @param input - user input to validate
 * @throws Error if input is unsafe
 */
export function validateUserInput(input: string): void {
  if (!input || input.trim().length === 0) {
    throw new Error('Input cannot be empty');
  }
  
  if (input.length > 10000) {
    throw new Error('Input too long (max 10,000 characters)');
  }
  
  // Check for excessive repeated characters (potential DoS)
  const repeatedChar = /(.)\1{100,}/;
  if (repeatedChar.test(input)) {
    throw new Error('Input contains excessive repeated characters');
  }
}
```

### Rate Limiting

Implement rate limiting to prevent abuse:

```typescript
/**
 * Simple rate limiter for AI requests
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  
  constructor(
    private maxRequests: number = 10,
    private windowMs: number = 60000 // 1 minute
  ) {}
  
  isAllowed(identifier: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(identifier) || [];
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs);
    
    if (validRequests.length >= this.maxRequests) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(identifier, validRequests);
    return true;
  }
}
```

### Data Privacy Guidelines

**Never send sensitive data to AI providers:**

- **Environment variables** - Filter out API keys, tokens, passwords
- **File paths** - Avoid absolute paths that reveal system information  
- **Personal information** - Strip PII before sending to AI models
- **Proprietary code** - Be cautious with sending complete codebases

```typescript
// Example: sanitize environment variables
export function sanitizeEnvironment(env: Record<string, string>): Record<string, string> {
  const sensitiveKeys = ['API_KEY', 'TOKEN', 'PASSWORD', 'SECRET', 'PRIVATE'];
  const sanitized: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(env)) {
    if (sensitiveKeys.some(sensitive => key.toUpperCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    } else {
      sanitized[key] = value;
    }
  }
  
  return sanitized;
}
```

### Error Handling

Never expose internal errors to users that could reveal system information:

```typescript
export function sanitizeError(error: Error): string {
  // Log the full error internally
  console.error('Internal error:', error);
  
  // Return a generic message to the user
  return 'An error occurred while processing your request. Please try again.';
}
```

## CI/CD

Required secrets:

- `TESTING_AI_API_KEY` - required to run end to end tests

## UI Components

UI components should be placed in the `src/ui` directory and follow these principles:

1. **Single Responsibility**: Each component should handle one specific interaction
2. **Type Safety**: Components should return typed data
3. **Stateless**: Components should not modify state directly
4. **Documentation**: Components should be documented with JSDoc
5. **Reusability**: Components should be designed for reuse across the application

Example:
```typescript
/**
 * selectProvider - presents a simple selection menu for available providers.
 *
 * @param {ProviderConfiguration} currentProvider - the currently selected provider
 * @param {ProviderConfiguration[]} availableProviders - all available providers
 * @returns {Promise<ProviderConfiguration | null>} the selected provider or null if cancelled
 */
export async function selectProvider(
  currentProvider: ProviderConfiguration,
  availableProviders: ProviderConfiguration[],
): Promise<ProviderConfiguration | null> {
  // Implementation...
}
```

State changes should be handled by separate functions in the appropriate domain (e.g., configuration updates in the configuration module).
