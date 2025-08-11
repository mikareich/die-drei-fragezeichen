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

    const bucketName =
      $app.stage === 'production' ? 'ddf-productio' : 'ddf-mikareich'
    const bucket = sst.aws.Bucket.get('DDF-Bucket', bucketName)

    const DATABASE_TOKEN = new sst.Secret('DATABASE_TOKEN')
    const DATABASE_URL = new sst.Secret('DATABASE_URL')

    const service = new sst.aws.Service('DDF-Website', {
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

    const isProd = $app.stage === 'production'
    const rootDomain = 'ddf-archiv.de'

    const siteDomain = isProd ? rootDomain : `${$app.stage}.${rootDomain}`

    const router = new sst.aws.Router('DDF-Router', {
      domain: {
        name: siteDomain,
        aliases: isProd
          ? [`www.${rootDomain}`, `assets.${rootDomain}`]
          : [`assets.${siteDomain}`],
      },
    })

    router.routeBucket(`assets.${siteDomain}`, bucket)
    router.route(siteDomain, service.url)
    if (isProd) router.route(`www.${rootDomain}`, service.url)
  },
})
