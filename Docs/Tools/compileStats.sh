#! /bin/bash

./fetchStats.sh
./csvPerChange.sh
python csvGrapher.py 

