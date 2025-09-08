CONF=--configDir ./config --baseURL http://$(shell echo $$HOSTNAME)
MFLAGS=-M --gc --noTimes --noChmod --printMemoryUsage --templateMetrics --logLevel debug
DFLAGS=--noBuildLock --disableFastRender
ENV=--bind 0.0.0.0 -e valhalla


all: server

.PHONY: clean

clean: 
	rm -rf resources public .hugo_build.lock
server:
	hugo $(MFLAGS) server $(CONF) $(ENV)
dev: clean
	hugo $(MFLAGS) server $(DFLAGS) $(CONF) $(ENV)

