# 自动压缩用户文件模块
from zipfile import ZipFile
import os


# 将文件打包为一个压缩文件, 存到后台/homework_file/目录下
def CreateZip(files_to_zip, pack_name):
    zfile = ZipFile("./data/backend_media/homework_file/%s.zip"%pack_name, 'w')
    for f in files_to_zip:
        zfile.write(f, f.split('/')[-1])
        os.remove(f)
