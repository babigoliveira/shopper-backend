import { Injectable } from '@nestjs/common';
import * as fs from 'node:fs';

@Injectable()
export class FileSystemService {
  store(filePath: string, encodedBase64: string): void {
    const data = encodedBase64.replace(/^data:image\/png;base64,/, '');
    const buffer = Buffer.from(data, 'base64');
    fs.writeFileSync(filePath, buffer);
  }
}
