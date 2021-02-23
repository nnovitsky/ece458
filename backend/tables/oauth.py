import requests
import os
import json
import urllib
import base64
import jwt


# this function is setting the authenticaton string we need to provide the oauth server
# this is how the oauth server knows it is getting a valid request from your application
def format_auth_string():
    if "OAUTH_CLIENT_ID" in os.environ:
        client_id = os.environ["OAUTH_CLIENT_ID"]
    else:
        client_id = "ece458_2021_s_nen4"
    if "OAUTH_CLIENT_ID" in os.environ:
        client_secret = os.environ["OAUTH_CLIENT_SECRET"]
    else:
        client_secret = "OnKlVSj0Yf6qnRZ7qH8AbyDYJAvDTiCyeiXW4BGfMgVltZk4kExQF9TvEZQyoDPWEkCBVrxzDBK8a4RxZZA-Fw"

    string = "{}:{}".format(client_id, client_secret)
    data = base64.b64encode(string.encode())
    return data.decode("utf-8")


# Take the oauth code the user provides after login, verify it with the OAuth server
# and exchange it for an authentication token
def get_token(code):
    auth = format_auth_string()
    if "OAUTH_TOKEN_URL" in os.environ:
        url = os.environ["OAUTH_TOKEN_URL"]
    else:
        url = "https://oauth.oit.duke.edu/oidc/token"

    if "OAUTH_REDIRECT_URI" in os.environ:
        redirect_uri = os.environ["OAUTH_REDIRECT_URI"]
    else:
        redirect_uri = "http://localhost:8000/oauth/consume"

    payload = urllib.parse.urlencode({
        'grant_type': "authorization_code",
        'redirect_uri': redirect_uri,
        'code': code
    })
    headers = {
        'content-type': "application/x-www-form-urlencoded",
        'authorization': "Basic {}".format(auth)
    }

    response = requests.request("POST", url, data=payload, headers=headers)
    return json.loads(response.text)


# Now that we have the Auth Token from the OAuth provider
# let's parse it into a dictonary so python can work with it
def parse_id_token(response):
    id_token = jwt.decode(response["id_token"], verify=False)
    print(id_token)
    return {"access_token": response["access_token"], "id_token": id_token}
