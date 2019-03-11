import xlrd
import re

def convert(excel_file):
    data = xlrd.open_workbook(excel_file)
    pos_bupt_id, pos_serial = (0, 0), (0, 0)
    students_bupt_id = []
    serial = ''
    course_name = ''
    for table in data.sheets():
        nrows = table.nrows
        ncols = table.ncols
        for row in range(nrows):
            for col in range(ncols):
                key_name = re.sub(r'\s', '', str(table.cell_value(row, col)))
                if key_name == '学号':
                    pos_bupt_id = (row, col)
                elif '课号' in key_name or '课序号' in key_name:
                    pos_serial = (row, col)
        for row in range(pos_bupt_id[0]):
            for col in range(ncols):
                target = str(table.cell_value(row, col))
                if target:
                    course_name = target
        for row in range(pos_bupt_id[0] + 1, nrows):
            try:
                bupt_id = str(int(table.cell_value(row, pos_bupt_id[1])))
                students_bupt_id.append(bupt_id)
            except:
                pass
        for col in range(pos_serial[1] + 1, ncols):
            target = str(table.cell_value(pos_serial[0], col))
            if re.match(r'\d+-\d+', target):
                serial = target

    students_bupt_id = list(set(students_bupt_id))
    students_bupt_id.sort(key=lambda a: int(a))
    return students_bupt_id, serial, course_name
