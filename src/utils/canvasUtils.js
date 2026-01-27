export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); 
    image.src = url;
  });

export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  // Configurar el canvas al tamaño del recorte
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Dibujar la imagen recortada en el canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convertir a Base64 (que es lo que necesita tu Google Script)
  return new Promise((resolve) => {
    // Calidad 0.9 para que no pese tanto
    const base64 = canvas.toDataURL('image/jpeg', 0.9);
    resolve(base64);
  });
}