import requests

url = 'http://localhost:8000/graphql/'

headers = {
    'token': 'ImxpYWRyaW56Ig.Dp2-Kw.fgMMPjeoajusU7mqBv4d-9B-_38'
}

gql = """
mutation {
    createSubmission (
        submissionData: {
            addfile: 1,
            assignment: 7
        }
    ) {
        ok
        submission {
            id
            submitter {
                name
                buptId
            }
        }
    }
}
"""

data = {
    'query': gql
}

resp = requests.post(url, data=data, headers=headers)

print(resp.text)