-- Drop and recreate the view to force PostgREST to refresh its schema
DROP VIEW IF EXISTS public.slides_view;

CREATE VIEW public.slides_view AS
SELECT 
    id,
    created_at,
    title,
    image_url,
    link_url,
    updated_at,
    overlay_heading,
    overlay_description,
    button_text,
    button_url
FROM public.slides;

-- Grant permissions on the view
GRANT SELECT ON public.slides_view TO anon;
GRANT ALL ON public.slides_view TO authenticated;
GRANT ALL ON public.slides_view TO postgres;

-- Create instead-of triggers to handle updates through the view
CREATE OR REPLACE FUNCTION public.slides_view_insert()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.slides (
        title, image_url, link_url,
        overlay_heading, overlay_description,
        button_text, button_url
    ) VALUES (
        NEW.title, NEW.image_url, NEW.link_url,
        NEW.overlay_heading, NEW.overlay_description,
        NEW.button_text, NEW.button_url
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.slides_view_update()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.slides SET
        title = NEW.title,
        image_url = NEW.image_url,
        link_url = NEW.link_url,
        overlay_heading = NEW.overlay_heading,
        overlay_description = NEW.overlay_description,
        button_text = NEW.button_text,
        button_url = NEW.button_url,
        updated_at = now()
    WHERE id = OLD.id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.slides_view_delete()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM public.slides WHERE id = OLD.id;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS slides_view_insert_trigger ON public.slides_view;
DROP TRIGGER IF EXISTS slides_view_update_trigger ON public.slides_view;
DROP TRIGGER IF EXISTS slides_view_delete_trigger ON public.slides_view;

CREATE TRIGGER slides_view_insert_trigger
    INSTEAD OF INSERT ON public.slides_view
    FOR EACH ROW
    EXECUTE FUNCTION public.slides_view_insert();

CREATE TRIGGER slides_view_update_trigger
    INSTEAD OF UPDATE ON public.slides_view
    FOR EACH ROW
    EXECUTE FUNCTION public.slides_view_update();

CREATE TRIGGER slides_view_delete_trigger
    INSTEAD OF DELETE ON public.slides_view
    FOR EACH ROW
    EXECUTE FUNCTION public.slides_view_delete();

-- Force PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
SELECT pg_notify('pgrst', 'reload schema');
