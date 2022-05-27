#!/bin/bash
# Script repeatedly attempts to add a user to the mongodb until it succeeds or 
# gets an error indicating the user already exitsts
RET=1
until [ $RET -eq 0 ] || [ $RET -eq 253 ]
do 
    mongo --host db --username root --password hunter2 /mnt/init-db.d || mongo --host db --username root --password hunter2 /mnt/init-db.d | grep "already exists"
    RET=$?
    echo $RET
    sleep 1
done