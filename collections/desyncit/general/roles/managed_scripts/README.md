Managed scripts
=========
Role to manage the state and the execution of scripts on managed nodes  


Role Variables
--------------


Example Playbook
----------------
```yaml
- name: Run scripts on managed nodes
  hosts: all

  vars:
     managed_scripts_manifest:
      - name: Short description
        repo_name:   # name of github repo
        repo_branch: # upstream branch
        repo_path:   # path name relative to upstream gitrepo
        repo_dest_host:
          - name: {{ inventory_hostname }}
            dest: # where on managed node to put

     managed_scripts_deployment:
      - name: Short description
        target_hosts: {{ inventory_hostname }} executing the script
        path: # absolute pathname relative to {{ inventory_hostname }}
        cron_enable: false  # whether or not to manage cron_job
          - name: # Name of cron job
            minute: '*/20'
            hour: '*'
            day_of_month: '*'
            month: '*'
            day_of_week: '*'
            job: 'shell command or absolute path name'

  roles:
    - managed_scripts
```
