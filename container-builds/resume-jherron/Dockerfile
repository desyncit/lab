FROM registry.archlinux.org/archlinux/archlinux-docker:base-master
RUN pacman -Sy hugo make --noconfirm
RUN useradd -m hugo && \
    mkdir /srv/blog && \
    chgrp -R 0 /srv/blog && \
    chmod -R g=u /srv/blog && \
    chown hugo -R /srv/blog
COPY blog/ /srv/blog
USER hugo
WORKDIR /srv/blog
ENTRYPOINT ["/bin/sh", "-c","make server"]
