while :
do
    if ts-node index
    then
        echo "restarting"
        continue
    else
        break
    fi
done
echo "crashed"
read -n 1 -s -r -p "Press any key to continue"
