#!/bin/bash
while ts-node index; do
    echo "restarting"
done
echo "crashed"
read -n 1 -s -r -p "Press any key to continue"