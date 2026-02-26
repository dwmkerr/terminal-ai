# Commit Message Quality Rubric

Evaluate the commit message on three dimensions. Score each 0-1.

## Format (0-1)
- 1.0: Uses conventional commit format (feat:, fix:, docs:, chore:, refactor:, test:)
- 0.5: Has a type prefix but non-standard format
- 0.0: No type prefix or completely wrong format

## Conciseness (0-1)
- 1.0: Single line, under 72 characters, no preamble
- 0.5: Single line but over 72 chars, or has minor preamble
- 0.0: Multiple lines, excessive explanation, or conversational

## Accuracy (0-1)
- 1.0: Message accurately summarizes the key change in the diff
- 0.5: Partially accurate or misses important details
- 0.0: Inaccurate or doesn't reflect the actual changes

## Output Format

Return JSON only:
```json
{"format": 0.0, "conciseness": 0.0, "accuracy": 0.0}
```
