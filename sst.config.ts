/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: 'die-drei-fragezeichen',
      removal: input?.stage === 'production' ? 'retain' : 'remove',
      protect: false,
      home: 'aws',
    }
  },
  async run() {
    const vpc = new sst.aws.Vpc('DDF-Vpc')
    const cluster = new sst.aws.Cluster('DDF-Cluster', { vpc })
    const bucket = new sst.aws.Bucket('DDF-Bucket', {
      access: 'public',
      cors: {
        allowMethods: ['GET', 'PUT', 'POST', 'DELETE', 'HEAD'],
        allowOrigins: ['*'],
        allowHeaders: ['*'],
      },
    })

    const DATABASE_TOKEN = new sst.Secret('DATABASE_TOKEN')
    const DATABASE_URL = new sst.Secret('DATABASE_URL')

    new sst.aws.Service('DDF-Website', {
      link: [bucket, DATABASE_URL, DATABASE_TOKEN],
      cluster,
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '3000/http' }],
      },
      dev: {
        command: 'npm run dev',
      },
      permissions: [
        {
          actions: ['s3:putObject'],
          resources: [bucket.arn.apply((arn) => `${arn}/*`)],
        },
      ],
    })
  },
})
