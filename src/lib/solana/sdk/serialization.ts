/** Write a u8 into a buffer at the given offset. */
export function writeU8(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt8(value, offset);
}

/** Write a u16 (little-endian) into a buffer at the given offset. */
export function writeU16LE(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt16LE(value, offset);
}

/** Write a u32 (little-endian) into a buffer at the given offset. */
export function writeU32LE(buf: Buffer, value: number, offset: number): void {
  buf.writeUInt32LE(value, offset);
}

/** Write a u64 (little-endian) into a buffer at the given offset. */
export function writeU64LE(buf: Buffer, value: bigint, offset: number): void {
  buf.writeBigUInt64LE(value, offset);
}

/** Write an i64 (little-endian) into a buffer at the given offset. */
export function writeI64LE(buf: Buffer, value: bigint, offset: number): void {
  buf.writeBigInt64LE(value, offset);
}

/** Encode a u16 as a 2-byte little-endian Buffer. */
export function encodeU16(value: number): Buffer {
  const buf = Buffer.alloc(2);
  buf.writeUInt16LE(value);
  return buf;
}

/** Encode a u64 as an 8-byte little-endian Buffer. */
export function encodeU64(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(value);
  return buf;
}

/** Encode an i64 as an 8-byte little-endian Buffer. */
export function encodeI64(value: bigint): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigInt64LE(value);
  return buf;
}
