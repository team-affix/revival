all: lambdas

lambdas: lambda-shared lambda-pull

lambda-shared:
	cd lambda/shared && npm install && npm run build

lambda-pull:
	cd lambda/pull/function && npm install && npm run build
