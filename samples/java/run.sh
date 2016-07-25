#!/usr/bin/env bash

# Change the sig check on prod

mvn exec:java -Dexec.executable="java" -DdisableRequestSignatureCheck=true -Dexec.args=$@
