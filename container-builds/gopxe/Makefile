IMAGE=quay.io/desync/gopxe:1.0.0

default: build replace

build:
	podman build --no-cache --squash-all . -t quay.io/desync/gopxe:1.0.0

replace:
	podman run --rm --detach --replace --name=gopxe --volume pxeImages:/srv/ --network=host $(IMAGE)

ign:
	butane --strict --pretty < ./server/dropin.d/ibmMQ-butane.bu > /srv/http/scos/ignition.ign
