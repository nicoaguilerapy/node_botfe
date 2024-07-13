require('dotenv').config();
const axios = require('axios');
const { sendMessageFor } = require('simple-telegram-message')

const url = process.env.API_URL;

// Función para hacer el request y procesar la respuesta
async function hacerRequest() {
    console.log('El agente está en ejecución y hará un request cada minuto.');
    try {
        const response = await axios.get(url);
        const datos = response.data;

        // Procesar cada sucursal
        datos.forEach(sucursal => {
            if (sucursal.notificar === 1) {
                const ultimaConexion = sucursal.ultimaconexion;
                calcularColorYDiferencia(ultimaConexion, sucursal);
            }
        });
    } catch (error) {
        console.error('Error al hacer el request:', error);
    }
}

async function calcularColorYDiferencia(ultimaConexion, sucursal) {
    const fechaActual = new Date();
    const fechaConexion = new Date(ultimaConexion);
    const diferenciaEnMilisegundos = fechaActual - fechaConexion;
    const diferenciaEnMinutos = Math.floor(diferenciaEnMilisegundos / 60000);
    if (diferenciaEnMinutos > 60) {
        let mensaje = `${sucursal.empresa_nombre}\nSucursal: ${sucursal.sucursal_nombre}\nDiferencia en minutos: ${diferenciaEnMinutos}`;
        console.log(mensaje);
        try {
            const userIds = process.env.USERS_IDS.split(",");
            const sendMessage = sendMessageFor(process.env.TOKEN);

            for (const userId of userIds) {
                await sendMessage(userId, mensaje);
            }
        } catch (error) {
            console.error(`Error al enviar el mensaje al usuario ${userId}:`, error.message);
        }
    }
}

async function init() {
    const userIds = process.env.USERS_IDS.split(",");
    const sendMessageInit = sendMessageFor(process.env.TOKEN);

    for (const userId of userIds) {
        console.log(userId);
        try {
            await sendMessageInit(userId, "EL BOTFE INICIADO PARA NOTIFICAR");
        } catch (error) {
            console.error(`Error al enviar el mensaje al usuario ${userId}:`, error.message);
        }
    }


}

// Ejecuta la función cada minuto
setInterval(hacerRequest, 60000);
init();
console.log('El agente está en ejecución y hará un request cada minuto.');
