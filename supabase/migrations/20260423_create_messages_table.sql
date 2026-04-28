-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id uuid NOT NULL,
  content text NOT NULL,
  message_type text DEFAULT 'text', -- 'text', 'image', 'document', etc.
  attachment_url text,
  attachment_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own messages"
ON public.messages FOR SELECT
TO authenticated
USING (sender_id = auth.uid() OR receiver_id = auth.uid());

CREATE POLICY "Users can insert their own messages"
ON public.messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can update their own messages"
ON public.messages FOR UPDATE
TO authenticated
USING (sender_id = auth.uid())
WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Users can delete their own messages"
ON public.messages FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

-- Create index for efficient queries
CREATE INDEX IF NOT EXISTS messages_sender_receiver_idx 
ON public.messages(sender_id, receiver_id);

CREATE INDEX IF NOT EXISTS messages_created_at_idx 
ON public.messages(created_at DESC);
