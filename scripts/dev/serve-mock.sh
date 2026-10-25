#!/usr/bin/env bash
# Starts the mock Sanity API in the background and prints its PID.
cd "$(dirname "$0")/../.."
nohup node --import tsx scripts/dev/mock-sanity.ts > /tmp/mock.log 2>&1 &
echo $!
