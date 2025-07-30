import { S3Client } from '@aws-sdk/client-s3'

const { AWS_ACCESS_KEY, AWS_SECRET_ACCESS_KEY } = process.env

export const s3 = new S3Client({
  credentials: {
    accessKeyId: AWS_ACCESS_KEY as string,
    secretAccessKey: AWS_SECRET_ACCESS_KEY as string,
  },
  region: 'us-east-1',
})
