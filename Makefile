all: uchome

uchome:
	@@echo "Build webim for uchome"
	@@$(MAKE) -f build/uchome.mk

clean_uchome:
	@@echo "Clean uchome"
	@@$(MAKE) clean -f build/uchome.mk

clean: clean_uchome

