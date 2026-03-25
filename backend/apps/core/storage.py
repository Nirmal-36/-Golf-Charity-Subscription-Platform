from django.conf import settings
from supabase import create_client, Client

class SupabaseStorage:
    def __init__(self):
        self.url: str = settings.SUPABASE_URL
        self.key: str = settings.SUPABASE_SERVICE_KEY
        self.client: Client = create_client(self.url, self.key)

    def upload_file(self, bucket: str, path: str, file_data: bytes):
        """
        Uploads a file to a specific Supabase bucket and returns the public URL.
        """
        try:
            # Check if bucket exists, or just try to upload
            # Overwrite if exists for simpler logic in this MVP
            response = self.client.storage.from_(bucket).upload(
                path=path,
                file=file_data,
                file_options={"upsert": "true"}
            )
            
            # Get public URL
            public_url = self.client.storage.from_(bucket).get_public_url(path)
            return public_url
        except Exception as e:
            print(f"Supabase Upload Error: {str(e)}")
            return None

storage_client = SupabaseStorage()
