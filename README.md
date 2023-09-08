# SealPDF

Add watermark to ppt/pdf and generate a pdf.

## Prerequisite
### Command line

You can add watermark to a pdf file using `seal.sh`.
You need to install matplotlib (python) and [pdftk](www.pdftk.com).

You can also convert a pptx file to pdf using MS Office using `core/convert-to-pdf.sh`.
This needs a windows host with MS Office installed, ssh and powershell available.
You can also run the whole thing on a windows machine, but laekov does not use windows unless forced.

### Web

The web frontend runs over ExpressJS.
The server starts at `backend/server.js`.
It provides end-to-end conversion service online.
