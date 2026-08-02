data "google_project" "this" {
  project_id = var.project_id
}

locals {
  # Runtime SA di default (Compute Engine) usato dalle Cloud Functions v2 a runtime.
  runtime_sa = "${data.google_project.this.number}-compute@developer.gserviceaccount.com"

  services = [
    "run.googleapis.com",
    "artifactregistry.googleapis.com",
    "eventarc.googleapis.com",
    "cloudbuild.googleapis.com",
    "cloudfunctions.googleapis.com",
    "secretmanager.googleapis.com",
    "firebaserules.googleapis.com",
    "firestore.googleapis.com",
    "firebase.googleapis.com",
    "firebaseextensions.googleapis.com",
    "compute.googleapis.com",
    "pubsub.googleapis.com",
    "storage.googleapis.com",
    "logging.googleapis.com",
    "cloudscheduler.googleapis.com",
    "cloudbilling.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "serviceusage.googleapis.com",
    "cloudresourcemanager.googleapis.com",
  ]

  # Secret runtime letti dal codice (i VALORI non stanno qui: le versioni si creano
  # con `firebase functions:secrets:set` / gcloud — vedi README).
  secrets = ["TELEGRAM_BOT_KEY", "TELEGRAM_WEBHOOK_SECRET"]

  # Ruoli del SA di deploy: sufficienti per il primo deploy gen2 (che orchestra
  # Cloud Run + Artifact Registry + Cloud Build) via firebase-tools, oltre a
  # Firestore rules e ai secret. SA dedicato e vincolato via WIF a un solo repo.
  deploy_roles = [
    "roles/cloudfunctions.admin",
    "roles/run.admin",
    "roles/artifactregistry.admin",
    "roles/cloudbuild.builds.editor",
    "roles/eventarc.admin",
    "roles/firebaserules.admin",
    "roles/iam.serviceAccountUser",
    "roles/serviceusage.serviceUsageAdmin",
    "roles/secretmanager.admin",
    "roles/firebase.admin",
  ]
}

resource "google_project_service" "enabled" {
  for_each = toset(local.services)

  project                    = var.project_id
  service                    = each.value
  disable_on_destroy         = false
  disable_dependent_services = false
}

# --- Service account di deploy (GitHub Actions) --------------------------------

resource "google_service_account" "deploy" {
  project      = var.project_id
  account_id   = var.deploy_sa_id
  display_name = "GitHub Actions Deploy"

  depends_on = [google_project_service.enabled]
}

resource "google_project_iam_member" "deploy_roles" {
  for_each = toset(local.deploy_roles)

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deploy.email}"
}

# --- Workload Identity Federation per GitHub Actions ---------------------------

resource "google_iam_workload_identity_pool" "github" {
  project                   = var.project_id
  workload_identity_pool_id = "github"
  display_name              = "GitHub Actions"

  depends_on = [google_project_service.enabled]
}

resource "google_iam_workload_identity_pool_provider" "github_oidc" {
  project                            = var.project_id
  workload_identity_pool_id          = google_iam_workload_identity_pool.github.workload_identity_pool_id
  workload_identity_pool_provider_id = "github-oidc"
  display_name                       = "GitHub OIDC"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
  }

  # Solo questo repo può impersonare il SA di deploy.
  attribute_condition = "assertion.repository == '${var.github_repo}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }
}

resource "google_service_account_iam_member" "wif_binding" {
  service_account_id = google_service_account.deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/${google_iam_workload_identity_pool.github.name}/attribute.repository/${var.github_repo}"
}

# --- Firestore -----------------------------------------------------------------

resource "google_firestore_database" "default" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"

  depends_on = [google_project_service.enabled]
}

# TTL: elimina i documenti members_activity ~90gg dopo l'ultima attività
# (il campo expiresAt è scritto dal codice come lastActivity + 90gg).
resource "google_firestore_field" "members_ttl" {
  project    = var.project_id
  database   = google_firestore_database.default.name
  collection = "members_activity"
  field      = "expiresAt"

  ttl_config {}

  # Non gestiamo indici su questo campo (non ci interroghiamo sopra).
  index_config {}
}

# --- Secret Manager (contenitori; i valori si aggiungono a parte) --------------

resource "google_secret_manager_secret" "runtime" {
  for_each = toset(local.secrets)

  project   = var.project_id
  secret_id = each.value

  replication {
    auto {}
  }

  depends_on = [google_project_service.enabled]
}

# Il runtime SA legge i secret a runtime.
resource "google_secret_manager_secret_iam_member" "runtime_accessor" {
  for_each = toset(local.secrets)

  project   = var.project_id
  secret_id = google_secret_manager_secret.runtime[each.key].secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${local.runtime_sa}"
}
