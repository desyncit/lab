FROM quay.io/lib/archlinux
RUN pacman -Sy hugo --noconfirm
RUN useradd -m hugo && mkdir /srv/blog
COPY blog/ /srv/blog
WORKDIR /srv/blog
ENTRYPOINT ["/bin/sh", "-c","hugo server"]
