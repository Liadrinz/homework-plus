from zipfile import ZipFile
import os

def CreateZip(files_to_zip, pack_name):
    zfile = ZipFile("./data/backend_media/homework_file/%s.zip"%pack_name, 'w')
    for f in files_to_zip:
        zfile.write(f, f.split('/')[-1])
        os.remove(f)
