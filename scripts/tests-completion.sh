#!/bin/bash
#
# Bash completion script for KhoAugment integration tests
# Save this file to /etc/bash_completion.d/ or source it in your .bashrc
#

_khoaugment_tests() {
  local cur prev opts
  COMPREPLY=()
  cur="${COMP_WORDS[COMP_CWORD]}"
  prev="${COMP_WORDS[COMP_CWORD-1]}"
  
  # Main commands
  opts="run-integration-tests verify-api-health view-dashboard"
  
  # Options for specific commands
  case "${prev}" in
    run-integration-tests)
      opts="--browser --viewport --headless --project --debug --ci --workers --lang"
      ;;
    verify-api-health)
      opts="--verbose --json --timeout"
      ;;
    --browser)
      opts="chrome firefox webkit"
      ;;
    --project)
      opts="Chrome\ Desktop Firefox\ Desktop Mobile\ Chrome Mobile\ Safari"
      ;;
    --lang)
      opts="en-US vi-VN"
      ;;
    *)
      ;;
  esac
  
  COMPREPLY=( $(compgen -W "${opts}" -- ${cur}) )
  return 0
}

complete -F _khoaugment_tests scripts/run-integration-tests.sh
complete -F _khoaugment_tests tests/verify-api-health.js
complete -F _khoaugment_tests open\ test-results/integration-dashboard.html 