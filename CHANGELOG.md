# Changelog

## [0.12.1](https://github.com/dwmkerr/terminal-ai/compare/v0.11.3...v0.12.1) (2025-03-28)


### Features

* **docs:** better 'ai init' documentation ([#79](https://github.com/dwmkerr/terminal-ai/issues/79)) ([eb78da2](https://github.com/dwmkerr/terminal-ai/commit/eb78da26fa30d9ce6f20b67ee3020ddcf9742e6e))
* Gemini, OpenAI compatible providers ([9fec5ab](https://github.com/dwmkerr/terminal-ai/commit/9fec5ab54c6ae925f956803893cfec709ac2bd36))


### Bug Fixes

* **actions:** 'choose model' action fixed ([eb78da2](https://github.com/dwmkerr/terminal-ai/commit/eb78da26fa30d9ce6f20b67ee3020ddcf9742e6e))


### Miscellaneous Chores

* release 0.12.1 ([a220e54](https://github.com/dwmkerr/terminal-ai/commit/a220e54e343eee3ada352d2d99cd8115e2f6248b))

## [0.11.3](https://github.com/dwmkerr/terminal-ai/compare/v0.11.2...v0.11.3) (2025-03-21)


### Features

* **config:** simplified api/base/model config ([3c69d33](https://github.com/dwmkerr/terminal-ai/commit/3c69d335d92a0cb777b4d0ee6d94614872b3ec3b))
* **experimental:** optional langfuse integration ([2ceb719](https://github.com/dwmkerr/terminal-ai/commit/2ceb71905d78779b69c5793993dccd855a2c4163))


### Miscellaneous Chores

* release 0.11.3 ([485d795](https://github.com/dwmkerr/terminal-ai/commit/485d795b4c432f1ceb9b8ab102a15a1149124930))

## [0.11.2](https://github.com/dwmkerr/terminal-ai/compare/v0.11.1...v0.11.2) (2025-03-14)


### Bug Fixes

* errors and spinners ([#67](https://github.com/dwmkerr/terminal-ai/issues/67)) ([9cc87e6](https://github.com/dwmkerr/terminal-ai/commit/9cc87e6629a1199652ad7c25c59a3602c00be2af))

## [0.11.1](https://github.com/dwmkerr/terminal-ai/compare/v0.11.0...v0.11.1) (2025-03-14)


### Features

* advanced model selection ([#61](https://github.com/dwmkerr/terminal-ai/issues/61)) ([c33179f](https://github.com/dwmkerr/terminal-ai/commit/c33179fc2ae978caffbc129dbef02d7772e32a66))
* **chat:** spinner while waiting for response ([#65](https://github.com/dwmkerr/terminal-ai/issues/65)) ([197f0b7](https://github.com/dwmkerr/terminal-ai/commit/197f0b75e801903dfa2dd64026911e729d203afc))
* **docs:** 'select model' action ([#66](https://github.com/dwmkerr/terminal-ai/issues/66)) ([192c00e](https://github.com/dwmkerr/terminal-ai/commit/192c00e3e4d3de51f87e012dc65b8e2019eb901b))
* model selection improvements ([#64](https://github.com/dwmkerr/terminal-ai/issues/64)) ([a9ea073](https://github.com/dwmkerr/terminal-ai/commit/a9ea0736f37b22d30d5896630a1842dc8c03dc3c))


### Bug Fixes

* **chat:** select model search bug ([2fa901a](https://github.com/dwmkerr/terminal-ai/commit/2fa901aaba4015b9266a03a118f21726049c1e4c))
* skip system context when save conversation ([2d01c64](https://github.com/dwmkerr/terminal-ai/commit/2d01c64814319c8b20a88d0e1cf46e4d90fbbf8e))


### Miscellaneous Chores

* release 0.11.1 ([a0af76c](https://github.com/dwmkerr/terminal-ai/commit/a0af76c3209e397683d61d897add6fc70abe7c8d))
* release 0.11.1 ([754cdff](https://github.com/dwmkerr/terminal-ai/commit/754cdffd867fbabe85fcfdc6b476bdb62bdecdc1))
* release 0.11.2 ([e696049](https://github.com/dwmkerr/terminal-ai/commit/e6960497577eea2b85af9d9f79d53ee8bae69b06))
* release 0.11.3 ([b2efd43](https://github.com/dwmkerr/terminal-ai/commit/b2efd43dad0fc587a28d1a5069fe239b87faed8a))

## [0.11.0](https://github.com/dwmkerr/terminal-ai/compare/v0.10.2...v0.11.0) (2025-03-12)


### Features

* **chat:** better hints for showing the menu ([f7d521e](https://github.com/dwmkerr/terminal-ai/commit/f7d521e957cd79e13081f1ef397f2464e3e9c46e))
* **chat:** better hints for showing the menu ([4c6967d](https://github.com/dwmkerr/terminal-ai/commit/4c6967d4db55185c9d74b2cdc8b481a0f5d1b297))
* **ci:** update ubuntu version in CI configurations ([a011829](https://github.com/dwmkerr/terminal-ai/commit/a01182904b7c8efbecf90ba81a4e5470a83de278))
* **ci:** update ubuntu version in CI configurations ([0e9c298](https://github.com/dwmkerr/terminal-ai/commit/0e9c2980ac8307d93222ca733ceafb8253650979))


### Bug Fixes

* **chat:** correctly show 'menu' hint ([8853668](https://github.com/dwmkerr/terminal-ai/commit/88536680435e420b2c7bee97a30ad712ab10584f))
* **context:** change role from user to system ([0e9c298](https://github.com/dwmkerr/terminal-ai/commit/0e9c2980ac8307d93222ca733ceafb8253650979))

## [0.10.2](https://github.com/dwmkerr/terminal-ai/compare/v0.10.1...v0.10.2) (2025-03-05)


### Bug Fixes

* **api-key:** fail on missing key (i.e. return non-zero) ([b2d8514](https://github.com/dwmkerr/terminal-ai/commit/b2d8514e35341e7267571323218a57dd78c8ab1c))

## [0.10.1](https://github.com/dwmkerr/terminal-ai/compare/v0.10.0...v0.10.1) (2025-03-03)


### Bug Fixes

* fix output when piping to stdout ([4084bc1](https://github.com/dwmkerr/terminal-ai/commit/4084bc1ca5474fd7b8aff86431d04478f3d7df63))


### Miscellaneous Chores

* release 0.10.1 ([9e6fe0f](https://github.com/dwmkerr/terminal-ai/commit/9e6fe0fb4da1b1a4be1a9c97bdeefc4253a0de9e))

## [0.10.0](https://github.com/dwmkerr/terminal-ai/compare/v0.9.0...v0.10.0) (2025-03-02)


### Features

* **actions:** 'save conversation' action ([119b27d](https://github.com/dwmkerr/terminal-ai/commit/119b27d334757e91907e6895c16b8a7bae4601aa))
* **chat:** save response/convo overwrite and create folders ([143c4fe](https://github.com/dwmkerr/terminal-ai/commit/143c4feeee126d12dbbefd564381ba04628ce249))
* **shell:** pipe to stdin uploads a file named `stdin` ([9f06cad](https://github.com/dwmkerr/terminal-ai/commit/9f06cad9de0cf679f2af92714114b55b1f65767f))
* **usage:** experimental 'usage' command (debug only) ([4f016ec](https://github.com/dwmkerr/terminal-ai/commit/4f016eccc23ef3690f196552fc5de816217a38ed))


### Bug Fixes

* **chat:** fullscreen chat input now sends correctly ([5f074b5](https://github.com/dwmkerr/terminal-ai/commit/5f074b5dd5d98d10e387271c4d749ef76be73128))
* **docs:** add missing piping demo ([5c50f99](https://github.com/dwmkerr/terminal-ai/commit/5c50f9932b21fd0c7a9224e2b7ab48f86d8d48da))
* **docs:** corrected stdin sample ([800c869](https://github.com/dwmkerr/terminal-ai/commit/800c8694e89de6c75105d1781cd46befb2e3dc00))

## [0.9.0](https://github.com/dwmkerr/terminal-ai/compare/v0.8.0...v0.9.0) (2025-02-24)


### Features

* **chat:** multiline chat ([#43](https://github.com/dwmkerr/terminal-ai/issues/43)) ([a58b187](https://github.com/dwmkerr/terminal-ai/commit/a58b187b40acce2f4b24919bc057dea59dbd042d))

## [0.8.0](https://github.com/dwmkerr/terminal-ai/compare/v0.7.1...v0.8.0) (2025-02-17)


### Features

* **chat:** add the `-r, --raw` flag to disable formatting or manipulation of output ([07ff0c9](https://github.com/dwmkerr/terminal-ai/commit/07ff0c9cf93e0595a84f6ebeddf19bdae7763fbb))
* experimental assistants api ([#39](https://github.com/dwmkerr/terminal-ai/issues/39)) ([07ff0c9](https://github.com/dwmkerr/terminal-ai/commit/07ff0c9cf93e0595a84f6ebeddf19bdae7763fbb))

## [0.7.1](https://github.com/dwmkerr/terminal-ai/compare/v0.7.0...v0.7.1) (2025-02-13)


### Bug Fixes

* correct use of env/params ([d2cbf6f](https://github.com/dwmkerr/terminal-ai/commit/d2cbf6fc35b46e584f2d68f08b426aba357f1fb6))
* package missing prompts dir ([b842229](https://github.com/dwmkerr/terminal-ai/commit/b84222913d80205b224e4307159a1e0d52f0fee9))

## [0.7.0](https://github.com/dwmkerr/terminal-ai/compare/v0.6.0...v0.7.0) (2025-02-13)


### Features

* **chat:** 'Execute' action to run scripts ([d080d19](https://github.com/dwmkerr/terminal-ai/commit/d080d19c9a19c3cb660a7c370d2c0366dd455938))
* **chat:** model is now configurable ([85c3aac](https://github.com/dwmkerr/terminal-ai/commit/85c3aac07412fd0dd94d921fa03ea5f10ee93e97))


### Bug Fixes

* missing files in partial commit ([5083b99](https://github.com/dwmkerr/terminal-ai/commit/5083b992520d01431666bc65c6fe2b5e05b7e503))

## [0.6.0](https://github.com/dwmkerr/terminal-ai/compare/v0.5.0...v0.6.0) (2025-02-12)


### Features

* **chat:** 'code' output context prompts configurable ([#21](https://github.com/dwmkerr/terminal-ai/issues/21)) ([d7126b7](https://github.com/dwmkerr/terminal-ai/commit/d7126b71519a8ad74b373d4b87397e515179df53))
* **chat:** 'copy' option ([#29](https://github.com/dwmkerr/terminal-ai/issues/29)) ([2e46e86](https://github.com/dwmkerr/terminal-ai/commit/2e46e86c37c822b09a5434ce64f8298616c09382))
* **check:** 'ai check' validates OpenAI key and config ([#27](https://github.com/dwmkerr/terminal-ai/issues/27)) ([24a3d9b](https://github.com/dwmkerr/terminal-ai/commit/24a3d9bda2eacd28b2f97aea22fc4c17d34b9c9e))
* **docs:** terminal recording + docs ([#23](https://github.com/dwmkerr/terminal-ai/issues/23)) ([48b75fd](https://github.com/dwmkerr/terminal-ai/commit/48b75fd1b6f0b92683d16b687d5059900e34de14))
* **init:** 'ai init' sets/updates/checks config ([#28](https://github.com/dwmkerr/terminal-ai/issues/28)) ([370ce66](https://github.com/dwmkerr/terminal-ai/commit/370ce66ebedc49e956aabeb13335dba7ff9b6908))


### Bug Fixes

* **build:** reduce bundle size - bundle only distributables ([#30](https://github.com/dwmkerr/terminal-ai/issues/30)) ([826fe17](https://github.com/dwmkerr/terminal-ai/commit/826fe1799bac70ed85df9ef0ae3096281e219c68))
* re enable theme tests ([#24](https://github.com/dwmkerr/terminal-ai/issues/24)) ([357b433](https://github.com/dwmkerr/terminal-ai/commit/357b433b053be9be1b7f28fa99bac62c80c50b79))

## [0.5.0](https://github.com/dwmkerr/terminal-ai/compare/v0.4.0...v0.5.0) (2025-02-10)


### Features

* **chat:** basic code intent ([#19](https://github.com/dwmkerr/terminal-ai/issues/19)) ([0ebbcee](https://github.com/dwmkerr/terminal-ai/commit/0ebbcee740c63b5f4b76317803f0dcf95d00c20d))

## [0.4.0](https://github.com/dwmkerr/terminal-ai/compare/v0.1.0...v0.4.0) (2025-02-09)


### Features

* **chat:** style markdown output ([#12](https://github.com/dwmkerr/terminal-ai/issues/12)) ([f81e3dd](https://github.com/dwmkerr/terminal-ai/commit/f81e3dd6b030bbca099ef11d5104b8f872010c81))
* next chat action ([#15](https://github.com/dwmkerr/terminal-ai/issues/15)) ([8aea588](https://github.com/dwmkerr/terminal-ai/commit/8aea5887d704e1c6e5f3f03e837503ed680d7680))


### Bug Fixes

* **ai:** show instructions post install ([cf029ae](https://github.com/dwmkerr/terminal-ai/commit/cf029aecec0112f94823f7e7e5ec1829a9ddc5ee))
* **build:** correctly install dependencies on build ([b5dcf7f](https://github.com/dwmkerr/terminal-ai/commit/b5dcf7f11b15aaff44c3ac8ce587069dea244c4b))
* **build:** hide deprecation warnings from eslint deps ([e8c6a5f](https://github.com/dwmkerr/terminal-ai/commit/e8c6a5f1085af0455f200a7fe3bd4efa2d534c3a))
* bundle distributable code ([#6](https://github.com/dwmkerr/terminal-ai/issues/6)) ([690e95e](https://github.com/dwmkerr/terminal-ai/commit/690e95e370679ad08148b245d1cc75d48c9907c6))
* deprecation warning ([2172ca4](https://github.com/dwmkerr/terminal-ai/commit/2172ca4bb1720f14560fd0f57000e671acbe046a))
* remove stale files ([#8](https://github.com/dwmkerr/terminal-ai/issues/8)) ([e05f8d4](https://github.com/dwmkerr/terminal-ai/commit/e05f8d453a048bff186759e8a96d1dffc7aee4b8))


### Miscellaneous Chores

* release 0.0.1 ([c839029](https://github.com/dwmkerr/terminal-ai/commit/c839029cf00f96c31b57d5ff511fd6a1cba3bccb))
* release 0.1.1 ([bcd4e92](https://github.com/dwmkerr/terminal-ai/commit/bcd4e9269c5f2aed602c2f34d0b0b87f99c4be16))
* release 0.4.0 ([2f47d36](https://github.com/dwmkerr/terminal-ai/commit/2f47d3665c96256e6c9c9db8f5bcd9dcd1b580c9))

## [0.1.0](https://github.com/dwmkerr/terminal-ai/compare/v0.0.1...v0.1.0) (2025-02-09)


### Features

* next chat action ([#15](https://github.com/dwmkerr/terminal-ai/issues/15)) ([8aea588](https://github.com/dwmkerr/terminal-ai/commit/8aea5887d704e1c6e5f3f03e837503ed680d7680))

## [0.0.1](https://github.com/dwmkerr/terminal-ai/compare/v0.2.0...v0.0.1) (2025-02-09)


### Miscellaneous Chores

* release 0.0.1 ([c839029](https://github.com/dwmkerr/terminal-ai/commit/c839029cf00f96c31b57d5ff511fd6a1cba3bccb))
