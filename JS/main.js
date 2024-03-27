let patrones = [
    ['1-1', '1-2', '1-3'],
    ['2-1', '2-2', '2-3'],
    ['3-1', '3-2', '3-3'],

    ['1-1', '2-1', '3-1'],
    ['1-2', '2-2', '3-2'],
    ['1-3', '2-3', '3-3'],

    ['1-1', '2-2', '3-3'],
    ['1-3', '2-2', '3-1'],

];

function verificarGanador() {
    let todasCeldasUsadas = true;

    for (let i = 0; i < patrones.length; i++) {
        const [a, b, c] = patrones[i];
        const celdaA = document.getElementById(a).getAttribute('used');
        const celdaB = document.getElementById(b).getAttribute('used');
        const celdaC = document.getElementById(c).getAttribute('used');

        if (celdaA && celdaA === celdaB && celdaA === celdaC) {
            Swal.fire({
                title: `Ganador: ${(celdaA === 'x') ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-circle"></i>'}`,
                icon: 'success'
            }).then((confirm) => {
                if (confirm.isConfirmed) {
                    setTimeout(LimpiarCampos, 1000);
                } else {
                    setTimeout(LimpiarCampos, 1000);
                }
            });
            document.getElementById('start').textContent = 'Otra Vez';

            return;
        }


        if (!celdaA || !celdaB || !celdaC) {
            todasCeldasUsadas = false;
        }
    }

    if (todasCeldasUsadas) {
        Swal.fire({
            title: 'Empate',
            icon: 'info'
        });
        document.getElementById('start').textContent = 'Otra Vez';
    }
}

function verificarResultado(pcSymbol) {
    for (let i = 0; i < patrones.length; i++) {
        const [a, b, c] = patrones[i];
        const celdaA = document.getElementById(a).getAttribute('used');
        const celdaB = document.getElementById(b).getAttribute('used');
        const celdaC = document.getElementById(c).getAttribute('used');

        if (celdaA && celdaA === celdaB && celdaA === celdaC) {
            return celdaA === pcSymbol ? 10 : -10;
        }
    }

    if ([...document.querySelectorAll('td')].every(celda => celda.hasAttribute('used'))) {
        return 0; // Empate
    }

    return null; // No hay un resultado final todavía
}

function LimpiarCampos(){

    document.querySelectorAll('td').forEach(function(celda) {
        celda.removeAttribute('used')
        celda.textContent = ''
    })
}

document.addEventListener("DOMContentLoaded", function() {

    document.getElementById('start').addEventListener("click", function() {

        LimpiarCampos();

        Swal.fire({
            title: 'Selecciona el modo de juego',
            showDenyButton: true,
            confirmButtonText: 'Solo',
            denyButtonText: 'Dos Jugadores',
        }).then((result) => {
            if (result.isConfirmed) {
                // modo solo
                Swal.fire({
                    title: 'Elige tu símbolo',
                    showDenyButton: true,
                    confirmButtonText: '<i class="bi bi-circle"></i>',
                    denyButtonText: '<i class="bi bi-x-lg"></i>',
                    allowOutsideClick: false,
                    allowEscapeKey: false,
                    html: '<p>¿Quieres ser círculos o cruces?</p>',

                }).then((symbolChoice) => {
                    if (symbolChoice.isConfirmed) {
                        iniciarJuegoSolo('circle');
                    } else {
                        iniciarJuegoSolo('x');
                    }
                });
            } else if (result.isDenied) {
                // modo duo
                iniciarJuegoDuos()
            }
        });
    });
});

