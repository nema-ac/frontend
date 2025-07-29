.PHONY: confirm
_WARN := "\033[33m[%s]\033[0m %s\n"  # Yellow text for "printf"
_TITLE := "\033[32m[%s]\033[0m %s\n" # Green text for "printf"
_ERROR := "\033[31m[%s]\033[0m %s\n" # Red text for "printf"

CURRENT_BRANCH = $(shell git branch --show-current) 
COMMIT = $(shell git rev-parse --short=12 HEAD)

# Build the app locally (for testing)
build:
	@echo "Building React app locally"
	npm run build

# Preview the built app locally
preview: build
	@echo "Previewing built app locally"
	npm run preview

# Deploy to fly.io
deploy:
	@echo "Deploying to fly.io"
	fly deploy -c fly.toml

# Deploy with confirmation (safer for production)
deploy-confirm: confirm
	@echo "Deploying to fly.io after confirmation"
	fly deploy -c fly.toml

# Show logs for the deployed app
logs:
	@echo "Showing logs for nema-frontend"
	fly logs -a nema-frontend

# Show recent logs and follow new ones
logs-follow:
	@echo "Following logs for nema-frontend"
	fly logs -a nema-frontend -f

# Open the deployed app in browser
open:
	@echo "Opening nema-frontend in browser"
	fly open -a nema-frontend

# Show app status
status:
	@echo "Showing status for nema-frontend"
	fly status -a nema-frontend

# Scale the app (e.g., make scale MACHINES=2)
scale:
	@echo "Scaling nema-frontend to ${MACHINES} machines"
	fly scale count ${MACHINES} -a nema-frontend

# print-releases lists the last 5 releases for the nema-frontend deployment
print-releases:
	fly releases -a nema-frontend --image --json | jq 'limit(5; .[]) | {Version, Description, ImageRef, CreatedAt, UserEmail: .User.Email}'

# rollback rolls back the nema-frontend deployment to the specified IMAGE
rollback:
	@echo "Rolling back nema-frontend to ${IMAGE}"
	fly deploy -a nema-frontend --image ${IMAGE}

# Connect to the app machine via SSH
ssh:
	@echo "Connecting to nema-frontend machine"
	fly ssh console -a nema-frontend

# Run linting before deploy
lint:
	@echo "Running ESLint"
	npm run lint

# Full deployment pipeline: lint -> build -> deploy
deploy-full: lint build deploy
	@echo "Full deployment completed"

# ------------------------------------------------------------------------------
# Helpers

# Enforce the current branch is main
main-required:
	make branch-check CHECK_BRANCH="main"

# Check that the current branch is the provided CHECK_BRANCH
branch-check:
	@if [ "$(shell git branch --show-current)" != "$(CHECK_BRANCH)" ]; then \
		echo "$(shell tput setaf 3)WARNING: Current git branch is not $(CHECK_BRANCH): $(shell git branch --show-current)"; \
		exit 1; \
	fi

# The CI environment variable can be set to a non-empty string,
# it'll bypass this command that will "return true", as a "yes" answer.
confirm:
	@if [[ -z "$(CI)" ]]; then \
		REPLY="" ; \
		read -p "⚠ Are you sure? [y/n] > " -r ; \
		if [[ ! $$REPLY =~ ^[Yy]$$ ]]; then \
			printf $(_ERROR) "KO" "Stopping" ; \
			exit 1 ; \
		else \
			printf $(_TITLE) "OK" "Continuing" ; \
			exit 0; \
		fi \
	fi