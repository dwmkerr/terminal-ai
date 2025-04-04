default: help

.PHONY: help
help: # Show help for each of the Makefile recipes.
	@grep -E '^[a-zA-Z0-9 -]+:.*#'  Makefile | sort | while read -r l; do printf "\033[1;32m$$(echo $$l | cut -f 1 -d':')\033[00m:$$(echo $$l | cut -f 2- -d'#')\n"; done

.PHONY: init
init: # Initialise and verify the development environment.
	./scripts/init.sh

.PHONY: test-e2e
test-e2e: # run end-to-end tests
	./tests/test-chat.sh
	./tests/test-file-input.sh
