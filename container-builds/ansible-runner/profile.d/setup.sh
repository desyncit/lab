echo ${PLAYBOOK_PASSKEY} > ${ANSIBLE_VAULT_PASSWORD_FILE}
ansible-vault decrypt /home/$USER/.ssh/runner &>/dev/null 
