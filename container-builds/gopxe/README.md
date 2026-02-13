### GOPXE

Gopxe is a web + ipxe chainloader, using a tftp server hosted somewhere on the same flat network. 

Embed a script into the ipxe binary in order to chain load to a webserver.
```
$ git clone https://github.com/ipxe/ipxe.git
``` 

embed.ipxe
```
#!ipxe

prompt --key 0x02 --timeout 2000 Press Ctrl-B for the iPXE command line... && shell ||
                                                             
:retry                                                       
dhcp                                                         
chain http://<replace-me-with-a-hostname>:8080/main.ipxe || goto retry
```

make it 
```
$ make bin-x86_64-efi/ipxe.efi EMBED=embed.ipxe
```

The Makefile included in this repository abstracts out the podman 
dependencies.

Default action of the `Makefile` is to `build` then create a volume and finnally run it.
```
make
```





References
[1] iPXE https://ipxe.org/
[2] Chainloading iPXE https://ipxe.org/howto/chainloading
