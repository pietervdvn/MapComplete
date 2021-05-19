#! /bin/bash

./fetchStats.sh
./csvPerChange.sh
python3 csvGrapher.py
