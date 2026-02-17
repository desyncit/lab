TAG=1.1.0
IMAGE=quay.io/desync/gopxe
HOSTPATH=/srv/http
IGNITION_FILES := $(patsubst nodes/%-butane.bu,$(HOSTPATH)/scos/ignition-%.ign,$(wildcard nodes/*.bu))

default: build volume

build:
	podman build --no-cache --squash-all . -t $(IMAGE):$(TAG) -t $(IMAGE):latest

push: build
	podman push $(IMAGE):$(TAG) $(IMAGE):latest

volume:
	podman volume create \
		--opt type=none \
		--opt device=$(HOSTPATH) \
		--opt o=rbind pxeImages \
        || echo "Volume already exists"

replace:
	podman run --rm --detach --replace --name=gopxe --volume pxeImages:/srv/ --network=host $(IMAGE):$(TAG)

run:
	podman run --rm --detach --name=gopxe --volume pxeImages:/srv/ --network=host $(IMAGE):$(TAG)

ign: $(IGNITION_FILES)

$(HOSTPATH)/scos/ignition-%.ign: nodes/%-butane.bu
	butane --strict --pretty < $< > $@
