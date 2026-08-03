terraform {
  required_version = ">= 1.6"

  # Stato remoto condiviso (CI + admin locali). Il bucket è un seed di bootstrap
  # creato fuori da questa config (vedi infra/README), così Terraform non gestisce
  # lo storage del proprio stato.
  backend "gcs" {
    bucket = "wdi-telegram-bot-tfstate"
    prefix = "telegram-bot"
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.0, < 8.0"
    }
  }
}

# Provider senza blocco credentials: usa GOOGLE_OAUTH_ACCESS_TOKEN dall'ambiente
# (esportato da `gcloud auth print-access-token`) così il bootstrap non richiede
# ADC separate. billing_project + user_project_override coprono le API (Firebase,
# Firestore) che pretendono un quota project con le user credentials.
provider "google" {
  project               = var.project_id
  region                = var.region
  billing_project       = var.project_id
  user_project_override = true
}
