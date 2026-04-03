# ═══════════════════════════════════════════════════════════════════════════
#  PharmAI — Makefile (Docker Compose uniquement)
#  Usage : make help   |   make up   |   make down
# ═══════════════════════════════════════════════════════════════════════════

SHELL        := /bin/bash
.SHELLFLAGS  := -eu -o pipefail -c
.DEFAULT_GOAL := help

DOCKER_COMPOSE ?= docker compose
SERVICE        ?= pharmai
PHARMAI_PORT   ?= 8080

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

.PHONY: help up start down stop logs ps build rebuild restart clean setup env doctor

## help — Affiche les cibles disponibles (défaut)
help:
	@printf '\n'
	@printf '%b\n' "$(B)$(M)  PharmAI$(R) $(C)~$(R) Docker Compose (nginx + build Vite)"
	@printf '\n'
	@printf '%b\n' "  $(G)make$(R) $(Y)up$(R) / $(Y)start$(R)   $(C)#$(R) démarre le service en arrière-plan"
	@printf '%b\n' "  $(G)make$(R) $(Y)down$(R) / $(Y)stop$(R)  $(C)#$(R) arrête et supprime les conteneurs"
	@printf '%b\n' "  $(G)make$(R) $(Y)logs$(R)           $(C)#$(R) suit les logs ($(SERVICE))"
	@printf '%b\n' "  $(G)make$(R) $(Y)ps$(R)             $(C)#$(R) état des services"
	@printf '%b\n' "  $(G)make$(R) $(Y)restart$(R)        $(C)#$(R) redémarre le service"
	@printf '%b\n' "  $(G)make$(R) $(Y)build$(R)          $(C)#$(R) construit l’image (sans lancer)"
	@printf '%b\n' "  $(G)make$(R) $(Y)rebuild$(R)       $(C)#$(R) build --no-cache puis $(Y)up$(R)"
	@printf '%b\n' "  $(G)make$(R) $(Y)clean$(R)          $(C)#$(R) supprime dist/ local (hors Docker)"
	@printf '%b\n' "  $(G)make$(R) $(Y)setup$(R)          $(C)#$(R) copie .env.example → .env si absent"
	@printf '%b\n' "  $(G)make$(R) $(Y)doctor$(R)         $(C)#$(R) vérifie Docker / Compose"
	@printf '\n'
	@printf '%b\n' "  Puis ouvre $(B)http://localhost:$(PHARMAI_PORT)$(R) (ou $(B)http://<IP_PC>:$(PHARMAI_PORT)$(R) depuis le téléphone)."
	@printf '%b\n' "  Port : variable $(C)PHARMAI_PORT$(R) (défaut $(PHARMAI_PORT)), clé Gemini : $(C).env$(R) pour le build."
	@printf '\n'
	@printf '%b\n' "  $(C)NO_COLOR=1 make help$(R)  pour désactiver les couleurs"
	@printf '\n'

## up / start — Lance le stack en arrière-plan
up start:
	@printf '%b\n' "$(C)▸ docker compose up -d$(R)"
	@$(DOCKER_COMPOSE) up -d
	@printf '%b\n' "$(G)✓$(R) App : $(B)http://localhost:$(PHARMAI_PORT)$(R) (vérifie $(C)PHARMAI_PORT$(R) dans .env si besoin)"

## down / stop — Arrête le stack
down stop:
	@printf '%b\n' "$(C)▸ docker compose down$(R)"
	@$(DOCKER_COMPOSE) down

## logs — Flux des logs du service
logs:
	@$(DOCKER_COMPOSE) logs -f $(SERVICE)

## ps — État
ps:
	@$(DOCKER_COMPOSE) ps -a

## build — Image uniquement
build:
	@printf '%b\n' "$(C)▸ docker compose build$(R)"
	@$(DOCKER_COMPOSE) build

## rebuild — Image sans cache puis up
rebuild:
	@printf '%b\n' "$(C)▸ docker compose build --no-cache$(R)"
	@$(DOCKER_COMPOSE) build --no-cache
	@$(MAKE) up

## restart — Redémarre le conteneur du service
restart:
	@printf '%b\n' "$(C)▸ docker compose restart $(SERVICE)$(R)"
	@$(DOCKER_COMPOSE) restart $(SERVICE)

## clean — dist/ local (optionnel ; l’app servie vient de l’image Docker)
clean:
	@printf '%b\n' "$(Y)▸ rm -rf dist$(R)"
	@rm -rf dist

## setup — .env depuis l’exemple (sans écraser un .env existant)
setup env:
	@if [ ! -f .env ] && [ -f .env.example ]; then \
		cp .env.example .env; \
		printf '%b\n' "$(G)✓$(R) Fichier $(B).env$(R) créé — renseigne $(C)VITE_GOOGLE_AI_API_KEY$(R) puis $(G)make rebuild$(R) pour l’embarquer."; \
	elif [ -f .env ]; then \
		printf '%b\n' "$(Y)!$(R) .env existe déjà, rien n’a été modifié."; \
	else \
		printf '%b\n' "$(Y)!$(R) Pas de .env.example trouvé."; \
	fi

## doctor — Docker / Compose
doctor:
	@command -v docker >/dev/null 2>&1 && printf '%b\n' "$(G)✓$(R) docker  $$(docker -v)" || { printf '%b\n' "$(Y)!$(R) docker introuvable"; exit 1; }
	@$(DOCKER_COMPOSE) version >/dev/null 2>&1 && printf '%b\n' "$(G)✓$(R) compose $$($(DOCKER_COMPOSE) version --short 2>/dev/null || $(DOCKER_COMPOSE) version)" || { printf '%b\n' "$(Y)!$(R) docker compose indisponible"; exit 1; }
