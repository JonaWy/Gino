-- Storage buckets for Gino app
INSERT INTO storage.buckets (id, name, public)
VALUES ('horse-images', 'horse-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- RLS for horse-images
CREATE POLICY "Users upload own horse images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'horse-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Public read horse images"
ON storage.objects FOR SELECT
USING (bucket_id = 'horse-images');

CREATE POLICY "Users update own horse images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'horse-images'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- RLS for documents
CREATE POLICY "Users manage own documents"
ON storage.objects FOR ALL
USING (
  bucket_id = 'documents'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