function movimientoPC(pcSymbol, playerSymbol) {
    let mejorPuntaje = -Infinity;
    let mejorMovimiento;

    document.querySelectorAll('td').forEach(celda => {
        if (!celda.hasAttribute('used')) {
            celda.setAttribute('used', pcSymbol);
            let puntaje = minimax(pcSymbol, playerSymbol, false);
            celda.removeAttribute('used');

            if (puntaje > mejorPuntaje) {
                mejorPuntaje = puntaje;
                mejorMovimiento = celda;
            }
        }
    });

    if (mejorMovimiento) {
        mejorMovimiento.setAttribute('used', pcSymbol);
        mejorMovimiento.innerHTML = pcSymbol === 'x' ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-circle"></i>';
        verificarGanador(pcSymbol);
    }
}

function minimax(pcSymbol, playerSymbol, esTurnoPC) {
    if (verificarResultado()) {
        return esTurnoPC ? -10 : 10; // Ajusta los valores según quién gana
    }

    if (esEmpate()) {
        return 0;
    }

    let mejorPuntaje = esTurnoPC ? -Infinity : Infinity;

    document.querySelectorAll('td').forEach(celda => {
        if (!celda.hasAttribute('used')) {
            celda.setAttribute('used', esTurnoPC ? pcSymbol : playerSymbol);
            let puntaje = minimax(pcSymbol, playerSymbol, !esTurnoPC);
            celda.removeAttribute('used');
            mejorPuntaje = esTurnoPC ? Math.max(puntaje, mejorPuntaje) : Math.min(puntaje, mejorPuntaje);
        }
    });

    return mejorPuntaje;
}

function esEmpate() {
    return [...document.querySelectorAll('td')].every(celda => celda.hasAttribute('used'));
}


function iniciarJuegoSolo(playerSymbol) {
    LimpiarCampos();
    let start;
    let pcSymbol = playerSymbol === 'circle' ? 'x' : 'circle';

    // Decidir aleatoriamente quién inicia
    if (Math.floor(Math.random() * 2) === 0) {
        start = playerSymbol;
        Swal.fire({
            title: `Tú empiezas. Eres ${playerSymbol === 'x' ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-circle"></i>'}`
        });
    } else {
        start = pcSymbol;
        Swal.fire({
            title: `La PC empieza. Es ${pcSymbol === 'x' ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-circle"></i>'}`
        }).then(() => {
            movimientoPC(pcSymbol, playerSymbol);
            start = playerSymbol;
        });
    }

    let celdas = document.querySelectorAll('td');
    celdas.forEach(function(celda) {
        celda.removeEventListener('click', celdaClickHandler);
        celda.addEventListener('click', celdaClickHandler);
    });

    function celdaClickHandler() {
        if (!this.hasAttribute('used') && start === playerSymbol) {
            this.innerHTML = playerSymbol === 'x' ? '<i class="bi bi-x-lg"></i>' : '<i class="bi bi-circle"></i>';
            this.setAttribute('used', playerSymbol);
            verificarGanador();
            start = pcSymbol; // Cambia el turno a la PC
            if (!verificarGanador()) {
                movimientoPC(pcSymbol, playerSymbol);
                start = playerSymbol;
            }
        }
    }
}

function iniciarJuegoDuos(){
    var celdas = document.querySelectorAll('td');

    LimpiarCampos()

    this.textContent = 'Reiniciar'


    let start = Math.floor(Math.random() * 2)

    if(start === 1){
        Swal.fire({
            title: "<i class=\"bi bi-circle\"></i> Starts"
        });
        start = 'circle'
    }
    else if(start === 0){
        Swal.fire({
            title: "<i class=\"bi bi-x-lg\"></i> Starts"
        });
        start = 'x'
    }


    celdas.forEach(function(celda) {
        celda.addEventListener('click', function() {
            // Verifica primero si la celda ya fue usada
            if (!celda.hasAttribute('used')) {
                if (start === 'circle') {
                    celda.innerHTML = '<i class="bi bi-circle"></i>';
                    celda.setAttribute('used', "circle");
                    start = 'x';
                } else if (start === 'x') {
                    celda.innerHTML = '<i class="bi bi-x-lg"></i>';
                    celda.setAttribute('used', "x");
                    start = 'circle';
                }
                verificarGanador();
            }

        });
    });
}

