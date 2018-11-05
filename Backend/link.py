# -*- coding: utf-8 -*-
import os
import re
from project.settings import GQL_PAHT_NAME as gqlpn
from project.settings import GQL_URL as gqlurl

def strip_end(iterable):
    temp = iterable
    while temp[-1].replace(' ', '') == '':
        temp.pop()
    return temp

def getlines(filename):
    return ''.join(open(filename, 'r').readlines()).split('\n')

def setlines(filename, iterable):
    f = open(filename, 'w')
    for line in iterable:
        if '#todel' not in line:
            f.write(line + '\n')

def reset_project_pos(iterable):
    for i in range(0, len(iterable)):
        if 'urlpatterns=[' in iterable[i].replace(' ', ''):
            return i

def link(filename, keywords, content, offset, emsg):
    lines = getlines(filename)
    index = 0
    has = False
    if keywords == '#':
        for i in range(0, len(lines)):
            if not re.match(r'\s*#\s*.*', lines[i]):
                index = i
                has = True
                break
    else:
        for i in range(0, len(lines)):
            if keywords in lines[i]:
                index = i
                has = True
                break
    if not has:
        print(emsg)
        return False
    if content not in lines:
        lines.insert(index + offset, content)
    lines = strip_end(lines)
    setlines(filename, lines)

def flush(filename, start_str, end_str, mutations):
    lines = getlines(filename)
    s = 0
    e = 0
    for i in range(0, len(lines)):
        if start_str in lines[i]:
            s = i
        elif end_str != None:
            if  end_str.replace(' ', '') in lines[i].replace(' ', ''):
                e = i
                break
        elif end_str == None:
            e = len(lines)
            break
    for i in range(s + 1, e):
        if end_str == None or i != e - 1 or len(mutations) != 0:
            lines[i] = '#todel'
        else:
            lines[i] = '    pass\n'
    lines = strip_end(lines)
    setlines(filename, lines)

if __name__ == '__main__':

    project_url = getlines('./project/urls.py')
    urlpatternsIndex = reset_project_pos(project_url)
    if 'from graphene_django.views import GraphQLView' not in project_url:
        project_url.insert(urlpatternsIndex, 'from graphene_django.views import GraphQLView')
    urlpatternsIndex = reset_project_pos(project_url)
    if 'from project.schema import schema' not in project_url:
        project_url.insert(urlpatternsIndex, 'from project.schema import schema')
    urlpatternsIndex = reset_project_pos(project_url)
    if """    path('%s', BetterGraphQLView.as_view(graphiql=True, schema=schema)),"""%gqlurl not in project_url:
        project_url.insert(urlpatternsIndex + 1, """    path('%s', BetterGraphQLView.as_view(graphiql=True, schema=schema)),"""%gqlurl)
    project_url = strip_end(project_url)
    setlines('./project/urls.py', project_url)

    blocks = []
    queries = []
    for item in os.walk('./data/%s/queries/'%gqlpn):
        blocks.append(item)
    for item in blocks:
        if item[0] ==  './data/%s/queries/'%gqlpn:
            queries = item[2]
            break

    blocks = []
    mutations = []
    for item in os.walk('./data/%s/mutations/'%gqlpn):
        blocks.append(item)
    for item in blocks:
        if item[0] ==  './data/%s/mutations/'%gqlpn:
            mutations = item[2]
            break

    flush('./data/schema.py', 'import Query', None, mutations)
    flush('./project/schema.py', 'class Mutations', 'schema = graphene.Schema(query=Query, mutation=Mutations)', mutations)
    link('./data/schema.py', '#', '', 1, 'No valid Query found!')

    for mutation in queries + mutations:
        
        class_name = ''
        if mutation in queries:
            f = open('./data/%s/queries/'%gqlpn + mutation, 'r', encoding='utf-8')
        elif mutation in mutations:
            f = open('./data/%s/mutations/'%gqlpn + mutation, 'r', encoding='utf-8')
        for line in f.readlines():
            for name in re.findall(r'class .*?\s*\(', line):
                name = name.replace(' ', '')
                class_name = name[5:-1]

        if class_name == '':
            print('Invalid Class')
            exit()

        ancestor_mutation = mutation
        mutation = mutation.replace('.py', '')
        origin_mutation = mutation
        mutation = mutation[0].lower() + mutation[1:]
        
        if ancestor_mutation in queries:
            data_schema_import = 'from data.%s.queries.%s import %s'%(gqlpn, origin_mutation, class_name)
            project_schema_register = 'data.schema.%s'%class_name
            link('./data/schema.py', '#', data_schema_import, 1, 'No valid Query found!')
            link('./project/schema.py', 'class Query(', '    ' + project_schema_register + ', ', 1, '!')
        elif ancestor_mutation in mutations:
            data_schema_import = 'from data.%s.mutations.%s import %s'%(gqlpn, origin_mutation, class_name)
            project_schema_register = '%s = data.schema.%s.Field()'%(mutation, class_name)
            link('./data/schema.py', '#', data_schema_import, 1, 'No valid Query found!')
            link('./project/schema.py', 'class Mutations', '    ' + project_schema_register, 1, 'No class Mutations found or legally named')