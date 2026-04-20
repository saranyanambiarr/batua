from pydantic import BaseModel

# complying with Oauth2 standard by returning the access token and token type which Token schema requires
'''class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"'''
# with current architecture, backend is setting the cookies so this file is not required anymore