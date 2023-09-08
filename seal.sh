#!/bin/bash
if [ $# != 3 ]
then
	echo "Usage: ./mark.sh <input filename> <output filename> <text>"
	exit 1
fi

python3 core/genpdf.py $3
pdftk $1 stamp watermark.pdf output $2
