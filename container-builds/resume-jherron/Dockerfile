FROM quay.io/lib/archlinux
RUN pacman -Sy hugo --noconfirm
RUN useradd -m hugo && \
    mkdir /srv/blog && \
    chgrp -R 0 /srv/blog && \
    chmod -R g=u /srv/blog
COPY blog/ /srv/blog
RUN chown hugo -R /srv/blog
USER hugo
WORKDIR /srv/blog
ENTRYPOINT ["/bin/sh", "-c","hugo server --baseURL=http://blog-jherron.ontampa-dev-jherron.svc.cluster.local -e Production"]
