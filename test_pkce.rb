#!/usr/bin/env ruby
require 'digest'
require 'base64'
require 'securerandom'

# PKCE Helper Functions
def generate_code_verifier
  SecureRandom.urlsafe_base64(32)
end

def generate_code_challenge(verifier)
  Base64.urlsafe_encode64(
    Digest::SHA256.digest(verifier),
    padding: false
  )
end

# Generate PKCE values
code_verifier = generate_code_verifier
code_challenge = generate_code_challenge(code_verifier)

puts "PKCE Values Generated:"
puts "=" * 60
puts "Code Verifier:  #{code_verifier}"
puts "Code Challenge: #{code_challenge}"
puts "=" * 60
puts
puts "Use these in your OAuth flow:"
puts
puts "1. Authorization Request (add to URL):"
puts "   code_challenge=#{code_challenge}"
puts "   code_challenge_method=S256"
puts
puts "2. Token Request (add to POST body):"
puts "   code_verifier=#{code_verifier}"
puts
