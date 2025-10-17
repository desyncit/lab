TAG=latest

build:
	ansible-builder build --extra-build-cli-args="--sign-by jherron@net-dev.net" --squash all --no-cache --prune-images -t quay.io/jherron/ee-centos:$(TAG)

clean:
	rm -rf context && podman rmi quay.io/jherron/ee-centos:$(TAG)
