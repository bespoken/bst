#!/usr/bin/env bash
curl --user a8bee24da39054f11da61e45765f1764a49a1813: \
    --request POST \
    --form revision=756a7bb84b5e1c38aa2931e91e9eb525d428f374\
    --form config=@config.yml \
    --form notify=false \
        https://circleci.com/api/v1.1/project/github/bespoken/bst/tree/migrate-ecs