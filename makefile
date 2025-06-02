all: lambdas

lambdas: lambda-pull

lambda-pull:
	cd lambda/pull/function && npm install && npm run build
