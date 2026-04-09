// Referencias a las vistas
const viewLogin = document.getElementById('view-login');
const viewList = document.getElementById('view-list');
const viewDetail = document.getElementById('view-detail');

// Elementos interactivos
const loginForm = document.getElementById('login-form');
const btnLogout = document.getElementById('btn-logout');
const btnBack = document.getElementById('btn-back');
const pokemonGrid = document.getElementById('pokemon-grid');

// Función para cambiar de pantalla
function showView(viewToShow) {
    viewLogin.classList.remove('active');
    viewList.classList.remove('active');
    viewDetail.classList.remove('active');
    
    viewLogin.classList.add('hidden');
    viewList.classList.add('hidden');
    viewDetail.classList.add('hidden');

    viewToShow.classList.remove('hidden');
    viewToShow.classList.add('active');
}

// 1. Simulación de Login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que recargue la página
    showView(viewList);
    loadPokemons();
});

btnLogout.addEventListener('click', () => {
    showView(viewLogin);
});

// 2. Cargar lista de Pokémon (Pantalla 2)
async function loadPokemons() {
    pokemonGrid.innerHTML = '<p>Cargando Pokémon...</p>';
    try {
        // Obtenemos los primeros 50 pokemon
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=50');
        const data = await response.json();
        
        pokemonGrid.innerHTML = ''; // Limpiar mensaje de carga
        
        // Iterar sobre cada resultado y crear su tarjeta
        data.results.forEach((pokemon, index) => {
            const pokemonId = index + 1;
            
            const card = document.createElement('div');
            card.classList.add('poke-card');
            // Usamos el ID para obtener la imagen directamente
            card.innerHTML = `
                <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png" alt="${pokemon.name}">
                <h3>${pokemon.name}</h3>
            `;
            
            // Evento click en la tarjeta
            card.addEventListener('click', () => {
                loadPokemonDetail(pokemon.name, pokemonId);
            });
            
            pokemonGrid.appendChild(card);
        });
    } catch (error) {
        pokemonGrid.innerHTML = '<p>Error al cargar la API.</p>';
        console.error(error);
    }
}

// 3. Cargar detalles del Pokémon (Pantalla 3)
async function loadPokemonDetail(name, id) {
    showView(viewDetail);
    
    // Referencias del DOM para los detalles
    const detailName = document.getElementById('detail-name');
    const detailImg = document.getElementById('detail-image');
    const detailDesc = document.getElementById('detail-description');
    const detailTypes = document.getElementById('detail-types');

    // Estados de carga
    detailName.textContent = name.toUpperCase();
    detailImg.src = '';
    detailDesc.textContent = 'Buscando información en la Pokédex...';
    detailTypes.innerHTML = '';

    try {
        // Hacemos dos peticiones en paralelo: una para los datos base (tipos, imagen en alta resolución) y otra para la especie (descripción de texto)
        const [pokemonRes, speciesRes] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
        ]);

        const pokemonData = await pokemonRes.json();
        const speciesData = await speciesRes.json();

        // 1. Asignar imagen grande (Artwork Oficial)
        detailImg.src = pokemonData.sprites.other['official-artwork'].front_default;

        // 2. Extraer descripción en español
        const textEntry = speciesData.flavor_text_entries.find(entry => entry.language.name === 'es');
        if (textEntry) {
            // Limpiar saltos de línea extraños de la API
            detailDesc.textContent = textEntry.flavor_text.replace(/\f/g, ' ').replace(/\n/g, ' ');
        } else {
            detailDesc.textContent = "Descripción en español no disponible.";
        }

        // 3. Mostrar los tipos
        pokemonData.types.forEach(typeInfo => {
            const span = document.createElement('span');
            span.classList.add('badge');
            span.textContent = typeInfo.type.name;
            detailTypes.appendChild(span);
        });

    } catch (error) {
        detailDesc.textContent = 'Error al cargar los detalles.';
        console.error(error);
    }
}

// Botón de volver a la lista
btnBack.addEventListener('click', () => {
    showView(viewList);
});