import io
import qrcode
from PIL import Image
from django.core.files.base import ContentFile


def generate_qr_image_file(payload_text: str, filename: str = 'qr.png') -> ContentFile:
    """
    Generates a high-resolution, clean QR code image containing the secure token.
    Returns a Django ContentFile ready for saving into a FileField.
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=3,
    )
    qr.add_data(payload_text)
    qr.make(fit=True)

    img = qr.make_image(fill_color="#0F172A", back_color="#FFFFFF")
    
    # Save to memory buffer
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    
    return ContentFile(buffer.getvalue(), name=filename)
