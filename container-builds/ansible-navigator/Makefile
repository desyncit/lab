TAG=latest
IMAGE=quay.io/jherron/ee-centos
define CLEAN_UP
  @rm -rf context ansible-navigator.log
  @podman rmi -f -i quay.io/jherron/ee-centos:$(TAG) 
endef

default: build

clean:
	$(call CLEAN_UP)

build:
	ansible-navigator builder build \
		--extra-build-cli-args="--sign-by jherron@net-dev.net" \
		--squash all \
		--no-cache \
		-vvv \
		--prune-images \
		-t $(IMAGE):$(TAG)
push:
	podman push $(IMAGE):$(TAG)
	clean

