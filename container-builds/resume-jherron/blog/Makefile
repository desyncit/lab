CONF=--config ./config.yml --baseURL http://$(shell echo $$HOSTNAME)
MFLAGS=-M --noBuildLock --gc --noTimes --noChmod --printMemoryUsage --templateMetrics --logLevel debug -l ./themes/terminalcv/layouts 
ENV=--bind 0.0.0.0 -e Valhalla


all: server

server:
	hugo $(MFLAGS) server $(CONF) $(ENV)

.PHONY: clean

clean: 
	rm -rf resources public
