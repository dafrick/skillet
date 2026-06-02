.PHONY: build clean run watch test test-unit test-integration test-e2e test-coverage lint format typecheck

build:
	pnpm build

clean:
	rm -rf dist coverage

# Usage: make run install
#        make run ARGS=--help   (-- flags must use ARGS= since make intercepts them)
ifeq (run,$(firstword $(MAKECMDGOALS)))
  _RUN_ARGS := $(wordlist 2,$(words $(MAKECMDGOALS)),$(MAKECMDGOALS))
  $(eval $(_RUN_ARGS):;@:)
endif

run: build
	pnpm exec hello-skill $(_RUN_ARGS) $(ARGS)

watch:
	pnpm exec tsc --watch --preserveWatchOutput

test:
	pnpm test

test-unit:
	pnpm test:unit

test-integration:
	pnpm test:integration

test-e2e:
	pnpm test:e2e

test-coverage:
	pnpm test:coverage

lint:
	pnpm lint

format:
	pnpm format

typecheck:
	pnpm typecheck
