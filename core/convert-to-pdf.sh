#!/bin/bash
windows_host=laekovwindows
filename=$2
local_prefix=$(realpath "$1/$2")
remote_prefix="C:\\sealpdf\\$filename"

if [ -f $local_prefix.pdf ]
then
	echo "Exists"
	exit
fi

if [ ! -f $local_prefix.pptx ]
then
	if [ ! -f $local_prefix.pptx.base64 ]
	then
		echo "ppt not exist"
		exit 1
	fi
	base64 -d $local_prefix.pptx.base64 >$local_prefix.pptx
fi

scp $local_prefix.pptx $windows_host:/sealpdf/$filename.pptx &&
	ssh $windows_host powershell -file "c:\\sealpdf\\pptx2pdf.ps1" \
	$remote_prefix.pptx $remote_prefix.pdf && 
	scp $windows_host:/sealpdf/$filename.pdf $local_prefix.pdf

if [ $? != 0 ]
then
	exit $?
else
	rm $local_prefix.pptx.base64
fi

echo Generated

