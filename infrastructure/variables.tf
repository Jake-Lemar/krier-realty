# ─── Vercel ───────────────────────────────────────────────────────────────────

variable "vercel_api_token" {
  description = "Vercel API token (Account Settings → Tokens)"
  type        = string
  sensitive   = true
}

variable "vercel_team_id" {
  description = "Vercel team/org ID (team_xxx from Account Settings)"
  type        = string
}

# ─── Supabase ─────────────────────────────────────────────────────────────────

variable "supabase_access_token" {
  description = "Supabase personal access token (supabase.com → Account → Access Tokens)"
  type        = string
  sensitive   = true
}

variable "supabase_organization_id" {
  description = "Supabase organization ID (supabase.com → org settings)"
  type        = string
}

variable "supabase_db_password" {
  description = "Database password for the Supabase project"
  type        = string
  sensitive   = true
}

variable "supabase_region" {
  description = "Supabase project region"
  type        = string
  default     = "us-east-1"
}

# ─── Upstash ──────────────────────────────────────────────────────────────────

variable "upstash_email" {
  description = "Upstash account email"
  type        = string
}

variable "upstash_api_key" {
  description = "Upstash API key (console.upstash.com → Account → Management API)"
  type        = string
  sensitive   = true
}

variable "upstash_region" {
  description = "Upstash Redis region"
  type        = string
  default     = "us-east-1"
}

# ─── App secrets ──────────────────────────────────────────────────────────────

variable "api_key" {
  description = "Shared API key between frontend and API (openssl rand -hex 32)"
  type        = string
  sensitive   = true
}

variable "admin_emails" {
  description = "Comma-separated list of emails allowed to access the admin portal"
  type        = string
  default     = "aaron@krierrealty.com"
}

variable "gemini_api_key" {
  description = "Google Gemini API key (aistudio.google.com)"
  type        = string
  sensitive   = true
}

variable "resend_api_key" {
  description = "Resend email API key (resend.com)"
  type        = string
  sensitive   = true
}

variable "lead_notify_email" {
  description = "Email address that receives lead notification emails"
  type        = string
  default     = "aaron@krierrealty.com"
}

variable "gprmls_client_id" {
  description = "GPRMLS OAuth client ID"
  type        = string
  default     = ""
}

variable "gprmls_client_secret" {
  description = "GPRMLS OAuth client secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "allowed_origins" {
  description = "Comma-separated CORS allowed origins for the API"
  type        = string
  default     = "https://krierrealty.com"
}

variable "supabase_ca_cert" {
  description = "Base64-encoded Supabase CA certificate PEM (for SSL verification)"
  type        = string
  sensitive   = true
  default     = ""
}
