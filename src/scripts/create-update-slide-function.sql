-- Create a function to update slides
CREATE OR REPLACE FUNCTION update_slide(
    _id bigint,
    _title text,
    _image_url text,
    _link_url text,
    _overlay_heading text,
    _overlay_description text,
    _button_text text,
    _button_url text
) RETURNS void AS $$
BEGIN
    UPDATE public.slides
    SET 
        title = _title,
        image_url = _image_url,
        link_url = _link_url,
        overlay_heading = _overlay_heading,
        overlay_description = _overlay_description,
        button_text = _button_text,
        button_url = _button_url,
        updated_at = NOW()
    WHERE id = _id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
