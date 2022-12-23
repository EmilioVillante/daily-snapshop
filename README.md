# Daily Snapshot

## Concept

This is a project that will generate an image using Stability AI based on words from the days top google search trends within Australia at 6pm.

### Goals

Ideally this will provide a mechanism to further my understanding of:

- GCP Cloud function micro services.
- Integration between GCP Cloud functions and other GCP services
- Basic understanding of available AI Image generation options and 
- Re-entry to react development and a comparative understanding of Next vs Nuxt
- A comparative understanding of default Turborepo architecture vs experience with Lerna 
- Basic understanding of available API commerce platforms that can handle automated uploads   

Heavy python build inspiration has come from [this blog post](https://blog.paulmcdonald.fun/stable-diffusion-gcp-cloud-function-6495a0b42c6c).

### Application Workflow

A GCP Cloud Scheduler will trigger this process at 6pm each day:

1. Fetch trends from google api based on today date ✅
2. Use the keywords to create a AI generated image ✅
3. Save the image to a GCP bucket ✅
4. Save the contextual image data to a firestore collection ✅
5. Push images the images to redbubble or another commerce platform

Along with the microservice I would like to setup a basic application to display the generated images.

### Utilised Resources
- [Stability AI developer (docs)](https://platform.stability.ai/)
- [GCP](https://console.cloud.google/)

## Lessons Learnt

- GCP Functions required a lot more configuration than I had expected, however, once setup they worked quite well
- It would have been a good idea to invest initial time in setting up a local environment to trial the functions instead of relying on the deployed test env.
- Functions calling other functions was surprisingly unintuitive. I would have expected GCP to have created a simple interface to use and authenticate with. My current approach of authenticating through a GCP metaData call is not ideal.
- Running environment variables through secret manager is not ideal, you either need a LOT of variables or run out of space if treating it as an object

## Application Setup and Deployment

### Prerequisites

To run this application successfully you will need to perform each of these tasks.

##### AI Generation Account Setup

Create an account with [Dream Studio](https://beta.dreamstudio.ai/). This will provide 100 base credits

##### GCP Setup

Create an account with GCP and ensure you have access to Google Console. 

- Login to GCP command line with `google auth login` 
- Set the project `gcloud  config set project {project id}`

Within GCP Console interface enable:
  - artifact registry
  - cloud functions
  - cloud run
- Setup GCP buckets for both test and prod environments
- Setup Firestore with a collection for both test and prod environments


### Environment variables
Environment variables are defined in each function through `env/{TEST|PROD}.yaml` files. 

function-daily-snapshot
```yaml
API_GENERATE_IMAGE: ??? URL of the endpoint to generate and save the image
API_GET_TRENDS: ??? URL of the endpoint to fetch trends
FIRESTORE_COLLECTION: ??? Name of the firestore collection to save metaData
DEFAULT_GEO: ??? Geo code of the country to fetch trends for
```

function-get-trends
```yaml
DEFAULT_GEO: ??? Geo code of the country to fetch trends for
```

function-stability-api
```yaml
STABILITY_API_KEY: ??? API key from a valid Atability AI account with credits
BUCKET: ??? The name of the bucket to save the generated image
CLOUDINARY_NAME: ??? The cloudinary configuration name
CLOUDINARY_API_KEY: ??? The cloudinary configuration api key
CLOUDINARY_API_SECRET: ??? The cloudinary configuration secret
CLOUDINARY_SAVE_DIRECTORY: ??? The directory to save images to in cloudinary 
```

### Deployments
To deploy all functions, from root run:

- DEV: `npx turbo run deploy-functions:dev`
- PROD: `npx turbo run deploy-functions:prod`

Functions can be deployed individually from each package using the same commands.
