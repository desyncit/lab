### GOPXE
Uses the concept of chainloading where some configurations enable PXE boot through UEFI and then proceed to 
chainload iPXE for extended functionality.Tested this so far using the builtin tftp server inside 
Mikrotik's RB4011 router. 

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
make bin-x86_64-efi/ipxe.efi EMBED=embed.ipxe
```


```
podman volume create \
       --opt type=none \
       --opt device=/srv/http 
       --opt o=rbind pxeImages
```





References
[1] iPXE https://ipxe.org/
[2] Chainloading iPXE https://ipxe.org/howto/chainloading
