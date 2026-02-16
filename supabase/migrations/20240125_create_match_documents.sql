-- Create a function to search for documents
create or replace function match_documents (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_agent_id uuid
)
returns table (
  id uuid,
  content_text text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    id,
    content_text,
    1 - (embedding_vector <=> query_embedding) as similarity
  from knowledge_base
  where 1 - (embedding_vector <=> query_embedding) > match_threshold
  and agent_id = filter_agent_id
  order by similarity desc
  limit match_count;
end;
$$;
