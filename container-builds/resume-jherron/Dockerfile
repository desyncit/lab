FROM quay.io/lib/archlinux
RUN pacman -Sy hugo --noconfirm
RUN useradd -m hugo && mkdir /srv/blog
COPY blog/ /srv/blog
RUN chown hugo -R /srv/blog
USER hugo
WORKDIR /srv/blog
ENTRYPOINT ["/bin/sh", "-c","hugo server -e production"]
