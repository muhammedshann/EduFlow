import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

User = get_user_model()


@database_sync_to_async
def get_user_from_db(user_id):
    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None

class JWTAuthMiddleware(BaseMiddleware):
    async def __call__(self, scope, receive, send):
        scope.setdefault("user", None)

        headers = dict(scope.get("headers", []))
        
        # DEBUG PRINT: Check if headers are arriving
        # print(f"DEBUG: All Headers: {headers.keys()}") 
        
        raw_cookie = headers.get(b"cookie", b"").decode()

        token = None
        for part in raw_cookie.split(";"):
            key, _, value = part.strip().partition("=")
            if key == "access":
                token = value
                break

        if token:
            try:
                # print(f"DEBUG: Found token: {token[:10]}...") 
                payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
                user = await get_user_from_db(payload.get("user_id"))
                if user:
                    scope["user"] = user
                    # print(f"DEBUG: Authenticated user: {user}")
            except jwt.ExpiredSignatureError:
                print("DEBUG: Token Expired")
            except jwt.InvalidTokenError:
                print("DEBUG: Invalid Token")
            except Exception as e:
                print(f"DEBUG: Generic JWT Error: {e}")
        else:
            print("DEBUG: No 'access' cookie found in request.")

        return await super().__call__(scope, receive, send)
