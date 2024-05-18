import { decodeWasm } from "./dist/blake3_raw";

let wasm: any = null;
let exports: any = null;

const heap_set = (array: Uint8Array, p: any) => {
  (new Uint8Array(exports.memory.buffer, p, array.length)).set(array, 0);
}

export async function createHasher(key: null | Uint8Array = null) {
  if (!wasm) {
    wasm = await WebAssembly.instantiate(decodeWasm(), {});
    exports = wasm.instance.exports;
  }

  return new Hasher(key)
}

export async function digest(data: Uint8Array, out_len: number = 32) {
  const hasher = await createHasher();

  await hasher.update(data);
  const digest = hasher.finalize(out_len);
  hasher.free();

  return digest;
}

class Hasher {
  hasher: any;

  constructor(key: null | Uint8Array = null) {
    const BLAKE3_KEY_LEN = 32;

    this.hasher = exports.malloc(exports.blake3_hasher_size());

    if (key) {
      if (key.length != BLAKE3_KEY_LEN) {
        throw new Error("key.length != " + BLAKE3_KEY_LEN.toString());
      }

      const key_ptr = exports.malloc(BLAKE3_KEY_LEN);
      heap_set(key, key_ptr);
      exports.blake3_hasher_init_keyed(this.hasher, key_ptr);
    } else {
      exports.blake3_hasher_init(this.hasher);
    }
  }

  async update(data: Uint8Array) {
    const data_ptr = exports.malloc(data.length);
    heap_set(data, data_ptr);
    exports.blake3_hasher_update(this.hasher, data_ptr, data.length);
    exports.free(data_ptr);
  }

  finalize(out_len: number = 32) {
    const digest_ptr = exports.malloc(out_len);
    exports.blake3_hasher_finalize(this.hasher, digest_ptr, out_len);
    const digest = new Uint8Array(exports.memory.buffer, digest_ptr, out_len);
    exports.free(digest_ptr);

    return digest;
  }

  free() {
    exports.free(this.hasher);
  }
}
