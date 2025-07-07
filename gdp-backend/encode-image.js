const fs = require('fs');

// Chemin vers l'image que vous souhaitez encoder en Base64
const imagePath = './uploads/photos/logo.png'; // Mettez ici le chemin exact de votre image
try {
  const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
  console.log('Base64 Encoded Image: ', `data:image/png;base64,${imageBase64}`);
} catch (error) {
  console.error('Erreur lors de la lecture de l\'image :', error.message);
}
