[beaker-docs]: https://beaker-project.org/docs/


### Beaker Role 

Used this role to bootstrap an operating system to the baremetal over PXE in an environment that uses beaker to management the baremetal.  

See [upstream beaker documentation][beaker-docs] for more information.


#### How to use

To use this role variables below need to be set and a beaker server needs to be reachable.

- Beaker Client variables
```yaml
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

- Kickstart template variables
```yaml
- var: hub_url
  type: string
  default: "https://beaker.serverurl.com"
  memo: Sets the beaker server endpoint to communicate with.

- var: rhsm_release
  value: Integer
  default: None
  memo: set if deploying Red Hat Enterprise Linux `>=8.0`
  needs:
    with_vars:
      rhsm_org: defaults to None
      rhsm_key: default to None
```
