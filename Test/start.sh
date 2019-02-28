#!/bin/sh
docker run -p 6379:6379 -d redis:2.8
uwsgi --ini ./uwsgi.ini