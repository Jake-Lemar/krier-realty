output "supabase_project_id" {
  description = "Supabase project reference ID"
  value       = supabase_project.main.id
}

output "supabase_project_url" {
  description = "Supabase project API URL"
  value       = "https://${supabase_project.main.id}.supabase.co"
}

output "supabase_db_pooler_url" {
  description = "Transaction pooler URL (port 6543) — use as DATABASE_URL at runtime"
  value       = "postgresql://postgres.${supabase_project.main.id}:[password]@aws-0-${var.supabase_region}.pooler.supabase.com:6543/postgres"
  sensitive   = false
}

output "upstash_redis_endpoint" {
  description = "Upstash Redis REST URL"
  value       = "https://${upstash_redis_database.cache.database_id}.upstash.io"
}

output "vercel_api_project_id" {
  description = "Vercel project ID for the API — set as VERCEL_API_PROJECT_ID in GitHub secrets"
  value       = vercel_project.api.id
}

output "vercel_frontend_project_id" {
  description = "Vercel project ID for the frontend — set as VERCEL_FRONTEND_PROJECT_ID in GitHub secrets"
  value       = vercel_project.frontend.id
}
