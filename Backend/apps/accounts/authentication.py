from rest_framework_simplejwt.authentication import JWTAuthentication

class CookieJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try Authorization header first (optional)
        header = self.get_header(request)
        if header is not None:
            return super().authenticate(request)

        # Then try cookie
        raw_token = request.COOKIES.get('access')  # <--- read from cookie
        if raw_token is None:
            return None

        validated_token = self.get_validated_token(raw_token)
        return self.get_user(validated_token), validated_token
