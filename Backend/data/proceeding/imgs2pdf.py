# 图片转pdf
import os

from PIL import Image
from PIL import ImageEnhance
from reportlab.lib.pagesizes import portrait
from reportlab.pdfgen import canvas


# 将图片转pdf
def imgtopdf(input_paths, outputpath):
    (maxw, maxh) = Image.open(input_paths).size
    c = canvas.Canvas(outputpath, pagesize=portrait((maxw, maxh)))
    c.drawImage(input_paths, 0, 0, maxw, maxh)
    c.showPage()
    c.save()


# 增强图片, 使其看上去更像扫描件
def enhance_img(src_img):
    # 锐化
    enh_sha = ImageEnhance.Sharpness(src_img)
    sharpness = 2.5
    sharped_img = enh_sha.enhance(sharpness)
    # 亮度增加
    enh_bri = ImageEnhance.Brightness(sharped_img)
    brightness = 3.0
    brightened_img = enh_bri.enhance(brightness)
    # 对比度增加
    enh_con = ImageEnhance.Contrast(brightened_img)
    contrast = 1.3
    contrasted_img = enh_con.enhance(contrast)
    # 颜色饱和度增加
    enh_col = ImageEnhance.Color(contrasted_img)
    color = 1.5
    colored_img = enh_col.enhance(color)
    return colored_img


# 拼合图片并转为pdf
def convert(imgPathList, outputPath, outputWidth=1280, outputName="output", enhance=False):
    each_width = outputWidth
    images = []
    total_height = 0

    for path in imgPathList:
        img = Image.open(path)
        # 统一图片宽度, 按比例调整高度, 使其便于拼接
        each_height = img.size[1] * each_width // img.size[0]
        total_height += each_height
        img = img.resize((each_width, each_height))
        images.append({"img": img, "height": each_height})

    new_image = Image.new('RGB', (each_width, total_height))
    total_height = 0
    for i in range(len(images)):
        new_image.paste(images[i]['img'], (0, total_height))
        total_height += images[i]['height']
    if enhance:
        new_image = enhance_img(new_image)
    # 保存长图
    new_image.save('%s/%s.png' % (outputPath, outputName))
    # 转pdf
    imgtopdf('%s/%s.png' % (outputPath, outputName),
             '%s/%s.pdf' % (outputPath, outputName))
