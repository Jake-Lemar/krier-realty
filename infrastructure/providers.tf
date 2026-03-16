terraform {
  required_version = ">= 1.6"

  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
    supabase = {
      source  = "supabase/supabase"
      version = "~> 1.0"
    }
    upstash = {
      source  = "upstash/upstash"
      version = "~> 1.5"
    }
  }

  # Uncomment and configure for remote state (recommended for teams):
  # backend "s3" {
  #   bucket  = "krier-realty-tfstate"
  #   key     = "prod/terraform.tfstate"
  #   region  = "us-east-1"
  #   encrypt = true
  # }
}

provider "vercel" {
  api_token = var.vercel_api_token
  team      = var.vercel_team_id
}

provider "supabase" {
  access_token = var.supabase_access_token
}

provider "upstash" {
  email   = var.upstash_email
  api_key = var.upstash_api_key
}
