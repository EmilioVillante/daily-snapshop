# Daily Snapshot

This is a project that will generate an image using stability ai based on words from the days top google search trends.

Heavy build inspiration has come from [this blog post](https://blog.paulmcdonald.fun/stable-diffusion-gcp-cloud-function-6495a0b42c6c).

### Utilised Resources
- [Stability AI developer (docs)](https://platform.stability.ai/)
- [GCP](https://console.cloud.google/)
  - Enable:
    - secret manager
    - artifact registry
    - cloud functions
    - cloud run

### Prerequisite
- Login to GCP with `google auth login` 
- Set the project `gcloud  config set project {project id}`
- Create an account with [Dream Studio](https://beta.dreamstudio.ai/). This will provide 100 base credits


- Add a secret with:
  - name: `stability-api`
  - value: From the [Dream Studio membership page](https://beta.dreamstudio.ai/membership?tab=apiKeys)


- Deploy the test functions with `npx turbo run deploy-functions:dev`

