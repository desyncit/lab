IMAGE=quay.io/desync/gopxe:1.0.0
HOSTPATH=/srv/http/
IGNITION_FILES := $(patsubst nodes/%-butane.bu,/srv/http/scos/ignition-%.ign,$(wildcard nodes/*.bu))


default: build replace

build:
	podman build --no-cache --squash-all . -t $(IMAGE)

volume:
	podman volume create \
			--opt type=none \
		        --opt device=$(HOSTPATH) \
			--opt o=rbind \
	       pxeImages

replace:
	podman run --rm --detach --replace --name=gopxe --volume pxeImages:/srv/ --network=host $(IMAGE)

run:
	podman run --rm --detach --name=gopxe --volume pxeImages:/srv/ --network=host $(IMAGE)


ign: $(IGNITION_FILES)

/srv/http/scos/ignition-%.ign: nodes/%-butane.bu
	butane --strict --pretty < $< > $@
