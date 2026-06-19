# ─── PRO-DID · Local Development Makefile ────────────────────────────────────
#
# Usage:
#   make setup      — full first-time setup (build → start anvil → deploy → configure frontend)
#   make frontend   — start the Vite dev server
#   make test       — run Foundry tests
#   make deploy     — (re)deploy contracts to a running Anvil instance
#   make stop       — stop background Anvil process
#   make clean      — remove build artifacts
#
# Anvil default account #0 private key (safe for local dev only):
PRIVATE_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
RPC_URL     := http://localhost:8545
FRONTEND    := did-wallet-frontend

.PHONY: setup frontend test deploy stop clean install-frontend

# ── Full first-time setup ─────────────────────────────────────────────────────
setup: install-frontend build start-anvil deploy write-env
	@echo ""
	@echo "✅  Setup complete."
	@echo "   Run 'make frontend' to start the dev server."
	@echo "   Open http://localhost:3000 and connect MetaMask to localhost:8545 (chain ID 31337)."

# ── Install frontend deps ─────────────────────────────────────────────────────
install-frontend:
	@echo "→ Installing frontend dependencies..."
	cd $(FRONTEND) && npm install

# ── Build contracts ───────────────────────────────────────────────────────────
build:
	@echo "→ Building Solidity contracts..."
	forge build

# ── Start Anvil in background ─────────────────────────────────────────────────
start-anvil:
	@echo "→ Starting Anvil local node..."
	@pkill -f "anvil" 2>/dev/null || true
	@anvil --silent &
	@sleep 1
	@echo "  Anvil running on $(RPC_URL)"

# ── Deploy contracts ──────────────────────────────────────────────────────────
deploy:
	@echo "→ Deploying contracts to $(RPC_URL)..."
	PRIVATE_KEY=$(PRIVATE_KEY) forge script script/Deploy.s.sol \
		--rpc-url $(RPC_URL) \
		--broadcast \
		--silent
	@echo "  Addresses saved to deployment.json"

# ── Write contract addresses to frontend .env ─────────────────────────────────
write-env:
	@echo "→ Writing contract addresses to $(FRONTEND)/.env..."
	@if [ ! -f deployment.json ]; then \
		echo "  ❌  deployment.json not found. Run 'make deploy' first."; exit 1; \
	fi
	@DID=$$(node -e "const d=require('./deployment.json');process.stdout.write(d.DID_REGISTRY_ADDRESS)"); \
	ISS=$$(node -e "const d=require('./deployment.json');process.stdout.write(d.ISSUER_REGISTRY_ADDRESS)"); \
	CRED=$$(node -e "const d=require('./deployment.json');process.stdout.write(d.CREDENTIAL_REGISTRY_ADDRESS)"); \
	cp $(FRONTEND)/.env.example $(FRONTEND)/.env; \
	sed -i "s|VITE_DID_REGISTRY_ADDRESS=|VITE_DID_REGISTRY_ADDRESS=$$DID|" $(FRONTEND)/.env; \
	sed -i "s|VITE_ISSUER_REGISTRY_ADDRESS=|VITE_ISSUER_REGISTRY_ADDRESS=$$ISS|" $(FRONTEND)/.env; \
	sed -i "s|VITE_CREDENTIAL_REGISTRY_ADDRESS=|VITE_CREDENTIAL_REGISTRY_ADDRESS=$$CRED|" $(FRONTEND)/.env
	@echo "  $(FRONTEND)/.env updated."

# ── Start frontend dev server ─────────────────────────────────────────────────
frontend:
	@echo "→ Starting frontend dev server..."
	cd $(FRONTEND) && npm run dev

# ── Run Foundry tests ─────────────────────────────────────────────────────────
test:
	forge test -v

# ── Stop Anvil ────────────────────────────────────────────────────────────────
stop:
	@pkill -f "anvil" 2>/dev/null && echo "Anvil stopped." || echo "Anvil was not running."

# ── Clean build artifacts ─────────────────────────────────────────────────────
clean:
	forge clean
	rm -f deployment.json
	rm -rf $(FRONTEND)/dist
