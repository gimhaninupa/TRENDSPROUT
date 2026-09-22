import gradio as gr
from main import app as fastapi_app
from PIL import Image
import io
import base64

def gradio_remove_bg(image):
    if image is None:
        return None
    try:
        from rembg import remove, new_session
        session = new_session("u2netp")
        return remove(image, session=session)
    except Exception as e:
        return image

with gr.Blocks(title="TRENDSPROUT AI Computer Vision Microservice") as demo:
    gr.Markdown("# 🌿 TRENDSPROUT AI Computer Vision Microservice")
    gr.Markdown("REST API and Live Demo for AI Background Removal (U²-Net) and Visual Search.")
    
    with gr.Tab("AI Background Remover"):
        with gr.Row():
            input_img = gr.Image(type="pil", label="Input Fashion Photo")
            output_img = gr.Image(type="pil", label="Isolated Cutout (Transparent)")
        btn = gr.Button("Remove Background", variant="primary")
        btn.click(gradio_remove_bg, inputs=[input_img], outputs=[output_img])

# Mount Gradio interface onto the FastAPI app
app = gr.mount_gradio_app(fastapi_app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
