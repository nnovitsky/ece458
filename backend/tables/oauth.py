import requests
import os
import json
import urllib
import base64
import jwt  # note that this is actualy pyjwt NOT the jwt library but they use the same import
from termcolor import colored, cprint


# this function is setting the authenticaton string we need to provide the oauth server
# this is how the oauth server knows it is getting a valid request from your application
def format_auth_string():
    string = "{}:{}".format(os.environ["OAUTH_CLIENT_ID"], os.environ["OAUTH_CLIENT_SECRET"])
    data = base64.b64encode(string.encode())
    return data.decode("utf-8")


# generate the login url, and provide user with the url so that they may login with the
# provider, and retreive an authentication code.
def print_auth_code_request():
    if "OAUTH_BASE_URL" in os.environ:
        base_url = os.environ["OAUTH_BASE_URL"]
    else:
        base_url = "https://oauth.oit.duke.edu/oidc/authorize"

    request_url = "{}?client_id={}&redirect_uri={}&response_type=code".format(
        base_url,
        os.environ["OAUTH_CLIENT_ID"],
        urllib.parse.quote(os.environ["OAUTH_REDIRECT_URI"])
    )

    print("Copy and paste this url into your web browser.")
    cprint(request_url, "cyan")
    text = colored('"code"', 'green')
    code = colored('m781z2', 'green')

    print("Once you are redirected, copy the value of the {} parameter in the url.".format(text))
    print("For example: https://www.google.com/?code={}".format(code))


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
    print("Here is your auth token: ")
    print(json.loads(response.text))
    return json.loads(response.text)


# Now that we have the Auth Token from the OAuth provider
# let's parse it into a dictonary so python can work with it
def parse_id_token(response):
    id_token = jwt.decode(response["id_token"], verify=False)
    print(id_token)
    return {"access_token": response["access_token"], "id_token": id_token}


def main():
    print("\n\n")
    cprint("### STEP 1: Get Auth Code ###", "magenta")
    print_auth_code_request()
    print("\n\n")

    cprint("### STEP 2: Provide Auth Code ###", "magenta")
    auth_code = input("paste oauth code: ")
    print("\n\n")

    cprint("### STEP 3: Exchange Auth Code for the Auth Token ###", "magenta")
    response_token = get_token(auth_code)
    print("\n\n")

    cprint("### STEP 4: Parse Auth Token(JWT) ###", "magenta")
    parse_id_token(response_token)


main()
