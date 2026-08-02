variable "project_id" {
  description = "ID del progetto GCP che ospita il bot"
  type        = string
  default     = "wdi-telegram-bot"
}

variable "region" {
  description = "Region delle Cloud Functions v2 e del database Firestore"
  type        = string
  default     = "europe-west1"
}

variable "github_repo" {
  description = "owner/repo autorizzato a deployare via Workload Identity Federation"
  type        = string
  default     = "web-developers-italia/telegram-bot"
}

variable "deploy_sa_id" {
  description = "account_id del service account usato da GitHub Actions per il deploy"
  type        = string
  default     = "github-deploy"
}
