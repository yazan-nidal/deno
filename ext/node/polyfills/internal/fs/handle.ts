// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { EventEmitter } from "ext:deno_node/events.ts";
import { Buffer } from "ext:deno_node/buffer.ts";
import { promises, read, write } from "ext:deno_node/fs.ts";
import {
  BinaryOptionsArgument,
  FileOptionsArgument,
  ReadOptions,
  TextOptionsArgument,
} from "ext:deno_node/_fs/_fs_common.ts";

interface WriteResult {
  bytesWritten: number;
  buffer: Buffer | string;
}

interface ReadResult {
  bytesRead: number;
  buffer: Buffer;
}

export class FileHandle extends EventEmitter {
  #rid: number;
  constructor(rid: number) {
    super();
    this.rid = rid;
  }

  get fd() {
    return this.rid;
  }

  read(
    buffer: Buffer,
    offset?: number,
    length?: number,
    position?: number | null,
  ): Promise<ReadResult>;
  read(options?: ReadOptions): Promise<ReadResult>;
  read(
    bufferOrOpt: Buffer | ReadOptions,
    offset?: number,
    length?: number,
    position?: number | null,
  ): Promise<ReadResult> {
    if (bufferOrOpt instanceof Buffer) {
      return new Promise((resolve, reject) => {
        read(
          this.fd,
          bufferOrOpt,
          offset,
          length,
          position,
          (err, bytesRead, buffer) => {
            if (err) reject(err);
            else resolve({ buffer: buffer, bytesRead: bytesRead });
          },
        );
      });
    } else {
      return new Promise((resolve, reject) => {
        read(this.fd, bufferOrOpt, (err, bytesRead, buffer) => {
          if (err) reject(err);
          else resolve({ buffer: buffer, bytesRead: bytesRead });
        });
      });
    }
  }

  readFile(
    opt?: TextOptionsArgument | BinaryOptionsArgument | FileOptionsArgument,
  ): Promise<string | Buffer> {
    return promises.readFile(this, opt);
  }

  write(
    buffer: Buffer,
    offset: number,
    length: number,
    position: number,
  ): Promise<WriteResult>;
  write(
    str: string,
    position: number,
    encoding: string,
  ): Promise<WriteResult>;
  write(
    bufferOrStr: Buffer | string,
    offsetOrPotition: number,
    lengthOrEncoding: number | string,
    position?: number,
  ): Promise<WriteResult> {
    if (bufferOrStr instanceof Buffer) {
      const buffer = bufferOrStr;
      const offset = offsetOrPotition;
      const length = lengthOrEncoding;

      return new Promise((resolve, reject) => {
        write(
          this.fd,
          buffer,
          offset,
          length,
          position,
          (err, bytesWritten, buffer) => {
            if (err) reject(err);
            else resolve({ buffer, bytesWritten });
          },
        );
      });
    } else {
      const str = bufferOrStr;
      const position = offsetOrPotition;
      const encoding = lengthOrEncoding;

      return new Promise((resolve, reject) => {
        write(
          this.fd,
          str,
          position,
          encoding,
          (err, bytesWritten, buffer) => {
            if (err) reject(err);
            else resolve({ buffer, bytesWritten });
          },
        );
      });
    }
  }

  close(): Promise<void> {
    // Note that Deno.close is not async
    return Promise.resolve(Deno.close(this.fd));
  }
}

export default {
  FileHandle,
};
