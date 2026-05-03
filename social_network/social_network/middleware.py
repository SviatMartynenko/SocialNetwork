from django.utils.cache import patch_cache_control

class DisableBFCacheMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        
        if request.user.is_authenticated:
            patch_cache_control(response, no_cache=True, must_revalidate=True, no_store=True)
        return response