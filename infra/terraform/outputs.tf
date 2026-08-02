output "wif_provider" {
  description = "Valore per il GitHub secret GCP_WIF_PROVIDER"
  value       = google_iam_workload_identity_pool_provider.github_oidc.name
}

output "deploy_sa_email" {
  description = "Valore per il GitHub secret GCP_DEPLOY_SA"
  value       = google_service_account.deploy.email
}

output "runtime_sa" {
  description = "Runtime SA delle Cloud Functions v2 (accesso ai secret)"
  value       = local.runtime_sa
}
