import { HeadBucketCommand, S3Client } from '@aws-sdk/client-s3';
import type { RuntimeConfig } from '@spryxel/config';
import type { PrivateObjectStorageProbe } from '@spryxel/domain';

export class S3CompatibleStorageProbe implements PrivateObjectStorageProbe {
  private readonly client: S3Client;
  private readonly bucket: string;

  constructor(config: RuntimeConfig) {
    if (
      !config.s3Endpoint ||
      !config.s3AccessKeyId ||
      !config.s3SecretAccessKey ||
      !config.s3Bucket
    ) {
      throw new Error('Private object-storage probe configuration is incomplete');
    }
    this.bucket = config.s3Bucket;
    this.client = new S3Client({
      endpoint: config.s3Endpoint,
      region: config.s3Region,
      forcePathStyle: true,
      credentials: {
        accessKeyId: config.s3AccessKeyId,
        secretAccessKey: config.s3SecretAccessKey,
      },
    });
  }

  async probe(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }), {
        abortSignal: AbortSignal.timeout(2_000),
      });
    } finally {
      this.client.destroy();
    }
  }
}
