all: lambdas

update: update-pull

update-pull:
	cd pull/function && \
	zip -r ../function.zip . && \
	cd .. && \
	aws lambda update-function-code \
		--function-name $(LAMBDA_PACKAGE_PULL_NAME) \
		--zip-file fileb://function.zip \
		--profile $(AWS_PROFILE) \
		--no-cli-pager
