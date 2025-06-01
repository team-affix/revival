aws lambda invoke --function-name lpk-revival-package-pull --payload file://payload.json --cli-binary-format raw-in-base64-out out.txt
cat out.txt
rm out.txt
