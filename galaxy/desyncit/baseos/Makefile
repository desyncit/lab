
all: build publish clean

build: 
	ansible-galaxy collection build --force 
	
publish:
	ansible-galaxy collection publish desyncit-*.tar.gz

clean:
	rm ./desyncit-*.tar.gz
