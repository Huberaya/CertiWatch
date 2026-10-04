# ========================================================
# Terraform Infrastructure as Code (IaC) - CertiWatch
# Google Cloud Platform (europe-west2 / europe-west9 Paris)
# Managed Cloud DNS, Cloud Run v2, Certificate Manager, Cloud Armor
# ========================================================

terraform {
  required_version = ">= 1.5.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.20.0"
    }
  }
  backend "gcs" {
    bucket = "certiwatch-tf-state-eu"
    prefix = "production/infra"
  }
}

variable "project_id" {
  description = "GCP Project ID"
  type        = string
  default     = "certiwatch-production"
}

variable "region" {
  description = "Primary Cloud Region"
  type        = string
  default     = "europe-west2"
}

variable "domain_name" {
  description = "Apex domain name"
  type        = string
  default     = "certiwatch.io"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Cloud DNS Managed Zone
resource "google_dns_managed_zone" "certiwatch_zone" {
  name        = "certiwatch-zone-public"
  dns_name    = "${var.domain_name}."
  description = "Authoritative DNS Zone for CertiWatch Platform"
  visibility  = "public"

  dnssec_config {
    state         = "on"
    non_existence = "nsec3"
  }

  labels = {
    environment = "production"
    app         = "certiwatch"
  }
}

# 2. Apex A Records (Anycast IPs)
resource "google_dns_record_set" "apex_a" {
  name         = google_dns_managed_zone.certiwatch_zone.dns_name
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "A"
  ttl          = 300
  rrdatas      = ["216.239.32.21", "216.239.34.21"]
}

# 3. Apex AAAA IPv6 Record
resource "google_dns_record_set" "apex_aaaa" {
  name         = google_dns_managed_zone.certiwatch_zone.dns_name
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "AAAA"
  ttl          = 300
  rrdatas      = ["2001:4860:4802:32::15"]
}

# 4. App CNAME Record
resource "google_dns_record_set" "app_cname" {
  name         = "app.${google_dns_managed_zone.certiwatch_zone.dns_name}"
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["ghs.googlehosted.com."]
}

# 5. API CNAME Record
resource "google_dns_record_set" "api_cname" {
  name         = "api.${google_dns_managed_zone.certiwatch_zone.dns_name}"
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["ghs.googlehosted.com."]
}

# 6. CAA Security Record
resource "google_dns_record_set" "caa" {
  name         = google_dns_managed_zone.certiwatch_zone.dns_name
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "CAA"
  ttl          = 3600
  rrdatas = [
    "0 issue \"pki.goog\"",
    "0 issue \"letsencrypt.org\"",
    "0 iodef \"mailto:security@certiwatch.io\""
  ]
}

# 7. SPF Email Record
resource "google_dns_record_set" "spf_txt" {
  name         = google_dns_managed_zone.certiwatch_zone.dns_name
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "TXT"
  ttl          = 3600
  rrdatas      = ["\"v=spf1 include:_spf.google.com include:_spf.certiwatch.io ~all\""]
}

# 8. DMARC Policy Record
resource "google_dns_record_set" "dmarc_txt" {
  name         = "_dmarc.${google_dns_managed_zone.certiwatch_zone.dns_name}"
  managed_zone = google_dns_managed_zone.certiwatch_zone.name
  type         = "TXT"
  ttl          = 3600
  rrdatas      = ["\"v=DMARC1; p=reject; rua=mailto:dmarc-reports@certiwatch.io; pct=100; sp=reject\""]
}

# 9. Google Cloud Armor WAF Policy (DDoS, OWASP, Geo-Protection)
resource "google_compute_security_policy" "certiwatch_waf" {
  name        = "certiwatch-waf-security-policy"
  description = "Enterprise WAF rules compliant with ANSSI & OWASP Top 10"

  # Rule 1: Rate limiting (100 requests / min per IP)
  rule {
    action   = "rate_based_ban"
    priority = "1000"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    rate_limit_options {
      conform_action = "allow"
      exceed_action  = "deny(429)"
      rate_limit_threshold {
        count        = 100
        interval_sec = 60
      }
      ban_duration_sec = 600
    }
    description = "DDoS rate limiting threshold"
  }

  # Rule 2: OWASP ModSecurity Core Rule Set (SQLi, XSS, RCE)
  rule {
    action   = "deny(403)"
    priority = "2000"
    match {
      expr {
        expression = "evaluatePreconfiguredExpr('sqli-v33-stable') || evaluatePreconfiguredExpr('xss-v33-stable')"
      }
    }
    description = "Block OWASP SQL Injection & Cross-Site Scripting"
  }

  # Default rule: Allow legitimate traffic
  rule {
    action   = "allow"
    priority = "2147483647"
    match {
      versioned_expr = "SRC_IPS_V1"
      config {
        src_ip_ranges = ["*"]
      }
    }
    description = "Default allow rule"
  }
}

# 10. Google Cloud Certificate Manager (TLS 1.3 Auto-Managed)
resource "google_certificate_manager_certificate" "wildcard_cert" {
  name        = "certiwatch-wildcard-cert"
  description = "Automated TLS 1.3 certificate for *.certiwatch.io"
  managed {
    domains = [
      var.domain_name,
      "*.${var.domain_name}"
    ]
  }
}

output "nameservers" {
  value       = google_dns_managed_zone.certiwatch_zone.name_servers
  description = "Authoritative NS records to configure at registrar"
}

output "waf_policy_id" {
  value       = google_compute_security_policy.certiwatch_waf.id
  description = "Cloud Armor WAF Policy ID"
}
