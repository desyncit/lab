
all: build publish clean

build: 
	ansible-galaxy collection build --force 
	
publish:
	ansible-galaxy collection publish --api-key $${API_KEY} desyncit-beaker-*.tar.gz

clean:
	rm ./desyncit-beaker-*.tar.gz
