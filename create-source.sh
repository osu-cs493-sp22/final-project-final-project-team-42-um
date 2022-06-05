#!/bin/bash

ENV_FILE=./.env
SOURCE_FILE=./env-source

rm -f $SOURCE_FILE
for line in $(cat $ENV_FILE); do
    echo "export $line" >> $SOURCE_FILE
done
