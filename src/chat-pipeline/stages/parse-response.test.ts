import { parseResponse } from "./parse-response";

const rawResponse = `Verify if a string is a palindrome with a JavaScript one-liner:
\`\`\`javascript
// JavaScript one-liner
const isPalindrome = (str) => str.split('').reverse().join('') === str;
\`\`\`

Check if a string is a palindrome using a Python one-liner:
\`\`\`python
# Python one-liner
is_palindrome = lambda s: s == s[::-1]
\`\`\`

Determine if a string is a palindrome with a Golang one-liner:
\`\`\`golang
// Golang one-liner
isPalindrome := func(s string) bool { for i := range s { if s[i] != s[len(s)-1-i] { return false } } return true }
\`\`\``;

describe("parseResponse", () => {
  test("can extract the raw markdown response", () => {
    const parsedResponse = parseResponse("chatgpt", rawResponse);
    expect(parsedResponse.rawMarkdownResponse).toEqual(rawResponse);
  });

  test("can create the plain text formatted response response", () => {
    //  In this case, we're formatting the markdown response, but then it is
    //  turned into plain text by stripping ANSII colour codes. This means
    //  that we get the spacing of markdown (e.g. spaces above/below code), but
    //  lose the fences. This type of response is what we'd typically save to
    //  a file or copy to the clipboard.
    const parsedResponse = parseResponse("chatgpt", rawResponse);
    expect(parsedResponse.plainTextFormattedResponse).toEqual(
      `Verify if a string is a palindrome with a JavaScript one-liner:

// JavaScript one-liner
const isPalindrome = (str) => str.split('').reverse().join('') === str;

Check if a string is a palindrome using a Python one-liner:

# Python one-liner
is_palindrome = lambda s: s == s[::-1]

Determine if a string is a palindrome with a Golang one-liner:

// Golang one-liner
isPalindrome := func(s string) bool { for i := range s { if s[i] != s[len(s)-1-i] { return false } } return true }`,
    );
  });

  test("can extract the code blocks", () => {
    const parsedResponse = parseResponse("chatgpt", rawResponse);
    expect(parsedResponse.codeBlocks.length).toEqual(3);
    expect(parsedResponse.codeBlocks[0]).toMatchObject({
      language: "javascript",
      rawMarkdownCode: `\`\`\`javascript
// JavaScript one-liner
const isPalindrome = (str) => str.split('').reverse().join('') === str;
\`\`\``,
      plainTextCode: `// JavaScript one-liner
const isPalindrome = (str) => str.split('').reverse().join('') === str;`,
    });

    expect(parsedResponse.codeBlocks[1]).toMatchObject({
      language: "python",
      rawMarkdownCode: `\`\`\`python
# Python one-liner
is_palindrome = lambda s: s == s[::-1]
\`\`\``,
      plainTextCode: `# Python one-liner
is_palindrome = lambda s: s == s[::-1]`,
    });

    expect(parsedResponse.codeBlocks[2]).toMatchObject({
      language: "golang",
      rawMarkdownCode: `\`\`\`golang
// Golang one-liner
isPalindrome := func(s string) bool { for i := range s { if s[i] != s[len(s)-1-i] { return false } } return true }
\`\`\``,
      plainTextCode: `// Golang one-liner
isPalindrome := func(s string) bool { for i := range s { if s[i] != s[len(s)-1-i] { return false } } return true }`,
    });
  });
});
