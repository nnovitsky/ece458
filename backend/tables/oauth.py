import requests
import os
import json
import urllib
import base64
import jwt


# this function is setting the authenticaton string we need to provide the oauth server
# this is how the oauth server knows it is getting a valid request from your application
def format_auth_string():
    string = "{}:{}".format(os.environ["OAUTH_CLIENT_ID"], os.environ["OAUTH_CLIENT_SECRET"])
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

    payload = urllib.parse.urlencode({
        'grant_type': "authorization_code",
        'redirect_uri': os.environ["OAUTH_REDIRECT_URI"],
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
