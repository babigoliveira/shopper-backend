import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export class FileSystemService {
  store(filePath: string, encodedBase64: string): void {
    const buffer = Buffer.from(encodedBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
  }
}
