BLAKE3 = BLAKE3/c
CMD = emcc -O3 \
	--no-entry \
	-s TOTAL_MEMORY=64MB \
	-s EXPORTED_FUNCTIONS='["_malloc","_free"]' \
	-o /tmp/blake3_raw.wasm \
	-DNDEBUG \
	-I $(BLAKE3) \
	$(BLAKE3)/blake3.c

SIMD = $(BLAKE3)/{blake3_dispatch_sse41.c,blake3_sse41.c} -msimd128 -msse4.1 -DIS_X86
PORTABLE = $(BLAKE3)/{blake3_dispatch.c,blake3_portable.c}

JS = echo -n "export function decodeWasm(){return Uint8Array.from(atob('" > dist/blake3_raw.js; \
		 base64 -w 0 /tmp/blake3_raw.wasm >> dist/blake3_raw.js; \
		 echo -n "'),(m)=>m.codePointAt(0));}" >> dist/blake3_raw.js; \
		 npm run build; \
		 cp index.html dist

all:
	$(CMD) $(SIMD)
	$(JS)

portable:
	$(CMD) ${PORTABLE}
	$(JS)
