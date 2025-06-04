# AWS_PROFILE=personal-terraform
# AWS_REGION=us-west-1


all: lambdas

update: update-pull

update-pull:
	cd pull/function && \
	zip -r ../function.zip . && \
	cd .. && \
	aws lambda update-function-code \
		--function-name lpk-revival-package-pull \
		--zip-file fileb://function.zip \
		--profile $(AWS_PROFILE) \
		--no-cli-pager
