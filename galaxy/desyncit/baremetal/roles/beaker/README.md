[beaker-docs]: https://beaker-project.org/docs/

### Beaker Role 

This role is used to bootstrap an operating system to the baremetal in environment that uses beaker.

See [upstream beaker documentation][beaker-docs] for more information.


#### How to use

```yaml
- name: Test playbook
  hosts: all
  collections:
    - desyncit.basos

  tasks:

  - name: Beaker role using simple auth
    ansible.builtin.include_role:
      name: beaker
    vars:
     # bkr-client
     hub_url: "https://beaker.example.com"
     auth_method: "simple"
     auth_username: {}
     auth_password: {}
     # Kickstart if using rhel release
     rhsm_release: 8
     rhsm_org: {}
     rhsm_key: {}

  - name: Beaker role using krbv auth
    ansible.builtin.include_role:
      name: beaker
    vars:
     # bkr-client
     hub_url: "https://beaker.example.com"
     kerb_realm: {}
     kerb_principal: {}
     kerb_password: {}
     # Kickstart if using rhel release
     rhsm_release: {}
     rhsm_org: {}
     rhsm_key: {}
``` 
---

#### Variable definitions and default states

Beaker Client variables

```yaml
- var: hub_url
  type: string
  default: "https://beaker.serverurl.com"
  memo: Sets the beaker server endpoint to communicate with.

- var: auth_method
  type: string
  default: krbv
  needs:
    - arg: simple
      with_vars:
        auth_username: defaults to admin
        auth_password: default to password
    - arg: krbv
      with_vars:
        kerb_realm: defaults to REALM.EXAMPLE.COM
        kerb_principal: defaults to value of {{ auth_username }}
        kerb_password: defaults to value of {{ auth_password }}
```

Kickstart template variables

```yaml
- var: rhsm_release
  value: Integer
  default: None
  memo: set if deploying Red Hat Enterprise Linux `>=8`
  needs:
    with_vars:
      rhsm_org: defaults to None
      rhsm_key: default to None
```
