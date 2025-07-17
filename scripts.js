document.addEventListener('DOMContentLoaded', () => {
    const jsonPath = '../cursos.json'; // Ruta a tu archivo JSON

    // --- Lógica para las páginas de lista de categorías (especialidades.html, cursos.html, etc.) ---
    const listaCursosCategoria = document.getElementById('lista-cursos-categoria');
    const categoryTitleElement = document.getElementById('category-title'); // Elemento para el título
    const categoryImageElement = document.getElementById('category-image'); // Elemento para la imagen de categoría

    if (listaCursosCategoria && categoryTitleElement) { // Verificamos si estamos en una página de categoría
        // Obtener el nombre del archivo HTML actual para determinar la categoría
        const pathParts = window.location.pathname.split('/');
        const currentPageName = pathParts[pathParts.length - 1].split('.')[0]; 
        
        // Mapeo de nombres de archivo a claves del JSON y títulos amigables
        const categoryConfig = {
            'especialidades': { key: 'especialidad', title: 'Nuestras Especialidades', image: 'img/img-especialidades.jpg' },
            'cursos': { key: 'cursos', title: 'Nuestros Cursos', image: 'img/img-cursos.jpg' },
            'diplomados': { key: 'diplomados', title: 'Nuestros Diplomados', image: 'img/img-diplomados.jpg' },
            'titulos': { key: 'titulos', title: 'Nuestros Títulos', image: 'img/img-titulos.jpg' }
        };

        const currentCategory = categoryConfig[currentPageName];

        if (currentCategory) {
            categoryTitleElement.textContent = currentCategory.title; // Actualiza el título
            if (categoryImageElement) {
                categoryImageElement.src = currentCategory.image; // Actualiza la imagen
                categoryImageElement.alt = `Imagen de ${currentCategory.title}`;
            }

            fetch(jsonPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    const cursosDeLaCategoria = data[currentCategory.key];
                    if (cursosDeLaCategoria && cursosDeLaCategoria.length > 0) {
                        listaCursosCategoria.innerHTML = ''; // Limpiar el contenido existente
                        cursosDeLaCategoria.forEach(curso => {
                            const li = document.createElement('li');
                            const a = document.createElement('a');
                            a.className = 'product-link';
                            // Pasamos la categoría y el ID para que curso.html sepa qué buscar
                            a.href = `../curso.html?categoria=${currentCategory.key}&id=${curso.id}`; 
                            
                            const spanIcon = document.createElement('span');
                            spanIcon.className = 'circle-icon';
                            spanIcon.textContent = '🎓'; 
                            
                            a.appendChild(spanIcon);
                            a.appendChild(document.createTextNode(` ${curso.nombre}`)); 
                            
                            li.appendChild(a);
                            listaCursosCategoria.appendChild(li);
                        });
                    } else {
                        listaCursosCategoria.innerHTML = `<li>No hay ${currentCategory.title.toLowerCase()} disponibles por ahora.</li>`;
                    }
                })
                .catch(error => {
                    console.error('Error al cargar los cursos:', error);
                    listaCursosCategoria.innerHTML = `<li>Error al cargar los ${currentCategory.title.toLowerCase()}. Por favor, inténtalo de nuevo más tarde.</li>`;
                });
        }
    }

    // --- Lógica para la página de detalle de un curso (curso.html) ---
    const productoImagenContainer = document.getElementById('producto-imagen-container');
    const productoInfo = document.getElementById('producto-info');

    if (productoImagenContainer && productoInfo) { // Verificamos si estamos en curso.html
        const urlParams = new URLSearchParams(window.location.search);
        const cursoId = urlParams.get('id');
        const cursoCategoria = urlParams.get('categoria'); 
        
        if (cursoId && cursoCategoria) {
            fetch(jsonPath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    return response.json();
                })
                .then(data => {
                    // Busca el curso en la categoría correcta
                    const cursosEnCategoria = data[cursoCategoria];
                    const curso = cursosEnCategoria ? cursosEnCategoria.find(c => c.id === cursoId) : null;

                    if (curso) {
                        // Cargar imagen
                        productoImagenContainer.innerHTML = `
                            <img src="${curso.imagenPrincipal}" alt="${curso.nombre}" class="img-fluid rounded shadow">
                        `;

                         // Construir el mensaje de WhatsApp dinámicamente
                        const numeroWhatsapp = "56976603721"; // Tu número sin + ni espacios
                        // Codifica el mensaje para la URL. encodeURIComponent es crucial.
                        const mensajeWhatsapp = encodeURIComponent(`Hola, quiero más información del curso ${curso.nombre}.`);
                        
                        // Si linkCompra en tu JSON está vacío o es '#', usaremos este enlace de WhatsApp.
                        // Si tuviera un enlace de compra real, podrías priorizarlo.
                        const linkCompraFinal = curso.linkCompra && curso.linkCompra !== '#' 
                                                 ? curso.linkCompra 
                                                 : `https://wa.me/${numeroWhatsapp}?text=${mensajeWhatsapp}`;

                        // Cargar información
                        productoInfo.innerHTML = `
                            <h2>${curso.nombre}</h2>
                            <p class="lead">${curso.descripcion}</p>
                            <h3 class="text-primary">${curso.precio}</h3>
                            <a href="${linkCompraFinal}" class="whatsapp-btn btn-lg mt-3" target="_blank">Consultar por WhatsApp</a>
                            <a href="../public/${cursoCategoria}.html" class="btn btn-secondary btn-lg mt-3 ms-2">Volver a ${cursoCategoria.charAt(0).toUpperCase() + cursoCategoria.slice(1)}</a>
                        `;
                    } else {
                        productoInfo.innerHTML = '<p class="text-danger">Curso no encontrado.</p>';
                        productoImagenContainer.innerHTML = '';
                    }
                })
                .catch(error => {
                    console.error('Error al cargar el detalle del curso:', error);
                    productoInfo.innerHTML = '<p class="text-danger">Error al cargar el detalle del curso. Por favor, inténtalo de nuevo más tarde.</p>';
                });
        } else {
            productoInfo.innerHTML = '<p class="text-danger">ID de curso o categoría no especificados.</p>';
        }
    }
});