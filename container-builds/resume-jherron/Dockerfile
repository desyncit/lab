FROM quay.io/lib/archlinux
RUN pacman -Sy hugo --noconfirm
RUN useradd -m hugo && \
    mkdir /srv/blog && \
    chgrp -R 0 /srv/blog && \
    chmod -R g=u /srv/blog && \
    chown hugo -R /srv/blog
COPY blog/ /srv/blog
USER hugo
WORKDIR /srv/blog
ENTRYPOINT ["/bin/sh", "-c","hugo server --bind 0.0.0.0 --baseURL http://$HOSTNAME -e Production"]
