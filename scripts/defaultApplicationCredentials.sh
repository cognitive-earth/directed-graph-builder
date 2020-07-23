gcloud config set project $1
gcloud auth application-default login
curl http://localhost:3004/api/builder/initiate
gcloud compute project-info add-metadata \
    --metadata google-compute-default-region='australia-southeast1'