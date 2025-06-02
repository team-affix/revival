rm -rf ./absurdity

aws lambda invoke --function-name lpk-revival-package-pull --payload file://payload.json --cli-binary-format raw-in-base64-out out.json

jq -r '.body' out.json | base64 --decode > response.zip
# rm out.json
unzip response.zip
rm response.zip
