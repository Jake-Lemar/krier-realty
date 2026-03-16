# ─── Supabase ─────────────────────────────────────────────────────────────────

resource "supabase_project" "main" {
  name            = "krier-realty"
  organization_id = var.supabase_organization_id
  database_password = var.supabase_db_password
  region          = var.supabase_region

  lifecycle {
    # Prevent accidental destruction of the database
    prevent_destroy = true
    # Don't recreate if password changes — update it via Supabase dashboard
    ignore_changes = [database_password]
  }
}

# Enable Google OAuth provider in Supabase Auth
resource "supabase_settings" "auth" {
  project_ref = supabase_project.main.id

  auth = jsonencode({
    site_url                 = "https://krierrealty.com"
    additional_redirect_urls = ["http://localhost:4200"]

    email = {
      enable_signup          = true
      enable_confirmations   = false
      secure_email_change_enabled = true
    }

    # Magic link / OTP
    mailer_otp_exp = 3600

    # External OAuth — fill in secrets in Supabase dashboard after provisioning
    # (Supabase provider doesn't expose OAuth secrets as managed resources)
  })
}

# ─── Upstash Redis ────────────────────────────────────────────────────────────

resource "upstash_redis_database" "cache" {
  database_name = "krier-realty-cache"
  region        = var.upstash_region
  tls           = true

  lifecycle {
    prevent_destroy = true
  }
}

# ─── Vercel: API project ──────────────────────────────────────────────────────

resource "vercel_project" "api" {
  name      = "krier-realty-backend"
  framework = null # Hono/Node — not a recognized framework

  git_repository = {
    type              = "github"
    repo              = "jakelemar/real-estate" # update to your GitHub repo
    production_branch = "main"
  }

  # Disable Vercel auto-deploy — CI/CD is handled by GitHub Actions
  automatically_expose_system_environment_variables = false

  root_directory = "api"
}

resource "vercel_project_environment_variable" "api_env" {
  for_each   = local.api_env_vars
  project_id = vercel_project.api.id
  key        = each.key
  value      = each.value
  target     = ["production"]
  sensitive  = contains(local.sensitive_keys, each.key)
}

# ─── Vercel: Frontend project ─────────────────────────────────────────────────

resource "vercel_project" "frontend" {
  name      = "krier-realty-frontend"
  framework = "angular"

  git_repository = {
    type              = "github"
    repo              = "jakelemar/real-estate" # update to your GitHub repo
    production_branch = "main"
  }

  automatically_expose_system_environment_variables = false

  root_directory = "frontend"
}

resource "vercel_project_environment_variable" "frontend_env" {
  for_each   = local.frontend_env_vars
  project_id = vercel_project.frontend.id
  key        = each.key
  value      = each.value
  target     = ["production"]
  sensitive  = contains(local.sensitive_keys, each.key)
}

# ─── Locals: environment variable maps ────────────────────────────────────────

locals {
  sensitive_keys = [
    "DATABASE_URL",
    "DATABASE_DIRECT_URL",
    "SUPABASE_CA_CERT",
    "API_KEY",
    "GEMINI_API_KEY",
    "RESEND_API_KEY",
    "GPRMLS_CLIENT_SECRET",
    "UPSTASH_REDIS_REST_TOKEN",
    "PGPASSWORD",
  ]

  api_env_vars = {
    NODE_ENV     = "production"
    DATABASE_URL = "postgresql://postgres.${supabase_project.main.id}:${var.supabase_db_password}@aws-0-${var.supabase_region}.pooler.supabase.com:6543/postgres"

    SUPABASE_URL    = "https://${supabase_project.main.id}.supabase.co"
    SUPABASE_CA_CERT = var.supabase_ca_cert

    API_KEY          = var.api_key
    ADMIN_EMAILS     = var.admin_emails
    ALLOWED_ORIGINS  = var.allowed_origins

    GEMINI_API_KEY   = var.gemini_api_key
    RESEND_API_KEY   = var.resend_api_key
    LEAD_NOTIFY_EMAIL = var.lead_notify_email
    FROM_EMAIL       = "noreply@krierrealty.com"

    GPRMLS_TOKEN_URL     = "https://auth.gprmls.com/connect/token"
    GPRMLS_BASE_URL      = "https://api.gprmls.com/reso/odata"
    GPRMLS_CLIENT_ID     = var.gprmls_client_id
    GPRMLS_CLIENT_SECRET = var.gprmls_client_secret
    AGENT_MLS_ID         = "NE-45821"
    LISTING_CACHE_TTL    = "300"

    UPSTASH_REDIS_REST_URL   = upstash_redis_database.cache.rest_token == "" ? "" : "https://${upstash_redis_database.cache.database_id}.upstash.io"
    UPSTASH_REDIS_REST_TOKEN = upstash_redis_database.cache.rest_token
  }

  frontend_env_vars = {
    NG_APP_API_URL = "https://${vercel_project.api.name}.vercel.app"
    NG_APP_API_KEY = var.api_key
  }
}
