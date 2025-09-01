CONF=--config ./config.yaml
MFLAGS=-M --noBuildLock --gc --noTimes --noChmod --printMemoryUsage --templateMetrics --logLevel debug -l ./themes/terminalcv/layouts 
ENV=-e Valhalla


all: server

server:
	hugo $(MFLAGS) server $(ENV)

.PHONY: clean

clean: 
	rm -rf resources public
