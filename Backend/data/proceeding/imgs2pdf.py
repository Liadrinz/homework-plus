# 图片转pdf
import os

from PIL import Image
from PIL import ImageEnhance
from reportlab.lib.pagesizes import portrait
from reportlab.pdfgen import canvas


def imgtopdf(input_paths, outputpath):
    (maxw, maxh) = Image.open(input_paths).size
    c = canvas.Canvas(outputpath, pagesize=portrait((maxw, maxh)))
    c.drawImage(input_paths, 0, 0, maxw, maxh)
    c.showPage()
    c.save()


def enhance_img(src_img):
    enh_sha = ImageEnhance.Sharpness(src_img)
    sharpness = 2.5
    sharped_img = enh_sha.enhance(sharpness)
    enh_bri = ImageEnhance.Brightness(sharped_img)
    brightness = 3.0
    brightened_img = enh_bri.enhance(brightness)
    enh_con = ImageEnhance.Contrast(brightened_img)
    contrast = 1.3
    contrasted_img = enh_con.enhance(contrast)
    enh_col = ImageEnhance.Color(contrasted_img)
    color = 1.5
    colored_img = enh_col.enhance(color)
    return colored_img


def convert(imgPathList, outputPath, outputWidth=1280, outputName="output", enhance=False):
    each_width = outputWidth
    images = []
    total_height = 0

    for path in imgPathList:
        img = Image.open(path)
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
    new_image.save('%s/%s.png' % (outputPath, outputName))
    imgtopdf('%s/%s.png' % (outputPath, outputName),
             '%s/%s.pdf' % (outputPath, outputName))
