#!/usr/bin/env bash
#
# Configura Workload Identity Federation (WIF) per permettere a GitHub Actions
# di autenticarsi su Google Cloud senza chiavi di service account statiche,
# e crea/configura il service account usato per il deploy di Firebase Functions.
#
# Idempotente: puo' essere rilanciato piu' volte in sicurezza, salta i passi
# gia' completati.
#
# Prerequisiti: gcloud autenticato con permessi sufficienti (Owner/IAM Admin +
# Service Usage Admin) sul progetto GCP target.

set -euo pipefail

# --- Variabili di configurazione ---------------------------------------

PROJECT_ID="insieme-dev-4450f"
GITHUB_REPO="web-developers-italia/telegram-bot"
SA_NAME="github-deploy"
POOL="github"
PROVIDER="github-oidc"
LOCATION="global"

SA_EMAIL="${SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# --- 1. Abilita le API necessarie ---------------------------------------

echo "==> Abilito le API necessarie su ${PROJECT_ID}..."
gcloud services enable \
  run.googleapis.com \
  artifactregistry.googleapis.com \
  eventarc.googleapis.com \
  cloudbuild.googleapis.com \
  cloudfunctions.googleapis.com \
  secretmanager.googleapis.com \
  firebaserules.googleapis.com \
  iamcredentials.googleapis.com \
  --project="${PROJECT_ID}"

# --- 2. Crea il service account di deploy (se non esiste) ---------------

echo "==> Verifico il service account ${SA_EMAIL}..."
if gcloud iam service-accounts describe "${SA_EMAIL}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
  echo "    Gia' esistente, salto la creazione."
else
  echo "    Non esiste, lo creo."
  gcloud iam service-accounts create "${SA_NAME}" \
    --project="${PROJECT_ID}" \
    --display-name="GitHub Actions Deploy"
fi

# Numero di progetto e service account di runtime di default (Compute Engine),
# usato di default dalle Cloud Functions v2 in fase di esecuzione.
PROJECT_NUMBER="$(gcloud projects describe "${PROJECT_ID}" --format='value(projectNumber)')"
RUNTIME_SA="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

# --- 3. Ruoli minimi per il service account di deploy --------------------

echo "==> Assegno i ruoli di progetto a ${SA_EMAIL}..."
gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/cloudfunctions.developer" \
  --condition=None >/dev/null

gcloud projects add-iam-policy-binding "${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/firebaserules.admin" \
  --condition=None >/dev/null

echo "==> Concedo a ${SA_EMAIL} il permesso di impersonare il runtime SA (${RUNTIME_SA})..."
gcloud iam service-accounts add-iam-policy-binding "${RUNTIME_SA}" \
  --project="${PROJECT_ID}" \
  --member="serviceAccount:${SA_EMAIL}" \
  --role="roles/iam.serviceAccountUser" >/dev/null

# --- 4. Accesso ai secret per il runtime SA ------------------------------
# Il codice delle Functions legge questi secret a runtime tramite il SA di
# default compute: gli serve quindi il ruolo secretAccessor sui singoli secret.

echo "==> Concedo l'accesso ai secret runtime (${RUNTIME_SA})..."
for secret in TELEGRAM_BOT_KEY TELEGRAM_WEBHOOK_SECRET; do
  if gcloud secrets describe "${secret}" --project="${PROJECT_ID}" >/dev/null 2>&1; then
    gcloud secrets add-iam-policy-binding "${secret}" \
      --project="${PROJECT_ID}" \
      --member="serviceAccount:${RUNTIME_SA}" \
      --role="roles/secretmanager.secretAccessor" >/dev/null
    echo "    ${secret}: binding creato."
  else
    echo "    ATTENZIONE: il secret ${secret} non esiste ancora, salto il binding (rilanciare lo script dopo averlo creato)." >&2
  fi
done

# --- 5. Workload Identity Pool + Provider per GitHub Actions -------------

echo "==> Verifico il Workload Identity Pool ${POOL}..."
if gcloud iam workload-identity-pools describe "${POOL}" \
    --project="${PROJECT_ID}" --location="${LOCATION}" >/dev/null 2>&1; then
  echo "    Gia' esistente, salto la creazione."
else
  echo "    Non esiste, lo creo."
  gcloud iam workload-identity-pools create "${POOL}" \
    --project="${PROJECT_ID}" \
    --location="${LOCATION}" \
    --display-name="GitHub Actions"
fi

echo "==> Verifico il provider OIDC ${PROVIDER}..."
if gcloud iam workload-identity-pools providers describe "${PROVIDER}" \
    --project="${PROJECT_ID}" --location="${LOCATION}" \
    --workload-identity-pool="${POOL}" >/dev/null 2>&1; then
  echo "    Gia' esistente, salto la creazione."
else
  echo "    Non esiste, lo creo (limitato al repository ${GITHUB_REPO})."
  gcloud iam workload-identity-pools providers create-oidc "${PROVIDER}" \
    --project="${PROJECT_ID}" \
    --location="${LOCATION}" \
    --workload-identity-pool="${POOL}" \
    --display-name="GitHub OIDC" \
    --issuer-uri="https://token.actions.githubusercontent.com" \
    --attribute-mapping="google.subject=assertion.sub,attribute.repository=assertion.repository,attribute.repository_owner=assertion.repository_owner" \
    --attribute-condition="assertion.repository == '${GITHUB_REPO}'"
fi

# --- 6. Consenti al repository GitHub di impersonare il SA di deploy ----

PRINCIPAL_SET="principalSet://iam.googleapis.com/projects/${PROJECT_NUMBER}/locations/${LOCATION}/workloadIdentityPools/${POOL}/attribute.repository/${GITHUB_REPO}"

echo "==> Collego il repository ${GITHUB_REPO} al service account di deploy..."
gcloud iam service-accounts add-iam-policy-binding "${SA_EMAIL}" \
  --project="${PROJECT_ID}" \
  --role="roles/iam.workloadIdentityUser" \
  --member="${PRINCIPAL_SET}" >/dev/null

# --- 7. Riepilogo: valori da salvare come GitHub secrets -----------------

WIF_PROVIDER="projects/${PROJECT_NUMBER}/locations/${LOCATION}/workloadIdentityPools/${POOL}/providers/${PROVIDER}"

echo
echo "=================================================================="
echo "Setup completato. Imposta questi GitHub secrets sul repository:"
echo
echo "  GCP_WIF_PROVIDER = ${WIF_PROVIDER}"
echo "  GCP_DEPLOY_SA    = ${SA_EMAIL}"
echo
echo "Comandi pronti (richiede gh autenticato con permessi sul repo):"
echo
echo "  gh secret set GCP_WIF_PROVIDER --repo ${GITHUB_REPO} --body \"${WIF_PROVIDER}\""
echo "  gh secret set GCP_DEPLOY_SA --repo ${GITHUB_REPO} --body \"${SA_EMAIL}\""
echo "=================================================================="
