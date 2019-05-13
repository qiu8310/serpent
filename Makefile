
cov_install:
	npm install -g codecov@3

	# download test reporter as a static binary
	curl -L https://codeclimate.com/downloads/test-reporter/test-reporter-latest-linux-amd64 > ./cc-test-reporter
  chmod +x ./cc-test-reporter


cov:
	# codecov

  ./cc-test-reporter format-coverage -t lcov -o part.1.json projects/serpent-cli/coverage/lcov.info
  ./cc-test-reporter format-coverage -t lcov -o part.2.json projects/serpent-template/coverage/lcov.info

	./cc-test-reporter sum-coverage part.*.json -p 2 -o codeclimate.json
	./cc-test-reporter upload-coverage -i codeclimate.json

	./cc-test-reporter -h
