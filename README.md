# Daily Snapshot

This is a project that will generate an image using stability ai based on words from the days top google search trends.

Heavy build inspiration has come from [this blog post](https://blog.paulmcdonald.fun/stable-diffusion-gcp-cloud-function-6495a0b42c6c).

A brief summary of the steps involved includes:
1. GCP cloud scheduler to trigger process each day
2. Fetch trends from google api based on today date
3. Use the keywords to create a AI generated image hosted in a GCP bucket
4. Save the image and metadata to a firestore collection
5. Serve the images in a webapp
6. Push images the images to redbubble

### Utilised Resources
- [Stability AI developer (docs)](https://platform.stability.ai/)
- [GCP](https://console.cloud.google/)

### Prerequisite
- Create an account with [Dream Studio](https://beta.dreamstudio.ai/). This will provide 100 base credits


- Login to GCP with `google auth login` 
- Set the project `gcloud  config set project {project id}`

- Within GCP project enable:
  - secret manager
  - artifact registry
  - cloud functions
  - cloud run
- Setup GCP buckets for a test and prod environment


### Environment variables
For consistency and simplicity, all configuration variables are set as env variables through the secret manager. 

| key name            | description                                                                                           |
|---------------------|-------------------------------------------------------------------------------------------------------|
| `stability-api`     | Key retrieved from [Dream Studio membership page](https://beta.dreamstudio.ai/membership?tab=apiKeys) |
| `image-bucket-test` | String of GCP bucket configured to host assets from the DEV deployment                                |
| `image-bucket`      | String of GCP bucket configured to host assets from the PROD deployment                               |

### Deployments
- DEV: `npx turbo run deploy-functions:dev`
- PROD: `npx turbo run deploy-functions:prod`

