# Enable bash completion
if [ -f /etc/bash_completion ]; then
    . /etc/bash_completion
fi

# Docker compose aliases
alias dcup='docker compose up --build -d'
alias dlogb='docker logs -f pyspur-backend-1 --since 5m'
alias dlogf='docker logs -f pyspur-frontend-1 --since 5m'
alias dlogn='docker logs -f pyspur-nginx-1 --since 5m'
alias dlogs='docker compose logs -f --since 5m'

# Add color to the terminal
export PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '