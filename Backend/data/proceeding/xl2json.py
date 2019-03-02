import xlrd
import re

def convert(excel_file):
    data = xlrd.open_workbook(excel_file)
    pos_bupt_id, pos_class = (0, 0), (0, 0)
    classes = []
    students_bupt_id = []
    for table in data.sheets():
        nrows = table.nrows
        ncols = table.ncols
        for row in range(nrows):
            for col in range(ncols):
                key_name = re.sub(r'\s', '', str(table.cell_value(row, col)))
                if key_name == '学号':
                    pos_bupt_id = (row, col)
                elif key_name == '班级':
                    pos_class = (row, col)
        for row in range(pos_bupt_id[0] + 1, nrows):
            try:
                bupt_id = str(int(table.cell_value(row, pos_bupt_id[1])))
                students_bupt_id.append(bupt_id)
            except:
                pass
        for row in range(pos_class[0] + 1, nrows):
            try:
                class_number = str(int(table.cell_value(row, pos_class[1])))
                classes.append(class_number)
            except:
                pass
    classes = list(set(classes))
    students_bupt_id = list(set(students_bupt_id))
    classes.sort(key=lambda a: int(a))
    students_bupt_id.sort(key=lambda a: int(a))
    return students_bupt_id
