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

    const transferCoverFn = new sst.aws.Function('TransferCoverFn', {
      handler: 'functions/cover.transferCoverToBucket',
      link: [bucket],
      permissions: [
        {
          actions: ['s3:PutObject'],
          resources: [bucket.arn.apply((arn) => `${arn}/*`)],
        },
      ],
      timeout: '60 seconds',
    })

    const generateUploadUrl = new sst.aws.Function('GenerateUploadUrl', {
      handler: 'functions/audio.generateUploadUrl',
      link: [bucket, DATABASE_URL, DATABASE_TOKEN],
      permissions: [
        {
          actions: ['s3:PutObject'],
          resources: [bucket.arn.apply((arn) => `${arn}/*`)],
        },
      ],
      url: true,
      timeout: '60 seconds',
    })

    const createIngestionSession = new sst.aws.Function(
      'CreateIngestionSession',
      {
        handler: 'functions/orchestrator.createIngestionSession',
        url: true,
        link: [DATABASE_URL, DATABASE_TOKEN],
      },
    )

    const removeIngestionSession = new sst.aws.Function(
      'RemoveIngestionSession',
      {
        handler: 'functions/orchestrator.removeIngestionSession',
        link: [DATABASE_URL, DATABASE_TOKEN, bucket],
        permissions: [
          {
            actions: ['s3:removeObject'],
            resources: [bucket.arn.apply((arn) => `${arn}/*`)],
          },
        ],
      },
    )

    const prepareAudio = new sst.aws.Function('PrepareAudio', {
      handler: 'functions/audio.prepareAudio',
      link: [DATABASE_URL, DATABASE_TOKEN, bucket],
      memory: '2 GB',
      timeout: '15 minutes',
      storage: '1 GB',
      nodejs: {
        install: ['ffmpeg-static'],
      },
    })

    const ingestionFlow = new sst.aws.StepFunctions('IngestionFlow', {
      definition: sst.aws.StepFunctions.lambdaInvoke({
        name: 'PrepareAudio',
        function: prepareAudio,
        payload: { env: '{% $states.input %}' },
      }),
      logging: {
        level: 'all',
        includeData: true,
        retention: '1 month',
      },
    })

    bucket.notify({
      notifications: [
        {
          name: 'RawAudioSubscription',
          filterPrefix: 'raw-audio/',
          function: {
            handler: 'functions/orchestrator.triggerIngestionPipeline',
            link: [DATABASE_URL, DATABASE_TOKEN, bucket, ingestionFlow],
          },
          events: ['s3:ObjectCreated:*'],
        },
      ],
    })

    const service = new sst.aws.Service('DDF-Website', {
      link: [
        bucket,
        DATABASE_URL,
        DATABASE_TOKEN,
        transferCoverFn,
        generateUploadUrl,
        createIngestionSession,
        removeIngestionSession,
      ],
      cluster,
      loadBalancer: {
        ports: [{ listen: '80/http', forward: '3000/http' }],
      },
      dev: {
        command: 'npm run dev',
      },
      permissions: [
        {
          actions: ['s3:putObject', 's3:removeObject'],
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
