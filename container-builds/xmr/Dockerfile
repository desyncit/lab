FROM docker.io/archlinux/archlinux
RUN  pacman -Sy --noconfirm curl
COPY etc/ /etc/
COPY init.sh /usr/local/bin/ 
ENTRYPOINT ["init.sh"]
