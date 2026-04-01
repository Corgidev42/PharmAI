# ═══════════════════════════════════════════════════════════════════════════
#  PharmAI — Makefile (Vite + React)
#  Usage : make help   |   make dev   |   make build
# ═══════════════════════════════════════════════════════════════════════════

SHELL        := /bin/bash
.SHELLFLAGS  := -eu -o pipefail -c
.DEFAULT_GOAL := help

NPM   ?= npm
NPX   ?= npx

# Aperçu prod (vite preview écoute 4173 par défaut)
PREVIEW_PORT ?= 4173
PREVIEW_HOST ?= 127.0.0.1

# Couleurs (si terminal les supporte)
ifneq ($(NO_COLOR),)
  C :=
  B :=
  M :=
  G :=
  Y :=
  R :=
else
  C := \033[36m
  B := \033[1m
  M := \033[35m
  G := \033[32m
  Y := \033[33m
  R := \033[0m
endif

.PHONY: help install i dev play build ship preview clean distclean setup env doctor

## help      — Affiche les cibles disponibles (défaut)
# printf %b : interprète \033 (echo macOS/BSD affiche les codes en clair)
help:
	@printf '\n'
	@printf '%b\n' "$(B)$(M)  PharmAI$(R) $(C)~$(R) plateau néon & révisions"
	@printf '\n'
	@printf '%b\n' "  $(G)make$(R) $(Y)install$(R)   $(C)#$(R) installe les deps (npm ci / npm install)"
	@printf '%b\n' "  $(G)make$(R) $(Y)dev$(R)      $(C)#$(R) serveur Vite (hot reload)"
	@printf '%b\n' "  $(G)make$(R) $(Y)play$(R)     $(C)#$(R) alias de dev"
	@printf '%b\n' "  $(G)make$(R) $(Y)build$(R)     $(C)#$(R) build production → dist/"
	@printf '%b\n' "  $(G)make$(R) $(Y)ship$(R)     $(C)#$(R) alias de build"
	@printf '%b\n' "  $(G)make$(R) $(Y)preview$(R)   $(C)#$(R) sert dist/ (test du build)"
	@printf '%b\n' "  $(G)make$(R) $(Y)clean$(R)     $(C)#$(R) supprime dist/"
	@printf '%b\n' "  $(G)make$(R) $(Y)distclean$(R) $(C)#$(R) clean + node_modules/"
	@printf '%b\n' "  $(G)make$(R) $(Y)setup$(R)     $(C)#$(R) copie .env.example → .env si absent"
	@printf '%b\n' "  $(G)make$(R) $(Y)doctor$(R)    $(C)#$(R) vérifie Node / npm"
	@printf '\n'
	@printf '%b\n' "  $(C)NO_COLOR=1 make help$(R)  pour désactiver les couleurs"
	@printf '\n'

## install / i — Dépendances npm
install i:
	@if [ -f package-lock.json ]; then \
		printf '%b\n' "$(C)▸ npm ci$(R)"; $(NPM) ci; \
	else \
		printf '%b\n' "$(C)▸ npm install$(R)"; $(NPM) install; \
	fi

## dev / play — Développement local
dev play:
	@printf '%b\n' "$(C)▸ vite dev → http://localhost:5173$(R) (Ctrl+C pour quitter)"
	@$(NPM) run dev

## build / ship — Bundle production
build ship:
	@printf '%b\n' "$(C)▸ vite build$(R)"
	@$(NPM) run build
	@printf '%b\n' "$(G)✓$(R) Artefacts dans $(B)dist/$(R)"

## preview — Tester le build comme en prod
preview: build
	@printf '%b\n' "$(C)▸ preview http://$(PREVIEW_HOST):$(PREVIEW_PORT)$(R)"
	@$(NPM) run preview -- --host $(PREVIEW_HOST) --port $(PREVIEW_PORT)

## clean — Retire dist/
clean:
	@printf '%b\n' "$(Y)▸ rm -rf dist$(R)"
	@rm -rf dist

## distclean — clean + node_modules (réinstall ensuite avec make install)
distclean: clean
	@printf '%b\n' "$(Y)▸ rm -rf node_modules$(R)"
	@rm -rf node_modules

## setup — .env depuis l’exemple (sans écraser un .env existant)
setup env:
	@if [ ! -f .env ] && [ -f .env.example ]; then \
		cp .env.example .env; \
		printf '%b\n' "$(G)✓$(R) Fichier $(B).env$(R) créé à partir de .env.example — pense à y mettre ta clé Gemini."; \
	elif [ -f .env ]; then \
		printf '%b\n' "$(Y)!$(R) .env existe déjà, rien n’a été modifié."; \
	else \
		printf '%b\n' "$(Y)!$(R) Pas de .env.example trouvé."; \
	fi

## doctor — Sanity check environnement
doctor:
	@printf '%b\n' "$(C)▸ Node$(R)  $$(node -v 2>/dev/null || printf '%b' '$(Y)manquant$(R)')"
	@printf '%b\n' "$(C)▸ npm$(R)   $$(npm -v 2>/dev/null || printf '%b' '$(Y)manquant$(R)')"
	@command -v $(NPM) >/dev/null && printf '%b\n' "$(G)✓$(R) npm OK" || printf '%b\n' "$(Y)!$(R) npm introuvable"
