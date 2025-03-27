aws-docker-login:
	aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 192611728246.dkr.ecr.us-east-1.amazonaws.com

update-lambda:
	docker buildx build --platform linux/amd64 --provenance=false -t docker-image:test2 .
	docker tag docker-image:test2 192611728246.dkr.ecr.us-east-1.amazonaws.com/revival-agda-typecheck:latest
	docker push 192611728246.dkr.ecr.us-east-1.amazonaws.com/revival-agda-typecheck:latest
	aws lambda update-function-code   --function-name revival-agda-typecheck   --image-uri 192611728246.dkr.ecr.us-east-1.amazonaws.com/revival-agda-typecheck:latest   --publish

invoke:
	aws lambda invoke --function-name revival-agda-typecheck --payload file://payload.json --cli-binary-format raw-in-base64-out response.json
	cat response.json

update-tempdir:
	aws s3 rm s3://revival-logic-platform/agda-files/tempdir --recursive
	aws s3 cp ./tempdir s3://revival-logic-platform/agda-files/tempdir --recursive

full-invoke: update-tempdir invoke
	
