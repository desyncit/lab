BUILDDIR=.
TAG=v0.1
IMAGE=quay.io/tampadevs/rook-ceph-obc-plugin:$(TAG)
LATEST=quay.io/tampadevs/rook-ceph-obc-plugin:latest

default: build push

build:
	podman build \
	$(BUILDDIR) \
	--squash-all \
	--no-cache \
	-t $(IMAGE) \
        -t $(LATEST) 

push:
	podman push $(IMAGE) $(LATEST)
