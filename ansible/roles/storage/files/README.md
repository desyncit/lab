We don't want to render the jinja2 code in roles/storage/files/haproxy.cfg
because we want the cephadm orchestrator to render this out.

For example, cephadm uses lines 9-19 to detemine if we are in https or in http so if we render this 
at the time of ansible-playbooks run this would break cephadms ability to render this.
```
  9 {% if spec.ssl_cert %}
 10   {% if spec.ssl_dh_param %}
 11     tune.ssl.default-dh-param {{ spec.ssl_dh_param }}
 12   {% endif %}
 13   {% if spec.ssl_ciphers %}
 14     ssl-default-bind-ciphers {{ spec.ssl_ciphers | join(':') }}
 15   {% endif %}
 16   {% if spec.ssl_options %}
 17     ssl-default-bind-options {{ spec.ssl_options | join(' ') }}
 18   {% endif %}
 19 {% endif %}
```  


The parts we care about are
```
 20  
 21 userlist registryauth
 22   user gaspar $5$8Xo5a4v5Lkiv0DZZ$M6Tj0C3ISe6Ux0.cF9IBzIIfbkmmFk73uYdaMfSZCTD
 23  
``` 
