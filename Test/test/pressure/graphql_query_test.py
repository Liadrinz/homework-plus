import requests
from threading import Thread, Lock

gql_url = "http://localhost:8000/graphql/"

login = requests.post(
    url="http://localhost:8000/login/",
    data={
        "username": "student001",
        "password": "123456"
    }
)

lock = Lock()
token = login.headers['token']
total = 0
blocked = 0

def query():
    global lock, total, blocked
    gql= 'query{allUsers{name}}'
    while True:
        q = requests.post(
            url=gql_url,
            data={
                "query": gql
            },
            headers={
                "token": token
            }
        )
        # lock.acquire()
        total += 1
        # lock.release()
        if len(q.text) <= 8:
            # lock.acquire()
            blocked += 1
            total -= 1
            # lock.release()
        print(total, blocked)

# pool = []
# for i in range(100):
#     pool.append(Thread(target=query, args=()))
# for thread in pool:
#     thread.start()

query()