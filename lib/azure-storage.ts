import { BlobServiceClient } from '@azure/storage-blob';

export class AzureStorageClient {
  private blobServiceClient: BlobServiceClient;
  private containerName: string;

  constructor() {
    const sasUrl = process.env.AZURE_SAS_URL;
    if (!sasUrl) {
      throw new Error('Azure SAS URL is not configured in environment variables.');
    }

    this.containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'fyndly-avatars';
    this.blobServiceClient = new BlobServiceClient(sasUrl);
  }

  async uploadMedia(buffer: Buffer, fileName: string, filePath: string): Promise<string> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      
      const sanitizedFileName = fileName.replace(/\s+/g, '-');
      const blobName = `${filePath}/${Date.now()}-${sanitizedFileName}.png`;
      const blockBlobClient = containerClient.getBlockBlobClient(blobName);

      await blockBlobClient.uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: 'image/png',
        },
      });

      return blockBlobClient.url;
    } catch (error: any) {
      console.error('Azure upload error details:', error);
      
      if (error.name === 'RestError') {
        throw new Error(`Azure storage error (${error.statusCode}): ${error.message}. Check SAS URL, permissions, and container name.`);
      }
      throw error;
    }
  }

  async getBlobCount(filePath: string): Promise<number> {
    try {
      const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
      let count = 0;
      for await (const blob of containerClient.listBlobsByHierarchy("/", { prefix: filePath })) {
          if (blob.kind === 'blob') {
              count++;
          }
      }
      return count;
    } catch (error: any) {
        console.error("Error counting blobs:", error);
        // Return 0 if we can't count, so we proceed with generation.
        return 0;
    }
  }

  async getRandomBlobUrl(filePath: string): Promise<string | null> {
    try {
        const containerClient = this.blobServiceClient.getContainerClient(this.containerName);
        const blobs = [];
        for await (const blob of containerClient.listBlobsByHierarchy("/", { prefix: filePath })) {
            if (blob.kind === 'blob') {
                blobs.push(blob);
            }
        }

        if (blobs.length === 0) {
        return null;
        }

        const randomIndex = Math.floor(Math.random() * blobs.length);
        const randomBlob = blobs[randomIndex];
        
        return `${containerClient.url}/${randomBlob.name}`;

    } catch (error: any) {
        console.error("Error getting random blob URL:", error);
        return null;
    }
  }
} 